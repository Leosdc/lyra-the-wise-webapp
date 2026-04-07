/**
 * Sheet Module — Barrel
 * State, stats calculation, edit/save, tab switching, card renderers.
 *
 * Sub-modules:
 *  - sheet-populate.js → populateSheet (764 lines), autoResizeTextarea
 *  - sheet-search.js   → bindSearchEvents, linkFromLibrary, gatherList
 */

import { updateCharacter } from '../data.js';
import { DND5eSystem } from '../systems/dnd5e.js';
import { escapeHTML, parseMarkdown } from './utils.js';
import { logger } from '../logger.js';

import { createPopulateMixin } from './sheet-populate.js';
import { createSearchMixin } from './sheet-search.js';

export const SheetModule = {

    init() {
        this.injectHTML();
    },

    injectHTML() {
        if (document.getElementById('fichas')) return;

        const fichasHtml = `
            <!-- Fichas View -->
            <section id="fichas" class="view hidden">
                <div class="view-header">
                    <h2><i class="fas fa-user-shield"></i> Seus Personagens</h2>
                    <div class="header-actions">
                        <button id="bulk-delete-fichas-btn" class="medieval-btn small secondary"><i
                                class="fas fa-trash-can"></i>
                            Excluir</button>
                        <button id="show-wizard-btn" class="medieval-btn small"><i class="fas fa-plus"></i>
                            Novo</button>
                    </div>
                </div>
                <div id="fichas-list" class="items-grid"></div>
            </section>
        `;

        const sheetHtml = `
            <!-- Character Sheet -->
            <div id="character-sheet" class="sheet-container hidden">
                <div id="sheet-inspection-banner" class="hidden"></div>
                <div class="sheet-header">
                    <!-- Left: Token -->
                    <div class="header-token-section">
                        <div class="char-token-wrapper">
                            <img id="sheet-token" src="assets/tokens/lyra.png" alt="Token" class="char-token">
                            <input type="file" id="token-upload" accept="image/*" class="hidden">
                            <label for="token-upload" id="token-upload-btn" class="token-upload-overlay">
                                <i class="fas fa-camera"></i>
                            </label>
                        </div>
                    </div>

                    <!-- Center: Name & Dropdowns -->
                    <div class="header-info-section">
                        <div class="header-row-top">
                            <h2 id="sheet-char-name" class="editable" data-field="bio.name">Nome do Herói</h2>
                        </div>
                        <div class="header-row-bottom" style="align-items: flex-start;">
                            <div class="header-field-group">
                                <label>Alinhamento</label>
                                <span id="sheet-alignment-display"></span>
                            </div>

                            <!-- Race Column -->
                            <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                <div class="header-field-group" style="width: 100%; margin: 0;">
                                    <label>Raça</label>
                                    <span id="sheet-race-display"></span>
                                </div>
                                <div class="header-field-group" style="width: 100%; margin: 0;">
                                    <label>Sub-raça</label>
                                    <div id="sheet-subrace-display" style="width: 100%;"></div>
                                </div>
                            </div>

                            <!-- Class Column -->
                            <div style="display: flex; flex-direction: column; flex: 1; gap: 5px;">
                                <div class="header-field-group" style="width: 100%; margin: 0;">
                                    <label>Classe</label>
                                    <span id="sheet-class-display"></span>
                                </div>
                                <div class="header-field-group" style="width: 100%; margin: 0;">
                                    <label>Arquétipo</label>
                                    <div id="sheet-archetype-display" style="width: 100%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Level & Save -->
                    <div class="header-meta-section" style="flex-direction: row; align-items: center; gap: 1.5rem;">
                        <button id="sheet-inspiration-btn" class="inspiration-toggle-btn" title="Inspiração D&D 5e">
                            <i class="fas fa-star"></i>
                        </button>
                        <input type="checkbox" id="sheet-inspiration-input" data-field="stats.inspiration" style="display: none;">
                        <div class="level-display">
                            <label>Nível</label>
                            <span id="sheet-level-val" class="level-value">1</span>
                        </div>
                        <button id="save-sheet-btn" class="medieval-btn small"><i class="fas fa-save"></i>
                            Salvar</button>
                    </div>
                </div>
                <div class="sheet-tabs">
                    <button class="sheet-tab active" data-tab="geral">Principal</button>
                    <button class="sheet-tab" data-tab="combate">Combate</button>
                    <button class="sheet-tab" data-tab="magia">Grimório</button>
                    <button class="sheet-tab" data-tab="inventario">Mochila</button>
                    <button class="sheet-tab" data-tab="historia">Crônicas</button>
                </div>
                <div class="sheet-content">
                    <!-- Aba Geral: Bio, Atributos, Resistências e Perícias -->
                    <div id="sheet-geral" class="sheet-section">
                        <div class="bio-grid">
                            <div class="form-group"><label>Antecedente</label><span id="sheet-background"
                                    class="editable" data-field="bio.background"></span></div>
                            <div class="form-group"><label>XP</label><span id="sheet-xp" class="editable"
                                    data-field="bio.xp"></span></div>
                            <div class="form-group"><label>Nome do Jogador</label><span id="sheet-player-name"
                                    class="editable" data-field="bio.playerName"></span></div>
                        </div>
                        <div class="stats-main-grid">
                            <div class="attributes-column">
                                <div class="scores-grid" id="sheet-scores"></div>
                                <h4 class="section-title">Testes de Resistência</h4>
                                <div class="saves-list" id="sheet-saves"></div>
                            </div>
                            <div class="skills-column">
                                <div class="top-vitals-row">
                                    <div class="vital-mini-box"><span>Proficiência</span><strong
                                            id="sheet-prof"></strong></div>
                                    <div class="vital-mini-box"><span>Percepção Passiva</span><strong
                                            id="sheet-passive-percep"></strong></div>
                                </div>
                                <h4 class="section-title">Perícias</h4>
                                <div class="skills-list" id="sheet-skills"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Aba Combate: PV, CA, Iniciativa, Ataques, Death Saves -->
                    <div id="sheet-combate" class="sheet-section hidden">
                        <div class="combat-status-grid">
                            <div class="vital-box large"><span>CA</span><strong id="sheet-ca" class="editable"
                                    data-field="stats.ac">10</strong></div>
                            <div class="vital-box large"><span>Iniciativa</span><strong id="sheet-inic"
                                    class="editable" data-field="stats.initiative">0</strong></div>
                            <div class="vital-box large"><span>Velocidade</span><strong id="sheet-speed"
                                    class="editable" data-field="stats.speed">9m</strong></div>
                            <div class="hp-container-main">
                                <div class="hp-box-full">
                                    <span class="label">Pontos de Vida</span>
                                    <div class="hp-controls">
                                        <input type="number" id="sheet-hp-curr" class="hp-input"
                                            data-field="stats.hp_current">
                                        <span class="sep">/</span>
                                        <input type="number" id="sheet-hp-max" class="hp-input"
                                            data-field="stats.hp_max">
                                    </div>
                                </div>
                                <div class="hp-temp">
                                    <span>PV Temporários</span>
                                    <input type="number" id="sheet-hp-temp" class="hp-input small"
                                        data-field="stats.hp_temp">
                                </div>
                            </div>
                        </div>

                        <div class="combat-details-grid">
                            <div class="hit-dice-death-saves">
                                <div class="death-saves-block">
                                    <h4>Resistência à Morte</h4>
                                    <div class="death-row successes">Sucessos
                                        <input type="checkbox" id="death-s1" data-field="death_saves.successes"
                                            value="1">
                                        <input type="checkbox" id="death-s2" data-field="death_saves.successes"
                                            value="2">
                                        <input type="checkbox" id="death-s3" data-field="death_saves.successes"
                                            value="3">
                                    </div>
                                    <div class="death-row failures">Falhas
                                        <input type="checkbox" id="death-f1" data-field="death_saves.failures"
                                            value="1">
                                        <input type="checkbox" id="death-f2" data-field="death_saves.failures"
                                            value="2">
                                        <input type="checkbox" id="death-f3" data-field="death_saves.failures"
                                            value="3">
                                    </div>
                                </div>
                                <div class="hit-dice-block">
                                    <h4>Dados de Vida</h4>
                                    <div class="hit-dice-row">
                                        <input type="number" id="sheet-hd-curr" data-field="stats.hit_dice_current"
                                            class="medieval-input" style="width: 60px; text-align: center;">
                                        <span> de </span>
                                        <span id="sheet-hd-total" class="editable"
                                            data-field="stats.hit_dice_total">1d8</span>
                                    </div>
                                </div>
                            </div>
                            <div class="attacks-section">
                                <h4 class="section-title">Ataques</h4>
                                <div id="attacks-body" class="attacks-list-v2"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Aba Magia: Slots, Grimório, CD -->
                    <div id="sheet-magia" class="sheet-section hidden">
                        <div class="magic-header-stats">
                            <div class="vital-box"><span>CD Salva.</span><strong id="sheet-spell-dc">8</strong>
                            </div>
                            <div class="vital-box"><span>Ataque Mág.</span><strong id="sheet-spell-atk">0</strong>
                            </div>
                            <div class="form-group spell-casting-container">
                                <h4 class="section-title spell-casting-title">Atributo
                                    de Conjuração</h4>
                                <select id="sheet-spell-attr" data-field="spells.ability"
                                    class="medieval-select spell-casting-select">
                                    <option value="int">Inteligência</option>
                                    <option value="wis">Sabedoria</option>
                                    <option value="cha">Carisma</option>
                                </select>
                            </div>
                        </div>
                        <div class="spell-slots-tracker" id="sheet-spell-slots"></div>
                        <h4 class="section-title spellbook-title">Livro de Magias
                        </h4>
                        <div class="sheet-search-container">
                            <i class="fas fa-search"></i>
                            <input type="text" id="sheet-spell-search" class="medieval-input"
                                placeholder="Buscar no Grande Grimório...">
                            <div id="sheet-spell-results" class="search-results-overlay hidden"></div>
                        </div>
                        <div id="spells-body" class="spells-list-v2"></div>
                    </div>

                    <!-- Aba Inventário: Itens, Moedas, Carga -->
                    <div id="sheet-inventario" class="sheet-section hidden">
                        <div class="inventory-top-grid">
                            <div class="coins-pouch">
                                <h4>Bolsa de Moedas</h4>
                                <div class="coins-grid">
                                    <div class="coin-item pc"><span>PC</span><input type="number"
                                            data-field="inventory.coins.pc"></div>
                                    <div class="coin-item pp"><span>PP</span><input type="number"
                                            data-field="inventory.coins.pp"></div>
                                    <div class="coin-item pe"><span>PE</span><input type="number"
                                            data-field="inventory.coins.pe"></div>
                                    <div class="coin-item po"><span>PO</span><input type="number"
                                            data-field="inventory.coins.po"></div>
                                    <div class="coin-item pl"><span>PL</span><input type="number"
                                            data-field="inventory.coins.pl"></div>
                                </div>
                            </div>
                            <div class="encumbrance-tracker">
                                <h4 class="section-title">Carga</h4>
                                <div class="weight-bar">
                                    <div id="weight-progress" class="bar"></div><span id="weight-text">0 / 0
                                        lbs</span>
                                </div>
                            </div>
                        </div>
                        <h4 class="section-title">Equipamentos & Tesouros</h4>
                        <div class="sheet-search-container">
                            <i class="fas fa-search"></i>
                            <input type="text" id="sheet-item-search" class="medieval-input"
                                placeholder="Buscar nos Arquivos de Itens...">
                            <div id="sheet-item-results" class="search-results-overlay hidden"></div>
                        </div>
                        <div id="inventory-body" class="inventory-list-v2"></div>
                    </div>

                    <!-- Aba História: Notas, Traços, Exaustão -->
                    <div id="sheet-historia" class="sheet-section hidden">
                        <div class="traits-full-grid">
                            <div class="form-group">
                                <h4 class="section-title">Traços de Personalidade</h4><textarea
                                    data-field="story.traits" class="medieval-textarea"></textarea>
                            </div>
                            <div class="form-group">
                                <h4 class="section-title">Ideais</h4><textarea data-field="story.ideals"
                                    class="medieval-textarea"></textarea>
                            </div>
                            <div class="form-group">
                                <h4 class="section-title">Vínculos</h4><textarea data-field="story.bonds"
                                    class="medieval-textarea"></textarea>
                            </div>
                            <div class="form-group">
                                <h4 class="section-title">Defeitos</h4><textarea data-field="story.flaws"
                                    class="medieval-textarea"></textarea>
                            </div>
                            <div class="form-group">
                                <h4 class="section-title">Maneirismos</h4><textarea data-field="story.mannerisms"
                                    class="medieval-textarea"></textarea>
                            </div>
                            <div class="form-group">
                                <h4 class="section-title">Talento de Interpretação</h4><textarea
                                    data-field="story.talents" class="medieval-textarea"></textarea>
                            </div>
                        </div>
                        <div class="chronic-notes">
                            <h4 class="section-title">Aparência</h4>
                            <textarea data-field="story.appearance" class="medieval-textarea"
                                placeholder="Aparência física..."></textarea>

                            <h4 class="section-title">História</h4>
                            <textarea data-field="story.notes" class="medieval-textarea large"
                                placeholder="Suas crônicas escritas nas estrelas..."></textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('main-content')?.insertAdjacentHTML('beforeend', fichasHtml);
        document.getElementById('modal-body')?.insertAdjacentHTML('beforeend', sheetHtml);
    },

    characterBackup: null,
    currentCharacter: null,
    isInspection: false,

    // Spell Schools to Assets mapping
    SPELL_ICONS: {
        'abjuracao': 'assets/icons/schools/abjuration.png',
        'abjuration': 'assets/icons/schools/abjuration.png',
        'adivinhacao': 'assets/icons/schools/divination.png',
        'divination': 'assets/icons/schools/divination.png',
        'conjuracao': 'assets/icons/schools/conjuration.png',
        'conjuration': 'assets/icons/schools/conjuration.png',
        'encantamento': 'assets/icons/schools/enchantment.png',
        'enchantment': 'assets/icons/schools/enchantment.png',
        'evocacao': 'assets/icons/schools/evocation.png',
        'evocation': 'assets/icons/schools/evocation.png',
        'ilusao': 'assets/icons/schools/illusion.png',
        'illusion': 'assets/icons/schools/illusion.png',
        'necromancia': 'assets/icons/schools/necromancy.png',
        'necromancy': 'assets/icons/schools/necromancy.png',
        'transmutacao': 'assets/icons/schools/transmutation.png',
        'transmutation': 'assets/icons/schools/transmutation.png'
    },

    getSchoolIcon(school) {
        if (!school) return null;
        const norm = school.toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ç/g, 'c');
        return this.SPELL_ICONS[norm] || null;
    },

    calculateDND5eStats(char) {
        return DND5eSystem.calculateStats(char);
    },

    toggleSheetEdit(enable, character, context) {
        const shouldEnable = context.isInspection ? false : true;

        const sheet = document.getElementById('character-sheet');
        if (!sheet) return;

        sheet.classList.toggle('is-editing', shouldEnable);

        sheet.querySelectorAll('.medieval-input, .medieval-select, textarea, input[type="checkbox"]').forEach(el => {
            if (el.closest('.search-container')) return;
            el.readOnly = !shouldEnable;
            el.disabled = !shouldEnable;
        });

        if (shouldEnable && character) {
            this.characterBackup = JSON.parse(JSON.stringify(character));
        }
    },

    cancelSheetEdit(character, context) {
        if (this.isInspection) return character;
        this.toggleSheetEdit(false, this.characterBackup || character, context);
        return character;
    },

    async saveSheetChanges(character, context) {
        if (this.isInspection) return character;
        if (!character) return;
        const sheet = document.getElementById('character-sheet');
        const updates = {
            bio: { ...(character.bio || {}) },
            attributes: { ...(character.attributes || {}) },
            stats: { ...(character.stats || {}) },
            story: { ...(character.story || {}) },
            combat: { ...(character.combat || {}) },
            spells: { ...(character.spells || {}) },
            inventory: { ...(character.inventory || {}) },
            proficiencies_choice: { ...(character.proficiencies_choice || {}) }
        };

        // Gather basic inputs
        sheet.querySelectorAll('[data-field]').forEach(el => {
            if (el.closest('.list-item-v2')) return;

            const field = el.dataset.field;
            if (!field.includes('.')) return;
            if (field.startsWith('death_saves.')) return;

            const keys = field.split('.');
            let val;

            if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                if (el.type === 'checkbox') {
                    val = el.checked;
                } else {
                    val = el.type === 'number' ? parseInt(el.value) || 0 : el.value;
                }
            } else {
                const input = el.querySelector('input, select');
                if (input) {
                    val = input.type === 'number' ? parseInt(input.value) || 0 : input.value;
                } else return;
            }

            let target = updates;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!target[keys[i]]) target[keys[i]] = {};
                target = target[keys[i]];
            }
            target[keys[keys.length - 1]] = val;
        });

        const succCount = sheet.querySelectorAll('[data-field="death_saves.successes"]:checked').length;
        const failCount = sheet.querySelectorAll('[data-field="death_saves.failures"]:checked').length;
        updates.death_saves = { successes: succCount, failures: failCount };

        updates.combat.attacks = this.gatherList('#attacks-body', 'combat.attacks');
        updates.spells.list = this.gatherList('#spells-body', 'spells.list');
        updates.inventory.items = this.gatherList('#inventory-body', 'inventory.items');

        logger.debug("[SheetModule:Save] Configuração de Magias antes de salvar:", updates.spells.list.map(s => `${s.name}: prepared=${s.prepared} (type:${typeof s.prepared})`));
        logger.debug("[SheetModule:Save] Objeto de atualização final:", updates);

        if (updates.bio && updates.bio.name) {
            updates.name = updates.bio.name;
        }

        try {
            await updateCharacter(character.id, updates);
            const updatedChar = { ...character, ...updates };
            this.populateSheet(updatedChar, context);

            if (window.app && window.app.selectCharacter && !this.isInspection) {
                window.app.selectCharacter(updatedChar);
            }

            context.showAlert("Ficha salva com sucesso!", "Grimório de Personagens");
            return updatedChar;
        } catch (err) {
            const { translateFirebaseError } = await import('./utils.js');
            context.showAlert("Erro ao salvar: " + translateFirebaseError(err), "Aviso");
            throw err;
        } finally {
            if (context.toggleLoading) context.toggleLoading(false);
        }
    },

    switchSheetTab(tabId, context) {
        document.querySelectorAll('.sheet-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
        document.querySelectorAll('.sheet-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`sheet-${tabId}`).classList.remove('hidden');
        if (context.updateScrollIndicators) context.updateScrollIndicators();

        const visibleTextareas = document.querySelectorAll(`#sheet-${tabId} .medieval-textarea`);
        visibleTextareas.forEach(ta => this.autoResizeTextarea(ta));
    },

    // --- Card Renderers ---

    renderSpellCard(sp, i) {
        const iconPath = this.getSchoolIcon(sp.school);
        const iconHtml = iconPath
            ? `<img src="${iconPath}" alt="${sp.school}" class="school-icon-small">`
            : `<i class="fas fa-sparkles"></i>`;

        // Structured mechanics from ability_data
        const ab = sp.ability_data || null;
        let mechanicsBadges = '';
        if (ab) {
            const em = ab.execution_mechanics || {};
            const act = ab.activation || {};
            const actLabel = { 'Action': 'Ação', 'Bonus': 'Bônus', 'Reaction': 'Reação' };
            const badges = [];
            if (act.type) badges.push(`<span class="card-v2-badge">${actLabel[act.type] || act.type}</span>`);
            if (em.has_save && em.save?.ability) badges.push(`<span class="card-v2-badge save">CD ${em.save.dc_value || '?'} ${em.save.ability}</span>`);
            if (em.damage && em.damage.length > 0) {
                const dmg = em.damage[0];
                badges.push(`<span class="card-v2-badge dmg">${dmg.dice_count||1}d${dmg.dice_type||6} ${dmg.damage_type||''}</span>`);
            }
            if (badges.length > 0) mechanicsBadges = `<div class="card-v2-badges">${badges.join('')}</div>`;
        }

        return `
            <div class="sheet-card-v2 list-item-v2" data-index="${i}" data-list="spells.list">
                <div class="card-v2-header">
                    <div class="card-v2-icon">${iconHtml}</div>
                    <div class="card-v2-title-section">
                        <span class="card-v2-title">${escapeHTML(sp.name || 'Magia Desconhecida')}</span>
                        <span class="card-v2-subtitle">${escapeHTML(sp.level || 'Truque')} • ${escapeHTML(sp.school || 'Evocação')}</span>
                    </div>
                </div>
                <div class="card-v2-content">
                    <div class="card-v2-stats">
                        <div class="card-v2-stat"><strong>Alcance</strong> <span>${escapeHTML(sp.range || '-')}</span></div>
                        <div class="card-v2-stat"><strong>Conjunção</strong> <span>${escapeHTML(sp.casting_time || sp.castingTime || '-')}</span></div>
                        <div class="card-v2-stat"><strong>Duração</strong> <span>${escapeHTML(sp.duration || '-')}</span></div>
                        <div class="card-v2-stat"><strong>Comp.</strong> <span>${escapeHTML(sp.components || '-')}</span></div>
                    </div>
                    ${mechanicsBadges}
                    ${sp.description ? `<div class="card-v2-desc">${parseMarkdown(sp.description)}</div>` : ''}
                </div>
                <div class="card-v2-actions">
                    <label class="prep-toggle" title="Preparar Magia">
                    <input type="checkbox" ${sp.prepared ? 'checked' : ''} data-field="prepared">
                    <i class="fas fa-book"></i>
                </label>
                    <button class="icon-btn delete-list-item delete-btn" data-list="spells.list" data-index="${i}" title="Remover"><i class="fas fa-trash"></i></button>
                    <!-- HIDDEN INPUTS FOR GATHERER -->
                    <input type="hidden" data-field="name" value="${escapeHTML(sp.name || '')}">
                    <input type="hidden" data-field="level" value="${escapeHTML(sp.level || '')}">
                    <input type="hidden" data-field="school" value="${escapeHTML(sp.school || '')}">
                    <input type="hidden" data-field="range" value="${escapeHTML(sp.range || '')}">
                    <input type="hidden" data-field="casting_time" value="${escapeHTML(sp.casting_time || sp.castingTime || '')}">
                    <input type="hidden" data-field="duration" value="${escapeHTML(sp.duration || '')}">
                    <input type="hidden" data-field="components" value="${escapeHTML(sp.components || '')}">
                    <input type="hidden" data-field="description" value="${escapeHTML(sp.description || '')}">
                    ${ab ? `<input type="hidden" data-field="ability_data" value="${escapeHTML(JSON.stringify(ab))}">` : ''}
                </div>
            </div>
        `;
    },

    renderItemCard(it, i) {
        let rarityRaw = (it.rarity || 'common').toLowerCase();
        const rarityMap = {
            'comum': 'common',
            'incomum': 'uncommon',
            'raro': 'rare',
            'muito raro': 'very_rare',
            'muito_raro': 'very_rare',
            'lendário': 'legendary',
            'lendario': 'legendary'
        };
        const rarity = rarityMap[rarityRaw] || rarityRaw.replace(' ', '_');

        const icon = (it.type === 'Weapon' || it.type === 'Arma') ? 'fa-hammer' : ((it.type === 'Armor' || it.type === 'Armadura') ? 'fa-shield-alt' : 'fa-bag-shopping');

        // Structured mechanics from ability_data
        const ab = it.ability_data || null;
        let mechanicsBadges = '';
        if (ab) {
            const em = ab.execution_mechanics || {};
            const badges = [];
            if (em.has_attack_roll) badges.push(`<span class="card-v2-badge">Ataque</span>`);
            if (em.damage && em.damage.length > 0) {
                const dmg = em.damage[0];
                badges.push(`<span class="card-v2-badge dmg">${dmg.dice_count||1}d${dmg.dice_type||6} ${dmg.damage_type||''}</span>`);
            }
            if (em.has_save && em.save?.ability) badges.push(`<span class="card-v2-badge save">CD ${em.save.dc_value||'?'} ${em.save.ability}</span>`);
            if (badges.length > 0) mechanicsBadges = `<div class="card-v2-badges">${badges.join('')}</div>`;
        }

        return `
            <div class="sheet-card-v2 list-item-v2 rarity-${rarity}" data-index="${i}" data-list="inventory.items">
                <div class="card-v2-header">
                    <div class="card-v2-icon"><i class="fas ${icon}"></i></div>
                    <div class="card-v2-title-section">
                        <span class="card-v2-title">${escapeHTML(it.name || 'Item')}</span>
                        <span class="card-v2-subtitle">${escapeHTML(it.type || 'Equipamento')} • ${escapeHTML(it.rarity || 'Comum')}</span>
                    </div>
                </div>
                <div class="card-v2-content">
                    <div class="card-v2-stats">
                        <div class="card-v2-stat"><strong>Peso</strong> <span>${Number(it.weight) || 0} lbs</span></div>
                        <div class="card-v2-stat"><strong>Qtd</strong> <span>x${Number(it.quantity) || 1}</span></div>
                    </div>
                    ${mechanicsBadges}
                    ${it.description ? `<div class="card-v2-desc">${parseMarkdown(it.description)}</div>` : ''}
                </div>
                <div class="card-v2-actions">
                    <label class="equip-toggle" title="Equipar Item">
                        <input type="checkbox" data-field="equipped" ${it.equipped ? 'checked' : ''}>
                        <i class="fas fa-shield-alt"></i>
                    </label>
                    <button class="icon-btn delete-list-item delete-btn" data-list="inventory.items" data-index="${i}" title="Remover"><i class="fas fa-trash"></i></button>
                    <!-- HIDDEN INPUTS FOR GATHERER AND SYNC -->
                    <input type="hidden" data-field="name" value="${escapeHTML(it.name || '')}">
                    <input type="hidden" data-field="weight" value="${Number(it.weight) || 0}">
                    <input type="hidden" data-field="quantity" value="${Number(it.quantity) || 1}">
                    <input type="hidden" data-field="type" value="${escapeHTML(it.type || '')}">
                    <input type="hidden" data-field="rarity" value="${escapeHTML(it.rarity || '')}">
                    <input type="hidden" data-field="description" value="${escapeHTML(it.description || '')}">
                    <input type="hidden" data-field="damage" value="${escapeHTML(it.damage || '')}">
                    ${ab ? `<input type="hidden" data-field="ability_data" value="${escapeHTML(JSON.stringify(ab))}">` : ''}
                </div>
            </div>
        `;
    }
};

// ── Mix in sub-module methods ──
Object.assign(SheetModule, createPopulateMixin(SheetModule));
Object.assign(SheetModule, createSearchMixin(SheetModule));

window.SheetModule = SheetModule;
