import { db } from "../auth.js";
import {
    doc,
    onSnapshot
} from "firebase/firestore";
import { logger } from "../logger.js";
import { escapeHTML } from "./utils.js";

const CombatUI = {
    combatState: null,
    selectedTarget: null,
    onTargetSelected: null,
    characterListeners: new Map(), // Cache de listeners (characterId -> unsubscribe)
    reactiveData: new Map(), // Cache de dados (characterId -> {hp, maxHp, ac})
    targetingMode: false,
    currentAttackerId: null,
    localRollState: {
        targetId: null,
        targetName: null,
        attack: null,
        hitRoll: null,
        hitFormula: null,
        damageRoll: null,
        damageFormula: null,
        isAdvantage: false,
        isDisadvantage: false,
        advantageRolls: []
    },

    /**
     * Renderiza o painel de combate na SIDEBAR
     */
    renderCombatPanel(combatState) {
        logger.debug("🎨 CombatUI: Renderizando combate na sidebar...");
        this.combatState = combatState;

        // Alternar containers na sidebar via session-stage.js ou diretamente
        const narrativeContainer = document.getElementById('narrative-actions-container');
        const combatContainer = document.getElementById('combat-actions-container');

        if (narrativeContainer && combatContainer) {
            narrativeContainer.classList.add('hidden');
            combatContainer.classList.remove('hidden');
        }

        // Atualizar Header
        const roundNum = document.getElementById('sidebar-combat-round');
        if (roundNum) roundNum.textContent = combatState.round;

        const turnStatus = document.getElementById('combat-turn-status');
        if (turnStatus) {
            const activeParticipant = combatState.turnOrder[combatState.activeTurnIndex || 0];
            turnStatus.textContent = activeParticipant ? `Turno de: ${activeParticipant.name}` : "Aguardando...";
        }

        // Renderizar Lista Vertical
        this.renderVerticalCombatList(combatState);

        // Atualizar Botão de Finalizar Turno
        this.updateEndTurnButton(combatState);

        // [GM REQUISITO] Mostrar Botão de Finalizar Batalha se for GM
        const forceEndBtn = document.getElementById('btn-sidebar-force-end-combat');
        if (forceEndBtn) {
            if (window.StageModule?.isGM) {
                forceEndBtn.classList.remove('hidden');
                // Bind event only once
                if (!forceEndBtn.dataset.bound) {
                    forceEndBtn.addEventListener('click', () => this.handleForceEndCombat());
                    forceEndBtn.dataset.bound = true;
                }
            } else {
                forceEndBtn.classList.add('hidden');
            }
        }

        // Setup listeners
        this.setupCharacterListeners(combatState);
    },

    /**
     * Gerencia listeners reativos para as fichas dos jogadores
     */
    setupCharacterListeners(combatState) {
        const currentParticipants = combatState.turnOrder.filter(p => p.type === 'player');
        const activeIds = new Set(currentParticipants.map(p => p.characterId).filter(id => id));

        // 1. Limpar listeners de quem saiu do combate
        for (const [charId, unsubscribe] of this.characterListeners) {
            if (!activeIds.has(charId)) {
                unsubscribe();
                this.characterListeners.delete(charId);
                this.reactiveData.delete(charId);
            }
        }

        // 2. Adicionar listeners para novos participantes
        currentParticipants.forEach(p => {
            const charId = p.characterId;
            if (charId && !this.characterListeners.has(charId)) {
                const unsub = onSnapshot(doc(db, "fichas", charId), (snap) => {
                    const data = snap.data();

                    // Unified Robust Mapping
                    const getVal = (paths) => {
                        for (const path of paths) {
                            let val = data;
                            for (const segment of path.split('.')) {
                                val = val?.[segment];
                            }
                            if (val !== undefined && val !== null) return val;
                        }
                        return null;
                    };

                    const hpCurrent = getVal(['stats.hp_current', 'attributes.HP.current', 'combat.hp.current', 'stats.hp', 'hp', 'attributes.Vida.atual', 'vida_atual']);
                    const hpMax = getVal(['stats.hp_max', 'attributes.HP.max', 'combat.hp.max', 'stats.maxHp', 'maxHp', 'attributes.Vida.max', 'vida_max']);
                    const acVal = getVal(['stats.ac', 'attributes.CA.value', 'combat.ac', 'ac', 'attributes.CA.bonus', 'ca_valor']);

                    this.reactiveData.set(charId, {
                        hp: hpCurrent ?? p.hp,
                        maxHp: hpMax ?? p.maxHp,
                        ac: acVal ?? p.ac
                    });

                    // Atualizar ações de magia/itens reativamente quando o grimório/inventário muda
                    const participant = this.combatState?.turnOrder?.find(t => t.characterId === charId);
                    if (participant && data) {
                        const weaponActions = (data.combat?.attacks || []).map(atk => ({
                            ...atk,
                            category: 'Combate'
                        }));

                        const spellList = data.spells?.list || [];
                        const dmgRegex = /(\d+d\d+)(?:\s*\+\s*\d+)?(?:\s+(?:de\s+)?(?:dano\s+)?(?:de\s+)?(\w+))?/i;
                        const spellActions = spellList
                            .filter(sp => sp.prepared === true || sp.level === 0 || sp.level === '0' || sp.level === 'Truque')
                            .map(sp => {
                                let dmg = '---';
                                let range = sp.range || '---';

                                if (sp.ability_data && sp.ability_data.execution_mechanics) {
                                    const em = sp.ability_data.execution_mechanics;
                                    const dmgObj = (em.damage && em.damage.length > 0) ? em.damage[0] : null;
                                    if (dmgObj) dmg = `${dmgObj.dice_count||1}d${dmgObj.dice_type||6} ${dmgObj.damage_type||''}`.trim();
                                } else {
                                    const m = sp.description ? sp.description.match(dmgRegex) : null;
                                    if (m) dmg = (m[2] ? `${m[1]} ${m[2]}` : m[1]);
                                }

                                const levelLabel = (sp.level === 0 || sp.level === '0' || sp.level === 'Truque') ? 'Truque' : `Nv. ${sp.level}`;
                                return {
                                    name: sp.name, damage: dmg, range: range,
                                    desc: sp.description ? sp.description.substring(0, 120) + '...' : '',
                                    category: 'Magias', spellLevel: sp.level, school: sp.school || '',
                                    isSpell: true, levelLabel
                                };
                            });
                            
                        const itemList = data.inventory?.items || [];
                        const itemActions = itemList
                            .filter(it => it.equipped && it.ability_data)
                            .map(it => {
                                const em = it.ability_data.execution_mechanics || {};
                                const dmgObj = (em.damage && em.damage.length > 0) ? em.damage[0] : null;
                                const damageStr = dmgObj ? `${dmgObj.dice_count||1}d${dmgObj.dice_type||6} ${dmgObj.damage_type||''}`.trim() : '---';
                                return {
                                    name: it.name || 'Item', 
                                    damage: damageStr, 
                                    range: '---',
                                    desc: it.description ? it.description.substring(0, 120) + '...' : '',
                                    category: 'Itens'
                                };
                            });

                        participant.actions = [...weaponActions, ...spellActions, ...itemActions];
                    }

                    this.renderVerticalCombatList(this.combatState);
                });
                this.characterListeners.set(charId, unsub);
            }
        });
    },

    /**
     * Renderiza a lista de iniciativa vertical
     */
    renderVerticalCombatList(combatState) {
        const listContainer = document.getElementById('sidebar-combat-list');
        if (!listContainer) return;

        const activeIndex = combatState.activeTurnIndex || 0;

        listContainer.innerHTML = combatState.turnOrder.map((participant, index) => {
            const isActive = index === activeIndex;
            const type = participant.type || 'monster';
            const isMonster = type === 'monster';
            const isNPC = type === 'npc';
            const isPlayer = type === 'player';

            const reactive = isPlayer && participant.characterId ? this.reactiveData.get(participant.characterId) : null;

            const hp = reactive ? reactive.hp : participant.hp;
            const maxHp = reactive ? reactive.maxHp : participant.maxHp;
            const ac = reactive ? reactive.ac : participant.ac;

            const isAlive = hp > 0;
            const hpPercent = (hp / maxHp) * 100;

            const isTargetable = this.targetingMode && isPlayer;

            let icon = 'user-shield';
            if (isMonster) icon = 'dragon';
            if (isNPC) icon = 'user-group';

            return `
                <div class="combat-token-v2 ${type} ${isActive ? 'active-turn' : ''} ${!isAlive ? 'defeated' : ''} ${isTargetable ? 'targetable' : ''}"
                     data-id="${participant.id}">
                    
                    <div class="token-initiative-badge">${participant.initiative}</div>

                    <div class="token-icon-sml">
                        <i class="fas fa-${icon}"></i>
                    </div>

                    <div class="token-details-sml">
                        <div class="token-name-sml">${escapeHTML(participant.name)}</div>
                        <div class="token-hp-bar-sml">
                            <div class="hp-fill-sml" style="width: ${hpPercent}%; background: ${this.getSimpleHPColor(hpPercent)}"></div>
                        </div>
                        <div class="token-meta-sml">
                            <span>${hp}/${maxHp} HP</span>
                            <span>CA ${ac}</span>
                        </div>
                    </div>

                    <div class="token-actions">
                        ${((isMonster || isNPC) && window.StageModule?.isGM && isActive) ? `
                            <button class="combat-action-btn sword-btn" onclick="event.stopPropagation(); CombatUI.startTargetSelection('${participant.id}')" title="Executar Ação do Mestre">
                                <i class="fas fa-crosshairs"></i>
                            </button>
                        ` : ''}
                        ${(isPlayer && isActive && (participant.playerId === window.StageModule?.user?.uid)) ? `
                            <button class="combat-action-btn action-btn" onclick="event.stopPropagation(); CombatUI.handleParticipantClick('${participant.id}', '${escapeHTML(participant.name.replace(/'/g, "\\'"))}', ${index})" title="Minhas Ações">
                                <i class="fas fa-magic"></i>
                            </button>
                        ` : ''}
                    </div>

                    ${!isAlive ? '<i class="fas fa-skull token-defeated-icon" style="position: absolute; right: 10px; color: #f44336; font-size: 1.2rem;"></i>' : ''}
                </div>
            `;
        }).join('');
    },

    getSimpleHPColor(percent) {
        if (percent > 60) return '#4caf50';
        if (percent > 30) return '#ffc107';
        return '#f44336';
    },

    handleParticipantClick(id, name, index) {
        if (this.targetingMode) {
            this.executeTargetedAttack(id, name);
            return;
        }

        logger.debug(`🎯 CombatUI: Clique em ${name} (${id})`);

        // Buscar participante completo do estado
        const participant = this.combatState.turnOrder.find(p => p.id === id);

        if (window.HeroActions) {
            window.HeroActions.openActionModal(participant || { id, name });
        }
    },

    startTargetSelection(attackerId) {
        this.currentAttackerId = attackerId;
        const attacker = this.combatState.turnOrder.find(p => p.id === attackerId);
        if (!attacker) return;

        // Reset Local State
        this.localRollState = {
            targetId: null,
            targetName: null,
            attack: null,
            hitRoll: null,
            hitFormula: null,
            damageRoll: null,
            damageFormula: null,
            isAdvantage: false,
            isDisadvantage: false,
            advantageRolls: []
        };

        this.renderTargetingPanel();
    },

    renderTargetingPanel() {
        const attacker = this.combatState.turnOrder.find(p => p.id === this.currentAttackerId);
        if (!attacker) return;

        let panel = document.getElementById('targeting-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'targeting-panel';
            panel.className = 'modal-stage';
            document.body.appendChild(panel);
        }

        const targets = this.combatState.turnOrder.filter(p => p.hp > 0 && p.id !== this.currentAttackerId);
        let attacks = [];
        const rawActions = attacker.actions || attacker.monsterData?.actions || [];

        if (Array.isArray(rawActions) && rawActions.length > 0) {
            attacks = rawActions;
        } else if (typeof rawActions === 'string' && rawActions.trim()) {
            attacks = rawActions.split(';').map(a => ({ name: a.trim(), damage: '', range: '', desc: '' })).filter(a => a.name);
        }

        // Support new AbilitySchema and legacy combat.attacks for monsters
        if ((attacker.type === 'monster' || attacker.type === 'npc') && attacker.monsterData) {
            const mData = attacker.monsterData;
            
            // Gather standard attacks
            const standardAttacks = (mData.combat?.attacks || []).map(atk => ({
                name: atk.name || 'Ataque',
                damage: atk.damage || '1d6',
                range: '---',
                category: 'Combate',
                desc: atk.description || ''
            }));
            
            // Gather new AbilitySchema abilities
            const schemaAbilities = (mData.abilities || []).map(ab => {
                const em = ab.execution_mechanics || {};
                const dmgObj = (em.damage && em.damage.length > 0) ? em.damage[0] : null;
                const damageStr = dmgObj ? `${dmgObj.dice_count||1}d${dmgObj.dice_type||6} ${dmgObj.damage_type||''}` : '---';
                return {
                    name: ab.identity?.name || 'Habilidade',
                    damage: damageStr,
                    range: ab.trigger_logic?.range?.value ? `${ab.trigger_logic.range.value}${ab.trigger_logic.range.unit}` : '---',
                    category: ab.identity?.origin === 'Spell' ? 'Magias' : 'Habilidades',
                    desc: ab.description || ''
                };
            });
            
            if (standardAttacks.length > 0 || schemaAbilities.length > 0) {
                 attacks = [...attacks, ...standardAttacks, ...schemaAbilities];
            }
        }

        if (attacks.length === 0) attacks.push({ name: "Ataque Básico", damage: "1d6", range: "1,5m", desc: "" });

        const state = this.localRollState;
        const isPlayer = attacker.type === 'player';

        // Group actions by category
        const categories = {};
        attacks.forEach(a => {
            const cat = a.category || "Ações";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(a);
        });

        panel.innerHTML = `
            <div class="modal-stage-content parchment-mini">
                <h3 class="medieval-title">${isPlayer ? 'Suas Ações' : 'Executar Ação'}: ${escapeHTML(attacker.name)}</h3>
                <div class="modal-subtitle">
                    ${isPlayer ? 'ESCOLHA SEU DESTINO' : 'ORDENS DO MESTRE'}
                </div>
                
                <div class="targeting-section">
                    <div class="targeting-section-title"><i class="fas fa-bullseye"></i> Escolher Alvo</div>
                    <div class="targeting-list" id="target-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        ${targets.map(t => {
            const isSelected = state.targetId === t.id;
            return `
                                <button class="target-item-btn ${isSelected ? 'selected' : ''}" 
                                        onclick="CombatUI.selectTarget('${t.id}', '${escapeHTML(t.name.replace(/'/g, "\\'"))}')">
                                    <strong>${escapeHTML(t.name)}</strong><br>
                                    <small>${t.hp} HP | CA: ${t.ac || 10}</small>
                                </button>
                            `;
        }).join('')}
                    </div>
                </div>

                <div class="targeting-listCategorized" style="margin-top: 20px; max-height: 300px; overflow-y: auto; padding-right: 5px;">
                    ${Object.entries(categories).map(([catName, catActions]) => `
                        <div class="targeting-section">
                            <div class="targeting-section-title">
                                <i class="fas ${this.getCategoryIcon(catName)}"></i> ${catName.toUpperCase()}
                            </div>
                            <div class="targeting-list">
                                ${catActions.map((a, i) => {
            const isSelected = state.attack && state.attack.name === a.name;
            // Find global index in flat attacks array
            const globalIndex = attacks.indexOf(a);
            // Use base64 encoding to completely avoid quote issues in HTML attributes
            const safeActionB64 = btoa(unescape(encodeURIComponent(JSON.stringify(a))));

            // Build meta info: spells show level + school + damage; weapons show damage + range
            const noDmg = !a.damage || a.damage === '---' || a.damage.toLowerCase() === 'nenhum';
            const noRange = !a.range || a.range === '---' || a.range.toLowerCase() === 'nenhum';
            let metaHtml = '';
            if (a.isSpell) {
                const dmgDisplay = !noDmg ? `Dano: ${escapeHTML(a.damage)}` : '<em>Utilidade</em>';
                metaHtml = `${dmgDisplay} | Alcance: ${escapeHTML(!noRange ? a.range : '---')}` +
                    (a.levelLabel ? ` | ${escapeHTML(a.levelLabel)}` : '') +
                    (a.school ? ` · ${escapeHTML(a.school)}` : '');
            } else {
                const dmgPart = !noDmg ? `Dano: ${escapeHTML(a.damage)}` : '';
                const rangePart = !noRange ? `Alcance: ${escapeHTML(a.range)}` : '';
                metaHtml = [dmgPart, rangePart].filter(Boolean).join(' | ');
            }

            return `
                                        <div class="action-item-premium attack-item-btn ${isSelected ? 'selected' : ''} ${a.isSpell ? 'spell-action' : ''}" 
                                             onclick="CombatUI.selectAttack(${globalIndex}, '${safeActionB64}', true)"
                                             title="${escapeHTML(a.desc || 'Sem descrição.')}">
                                            <div class="action-info-main">
                                                <span class="action-name-bold">${a.isSpell ? '<i class="fas fa-hat-wizard" style="opacity:0.6; margin-right:4px;"></i>' : ''}${escapeHTML(a.name)}</span>
                                                <span class="action-meta-tiny">${metaHtml}</span>
                                            </div>
                                            <i class="fas ${isSelected ? 'fa-check-circle' : 'fa-chevron-right'}" style="opacity: ${isSelected ? '0.8' : '0.3'};"></i>
                                        </div>
                                    `;
        }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${state.attack ? `
                <div class="targeting-section action-details-flow">
                    <div class="targeting-section-title"><i class="fas fa-dice-d20"></i> Dados do Oráculo</div>
                    
                    <div class="roll-flow-container-v2">
                        <!-- Hit Roll Area -->
                        <div class="roll-step-box">
                            <div class="step-label">ROLA ACERTO</div>
                            <div class="hit-roll-controls">
                                <button class="dice-toggle-btn ${state.isAdvantage ? 'active' : ''}" onclick="CombatUI.toggleRollMode('advantage')" title="Vantagem">
                                    <i class="fas fa-angle-double-up"></i>
                                </button>
                                <button class="dice-main-btn" onclick="CombatUI.performLocalRoll('hit', '1d20')">
                                    ${state.hitRoll ? `<span>${state.hitRoll}</span>` : '<i class="fas fa-dice-d20"></i> d20'}
                                </button>
                                <button class="dice-toggle-btn ${state.isDisadvantage ? 'active' : ''}" onclick="CombatUI.toggleRollMode('disadvantage')" title="Desvantagem">
                                    <i class="fas fa-angle-double-down"></i>
                                </button>
                            </div>
                            
                            ${state.hitRoll ? `
                                <div class="hit-indicator ${state.hitResult === 'hit' ? 'is-hit' : 'is-miss'}">
                                    ${state.hitResult === 'hit' ? 'ACERTOU!' : 'ERROU!'}
                                </div>
                                <div class="advantage-debug" style="font-size: 0.7rem; opacity: 0.7; margin-top: 4px;">
                                    ${state.advantageRolls.length > 0
                        ? `Dados: ${state.advantageRolls.join(' e ')} → ${state.hitRollRaw || state.hitRoll}`
                        : `d20: ${state.hitRollRaw || state.hitRoll}`}${state.hitBonus ? ` + bônus: ${state.hitBonus}` : ''} = <strong>${state.hitRoll}</strong>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Damage Roll Area -->
                        <div class="roll-step-box">
                            <div class="step-label">ROLA DANO</div>
                            ${(() => {
                    const hasDamage = state.attack.damage && state.attack.damage !== '---' && state.attack.damage.toLowerCase() !== 'nenhum';
                    const dmgFormula = hasDamage ? state.attack.damage.split(' ')[0] : '1d6';
                    if (hasDamage) {
                        return `<button class="damage-roll-btn" 
                                    onclick="CombatUI.performLocalRoll('damage', '${dmgFormula}')">
                                ${state.damageRoll ? `<span>${state.damageRoll}</span>` : `<i class="fas fa-burst"></i> ${state.attack.damage}`}
                            </button>`;
                    } else {
                        // Utility spell — show disabled indicator + dice picker
                        return `<button class="damage-roll-btn disabled" disabled>
                                ${state.damageRoll ? `<span>${state.damageRoll}</span>` : '<i class="fas fa-shield-alt"></i> Sem dano'}
                            </button>
                            <div class="dice-picker-row" style="display: flex; gap: 6px; margin-top: 8px; justify-content: center; flex-wrap: wrap;">
                                <span style="font-size: 0.7rem; opacity: 0.6; width: 100%; text-align: center; margin-bottom: 2px;">Escolher dado manual:</span>
                                ${['1d4', '1d6', '1d8', '1d10', '1d12'].map(d => `
                                    <button class="dice-pick-btn" onclick="CombatUI.overrideSpellDamage('${d}')"
                                        style="padding: 4px 10px; font-size: 0.75rem; border-radius: 6px; border: 1px solid var(--gold-dark, #b8860b); background: rgba(212,175,55,0.1); color: var(--ink, #2c1810); cursor: pointer; transition: all 0.2s;"
                                        onmouseover="this.style.background='rgba(212,175,55,0.3)'" 
                                        onmouseout="this.style.background='rgba(212,175,55,0.1)'"
                                        title="Rolar ${d}">
                                        <i class="fas fa-dice-d20" style="font-size: 0.65rem; margin-right: 2px;"></i>${d}
                                    </button>
                                `).join('')}
                            </div>`;
                    }
                })()}
                        </div>
                    </div>
                </div>
                ` : `
                <div class="targeting-section" style="margin-top: 20px; opacity: 0.5;">
                    <p style="text-align: center; font-style: italic; font-size: 0.85rem;">Selecione uma ação para liberar os dados...</p>
                </div>
                `}

                <div class="modal-actions-centered">
                    <button class="medieval-btn gold-btn" id="btn-finalize-combat-action" 
                            ${!(state.targetId && state.attack) ? 'disabled' : ''} 
                            onclick="CombatUI.finalizeCombatAction()">
                        ${(state.hitRoll || state.damageRoll) ? 'CONCLUIR & ENVIAR' : 'EXECUTAR'}
                    </button>
                    <button class="medieval-btn secondary" onclick="document.getElementById('targeting-panel').remove()">CANCELAR</button>
                </div>
            </div>
        `;
    },

    getCategoryIcon(cat) {
        const icons = {
            'Combate': 'fa-swords',
            'Magias': 'fa-hat-wizard',
            'Itens': 'fa-bag-shopping',
            'Outros': 'fa-ellipsis'
        };
        return icons[cat] || 'fa-bolt';
    },

    selectTarget(id, name) {
        this.localRollState.targetId = id;
        this.localRollState.targetName = name;
        this.renderTargetingPanel();
    },

    /**
     * Override de dano para magias utilitárias — permite escolher dado manual
     */
    overrideSpellDamage(diceFormula) {
        if (this.localRollState.attack) {
            this.localRollState.attack.damage = diceFormula;
        }
        this.renderTargetingPanel();
    },

    selectAttack(index, attackPayload, isBase64 = false) {
        this.localRollState.attackIndex = index;

        // Robust parsing
        let attackObj = attackPayload;
        if (typeof attackPayload === 'string') {
            try {
                if (isBase64) {
                    attackObj = JSON.parse(decodeURIComponent(escape(atob(attackPayload))));
                } else {
                    attackObj = JSON.parse(attackPayload);
                }
            } catch (err) {
                logger.error("Erro ao processar ação de combate:", err);
            }
        }

        // Safe defaults for damage to avoid blocking the UI
        // Skip default damage for spells or actions with no real damage ("---", "Nenhum", etc.)
        const hasNoDamage = !attackObj.damage || attackObj.damage === '---' || attackObj.damage.toLowerCase() === 'nenhum';
        if (attackObj && hasNoDamage && !attackObj.isSpell && !attackObj.desc?.toLowerCase().includes("sem dano")) {
            // Don't force 1d6 — let the dice picker handle it
            attackObj.damage = '---';
        }

        this.localRollState.attack = attackObj;

        // Auto-resolve non-targeted defensive/utility actions
        if (attackObj.category === "Outros") {
            this.executeImmediateAction(attackObj);
            return;
        }

        this.renderTargetingPanel();
    },

    toggleRollMode(mode) {
        if (mode === 'advantage') {
            this.localRollState.isAdvantage = !this.localRollState.isAdvantage;
            if (this.localRollState.isAdvantage) this.localRollState.isDisadvantage = false;
        } else {
            this.localRollState.isDisadvantage = !this.localRollState.isDisadvantage;
            if (this.localRollState.isDisadvantage) this.localRollState.isAdvantage = false;
        }
        this.renderTargetingPanel();
    },

    performLocalRoll(type, formula) {
        let result = 0;
        let rolls = [];

        if (type === 'hit') {
            if (this.localRollState.isAdvantage || this.localRollState.isDisadvantage) {
                const r1 = Math.floor(Math.random() * 20) + 1;
                const r2 = Math.floor(Math.random() * 20) + 1;
                rolls = [r1, r2];
                result = this.localRollState.isAdvantage ? Math.max(r1, r2) : Math.min(r1, r2);
                this.localRollState.advantageRolls = rolls;
            } else {
                result = Math.floor(Math.random() * 20) + 1;
                this.localRollState.advantageRolls = [];
            }
            this.localRollState.hitRollRaw = result; // natural d20
            this.localRollState.hitFormula = formula;

            // Extract attack bonus from the selected action
            const atkBonus = parseInt(this.localRollState.attack?.bonus) || 0;
            const totalHit = result + atkBonus;
            this.localRollState.hitRoll = totalHit;
            this.localRollState.hitBonus = atkBonus;

            // AC Logic — compare total (d20 + bonus) vs AC
            const target = this.combatState.turnOrder.find(p => p.id === this.localRollState.targetId);
            if (target) {
                const ac = target.ac || 10;
                this.localRollState.hitResult = (totalHit >= ac) ? 'hit' : 'miss';
                // Critical override (natural 20/1)
                if (result === 20) this.localRollState.hitResult = 'hit';
                if (result === 1) this.localRollState.hitResult = 'miss';
            }
        } else {
            // Basic damage parser (only handles simple 1dN format for now or defaults to a roll)
            const parts = formula.toLowerCase().split('d');
            if (parts.length === 2) {
                const num = parseInt(parts[0]) || 1;
                const sides = parseInt(parts[1]) || 6;
                let total = 0;
                for (let i = 0; i < num; i++) total += Math.floor(Math.random() * sides) + 1;
                result = total;
            } else {
                result = Math.floor(Math.random() * 6) + 1;
            }
            this.localRollState.damageRoll = result;
            this.localRollState.damageFormula = formula;
        }

        this.renderTargetingPanel();
    },

    async finalizeCombatAction() {
        const state = this.localRollState;
        if (!state.targetId || !state.attack) return;

        const attacker = this.combatState.turnOrder.find(p => p.id === this.currentAttackerId);
        if (!attacker) return;

        // Build consolidated message
        let msg = `⚔️ **${attacker.name}** ataca **${state.targetName}** com **${state.attack.name}**!\n`;

        if (state.hitRoll) {
            let label = "Acerto";
            if (state.isAdvantage) label += " (Vantagem)";
            if (state.isDisadvantage) label += " (Desvantagem)";

            msg += `🎯 **${label}**: **${state.hitRoll}**`;

            // Result comparison
            if (state.targetId) {
                const target = this.combatState.turnOrder.find(p => p.id === state.targetId);
                const ac = target ? (target.ac || 10) : 10;

                if (state.hitRoll === 20) {
                    msg += " ✨ **CRÍTICO!**";
                } else if (state.hitRoll === 1) {
                    msg += " 💀 **FALHA!**";
                } else {
                    msg += (state.hitRoll >= ac) ? " ✅ **ACERTOU!**" : " ❌ **ERROU!**";
                }
                msg += ` (vs CA ${ac})`;
            }
            msg += "\n";
        }

        if (state.damageRoll) {
            msg += `💥 **Dano**: **${state.damageRoll}** [${state.damageFormula || '---'}]\n`;
        }

        // Close Modal
        const panel = document.getElementById('targeting-panel');
        if (panel) panel.remove();

        // Send to chat - REMOVIDO PARA CALCULAR SOZINHO SEM MENSAGEM NO CHAT CENTRAL
        // if (window.StageModule) {
        //     await window.StageModule.addSystemMessage(msg);
        // }

        // Execute backend logic (Isso garante que calcule sozinho o HP)
        if (window.CombatEngine) {
            if (attacker.type === 'monster' || attacker.type === 'npc') {
                await window.CombatEngine.executeManualMonsterAttack(
                    this.currentAttackerId,
                    state.targetId,
                    state.attack.name,
                    { hit: state.hitRoll, damage: state.damageRoll }
                );
            } else if (attacker.type === 'player' && attacker.playerId) {
                // Registrar ação do jogador no motor
                const actionData = {
                    type: state.attack.isSpell ? 'spell' : (state.attack.type || 'attack'),
                    target: state.targetId,
                    targetName: state.targetName,
                    details: state.attack,
                    rollResults: {
                        hit: state.hitRoll,
                        damage: state.damageRoll
                    }
                };
                await window.CombatEngine.registerAction(attacker.playerId, actionData);
            }
        }

        // REMOVIDO: Deixar que o listener do snapshot no session-stage.js renderize sozinho
        // ao detectar a mudança no Firestore. Isso evita "jitter" ou renderizar dados locais obsoletos.
        // this.renderVerticalCombatList(this.combatState); 
    },

    rollWithAdvantage(formula, label) {
        if (window.StageModule) {
            window.StageModule.rollDice("2d20kh1", `${label} (Vantagem)`);
        }
    },

    rollWithDisadvantage(formula, label) {
        if (window.StageModule) {
            window.StageModule.rollDice("2d20kl1", `${label} (Desvantagem)`);
        }
    },

    quickRollDamage(formula, label) {
        if (!formula) return;
        if (window.StageModule) {
            window.StageModule.rollDice(formula, `Dano: ${label}`);
        }
    },

    async executeImmediateAction(attackObj) {
        const attacker = this.combatState.turnOrder[this.combatState.activeTurnIndex || 0];
        if (!attacker) return;

        // Initialize statusEffects if missing
        if (!attacker.statusEffects) attacker.statusEffects = [];

        // Roll d20 + Modifier (real stats)
        const d20 = Math.floor(Math.random() * 20) + 1;
        let modifier = 0;
        let modType = "";

        if (attackObj.name === "Esquivar" || attackObj.name === "Fugir") {
            modifier = attacker.dexMod || 0;
            modType = "DES";
        } else if (attackObj.name === "Defender") {
            modifier = attacker.conMod || 0;
            modType = "CON";
        }

        const total = d20 + modifier;
        const modString = modifier >= 0 ? `+${modifier}` : `${modifier}`;

        let actionVerb = "prepara uma ação";
        let icon = "🛡️";
        let resultMsg = "";

        // === DEFENDER: +2 CA até o próximo turno ===
        if (attackObj.name === "Defender") {
            actionVerb = "assume uma postura defensiva";
            icon = '<i class="fas fa-shield-halved" style="color: var(--gold); margin-right: 6px;"></i>';
            const acBonus = 2;
            attacker.ac = (attacker.ac || 10) + acBonus;
            attacker.statusEffects.push({ type: 'defend', acBonus: acBonus });
            resultMsg = `\n<i class="fas fa-shield-halved" style="color: #4caf50; margin-right: 6px;"></i> **Sucesso!** CA aumentada para **${attacker.ac}** (+${acBonus}) até o próximo turno.`;
        }

        // === ESQUIVAR: impõe desvantagem nos ataques até o próximo turno ===
        if (attackObj.name === "Esquivar") {
            actionVerb = "toma posição evasiva";
            icon = '<i class="fas fa-wind" style="color: var(--gold); margin-right: 6px;"></i>';
            attacker.statusEffects.push({ type: 'dodge' });
            resultMsg = `\n<i class="fas fa-wind" style="color: #4caf50; margin-right: 6px;"></i> **Sucesso!** Ataques contra **${attacker.name}** terão **desvantagem** até o próximo turno.`;
        }

        // === FUGIR: CD 10 para escapar do combate ===
        if (attackObj.name === "Fugir") {
            actionVerb = "tenta fugir do combate";
            icon = '<i class="fas fa-person-running" style="color: var(--gold); margin-right: 6px;"></i>';
            const dc = 10;
            if (total >= dc) {
                resultMsg = `\n<i class="fas fa-check-circle" style="color: #4caf50; margin-right: 6px;"></i> **Fuga bem-sucedida!** (${total} ≥ CD ${dc}) **${attacker.name}** escapa do campo de batalha!`;
            } else {
                resultMsg = `\n<i class="fas fa-times-circle" style="color: #f44336; margin-right: 6px;"></i> **Fuga fracassada!** (${total} < CD ${dc}) **${attacker.name}** não conseguiu escapar.`;
            }
        }

        let msg = `${icon} **${attacker.name}** ${actionVerb} (**${attackObj.name}**)!`;
        msg += `\n<i class="fas fa-dice-d20" style="color: var(--gold); margin-right: 6px;"></i> Rolagem: **${total}** (d20: ${d20} ${modString} ${modType})`;
        msg += resultMsg;

        // Send to chat
        if (window.StageModule) {
            await window.StageModule.addSystemMessage(msg);
        }

        // Save combat state with effects applied
        if (window.CombatEngine) {
            await window.CombatEngine.saveCombatState();

            // Handle flee: remove from combat if successful
            if (attackObj.name === "Fugir" && total >= 10) {
                // Mark as 0 HP to effectively remove from turn order
                attacker.hp = 0;
                attacker.fled = true;
                await window.CombatEngine.saveCombatState();

                // Check if all players fled (count as defeat) or if combat can continue
                const combatEnd = window.CombatEngine.checkCombatEnd();
                if (combatEnd) {
                    await window.CombatEngine.endCombat(combatEnd.winner);
                }
            }

            // Register action for the backend
            let actionType = 'defend';
            if (attackObj.name === "Esquivar") actionType = 'dodge';
            if (attackObj.name === "Fugir") actionType = 'flee';

            if (attacker.type === 'player' && attacker.playerId) {
                const actionData = {
                    type: actionType,
                    target: attacker.id,
                    targetName: attacker.name,
                    details: attackObj,
                    rollResults: { hit: total, total: total, d20: d20, damage: null }
                };
                await window.CombatEngine.registerAction(attacker.playerId, actionData);
            }
        }

        // Close Modal
        const modal = document.getElementById('combat-action-modal');
        if (modal) modal.remove();

        // Remove targeting panel if it somehow exists
        const panel = document.getElementById('targeting-panel');
        if (panel) panel.remove();
    },

    updateEndTurnButton(combatState) {
        const btn = document.getElementById('btn-sidebar-end-turn');
        if (!btn) return;

        const activeActor = combatState.turnOrder[combatState.activeTurnIndex || 0];
        const isMaster = window.StageModule?.isGM;
        const isMyTurn = activeActor && activeActor.playerId === window.StageModule?.user?.uid;

        btn.disabled = !(isMaster || isMyTurn);

        btn.onclick = async () => {
            if (window.CombatEngine) {
                await window.CombatEngine.nextTurn();
            }
        };
    },

    hideCombatPanel() {
        const narrativeContainer = document.getElementById('narrative-actions-container');
        const combatContainer = document.getElementById('combat-actions-container');

        if (narrativeContainer && combatContainer) {
            narrativeContainer.classList.remove('hidden');
            combatContainer.classList.add('hidden');
        }
    },

    showFeedback(message, type = 'info') {
        const feedback = document.createElement('div');
        feedback.className = `combat-feedback ${type}`;
        feedback.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            ${escapeHTML(message)}
        `;

        const panel = document.getElementById('combat-actions-container');
        if (panel) {
            panel.appendChild(feedback);
            setTimeout(() => {
                feedback.classList.add('fade-out');
                setTimeout(() => feedback.remove(), 300);
            }, 3000);
        }
    },

    async handleForceEndCombat() {
        const confirmed = await window.StageModule?.showMysticConfirm("Deseja realmente encerrar a batalha agora? Isso interromperá todos os turnos e removerá as criaturas do campo.", "Poder do Mestre");
        if (confirmed) {
            import('./combat-engine.js').then(m => {
                m.default.endCombat('players'); // Assume players win for narrative closure
            });
        }
    }
};

window.CombatUI = CombatUI;
export default CombatUI;
