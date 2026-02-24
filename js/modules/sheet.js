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
            bio: { ...character.bio },
            attributes: { ...character.attributes },
            stats: { ...character.stats },
            story: { ...character.story },
            combat: { ...character.combat || {} },
            spells: { ...character.spells || {} },
            inventory: { ...character.inventory || {} },
            proficiencies_choice: { ...character.proficiencies_choice || {} }
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
                </div>
            </div>
        `;
    }
};

// ── Mix in sub-module methods ──
Object.assign(SheetModule, createPopulateMixin(SheetModule));
Object.assign(SheetModule, createSearchMixin(SheetModule));

window.SheetModule = SheetModule;
