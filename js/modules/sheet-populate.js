/**
 * Sheet Populate Sub-Module
 * Handles the massive populateSheet function and its internal helpers.
 */

import { getSystemData } from '../data.js';
import { RACES, CLASSES, ALIGNMENTS, SUBRACES, ARCHETYPES, BACKGROUNDS } from '../constants.js';
import { escapeHTML, parseMarkdown } from './utils.js';
import { logger } from '../logger.js';

/**
 * Returns populate-related methods to be mixed into SheetModule.
 */
export function createPopulateMixin(ctx) {
    return {
        async populateSheet(char, context) {
            if (!char) return;
            ctx.currentCharacter = char;
            ctx.isInspection = !!context.isInspection;

            const sheetEl = document.getElementById('character-sheet');
            if (sheetEl) {
                sheetEl.classList.toggle('is-inspection', ctx.isInspection);
            }

            // Fetch System Data for Dropdowns
            let systemData = null;
            try {
                systemData = await getSystemData(context.currentSystem || 'dnd5e');
            } catch (e) { logger.error("Error loading system data", e); }

            const validRaces = systemData?.races || RACES;
            const raceOptions = validRaces.map(r => r.raca || r);

            const validClasses = systemData?.classes || CLASSES;
            const classOptions = validClasses.map(c => c.nome || c);

            const systemStats = ctx.calculateDND5eStats(char);

            if (char.inventory?.items && char.combat?.attacks) {
                const inventoryNames = new Set(char.inventory.items.map(i => i.name));
                char.combat.attacks = char.combat.attacks.filter(atk => {
                    if (atk.isCustom) return true;
                    return inventoryNames.has(atk.name);
                });
            }

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

            const levelContainer = document.getElementById('sheet-level-val');
            if (levelContainer) {
                levelContainer.innerHTML = mkInput(charLevel, 'bio.level', 'number', 'Nível', 'sheet-level-input');
            }

            const alignmentEl = document.getElementById('sheet-alignment-display');
            const raceEl = document.getElementById('sheet-race-display');
            const classEl = document.getElementById('sheet-class-display');

            if (alignmentEl) alignmentEl.innerHTML = mkSelect(alignment, 'bio.alignment', ALIGNMENTS, 'Alinhamento', 'header-input-box');

            const currentRaceData = validRaces.find(r => (r.raca || r) === race);
            const currentClassData = validClasses.find(c => (c.nome || c) === clazz);

            let subOptions = ["Padrão"];
            if (currentRaceData && currentRaceData.subracas && currentRaceData.subracas.length > 0) {
                subOptions = currentRaceData.subracas;
            } else if (SUBRACES[race]) {
                subOptions = SUBRACES[race];
            }

            let archOptions = ["Padrão"];
            if (currentClassData && currentClassData.arquetipos && currentClassData.arquetipos.length > 0) {
                archOptions = currentClassData.arquetipos;
            } else if (ARCHETYPES[clazz]) {
                archOptions = ARCHETYPES[clazz];
            }

            if (raceEl) {
                raceEl.innerHTML = mkSelect(race, 'bio.race', raceOptions, 'Raça', 'header-input-box');
                const select = raceEl.querySelector('select');
                if (select) {
                    select.addEventListener('change', async (e) => {
                        const newRace = e.target.value;
                        const newRaceData = validRaces.find(r => (r.raca || r) === newRace);
                        const newSubOptions = (newRaceData && newRaceData.subracas) ? newRaceData.subracas : (SUBRACES[newRace] || ["Padrão"]);
                        const subSelect = document.querySelector('select[data-field="bio.subrace"]');
                        if (subSelect) {
                            subSelect.innerHTML = newSubOptions.map(opt => `<option value="${escapeHTML(opt)}">${escapeHTML(opt)}</option>`).join('');
                        }
                    });
                }
            }

            const subraceEl = document.getElementById('sheet-subrace-display');
            if (subraceEl) {
                const currentSub = char.bio?.subrace || subOptions[0];
                const displayOpts = subOptions.includes(currentSub) ? subOptions : [currentSub, ...subOptions];
                const uniqueOpts = [...new Set(displayOpts)];
                subraceEl.innerHTML = mkSelect(currentSub, 'bio.subrace', uniqueOpts, 'Sub-raça', 'header-input-box');
            }

            if (classEl) {
                classEl.innerHTML = mkSelect(clazz, 'bio.class', classOptions, 'Classe', 'header-input-box');
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
                if (sEl) { sEl.checked = succ >= i; sEl.disabled = context.isInspection; }
                if (fEl) { fEl.checked = fail >= i; fEl.disabled = context.isInspection; }
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
                        <div class="attack-field" style="flex: 1;">
                            <label>Dano</label>
                            <input type="text" value="${atk.damage || ''}" placeholder="1d8" data-list="combat.attacks" data-field="damage" title="${atk.isCustom ? 'Dano' : 'Gerenciado pelo Inventário'}" ${atk.isCustom && !context.isInspection ? '' : 'readonly'} class="${atk.isCustom && !context.isInspection ? '' : 'readonly-field'}" ${context.isInspection ? 'disabled' : ''}>
                        </div>
                        <div class="attack-field" style="flex: 1;">
                            <label>Tipo</label>
                            <input type="text" value="${atk.damageType || ''}" placeholder="cortante" data-list="combat.attacks" data-field="damageType" title="${atk.isCustom ? 'Tipo' : 'Gerenciado pelo Inventário'}" ${atk.isCustom && !context.isInspection ? '' : 'readonly'} class="${atk.isCustom && !context.isInspection ? '' : 'readonly-field'}" ${context.isInspection ? 'disabled' : ''}>
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
                                damageType: "",
                                isCustom: true,
                                isProf: false
                            });
                            ctx.populateSheet(char, context);
                        };
                    }

                    window.toggleAttackProfFor = (index) => {
                        if (ctx.isInspection) return;
                        if (char.combat?.attacks?.[index]) {
                            char.combat.attacks[index].isProf = !char.combat.attacks[index].isProf;

                            if (char.combat.attacks[index].isProf) {
                                const current = parseInt(char.combat.attacks[index].bonus) || 0;
                                const prof = systemStats.general.profBonus || 2;
                                if (!isNaN(current)) {
                                    char.combat.attacks[index].bonus = `+${current + prof}`;
                                }
                            } else {
                                const current = parseInt(char.combat.attacks[index].bonus) || 0;
                                const prof = systemStats.general.profBonus || 2;
                                if (!isNaN(current)) {
                                    char.combat.attacks[index].bonus = `+${current - prof}`;
                                }
                            }

                            ctx.populateSheet(char, context);
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

                    spellsContainer.querySelectorAll('.slot-circle').forEach(circle => {
                        circle.addEventListener('click', (e) => {
                            if (ctx.isInspection) return;
                            const lvl = e.target.dataset.level;
                            const idx = parseInt(e.target.dataset.index);
                            const input = spellsContainer.querySelector(`input[data-field="spells.slots.${lvl}.used"]`);
                            if (!input) return;
                            const current = parseInt(input.value) || 0;
                            if (idx < current) {
                                input.value = idx;
                            } else {
                                input.value = idx + 1;
                            }
                            input.dispatchEvent(new Event('input'));
                        });
                    });

                    spellsContainer.querySelectorAll('input[data-field^="spells.slots"]').forEach(input => {
                        input.addEventListener('input', (e) => {
                            const lvl = e.target.dataset.field.split('.')[2];
                            const used = parseInt(e.target.value) || 0;
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

                const spellAttr = char.spells?.ability || 'int';
                const attrMap2 = { int: mods.intMod, wis: mods.wisMod, cha: mods.chaMod };
                const spellMod = attrMap2[spellAttr] || 0;

                const spellDC = 8 + mods.profBonus + spellMod;
                const spellAtk = mods.profBonus + spellMod;

                const spellDCEl = document.getElementById('sheet-spell-dc');
                const spellAtkEl = document.getElementById('sheet-spell-atk');

                if (spellDCEl) spellDCEl.innerText = spellDC;
                if (spellAtkEl) spellAtkEl.innerText = spellAtk >= 0 ? `+${spellAtk}` : spellAtk;

                const spellSearch = document.getElementById('sheet-spell-search');
                if (spellSearch) spellSearch.disabled = context.isInspection;
            }

            // Spells List
            const spellsBody = document.getElementById('spells-body');
            if (spellsBody) {
                const hasCantrips = (char.spells?.list || []).some(s => s.level === '0' || s.level === 0 || s.level === 'Truque');
                const raceHint = (char.bio?.race === 'Elfo' || char.bio?.race === 'Gnomo' || char.bio?.race === 'Tiferino') && !hasCantrips
                    ? `<div class="sheet-hint" style="width: 100%; text-align: center; padding: 1rem; background: rgba(212, 175, 55, 0.1); border: 1px dashed var(--gold); border-radius: 8px; margin-bottom: 1rem;">
                        <i class="fas fa-info-circle"></i> Lembre-se de adicionar seus Truques Raciais (ex: Luz, Taumaturgia) usando a busca!
                       </div>`
                    : '';

                const spellsContainerParent = spellsBody.parentElement;
                let hintContainer = spellsContainerParent.querySelector('.dynamic-race-hint');
                if (!hintContainer) {
                    hintContainer = document.createElement('div');
                    hintContainer.className = 'dynamic-race-hint';
                    spellsBody.insertAdjacentElement('beforebegin', hintContainer);
                }
                hintContainer.innerHTML = raceHint;

                spellsBody.innerHTML = (char.spells?.list || []).map((sp, i) => ctx.renderSpellCard(sp, i)).join('') ||
                    '<p class="empty-hint" style="grid-column: 1/-1;">Nenhuma magia vinculada. Use a busca acima para adicionar do Grande Grimório e não esqueça de salvar após realizar alterações!</p>';
            }

            // Items List
            const inventoryBody = document.getElementById('inventory-body');
            if (inventoryBody) {
                inventoryBody.innerHTML = (char.inventory?.items || []).map((it, i) => ctx.renderItemCard(it, i)).join('') ||
                    '<p class="empty-hint" style="grid-column: 1/-1;">Mochila vazia. Busque itens na biblioteca ou adicione manualmente.</p>';

                const itemSearch = document.getElementById('sheet-item-search');
                if (itemSearch) itemSearch.disabled = context.isInspection;
            }

            if (!context.currentSystem && window.app?.currentSystem) {
                context.currentSystem = window.app.currentSystem;
            }
            ctx.bindSearchEvents(context);

            const updateEncumbrance = () => {
                if (!char.inventory) return;

                let totalWeight = 0;

                const items = Array.from(document.querySelectorAll('#inventory-body .list-item-v2'));
                items.forEach(row => {
                    const qtyInput = row.querySelector('input[data-field="quantity"]');
                    const weightInput = row.querySelector('input[data-field="weight"]');
                    const qty = parseInt(qtyInput?.value) || 1;
                    const weight = parseFloat(weightInput?.value) || 0;
                    totalWeight += weight * qty;
                });

                const totalCoins = (parseInt(document.querySelector('.coin-item.pc input')?.value) || 0) +
                    (parseInt(document.querySelector('.coin-item.pp input')?.value) || 0) +
                    (parseInt(document.querySelector('.coin-item.pe input')?.value) || 0) +
                    (parseInt(document.querySelector('.coin-item.po input')?.value) || 0) +
                    (parseInt(document.querySelector('.coin-item.pl input')?.value) || 0);
                totalWeight += totalCoins / 50;

                const strScore = parseInt(char.attributes?.str) || 10;
                const limit = strScore * 15;

                const weightBarEl = document.getElementById('weight-progress');
                const weightTextEl = document.getElementById('weight-text');

                if (weightBarEl && weightTextEl) {
                    const perc = Math.min((totalWeight / limit) * 100, 100);
                    weightBarEl.style.width = `${perc}%`;
                    weightTextEl.innerText = `${totalWeight.toFixed(1)} / ${limit} lbs`;

                    if (totalWeight > limit) {
                        weightBarEl.style.background = 'linear-gradient(90deg, #c0392b, #e74c3c)';
                        weightTextEl.style.color = 'var(--crimson)';
                    } else if (totalWeight > limit * 0.75) {
                        weightBarEl.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
                        weightTextEl.style.color = '#f39c12';
                    } else {
                        weightBarEl.style.background = 'linear-gradient(90deg, var(--gold-dark), var(--gold))';
                        weightTextEl.style.color = 'var(--ink)';
                    }
                }

                if (!char.inventory.encumbrance) char.inventory.encumbrance = {};
                char.inventory.encumbrance.current = parseFloat(totalWeight.toFixed(2));
                char.inventory.encumbrance.limit = limit;
            };

            const inventoryInputs = document.querySelectorAll('#inventory-body input[data-field], .coin-item input');
            inventoryInputs.forEach(input => {
                input.addEventListener('input', updateEncumbrance);
            });

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
                    txt.readOnly = context.isInspection;
                    txt.disabled = context.isInspection;
                    txt.title = context.isInspection ? "Visualização apenas" : (insights[field] || "Insite sua história");

                    ctx.autoResizeTextarea(txt);
                    txt.addEventListener('input', () => ctx.autoResizeTextarea(txt));
                });
            }

            const saveBtn = document.getElementById('save-sheet-btn');
            const deleteBtn = document.getElementById('sheet-delete-btn');

            if (saveBtn) saveBtn.classList.toggle('hidden', context.isInspection);
            if (deleteBtn) deleteBtn.classList.toggle('hidden', context.isInspection);

            const tokenBtn = document.getElementById('token-upload-btn');
            if (tokenBtn) {
                tokenBtn.style.display = context.isInspection ? 'none' : 'flex';
            }

            ctx.toggleSheetEdit(true, char, context);

            const textareas = document.querySelectorAll('#character-sheet .medieval-textarea');
            textareas.forEach(ta => {
                ctx.autoResizeTextarea(ta);
                ta.oninput = () => ctx.autoResizeTextarea(ta);
            });
        },

        autoResizeTextarea(el) {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight + 2) + 'px';
        }
    };
}
