
import { updateCharacter } from '../data.js';

/**
 * Sheet Module
 * Handles Character Sheet display, editing, calculations, and interactions.
 */

export const SheetModule = {

    characterBackup: null,

    // --- Core Logic ---
    calculateDND5eStats(char) {
        if (!char.bio) char.bio = {};
        if (!char.attributes) char.attributes = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        if (!char.stats) char.stats = { hp_max: 10, hp_current: 10, ac: 10, initiative: 0, speed: "9m" };

        const level = parseInt(char.bio.level) || 1;
        const profBonus = Math.ceil(level / 4) + 1;
        char.stats.proficiency_bonus = profBonus;

        const getMod = (val) => Math.floor((parseInt(val) - 10) / 2);
        const strMod = getMod(char.attributes.str);
        const dexMod = getMod(char.attributes.dex);
        const conMod = getMod(char.attributes.con);
        const intMod = getMod(char.attributes.int);
        const wisMod = getMod(char.attributes.wis);
        const chaMod = getMod(char.attributes.cha);

        // Passive Perception
        const perProf = (char.proficiencies_choice?.skills || []).includes('percepcao') ? profBonus : 0;
        const perExpert = (char.proficiencies_choice?.expertise || []).includes('percepcao') ? profBonus : 0;
        char.stats.passive_perception = 10 + wisMod + perProf + perExpert;

        // Initiative
        char.stats.initiative = dexMod;

        // Encumbrance
        if (char.inventory) {
            let totalWeight = 0;
            (char.inventory.items || []).forEach(item => {
                totalWeight += (parseFloat(item.weight) || 0) * (parseInt(item.quantity) || 1);
            });
            const coins = char.inventory.coins || {};
            const totalCoins = (parseInt(coins.pc) || 0) + (parseInt(coins.pp) || 0) + (parseInt(coins.pe) || 0) + (parseInt(coins.po) || 0) + (parseInt(coins.pl) || 0);
            totalWeight += totalCoins / 50;

            char.inventory.encumbrance = {
                current: parseFloat(totalWeight.toFixed(2)),
                limit: (parseInt(char.attributes.str) || 10) * 15
            };
        }

        // Initial HP Calculation if zero (or not set)
        if (!char.stats.hp_max || char.stats.hp_max === 0) {
            const hitDie = char.bio.hitDie ? parseInt(char.bio.hitDie.replace('d', '')) : 8;
            char.stats.hp_max = hitDie + conMod + ((level - 1) * (Math.floor(hitDie / 2) + 1 + conMod));
            char.stats.hp_current = char.stats.hp_max;
        }

        // AC Calculation
        if (!char.stats.ac || char.stats.ac === 10) {
            char.stats.ac = 10 + dexMod;
        }

        return { strMod, dexMod, conMod, intMod, wisMod, chaMod, profBonus };
    },

    // --- UI Rendering ---
    populateSheet(char, context) {
        if (!char) return;

        // Run Engine
        const mods = this.calculateDND5eStats(char);

        // Header Info
        document.getElementById('sheet-char-name').innerText = char.name || char.bio?.name || 'Sem Nome';
        document.getElementById('sheet-char-info').innerText = `${char.bio?.race || '?'} • ${char.bio?.class || '?'} • Nível ${char.bio?.level || 1}`;
        document.getElementById('sheet-token').src = char.tokenUrl || (context?.isDamien ? 'assets/Damien_Token.png' : 'assets/Lyra_Token.png');

        // Main Tab
        const b = char.bio || {};
        document.getElementById('sheet-background').innerText = b.background || "Nenhum";
        document.getElementById('sheet-alignment').innerText = b.alignment || "Neutro";
        document.getElementById('sheet-xp').innerText = b.xp || "0";
        document.getElementById('sheet-player-name').innerText = b.playerName || "-";

        document.getElementById('sheet-prof').innerText = mods.profBonus >= 0 ? `+${mods.profBonus}` : mods.profBonus;
        document.getElementById('sheet-passive-percep').innerText = char.stats.passive_perception;

        // Scores
        const scoresGrid = document.getElementById('sheet-scores');
        if (scoresGrid) {
            const attrMap = [
                { id: 'str', l: 'FOR', v: char.attributes.str, m: mods.strMod },
                { id: 'dex', l: 'DEX', v: char.attributes.dex, m: mods.dexMod },
                { id: 'con', l: 'CON', v: char.attributes.con, m: mods.conMod },
                { id: 'int', l: 'INT', v: char.attributes.int, m: mods.intMod },
                { id: 'wis', l: 'WIS', v: char.attributes.wis, m: mods.wisMod },
                { id: 'cha', l: 'CHA', v: char.attributes.cha, m: mods.chaMod }
            ];
            scoresGrid.innerHTML = attrMap.map(a => `
                <div class="score-card">
                    <span class="score-label">${a.l}</span>
                    <span class="score-val editable" data-field="attributes.${a.id}">${a.v}</span>
                    <span class="score-mod">${a.m >= 0 ? `+${a.m}` : a.m}</span>
                </div>
            `).join('');
        }

        // Saves
        const savesContainer = document.getElementById('sheet-saves');
        if (savesContainer) {
            const saves = [
                { id: 'str', l: 'Força' }, { id: 'dex', l: 'Destreza' }, { id: 'con', l: 'Constituição' },
                { id: 'int', l: 'Inteligência' }, { id: 'wis', l: 'Sabedoria' }, { id: 'cha', l: 'Carisma' }
            ];
            savesContainer.innerHTML = saves.map(s => {
                const isProf = (char.proficiencies_choice?.saves || []).includes(s.id);
                const val = mods[`${s.id}Mod`] + (isProf ? mods.profBonus : 0);
                return `
                    <div class="save-item ${isProf ? 'proficient' : ''}">
                        <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''}" style="font-size: 0.5rem; color: ${isProf ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf ? 1 : 0.3}; cursor: pointer;" data-type="saves" data-field="${s.id}"></i>
                        <span>${s.l}</span>
                        <span style="margin-left: auto;">${val >= 0 ? `+${val}` : val}</span>
                    </div>
                `;
            }).join('');
        }

        // Skills
        const skillsContainer = document.getElementById('sheet-skills');
        if (skillsContainer) {
            const skills = [
                { id: 'acrobacia', l: 'Acrobacia (Des)' }, { id: 'adestrar_animais', l: 'Adestrar Animais (Sab)' },
                { id: 'arcanismo', l: 'Arcanismo (Int)' }, { id: 'atletismo', l: 'Atletismo (For)' },
                { id: 'atuacao', l: 'Atuação (Car)' }, { id: 'enganacao', l: 'Enganação (Car)' },
                { id: 'furtividade', l: 'Furtividade (Des)' }, { id: 'historia', l: 'História (Int)' },
                { id: 'intimidacao', l: 'Intimidação (Car)' }, { id: 'intuicao', l: 'Intuição (Sab)' },
                { id: 'investigacao', l: 'Investigação (Int)' }, { id: 'medicina', l: 'Medicina (Sab)' },
                { id: 'natureza', l: 'Natureza (Int)' }, { id: 'percepcao', l: 'Percepção (Sab)' },
                { id: 'persuasao', l: 'Persuasão (Car)' }, { id: 'prestidigitacao', l: 'Prestidigitação (Des)' },
                { id: 'religiao', l: 'Religião (Int)' }, { id: 'sobrevivencia', l: 'Sobrevivência (Sab)' }
            ];
            skillsContainer.innerHTML = skills.map(sk => {
                const isProf = (char.proficiencies_choice?.skills || []).includes(sk.id);
                const isExpert = (char.proficiencies_choice?.expertise || []).includes(sk.id);
                // Extract attribute from label (e.g., "(Sab)")
                const match = sk.l.match(/\((.*?)\)/);
                const attrRaw = match ? match[1] : 'Sab';
                const attr = attrRaw.toLowerCase().replace('sab', 'wis').replace('des', 'dex').replace('for', 'str').replace('car', 'cha');
                const val = mods[`${attr}Mod`] + (isProf ? mods.profBonus : 0) + (isExpert ? mods.profBonus : 0);

                return `
                    <div class="skill-item ${isProf ? 'proficient' : ''}">
                        <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''} ${isExpert ? 'expert' : ''}" style="font-size: 0.5rem; color: ${isProf || isExpert ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf || isExpert ? 1 : 0.3}; cursor: pointer;" data-type="skills" data-field="${sk.id}"></i>
                        <span>${sk.l}</span>
                        <span style="margin-left: auto;">${val >= 0 ? `+${val}` : val}</span>
                    </div>
                `;
            }).join('');
        }

        // Combat Tab
        const s = char.stats || {};
        document.getElementById('sheet-ca').innerText = s.ac;
        document.getElementById('sheet-inic').innerText = s.initiative >= 0 ? `+ ${s.initiative} ` : s.initiative;
        document.getElementById('sheet-speed').innerText = s.speed;

        document.getElementById('sheet-hp-curr').value = s.hp_current;
        document.getElementById('sheet-hp-max').value = s.hp_max;
        document.getElementById('sheet-hp-temp').value = s.hp_temp || 0;

        document.getElementById('sheet-hd-curr').value = s.hit_dice_current || 0;
        const hdTotalEl = document.getElementById('sheet-hd-total');
        if (hdTotalEl) hdTotalEl.innerText = s.hit_dice_total || `${b.level}d${b.hitDie || 8}`;

        // Death Saves
        const ds = char.death_saves || { successes: 0, failures: 0 };
        for (let i = 1; i <= 3; i++) {
            const sEl = document.getElementById(`death-s${i}`);
            const fEl = document.getElementById(`death-f${i}`);
            if (sEl) sEl.checked = ds.successes >= i;
            if (fEl) fEl.checked = ds.failures >= i;
        }

        // Inventory Tab
        const inv = char.inventory || { coins: {}, items: [], encumbrance: { current: 0, limit: 150 } };
        const coins = inv.coins || {};
        document.querySelectorAll('.coin-item input').forEach(input => {
            const field = input.dataset.field.split('.').pop();
            input.value = coins[field] || 0;
        });

        const weightBar = document.getElementById('weight-progress');
        const weightText = document.getElementById('weight-text');
        if (weightBar && weightText) {
            const perc = Math.min((inv.encumbrance.current / inv.encumbrance.limit) * 100, 100);
            weightBar.style.width = `${perc}%`;
            weightText.innerText = `${inv.encumbrance.current} / ${inv.encumbrance.limit} lbs`;
        }

        // Attacks List
        const attacksBody = document.getElementById('attacks-body');
        if (attacksBody) {
            attacksBody.innerHTML = (char.combat?.attacks || []).map((atk, i) => `
                <div class="list-item-v2" data-index="${i}">
                    <input type="text" value="${atk.name || ''}" placeholder="Nome" data-list="combat.attacks" data-field="name" readonly>
                    <input type="text" value="${atk.bonus || ''}" placeholder="Bônus" data-list="combat.attacks" data-field="bonus" readonly>
                    <input type="text" value="${atk.damage || ''}" placeholder="Dano" data-list="combat.attacks" data-field="damage" readonly>
                    <button class="icon-btn delete-list-item" data-list="combat.attacks" data-index="${i}"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        // Spells List
        const spellsBody = document.getElementById('spells-body');
        if (spellsBody) {
            spellsBody.innerHTML = (char.spells?.list || []).map((sp, i) => `
                <div class="list-item-v2" data-index="${i}">
                    <input type="text" value="${sp.name || ''}" placeholder="Magia" data-list="spells.list" data-field="name" readonly>
                    <input type="text" value="${sp.level || ''}" placeholder="Nív" data-list="spells.list" data-field="level" readonly>
                    <input type="text" value="${sp.range || ''}" placeholder="Alcance" data-list="spells.list" data-field="range" readonly>
                    <button class="icon-btn delete-list-item" data-list="spells.list" data-index="${i}"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        // Items List
        const inventoryBody = document.getElementById('inventory-body');
        if (inventoryBody) {
            inventoryBody.innerHTML = (char.inventory?.items || []).map((it, i) => `
                <div class="list-item-v2" data-index="${i}">
                    <input type="text" value="${it.name || ''}" placeholder="Item" data-list="inventory.items" data-field="name" readonly>
                    <input type="number" value="${it.quantity || 1}" placeholder="Qtd" data-list="inventory.items" data-field="quantity" readonly>
                    <input type="text" value="${it.weight || 0}" placeholder="Peso" data-list="inventory.items" data-field="weight" readonly>
                    <button class="icon-btn delete-list-item" data-list="inventory.items" data-index="${i}"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        // Story Tab
        const story = char.story || {};
        const chronicSection = document.getElementById('sheet-historia');
        if (chronicSection) {
            chronicSection.querySelectorAll('textarea').forEach(txt => {
                const parts = txt.dataset.field.split('.');
                const field = parts.length > 1 ? parts[1] : parts[0];
                txt.value = story[field] || "";
                txt.readOnly = true; // Lock by default
            });
        }
    },

    toggleSheetEdit(enable, character, context) {
        const sheet = document.getElementById('character-sheet');
        sheet.classList.toggle('edit-mode', enable);
        document.getElementById('edit-sheet-btn').classList.toggle('hidden', enable);
        document.getElementById('cancel-sheet-btn')?.classList.toggle('hidden', !enable);
        document.getElementById('save-sheet-btn').classList.toggle('hidden', !enable);

        if (enable) {
            this.characterBackup = JSON.parse(JSON.stringify(character));

            // Editable Spans (Principal)
            sheet.querySelectorAll('.editable').forEach(el => {
                const val = el.innerText === '-' ? '' : el.innerText;
                const field = el.dataset.field;
                const isNum = field.includes('attributes') || field.includes('xp');
                el.innerHTML = `<input type="${isNum ? 'number' : 'text'}" value="${val}" data-field="${field}">`;
            });

            // Textareas (Crônicas)
            sheet.querySelectorAll('textarea[data-field]').forEach(txt => txt.readOnly = false);

            // Inputs Diretos (Combate/Mochila)
            sheet.querySelectorAll('input[data-field]').forEach(input => {
                input.readOnly = false;
                input.disabled = false;
            });

            // Selects
            sheet.querySelectorAll('select[data-field]').forEach(sel => sel.disabled = false);

            // Alignment -> Select
            const alignmentEl = document.getElementById('sheet-alignment');
            if (alignmentEl) {
                const current = alignmentEl.innerText;
                alignmentEl.innerHTML = `
                    <select data-field="bio.alignment" class="wizard-select small">
                        <option value="Leal e Bom" ${current === 'Leal e Bom' ? 'selected' : ''}>Leal e Bom</option>
                        <option value="Neutro e Bom" ${current === 'Neutro e Bom' ? 'selected' : ''}>Neutro e Bom</option>
                        <option value="Caótico e Bom" ${current === 'Caótico e Bom' ? 'selected' : ''}>Caótico e Bom</option>
                        <option value="Leal e Neutro" ${current === 'Leal e Neutro' ? 'selected' : ''}>Leal e Neutro</option>
                        <option value="Neutro" ${current === 'Neutro' ? 'selected' : ''}>Neutro</option>
                        <option value="Caótico e Neutro" ${current === 'Caótico e Neutro' ? 'selected' : ''}>Caótico e Neutro</option>
                        <option value="Leal e Mau" ${current === 'Leal e Mau' ? 'selected' : ''}>Leal e Mau</option>
                        <option value="Neutro e Mau" ${current === 'Neutro e Mau' ? 'selected' : ''}>Neutro e Mau</option>
                        <option value="Caótico e Mau" ${current === 'Caótico e Mau' ? 'selected' : ''}>Caótico e Mau</option>
                    </select>
                `;
            }
        } else {
            // Restore display mode or discard changes
            if (character) this.populateSheet(character, context);
            sheet.querySelectorAll('textarea[data-field]').forEach(txt => txt.readOnly = true);
            sheet.querySelectorAll('input[data-field]').forEach(input => {
                input.readOnly = true;
                input.disabled = (input.type === 'checkbox');
            });
            sheet.querySelectorAll('select[data-field]').forEach(sel => sel.disabled = true);
        }
    },

    cancelSheetEdit(character, context) {
        if (this.characterBackup) {
            // Restore logical state by returning backup, caller handles assignment
            this.toggleSheetEdit(false, this.characterBackup, context);
            return this.characterBackup;
        }
        this.toggleSheetEdit(false, character, context);
        return character;
    },

    async saveSheetChanges(character, context) {
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
            const field = el.dataset.field;
            const keys = field.split('.');
            let val;

            if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                val = el.type === 'number' ? parseInt(el.value) || 0 : el.value;
            } else {
                const input = el.querySelector('input, select');
                if (input) {
                    val = input.type === 'number' ? parseInt(input.value) || 0 : input.value;
                } else return;
            }

            // Deep set
            let target = updates;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!target[keys[i]]) target[keys[i]] = {};
                target = target[keys[i]];
            }
            target[keys[keys.length - 1]] = val;
        });

        // Gather Lists
        const gatherList = (selector, path) => {
            const items = [];
            sheet.querySelectorAll(`${selector} .list-item-v2`).forEach(row => {
                const item = {};
                row.querySelectorAll('input').forEach(input => {
                    const f = input.dataset.field;
                    item[f] = input.type === 'number' ? parseInt(input.value) || 0 : input.value;
                });
                items.push(item);
            });
            const keys = path.split('.');
            let target = updates;
            for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
            target[keys[keys.length - 1]] = items;
        };

        gatherList('#attacks-body', 'combat.attacks');
        gatherList('#spells-body', 'spells.list');
        gatherList('#inventory-body', 'inventory.items');

        try {
            await updateCharacter(character.id, updates);
            // Merge updates
            const updatedChar = { ...character, ...updates };
            this.populateSheet(updatedChar, context);
            this.toggleSheetEdit(false, updatedChar, context);
            context.showAlert("Ficha salva com sucesso!", "Grimório de Personagens");
            return updatedChar;
        } catch (err) {
            context.showAlert("Erro ao salvar: " + err.message, "Aviso");
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
    }
};
