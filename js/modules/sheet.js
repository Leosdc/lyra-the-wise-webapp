
import { updateCharacter, getGlobalItems, getSpells, getUserItems, getUserSpells, getSystemData } from '../data.js';
import { RACES, CLASSES, ALIGNMENTS, SUBRACES, ARCHETYPES, BACKGROUNDS } from '../constants.js';
import { DND5eSystem } from '../systems/dnd5e.js';
import { escapeHTML, parseMarkdown } from './utils.js';
import { logger } from '../logger.js';

/**
 * Sheet Module
 * Handles Character Sheet display, editing, calculations, and interactions.
 */

export const SheetModule = {

    characterBackup: null,
    currentCharacter: null, // Track currently open character
    isInspection: false, // Track if current sheet is in read-only inspection mode

    // Spell Schools to Assets mapping (.png from Grimoire)
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
        // Delegated to D&D 5e System Module
        return DND5eSystem.calculateStats(char);
    },


    async populateSheet(char, context) {
        if (!char) return;
        this.currentCharacter = char;
        this.isInspection = !!context.isInspection;

        const sheetEl = document.getElementById('character-sheet');
        if (sheetEl) {
            sheetEl.classList.toggle('is-inspection', this.isInspection);
        }

        // Fetch System Data for Dropdowns
        let systemData = null;
        try {
            systemData = await getSystemData(context.currentSystem || 'dnd5e');
        } catch (e) { logger.error("Error loading system data", e); }

        const validRaces = systemData?.races || RACES;
        // Handle migration where races might be objects {raca: "Elf", subracas: []} or just strings
        const raceOptions = validRaces.map(r => r.raca || r);

        const validClasses = systemData?.classes || CLASSES;
        const classOptions = validClasses.map(c => c.nome || c);

        const systemStats = this.calculateDND5eStats(char);

        if (char.inventory?.items && char.combat?.attacks) {
            const inventoryNames = new Set(char.inventory.items.map(i => i.name));
            char.combat.attacks = char.combat.attacks.filter(atk => {
                if (atk.isCustom) return true; // Keep custom
                return inventoryNames.has(atk.name); // Keep if in inventory
            });
        }


        // Adapter: Convert new structured stats to legacy flat "mods" object for UI compatibility
        const mods = {
            profBonus: systemStats.general.profBonus,
            strMod: systemStats.attributes.str.mod,
            dexMod: systemStats.attributes.dex.mod,
            conMod: systemStats.attributes.con.mod,
            intMod: systemStats.attributes.int.mod,
            wisMod: systemStats.attributes.wis.mod,
            chaMod: systemStats.attributes.cha.mod
        };

        if (systemStats.defaults) {
            if (!char.stats.hp_max || char.stats.hp_max === 0) {
                char.stats.hp_max = systemStats.defaults.hp_max;
                char.stats.hp_current = char.stats.hp_max;
            }
            if (!char.stats.ac || char.stats.ac === 10) {
                if (char.stats.ac === 10 && systemStats.defaults.ac !== 10) {
                    char.stats.ac = systemStats.defaults.ac;
                }
            }
        }

        // Helper to create seamless input
        const mkInput = (val, field, type = 'text', title = '', extraClass = '', extraAttrs = '') => {
            const safeVal = (type === 'number' || type === 'range') ? val : escapeHTML(String(val));
            return `<input type="${type}" value="${safeVal}" data-field="${field}" class="medieval-input seamless ${extraClass}" title="${escapeHTML(title) || 'Clique para editar'}" ${extraAttrs} ${context.isInspection ? 'disabled' : ''}>`;
        };

        // Helper to create seamless select
        const mkSelect = (val, field, options, title = '', extraClass = '') => {
            const opts = options.map(opt => {
                const safeOpt = escapeHTML(String(opt));
                return `<option value="${safeOpt}" ${opt === val ? 'selected' : ''}>${safeOpt}</option>`;
            }).join('');
            // Add custom option if current value is not in list
            const safeVal = escapeHTML(String(val));
            const customOpt = (val && !options.includes(val)) ? `<option value="${safeVal}" selected>${safeVal} (Custom)</option>` : '';
            return `<select data-field="${field}" class="medieval-select seamless ${extraClass}" title="${escapeHTML(title)}" ${context.isInspection ? 'disabled' : 'enabled'}>${customOpt}${opts}</select>`;
        }

        const race = char.bio?.race || 'Humano';
        const clazz = char.bio?.class || 'Guerreiro';
        const alignment = char.bio?.alignment || 'Neutro';
        const charLevel = char.bio?.level || 1;

        // UI Inspection Banner
        const banner = document.getElementById('sheet-inspection-banner');
        if (banner) {
            banner.innerHTML = context.isInspection ?
                `<div class="mirror-mode-badge"><i class="fas fa-eye"></i> PEREGRINO IDENTIFICADO (MODO DE INSPEÇÃO)</div>` : '';
            banner.classList.toggle('hidden', !context.isInspection);
        }

        const nameContainer = document.getElementById('sheet-char-name');
        if (nameContainer) {
            nameContainer.innerHTML = mkInput(char.bio?.name || char.name || 'Sem Nome', 'bio.name', 'text', 'Nome', 'sheet-name-input');
        }

        // Render Level
        const levelContainer = document.getElementById('sheet-level-val');
        if (levelContainer) {
            levelContainer.innerHTML = mkInput(charLevel, 'bio.level', 'number', 'Nível', 'sheet-level-input');
        }

        // Render Dropdowns (Race, Class, Alignment)
        const alignmentEl = document.getElementById('sheet-alignment-display');
        const raceEl = document.getElementById('sheet-race-display');
        const classEl = document.getElementById('sheet-class-display');

        if (alignmentEl) alignmentEl.innerHTML = mkSelect(alignment, 'bio.alignment', ALIGNMENTS, 'Alinhamento', 'header-input-box');

        // Enhance Race/Class Display with Sub-options
        const currentRaceData = validRaces.find(r => (r.raca || r) === race);
        const currentClassData = validClasses.find(c => (c.nome || c) === clazz);

        // Determine Sub-options based on fetched data
        let subOptions = ["Padrão"];
        if (currentRaceData && currentRaceData.subracas && currentRaceData.subracas.length > 0) {
            subOptions = currentRaceData.subracas;
        } else if (SUBRACES[race]) {
            subOptions = SUBRACES[race]; // Fallback to constants
        }

        let archOptions = ["Padrão"];
        if (currentClassData && currentClassData.arquetipos && currentClassData.arquetipos.length > 0) {
            archOptions = currentClassData.arquetipos;
        } else if (ARCHETYPES[clazz]) {
            archOptions = ARCHETYPES[clazz]; // Fallback to constants
        }

        // Race (Main Dropdown)
        if (raceEl) {
            raceEl.innerHTML = mkSelect(race, 'bio.race', raceOptions, 'Raça', 'header-input-box');
            // Bind Change Listener for Dynamic Updates
            const select = raceEl.querySelector('select');
            if (select) {
                select.addEventListener('change', async (e) => {
                    const newRace = e.target.value;

                    // Find new data
                    const newRaceData = validRaces.find(r => (r.raca || r) === newRace);
                    const newSubOptions = (newRaceData && newRaceData.subracas) ? newRaceData.subracas : (SUBRACES[newRace] || ["Padrão"]);

                    // Update Subrace Dropdown
                    const subSelect = document.querySelector('select[data-field="bio.subrace"]');
                    if (subSelect) {
                        subSelect.innerHTML = newSubOptions.map(opt => `<option value="${escapeHTML(opt)}">${escapeHTML(opt)}</option>`).join('');
                        // Trigger input event to ensure auto-save picks up change if needed? 
                        // Actually, the user will select a subrace next, so it's fine.
                    }
                });
            }
        }

        // Sub-race (Dynamic Dropdown)
        const subraceEl = document.getElementById('sheet-subrace-display');
        if (subraceEl) {
            const currentSub = char.bio?.subrace || subOptions[0];
            // Ensure current value is included even if not in list (custom)
            const displayOpts = subOptions.includes(currentSub) ? subOptions : [currentSub, ...subOptions];
            const uniqueOpts = [...new Set(displayOpts)];

            subraceEl.innerHTML = mkSelect(currentSub, 'bio.subrace', uniqueOpts, 'Sub-raça', 'header-input-box');
        }

        // Class (Main Dropdown)
        if (classEl) {
            classEl.innerHTML = mkSelect(clazz, 'bio.class', classOptions, 'Classe', 'header-input-box');
            // Bind Change Listener
            const select = classEl.querySelector('select');
            if (select) {
                select.addEventListener('change', (e) => {
                    const newClass = e.target.value;
                    const newClassData = validClasses.find(c => (c.nome || c) === newClass);
                    const newArchOptions = (newClassData && newClassData.arquetipos) ? newClassData.arquetipos : (ARCHETYPES[newClass] || ["Padrão"]);

                    const archSelect = document.querySelector('select[data-field="bio.archetype"]');
                    if (archSelect) {
                        archSelect.innerHTML = newArchOptions.map(opt => `<option value="${escapeHTML(opt)}">${escapeHTML(opt)}</option>`).join('');
                    }
                });
            }
        }

        // Archetype (Dynamic Dropdown)
        const archetypeEl = document.getElementById('sheet-archetype-display');
        if (archetypeEl) {
            const currentArch = char.bio?.archetype || archOptions[0];
            const displayOpts = archOptions.includes(currentArch) ? archOptions : [currentArch, ...archOptions];
            const uniqueOpts = [...new Set(displayOpts)];
            archetypeEl.innerHTML = mkSelect(currentArch, 'bio.archetype', uniqueOpts, 'Arquétipo', 'header-input-box');
        }




        document.getElementById('sheet-token').src = char.tokenUrl || (context?.isDamien ? 'assets/tokens/damien.png' : 'assets/tokens/lyra.png');

        // Main Tab
        const b = char.bio || {};
        const bioMap = {
            'sheet-background': { v: b.background || "Nenhum", f: 'bio.background', t: 'Antecedente do personagem' },
            'sheet-alignment': { v: b.alignment || "Neutro", f: 'bio.alignment', t: 'Alinhamento moral e ético' },
            'sheet-xp': { v: b.xp || "0", f: 'bio.xp', t: 'Pontos de Experiência atuais' },
            'sheet-player-name': { v: b.playerName || "-", f: 'bio.playerName', t: 'Nome do Jogador' }
        };

        for (const [id, data] of Object.entries(bioMap)) {
            const el = document.getElementById(id);
            if (!el) continue;

            if (id === 'sheet-background') {
                const currentBG = b.background || "Acólito";
                const displayOpts = BACKGROUNDS.includes(currentBG) ? BACKGROUNDS : [currentBG, ...BACKGROUNDS];
                const uniqueOpts = [...new Set(displayOpts)];
                el.innerHTML = mkSelect(currentBG, 'bio.background', uniqueOpts, 'Antecedente', 'seamless');
            } else {
                el.innerHTML = mkInput(data.v, data.f, 'text', data.t);
            }
        }

        const alignEl = document.getElementById('sheet-alignment');
        if (alignEl) {
            const alignments = ["Leal e Bom", "Neutro e Bom", "Caótico e Bom", "Leal e Neutro", "Neutro", "Caótico e Neutro", "Leal e Mau", "Neutro e Mau", "Caótico e Mau"];
            const currentAlign = b.alignment || "Neutro";
            const options = alignments.map(a => `<option value="${a}" ${a === currentAlign ? 'selected' : ''}>${a}</option>`).join('');
            alignEl.innerHTML = `<select data-field="bio.alignment" class="medieval-select seamless" style="width: 100%;" title="Alinhamento moral e ético">${options}</select>`;
        }

        document.getElementById('sheet-prof').innerText = systemStats.general.profBonusFormatted;
        document.getElementById('sheet-passive-percep').innerText = systemStats.general.passivePerception;

        // Scores
        const scoresGrid = document.getElementById('sheet-scores');
        if (scoresGrid) {
            const attrMap = [
                { id: 'str', l: 'FOR', v: char.attributes.str, m: mods.strMod, t: 'Força: Potência física e atletismo' },
                { id: 'dex', l: 'DES', v: char.attributes.dex, m: mods.dexMod, t: 'Destreza: Agilidade, reflexos e equilíbrio' },
                { id: 'con', l: 'CON', v: char.attributes.con, m: mods.conMod, t: 'Constituição: Saúde, vigor e força vital' },
                { id: 'int', l: 'INT', v: char.attributes.int, m: mods.intMod, t: 'Inteligência: Acuidade mental, memória e raciocínio' },
                { id: 'wis', l: 'SAB', v: char.attributes.wis, m: mods.wisMod, t: 'Sabedoria: Percepção, intuição e força de vontade' },
                { id: 'cha', l: 'CAR', v: char.attributes.cha, m: mods.chaMod, t: 'Carisma: Força de personalidade e liderança' }
            ];
            scoresGrid.innerHTML = attrMap.map(a => `
                <div class="score-card" title="${a.t}">
                    <span class="score-label">${a.l}</span>
                    ${mkInput(a.v, `attributes.${a.id}`, 'number', a.t, 'width: 50px; text-align: center; font-size: 1.4rem; font-weight: bold; background: transparent; border: none; padding: 0;')}
                    <span class="score-mod">${a.m >= 0 ? `+${a.m}` : a.m}</span>
                </div>
            `).join('');
        }

        // Saves
        const savesContainer = document.getElementById('sheet-saves');
        if (savesContainer) {
            const saves = [
                { id: 'str', l: 'Força', t: 'Resistir a empurrões ou aprisionamentos' },
                { id: 'dex', l: 'Destreza', t: 'Esquivar de efeitos de área' },
                { id: 'con', l: 'Constituição', t: 'Suportar venenos e doenças' },
                { id: 'int', l: 'Inteligência', t: 'Desacreditar ilusões' },
                { id: 'wis', l: 'Sabedoria', t: 'Resistir a efeitos mentais' },
                { id: 'cha', l: 'Carisma', t: 'Resistir a possessão' }
            ];
            savesContainer.innerHTML = saves.map(s => {
                const isProf = (char.proficiencies_choice?.saves || []).includes(s.id);
                const val = mods[`${s.id}Mod`] + (isProf ? mods.profBonus : 0);
                return `
                    <div class="save-item ${isProf ? 'proficient' : ''}" title="${context.isInspection ? 'Apenas Visualização' : s.t}">
                        <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''}" style="font-size: 0.5rem; color: ${isProf ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf ? 1 : 0.3}; cursor: ${context.isInspection ? 'default' : 'pointer'};" data-type="saves" data-field="${s.id}" ${context.isInspection ? 'disabled' : ''}></i>
                        <span>${s.l}</span>
                        <span class="save-value">${val >= 0 ? `+${val}` : val}</span>
                    </div>
                `;
            }).join('');
        }

        // Skills
        const skillsContainer = document.getElementById('sheet-skills');
        if (skillsContainer) {
            const skills = [
                { id: 'acrobacia', l: 'Acrobacia (Des)', t: 'Manter equilíbrio e realizar manobras' },
                { id: 'adestrar_animais', l: 'Adestrar Animais (Sab)', t: 'Acalmar ou controlar bestas' },
                { id: 'arcanismo', l: 'Arcanismo (Int)', t: 'Conhecimento sobre magia e planos' },
                { id: 'atletismo', l: 'Atletismo (For)', t: 'Escalar, nadar e pular' },
                { id: 'atuacao', l: 'Atuação (Car)', t: 'Entreter plateias' },
                { id: 'enganacao', l: 'Enganação (Car)', t: 'Mentir e ocultar a verdade' },
                { id: 'furtividade', l: 'Furtividade (Des)', t: 'Esconder-se e mover-se em silêncio' },
                { id: 'historia', l: 'História (Int)', t: 'Conhecimento sobre o passado' },
                { id: 'intimidacao', l: 'Intimidação (Car)', t: 'Ameaçar e coagir' },
                { id: 'intuicao', l: 'Intuição (Sab)', t: 'Detectar mentiras e emoções' },
                { id: 'investigacao', l: 'Investigação (Int)', t: 'Procurar pistas e deduzir' },
                { id: 'medicina', l: 'Medicina (Sab)', t: 'Estabilizar feridos e diagnosticar' },
                { id: 'natureza', l: 'Natureza (Int)', t: 'Conhecimento sobre flora e fauna' },
                { id: 'percepcao', l: 'Percepção (Sab)', t: 'Notar detalhes ao redor' },
                { id: 'persuasao', l: 'Persuasão (Car)', t: 'Convencer diplomaticamente' },
                { id: 'prestidigitacao', l: 'Prestidigitação (Des)', t: 'Mãos leves e truques manuais' },
                { id: 'religiao', l: 'Religião (Int)', t: 'Conhecimento sobre divindades' },
                { id: 'sobrevivencia', l: 'Sobrevivência (Sab)', t: 'Rastrear e caçar' }
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
                    <div class="skill-item ${isProf ? 'proficient' : ''}" title="${context.isInspection ? 'Apenas Visualização' : sk.t}">
                        <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''} ${isExpert ? 'expert' : ''}" style="font-size: 0.5rem; color: ${isProf || isExpert ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf || isExpert ? 1 : 0.3}; cursor: ${context.isInspection ? 'default' : 'pointer'};" data-type="skills" data-field="${sk.id}" ${context.isInspection ? 'disabled' : ''}></i>
                        <span>${sk.l}</span>
                        <span class="skill-value">${val >= 0 ? `+${val}` : val}</span>
                    </div>
                `;
            }).join('');
        }

        // Combat Tab
        const s = char.stats || {};
        document.getElementById('sheet-ca').innerHTML = mkInput(s.ac, 'stats.ac', 'number', 'Classe de Armadura');
        document.getElementById('sheet-inic').innerHTML = mkInput(s.initiative, 'stats.initiative', 'number', 'Iniciativa');
        document.getElementById('sheet-speed').innerHTML = mkInput(s.speed, 'stats.speed', 'text', 'Deslocamento');

        const hpCurr = document.getElementById('sheet-hp-curr');
        const hpMax = document.getElementById('sheet-hp-max');
        const hpTemp = document.getElementById('sheet-hp-temp');

        if (hpCurr) { hpCurr.value = s.hp_current; hpCurr.disabled = context.isInspection; }
        if (hpMax) { hpMax.value = s.hp_max; hpMax.disabled = context.isInspection; }
        if (hpTemp) { hpTemp.value = s.hp_temp || 0; hpTemp.disabled = context.isInspection; }

        document.getElementById('sheet-hd-curr').value = s.hit_dice_current || 0;
        const hdTotalEl = document.getElementById('sheet-hd-total');
        if (hdTotalEl) hdTotalEl.innerHTML = mkInput(s.hit_dice_total || `${b.level}d${b.hitDie || 8}`, 'stats.hit_dice_total', 'text', 'Total de Dados de Vida');

        // Death Saves
        const ds = char.death_saves || { successes: 0, failures: 0 };
        const succ = parseInt(ds.successes) || 0;
        const fail = parseInt(ds.failures) || 0;
        for (let i = 1; i <= 3; i++) {
            const sEl = document.getElementById(`death-s${i}`);
            const fEl = document.getElementById(`death-f${i}`);
            if (sEl) {
                sEl.checked = succ >= i;
                sEl.disabled = context.isInspection;
            }
            if (fEl) {
                fEl.checked = fail >= i;
                fEl.disabled = context.isInspection;
            }
        }

        // Inventory Tab
        const inv = char.inventory || { coins: {}, items: [], encumbrance: { current: 0, limit: 150 } };
        const coins = inv.coins || {};
        document.querySelectorAll('.coin-item input').forEach(input => {
            const field = input.dataset.field.split('.').pop();
            input.value = coins[field] || 0;
            input.title = context.isInspection ? "Visualização apenas" : `Moedas de ${field.toUpperCase()}`;
            input.disabled = context.isInspection;
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
            const renderAttackRow = (atk, i) => {
                const isProf = atk.isProf || false;
                // Auto-calc bonus if proficient (rough estimate: user still inputs base, we just add prof visual or simple logic)
                // Actually, for maximum flexibility requested:
                // "option of trained in weapon type pulling bonus from sheet"
                // We will add a toggle. If toggle is ON, we assume the user WANTS the prof bonus added to whatever they wrote?
                // Or better: The input shows the FINAL value, but the toggle indicates if Prof is included. 
                // Let's make the toggle purely visual/logic flag for now, and later we can make it math-heavy if needed.
                // The user said "pulling bonus". So if I check 'Prof', it should probably add +Prof to the calc.

                // But `atk.bonus` is a text field (e.g. "+5"). 
                // Let's keep it simple: Just a toggle button that saves state. The user calculates. 
                // OR: detailed logic. Let's do a "Star" toggle.

                return `
                <div class="attack-row-v2 list-item-v2" data-index="${i}">
                    <div class="attack-row-icon"><i class="fas fa-sword"></i></div>
                    <div class="attack-field" style="flex: 2;">
                        <label>Arma</label>
                        <input type="text" value="${atk.name || ''}" placeholder="Nome" data-list="combat.attacks" data-field="name" title="${atk.isCustom ? 'Nome do Ataque' : 'Gerenciado pelo Inventário'}" ${atk.isCustom && !context.isInspection ? '' : 'readonly'} class="${atk.isCustom && !context.isInspection ? '' : 'readonly-field'}" ${context.isInspection ? 'disabled' : ''}>
                    </div>
                    <div class="attack-field" style="flex: 0.8; position: relative;">
                        <label>Bônus</label>
                        <div style="display: flex; align-items: center;">
                            <input type="text" value="${atk.bonus || ''}" placeholder="+0" data-list="combat.attacks" data-field="bonus" title="Bônus de Ataque" style="text-align: center;" ${context.isInspection ? 'disabled' : ''}>
                            <i class="fas fa-star prof-toggle-attack ${isProf ? 'active' : ''}" 
                               title="${context.isInspection ? 'Visualização' : 'Proficiente? (Clique para alternar)'}"
                               style="cursor: ${context.isInspection ? 'default' : 'pointer'}; color: ${isProf ? 'var(--gold)' : '#444'}; margin-left: 5px; font-size: 0.8rem;"
                               ${context.isInspection ? '' : `onclick="window.toggleAttackProfFor(${i})"`}></i>
                        </div>
                    </div>
                    <div class="attack-field" style="flex: 1.5;">
                        <label>Dano</label>
                        <input type="text" value="${atk.damage || ''}" placeholder="1d8" data-list="combat.attacks" data-field="damage" title="${atk.isCustom ? 'Dano' : 'Gerenciado pelo Inventário'}" ${atk.isCustom && !context.isInspection ? '' : 'readonly'} class="${atk.isCustom && !context.isInspection ? '' : 'readonly-field'}" ${context.isInspection ? 'disabled' : ''}>
                    </div>
                     <div class="attack-actions" style="display: flex; align-items: flex-end; padding-bottom: 5px;">
                          ${atk.isCustom && !context.isInspection ? `<button class="icon-btn delete-list-item delete-btn" data-list="combat.attacks" data-index="${i}" title="Remover"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                    <input type="hidden" data-field="isCustom" value="${atk.isCustom || false}">
                    <input type="hidden" data-field="isProf" value="${isProf}">
                </div>
            `};

            attacksBody.innerHTML = `
                ${(char.combat?.attacks || []).map((atk, i) => renderAttackRow(atk, i)).join('')}
                ${!context.isInspection ? `
                <div class="attack-row-actions" style="margin-top: 10px; text-align: center;">
                    <button id="add-custom-attack-btn" class="medieval-btn small dashed" style="width: 100%;"><i class="fas fa-plus"></i> Adicionar Ataque Personalizado</button>
                </div>` : ''}
            `;

            // Bind Add Button
            setTimeout(() => {
                const addBtn = document.getElementById('add-custom-attack-btn');
                if (addBtn) {
                    addBtn.onclick = () => {
                        if (!char.combat) char.combat = {};
                        if (!char.combat.attacks) char.combat.attacks = [];
                        char.combat.attacks.push({
                            name: "Novo Ataque",
                            bonus: "+0",
                            damage: "1d6",
                            isCustom: true,
                            isProf: false
                        });
                        this.populateSheet(char, context); // Re-render
                    };
                }

                // Global Toggle Helper if not exists
                window.toggleAttackProfFor = (index) => {
                    if (this.isInspection) return; // Strict guard
                    if (char.combat?.attacks?.[index]) {
                        char.combat.attacks[index].isProf = !char.combat.attacks[index].isProf;

                        // Logic: If turning ON, add Prof Bonus to current value? 
                        // It's risky to parse text like "+5". 
                        // Let's just update the state and re-render for now. 
                        // The user asked "puxando o bonus". 
                        // If we want to be smart:
                        if (char.combat.attacks[index].isProf) {
                            // Try to add prof
                            const current = parseInt(char.combat.attacks[index].bonus) || 0;
                            const prof = systemStats.general.profBonus || 2;
                            // Only add if it looks like a number
                            if (!isNaN(current)) {
                                char.combat.attacks[index].bonus = `+${current + prof}`;
                            }
                        } else {
                            // Try to subtract
                            const current = parseInt(char.combat.attacks[index].bonus) || 0;
                            const prof = systemStats.general.profBonus || 2;
                            if (!isNaN(current)) {
                                char.combat.attacks[index].bonus = `+${current - prof}`;
                            }
                        }

                        this.populateSheet(char, context);
                    }
                };
            }, 0);
        }

        const spellsContainer = document.getElementById('sheet-spell-slots');
        if (spellsContainer) {
            if (char.spells?.slots) {
                const slots = char.spells.slots;
                const levels = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9'];

                spellsContainer.innerHTML = levels.map(lvl => {
                    const data = slots[lvl] || { total: 0, used: 0 };
                    const lvlNum = lvl.replace('l', '');

                    // Não mostrar níveis sem slots
                    if (!data.total || data.total == 0) return '';

                    return `
                        <div class="slot-box" title="Círculo ${lvlNum}">
                            <strong>Nível ${lvlNum}</strong>
                            <div class="slot-inputs" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                                <input 
                                    type="number" 
                                    value="${data.used}" 
                                    data-field="spells.slots.${lvl}.used" 
                                    min="0" 
                                    max="${data.total}"
                                    style="width: 40px; text-align: center; padding: 0.3rem;"
                                    title="Gastos"
                                >
                                <span>/</span>
                                <span style="font-weight: bold;">${data.total}</span>
                            </div>
                            <div class="slot-circles" style="display: flex; gap: 4px; margin-top: 0.5rem;">
                                ${Array(parseInt(data.total)).fill(0).map((_, i) => `
                                    <div 
                                        class="slot-circle ${i < data.used ? 'used' : 'available'}" 
                                        style="
                                            width: 12px; 
                                            height: 12px; 
                                            border-radius: 50%; 
                                            background: ${i < data.used ? '#666' : 'var(--gold)'}; 
                                            border: 1px solid var(--ink);
                                            cursor: ${context.isInspection ? 'default' : 'pointer'};
                                        "
                                        data-level="${lvl}"
                                        data-index="${i}"
                                        title="${i < data.used ? 'Gasto' : 'Disponível'}"
                                    ></div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).filter(Boolean).join('');

                // Event Listener: Clicar nos círculos para marcar/desmarcar
                spellsContainer.querySelectorAll('.slot-circle').forEach(circle => {
                    circle.addEventListener('click', (e) => {
                        if (this.isInspection) return;
                        const lvl = e.target.dataset.level;
                        const idx = parseInt(e.target.dataset.index);
                        const input = spellsContainer.querySelector(`input[data-field="spells.slots.${lvl}.used"]`);

                        if (!input) return;

                        const current = parseInt(input.value) || 0;

                        // Se clicou em um slot usado, reduz
                        if (idx < current) {
                            input.value = idx;
                        } else {
                            // Se clicou em um disponível, marca até aquele ponto
                            input.value = idx + 1;
                        }

                        // Trigger change event para atualizar visualmente
                        input.dispatchEvent(new Event('input'));
                    });
                });

                // Event Listener: Input manual sincroniza os círculos
                spellsContainer.querySelectorAll('input[data-field^="spells.slots"]').forEach(input => {
                    input.addEventListener('input', (e) => {
                        const lvl = e.target.dataset.field.split('.')[2]; // Extrai "l1" de "spells.slots.l1.used"
                        const used = parseInt(e.target.value) || 0;

                        // Atualiza os círculos visualmente
                        spellsContainer.querySelectorAll(`.slot-circle[data-level="${lvl}"]`).forEach((circle, i) => {
                            if (i < used) {
                                circle.style.background = '#666';
                                circle.title = 'Gasto';
                                circle.classList.add('used');
                                circle.classList.remove('available');
                            } else {
                                circle.style.background = 'var(--gold)';
                                circle.title = 'Disponível';
                                circle.classList.add('available');
                                circle.classList.remove('used');
                            }
                        });
                    });
                });
            } else {
                spellsContainer.innerHTML = '<p style="opacity:0.6; font-style:italic;">Sem slots de magia definidos.</p>';
            }

            // Cálculo de Spell DC e Ataque
            const spellAttr = char.spells?.ability || 'int';
            const attrMap = { int: mods.intMod, wis: mods.wisMod, cha: mods.chaMod };
            const spellMod = attrMap[spellAttr] || 0;

            const spellDC = 8 + mods.profBonus + spellMod;
            const spellAtk = mods.profBonus + spellMod;

            const spellDCEl = document.getElementById('sheet-spell-dc');
            const spellAtkEl = document.getElementById('sheet-spell-atk');

            if (spellDCEl) spellDCEl.innerText = spellDC;
            if (spellAtkEl) spellAtkEl.innerText = spellAtk >= 0 ? `+${spellAtk}` : spellAtk;

            // Disable search during inspection
            const spellSearch = document.getElementById('sheet-spell-search');
            if (spellSearch) spellSearch.disabled = context.isInspection;
        }

        // Spells List
        const spellsBody = document.getElementById('spells-body');
        if (spellsBody) {
            const hasCantrips = (char.spells?.list || []).some(s => s.level === '0' || s.level === 0 || s.level === 'Truque');
            // Render separate hint
            const raceHint = (char.bio?.race === 'Elfo' || char.bio?.race === 'Gnomo' || char.bio?.race === 'Tiferino') && !hasCantrips
                ? `<div class="sheet-hint" style="width: 100%; text-align: center; padding: 1rem; background: rgba(212, 175, 55, 0.1); border: 1px dashed var(--gold); border-radius: 8px; margin-bottom: 1rem;">
                    <i class="fas fa-info-circle"></i> Lembre-se de adicionar seus Truques Raciais (ex: Luz, Taumaturgia) usando a busca!
                   </div>`
                : '';

            // Inject hint BEFORE the grid, not inside
            const spellsContainer = spellsBody.parentElement;
            let hintContainer = spellsContainer.querySelector('.dynamic-race-hint');
            if (!hintContainer) {
                hintContainer = document.createElement('div');
                hintContainer.className = 'dynamic-race-hint';
                spellsBody.insertAdjacentElement('beforebegin', hintContainer);
            }
            hintContainer.innerHTML = raceHint;

            spellsBody.innerHTML = (char.spells?.list || []).map((sp, i) => this.renderSpellCard(sp, i)).join('') ||
                '<p class="empty-hint" style="grid-column: 1/-1;">Nenhuma magia vinculada. Use a busca acima para adicionar do Grande Grimório e não esqueça de salvar após realizar alterações!</p>';
        }

        // Items List
        const inventoryBody = document.getElementById('inventory-body');
        if (inventoryBody) {
            inventoryBody.innerHTML = (char.inventory?.items || []).map((it, i) => this.renderItemCard(it, i)).join('') ||
                '<p class="empty-hint" style="grid-column: 1/-1;">Mochila vazia. Busque itens na biblioteca ou adicione manualmente.</p>';

            // Disable search during inspection
            const itemSearch = document.getElementById('sheet-item-search');
            if (itemSearch) itemSearch.disabled = context.isInspection;
        }

        // Bind Search Events once
        // Ensure context has currentSystem, fallback to window.app if needed
        if (!context.currentSystem && window.app?.currentSystem) {
            context.currentSystem = window.app.currentSystem;
        }
        this.bindSearchEvents(context);

        const updateEncumbrance = () => {
            if (!char.inventory) return;

            let totalWeight = 0;

            // Calcular peso dos itens
            const items = Array.from(document.querySelectorAll('#inventory-body .list-item-v2'));
            items.forEach(row => {
                const qtyInput = row.querySelector('input[data-field="quantity"]');
                const weightInput = row.querySelector('input[data-field="weight"]');

                const qty = parseInt(qtyInput?.value) || 1;
                const weight = parseFloat(weightInput?.value) || 0;

                totalWeight += weight * qty;
            });

            // Calcular peso das moedas (50 moedas = 1 lb)
            const coins = char.inventory.coins || {};
            const totalCoins = (parseInt(document.querySelector('.coin-item.pc input')?.value) || 0) +
                (parseInt(document.querySelector('.coin-item.pp input')?.value) || 0) +
                (parseInt(document.querySelector('.coin-item.pe input')?.value) || 0) +
                (parseInt(document.querySelector('.coin-item.po input')?.value) || 0) +
                (parseInt(document.querySelector('.coin-item.pl input')?.value) || 0);
            totalWeight += totalCoins / 50;

            // Limite baseado em Força
            const strScore = parseInt(char.attributes?.str) || 10;
            const limit = strScore * 15;

            // Atualizar UI
            const weightBar = document.getElementById('weight-progress');
            const weightText = document.getElementById('weight-text');

            if (weightBar && weightText) {
                const perc = Math.min((totalWeight / limit) * 100, 100);
                weightBar.style.width = `${perc}%`;
                weightText.innerText = `${totalWeight.toFixed(1)} / ${limit} lbs`;

                // Feedback visual de sobrecarga
                if (totalWeight > limit) {
                    weightBar.style.background = 'linear-gradient(90deg, #c0392b, #e74c3c)';
                    weightText.style.color = 'var(--crimson)';
                } else if (totalWeight > limit * 0.75) {
                    weightBar.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
                    weightText.style.color = '#f39c12';
                } else {
                    weightBar.style.background = 'linear-gradient(90deg, var(--gold-dark), var(--gold))';
                    weightText.style.color = 'var(--ink)';
                }
            }

            // Atualizar objeto do personagem (apenas na memória local por enquanto)
            if (!char.inventory.encumbrance) char.inventory.encumbrance = {};
            char.inventory.encumbrance.current = parseFloat(totalWeight.toFixed(2));
            char.inventory.encumbrance.limit = limit;
        };

        // Event Listeners para atualização em tempo real
        const inventoryInputs = document.querySelectorAll('#inventory-body input[data-field], .coin-item input');
        inventoryInputs.forEach(input => {
            input.addEventListener('input', updateEncumbrance);
        });

        // Executar cálculo inicial
        if (inventoryBody) updateEncumbrance();

        // Story Tab
        const story = char.story || {};
        const chronicSection = document.getElementById('sheet-historia');
        if (chronicSection) {
            const insights = {
                'traits': 'Traços de Personalidade: Hábitos simples e virtudes',
                'ideals': 'Ideais: Crenças profundas e filosofias',
                'bonds': 'Vínculos: Pessoas ou locais importantes',
                'flaws': 'Defeitos: Vícios, medos e fraquezas',
                'mannerisms': 'Maneirismos: Tiques e gestos',
                'talents': 'Talentos: Habilidades de interpretação',
                'appearance': 'Aparência: Descrição visual detalhada',
                'notes': 'Notas: Histórico completo e diário',
            };

            chronicSection.querySelectorAll('textarea').forEach(txt => {
                const parts = txt.dataset.field.split('.');
                const field = parts.length > 1 ? parts[1] : parts[0];
                txt.value = story[field] || "";
                txt.readOnly = context.isInspection; // Conditional readonly
                txt.disabled = context.isInspection; // Also disable for consistency
                txt.title = context.isInspection ? "Visualização apenas" : (insights[field] || "Insite sua história");

                // Auto-Resize Trigger
                this.autoResizeTextarea(txt);
                txt.addEventListener('input', () => this.autoResizeTextarea(txt));
            });
        }

        // Ensure buttons are in correct state
        const saveBtn = document.getElementById('save-sheet-btn');
        const deleteBtn = document.getElementById('sheet-delete-btn');

        // Save button always visible for players, hidden for GM inspection
        if (saveBtn) saveBtn.classList.toggle('hidden', context.isInspection);
        if (deleteBtn) deleteBtn.classList.toggle('hidden', context.isInspection);

        // Disable token upload during inspection
        const tokenBtn = document.getElementById('token-upload-btn');
        if (tokenBtn) {
            tokenBtn.style.display = context.isInspection ? 'none' : 'flex';
        }

        // Always ensure the sheet is in editable mode for the owner
        this.toggleSheetEdit(true, char, context);

        // --- Auto-Resize Textareas ---
        const textareas = document.querySelectorAll('#character-sheet .medieval-textarea');
        textareas.forEach(ta => {
            // Initial resize
            this.autoResizeTextarea(ta);

            // On-type resize
            ta.addEventListener('input', () => this.autoResizeTextarea(ta));

            // Clean up old listeners by removing and re-adding if necessary (or just let them exist)
            // Since populateSheet is called multiple times, we should be careful with duplications
            // However, usually the DOM for these textareas is refreshed in index.html or we just update values.
            // Let's ensure we don't double-bind if the elements persist.
            ta.oninput = () => this.autoResizeTextarea(ta);
        });
    },

    autoResizeTextarea(el) {
        el.style.height = 'auto'; // Reset to recalculate shrink
        el.style.height = (el.scrollHeight + 2) + 'px'; // Expand
    },

    toggleSheetEdit(enable, character, context) {
        // Force enable if not in inspection
        const shouldEnable = context.isInspection ? false : true;

        const sheet = document.getElementById('character-sheet');
        if (!sheet) return;

        sheet.classList.toggle('is-editing', shouldEnable);

        // Toggle inputs based on shouldEnable
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
            if (el.closest('.list-item-v2')) return; // Ignore fields inside lists

            const field = el.dataset.field;
            if (!field.includes('.')) return; // CRITICAL: Only gather prefixed global fields (bio.name, stats.ac, etc.)
            // Skip death saves, handled specifically below
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

            // Deep set
            let target = updates;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!target[keys[i]]) target[keys[i]] = {};
                target = target[keys[i]];
            }
            target[keys[keys.length - 1]] = val;
        });

        // Specific handling for Death Saves (grouped checkboxes as a counter)
        const succCount = sheet.querySelectorAll('[data-field="death_saves.successes"]:checked').length;
        const failCount = sheet.querySelectorAll('[data-field="death_saves.failures"]:checked').length;
        updates.death_saves = { successes: succCount, failures: failCount };

        updates.combat.attacks = this.gatherList('#attacks-body', 'combat.attacks');
        updates.spells.list = this.gatherList('#spells-body', 'spells.list');
        updates.inventory.items = this.gatherList('#inventory-body', 'inventory.items');

        logger.debug("[SheetModule:Save] Configuração de Magias antes de salvar:", updates.spells.list.map(s => `${s.name}: prepared=${s.prepared} (type:${typeof s.prepared})`));
        logger.debug("[SheetModule:Save] Objeto de atualização final:", updates);

        // Sync Root Name with Bio Name for global app consistency
        if (updates.bio && updates.bio.name) {
            updates.name = updates.bio.name;
        }

        try {
            await updateCharacter(character.id, updates);
            // Merge updates
            const updatedChar = { ...character, ...updates };
            this.populateSheet(updatedChar, context);

            // Keep it editable (no toggleSheetEdit(false) call here)

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

        // Trigger auto-resize for textareas in the newly visible tab
        const visibleTextareas = document.querySelectorAll(`#sheet-${tabId} .medieval-textarea`);
        visibleTextareas.forEach(ta => this.autoResizeTextarea(ta));
    },

    // --- New Helpers ---

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
        // Map Portuguese rarities to English CSS keys
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
    },

    bindSearchEvents(context) {
        const spellInput = document.getElementById('sheet-spell-search');
        const itemInput = document.getElementById('sheet-item-search');
        const spellResults = document.getElementById('sheet-spell-results');
        const itemResults = document.getElementById('sheet-item-results');

        if (!spellInput || this._eventsBound) return;
        this._eventsBound = true;

        const handleSearch = async (input, resultsBox, fetchFn, type) => {
            input.addEventListener('input', async (e) => {
                const queryStr = e.target.value.toLowerCase().trim();
                if (queryStr.length < 2) {
                    resultsBox.classList.add('hidden');
                    return;
                }


                const allItems = await fetchFn(context.currentSystem);
                let matches = allItems.filter(i =>
                    i.name.toLowerCase().includes(queryStr) ||
                    (i.school && i.school.toLowerCase().includes(queryStr)) ||
                    (i.type && i.type.toLowerCase().includes(queryStr))
                );

                // Sort by relevance: Exact Match > Starts With > Contains
                matches.sort((a, b) => {
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    const q = queryStr;

                    // 1. Exact Match Priority
                    if (aName === q && bName !== q) return -1;
                    if (bName === q && aName !== q) return 1;

                    // 2. Starts With Priority
                    const aStarts = aName.startsWith(q);
                    const bStarts = bName.startsWith(q);
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;

                    // 3. Alphabetical
                    return aName.localeCompare(bName);
                });

                matches = matches.slice(0, 10);

                if (matches.length > 0) {
                    resultsBox.innerHTML = matches.map(m => {
                        let iconHtml = '';
                        if (type === 'spell') {
                            const iconPath = this.getSchoolIcon(m.school);
                            if (iconPath) {
                                iconHtml = `<img src="${iconPath}" alt="${m.school}">`;
                            } else {
                                iconHtml = `<i class="fas fa-sparkles"></i>`;
                            }
                        } else {
                            iconHtml = `<i class="fas fa-box"></i>`;
                        }

                        return `
                        <div class="search-result-item" data-id="${m.id}">
                            ${iconHtml}
                            <div class="res-info">
                                <span class="res-name">${m.name}</span>
                                <span class="res-meta">${type === 'spell' ? `${m.level} • ${m.school}` : `${m.type} • ${m.rarity}`}</span>
                            </div>
                        </div>
                        `;
                    }).join('');
                    resultsBox.classList.remove('hidden');

                    // Bind Item Clicks
                    resultsBox.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const match = matches.find(m => m.id === item.dataset.id);
                            this.linkFromLibrary(match, type, context);
                            resultsBox.classList.add('hidden');
                            input.value = '';
                        });
                    });
                } else {
                    resultsBox.classList.add('hidden');
                }
            });

            // Close overlay on blur
            document.addEventListener('click', (e) => {
                if (!input.contains(e.target) && !resultsBox.contains(e.target)) {
                    resultsBox.classList.add('hidden');
                }
            });
        };

        const getCombinedSpells = async (systemId) => {
            const globalSpells = await getSpells(systemId);
            if (context.user) {
                try {
                    const userSpells = await getUserSpells(context.user.uid, context.user.email);
                    return [...globalSpells, ...userSpells];
                } catch (err) {
                    logger.error("Erro ao buscar magias do usuário:", err);
                    return globalSpells;
                }
            }
            return globalSpells;
        };

        const getCombinedItems = async (systemId) => {
            const globalItems = await getGlobalItems(systemId);
            if (context.user) {
                try {
                    const userItems = await getUserItems(context.user.uid, context.user.email);
                    return [...globalItems, ...userItems];
                } catch (err) {
                    logger.error("Erro ao buscar itens do usuário:", err);
                    return globalItems;
                }
            }
            return globalItems;
        };

        handleSearch(spellInput, spellResults, getCombinedSpells, 'spell');
        handleSearch(itemInput, itemResults, getCombinedItems, 'item');
    },

    linkFromLibrary(data, type, context) {
        if (!this.currentCharacter) return;

        if (type === 'spell') {
            if (!this.currentCharacter.spells) this.currentCharacter.spells = { list: [] };

            // Prevent duplicates
            const exists = this.currentCharacter.spells.list.some(s => s.name === data.name);
            if (exists) {
                context.showAlert(`Você já conhece a magia "${data.name}"! Ela já está em seu grimório.`, "Conhecimento Arcano");
                return;
            }

            this.currentCharacter.spells.list.push({
                name: data.name,
                level: data.level,
                school: data.school,
                range: data.range,
                casting_time: data.casting_time || data.castingTime,
                duration: data.duration,
                components: data.components,
                description: data.description
            });
            context.showAlert(`Magia "${data.name}" memorizada com sucesso!`, "Grimório");
        } else {
            if (!this.currentCharacter.inventory) this.currentCharacter.inventory = { items: [] };

            // Smart Item Addition: Increase quantity if exists
            const existingItem = this.currentCharacter.inventory.items.find(it => it.name === data.name);
            if (existingItem) {
                existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
                context.showAlert(`Quantidade de "${data.name}" aumentada para ${existingItem.quantity}.`, "Tesouro Coletado");
            } else {
                this.currentCharacter.inventory.items.push({
                    name: data.name,
                    quantity: 1,
                    weight: data.weight || 0,
                    description: data.description,
                    type: data.type,
                    rarity: data.rarity,
                    damage: data.damage
                });

                // Smart Automation: Add to Attacks if Weapon (English or Portuguese)
                if (data.type === 'Weapon' || data.type === 'Arma' || data.damage) {
                    if (!this.currentCharacter.combat) this.currentCharacter.combat = { attacks: [] };
                    // Avoid duplicate attack entries for the same weapon name
                    if (!this.currentCharacter.combat.attacks.some(a => a.name === data.name)) {
                        this.currentCharacter.combat.attacks.push({
                            name: data.name,
                            bonus: '',
                            damage: data.damage || '',
                            isCustom: false
                        });
                    }
                }

                context.showAlert(`"${data.name}" adicionado à mochila!`, "Tesouro Coletado");
            }
        }

        this.populateSheet(this.currentCharacter, context);
    },

    // List Helpers
    gatherList(selector, path) {
        const sheet = document.getElementById('character-sheet');
        const items = [];
        const rows = sheet.querySelectorAll(`${selector} .list-item-v2`);
        logger.debug(`[GatherList:${path}] Encontradas ${rows.length} linhas em ${selector}`);

        rows.forEach((row, i) => {
            const item = {};
            row.querySelectorAll('input, textarea').forEach(el => {
                const f = el.dataset.field;
                if (!f) return;

                let val = el.value;
                if (el.type === 'checkbox') {
                    val = el.checked; // Direct boolean
                } else if (val === 'true') {
                    val = true;
                } else if (val === 'false') {
                    val = false;
                } else if (el.type === 'number') {
                    val = parseFloat(val) || 0;
                }

                item[f] = val;
            });
            logger.debug(`[GatherList:${path}] Item ${i}:`, item);
            items.push(item);
        });
        return items;
    }
};

window.SheetModule = SheetModule;
