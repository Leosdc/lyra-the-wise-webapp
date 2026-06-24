/**
 * Sheet Search Sub-Module
 * Handles library search (spells & items), linking, and list gathering.
 */

import { getGlobalItems, getSpells, getUserItems, getUserSpells } from '../data.js';
import { escapeHTML } from './utils.js';
import { logger } from '../logger.js';

/**
 * Returns search-related methods to be mixed into SheetModule.
 */
export function createSearchMixin(ctx) {
    return {
        bindSearchEvents(context) {
            const spellInput = document.getElementById('sheet-spell-search');
            const itemInput = document.getElementById('sheet-item-search');
            const spellResults = document.getElementById('sheet-spell-results');
            const itemResults = document.getElementById('sheet-item-results');

            if (!spellInput || ctx._eventsBound) return;
            ctx._eventsBound = true;

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

                        if (aName === q && bName !== q) return -1;
                        if (bName === q && aName !== q) return 1;

                        const aStarts = aName.startsWith(q);
                        const bStarts = bName.startsWith(q);
                        if (aStarts && !bStarts) return -1;
                        if (!aStarts && bStarts) return 1;

                        return aName.localeCompare(bName);
                    });

                    matches = matches.slice(0, 10);

                    if (matches.length > 0) {
                        resultsBox.innerHTML = matches.map(m => {
                            let iconHtml = '';
                            if (type === 'spell') {
                                const iconPath = ctx.getSchoolIcon(m.school);
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

                        resultsBox.querySelectorAll('.search-result-item').forEach(item => {
                            item.addEventListener('click', () => {
                                const match = matches.find(m => m.id === item.dataset.id);
                                ctx.linkFromLibrary(match, type, context);
                                resultsBox.classList.add('hidden');
                                input.value = '';
                            });
                        });
                    } else {
                        resultsBox.classList.add('hidden');
                    }
                });

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
            if (!ctx.currentCharacter) return;

            if (type === 'spell') {
                if (!ctx.currentCharacter.spells) ctx.currentCharacter.spells = { list: [] };

                const exists = ctx.currentCharacter.spells.list.some(s => s.name === data.name);
                if (exists) {
                    context.showAlert(`Você já conhece a magia "${data.name}"! Ela já está em seu grimório.`, "Conhecimento Arcano");
                    return;
                }

                ctx.currentCharacter.spells.list.push({
                    name: data.name,
                    level: data.level,
                    school: data.school,
                    range: data.range,
                    casting_time: data.casting_time || data.castingTime,
                    duration: data.duration,
                    components: data.components,
                    description: data.description,
                    ability_data: data.ability_data || null
                });
                context.showAlert(`Magia "${data.name}" memorizada com sucesso!`, "Grimório");
            } else {
                if (!ctx.currentCharacter.inventory) ctx.currentCharacter.inventory = { items: [] };

                const existingItem = ctx.currentCharacter.inventory.items.find(it => it.name === data.name);
                if (existingItem) {
                    existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
                    context.showAlert(`Quantidade de "${data.name}" aumentada para ${existingItem.quantity}.`, "Tesouro Coletado");
                } else {
                    ctx.currentCharacter.inventory.items.push({
                        name: data.name,
                        quantity: 1,
                        weight: data.weight || 0,
                        description: data.description,
                        type: data.type,
                        rarity: data.rarity,
                        damage: data.damage,
                        damageType: data.damageType || '',
                        ability_data: data.ability_data || null
                    });

                    if (data.type === 'Weapon' || data.type === 'Arma' || data.damage) {
                        if (!ctx.currentCharacter.combat) ctx.currentCharacter.combat = { attacks: [] };
                        if (!ctx.currentCharacter.combat.attacks.some(a => a.name === data.name)) {
                            ctx.currentCharacter.combat.attacks.push({
                                name: data.name,
                                bonus: '',
                                damage: data.damage || '',
                                damageType: data.damageType || '',
                                isCustom: false
                            });
                        }
                    }

                    context.showAlert(`"${data.name}" adicionado à mochila!`, "Tesouro Coletado");
                }
            }

            ctx.populateSheet(ctx.currentCharacter, context);
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
                        val = el.checked;
                    } else if (f === 'ability_data' || f === 'identity') {
                        try {
                            val = JSON.parse(val);
                        } catch (e) {
                            // Leave as string if invalid JSON though it shouldn't happen
                        }
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
}
