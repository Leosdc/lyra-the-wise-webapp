/**
 * Stage Actions Sub-Module
 * Handles sidebar actions, player actions, master panel, access requests, UI helpers.
 */

import { logger } from "../../logger.js";
import { escapeHTML } from "../utils.js";
import { db } from "../../auth.js";
import {
    doc, updateDoc, serverTimestamp
} from "firebase/firestore";
import { AccessRequestsModule } from "../access-requests.js";

const COLLECTIONS = {
    SESSIONS: "sessoes",
    MESSAGES: "session_messages"
};

/**
 * Returns action/UI-related methods to be mixed into StageModule.
 */
export function createActionsMixin(ctx) {
    return {
        renderSidebarActions() {
            const container = document.getElementById('contextual-actions');
            const title = document.getElementById('sidebar-role-title');
            if (!container || !ctx.activeSession) return;

            const sessionMode = ctx.activeSession.mode || 'manual';
            const isOracleMode = sessionMode === 'oracle';
            const isCombatActive = ctx.activeSession.combatActive;
            const showGMCommands = ctx.isGM && !isCombatActive;

            const btnEnd = document.getElementById('btn-end-session');
            if (btnEnd) {
                btnEnd.style.display = ctx.isGM ? 'flex' : 'none';
            }

            if (isCombatActive) {
                document.getElementById('actions-sidebar')?.classList.remove('hidden');
                document.getElementById('narrative-actions-container')?.classList.add('hidden');
                document.getElementById('combat-actions-container')?.classList.remove('hidden');
                container.innerHTML = "";
                title.textContent = "Ações do Herói";
                return;
            }

            document.getElementById('narrative-actions-container')?.classList.remove('hidden');
            document.getElementById('combat-actions-container')?.classList.add('hidden');

            if (isOracleMode && !ctx.isGM) {
                document.getElementById('actions-sidebar')?.classList.remove('hidden');
                container.innerHTML = `
                    <div class="sidebar-info-msg oracle-waiting">
                        <i class="fas fa-scroll"></i>
                        <p>O Oráculo tece o destino...</p>
                        <span class="wait-badge">Aguardando o Mestre...</span>
                    </div>
                `;
                title.textContent = "Aguardando";
                return;
            }

            if (ctx.isGM) {
                document.getElementById('actions-sidebar')?.classList.remove('hidden');
                container.innerHTML = `
                    <div class="sidebar-info-msg">
                        <i class="fas fa-shield-alt"></i>
                        <p>Lateral reservada para Iniciativa e Combate.</p>
                    </div>
                `;
            } else {
                document.getElementById('actions-sidebar')?.classList.remove('hidden');
                const char = ctx.characterData;

                if (!char) {
                    container.innerHTML = `<p class="mystic-msg">Aguardando vínculo com a alma do herói...</p>`;
                    return;
                }

                const spells = char.spells?.list || [];
                const items = char.inventory?.items || [];
                const attacks = char.combat?.attacks || [];

                container.innerHTML = `
                    <div class="player-actions-scroll">
                        <div class="action-section">
                            <h4>Ações Rápidas</h4>
                            <div class="action-grid">
                                <button class="medieval-btn small" id="btn-roll-d20-fast">1d20</button>
                                <button class="medieval-btn small" id="btn-roll-d12-fast">1d12</button>
                                <button class="medieval-btn small" id="btn-roll-d10-fast">1d10</button>
                                <button class="medieval-btn small" id="btn-roll-d8-fast">1d8</button>
                                <button class="medieval-btn small" id="btn-roll-d6-fast">1d6</button>
                                <button class="medieval-btn small" id="btn-roll-d4-fast">1d4</button>
                            </div>
                        </div>
                        <div class="action-section">
                            <h4>Combate</h4>
                            <div class="action-list">
                                ${attacks.length ? attacks.map(atk => `
                                    <div class="action-item combat-item" data-atk-name="${atk.name}" data-atk-bonus="${atk.bonus}" data-atk-damage="${atk.damage}">
                                        <span class="atk-name">${atk.name}</span>
                                        <span class="atk-bonus">${atk.bonus >= 0 ? '+' : ''}${atk.bonus}</span>
                                    </div>
                                `).join('') : '<p class="empty-msg">Nenhum ataque preparado.</p>'}
                            </div>
                        </div>
                        <div class="action-section">
                            <h4>Magias Preparadas</h4>
                            <div class="action-list">
                                ${Array.isArray(spells) && spells.filter(s => s.prepared === true).length ? spells.filter(s => s.prepared === true).map(s => `
                                    <div class="action-item magic-item" data-spell-name="${s.name}">
                                        <span class="spell-name">${s.name}</span>
                                        <span class="spell-lvl">Nível ${s.level}</span>
                                    </div>
                                `).join('') : '<p class="empty-msg">Nenhuma magia preparada.</p>'}
                            </div>
                        </div>
                        <div class="action-section">
                            <h4>Equipados</h4>
                            <div class="action-list">
                                ${Array.isArray(items) && items.filter(i => i.equipped === true).length ? items.filter(i => i.equipped === true).map(i => `
                                    <div class="action-item inventory-item" data-item-name="${i.name}">
                                        <span class="item-name">${i.name}</span>
                                        <span class="item-qty">x${i.quantity || 1}</span>
                                    </div>
                                `).join('') : '<p class="empty-msg">Nenhum item equipado.</p>'}
                            </div>
                        </div>
                    </div>
                `;

                container.querySelectorAll('.combat-item').forEach(el => {
                    el.addEventListener('click', () => ctx.rollAttack(el.dataset.atkName, el.dataset.atkBonus, el.dataset.atkDamage));
                });
                container.querySelectorAll('.magic-item').forEach(el => {
                    el.addEventListener('click', () => ctx.useMagic(el.dataset.spellName));
                });
                container.querySelectorAll('.inventory-item').forEach(el => {
                    el.addEventListener('click', () => ctx.useItem(el.dataset.itemName));
                });
                document.getElementById('btn-roll-d20-fast')?.addEventListener('click', () => ctx.rollDice('1d20'));
                document.getElementById('btn-roll-d12-fast')?.addEventListener('click', () => ctx.rollDice('1d12'));
                document.getElementById('btn-roll-d10-fast')?.addEventListener('click', () => ctx.rollDice('1d10'));
                document.getElementById('btn-roll-d8-fast')?.addEventListener('click', () => ctx.rollDice('1d8'));
                document.getElementById('btn-roll-d6-fast')?.addEventListener('click', () => ctx.rollDice('1d6'));
                document.getElementById('btn-roll-d4-fast')?.addEventListener('click', () => ctx.rollDice('1d4'));
            }
        },

        renderSessionUI() {
            if (!ctx.activeSession) return;

            document.getElementById('session-title').textContent = ctx.activeSession.title || "Sessão Sem Título";
            document.getElementById('session-status').innerHTML = `<i class="fas fa-check-circle" style="color: #4caf50;"></i> Conectado`;

            ctx.renderSidebarActions();

            if (ctx.isGM) {
                const heroBtn = document.getElementById('btn-hero-actions');
                if (heroBtn) {
                    heroBtn.innerHTML = `<i class="fas fa-hat-wizard"></i> AÇÃO DO MESTRE`;
                }
                ctx.injectManualNarrativeEditor();
            }
        },

        // Player Actions
        async rollDice(formula = "1d20") {
            const roll = Math.floor(Math.random() * 20) + 1;
            ctx.lastRollResult = roll;
            const sender = ctx.characterData?.bio?.name || ctx.user.displayName || 'O Jogador';
            await ctx.addSystemMessage(`${sender} rolou **${roll}** (${formula})`);
        },

        async rollAttack(name, bonus, damage) {
            const d20 = Math.floor(Math.random() * 20) + 1;
            const bonusVal = parseInt(bonus) || 0;
            const total = d20 + bonusVal;
            const sender = ctx.characterData?.bio?.name || ctx.user.displayName || 'Guerreiro';

            let msg = `${sender} ataca com **${name}**! <i class="fas fa-swords"></i>\n`;
            msg += `Acerto: **${total}** (d20: ${d20} + ${bonusVal})`;
            if (d20 === 20) msg += ' <i class="fas fa-sparkles"></i> **CRÍTICO!**';
            if (d20 === 1) msg += ' <i class="fas fa-skull"></i> **FALHA CRÍTICA!**';

            if (damage) {
                msg += `\nDano Base: ${damage}`;
            }

            ctx.lastRollResult = total;
            await ctx.addSystemMessage(msg);
        },

        async useItem(itemName) {
            const sender = ctx.characterData?.bio?.name || ctx.user.displayName || 'Aventureiro';
            await ctx.addSystemMessage(`${sender} utilizou **${itemName}**.`);
        },

        async showMasterActionsPanel() {
            const modal = document.createElement('div');
            modal.className = 'modal-stage';

            modal.innerHTML = `
                <div class="modal-stage-content master-actions">
                    <h2><i class="fas fa-crown"></i> Ações do Mestre</h2>
                    <p>O que você deseja manifestar nesta rodada da crônica?</p>
                    
                    <div class="master-actions-grid">
                        <div class="master-action-btn" id="m-btn-npc">
                            <i class="fas fa-user-plus"></i>
                            <span>Criar NPC</span>
                        </div>
                        <div class="master-action-btn" id="m-btn-combat">
                            <i class="fas fa-skull-crossbones"></i>
                            <span>Iniciar Combate</span>
                        </div>
                        <div class="master-action-btn" id="m-btn-roll">
                            <i class="fas fa-dice-d20"></i>
                            <span>Pedir Rolagem</span>
                        </div>
                    </div>

                    <div class="modal-actions-centered">
                        <button class="medieval-btn secondary" id="btn-close-master">Fechar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('#m-btn-npc').addEventListener('click', () => {
                document.body.removeChild(modal);
                if (window.CombatPrep) window.CombatPrep.openPrepModal('npc');
            });
            modal.querySelector('#m-btn-combat').addEventListener('click', () => {
                document.body.removeChild(modal);
                ctx.startCombat();
            });
            modal.querySelector('#m-btn-roll').addEventListener('click', () => {
                document.body.removeChild(modal);
                ctx.requestRoll();
            });
            modal.querySelector('#btn-close-master').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        },

        // --- Access Requests Management (GM/Owner) ---
        initAccessRequestListener() {
            if (!ctx.sessionId || ctx.requestUnsubscribe) return;

            console.log("👁️ Iniciando vigilância do Atrium (Solicitações de Acesso)");
            ctx.requestUnsubscribe = AccessRequestsModule.listenToRequests(ctx.sessionId, (requests) => {
                if (requests.length > 0) {
                    ctx.displayAccessRequests(requests);
                } else {
                    ctx.hideAccessRequests();
                }
            });
        },

        displayAccessRequests(requests) {
            let container = document.getElementById('access-requests-notif');
            if (!container) {
                container = document.createElement('div');
                container.id = 'access-requests-notif';
                container.className = 'access-requests-layer';
                document.body.appendChild(container);
            }

            const count = requests.length;
            container.innerHTML = `
                <div class="access-requests-badge parchment-mini">
                    <i class="fas fa-door-open blink"></i>
                    <span>${count} alma${count > 1 ? 's' : ''} batendo no Atrium</span>
                    <button class="medieval-btn small" id="view-requests-btn">Ver</button>
                </div>
            `;

            document.getElementById('view-requests-btn').addEventListener('click', () => {
                ctx.showRequestsModal(requests);
            });
        },

        hideAccessRequests() {
            const container = document.getElementById('access-requests-notif');
            if (container) container.remove();
        },

        async showRequestsModal(requests) {
            const modalHtml = `
                <div class="modal-stage alert-modal">
                    <div class="modal-stage-content parchment">
                        <h2 class="medieval-title">Solicitações de Entrada</h2>
                        <div class="requests-list">
                            ${requests.map(req => `
                                <div class="request-item">
                                    <div class="request-info">
                                        <strong>${req.requesterNickname || req.requesterName}</strong>
                                        <span class="request-type">Aventureiro(a)</span>
                                    </div>
                                    <div class="request-actions">
                                        <button class="medieval-btn small" data-req-id="${req.id}" data-action="accept">Aceitar</button>
                                        <button class="medieval-btn small secondary" data-req-id="${req.id}" data-action="reject">Rejeitar</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="modal-actions-centered">
                            <button class="medieval-btn" id="close-requests-modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;

            const modalContainer = document.getElementById('modal-container');
            if (modalContainer) {
                modalContainer.innerHTML = modalHtml;

                modalContainer.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.target.dataset.reqId;
                        const action = e.target.dataset.action;

                        if (action === 'accept') {
                            await AccessRequestsModule.acceptRequest(id);
                            ctx.showMysticAlert("Nova alma aceita na jornada!", "Acesso Concedido");
                        } else {
                            await AccessRequestsModule.rejectRequest(id);
                        }

                        modalContainer.innerHTML = "";
                    });
                });

                document.getElementById('close-requests-modal').addEventListener('click', () => {
                    modalContainer.innerHTML = "";
                });
            }
        },

        async deleteNPC(npcName) {
            if (!ctx.isGM) return;
            const confirmed = await ctx.showMysticConfirm(`Deseja remover ${npcName} do palco de aliados?`, "Eliminar Aliado");
            if (confirmed) {
                try {
                    const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.sessionId);
                    const newAllies = (ctx.activeSession.allies || []).filter(n => n.name !== npcName);
                    const newSessionNPCs = (ctx.activeSession.sessionNPCs || []).filter(n => n.name !== npcName);

                    await updateDoc(sessionRef, {
                        allies: newAllies,
                        sessionNPCs: newSessionNPCs,
                        updatedAt: serverTimestamp()
                    });

                    ctx.showMysticAlert(`${npcName} foi removido.`);
                } catch (err) {
                    console.error("Erro ao deletar NPC:", err);
                }
            }
        },

        // UI Helpers: Mystic Notifications
        showMysticAlert(message, title = "Aviso do Oráculo") {
            return new Promise((resolve) => {
                const modalHtml = `
                    <div class="modal-stage alert-modal">
                        <div class="modal-stage-content mini parchment-mini">
                            <h2 class="medieval-title">${title}</h2>
                            <p class="mystic-msg">${message}</p>
                            <div class="modal-actions-centered">
                                <button class="medieval-btn" id="mystic-alert-ok">Entendido</button>
                            </div>
                        </div>
                    </div>
                `;
                const container = document.getElementById('modal-container');
                if (container) {
                    container.innerHTML = modalHtml;
                    document.getElementById('mystic-alert-ok').addEventListener('click', () => {
                        container.innerHTML = "";
                        resolve(true);
                    });
                } else {
                    alert(message);
                    resolve(true);
                }
            });
        },

        showMysticConfirm(message, title = "Decisão Necessária") {
            return new Promise((resolve) => {
                const modalHtml = `
                    <div class="modal-stage alert-modal">
                        <div class="modal-stage-content mini parchment-mini">
                            <h2 class="medieval-title">${title}</h2>
                            <p class="mystic-msg">${message}</p>
                            <div class="modal-actions-centered">
                                <button class="medieval-btn" id="mystic-confirm-yes">Sim</button>
                                <button class="medieval-btn secondary" id="mystic-confirm-no">Não</button>
                            </div>
                        </div>
                    </div>
                `;
                const container = document.getElementById('modal-container');
                if (container) {
                    container.innerHTML = modalHtml;
                    document.getElementById('mystic-confirm-yes').addEventListener('click', () => {
                        container.innerHTML = "";
                        resolve(true);
                    });
                    document.getElementById('mystic-confirm-no').addEventListener('click', () => {
                        container.innerHTML = "";
                        resolve(false);
                    });
                } else {
                    resolve(confirm(message));
                }
            });
        },

        toggleLoading(show, message = "Invocando o Palco...") {
            const loader = document.getElementById('loader');
            const msgEl = document.getElementById('loader-message');
            if (!loader) return;

            if (show) {
                if (msgEl) msgEl.textContent = message;
                loader.classList.remove('hidden');
            } else {
                loader.classList.add('hidden');
            }
        }
    };
}
