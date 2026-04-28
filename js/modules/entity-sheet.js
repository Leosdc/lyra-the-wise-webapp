/**
 * Entity Sheet Module
 * Shared module for rendering creature sheets (Monsters, Villains, NPCs)
 * Reuses the character sheet structure and aesthetics.
 */

import { saveEntity, getEmptyEntity, getEntityById, deleteEntity } from '../data.js';
import { auth } from '../auth.js';
import { escapeHTML } from './utils.js';

const ENTITY_LABELS = {
    monster: { title: 'Criatura', icon: 'fa-dragon', singular: 'Monstro', color: '#ef4444' },

    npc: { title: 'NPC', icon: 'fa-users-gear', singular: 'NPC', color: '#3b82f6' }
};

const CREATURE_TYPES = [
    'Aberração', 'Besta', 'Celestial', 'Constructo', 'Dragão', 'Elemental',
    'Fada', 'Ínfero', 'Gigante', 'Humanoide', 'Monstruosidade', 'Gosma',
    'Planta', 'Morto-Vivo'
];

const CREATURE_SIZES = [
    { value: 'Tiny', label: 'Miúdo (Tiny)' },
    { value: 'Small', label: 'Pequeno (Small)' },
    { value: 'Medium', label: 'Médio (Medium)' },
    { value: 'Large', label: 'Grande (Large)' },
    { value: 'Huge', label: 'Enorme (Huge)' },
    { value: 'Gargantuan', label: 'Imenso (Gargantuan)' }
];

export const EntitySheetModule = {
    currentEntity: null,
    currentEntityType: null,
    isEditing: false,

    init() {
        this.injectHTML();
        this.bindEvents();
    },

    injectHTML() {
        if (document.getElementById('entity-sheet-modal')) return;

        const html = `
            <div id="entity-sheet-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal entity-sheet-modal-content" style="background: var(--parchment);">
                    <button class="close-modal" id="close-entity-sheet" style="z-index: 100; top: 20px; right: 20px;"><i class="fas fa-times"></i></button>
                    <div id="entity-sheet-container" class="sheet-container entity-sheet-active">
                        <div class="sheet-header">
                            <div class="header-token-section">
                                <div class="char-token-wrapper">
                                    <img id="entity-token" src="assets/tokens/lyra.png" alt="Token" class="char-token">
                                    <input type="file" id="entity-token-upload" accept="image/*" class="hidden">
                                    <label for="entity-token-upload" id="entity-token-upload-btn" class="token-upload-overlay">
                                        <i class="fas fa-camera"></i>
                                    </label>
                                </div>
                            </div>
                            <div class="header-info-section">
                                <div class="header-row-top">
                                    <h2 id="entity-sheet-name" class="editable">Nova Entidade</h2>
                                </div>
                                <div class="header-row-bottom" style="align-items: flex-start;">
                                    <div class="header-field-group">
                                        <label>Alinhamento</label>
                                        <span id="entity-alignment-display"></span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                        <div class="header-field-group" style="width: 100%; margin: 0;">
                                            <label>Raça / Tipo</label>
                                            <span id="entity-race-display"></span>
                                        </div>
                                        <div class="header-field-group" style="width: 100%; margin: 0;">
                                            <label>Tamanho</label>
                                            <span id="entity-size-display"></span>
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                        <div class="header-field-group" style="width: 100%; margin: 0;">
                                            <label>Classe</label>
                                            <span id="entity-class-display"></span>
                                        </div>
                                        <div class="header-field-group" style="width: 100%; margin: 0;">
                                            <label>ND (Nível de Desafio)</label>
                                            <span id="entity-cr-display"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="header-meta-section">
                                <div class="level-display">
                                    <label>Nível</label>
                                    <span id="entity-level-val" class="level-value">1</span>
                                </div>
                                <button id="save-entity-btn" class="medieval-btn small"><i class="fas fa-save"></i> Salvar</button>
                            </div>
                        </div>

                        <div class="sheet-tabs">
                            <button class="sheet-tab active" data-tab="entity-geral">Principal</button>
                            <button class="sheet-tab" data-tab="entity-combate">Combate</button>
                            <button class="sheet-tab" data-tab="entity-magia">Habilidades</button>
                            <button class="sheet-tab" data-tab="entity-inventario">Equipamento</button>
                            <button class="sheet-tab" data-tab="entity-historia">Lore</button>
                        </div>

                        <div class="sheet-content">
                            <!-- Aba Principal -->
                            <div id="entity-geral" class="sheet-section">
                                <div class="bio-grid">
                                    <div class="form-group"><label>Tipo de Criatura</label>
                                        <select id="entity-creature-type" class="medieval-select seamless" data-field="bio.creature_type">
                                            <option value="">Selecione...</option>
                                            ${CREATURE_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group"><label>Antecedente</label><input type="text" id="entity-background" class="medieval-input seamless" data-field="bio.background" placeholder="Antecedente"></div>
                                    <div class="form-group"><label>XP</label><input type="text" id="entity-xp" class="medieval-input seamless" data-field="bio.xp" placeholder="0"></div>
                                </div>

                                <div class="stats-main-grid">
                                    <div class="attributes-column">
                                        <div class="scores-grid" id="entity-scores"></div>
                                        <h4 class="section-title">Testes de Resistência</h4>
                                        <div class="saves-list" id="entity-saves"></div>
                                    </div>
                                    <div class="skills-column">
                                        <div class="top-vitals-row">
                                            <div class="vital-mini-box"><span>Proficiência</span><strong id="entity-prof"></strong></div>
                                            <div class="vital-mini-box"><span>Percepção Passiva</span><strong id="entity-passive-percep"></strong></div>
                                        </div>
                                        <h4 class="section-title">Perícias</h4>
                                        <div class="skills-list" id="entity-skills"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Aba Combate -->
                            <div id="entity-combate" class="sheet-section hidden">
                                <div class="combat-status-grid">
                                    <div class="vital-box large"><span>CA</span><input type="number" id="entity-ac" class="medieval-input seamless" data-field="stats.ac" value="10" style="text-align: center; font-size: 1.4rem; font-weight: bold;"></div>
                                    <div class="vital-box large"><span>Iniciativa</span><input type="number" id="entity-initiative" class="medieval-input seamless" data-field="stats.initiative" value="0" style="text-align: center; font-size: 1.4rem; font-weight: bold;"></div>
                                    <div class="vital-box large"><span>Velocidade</span><input type="text" id="entity-speed" class="medieval-input seamless" data-field="stats.speed" value="9m" style="text-align: center; font-size: 1.4rem; font-weight: bold;"></div>
                                    <div class="hp-container-main">
                                        <div class="hp-box-full">
                                            <span class="label">Pontos de Vida</span>
                                            <div class="hp-controls">
                                                <input type="number" id="entity-hp-curr" class="hp-input" data-field="stats.hp_current">
                                                <span class="sep">/</span>
                                                <input type="number" id="entity-hp-max" class="hp-input" data-field="stats.hp_max">
                                            </div>
                                        </div>
                                        <div class="hp-temp">
                                            <span>PV Temporários</span>
                                            <input type="number" id="entity-hp-temp" class="hp-input small" data-field="stats.hp_temp">
                                        </div>
                                    </div>
                                </div>
                                <div class="combat-details-grid">
                                    <div class="hit-dice-death-saves">
                                        <div class="hit-dice-block">
                                            <h4>Dados de Vida</h4>
                                            <div class="hit-dice-row">
                                                <input type="number" id="entity-hd-curr" data-field="stats.hit_dice_current" class="medieval-input" style="width: 60px; text-align: center;">
                                                <span> de </span>
                                                <input type="text" id="entity-hd-total" data-field="stats.hit_dice_total" class="medieval-input" style="width: 80px; text-align: center;" value="1d8">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="attacks-section">
                                        <h4 class="section-title">Ataques</h4>
                                        <div id="entity-attacks-body" class="attacks-list-v2"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Aba Habilidades/Magias -->
                            <div id="entity-magia" class="sheet-section hidden">
                                <div class="magic-header-stats">
                                    <div class="vital-box"><span>CD Salva.</span><strong id="entity-spell-dc">8</strong></div>
                                    <div class="vital-box"><span>Ataque Mág.</span><strong id="entity-spell-atk">0</strong></div>
                                </div>
                                <h4 class="section-title spellbook-title">Habilidades & Magias</h4>
                                <div id="entity-abilities-body" class="spells-list-v2">
                                    <p class="empty-hint" style="grid-column: 1/-1;">Nenhuma habilidade ou magia registrada. Adicione manualmente.</p>
                                </div>
                                <div style="margin-top: 10px; text-align: center;">
                                    <button id="entity-add-ability-btn" class="medieval-btn small dashed" style="width: 100%;"><i class="fas fa-plus"></i> Adicionar Habilidade</button>
                                </div>
                            </div>

                            <!-- Aba Equipamento -->
                            <div id="entity-inventario" class="sheet-section hidden">
                                <h4 class="section-title">Inventário</h4>
                                <div id="entity-inventory-body" class="spells-list-v2">
                                    <p class="empty-hint" style="grid-column: 1/-1;">Nenhum item equipado.</p>
                                </div>
                                <div style="margin-top: 10px; text-align: center;">
                                    <button id="entity-add-item-btn" class="medieval-btn small dashed" style="width: 100%;"><i class="fas fa-plus"></i> Adicionar Item</button>
                                </div>
                            </div>

                            <!-- Aba Lore -->
                            <div id="entity-historia" class="sheet-section hidden">
                                <div class="form-group"><label>Traços de Personalidade</label>
                                    <textarea class="medieval-textarea" data-field="story.traits" placeholder="Hábitos, maneirismos e virtudes dessa criatura..."></textarea>
                                </div>
                                <div class="form-row">
                                    <div class="form-group"><label>Motivações / Ideais</label>
                                        <textarea class="medieval-textarea" data-field="story.ideals" placeholder="O que move essa criatura..."></textarea>
                                    </div>
                                    <div class="form-group"><label>Vínculos</label>
                                        <textarea class="medieval-textarea" data-field="story.bonds" placeholder="Lealdades, alianças ou locais sagrados..."></textarea>
                                    </div>
                                </div>
                                <div class="form-group"><label>Fraquezas / Defeitos</label>
                                    <textarea class="medieval-textarea" data-field="story.flaws" placeholder="Vulnerabilidades emocionais ou físicas..."></textarea>
                                </div>
                                <div class="form-group"><label>Aparência</label>
                                    <textarea class="medieval-textarea" data-field="story.appearance" placeholder="Descrição visual completa..."></textarea>
                                </div>
                                <div class="form-group"><label>Lore / Notas do Mestre</label>
                                    <textarea class="medieval-textarea" data-field="story.notes" rows="6" placeholder="História, segredos, dicas de roleplay, AI prompts..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="entity-sheet-footer" style="padding: 1rem; text-align: center; display: flex; flex-direction: column; gap: 1rem; justify-content: center; align-items: center;">
                            <div id="entity-sheet-inspection-banner" class="hidden"></div>
                            <button id="entity-delete-btn" class="medieval-btn small secondary hidden"><i class="fas fa-trash"></i> Excluir</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    bindEvents() {
        // Close button
        document.getElementById('close-entity-sheet')?.addEventListener('click', () => {
            this.closeSheet();
        });

        // Tab switching
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('#entity-sheet-container .sheet-tab');
            if (!tab) return;
            const tabId = tab.dataset.tab;

            document.querySelectorAll('#entity-sheet-container .sheet-tab').forEach(t => t.classList.toggle('active', t === tab));
            document.querySelectorAll('#entity-sheet-container .sheet-section').forEach(s => {
                s.classList.toggle('hidden', s.id !== tabId);
            });

            // Auto-resize textareas in newly visible tab
            const activeSection = document.getElementById(tabId);
            activeSection?.querySelectorAll('textarea').forEach(ta => {
                ta.style.height = 'auto';
                ta.style.height = (ta.scrollHeight + 2) + 'px';
            });
        });

        // Save button
        document.getElementById('save-entity-btn')?.addEventListener('click', () => this.handleSave());

        // Delete button
        document.getElementById('entity-delete-btn')?.addEventListener('click', () => this.handleDelete());

        // Proficiency toggles (delegated)
        document.getElementById('entity-sheet-container')?.addEventListener('click', (e) => {
            const toggleWrapper = e.target.closest('.prof-toggle') || e.target.closest('.skill-item') || e.target.closest('.save-item');
            if (!toggleWrapper || !this.currentEntity) return;

            const toggle = toggleWrapper.classList.contains('prof-toggle') 
                           ? toggleWrapper 
                           : toggleWrapper.querySelector('.prof-toggle');

            if (!toggle) return;

            const type = toggle.dataset.type;
            const field = toggle.dataset.field;

            if (type === 'saves') {
                const saves = this.currentEntity.proficiencies_choice?.saves || [];
                const idx = saves.indexOf(field);
                if (idx === -1) saves.push(field);
                else saves.splice(idx, 1);
                if (!this.currentEntity.proficiencies_choice) this.currentEntity.proficiencies_choice = {};
                this.currentEntity.proficiencies_choice.saves = saves;
            } else if (type === 'skills') {
                const skills = this.currentEntity.proficiencies_choice?.skills || [];
                const idx = skills.indexOf(field);
                if (idx === -1) skills.push(field);
                else skills.splice(idx, 1);
                if (!this.currentEntity.proficiencies_choice) this.currentEntity.proficiencies_choice = {};
                this.currentEntity.proficiencies_choice.skills = skills;
            }

            this.populateSheet(this.currentEntity);
        });

        // Add attack button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#entity-add-attack-btn')) {
                if (!this.currentEntity) return;
                this.currentEntity = this.gatherEntityData();
                if (!this.currentEntity.combat) this.currentEntity.combat = {};
                if (!this.currentEntity.combat.attacks) this.currentEntity.combat.attacks = [];
                this.currentEntity.combat.attacks.push({ name: 'Novo Ataque', bonus: '+0', damage: '1d6', isCustom: true, isProf: false });
                this.populateSheet(this.currentEntity);
            }
        });

        // Add ability button
        document.getElementById('entity-add-ability-btn')?.addEventListener('click', () => {
            if (!this.currentEntity) return;
            this.currentEntity = this.gatherEntityData();
            if (!this.currentEntity.abilities) this.currentEntity.abilities = [];
            this.currentEntity.abilities.push({
                uid: `ability_${Date.now()}`,
                identity: { name: 'Nova Habilidade', origin: 'Custom_Attack', tags: [], source: {} },
                activation: { type: 'Action', cost: 1 },
                execution_mechanics: { damage: [], conditions: [], special_effects: [] },
                meta: { visibility: 'private', is_native: true }
            });
            this.renderAbilities();
        });

        // Add item button
        document.getElementById('entity-add-item-btn')?.addEventListener('click', () => {
            if (!this.currentEntity) return;
            this.currentEntity = this.gatherEntityData();
            if (!this.currentEntity.inventory) this.currentEntity.inventory = { coins: {}, items: [], encumbrance: {} };
            if (!this.currentEntity.inventory.items) this.currentEntity.inventory.items = [];
            this.currentEntity.inventory.items.push({ name: 'Novo Item', quantity: 1, weight: 0, description: '' });
            this.renderInventory();
        });
    },

    // --- Entry Points ---

    openNewEntity(entityType) {
        // Close any lingering modal-wrapper from system monster views etc.
        this._dismissMainModal();

        const entity = getEmptyEntity(entityType);
        this.currentEntityType = entityType;
        this.currentEntity = entity;
        this.isEditing = false;

        const labels = ENTITY_LABELS[entityType];
        this.populateSheet(entity);

        document.getElementById('entity-delete-btn')?.classList.add('hidden');
        document.getElementById('entity-sheet-modal')?.classList.remove('hidden');

        // Reset to first tab
        document.querySelectorAll('#entity-sheet-container .sheet-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
        document.querySelectorAll('#entity-sheet-container .sheet-section').forEach((s, i) => s.classList.toggle('hidden', i !== 0));
    },

    async openExistingEntity(entityType, id, source = 'personal') {
        // Close any lingering modal-wrapper from system monster views etc.
        this._dismissMainModal();

        const systemId = localStorage.getItem('lyra_current_system') || 'dnd5e';
        let entity = await getEntityById(entityType, id, systemId);
        
        if (!entity) {
            window.app?.showAlert?.('Entidade não encontrada nos registros.', 'Erro de Percaminho');
            return;
        }

        // Legacy JSON schema migration handling
        entity = this.migrateLegacyEntity(entity, entityType);

        this.currentEntityType = entityType;
        this.currentEntity = entity;
        this.isEditing = true;

        this.populateSheet(entity);

        const user = auth.currentUser;
        const isOwner = user && (entity.userId === user.uid || entity.isOwner);
        const isSystem = source === 'system' || (!entity.userId && !entity.uid);

        // UI Adjustments for System/Read-only entities
        const deleteBtn = document.getElementById('entity-delete-btn');
        const saveBtn = document.getElementById('save-entity-btn');
        const banner = document.getElementById('entity-sheet-inspection-banner');

        if (deleteBtn) deleteBtn.classList.toggle('hidden', !isOwner || isSystem);
        
        if (isSystem && !isOwner) {
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-scroll-old"></i> Incorporar';
                saveBtn.title = "Salvar uma cópia desta criatura em seus registros pessoais.";
            }
            if (banner) {
                banner.innerHTML = '<i class="fas fa-book-sparkles"></i> <strong>Bestiário do Sistema</strong>: Você está visualizando um registro sagrado. Clique em "Incorporar" para criar sua própria versão desta criatura.';
                banner.classList.add('system-banner');
                banner.classList.remove('hidden');
            }
        } else {
            if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
            if (banner) {
                banner.classList.add('hidden');
                banner.classList.remove('system-banner');
            }
        }

        document.getElementById('entity-sheet-modal')?.classList.remove('hidden');

        // Reset to first tab
        document.querySelectorAll('#entity-sheet-container .sheet-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
        document.querySelectorAll('#entity-sheet-container .sheet-section').forEach((s, i) => s.classList.toggle('hidden', i !== 0));
    },

    migrateLegacyEntity(entity, type) {
        // If entity already has the new core structures, just return
        if (entity.bio && entity.attributes && entity.stats) return entity;
        
        let migrated = getEmptyEntity(type);
        migrated.id = entity.id;
        migrated.userId = entity.userId;
        migrated.name = entity.name || entity.Name || "Criatura Desconhecida";
        
        // Handle old "secoes" system (Monster json)
        if (entity.secoes) {
            migrated.bio.cr = entity.secoes.ND || entity.cr || "0";
            migrated.bio.creature_type = entity.secoes.Tipo || entity.type || "";
            migrated.bio.size = entity.secoes.Tamanho || "Medium";
            migrated.bio.alignment = entity.secoes.Alinhamento || "Neutro";

            if (entity.secoes.Status) {
                migrated.stats.ac = parseInt(entity.secoes.Status.CA) || 10;
                migrated.stats.hp_max = parseInt(entity.secoes.Status.PV) || 10;
                migrated.stats.hp_current = migrated.stats.hp_max;
                migrated.stats.speed = entity.secoes.Status.Deslocamento || "9m";
            }
            if (entity.secoes.Atributos) {
                migrated.attributes.str = parseInt(entity.secoes.Atributos.Força) || 10;
                migrated.attributes.dex = parseInt(entity.secoes.Atributos.Destreza) || 10;
                migrated.attributes.con = parseInt(entity.secoes.Atributos.Constituição) || 10;
                migrated.attributes.int = parseInt(entity.secoes.Atributos.Inteligência) || 10;
                migrated.attributes.wis = parseInt(entity.secoes.Atributos.Sabedoria) || 10;
                migrated.attributes.cha = parseInt(entity.secoes.Atributos.Carisma) || 10;
            }
            // Keep traits and old actions in story as notes for now, or could map them to abilities
            migrated.story.notes = [
                entity.secoes.Pericias ? `Perícias: ${entity.secoes.Pericias}` : "",
                entity.secoes.Resistencias ? `Resistências: ${entity.secoes.Resistencias}` : "",
                entity.secoes.Sentidos ? `Sentidos: ${entity.secoes.Sentidos}` : "",
                entity.secoes.Idiomas ? `Idiomas: ${entity.secoes.Idiomas}` : "",
                entity.desc || ""
            ].filter(Boolean).join("\\n\\n");
            
            // Map actions to abilities if possible
            if (entity.secoes.Acoes && Array.isArray(entity.secoes.Acoes)) {
                entity.secoes.Acoes.forEach((acao, i) => {
                    migrated.abilities.push({
                         uid: `legacy_atk_${i}`,
                         identity: { name: acao.nome, origin: 'Custom_Attack', source: {} },
                         activation: { type: 'Action', cost: 1 },
                         description: acao.descricao || ""
                    });
                });
            }
        } else {
            // Flat old object?
            if (entity.cr) migrated.bio.cr = entity.cr;
            if (entity.ac) migrated.stats.ac = parseInt(entity.ac) || 10;
            if (entity.hp) {
               migrated.stats.hp_max = parseInt(entity.hp) || 10;
               migrated.stats.hp_current = migrated.stats.hp_max;
            }
            if (entity.description) migrated.story.notes = entity.description;
        }

        return migrated;
    },

    openEntityFromAI(entityType, aiData) {
        // Close any lingering modal-wrapper from system monster views etc.
        this._dismissMainModal();

        const empty = getEmptyEntity(entityType);
        const entity = this.mergeAIData(empty, aiData);
        this.currentEntityType = entityType;
        this.currentEntity = entity;
        this.isEditing = false;

        this.populateSheet(entity);

        document.getElementById('entity-delete-btn')?.classList.add('hidden');
        document.getElementById('entity-sheet-modal')?.classList.remove('hidden');

        // Reset to first tab
        document.querySelectorAll('#entity-sheet-container .sheet-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
        document.querySelectorAll('#entity-sheet-container .sheet-section').forEach((s, i) => s.classList.toggle('hidden', i !== 0));
    },

    mergeAIData(base, ai) {
        if (!ai) return base;

        // Merge top-level fields
        if (ai.name) base.name = ai.name;
        if (ai.tokenUrl) base.tokenUrl = ai.tokenUrl;

        // Merge bio
        if (ai.bio) Object.assign(base.bio, ai.bio);
        // Fallback for flat AI fields
        if (ai.cr) base.bio.cr = ai.cr;
        if (ai.type) base.bio.creature_type = ai.type;
        if (ai.size) base.bio.size = ai.size;
        if (ai.race) base.bio.race = ai.race;
        if (ai.class) base.bio.class = ai.class;
        if (ai.alignment) base.bio.alignment = ai.alignment;

        // Merge attributes
        if (ai.attributes) {
            const a = ai.attributes;
            base.attributes = {
                str: a.str || a.FOR || base.attributes.str,
                dex: a.dex || a.DES || base.attributes.dex,
                con: a.con || a.CON || base.attributes.con,
                int: a.int || a.INT || base.attributes.int,
                wis: a.wis || a.SAB || base.attributes.wis,
                cha: a.cha || a.CAR || base.attributes.cha
            };
        }

        // Merge stats
        if (ai.stats) Object.assign(base.stats, ai.stats);
        if (ai.ac) base.stats.ac = parseInt(ai.ac) || base.stats.ac;
        if (ai.hp) {
            const hpMatch = String(ai.hp).match(/^(\d+)/);
            if (hpMatch) {
                base.stats.hp_max = parseInt(hpMatch[1]);
                base.stats.hp_current = base.stats.hp_max;
            }
            base.stats.hit_dice_total = ai.hp;
        }

        // Merge story
        if (ai.story) Object.assign(base.story, ai.story);
        if (ai.description) base.story.notes = ai.description;

        // Merge combat
        if (ai.combat) Object.assign(base.combat, ai.combat);
        if (ai.attacks && Array.isArray(ai.attacks)) base.combat.attacks = ai.attacks;

        // Merge abilities
        if (ai.abilities && Array.isArray(ai.abilities)) base.abilities = ai.abilities;

        return base;
    },

    /**
     * Dismiss the main app modal-wrapper so it doesn't linger behind
     * the entity-sheet-modal (e.g. after viewing a system monster).
     * Also un-hides the entity-sheet-container which gets caught by
     * openModal()'s global `.sheet-container` hide sweep.
     */
    _dismissMainModal() {
        const wrapper = document.getElementById('modal-wrapper');
        if (wrapper) {
            wrapper.classList.remove('active');
            wrapper.classList.add('hidden');
        }
        const detailContainer = document.getElementById('detail-container');
        if (detailContainer) {
            detailContainer.innerHTML = '';
            detailContainer.classList.add('hidden');
        }
        // openModal() globally hides ALL .sheet-container elements,
        // which includes #entity-sheet-container. Undo that here.
        const entityContainer = document.getElementById('entity-sheet-container');
        if (entityContainer) {
            entityContainer.classList.remove('hidden');
        }
    },

    closeSheet() {
        document.getElementById('entity-sheet-modal')?.classList.add('hidden');
        this.currentEntity = null;
        this.currentEntityType = null;
    },

    // --- Populate ---

    populateSheet(entity) {
        if (!entity) return;

        const labels = ENTITY_LABELS[this.currentEntityType] || ENTITY_LABELS.monster;
        const b = entity.bio || {};

        const nameEl = document.getElementById('entity-sheet-name');
        if (nameEl) {
            const labelStr = labels.singular === 'Criatura' ? 'da Criatura' : (labels.singular === 'NPC' ? 'do NPC' : 'do Monstro');
            nameEl.innerHTML = `<input type="text" value="${escapeHTML(entity.name || '')}" data-field="name" class="medieval-input seamless sheet-name-input" placeholder="Nome ${labelStr}">`;
        }

        // Level
        const levelEl = document.getElementById('entity-level-val');
        if (levelEl) levelEl.innerHTML = `<input type="number" value="${b.level || 1}" data-field="bio.level" class="medieval-input seamless sheet-level-input" style="width: 50px; text-align: center;">`;

        // Alignment
        const alignEl = document.getElementById('entity-alignment-display');
        if (alignEl) {
            const aligns = ['Leal e Bom', 'Neutro e Bom', 'Caótico e Bom', 'Leal e Neutro', 'Neutro', 'Caótico e Neutro', 'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau'];
            alignEl.innerHTML = `<select data-field="bio.alignment" class="medieval-select header-input-box">${aligns.map(a => `<option value="${a}" ${a === (b.alignment || 'Neutro') ? 'selected' : ''}>${a}</option>`).join('')}</select>`;
        }

        // Race
        const raceEl = document.getElementById('entity-race-display');
        if (raceEl) raceEl.innerHTML = `<input type="text" value="${escapeHTML(b.race || b.creature_type || '')}" data-field="bio.race" class="medieval-input header-input-box" placeholder="Raça ou tipo">`;

        // Class
        const classEl = document.getElementById('entity-class-display');
        if (classEl) classEl.innerHTML = `<input type="text" value="${escapeHTML(b.class || '')}" data-field="bio.class" class="medieval-input header-input-box" placeholder="Classe">`;

        // Size
        const sizeEl = document.getElementById('entity-size-display');
        if (sizeEl) {
            sizeEl.innerHTML = `<select data-field="bio.size" class="medieval-select header-input-box">${CREATURE_SIZES.map(s => `<option value="${s.value}" ${s.value === (b.size || 'Médio (Medium)') ? 'selected' : ''}>${s.label}</option>`).join('')}</select>`;
        }

        // CR
        const crEl = document.getElementById('entity-cr-display');
        if (crEl) crEl.innerHTML = `<input type="text" value="${escapeHTML(b.cr || '0')}" data-field="bio.cr" class="medieval-input header-input-box" placeholder="0" style="width: 60px; text-align: center;">`;

        // Creature Type (Bio tab)
        const ctEl = document.getElementById('entity-creature-type');
        if (ctEl) ctEl.value = b.creature_type || '';

        // Background, XP
        const bgEl = document.getElementById('entity-background');
        if (bgEl) bgEl.value = b.background || '';
        const xpEl = document.getElementById('entity-xp');
        if (xpEl) xpEl.value = b.xp || '0';

        // Token
        const tokenImg = document.getElementById('entity-token');
        if (tokenImg) tokenImg.src = entity.tokenUrl || 'assets/tokens/lyra.png';

        // --- Attributes ---
        this.renderAttributes(entity);
        this.renderSaves(entity);
        this.renderSkills(entity);

        // --- Combat ---
        this.renderCombatStats(entity);
        this.renderAttacks(entity);

        // --- Abilities ---
        this.renderAbilities();

        // --- Inventory ---
        this.renderInventory();

        // --- Story ---
        this.renderStory(entity);
    },

    calculateMod(score) {
        return Math.floor((score - 10) / 2);
    },

    getProfBonus(level) {
        return Math.ceil(level / 4) + 1;
    },

    renderAttributes(entity) {
        const container = document.getElementById('entity-scores');
        if (!container) return;

        const attrs = entity.attributes || {};
        const attrMap = [
            { id: 'str', l: 'FOR', v: attrs.str || 10 },
            { id: 'dex', l: 'DES', v: attrs.dex || 10 },
            { id: 'con', l: 'CON', v: attrs.con || 10 },
            { id: 'int', l: 'INT', v: attrs.int || 10 },
            { id: 'wis', l: 'SAB', v: attrs.wis || 10 },
            { id: 'cha', l: 'CAR', v: attrs.cha || 10 }
        ];

        container.innerHTML = attrMap.map(a => {
            const mod = this.calculateMod(a.v);
            return `
                <div class="score-card">
                    <span class="score-label">${a.l}</span>
                    <input type="number" value="${a.v}" data-field="attributes.${a.id}" class="medieval-input seamless" style="width: 50px; text-align: center; font-size: 1.4rem; font-weight: bold; background: transparent; border: none; padding: 0;" min="0" max="30">
                    <span class="score-mod">${mod >= 0 ? `+${mod}` : mod}</span>
                </div>
            `;
        }).join('');
    },

    renderSaves(entity) {
        const container = document.getElementById('entity-saves');
        if (!container) return;

        const attrs = entity.attributes || {};
        const profBonus = this.getProfBonus(entity.bio?.level || 1);
        const saves = [
            { id: 'str', l: 'Força' }, { id: 'dex', l: 'Destreza' }, { id: 'con', l: 'Constituição' },
            { id: 'int', l: 'Inteligência' }, { id: 'wis', l: 'Sabedoria' }, { id: 'cha', l: 'Carisma' }
        ];

        container.innerHTML = saves.map(s => {
            const attrVal = attrs[s.id] || 10;
            const mod = this.calculateMod(attrVal);
            const isProf = (entity.proficiencies_choice?.saves || []).includes(s.id);
            const val = mod + (isProf ? profBonus : 0);

            return `
                <div class="save-item ${isProf ? 'proficient' : ''}" style="cursor: pointer;">
                    <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''}" style="font-size: 0.5rem; color: ${isProf ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf ? 1 : 0.3};" data-type="saves" data-field="${s.id}"></i>
                    <span>${s.l}</span>
                    <span class="save-value">${val >= 0 ? `+${val}` : val}</span>
                </div>
            `;
        }).join('');
    },

    renderSkills(entity) {
        const container = document.getElementById('entity-skills');
        if (!container) return;

        const attrs = entity.attributes || {};
        const profBonus = this.getProfBonus(entity.bio?.level || 1);
        const skills = [
            { id: 'acrobacia', l: 'Acrobacia (Des)', attr: 'dex' },
            { id: 'adestrar_animais', l: 'Adestrar Animais (Sab)', attr: 'wis' },
            { id: 'arcanismo', l: 'Arcanismo (Int)', attr: 'int' },
            { id: 'atletismo', l: 'Atletismo (For)', attr: 'str' },
            { id: 'atuacao', l: 'Atuação (Car)', attr: 'cha' },
            { id: 'enganacao', l: 'Enganação (Car)', attr: 'cha' },
            { id: 'furtividade', l: 'Furtividade (Des)', attr: 'dex' },
            { id: 'historia', l: 'História (Int)', attr: 'int' },
            { id: 'intimidacao', l: 'Intimidação (Car)', attr: 'cha' },
            { id: 'intuicao', l: 'Intuição (Sab)', attr: 'wis' },
            { id: 'investigacao', l: 'Investigação (Int)', attr: 'int' },
            { id: 'medicina', l: 'Medicina (Sab)', attr: 'wis' },
            { id: 'natureza', l: 'Natureza (Int)', attr: 'int' },
            { id: 'percepcao', l: 'Percepção (Sab)', attr: 'wis' },
            { id: 'persuasao', l: 'Persuasão (Car)', attr: 'cha' },
            { id: 'prestidigitacao', l: 'Prestidigitação (Des)', attr: 'dex' },
            { id: 'religiao', l: 'Religião (Int)', attr: 'int' },
            { id: 'sobrevivencia', l: 'Sobrevivência (Sab)', attr: 'wis' }
        ];

        container.innerHTML = skills.map(sk => {
            const attrVal = attrs[sk.attr] || 10;
            const mod = this.calculateMod(attrVal);
            const isProf = (entity.proficiencies_choice?.skills || []).includes(sk.id);
            const val = mod + (isProf ? profBonus : 0);

            return `
                <div class="skill-item ${isProf ? 'proficient' : ''}" style="cursor: pointer;">
                    <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''}" style="font-size: 0.5rem; color: ${isProf ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf ? 1 : 0.3};" data-type="skills" data-field="${sk.id}"></i>
                    <span>${sk.l}</span>
                    <span class="skill-value">${val >= 0 ? `+${val}` : val}</span>
                </div>
            `;
        }).join('');

        // Prof & Passive Perception
        const profEl = document.getElementById('entity-prof');
        const ppEl = document.getElementById('entity-passive-percep');
        if (profEl) profEl.innerText = `+${this.getProfBonus(entity.bio?.level || 1)}`;
        if (ppEl) {
            const wisMod = this.calculateMod(attrs.wis || 10);
            const isPercProf = (entity.proficiencies_choice?.skills || []).includes('percepcao');
            ppEl.innerText = 10 + wisMod + (isPercProf ? this.getProfBonus(entity.bio?.level || 1) : 0);
        }
    },

    renderCombatStats(entity) {
        const s = entity.stats || {};
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

        setVal('entity-ac', s.ac || 10);
        setVal('entity-initiative', s.initiative || 0);
        setVal('entity-speed', s.speed || '9m');
        setVal('entity-hp-curr', s.hp_current || 10);
        setVal('entity-hp-max', s.hp_max || 10);
        setVal('entity-hp-temp', s.hp_temp || 0);
        setVal('entity-hd-curr', s.hit_dice_current || 1);
        setVal('entity-hd-total', s.hit_dice_total || '1d8');
    },

    renderAttacks(entity) {
        const body = document.getElementById('entity-attacks-body');
        if (!body) return;

        const attacks = entity.combat?.attacks || [];

        body.innerHTML = attacks.map((atk, i) => `
            <div class="combat-card-v3" data-index="${i}">
                <div class="combat-card-header">
                    <div class="combat-card-icon"><i class="fas fa-sword"></i></div>
                    <input type="text" value="${escapeHTML(atk.name || '')}" 
                        data-list="combat.attacks" data-field="name" data-index="${i}" 
                        placeholder="Nome do Ataque/Arma"
                        class="combat-card-name-input">
                    <button class="icon-btn delete-btn entity-delete-attack" data-index="${i}" title="Remover">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="combat-card-body">
                    <div class="combat-stat-field">
                        <label>Bônus de Ataque</label>
                        <input type="text" value="${escapeHTML(atk.bonus || '+0')}" 
                            data-list="combat.attacks" data-field="bonus" data-index="${i}" 
                            class="medieval-input secondary center">
                    </div>
                    <div class="combat-stat-field" style="display: flex; gap: 0.5rem;">
                        <div style="flex: 1;">
                            <label>Dano</label>
                            <input type="text" value="${escapeHTML(atk.damage || '1d6')}" 
                                data-list="combat.attacks" data-field="damage" data-index="${i}" 
                                class="medieval-input secondary" placeholder="Ex: 1d6">
                        </div>
                        <div style="flex: 1;">
                            <label>Tipo</label>
                            <input type="text" value="${escapeHTML(atk.damageType || '')}" 
                                data-list="combat.attacks" data-field="damageType" data-index="${i}" 
                                class="medieval-input secondary" placeholder="Ex: cortante">
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        body.innerHTML += `
            <div style="margin-top: 10px; text-align: center;">
                <button id="entity-add-attack-btn" class="medieval-btn small dashed" style="width: 100%;"><i class="fas fa-plus"></i> Adicionar Ataque</button>
            </div>
        `;

        // Bind delete attack
        body.querySelectorAll('.entity-delete-attack').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                this.currentEntity = this.gatherEntityData();
                if (this.currentEntity?.combat?.attacks) {
                    this.currentEntity.combat.attacks.splice(idx, 1);
                    this.renderAttacks(this.currentEntity);
                }
            });
        });
    },

    renderAbilities() {
        const body = document.getElementById('entity-abilities-body');
        if (!body || !this.currentEntity) return;

        const abilities = this.currentEntity.abilities || [];

        if (abilities.length === 0) {
            body.innerHTML = '<p class="empty-hint" style="grid-column: 1/-1;">Nenhuma habilidade registrada. Adicione acima.</p>';
            return;
        }

        body.innerHTML = abilities.map((ab, i) => {
            let mechanicsBadges = '';
            const em = ab.execution_mechanics || {};
            const badges = [];
            if (em.has_attack_roll) badges.push(`<span class="card-v2-badge">Ataque</span>`);
            if (em.damage && em.damage.length > 0) {
                const dmg = em.damage[0];
                badges.push(`<span class="card-v2-badge dmg">${dmg.dice_count||1}d${dmg.dice_type||6} ${dmg.damage_type||''}</span>`);
            }
            if (em.has_save && em.save?.ability) badges.push(`<span class="card-v2-badge save">CD ${em.save.dc_value||'?'} ${em.save.ability}</span>`);
            if (badges.length > 0) mechanicsBadges = `<div class="card-v2-badges" style="margin-top: 0.5rem; margin-bottom: 0.2rem; border: none; padding-top: 0;">${badges.join('')}</div>`;

            return `
            <div class="spell-card-v2 list-item-v2" style="position: relative;">
                <div class="spell-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <input type="text" value="${escapeHTML(ab.identity?.name || 'Habilidade')}" class="medieval-input seamless" style="font-weight: bold; font-size: 1rem; flex: 1;" data-ability-index="${i}" data-ability-field="identity.name">
                    <button class="icon-btn delete-btn entity-delete-ability" data-index="${i}" title="Remover" style="margin-left: 8px;"><i class="fas fa-trash"></i></button>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                    <select class="medieval-select seamless" style="flex: 1; min-width: 120px;" data-ability-index="${i}" data-ability-field="identity.origin">
                        <option value="Custom_Attack" ${ab.identity?.origin === 'Custom_Attack' ? 'selected' : ''}>Ataque Customizado</option>
                        <option value="Spell" ${ab.identity?.origin === 'Spell' ? 'selected' : ''}>Magia</option>
                        <option value="Class_Skill" ${ab.identity?.origin === 'Class_Skill' ? 'selected' : ''}>Habilidade de Classe</option>
                        <option value="Race" ${ab.identity?.origin === 'Race' ? 'selected' : ''}>Racial</option>
                        <option value="Item" ${ab.identity?.origin === 'Item' ? 'selected' : ''}>Item</option>
                    </select>
                    <select class="medieval-select seamless" style="flex: 1; min-width: 100px;" data-ability-index="${i}" data-ability-field="activation.type">
                        <option value="Action" ${ab.activation?.type === 'Action' ? 'selected' : ''}>Ação</option>
                        <option value="Bonus_Action" ${ab.activation?.type === 'Bonus_Action' ? 'selected' : ''}>Ação Bônus</option>
                        <option value="Reaction" ${ab.activation?.type === 'Reaction' ? 'selected' : ''}>Reação</option>
                        <option value="Passive" ${ab.activation?.type === 'Passive' ? 'selected' : ''}>Passiva</option>
                        <option value="Legendary" ${ab.activation?.type === 'Legendary' ? 'selected' : ''}>Lendária</option>
                        <option value="Lair" ${ab.activation?.type === 'Lair' ? 'selected' : ''}>Covil</option>
                    </select>
                </div>
                ${mechanicsBadges}
                <div class="form-group" style="margin-top: 0.5rem;">
                    <textarea class="medieval-textarea" placeholder="Descrição da habilidade, efeitos e mecânicas..." rows="3" data-ability-index="${i}" data-ability-field="description" style="font-size: 0.85rem;">${escapeHTML(ab.description || ab.execution_mechanics?.special_effects?.join(', ') || '')}</textarea>
                </div>
            </div>
        `;
        }).join('');

        // Bind delete ability
        body.querySelectorAll('.entity-delete-ability').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                this.currentEntity = this.gatherEntityData();
                if (this.currentEntity?.abilities) {
                    this.currentEntity.abilities.splice(idx, 1);
                    this.renderAbilities();
                }
            });
        });
    },

    renderInventory() {
        const body = document.getElementById('entity-inventory-body');
        if (!body || !this.currentEntity) return;

        const items = this.currentEntity.inventory?.items || [];

        if (items.length === 0) {
            body.innerHTML = '<p class="empty-hint" style="grid-column: 1/-1;">Nenhum item. Adicione abaixo.</p>';
            return;
        }

        body.innerHTML = items.map((it, i) => {
            let mechanicsBadges = '';
            const abData = it.ability_data || null;
            if (abData) {
                const em = abData.execution_mechanics || {};
                const badges = [];
                if (em.has_attack_roll) badges.push(`<span class="card-v2-badge">Ataque</span>`);
                if (em.damage && em.damage.length > 0) {
                    const dmg = em.damage[0];
                    badges.push(`<span class="card-v2-badge dmg">${dmg.dice_count||1}d${dmg.dice_type||6} ${dmg.damage_type||''}</span>`);
                }
                if (em.has_save && em.save?.ability) badges.push(`<span class="card-v2-badge save">CD ${em.save.dc_value||'?'} ${em.save.ability}</span>`);
                if (badges.length > 0) mechanicsBadges = `<div class="card-v2-badges" style="margin-top: 0.5rem; margin-bottom: 0.2rem; border: none; padding-top: 0;">${badges.join('')}</div>`;
            }

            return `
            <div class="spell-card-v2 list-item-v2" style="position: relative;">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="text" value="${escapeHTML(it.name || '')}" class="medieval-input seamless" style="flex: 2; font-weight: bold;" data-item-index="${i}" data-item-field="name" placeholder="Nome do Item">
                    <input type="number" value="${it.quantity || 1}" class="medieval-input seamless" style="width: 50px; text-align: center;" data-item-index="${i}" data-item-field="quantity" placeholder="Qtd">
                    <input type="number" value="${it.weight || 0}" class="medieval-input seamless" style="width: 60px; text-align: center;" data-item-index="${i}" data-item-field="weight" placeholder="Peso">
                    <button class="icon-btn delete-btn entity-delete-item" data-index="${i}" title="Remover"><i class="fas fa-trash"></i></button>
                </div>
                ${mechanicsBadges}
                <div class="form-group" style="margin-top: 0.3rem;">
                    <textarea class="medieval-textarea" placeholder="Propriedades e descrição..." rows="2" data-item-index="${i}" data-item-field="description" style="font-size: 0.85rem;">${escapeHTML(it.description || '')}</textarea>
                </div>
            </div>
        `;
        }).join('');

        body.querySelectorAll('.entity-delete-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                this.currentEntity = this.gatherEntityData();
                if (this.currentEntity?.inventory?.items) {
                    this.currentEntity.inventory.items.splice(idx, 1);
                    this.renderInventory();
                }
            });
        });
    },

    renderStory(entity) {
        const section = document.getElementById('entity-historia');
        if (!section) return;
        const story = entity.story || {};

        section.querySelectorAll('textarea').forEach(ta => {
            const parts = ta.dataset.field?.split('.');
            const field = parts && parts.length > 1 ? parts[1] : null;
            if (field) {
                ta.value = story[field] || '';
                ta.style.height = 'auto';
                ta.style.height = (ta.scrollHeight + 2) + 'px';
            }
            ta.addEventListener('input', () => {
                ta.style.height = 'auto';
                ta.style.height = (ta.scrollHeight + 2) + 'px';
            });
        });
    },

    // --- Gather Data ---

    gatherEntityData() {
        const container = document.getElementById('entity-sheet-container');
        if (!container || !this.currentEntity) return this.currentEntity;

        const entity = { ...this.currentEntity };

        // Name
        const nameInput = container.querySelector('input[data-field="name"]');
        if (nameInput) entity.name = nameInput.value.trim();

        // Bio fields
        const bioFields = ['bio.level', 'bio.alignment', 'bio.race', 'bio.class', 'bio.size', 'bio.cr', 'bio.creature_type', 'bio.background', 'bio.xp'];
        if (!entity.bio) entity.bio = {};

        bioFields.forEach(f => {
            const el = container.querySelector(`[data-field="${f}"]`);
            if (el) {
                const key = f.split('.')[1];
                entity.bio[key] = el.tagName === 'SELECT' ? el.value : el.value;
            }
        });

        entity.bio.level = parseInt(entity.bio.level) || 1;

        // Attributes
        const attrIds = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        if (!entity.attributes) entity.attributes = {};
        attrIds.forEach(id => {
            const el = container.querySelector(`input[data-field="attributes.${id}"]`);
            if (el) entity.attributes[id] = parseInt(el.value) || 10;
        });

        // Stats
        const statFields = ['stats.ac', 'stats.initiative', 'stats.speed', 'stats.hp_current', 'stats.hp_max', 'stats.hp_temp', 'stats.hit_dice_current', 'stats.hit_dice_total'];
        if (!entity.stats) entity.stats = {};
        statFields.forEach(f => {
            const el = container.querySelector(`[data-field="${f}"]`);
            if (el) {
                const key = f.split('.')[1];
                entity.stats[key] = el.type === 'number' ? (parseInt(el.value) || 0) : el.value;
            }
        });

        // Attacks (from DOM)
        const attackRows = container.querySelectorAll('#entity-attacks-body .combat-card-v3');
        entity.combat = { attacks: [] };
        attackRows.forEach(row => {
            const name = row.querySelector('input[data-field="name"]')?.value || '';
            const bonus = row.querySelector('input[data-field="bonus"]')?.value || '+0';
            const damage = row.querySelector('input[data-field="damage"]')?.value || '1d6';
            const damageType = row.querySelector('input[data-field="damageType"]')?.value || '';
            entity.combat.attacks.push({ name, bonus, damage, damageType, isCustom: true, isProf: false });
        });

        // Abilities (from DOM)
        const abilityCards = container.querySelectorAll('#entity-abilities-body .list-item-v2');
        entity.abilities = [];
        abilityCards.forEach((card, i) => {
            const existing = this.currentEntity.abilities?.[i] || {};
            const name = card.querySelector('[data-ability-field="identity.name"]')?.value || 'Habilidade';
            const origin = card.querySelector('[data-ability-field="identity.origin"]')?.value || 'Custom_Attack';
            const type = card.querySelector('[data-ability-field="activation.type"]')?.value || 'Action';
            const desc = card.querySelector('[data-ability-field="description"]')?.value || '';

            entity.abilities.push({
                uid: existing.uid || `ability_${Date.now()}_${i}`,
                identity: { name, origin, tags: existing.identity?.tags || [], source: existing.identity?.source || {} },
                activation: { type, cost: existing.activation?.cost || 1 },
                execution_mechanics: existing.execution_mechanics || {},
                description: desc,
                meta: existing.meta || { visibility: 'private', is_native: true }
            });
        });

        // Inventory Items (from DOM)
        const itemCards = container.querySelectorAll('#entity-inventory-body .list-item-v2');
        if (!entity.inventory) entity.inventory = { coins: {}, items: [], encumbrance: {} };
        entity.inventory.items = [];
        itemCards.forEach((card, i) => {
            const existing = this.currentEntity.inventory?.items?.[i] || {};
            const name = card.querySelector('[data-item-field="name"]')?.value || '';
            const qty = parseInt(card.querySelector('[data-item-field="quantity"]')?.value) || 1;
            const weight = parseFloat(card.querySelector('[data-item-field="weight"]')?.value) || 0;
            const desc = card.querySelector('[data-item-field="description"]')?.value || '';
            entity.inventory.items.push({ 
                ...existing, 
                name, 
                quantity: qty, 
                weight, 
                description: desc 
            });
        });

        // Story
        if (!entity.story) entity.story = {};
        const storySection = document.getElementById('entity-historia');
        storySection?.querySelectorAll('textarea[data-field]').forEach(ta => {
            const key = ta.dataset.field.split('.')[1];
            if (key) entity.story[key] = ta.value;
        });

        return entity;
    },

    // --- Save ---

    async handleSave() {
        const user = auth.currentUser;
        if (!user) {
            window.app?.showAlert?.('Você precisa estar autenticado.', 'Erro');
            return;
        }

        const entity = this.gatherEntityData();
        if (!entity.name || entity.name.trim() === '') {
            window.app?.showAlert?.('Dê um nome à sua criação.', 'Nome Requerido');
            return;
        }

        const btn = document.getElementById('save-entity-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...'; }

        try {
            const nickname = window.app?.userProfile?.nickname || user.displayName || 'Viajante';
            entity.createdByNickname = nickname;
            entity.systemId = window.app?.currentSystem || 'dnd5e';

            const id = await saveEntity(this.currentEntityType, user.uid, user.email, entity);

            entity.id = id;
            this.currentEntity = entity;
            this.isEditing = true;

            const labels = ENTITY_LABELS[this.currentEntityType];
            window.app?.showAlert?.(`${labels.singular} salv${this.currentEntityType === 'npc' ? 'o' : 'o'} com sucesso!`, 'Registros Atualizados');

            document.getElementById('entity-delete-btn')?.classList.remove('hidden');

            // Dispatch event so list views can refresh
            window.dispatchEvent(new CustomEvent('entity-saved', { detail: { type: this.currentEntityType, id } }));
        } catch (error) {
            console.error('Erro ao salvar entidade:', error);
            window.app?.showAlert?.('Erro ao salvar: ' + error.message, 'Erro Arcano');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Salvar'; }
        }
    },

    async handleDelete() {
        const user = auth.currentUser;
        if (!user || !this.currentEntity?.id) return;

        const labels = ENTITY_LABELS[this.currentEntityType];
        const confirmed = await window.app?.showConfirm?.(
            `Deseja realmente excluir ${labels.singular.toLowerCase()} "${this.currentEntity.name}"? Esta ação é irreversível.`,
            'Exclusão Permanente'
        );

        if (!confirmed) return;

        try {
            await deleteEntity(this.currentEntityType, this.currentEntity.id, user.uid);
            window.app?.showAlert?.(`${labels.singular} excluíd${this.currentEntityType === 'npc' ? 'o' : 'o'} com sucesso.`, 'Registro Removido');
            this.closeSheet();
            window.dispatchEvent(new CustomEvent('entity-saved', { detail: { type: this.currentEntityType } }));
        } catch (error) {
            console.error('Erro ao excluir entidade:', error);
            window.app?.showAlert?.('Erro ao excluir: ' + error.message, 'Erro Arcano');
        }
    }
};

window.EntitySheetModule = EntitySheetModule;
export default EntitySheetModule;
