
import { updateCharacter } from '../data.js';
import { RACES, CLASSES, ALIGNMENTS } from '../constants.js';
import { DND5eSystem } from '../systems/dnd5e.js';

/**
 * Sheet Module
 * Handles Character Sheet display, editing, calculations, and interactions.
 */

export const SheetModule = {

    characterBackup: null,

    // --- Core Logic ---
    // --- Core Logic ---
    calculateDND5eStats(char) {
        // Delegated to D&D 5e System Module
        return DND5eSystem.calculateStats(char);
    },

    // --- UI Rendering ---
    populateSheet(char, context) {
        if (!char) return;

        // Run Engine (System Module)
        const systemStats = this.calculateDND5eStats(char);

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

        // Apply Defaults (if empty)
        if (systemStats.defaults) {
            if (!char.stats.hp_max || char.stats.hp_max === 0) {
                char.stats.hp_max = systemStats.defaults.hp_max;
                char.stats.hp_current = char.stats.hp_max;
            }
            if (!char.stats.ac || char.stats.ac === 10) {
                // Only override if default 10, to allow custom AC
                // Wait, original logic was "if 10". 
                // If calculated default is DIFFERENT from 10 (e.g. Dex 14 -> AC 12), we should apply it?
                // The system stats.general.ac ALREADY does 10+Dex.
                // So we can just use systemStats.general.ac if we want dynamic.
                // But to persist it on the sheet as a starting point:
                if (char.stats.ac === 10 && systemStats.defaults.ac !== 10) {
                    char.stats.ac = systemStats.defaults.ac;
                }
            }
        }

        // Helper to create seamless input
        const mkInput = (val, field, type = 'text', title = '', style = '', extraAttrs = '') =>
            `<input type="${type}" value="${val}" data-field="${field}" class="medieval-input seamless" title="${title || 'Clique para editar'}" style="${style}" ${extraAttrs}>`;

        // Helper to create seamless select
        const mkSelect = (val, field, options, title = '', style = '') => {
            const opts = options.map(opt => `<option value="${opt}" ${opt === val ? 'selected' : ''}>${opt}</option>`).join('');
            // Add custom option if current value is not in list
            const customOpt = (val && !options.includes(val)) ? `<option value="${val}" selected>${val} (Custom)</option>` : '';
            return `<select data-field="${field}" class="medieval-select seamless" title="${title}" style="${style}">${customOpt}${opts}</select>`;
        }

        // Header Info
        // Header Info
        const race = char.bio?.race || 'Humano';
        const clazz = char.bio?.class || 'Guerreiro';
        const alignment = char.bio?.alignment || 'Neutro';
        const charLevel = char.bio?.level || 1;

        // Header Info - Consolidated for clean alignment
        // Render Name (with input)
        const nameContainer = document.getElementById('sheet-char-name');
        if (nameContainer) {
            nameContainer.innerHTML = mkInput(char.name || char.bio?.name || 'Sem Nome', 'name', 'text', 'Nome', 'font-size: 2rem; font-family: Cinzel; background: transparent; border: none; width: 100%; font-weight: bold; color: inherit;');
        }

        // Render Level
        const levelContainer = document.getElementById('sheet-level-val');
        if (levelContainer) {
            levelContainer.innerHTML = mkInput(charLevel, 'bio.level', 'number', 'Nível', 'width: 50px; text-align: center; font-size: 2rem; font-weight: bold; background: transparent; border: none; color: inherit;');
        }

        // Render Dropdowns (Race, Class, Alignment)
        const alignmentEl = document.getElementById('sheet-alignment-display');
        const raceEl = document.getElementById('sheet-race-display');
        const classEl = document.getElementById('sheet-class-display');

        if (alignmentEl) alignmentEl.innerHTML = mkSelect(alignment, 'bio.alignment', ALIGNMENTS, 'Alinhamento', 'width: 100%;');
        // Custom visual adaptation: Input that looks like a Select to allow typing + list
        if (raceEl) {
            raceEl.innerHTML = `<input type="text" value="${race}" data-field="bio.race" class="medieval-select" title="Raça" style="width: 100%;" list="races-list">`;
        }
        if (classEl) classEl.innerHTML = mkSelect(clazz, 'bio.class', CLASSES, 'Classe', 'width: 100%;');

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
            if (el) el.innerHTML = mkInput(data.v, data.f, 'text', data.t);
        }

        // Explicit Alignment Dropdown Override
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
                    <div class="save-item ${isProf ? 'proficient' : ''}" title="${s.t}">
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
                    <div class="skill-item ${isProf ? 'proficient' : ''}" title="${sk.t}">
                        <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''} ${isExpert ? 'expert' : ''}" style="font-size: 0.5rem; color: ${isProf || isExpert ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf || isExpert ? 1 : 0.3}; cursor: pointer;" data-type="skills" data-field="${sk.id}"></i>
                        <span>${sk.l}</span>
                        <span style="margin-left: auto;">${val >= 0 ? `+${val}` : val}</span>
                    </div>
                `;
            }).join('');
        }

        // Combat Tab
        const s = char.stats || {};
        document.getElementById('sheet-ca').innerHTML = mkInput(s.ac, 'stats.ac', 'number', 'Classe de Armadura');
        document.getElementById('sheet-inic').innerHTML = mkInput(s.initiative, 'stats.initiative', 'number', 'Iniciativa');
        document.getElementById('sheet-speed').innerHTML = mkInput(s.speed, 'stats.speed', 'text', 'Deslocamento');

        document.getElementById('sheet-hp-curr').value = s.hp_current;
        document.getElementById('sheet-hp-max').value = s.hp_max;
        document.getElementById('sheet-hp-temp').value = s.hp_temp || 0;

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
            if (sEl) sEl.checked = succ >= i;
            if (fEl) fEl.checked = fail >= i;
        }

        // Inventory Tab
        const inv = char.inventory || { coins: {}, items: [], encumbrance: { current: 0, limit: 150 } };
        const coins = inv.coins || {};
        document.querySelectorAll('.coin-item input').forEach(input => {
            const field = input.dataset.field.split('.').pop();
            input.value = coins[field] || 0;
            input.title = `Moedas de ${field.toUpperCase()}`;
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
                    <input type="text" value="${atk.name || ''}" placeholder="Nome" data-list="combat.attacks" data-field="name" title="Nome da Arma">
                    <input type="text" value="${atk.bonus || ''}" placeholder="Bônus" data-list="combat.attacks" data-field="bonus" title="Bônus de Ataque">
                    <input type="text" value="${atk.damage || ''}" placeholder="Dano" data-list="combat.attacks" data-field="damage" title="Dano">
                    <button class="icon-btn delete-list-item" data-list="combat.attacks" data-index="${i}" title="Remover"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        // ========================================
        // PATCH 2: SPELL SLOTS - IMPLEMENTAÇÃO COMPLETA
        // ========================================
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
                                            cursor: pointer;
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
        }

        // Spells List
        const spellsBody = document.getElementById('spells-body');
        if (spellsBody) {
            spellsBody.innerHTML = (char.spells?.list || []).map((sp, i) => `
                <div class="list-item-v2" data-index="${i}">
                    <input type="text" value="${sp.name || ''}" placeholder="Magia" data-list="spells.list" data-field="name" title="Nome da Magia">
                    <input type="text" value="${sp.level || ''}" placeholder="Nív" data-list="spells.list" data-field="level" title="Nível">
                    <input type="text" value="${sp.range || ''}" placeholder="Alcance" data-list="spells.list" data-field="range" title="Alcance/Duração">
                    <button class="icon-btn delete-list-item" data-list="spells.list" data-index="${i}" title="Remover"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        // Items List
        const inventoryBody = document.getElementById('inventory-body');
        if (inventoryBody) {
            inventoryBody.innerHTML = (char.inventory?.items || []).map((it, i) => `
                <div class="list-item-v2 inventory-row" data-index="${i}">
                    <div class="item-main-row">
                        <input type="text" value="${it.name || ''}" placeholder="Item" data-list="inventory.items" data-field="name" title="Nome do Item">
                        <input type="number" value="${it.quantity || 1}" placeholder="Qtd" data-list="inventory.items" data-field="quantity" title="Quantidade">
                        <input type="text" value="${it.weight || 0}" placeholder="Peso" data-list="inventory.items" data-field="weight" title="Peso (lbs)">
                        <button class="icon-btn delete-list-item" data-list="inventory.items" data-index="${i}" title="Remover"><i class="fas fa-trash"></i></button>
                    </div>
                    <textarea class="item-desc-input" placeholder="Descrição do item..." data-list="inventory.items" data-field="description" title="Descrição e Efeitos">${it.description || ''}</textarea>
                </div>
            `).join('');
        }

        // ========================================
        // PATCH 3: ENCUMBRANCE - ATUALIZAÇÃO DINÂMICA
        // ========================================
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
                txt.readOnly = false; // Always editable
                txt.title = insights[field] || "Insite sua história";

                // Auto-Resize Trigger
                this.autoResizeTextarea(txt);
                txt.addEventListener('input', () => this.autoResizeTextarea(txt));
            });
        }

        // Ensure buttons are in correct state
        const saveBtn = document.getElementById('save-sheet-btn');
        if (saveBtn) saveBtn.classList.remove('hidden');
    },

    autoResizeTextarea(el) {
        el.style.height = 'auto'; // Reset to recalculate shrink
        el.style.height = (el.scrollHeight + 2) + 'px'; // Expand
    },

    toggleSheetEdit(enable, character, context) {
        // Deprecated / Simplified: Just ensuring save button is visible.
        // The sheet is now always editable.
    },

    cancelSheetEdit(character, context) {
        // Just reload
        this.populateSheet(character, context);
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
        sheet.querySelectorAll('[data-field]:not([data-list])').forEach(el => {
            const field = el.dataset.field;
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

            // PATCH 4: HEADER SYNC
            if (window.app && window.app.selectCharacter) {
                window.app.selectCharacter(updatedChar);
            }

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
