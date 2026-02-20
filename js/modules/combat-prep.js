/**
 * Combat Prep Module
 * Handles the preparation phase before combat starts.
 */

import { db } from "../auth.js";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getGlobalMonsters, getUserMonsters } from "../data.js";
import CombatEngine from "./combat-engine.js";
import CombatUI from "./combat-ui.js";
import { logger } from "../logger.js";

const CombatPrep = {
    preparedMonsters: [],
    sessionId: null,

    async openPrepModal(mode = 'combat') {
        logger.info(`⚔️ CombatPrep: Abrindo modal em modo [${mode}]...`);
        this.sessionId = window.StageModule?.sessionId;
        this.renderMainModal(mode);
    },

    async renderMainModal(mode = 'combat') {
        // Create modal container if not exists
        let modal = document.getElementById('combat-prep-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'combat-prep-modal';
        modal.className = 'modal-stage';

        const isNPCMode = mode === 'npc';
        const titleText = isNPCMode ? "Forja de Aliados & NPCs" : "Forja de Adversários & Combate";
        const mainActionIcon = isNPCMode ? "fa-user-plus" : "fa-skull";
        const mainActionText = isNPCMode ? "GUARDAR NPC" : "EVOCAR";

        modal.innerHTML = `
            <div class="modal-stage-content combat-prep-window premium-forge">
                <button class="close-btn-top" onclick="document.getElementById('combat-prep-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>

                <div class="forge-header">
                    <h2 class="medieval-title-gold">${titleText}</h2>
                </div>

                <div class="forge-grid">
                    <!-- Coluna de Criação -->
                    <div class="forge-column creation-side">
                        <div class="form-section-premium">
                            <div class="field-group">
                                <label class="mystic-label">Nome da Entidade</label>
                                <input type="text" id="m-name" class="medieval-input-v2" placeholder="Ex: Capitão da Guarda ou Esqueleto Arquivista">
                            </div>

                            <div class="stats-row">
                                <div class="field-group small">
                                    <label class="mystic-label">CA</label>
                                    <input type="number" id="m-ac" class="medieval-input-v2" value="10">
                                </div>
                                <div class="field-group small">
                                    <label class="mystic-label">HP Max</label>
                                    <input type="number" id="m-hp" class="medieval-input-v2" value="30">
                                </div>
                                <div class="field-group small">
                                    <label class="mystic-label">Ini (Bônus)</label>
                                    <input type="number" id="m-init" class="medieval-input-v2" value="0">
                                </div>
                            </div>

                            <div class="field-group">
                                <label class="mystic-label">Ações e Habilidades</label>
                                <div id="actions-list-container" class="structured-actions-list">
                                    <!-- Action rows will be added here -->
                                </div>
                                <button class="medieval-btn small add-action-row-btn" id="btn-add-action-row">
                                    <i class="fas fa-plus-circle"></i> Adicionar Ação
                                </button>
                            </div>

                            <div class="forge-actions">
                                <button class="medieval-btn purple-glow-btn" id="btn-magic-write">
                                    <i class="fas fa-wand-magic-sparkles"></i> Escrever com Magia
                                </button>
                                <button class="medieval-btn evoke-btn-gold" id="btn-evoke-monster">
                                    <i class="fas ${mainActionIcon}"></i> ${mainActionText}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Coluna de Lista -->
                    <div class="forge-column inventory-side">
                        <div class="ready-entities-container">
                            <h3 class="side-title"><i class="fas fa-scroll"></i> Entidades Prontas</h3>
                            <div class="forge-list-scrollable" id="prep-monster-list">
                                <p class="empty-msg-thematic">Nenhuma alma manifestada na forja ainda...</p>
                            </div>
                        </div>
                    </div>
                </div>

                ${!isNPCMode ? `
                <div class="forge-footer-action">
                    <button class="medieval-btn large start-battle-btn disabled" id="btn-confirm-start-combat" disabled>
                        <i class="fas fa-swords"></i> INICIAR COMBATE
                    </button>
                </div>
                ` : `
                <div class="forge-footer-action">
                    <button class="medieval-btn large finish-npc-btn" onclick="document.getElementById('combat-prep-modal').remove()">
                        <i class="fas fa-check-double"></i> CONCLUIR CRIAÇÃO
                    </button>
                </div>
                `}
            </div>
        `;

        document.body.appendChild(modal);
        this.bindPrepEvents();

        // Add one initial action row
        this.addActionRow();

        this.renderCurrentList();
    },

    bindPrepEvents() {
        document.getElementById('btn-evoke-monster').addEventListener('click', () => this.evokeMonster());
        document.getElementById('btn-magic-write').addEventListener('click', () => this.magicWrite());
        document.getElementById('btn-add-action-row').addEventListener('click', () => this.addActionRow());

        const startBtn = document.getElementById('btn-confirm-start-combat');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.executeStartCombat());
        }
    },

    addActionRow(data = { name: '', damage: '', range: '', desc: '' }) {
        const container = document.getElementById('actions-list-container');
        if (!container) return;

        const rowId = `action-row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const row = document.createElement('div');
        row.className = 'structured-action-row';
        row.id = rowId;
        row.innerHTML = `
            <div class="action-row-main">
                <input type="text" class="act-name medieval-input-v2" placeholder="Nome" value="${data.name}">
                <input type="text" class="act-damage medieval-input-v2" placeholder="Dano" value="${data.damage}">
                <input type="text" class="act-range medieval-input-v2" placeholder="Alcance" value="${data.range}">
                <button class="remove-row-btn" onclick="document.getElementById('${rowId}').remove()" title="Remover Ação">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <textarea class="act-desc medieval-textarea-v2" placeholder="Descrição (aparecerá no hover)" title="Descrição do ataque">${data.desc}</textarea>
        `;
        container.appendChild(row);
    },

    async magicWrite() {
        const name = document.getElementById('m-name').value;
        const ac = document.getElementById('m-ac').value;
        const hp = document.getElementById('m-hp').value;
        // Gather context from currently filled rows
        const actionRows = document.querySelectorAll('.structured-action-row');
        let actionsContext = "";
        actionRows.forEach(row => {
            const aName = row.querySelector('.act-name').value;
            const aDesc = row.querySelector('.act-desc').value;
            if (aName) actionsContext += `${aName}: ${aDesc}; `;
        });

        if (!name && !actionsContext) {
            alert("Forneça ao menos um nome ou descrição das ações para a magia fluir!");
            return;
        }

        const btn = document.getElementById('btn-magic-write');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Tecendo...`;
        btn.disabled = true;

        try {
            const prompt = `Você é o Oráculo Arcano. Transforme estes dados básicos em um monstro ou NPC detalhado para D&D 5e.
            Nome: ${name}
            CA: ${ac}
            HP: ${hp}
            Contexto/Ações: ${actionsContext}
            
            Retorne APENAS um JSON no formato:
            {
              "name": "Nome Épico",
              "ac": número,
              "hp": número,
              "init": número de bônus,
              "actions": [
                { "name": "Nome do Ataque", "damage": "1d8+2", "range": "1,5m", "desc": "Descrição curta" },
                ...
              ]
            }`;

            const { callGeminiAPI } = await import('../ai.js');
            const token = await window.StageModule.user.getIdToken();
            const response = await callGeminiAPI(prompt, token);

            // Clean JSON
            const jsonStr = response.replace(/```json|```/g, '').trim();
            const data = JSON.parse(jsonStr);

            document.getElementById('m-name').value = data.name || name;
            document.getElementById('m-ac').value = data.ac || ac;
            document.getElementById('m-hp').value = data.hp || hp;
            document.getElementById('m-init').value = data.init || 0;

            // Handle actions
            if (data.actions && Array.isArray(data.actions)) {
                const container = document.getElementById('actions-list-container');
                container.innerHTML = ""; // Clear existing
                data.actions.forEach(act => this.addActionRow(act));
            }

        } catch (e) {
            console.error("Erro na Magia de Escrita:", e);
            alert("A magia falhou em se manifestar. Tente novamente.");
        } finally {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    },

    async evokeMonster() {
        const nameInput = document.getElementById('m-name');
        const acInput = document.getElementById('m-ac');
        const hpInput = document.getElementById('m-hp');
        const initInput = document.getElementById('m-init');

        const name = nameInput.value;
        const ac = parseInt(acInput.value) || 10;
        const hp = parseInt(hpInput.value) || 30;
        const init = parseInt(initInput.value) || 0;

        // Gather structured actions
        const actions = [];
        document.querySelectorAll('.structured-action-row').forEach(row => {
            const aName = row.querySelector('.act-name').value;
            const aDmg = row.querySelector('.act-damage').value;
            const aRange = row.querySelector('.act-range').value;
            const aDesc = row.querySelector('.act-desc').value;
            if (aName) {
                actions.push({ name: aName, damage: aDmg, range: aRange, desc: aDesc });
            }
        });

        if (!name) {
            alert("Dê um nome à sua criação!");
            return;
        }

        const isNPCMode = document.querySelector('.medieval-title-gold')?.textContent === "Forja de Aliados & NPCs";

        const entity = {
            id: `created_${Date.now()}`,
            name,
            ac,
            hp,
            maxHp: hp,
            initBonus: init,
            actions, // Now an array of objects
            quantity: 1,
            type: isNPCMode ? 'npc' : 'monster'
        };

        if (isNPCMode) {
            // NPC MODE: Save directly to session's allies
            try {
                const sessionRef = doc(db, "sessoes", this.sessionId);
                await updateDoc(sessionRef, {
                    allies: arrayUnion(entity)
                });
                console.log("✅ NPC Aliado salvo na sessão.");
            } catch (err) {
                console.error("Erro ao salvar aliado:", err);
            }
        }

        // Add to local list anyway for immediate review in the modal list
        this.preparedMonsters.push(entity);
        this.renderCurrentList();

        // Reset form partially
        nameInput.value = '';
        const container = document.getElementById('actions-list-container');
        if (container) {
            container.innerHTML = "";
            this.addActionRow();
        }
    },

    async showMonsterSelection() {
        const systemId = window.StageModule?.activeSession?.systemId || 'dnd5e';
        const user = window.app?.user;

        try {
            const [sysMonsters, usrMonsters] = await Promise.all([
                getGlobalMonsters(systemId),
                user ? getUserMonsters(user.uid, user.email) : []
            ]);

            const allMonsters = [...sysMonsters, ...usrMonsters];

            const selectorHtml = `
                <div class="monster-selector-overlay">
                    <div class="monster-selector parchment-mini">
                        <div class="modal-header">
                            <h3>Escolha o Adversário</h3>
                            <button class="close-btn" id="close-monster-selector"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="monster-search">
                            <input type="text" id="monster-search-input" placeholder="Buscar criatura...">
                        </div>
                        <div class="monster-grid" id="monster-selection-grid">
                            ${allMonsters.map(m => `
                                <div class="monster-card-sml" onclick="CombatPrep.setupMonsterAddition(${JSON.stringify(m).replace(/"/g, '&quot;')})">
                                    <div class="monster-name">${m.name}</div>
                                    <div class="monster-meta">CA ${m.ac || m.stats?.ac || 10} | HP ${m.hp || m.stats?.hp || 10}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            const overlay = document.createElement('div');
            overlay.id = 'monster-selector-wrapper';
            overlay.innerHTML = selectorHtml;
            document.body.appendChild(overlay);

            document.getElementById('close-monster-selector').onclick = () => overlay.remove();

            // Search logic
            const searchInput = document.getElementById('monster-search-input');
            searchInput.oninput = (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.monster-card-sml').forEach(card => {
                    const name = card.querySelector('.monster-name').textContent.toLowerCase();
                    card.style.display = name.includes(term) ? 'block' : 'none';
                });
            };

        } catch (e) {
            console.error("Erro ao carregar monstros:", e);
        }
    },

    setupMonsterAddition(monster) {
        // Show quantity selector
        const qtyModal = `
            <div class="qty-selector-overlay">
                <div class="qty-selector parchment-mini">
                    <h3>Quantos <strong>${monster.name}</strong> deseja invocar?</h3>
                    <div class="qty-input-group">
                        <button onclick="document.getElementById('monster-qty').value = Math.max(1, parseInt(document.getElementById('monster-qty').value)-1)">-</button>
                        <input type="number" id="monster-qty" value="1" min="1" max="20">
                        <button onclick="document.getElementById('monster-qty').value = parseInt(document.getElementById('monster-qty').value)+1">+</button>
                    </div>
                    <div class="modal-actions-centered">
                        <button class="medieval-btn gold-btn" id="confirm-qty">CONFIRMAR</button>
                        <button class="medieval-btn secondary" id="cancel-qty">CANCELAR</button>
                    </div>
                </div>
            </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.id = 'qty-selector-wrapper';
        wrapper.innerHTML = qtyModal;
        document.body.appendChild(wrapper);

        document.getElementById('confirm-qty').onclick = () => {
            const qty = parseInt(document.getElementById('monster-qty').value);
            this.addMonstersToList(monster, qty);
            wrapper.remove();
            const selector = document.getElementById('monster-selector-wrapper');
            if (selector) selector.remove();
        };

        document.getElementById('cancel-qty').onclick = () => wrapper.remove();
    },

    addMonstersToList(monster, qty) {
        // Grouping logic: If the monster already exists in the list (same ID or name), just update quantity
        const existing = this.preparedMonsters.find(m => (m.id === monster.id || m.name === monster.name));
        if (existing) {
            existing.quantity += qty;
        } else {
            this.preparedMonsters.push({
                ...monster,
                id: monster.id || `m_${Date.now()}`,
                quantity: qty,
                maxHp: monster.hp || monster.stats?.hp || 30
            });
        }
        this.renderCurrentList();
    },

    renderCurrentList() {
        const listContainer = document.getElementById('prep-monster-list');
        if (!listContainer) return;

        if (this.preparedMonsters.length === 0) {
            listContainer.innerHTML = '<p class="empty-msg-thematic">Nenhuma alma manifestada na forja ainda...</p>';
            const startBtn = document.getElementById('btn-confirm-start-combat');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.classList.add('disabled');
            }
            return;
        }

        listContainer.innerHTML = this.preparedMonsters.map((m) => `
            <div class="monster-card-prep">
                <div class="card-delete" onclick="CombatPrep.removeMonster('${m.id}')">
                    <i class="fas fa-trash-alt"></i>
                </div>
                <div class="card-header">
                    <h4>${m.name}</h4>
                    <span class="card-meta">CA ${m.ac || 10} | HP ${m.hp || 30}</span>
                </div>
                ${m.actions && Array.isArray(m.actions) && m.actions.length > 0 ? `
                    <div class="card-actions-preview">
                        ${m.actions.map(a => `<span class="action-tag-mini" title="${a.desc || ''}">${a.name}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="card-qty-control">
                    <button class="qty-btn" onclick="CombatPrep.updateQty('${m.id}', -1)">-</button>
                    <span class="qty-display">${m.quantity}</span>
                    <button class="qty-btn" onclick="CombatPrep.updateQty('${m.id}', 1)">+</button>
                </div>
            </div>
        `).join('');

        const startBtn = document.getElementById('btn-confirm-start-combat');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
        }
    },

    updateQty(id, delta) {
        const m = this.preparedMonsters.find(item => item.id === id);
        if (m) {
            m.quantity = Math.max(1, m.quantity + delta);
            this.renderCurrentList();
        }
    },

    removeMonster(id) {
        this.preparedMonsters = this.preparedMonsters.filter(m => m.id !== id);
        this.renderCurrentList();
    },

    async suggestMonstersAI() {
        if (window.StageModule?.showMysticAlert) {
            window.StageModule.showMysticAlert("Invocando o Oráculo para sugestões...", "Visão Profética");
        }

        try {
            const { default: CombatOracle } = await import('./combat-oracle.js');
            const playersCount = (window.StageModule?.participantsNames?.length) || 1;
            const avgLevel = 1; // Placeholder, fetch if possible

            const monsters = await CombatOracle.createContextualMonsters(
                window.StageModule.activeSession,
                playersCount,
                avgLevel
            );

            if (monsters && monsters.length > 0) {
                monsters.forEach(m => this.addMonstersToList(m, 1));
                this.renderCurrentList();
            }
        } catch (e) {
            console.error("Erro na sugestão AI:", e);
        }
    },

    async executeStartCombat() {
        if (this.preparedMonsters.length === 0) return;

        try {
            // Expand quantities into individual monsters
            const expandedMonsters = [];
            this.preparedMonsters.forEach(m => {
                const qty = m.quantity || 1;
                for (let i = 1; i <= qty; i++) {
                    const suffix = qty > 1 ? ` ${i}` : "";
                    expandedMonsters.push({
                        ...m,
                        name: `${m.name}${suffix}`,
                        id: `${m.id}_${i}`
                    });
                }
            });

            // Update session data via Engine or directly
            const sessionRef = doc(db, "sessoes", this.sessionId);
            await updateDoc(sessionRef, {
                linked_monsters: expandedMonsters,
                combatActive: true
            });

            // Re-fetch session to ensure Engine gets latest monsters
            const updatedSnap = await window.StageModule.activeSession; // Use cached or re-fetch

            // Start Combat via Engine with the SPECIFIC expanded monsters to avoid data race
            const combatState = await CombatEngine.initCombat(this.sessionId, window.StageModule.activeSession, expandedMonsters);

            // Render UI
            CombatUI.renderCombatPanel(combatState);

            // Close Prep Modal
            const modal = document.getElementById('combat-prep-modal');
            if (modal) modal.remove();

            // Clear state
            this.preparedMonsters = [];

        } catch (e) {
            console.error("Erro ao iniciar combate:", e);
            alert("Falha ao iniciar combate: " + e.message);
        }
    }
};

window.CombatPrep = CombatPrep;
export default CombatPrep;
