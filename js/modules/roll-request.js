/**
 * Roll Request Module
 * Handles synchronized roll requests from GM to players.
 */

import { db } from "../auth.js";
import { logger } from "../logger.js";
import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
    onSnapshot,
    query,
    where,
    orderBy,
    doc,
    getDoc,
    updateDoc,
    limit
} from "firebase/firestore";
import { escapeHTML } from "./utils.js";


const RollRequestModule = {
    sessionId: null,
    chapterIndex: 0,
    activeRequest: null,
    pendingRolls: new Map(), // uid -> { name, result }

    init(sessionId, chapterIndex = 0) {
        this.sessionId = sessionId;
        this.chapterIndex = Number(chapterIndex);
        this.listenToRequests();
    },

    /**
     * Mestre: Abre o modal para solicitar rolagens
     */
    async openRequestModal() {
        // Fetch online players
        const players = await this.getOnlinePlayers();

        const modalHtml = `
            <div class="modal-stage" id="roll-request-modal">
                <div class="modal-stage-content roll-request-modal premium-roll-request">
                    <button class="close-btn-top" id="cancel-roll-req-top">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="roll-request-header">
                        <h2 class="medieval-title-gold">Solicitar Rolagem</h2>
                        <p class="mystic-msg">Escolha o destino e quem deve enfrentá-lo.</p>
                    </div>

                    <div class="roll-request-grid">
                        <!-- 1. Target Selection -->
                        <div class="roll-category-group">
                            <div class="roll-category-title"><i class="fas fa-users"></i> Quem irá rolar?</div>
                            <div class="roll-buttons-flex" id="target-selection">
                                <button class="roll-option-btn selected" data-target="all">
                                    <i class="fas fa-broadcast-tower"></i> Todos
                                </button>
                                ${players.map(p => `
                                    <button class="roll-option-btn" data-target="${p.uid}" data-name="${p.characterName}">
                                        <i class="fas fa-user-shield"></i> ${p.characterName}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 2. Type Selection (RESTORING THIS SECTION) -->
                        <div class="roll-category-group">
                            <div class="roll-category-title"><i class="fas fa-dice-d20"></i> Tipo de Teste</div>
                            <div class="roll-tabs">
                                <button class="roll-tab active" data-tab="attrs">Atributos</button>
                                <button class="roll-tab" data-tab="skills">Perícias</button>
                            </div>

                            <div class="roll-panels">
                                <div class="roll-panel" id="panel-attrs">
                                    <div class="roll-buttons-flex">
                                        <button class="roll-option-btn type-btn" data-val="Força">Força</button>
                                        <button class="roll-option-btn type-btn" data-val="Destreza">Destreza</button>
                                        <button class="roll-option-btn type-btn" data-val="Constituição">Constituição</button>
                                        <button class="roll-option-btn type-btn" data-val="Inteligência">Inteligência</button>
                                        <button class="roll-option-btn type-btn" data-val="Sabedoria">Sabedoria</button>
                                        <button class="roll-option-btn type-btn" data-val="Carisma">Carisma</button>
                                    </div>
                                </div>
                                <div class="roll-panel" id="panel-skills" style="display: none;">
                                    <div class="roll-buttons-flex">
                                        <button class="roll-option-btn type-btn" data-val="Acrobacia">Acrobacia</button>
                                        <button class="roll-option-btn type-btn" data-val="Adestrar Animais">Adestrar Animais</button>
                                        <button class="roll-option-btn type-btn" data-val="Arcanismo">Arcanismo</button>
                                        <button class="roll-option-btn type-btn" data-val="Atletismo">Atletismo</button>
                                        <button class="roll-option-btn type-btn" data-val="Atuação">Atuação</button>
                                        <button class="roll-option-btn type-btn" data-val="Enganação">Enganação</button>
                                        <button class="roll-option-btn type-btn" data-val="Furtividade">Furtividade</button>
                                        <button class="roll-option-btn type-btn" data-val="História">História</button>
                                        <button class="roll-option-btn type-btn" data-val="Intimidação">Intimidação</button>
                                        <button class="roll-option-btn type-btn" data-val="Intuição">Intuição</button>
                                        <button class="roll-option-btn type-btn" data-val="Investigação">Investigação</button>
                                        <button class="roll-option-btn type-btn" data-val="Medicina">Medicina</button>
                                        <button class="roll-option-btn type-btn" data-val="Natureza">Natureza</button>
                                        <button class="roll-option-btn type-btn" data-val="Percepção">Percepção</button>
                                        <button class="roll-option-btn type-btn" data-val="Persuasão">Persuasão</button>
                                        <button class="roll-option-btn type-btn" data-val="Prestidigitação">Prestidigitação</button>
                                        <button class="roll-option-btn type-btn" data-val="Religião">Religião</button>
                                        <button class="roll-option-btn type-btn" data-val="Sobrevivência">Sobrevivência</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 3. Difficulty (CD) -->
                        <div class="roll-category-group">
                            <div class="roll-category-title"><i class="fas fa-mountain"></i> Dificuldade (CD)</div>
                            <div class="roll-dc-selector">
                                <div class="dc-value" id="current-dc-val">12</div>
                                <div class="dc-presets">
                                    <button class="dc-preset-btn" data-dc="5">Fácil (5)</button>
                                    <button class="dc-preset-btn" data-dc="10">Normal (10)</button>
                                    <button class="dc-preset-btn selected" data-dc="12">Padrão (12)</button>
                                    <button class="dc-preset-btn" data-dc="15">Difícil (15)</button>
                                    <button class="dc-preset-btn" data-dc="20">Épico (20)</button>
                                </div>
                            </div>
                        </div>

                        <!-- 4. Roll Mode (Advantage/Disadvantage) -->
                        <div class="roll-category-group">
                            <div class="roll-category-title"><i class="fas fa-balance-scale"></i> Modo de Rolagem</div>
                            <div class="roll-buttons-flex" id="roll-mode-selection">
                                <button class="roll-option-btn selected" data-mode="normal">Normal</button>
                                <button class="roll-option-btn" data-mode="advantage">Vantagem</button>
                                <button class="roll-option-btn" data-mode="disadvantage">Desvantagem</button>
                            </div>
                        </div>
                    </div>

                    <div class="modal-actions-premium">
                        <button class="medieval-btn large gold-btn" id="confirm-roll-req">
                            <i class="fas fa-dice-d20"></i> ENVIAR SOLICITAÇÃO
                        </button>
                    </div>
                </div>
            </div>
        `;

        let container = document.getElementById('modal-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'modal-container';
            document.body.appendChild(container);
        }
        container.innerHTML = modalHtml;
        const modal = document.getElementById('roll-request-modal');

        // State
        let selectedTarget = 'all';
        let selectedTargetName = 'Todos';
        let selectedType = null;
        let selectedDC = 12;
        let selectedRollMode = 'normal';

        // --- Bind Events ---

        // Close
        modal.querySelector('#cancel-roll-req-top').onclick = () => modal.remove();

        // Target Selection
        modal.querySelectorAll('#target-selection .roll-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('#target-selection .roll-option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTarget = btn.dataset.target;
                selectedTargetName = btn.dataset.name || 'Todos';
            });
        });

        // Tab Switching
        const tabs = modal.querySelectorAll('.roll-tab');
        const panels = modal.querySelectorAll('.roll-panel');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.style.display = 'none');
                tab.classList.add('active');
                modal.querySelector(`#panel-${tab.dataset.tab}`).style.display = 'block';
            });
        });

        // Type Selection
        modal.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedType = btn.dataset.val;
            });
        });

        // DC Presets
        modal.querySelectorAll('.dc-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.dc-preset-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedDC = parseInt(btn.dataset.dc);
                modal.querySelector('#current-dc-val').innerText = selectedDC;
            });
        });

        // Roll Mode Selection
        modal.querySelectorAll('#roll-mode-selection .roll-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('#roll-mode-selection .roll-option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedRollMode = btn.dataset.mode;
            });
        });

        // Confirm
        modal.querySelector('#confirm-roll-req').addEventListener('click', async () => {
            if (!selectedType) {
                alert("Selecione o tipo de teste!");
                return;
            }

            // Resolve target players
            let playersToSend = [];
            if (selectedTarget === 'all') {
                playersToSend = players;
            } else {
                playersToSend = players.filter(p => p.uid === selectedTarget);
            }

            if (playersToSend.length === 0) {
                alert("Nenhum jogador selecionado ou online.");
                return;
            }

            await this.sendRequestFromData({
                skill: selectedType,
                dc: selectedDC,
                rollMode: selectedRollMode,
                players: playersToSend
            });

            logger.info("RollRequest: Solicitação enviada pelo Mestre.");
            modal.remove();
        });
    },

    async getOnlinePlayers() {
        // Query only by sessionId to avoid composite index requirement
        const q = query(
            collection(db, "session_invites"),
            where("sessionId", "==", this.sessionId)
        );
        const snap = await getDocs(q);
        // Filter by status on client-side
        return snap.docs
            .map(d => d.data())
            .filter(p => p.role !== 'gm' && p.status === 'online');
    },



    async sendRequestFromData(data) {
        const textFallback = `Solicitação de rolagem: ${data.skill} (CD ${data.dc})`;
        const requestData = {
            type: 'roll_request',
            skill: data.skill,
            dc: data.dc || 12,
            rollMode: data.rollMode || 'normal',
            players: data.players, // Array of {uid, name}
            status: 'pending',
            results: {},
            timestamp: serverTimestamp(),
            senderId: 'system',
            senderNickname: 'Legado Arcano',
            role: 'system',
            chapterIndex: this.chapterIndex,
            text: textFallback // Add text to avoid empty bubble space
        };

        await addDoc(collection(db, "sessoes", this.sessionId, "session_messages"), requestData);
        logger.info("🎲 Solicitação de rolagem sincronizada enviada.");
    },

    /**
     * Listener para novas solicitações
     */
    listenToRequests() {
        const q = query(
            collection(db, "sessoes", this.sessionId, "session_messages"),
            orderBy("timestamp", "desc"),
            limit(10) // Get last 10 to be safe and filter client-side
        );

        onSnapshot(q, (snap) => {
            snap.docs.forEach(doc => {
                const data = doc.data();
                if (data.type === 'roll_request' && Number(data.chapterIndex) === this.chapterIndex) {
                    this.handleIncomingRequest({ id: doc.id, ...data });
                }
            });
        }, (err) => {
            logger.error("❌ RollRequest: Erro no listener:", err);
        });
    },

    handleIncomingRequest(request) {
        // Check if it's a completely new request to trigger notification
        if (this.lastRequestId !== request.id) {
            this.lastRequestId = request.id;

            const now = Date.now();
            const requestTime = request.timestamp?.toMillis ? request.timestamp.toMillis() : (request.timestamp?.seconds ? request.timestamp.seconds * 1000 : now);

            // Notification only for recent new requests
            if (now - requestTime < 120000) {
                const myUid = window.StageModule.user.uid;
                const isTarget = request.players.some(p => p.uid === myUid);

                if (isTarget && request.status === 'pending' && (!request.results || !request.results[myUid])) {
                    logger.info("🎲 RollRequest: Exibindo notificação para o jogador.");
                    this.showPlayerNotification(request);
                    this.restrictHeroActions(request);
                }
            }
        }

        if (window.StageModule.isGM) {
            this.trackResults(request);
        }
    },

    showPlayerNotification(request) {
        if (this.modalElement) this.modalElement.remove();

        const modalHtml = `
            <div class="modal-stage" id="player-roll-modal">
                <div class="modal-stage-content parchment-mini roll-interact-box">
                    <div class="modal-header">
                        <h2 class="medieval-title"><i class="fas fa-dice-d20"></i> Chamado do Mestre</h2>
                    </div>
                    <div class="modal-body text-center">
                        <p class="roll-instruction">O Mestre solicita um teste de <strong>${request.skill}</strong>!</p>
                        <p class="roll-mode-badge">${request.rollMode === 'advantage' ? '<span class="gold-text">Vantagem</span>' : (request.rollMode === 'disadvantage' ? '<span class="crimson-text">Desvantagem</span>' : 'Normal')}</p>
                        <div class="dice-interaction-area" id="trigger-player-roll">
                            <div class="d20-visual">
                                <i class="fas fa-dice-d20"></i>
                            </div>
                        </div>
                        <p class="roll-extra-info">Dificuldade Alvo: <span class="gold-text">${request.dc}</span></p>
                        <div id="roll-breakdown-output" class="roll-breakdown-mini" style="margin-top: 15px; min-height: 1.2rem;"></div>
                    </div>
                </div>
            </div>
        `;

        let container = document.getElementById('modal-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'modal-container';
            document.body.appendChild(container);
        }
        container.innerHTML = modalHtml;
        this.modalElement = document.getElementById('player-roll-modal');

        const trigger = document.getElementById('trigger-player-roll');
        if (trigger) {
            trigger.onclick = async () => {
                const area = document.getElementById('trigger-player-roll');
                if (area.classList.contains('rolling')) return; // Prevenir múltiplos cliques

                logger.info("RollRequest: Jogador iniciou a rolagem.");
                area.classList.add('rolling');

                // Simular delay de rolagem visual
                setTimeout(async () => {
                    const r1 = Math.floor(Math.random() * 20) + 1;
                    const r2 = Math.floor(Math.random() * 20) + 1;

                    let roll = r1;
                    if (request.rollMode === 'advantage') roll = Math.max(r1, r2);
                    if (request.rollMode === 'disadvantage') roll = Math.min(r1, r2);

                    // Buscar bônus do personagem
                    let bonus = 0;
                    if (window.StageModule?.characterData) {
                        const char = window.StageModule.characterData;
                        const skill = request.skill;

                        // Mapping
                        const attrMap = {
                            'Força': 'str', 'Destreza': 'dex', 'Constituição': 'con',
                            'Inteligência': 'int', 'Sabedoria': 'wis', 'Carisma': 'cha'
                        };

                        const skillMap = {
                            'Acrobacia': 'acrobacia', 'Adestrar Animais': 'adestrar_animais', 'Arcanismo': 'arcanismo',
                            'Atletismo': 'atletismo', 'Atuação': 'atuacao', 'Enganação': 'enganacao',
                            'Furtividade': 'furtividade', 'História': 'historia', 'Intimidação': 'intimidacao',
                            'Intuição': 'intuicao', 'Investigação': 'investigacao', 'Medicina': 'medicina',
                            'Natureza': 'natureza', 'Percepção': 'percepcao', 'Persuasão': 'persuasao',
                            'Prestidigitação': 'prestidigitacao', 'Religião': 'religiao', 'Sobrevivência': 'sobrevivencia'
                        };

                        const skillToAttr = {
                            'acrobacia': 'dex', 'adestrar_animais': 'wis', 'arcanismo': 'int', 'atletismo': 'str',
                            'atuacao': 'cha', 'enganacao': 'cha', 'furtividade': 'dex', 'historia': 'int',
                            'intimidacao': 'cha', 'intuicao': 'wis', 'investigacao': 'int', 'medicina': 'wis',
                            'natureza': 'int', 'percepcao': 'wis', 'persuasao': 'cha', 'prestidigitacao': 'dex',
                            'religiao': 'int', 'sobrevivencia': 'wis'
                        };

                        if (attrMap[skill]) {
                            const attrCode = attrMap[skill];
                            const score = parseInt(char.attributes?.[attrCode] || 10);
                            bonus = Math.floor((score - 10) / 2);

                            // Check if it's a Saving Throw (requested from Atributos panel often means Save in this context)
                            // or if it's just a raw check. Original UI has "Atributos" and "Perícias".
                            // For simplicity, we use raw attribute mod for "Atributos" tab selections.
                        } else if (skillMap[skill]) {
                            const skCode = skillMap[skill];
                            const attrCode = skillToAttr[skCode];
                            const score = parseInt(char.attributes?.[attrCode] || 10);
                            const attrMod = Math.floor((score - 10) / 2);

                            const isProf = (char.proficiencies_choice?.skills || []).includes(skCode);
                            const isExpert = (char.proficiencies_choice?.expertise || []).includes(skCode);

                            const level = parseInt(char.bio?.level || 1);
                            const profBonus = Math.ceil(1 + (level / 4));

                            bonus = attrMod + (isProf ? profBonus : 0) + (isExpert ? profBonus : 0);
                        }
                    }

                    const total = roll + bonus;
                    const rollDetail = request.rollMode !== 'normal' ? `(${r1}, ${r2} -> ${roll})` : `(${roll})`;
                    area.innerHTML = `<div class="roll-result-final pulse-glow">${total}</div>`;

                    const breakdownEl = document.getElementById('roll-breakdown-output');
                    if (breakdownEl) {
                        breakdownEl.innerHTML = `${rollDetail} + ${bonus}`;
                    }

                    try {
                        await this.sendRollResult(request.id, total);
                    } catch (e) {
                        logger.error("RollRequest: Falha ao enviar resultado da rolagem:", e);
                    }

                    setTimeout(() => {
                        if (this.modalElement) this.modalElement.remove();
                    }, 3000);
                }, 1000);
            };
        } else {
            logger.error("RollRequest: Elemento trigger-player-roll não encontrado no DOM.");
        }
    },

    async sendRollResult(requestId, total) {
        const myUid = window.StageModule.user.uid;
        try {
            const msgRef = doc(db, "sessoes", this.sessionId, "session_messages", requestId);

            // Atomic update using dot notation to prevent race conditions with multiple players
            const updateData = {};
            updateData[`results.${myUid}`] = total;

            await updateDoc(msgRef, updateData);
            logger.info(`RollRequest: Resultado ${total} enviado para o Firestore atômicamente.`);
        } catch (e) {
            logger.error("❌ RollRequest: Erro ao enviar resultado (Verifique as Permissões do Firebase):", e);
        }
    },

    restrictHeroActions(request) {
        if (window.HeroActions) {
            window.HeroActions.activeRequest = request;
            // Removed non-existent renderDice() call
        }
    },

    /**
     * Mestre: Acompanha resultados e consolida
     */
    trackResults(request) {
        const total = request.players.length;
        const responded = Object.keys(request.results || {}).length;

        if (responded >= total && request.status !== 'completed') {
            this.consolidateResults(request);
        }
    },

    async consolidateResults(request) {
        logger.info("🎲 RollRequest: Consolidando resultados dos jogadores...");
        // Mark as completed to avoid double post
        const docRef = doc(db, "sessoes", this.sessionId, "session_messages", request.id);
        try {
            await updateDoc(docRef, { status: 'completed' });
            logger.debug("🎲 RollRequest: Status da solicitação atualizado para 'completed'.");
        } catch (e) {
            logger.error("❌ RollRequest: Falha ao consolidar (Permission Denied?):", e);
            // Even if updateDoc fails, we try to send the message if it's the GM
            if (!window.StageModule.isGM) return;
        }

        // Build consolidated message
        const modeLabel = request.rollMode === 'advantage' ? ' (Vantagem)' : (request.rollMode === 'disadvantage' ? ' (Desvantagem)' : '');
        let html = `<div class="roll-consolidated-card"><div class="card-header"><i class="fas fa-scroll"></i> Resultados: ${escapeHTML(request.skill)}${modeLabel} (CD ${escapeHTML(String(request.dc))})</div><div class="results-list">`;

        request.players.forEach(p => {
            const charName = p.characterName || p.name || 'Herói';
            const roll = request.results[p.uid];
            const success = roll >= request.dc;
            html += `<div class="result-row ${success ? 'success' : 'fail'}"><span class="p-name"><b>${escapeHTML(charName)}</b></span><span class="p-roll"><i class="fas fa-dice-d20"></i> <b>${roll || '0'}</b></span><span class="p-status"><em>${success ? 'Sucesso' : 'Falha'}</em></span></div>`;
        });

        html += `</div></div>`;

        // Send to system chat
        await addDoc(collection(db, "sessoes", this.sessionId, "session_messages"), {
            role: 'system',
            senderId: 'system',
            senderNickname: 'Legado Arcano',
            text: html,
            isRawHTML: true, // Flag to bypass escaping in StageModule
            chapterIndex: this.chapterIndex,
            timestamp: serverTimestamp()
        });
    },

    /**
     * Renderiza o card de solicitação no chat central (narrativa)
     */
    renderRollRequestCard(msg) {
        return `<div class="roll-request-inline-container"><div class="roll-request-inline-card"><div class="inline-card-header"><i class="fas fa-dice-d20"></i> SOLICITAÇÃO SINCRONIZADA</div><div class="inline-card-body">O Mestre convoca um teste de <span class="gold-text">${escapeHTML(msg.skill)}</span> com Dificuldade <span class="gold-text">${escapeHTML(String(msg.dc))}</span>.</div></div></div>`;
    }
};

window.RollRequestModule = RollRequestModule;
export default RollRequestModule;
