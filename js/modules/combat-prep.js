/**
 * Combat Prep Module — Convocador Unificado
 * Busca entidades do banco central (NPCs, Monstros do Usuário, Bestiário)
 * e permite criação rápida com persistência no Firestore.
 */

import { db } from "../auth.js";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAllEntitiesForSelection, createLiteEntity } from "../data.js";
import CombatEngine from "./combat-engine.js";
import CombatUI from "./combat-ui.js";
import { logger } from "../logger.js";
import { escapeHTML } from "./utils.js";

const TAB_CONFIG = {
    monstros: { label: 'Monstros', icon: 'fa-dragon', key: 'monstros' },
    npcs: { label: 'NPCs', icon: 'fa-users', key: 'npcs' }
};

const CombatPrep = {
    preparedMonsters: [],
    sessionId: null,
    allEntities: null,
    activeTab: 'monstros',
    creationMode: false,

    async openPrepModal(mode = 'combat') {
        logger.info(`⚔️ CombatPrep: Abrindo modal em modo [${mode}]...`);
        this.sessionId = window.StageModule?.sessionId;
        this.creationMode = false;
        this.activeTab = 'bestiary';
        await this.renderMainModal(mode);
    },

    async renderMainModal(mode = 'combat') {
        let modal = document.getElementById('combat-prep-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'combat-prep-modal';
        modal.className = 'modal-stage';

        const isNPCMode = mode === 'npc';
        const titleText = isNPCMode ? "Convocar Aliados & NPCs" : "Convocar para o Campo de Batalha";

        modal.innerHTML = `
            <div class="modal-stage-content combat-prep-window premium-forge summoner-unified">
                <div class="forge-header">
                    <h2 class="medieval-title-gold"><i class="fas fa-dungeon"></i> ${titleText}</h2>
                </div>

                <div class="summoner-grid">
                    <!-- Coluna Esquerda: Busca & Seleção -->
                    <div class="summoner-column search-side">
                        <div class="summoner-tabs" id="summoner-tabs">
                            ${Object.entries(TAB_CONFIG).map(([key, cfg]) => `
                                <button class="summoner-tab ${key === this.activeTab ? 'active' : ''}" data-tab="${key}">
                                    <i class="fas ${cfg.icon}"></i> ${cfg.label}
                                </button>
                            `).join('')}
                        </div>

                        <div class="summoner-search-bar">
                            <i class="fas fa-search"></i>
                            <input type="text" id="summoner-search-input" placeholder="Buscar por nome...">
                        </div>

                        <div class="summoner-entity-list" id="summoner-entity-list">
                            <div class="summoner-loading">
                                <i class="fas fa-spinner fa-spin"></i> Consultando os grimórios...
                            </div>
                        </div>

                        <div class="summoner-create-bar">
                            <button class="medieval-btn small purple-glow-btn" id="btn-toggle-creation">
                                <i class="fas fa-plus-circle"></i> Criar Nova Entidade
                            </button>
                        </div>

                        <!-- Formulário de Criação Rápida (inicialmente oculto) -->
                        <div class="summoner-creation-form hidden" id="summoner-creation-form">
                            <div class="creation-form-header">
                                <h4><i class="fas fa-hammer"></i> Forja Rápida</h4>
                                <button class="close-btn-mini" id="btn-close-creation">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="creation-fields">
                                <div class="field-group">
                                    <label class="mystic-label">Nome</label>
                                    <input type="text" id="create-name" class="medieval-input-v2" placeholder="Ex: Capitão da Guarda">
                                </div>
                                <div class="stats-row">
                                    <div class="field-group small">
                                        <label class="mystic-label">CA</label>
                                        <input type="number" id="create-ac" class="medieval-input-v2" value="10">
                                    </div>
                                    <div class="field-group small">
                                        <label class="mystic-label">HP</label>
                                        <input type="number" id="create-hp" class="medieval-input-v2" value="30">
                                    </div>
                                    <div class="field-group small">
                                        <label class="mystic-label">Ini</label>
                                        <input type="number" id="create-init" class="medieval-input-v2" value="0">
                                    </div>
                                </div>
                                <div class="field-group">
                                    <label class="mystic-label">Ações</label>
                                    <div id="create-actions-list" class="structured-actions-list"></div>
                                    <button class="medieval-btn small add-action-row-btn" id="btn-create-add-action">
                                        <i class="fas fa-plus-circle"></i> Adicionar Ação
                                    </button>
                                </div>
                                <div class="stats-row">
                                    <div class="field-group">
                                        <label class="mystic-label">Tipo</label>
                                        <select id="create-entity-type" class="medieval-input-v2">
                                            <option value="monster" ${!isNPCMode ? 'selected' : ''}>Monstro</option>
                                            <option value="npc" ${isNPCMode ? 'selected' : ''}>NPC</option>
                                        </select>
                                    </div>
                                    <div class="field-group" id="disposition-group" style="${isNPCMode ? '' : 'display:none'}">
                                        <label class="mystic-label">Disposição</label>
                                        <select id="create-disposition" class="medieval-input-v2">
                                            <option value="ally">Aliado</option>
                                            <option value="villain">Vilão</option>
                                            <option value="neutral">Neutro</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="forge-actions creation-actions">
                                    <button class="medieval-btn purple-glow-btn" id="btn-magic-write-create">
                                        <i class="fas fa-wand-magic-sparkles"></i> Escrever com Magia
                                    </button>
                                    <button class="medieval-btn evoke-btn-gold" id="btn-create-entity">
                                        <i class="fas fa-scroll"></i> CRIAR & ADICIONAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Coluna Direita: Arena / Staging -->
                    <div class="summoner-column arena-side">
                        <div class="ready-entities-container">
                            <h3 class="side-title"><i class="fas fa-chess"></i> Arena de Combate</h3>
                            <div class="forge-list-scrollable" id="prep-monster-list">
                                <p class="empty-msg-thematic">Nenhuma entidade convocada para a arena ainda...</p>
                            </div>
                        </div>
                    </div>
                </div>

                ${!isNPCMode ? `
                <div class="forge-footer-action">
                    <button class="medieval-btn large cancel-summon-btn" id="btn-cancel-summon">
                        <i class="fas fa-times"></i> CANCELAR
                    </button>
                    <button class="medieval-btn large start-battle-btn disabled" id="btn-confirm-start-combat" disabled>
                        <i class="fas fa-khanda"></i> INICIAR COMBATE
                    </button>
                </div>
                ` : `
                <div class="forge-footer-action">
                    <button class="medieval-btn large cancel-summon-btn" id="btn-cancel-summon">
                        <i class="fas fa-times"></i> CANCELAR
                    </button>
                    <button class="medieval-btn large finish-npc-btn" id="btn-finish-staging">
                        <i class="fas fa-check-double"></i> CONCLUIR CONVOCAÇÃO
                    </button>
                </div>
                `}
            </div>
        `;

        document.body.appendChild(modal);
        this.bindPrepEvents(mode);
        this.renderCurrentList();
        await this.loadEntities();
    },

    bindPrepEvents(mode) {
        // Cancel button (sole exit point)
        document.getElementById('btn-cancel-summon')?.addEventListener('click', () => {
            this.preparedMonsters = [];
            document.getElementById('combat-prep-modal')?.remove();
        });

        // Tab switching
        document.getElementById('summoner-tabs')?.addEventListener('click', (e) => {
            const tab = e.target.closest('.summoner-tab');
            if (!tab) return;
            this.activeTab = tab.dataset.tab;
            document.querySelectorAll('.summoner-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.renderEntityList();
        });

        // Search
        document.getElementById('summoner-search-input')?.addEventListener('input', (e) => {
            this.renderEntityList(e.target.value.toLowerCase());
        });

        // Toggle creation form
        document.getElementById('btn-toggle-creation')?.addEventListener('click', () => {
            this.toggleCreationForm(true);
        });
        document.getElementById('btn-close-creation')?.addEventListener('click', () => {
            this.toggleCreationForm(false);
        });

        // Entity type toggle — show/hide disposition
        document.getElementById('create-entity-type')?.addEventListener('change', (e) => {
            const dispGroup = document.getElementById('disposition-group');
            if (dispGroup) {
                dispGroup.style.display = e.target.value === 'npc' ? '' : 'none';
            }
        });

        // Creation form events
        document.getElementById('btn-create-add-action')?.addEventListener('click', () => {
            this.addActionRow('create-actions-list');
        });
        document.getElementById('btn-create-entity')?.addEventListener('click', () => this.createAndAddEntity());
        document.getElementById('btn-magic-write-create')?.addEventListener('click', () => this.magicWrite());

        // Start combat
        const startBtn = document.getElementById('btn-confirm-start-combat');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.executeStartCombat());
        }

        // Finish staging (NPC mode)
        const finishBtn = document.getElementById('btn-finish-staging');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => this.finishStaging(mode));
        }

        // Add initial action row
        this.addActionRow('create-actions-list');
    },

    toggleCreationForm(show) {
        const form = document.getElementById('summoner-creation-form');
        const listArea = document.getElementById('summoner-entity-list');
        if (!form) return;

        if (show) {
            form.classList.remove('hidden');
            listArea?.classList.add('hidden');
            this.creationMode = true;
        } else {
            form.classList.add('hidden');
            listArea?.classList.remove('hidden');
            this.creationMode = false;
        }
    },

    async loadEntities() {
        const user = window.StageModule?.user || window.app?.user;
        const systemId = window.StageModule?.activeSession?.systemId || 'dnd5e';

        if (!user) {
            logger.warn("CombatPrep: Usuário não encontrado para buscar entidades.");
            return;
        }

        try {
            this.allEntities = await getAllEntitiesForSelection(user.uid, user.email, systemId);
            this.renderEntityList();
        } catch (err) {
            logger.error("CombatPrep: Erro ao carregar entidades:", err);
            const listContainer = document.getElementById('summoner-entity-list');
            if (listContainer) {
                listContainer.innerHTML = `<p class="empty-msg-thematic">Erro ao consultar os grimórios. Tente novamente.</p>`;
            }
        }
    },

    renderEntityList(searchTerm = '') {
        const listContainer = document.getElementById('summoner-entity-list');
        if (!listContainer || !this.allEntities) return;

        const tabKey = TAB_CONFIG[this.activeTab]?.key;
        const entities = this.allEntities[tabKey] || [];

        const filtered = searchTerm
            ? entities.filter(e => e.name.toLowerCase().includes(searchTerm))
            : entities;

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <p class="empty-msg-thematic">
                    ${searchTerm ? 'Nenhuma entidade encontrada para essa busca.' : 'Nenhuma entidade registrada nesta categoria.'}
                </p>
            `;
            return;
        }

        const isNpcTab = this.activeTab === 'npcs';

        listContainer.innerHTML = filtered.map(entity => `
            <div class="summoner-entity-card" data-entity-id="${entity.id}" data-entity-source="${entity._source}">
                <div class="entity-card-info">
                    <span class="entity-card-name">${escapeHTML(entity.name)}</span>
                    <span class="entity-card-meta">
                        <i class="fas fa-shield-alt"></i> ${entity.ac}
                        <i class="fas fa-heart" style="margin-left:6px;"></i> ${entity.hp}
                    </span>
                </div>
                <div class="entity-card-actions">
                    ${isNpcTab ? `
                        <select class="disposition-select-mini" data-disp-for="${entity.id}">
                            <option value="ally">Aliado</option>
                            <option value="villain">Vilão</option>
                            <option value="neutral">Neutro</option>
                        </select>
                    ` : ''}
                    <button class="medieval-btn small evoke-btn-gold entity-add-btn" title="Convocar para a arena">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Bind click on add buttons
        listContainer.querySelectorAll('.entity-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.summoner-entity-card');
                const entityId = card.dataset.entityId;
                const source = card.dataset.entitySource;
                const dispSelect = card.querySelector('.disposition-select-mini');
                const disposition = dispSelect ? dispSelect.value : 'enemy';
                this.addEntityFromList(entityId, source, disposition);
            });
        });
    },

    addEntityFromList(entityId, source, disposition = 'enemy') {
        const tabKey = TAB_CONFIG[this.activeTab]?.key;
        const entity = (this.allEntities[tabKey] || []).find(e => e.id === entityId);
        if (!entity) return;

        this.addMonstersToList({ ...entity, disposition }, 1);
    },

    addActionRow(containerId, data = { name: '', damage: '', range: '', desc: '' }) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const rowId = `action-row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const row = document.createElement('div');
        row.className = 'structured-action-row';
        row.id = rowId;
        row.innerHTML = `
            <div class="action-row-main">
                <input type="text" class="act-name medieval-input-v2" placeholder="Nome" value="${escapeHTML(data.name)}">
                <input type="text" class="act-damage medieval-input-v2" placeholder="Dano" value="${escapeHTML(data.damage)}">
                <input type="text" class="act-range medieval-input-v2" placeholder="Alcance" value="${escapeHTML(data.range)}">
                <button class="remove-row-btn" title="Remover Ação">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <textarea class="act-desc medieval-textarea-v2" placeholder="Descrição">${escapeHTML(data.desc)}</textarea>
        `;

        row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
        container.appendChild(row);
    },

    async magicWrite() {
        const name = document.getElementById('create-name')?.value || '';
        const ac = document.getElementById('create-ac')?.value || '';
        const hp = document.getElementById('create-hp')?.value || '';

        const actionRows = document.querySelectorAll('#create-actions-list .structured-action-row');
        let actionsContext = "";
        actionRows.forEach(row => {
            const aName = row.querySelector('.act-name')?.value || '';
            const aDesc = row.querySelector('.act-desc')?.value || '';
            if (aName) actionsContext += `${aName}: ${aDesc}; `;
        });

        if (!name && !actionsContext) {
            alert("Forneça ao menos um nome ou descrição das ações para a magia fluir!");
            return;
        }

        const btn = document.getElementById('btn-magic-write-create');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin fa-fw"></i> Tecendo...`;
        btn.disabled = true;

        try {
            const prompt = `Nome: ${name || 'Escolha um nome épico'}
            CA: ${ac}
            HP: ${hp}
            Contexto/Ações: ${actionsContext || 'Gere ações temáticas'}
            
            Retorne APENAS um JSON no formato:
            {
              "name": "Nome Épico",
              "ac": número,
              "hp": número,
              "init": número de bônus,
              "actions": [
                { "name": "Nome do Ataque", "damage": "1d8+2", "range": "1,5m", "desc": "Descrição curta" }
              ]
            }`;

            const systemInstruction = `Você é o Oráculo Arcano, um criador de criaturas e NPCs para D&D 5e.
            Transforme dados básicos em entidades detalhadas e balanceadas. Retorne APENAS JSON válido, sem markdown.`;

            const { callProxy } = await import('../ai.js');
            const data = await callProxy({ message: prompt, systemInstruction, history: [] });
            const responseText = data.response || '';

            const jsonStr = responseText.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            const nameInput = document.getElementById('create-name');
            const acInput = document.getElementById('create-ac');
            const hpInput = document.getElementById('create-hp');
            const initInput = document.getElementById('create-init');

            if (nameInput) nameInput.value = parsed.name || name;
            if (acInput) acInput.value = parsed.ac || ac;
            if (hpInput) hpInput.value = parsed.hp || hp;
            if (initInput) initInput.value = parsed.init || 0;

            if (parsed.actions && Array.isArray(parsed.actions)) {
                const container = document.getElementById('create-actions-list');
                if (container) {
                    container.innerHTML = "";
                    parsed.actions.forEach(act => this.addActionRow('create-actions-list', act));
                }
            }
        } catch (e) {
            console.error("Erro na Magia de Escrita:", e);
            logger.error("❌ Magia de Escrita falhou:", e.message);
            alert(`A magia falhou: ${e.message || 'Tente novamente.'}`);
        } finally {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    },

    async createAndAddEntity() {
        const name = document.getElementById('create-name')?.value?.trim();
        const ac = parseInt(document.getElementById('create-ac')?.value) || 10;
        const hp = parseInt(document.getElementById('create-hp')?.value) || 30;
        const initBonus = parseInt(document.getElementById('create-init')?.value) || 0;
        const entityType = document.getElementById('create-entity-type')?.value || 'monster';
        const disposition = entityType === 'npc'
            ? (document.getElementById('create-disposition')?.value || 'ally')
            : 'enemy';

        const actions = [];
        document.querySelectorAll('#create-actions-list .structured-action-row').forEach(row => {
            const aName = row.querySelector('.act-name')?.value;
            const aDmg = row.querySelector('.act-damage')?.value;
            const aRange = row.querySelector('.act-range')?.value;
            const aDesc = row.querySelector('.act-desc')?.value;
            if (aName) {
                actions.push({ name: aName, damage: aDmg || '', range: aRange || '', desc: aDesc || '' });
            }
        });

        if (!name) {
            alert("Dê um nome à sua criação!");
            return;
        }

        const user = window.StageModule?.user || window.app?.user;
        if (!user) {
            alert("Sessão de usuário expirada.");
            return;
        }

        const btn = document.getElementById('btn-create-entity');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Salvando...`;
        btn.disabled = true;

        try {
            // Persistir no Firestore via createLiteEntity
            const { id, entity } = await createLiteEntity(entityType, user.uid, user.email, {
                name, ac, hp, initBonus, actions, disposition
            });

            logger.info(`✅ Entidade criada no banco: ${name} (${entityType}, ${disposition}) — ID: ${id}`);

            // Adicionar ao staging com formato de combate
            const combatEntity = {
                id,
                name,
                ac,
                hp,
                maxHp: hp,
                initBonus,
                actions,
                quantity: 1,
                type: entityType,
                disposition,
                sourceId: id,
                sourceType: entityType
            };

            this.addMonstersToList(combatEntity, 1);

            // Reset creation form
            document.getElementById('create-name').value = '';
            const actionsList = document.getElementById('create-actions-list');
            if (actionsList) {
                actionsList.innerHTML = '';
                this.addActionRow('create-actions-list');
            }

            // Recarregar lista de entidades para refletir a nova
            await this.loadEntities();
            this.toggleCreationForm(false);

        } catch (err) {
            console.error("Erro ao criar entidade:", err);
            alert("Falha ao criar entidade: " + err.message);
        } finally {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    },

    addMonstersToList(monster, qty) {
        const existing = this.preparedMonsters.find(m => (m.id === monster.id || m.name === monster.name));
        if (existing) {
            existing.quantity += qty;
        } else {
            this.preparedMonsters.push({
                ...monster,
                instanceId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                id: monster.id || `m_${Date.now()}`,
                quantity: qty,
                maxHp: monster.hp || monster.maxHp || 30
            });
        }
        this.renderCurrentList();
    },

    renderCurrentList() {
        const listContainer = document.getElementById('prep-monster-list');
        if (!listContainer) return;

        if (this.preparedMonsters.length === 0) {
            listContainer.innerHTML = '<p class="empty-msg-thematic">Nenhuma entidade convocada para a arena ainda...</p>';
            const startBtn = document.getElementById('btn-confirm-start-combat');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.classList.add('disabled');
            }
            return;
        }

        const dispositionLabels = { ally: 'Aliado', villain: 'Vilão', neutral: 'Neutro', enemy: 'Inimigo' };

        listContainer.innerHTML = this.preparedMonsters.map((m) => `
            <div class="monster-card-prep">
                <div class="card-header-row">
                    <div class="card-header">
                        <h4>${escapeHTML(m.name)}</h4>
                        <span class="card-meta">CA ${m.ac || 10} | HP ${m.hp || 30}</span>
                        ${m.type === 'npc' ? `<span class="entity-type-badge npc-badge">${dispositionLabels[m.disposition] || 'NPC'}</span>` : ''}
                    </div>
                    <button class="card-delete-inline" data-remove-id="${m.instanceId}" title="Remover">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                ${m.actions && Array.isArray(m.actions) && m.actions.length > 0 ? `
                    <div class="card-actions-preview">
                        ${m.actions.map(a => `<span class="action-tag-mini" title="${escapeHTML(a.desc || '')}">${escapeHTML(a.name)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="card-qty-control">
                    <button class="qty-btn" data-qty-id="${m.instanceId}" data-qty-delta="-1">-</button>
                    <span class="qty-display">${m.quantity}</span>
                    <button class="qty-btn" data-qty-id="${m.instanceId}" data-qty-delta="1">+</button>
                </div>
            </div>
        `).join('');

        // Bind events via delegation
        listContainer.querySelectorAll('.card-delete-inline').forEach(btn => {
            btn.addEventListener('click', () => this.removeMonster(btn.dataset.removeId));
        });
        listContainer.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => this.updateQty(btn.dataset.qtyId, parseInt(btn.dataset.qtyDelta)));
        });

        const startBtn = document.getElementById('btn-confirm-start-combat');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
        }
    },

    updateQty(instanceId, delta) {
        const m = this.preparedMonsters.find(item => item.instanceId === instanceId);
        if (m) {
            m.quantity = Math.max(1, m.quantity + delta);
            this.renderCurrentList();
        }
    },

    removeMonster(instanceId) {
        this.preparedMonsters = this.preparedMonsters.filter(m => m.instanceId !== instanceId);
        this.renderCurrentList();
    },

    async finishStaging(mode) {
        if (this.preparedMonsters.length === 0) {
            alert('Nenhuma entidade na arena para convocar.');
            return;
        }

        try {
            if (!this.sessionId) {
                alert('Sessão não encontrada.');
                return;
            }

            const sessionRef = doc(db, "sessoes", this.sessionId);
            const entitiesToAdd = [];

            this.preparedMonsters.forEach(m => {
                const qty = m.quantity || 1;
                for (let i = 1; i <= qty; i++) {
                    const suffix = qty > 1 ? ` ${i}` : '';
                    entitiesToAdd.push({
                        id: m.id,
                        instanceId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${i}`,
                        name: `${m.name}${suffix}`,
                        ac: m.ac || 10,
                        hp: m.hp || 30,
                        maxHp: m.maxHp || m.hp || 30,
                        initBonus: m.initBonus || 0,
                        actions: m.actions || [],
                        type: m.type || 'npc',
                        disposition: m.disposition || 'ally',
                        sourceId: m.sourceId || m.id
                    });
                }
            });

            // Separar por disposição
            const allies = entitiesToAdd.filter(e => e.disposition === 'ally' || e.disposition === 'neutral');
            const enemies = entitiesToAdd.filter(e => e.disposition === 'villain' || e.disposition === 'enemy');

            const updatePayload = {};
            if (allies.length > 0) {
                for (const ally of allies) {
                    await updateDoc(sessionRef, { allies: arrayUnion(ally) });
                }
            }
            if (enemies.length > 0) {
                for (const enemy of enemies) {
                    await updateDoc(sessionRef, { linked_monsters: arrayUnion(enemy) });
                }
            }

            logger.info(`✅ Convocação concluída: ${allies.length} aliados, ${enemies.length} adversários.`);

            const modal = document.getElementById('combat-prep-modal');
            if (modal) modal.remove();
            this.preparedMonsters = [];

            // Notificar o StageModule para atualizar a sidebar
            if (window.StageModule?.refreshSession) {
                await window.StageModule.refreshSession();
            }
        } catch (err) {
            console.error('Erro ao concluir convocação:', err);
            alert('Falha ao salvar entidades na sessão: ' + err.message);
        }
    },

    async executeStartCombat() {
        if (this.preparedMonsters.length === 0) return;

        try {
            const expandedMonsters = [];
            this.preparedMonsters.forEach(m => {
                const qty = m.quantity || 1;
                for (let i = 1; i <= qty; i++) {
                    const suffix = qty > 1 ? ` ${i}` : "";
                    expandedMonsters.push({
                        ...m,
                        name: `${m.name}${suffix}`,
                        id: `${m.id}_${i}`,
                        sourceId: m.sourceId || m.id
                    });
                }
            });

            const sessionRef = doc(db, "sessoes", this.sessionId);
            await updateDoc(sessionRef, {
                linked_monsters: expandedMonsters,
                combatActive: true
            });

            const combatState = await CombatEngine.initCombat(this.sessionId, window.StageModule.activeSession, expandedMonsters);
            CombatUI.renderCombatPanel(combatState);

            const modal = document.getElementById('combat-prep-modal');
            if (modal) modal.remove();

            this.preparedMonsters = [];

        } catch (e) {
            console.error("Erro ao iniciar combate:", e);
            alert("Falha ao iniciar combate: " + e.message);
        }
    }
};

window.CombatPrep = CombatPrep;
export default CombatPrep;
