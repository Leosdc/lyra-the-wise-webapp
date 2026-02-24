/**
 * Stage Combat Sub-Module
 * Handles combat initiation, tracker display, monster selection, and chapter conclusion.
 */

import { logger } from "../../logger.js";
import { escapeHTML } from "../utils.js";
import { db } from "../../auth.js";
import {
    doc, getDoc, updateDoc, serverTimestamp, collection, addDoc
} from "firebase/firestore";
import CombatEngine from "../combat-engine.js";
import CombatUI from "../combat-ui.js";
import * as DataModule from "../../data.js";

const COLLECTIONS = {
    SESSIONS: "sessoes",
    MESSAGES: "session_messages"
};

/**
 * Returns combat-related methods to be mixed into StageModule.
 */
export function createCombatMixin(ctx) {
    return {
        async startCombat() {
            if (!ctx.isGM) return;

            try {
                logger.info("⚔️ GM Action: Iniciar Combate");

                const combatContainer = document.getElementById('sidebar-combat-list');
                if (combatContainer) {
                    combatContainer.innerHTML = `
                        <div class="combat-loading">
                            <i class="fas fa-swords fa-spin"></i>
                            <p>Invocando as Leis da Guerra...<br><small>Preparando o campo de batalha.</small></p>
                        </div>
                    `;
                    document.getElementById('sidebar-combat-round').textContent = "-";
                    document.getElementById('combat-turn-status').textContent = "Iniciando...";
                    ctx.renderSidebarActions();
                }

                CombatEngine.sessionId = ctx.sessionId;
                CombatEngine.sessionData = ctx.activeSession;

                const monsters = ctx.activeSession.linked_monsters || [];
                if (monsters.length === 0) {
                    logger.warn("⚠️ Nenhum adversário pronto. Abrindo a Forja...");
                    if (window.CombatPrep) {
                        window.CombatPrep.openPrepModal('combat');
                    }
                    return;
                }

                const combatState = await CombatEngine.initCombat(ctx.sessionId, ctx.activeSession);
                CombatUI.renderCombatPanel(combatState);

                ctx.showMysticAlert('<i class="fas fa-swords"></i> Combate iniciado! Os jogadores podem agora selecionar suas ações.');
            } catch (err) {
                logger.error("Erro ao iniciar combate:", err);
                ctx.showMysticAlert("Erro ao iniciar combate: " + err.message);
            }
        },

        displayCombatTracker(turnOrder) {
            const container = document.getElementById('contextual-actions');
            if (!container) return;

            let html = `
                <div class="combat-tracker">
                    <h3 class="combat-title"><i class="fas fa-swords"></i> Ordem de Iniciativa</h3>
                    <div class="combat-list">
            `;

            turnOrder.forEach((participant, index) => {
                const isActive = index === 0;
                const icon = participant.type === 'player' ? 'user-shield' : 'skull';
                html += `
                    <div class="combat-participant ${isActive ? 'active-turn' : ''}" data-index="${index}">
                        <span class="participant-icon">${icon}</span>
                        <div class="participant-info">
                            <span class="participant-name">${participant.name}</span>
                            <span class="participant-stats">HP: ${participant.hp}/${participant.maxHp} | CA: ${participant.ac}</span>
                        </div>
                        <span class="participant-initiative">${participant.initiative}</span>
                    </div>
                `;
            });

            html += `
                    </div>
                    <div class="combat-actions">
                        <button class="medieval-btn small" onclick="StageModule.nextCombatTurn()">
                            Próximo Turno
                        </button>
                        <button class="medieval-btn small secondary" onclick="StageModule.endCombat()">
                            Encerrar Combate
                        </button>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

        async nextCombatTurn() {
            if (!ctx.isGM) return;
            const { default: CombatModule } = await import('../combat.js');
            CombatModule.sessionId = ctx.sessionId;

            const sessionRef = doc(db, "sessoes", ctx.sessionId);
            const sessionSnap = await getDoc(sessionRef);
            if (sessionSnap.exists()) {
                const data = sessionSnap.data();
                CombatModule.turnOrder = data.combatTurnOrder || [];
                CombatModule.currentTurnIndex = data.currentTurnIndex || 0;
                CombatModule.round = data.combatRound || 1;
                CombatModule.combatActive = data.combatActive || false;
            }

            await CombatModule.nextTurn();
            ctx.displayCombatTracker(CombatModule.turnOrder);
        },

        async endCombat() {
            if (!ctx.isGM) return;
            const confirmed = await ctx.showMysticConfirm("Encerrar o combate? Isso removerá os adversários atuais para que a próxima luta comece do zero.", "Fim de Batalha");
            if (confirmed) {
                const { default: CombatModule } = await import('../combat.js');
                CombatModule.sessionId = ctx.sessionId;
                await CombatModule.endCombat();

                const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.sessionId);
                await updateDoc(sessionRef, {
                    linked_monsters: [],
                    updatedAt: serverTimestamp()
                });

                ctx.renderSidebarActions();
            }
        },

        async addMonstersToCombat(monsters) {
            const combatants = monsters.map(m => ({
                ...m,
                combatId: Date.now() + Math.random().toString(36).substr(2, 9),
                currentHp: m.hp || 10,
                maxHp: m.hp || 10,
                initiative: Math.floor(Math.random() * 20) + (m.attributes?.DES ? Math.floor((m.attributes.DES - 10) / 2) : 0)
            }));

            const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.sessionId);
            const currentMonsters = ctx.activeSession.monsters || [];
            const newMonsterList = [...currentMonsters, ...combatants];

            await updateDoc(sessionRef, {
                monsters: newMonsterList,
                combatActive: true,
                updatedAt: serverTimestamp()
            });

            function auditMonsters(list) {
                const names = list.map(m => m.name).join(', ');
                return `O Mestre invocou: ${names}`;
            }

            ctx.addSystemMessage(`<i class="fas fa-swords"></i> **Combate Iniciado!** ${auditMonsters(monsters)}`);
        },

        showMonsterSelector() {
            return new Promise(async (resolve, reject) => {
                const systemId = ctx.activeSession?.systemId || 'dnd5e';
                const user = ctx.user;

                let systemMonsters = [];
                let userMonsters = [];

                try {
                    const [sys, usr] = await Promise.all([
                        DataModule.getGlobalMonsters(systemId),
                        user ? DataModule.getUserMonsters(user.uid, user.email) : []
                    ]);
                    systemMonsters = sys;
                    userMonsters = usr;
                } catch (e) {
                    logger.error("Erro ao carregar monstros:", e);
                    alert("O grimório está inacessível no momento.");
                    reject();
                    return;
                }

                const modal = document.createElement('div');
                modal.className = 'modal-stage';
                modal.innerHTML = `
                    <div class="modal-stage-content monster-selector-modal" style="max-width: 800px; height: 80vh; display: flex; flex-direction: column;">
                        <h3 style="flex-shrink: 0;"><i class="fas fa-dragon"></i> Invocação de Criaturas</h3>
                        
                        <div class="selector-controls" style="flex-shrink: 0; padding: 10px; border-bottom: 1px solid #333; display: flex; gap: 10px;">
                             <input type="text" id="monster-search" placeholder="Buscar criatura..." class="medieval-input" style="flex: 1;">
                             <button class="medieval-btn small" id="btn-ask-oracle"><i class="fas fa-eye"></i> Oráculo</button>
                        </div>

                        <div class="roll-tabs" style="flex-shrink: 0; margin-top: 10px;">
                            <button class="roll-tab active" data-tab="system-monsters">Sistema</button>
                            <button class="roll-tab" data-tab="my-monsters">Meus Monstros</button>
                        </div>

                        <div class="monster-list-container" style="flex: 1; overflow-y: auto; padding: 10px;">
                            <div id="list-system-monsters" class="monster-list active"></div>
                            <div id="list-my-monsters" class="monster-list"></div>
                        </div>

                        <div class="selected-monsters-bar" style="flex-shrink: 0; padding: 10px; border-top: 1px solid #333; min-height: 50px; display: flex; gap: 5px; flex-wrap: wrap;">
                            <span style="color: #888; font-size: 0.8rem; width: 100%;">Selecionados:</span>
                            <div id="selected-list" style="display: flex; gap: 5px; flex-wrap: wrap; width: 100%;"></div>
                        </div>

                        <div class="modal-actions" style="flex-shrink: 0; justify-content: flex-end; padding-top: 10px;">
                            <button class="medieval-btn" id="confirm-summon">Invocação</button>
                            <button class="medieval-btn secondary" id="cancel-summon">Cancelar</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                let selected = [];

                const renderList = (items, containerId) => {
                    const container = modal.querySelector('#' + containerId);
                    container.innerHTML = items.map(m => `
                        <div class="monster-row" data-id="${m.id}">
                            <span class="monster-name">${m.name}</span>
                            <span class="monster-cr">ND ${m.cr || m.secoes?.ND || '-'}</span>
                            <button class="add-btn"><i class="fas fa-plus"></i></button>
                        </div>
                    `).join('');

                    container.querySelectorAll('.add-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const row = e.target.closest('.monster-row');
                            const id = row.dataset.id;
                            const monster = items.find(m => m.id === id);
                            addSelection(monster);
                        });
                    });
                };

                const addSelection = (monster) => {
                    selected.push(monster);
                    renderSelected();
                };

                const removeSelection = (index) => {
                    selected.splice(index, 1);
                    renderSelected();
                };

                const renderSelected = () => {
                    const container = modal.querySelector('#selected-list');
                    container.innerHTML = selected.map((m, idx) => `
                        <div class="selected-token" onclick="this.remove()" data-idx="${idx}">
                            ${m.name} <i class="fas fa-times"></i>
                        </div>
                    `).join('');

                    container.querySelectorAll('.selected-token').forEach(token => {
                        token.addEventListener('click', () => removeSelection(token.dataset.idx));
                    });
                };

                renderList(systemMonsters, 'list-system-monsters');
                renderList(userMonsters, 'list-my-monsters');

                // Tabs
                modal.querySelectorAll('.roll-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        modal.querySelectorAll('.roll-tab').forEach(t => t.classList.remove('active'));
                        modal.querySelectorAll('.monster-list').forEach(l => l.classList.remove('active'));

                        tab.classList.add('active');
                        const target = modal.querySelector('#list-' + tab.dataset.tab);
                        target.classList.add('active');

                        modal.querySelectorAll('.monster-list').forEach(l => l.style.display = 'none');
                        target.style.display = 'block';
                    });
                });
                modal.querySelector('#list-system-monsters').style.display = 'block';
                modal.querySelector('#list-my-monsters').style.display = 'none';

                // Filter
                modal.querySelector('#monster-search').addEventListener('input', (e) => {
                    const term = e.target.value.toLowerCase();
                    const filteredSys = systemMonsters.filter(m => m.name.toLowerCase().includes(term));
                    const filteredUser = userMonsters.filter(m => m.name.toLowerCase().includes(term));
                    renderList(filteredSys, 'list-system-monsters');
                    renderList(filteredUser, 'list-my-monsters');
                });

                // Oracle
                const oracleBtn = modal.querySelector('#btn-ask-oracle');
                if (oracleBtn) {
                    oracleBtn.addEventListener('click', async () => {
                        const promptText = prompt("Descreva o cenário para o Oráculo sugerir criaturas:");
                        if (!promptText) return;
                        alert("O Oráculo sussurra: 'Ainda estou aprendendo a ver além do véu...' (Em breve!)");
                    });
                }

                // Confirm/Cancel
                modal.querySelector('#confirm-summon').addEventListener('click', () => {
                    document.body.removeChild(modal);
                    resolve(selected);
                });

                modal.querySelector('#cancel-summon').addEventListener('click', () => {
                    document.body.removeChild(modal);
                    reject();
                });
            });
        },

        async concludeChapter() {
            const confirmed = await ctx.showMysticConfirm(
                "Você está prestes a concluir as páginas deste capítulo. O estado atual será salvo e os heróis descansarão.",
                "Concluir Capítulo"
            );

            if (confirmed) {
                ctx.toggleLoading(true, "Registrando nos anais do tempo...");
                try {
                    const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.sessionId);
                    const currentChapterIdx = ctx.currentChapterIdx || 0;

                    let updates = {
                        updatedAt: serverTimestamp()
                    };

                    if (ctx.activeSession.fullTimeline) {
                        const newTimeline = [...ctx.activeSession.fullTimeline];
                        if (newTimeline[currentChapterIdx]) {
                            newTimeline[currentChapterIdx].status = 'completed';
                            newTimeline[currentChapterIdx].concludedAt = new Date().toISOString();
                            newTimeline[currentChapterIdx].id = newTimeline[currentChapterIdx].id || `ch_${Date.now()}`;
                        }
                        updates.fullTimeline = newTimeline;
                    }

                    updates.sessionStatus = 'concluded';
                    updates.combatActive = false;
                    updates.combatState = null;
                    updates.linked_monsters = [];

                    await updateDoc(sessionRef, updates);
                    ctx.showMysticAlert("Capítulo concluído com sucesso. O destino está guardado.", "Jornada Registrada");

                    setTimeout(() => window.close(), 3000);
                } catch (err) {
                    logger.error("Erro ao concluir capítulo:", err);
                    ctx.showMysticAlert("Falha ao registrar conclusão: " + err.message);
                } finally {
                    ctx.toggleLoading(false);
                }
            }
        },

        async aiSummary() {
            if (!ctx.isGM) return;

            if (ctx.activeSession.mode !== 'oracle') {
                ctx.showMysticAlert("Esta sessão está em modo manual.");
                return;
            }

            try {
                ctx.addSystemMessage('<i class="fas fa-scroll-old"></i> O Oráculo está compilando os ecos desta jornada...');
                const { default: OracleModule } = await import('../oracle.js');
                OracleModule.sessionId = ctx.sessionId;
                OracleModule.sessionData = ctx.activeSession;
                await OracleModule.generateSummary();
            } catch (err) {
                logger.error("Falha ao gerar resumo:", err);
                ctx.showMysticAlert("O Oráculo falhou: " + err.message);
            }
        }
    };
}
