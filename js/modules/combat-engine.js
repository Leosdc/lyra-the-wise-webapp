/**
 * Combat Engine — Barrel (Motor de Turnos Inteligente)
 * Turn management, initiative, round processing, combat state.
 *
 * Sub-module:
 *  - combat-damage.js → applyDamage, syncCharacterHP, getNPCSyncUpdates,
 *                        executeManualMonsterAttack, getManualAttackPrompt
 */

import { db } from "../auth.js";
import { getAuth } from "firebase/auth";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from "firebase/firestore";
import { getCharacter } from "../data.js";
import { logger } from "../logger.js";
import CombatOracle from "./combat-oracle.js";
import { callGeminiAPI } from "../ai.js";
import { escapeHTML } from "./utils.js";

import { createDamageMixin } from './combat-damage.js';

/**
 * Extrai dano de uma descrição de magia usando regex inteligente.
 * Procura padrões como "3d8 radiante", "8d6 de fogo", "2d10 + 5 necrótico", etc.
 * @param {string} description - Texto descritivo da magia
 * @returns {string} Dano formatado (ex: "8d6 fogo") ou "---" se não encontrar
 */
function extractSpellDamage(description) {
    if (!description || typeof description !== 'string') return '---';

    // Regex: captura NdN (opcionalmente + modificador) seguido de tipo de dano
    const dmgRegex = /(\d+d\d+)(?:\s*\+\s*\d+)?(?:\s+(?:de\s+)?(?:dano\s+)?(?:de\s+)?(\w+))?/gi;
    const matches = [];
    let match;

    while ((match = dmgRegex.exec(description)) !== null) {
        const dice = match[1];
        const rawType = (match[2] || '').toLowerCase();

        // Filter out false positives — common non-damage-type words
        const ignoredWords = [
            'pés', 'metros', 'minutos', 'horas', 'dias', 'rounds', 'rodadas',
            'criaturas', 'alvos', 'pontos', 'feet', 'minutes', 'hours',
            'rounds', 'targets', 'creatures', 'points', 'cada', 'each',
            'nível', 'level', 'slot', 'slots'
        ];

        if (ignoredWords.includes(rawType)) {
            matches.push(dice);
        } else if (rawType) {
            matches.push(`${dice} ${rawType}`);
        } else {
            matches.push(dice);
        }
    }

    return matches.length > 0 ? matches[0] : '---';
}

const CombatEngine = {
    sessionId: null,
    sessionData: null,
    combatState: null,

    /**
     * Inicializa o combate
     */
    async initCombat(sessionId, sessionData, monstersOverride = null) {
        logger.info("⚔️ CombatEngine: Inicializando combate...");

        this.sessionId = sessionId;
        this.sessionData = sessionData;

        try {
            // 1. Buscar jogadores
            const players = await this.getPlayersWithFullData();
            logger.info(`✅ ${players.length} jogadores carregados para o combate.`);

            // 2. Definir monstros (Override se disponível, senão pega da sessão)
            let monsters = monstersOverride || sessionData.linked_monsters || [];
            const allies = sessionData.allies || [];

            // Deduplicar: se um monstro/NPC já está no linked_monsters (expandido), não pegar do allies bruto
            const combinedMonsters = [...monsters];
            allies.forEach(a => {
                const baseId = a.id;
                const exists = combinedMonsters.some(m => m.id === baseId || m.id.startsWith(`${baseId}_`));
                if (!exists) {
                    combinedMonsters.push(a);
                }
            });

            console.log(`✅ ${players.length} jogadores, ${monsters.length} monstros e ${combinedMonsters.length - monsters.length} aliados únicos preparados`);

            const turnOrder = this.calculateInitiative(players, combinedMonsters);
            logger.debug("✅ Ordem de iniciativa calculada:", turnOrder.map(p => `${p.name} (${p.initiative})`));

            // 4. Inicializar estado de combate
            this.combatState = {
                sessionId: sessionId,
                round: 1,
                activeTurnIndex: 0,
                phase: "action",
                turnOrder: turnOrder,
                playerActions: this.initializePlayerActions(players),
                roundHistory: [],
                startedAt: new Date().toISOString()
            };

            // 5. Salvar no Firestore
            await this.saveCombatState();

            // 6. Enviar mensagem de início com monstros formatados como NPCs clicáveis
            const monsterList = turnOrder
                .filter(p => p.type === 'monster')
                .map(m => `[NPC: ${escapeHTML(m.name)} | ${escapeHTML(m.monsterData.race || m.monsterData.type || 'Criatura')} | ${escapeHTML(m.monsterData.description || m.monsterData.desc || 'Adversário misterioso')}]`)
                .join('\n');

            // 6. Silence redundant initiative message (User request: already visible in sidebar)
            /*
            await this.sendCombatMessage(
                `⚔️ <strong>INÍCIO DO COMBATE!</strong>\n\n` +
                `${monsterList}\n\n` +
                `<strong>Ordem de Iniciativa:</strong>\n` +
                turnOrder.map((p, i) => {
                    const icon = p.type === 'monster' ? '💀' : '🛡️';
                    return `${i + 1}. ${icon} <strong>${p.name}</strong> - 🎲 ${p.initiativeRoll} + ${p.dexMod >= 0 ? '+' : ''}${p.dexMod} = <strong>${p.initiative}</strong>`;
                }).join('\n'),
                'system'
            );
            */

            console.log("✅ CombatEngine: Combate iniciado com sucesso!");
            return this.combatState;

        } catch (error) {
            console.error("❌ Erro ao inicializar combate:", error);
            throw error;
        }
    },

    /**
     * Busca jogadores com TODOS os dados das fichas
     */
    async getPlayersWithFullData() {
        const players = [];

        try {
            const q = query(
                collection(db, "session_invites"),
                where("sessionId", "==", this.sessionId),
                where("status", "==", "online")
            );

            const snapshot = await getDocs(q);

            for (const inviteDoc of snapshot.docs) {
                const invite = inviteDoc.data();

                if (invite.characterId) {
                    const char = await getCharacter(invite.characterId);

                    if (char) {
                        let resolvedPlayerId = invite.uid || inviteDoc.id;

                        if (!invite.uid && invite.email) {
                            try {
                                const { query, collection, where, getDocs } = await import("firebase/firestore");
                                const qProfile = query(collection(db, "usuarios"), where("email", "==", invite.email.toLowerCase()));
                                const snapProfile = await getDocs(qProfile);
                                if (!snapProfile.empty) {
                                    resolvedPlayerId = snapProfile.docs[0].id;
                                    console.log(`🪪 [Combat] ID resolvido via e-mail para ${invite.email}: ${resolvedPlayerId}`);
                                }
                            } catch (e) {
                                console.warn("Erro ao buscar UID por e-mail:", e);
                            }
                        }

                        // Mapeamento robusto de HP e AC
                        const getVal = (paths, fallback = 10) => {
                            for (const path of paths) {
                                let val = char;
                                for (const segment of path.split('.')) {
                                    val = val?.[segment];
                                }
                                if (val !== undefined && val !== null) return val;
                            }
                            return fallback;
                        };

                        const currentHp = getVal(['stats.hp_current', 'attributes.HP.current', 'combat.hp.current', 'stats.hp', 'hp', 'attributes.Vida.atual', 'vida_atual'], 10);
                        const maxHp = getVal(['stats.hp_max', 'attributes.HP.max', 'combat.hp.max', 'stats.maxHp', 'maxHp', 'attributes.Vida.max', 'vida_max'], 10);
                        const ac = getVal(['stats.ac', 'attributes.CA.value', 'combat.ac', 'ac', 'attributes.CA.bonus', 'ca_valor'], 10);

                        players.push({
                            id: invite.characterId,
                            characterId: invite.characterId,
                            playerId: resolvedPlayerId,
                            playerEmail: invite.email,
                            name: char.bio?.name || invite.characterName || 'Desconhecido',
                            type: 'player',
                            hp: currentHp,
                            maxHp: maxHp,
                            ac: ac,
                            dexterity: char.stats?.dexterity || char.abilities?.dex?.value || 10,
                            constitution: char.stats?.constitution || char.abilities?.con?.value || 10,
                            characterData: {
                                bio: char.bio || {},
                                stats: char.stats || {},
                                combat: char.combat || { attacks: [] },
                                spells: char.spells || { list: [], slots: {} },
                                inventory: char.inventory || { items: [] },
                                background: char.background || {}
                            },
                            actions: (() => {
                                // 1. Ataques de arma com categoria "Combate"
                                const weaponActions = (char.combat?.attacks || []).map(atk => ({
                                    ...atk,
                                    category: 'Combate'
                                }));

                                // 2. Magias preparadas (+ truques) convertidas em ações
                                const spellList = char.spells?.list || [];
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

                                        const levelLabel = (sp.level === 0 || sp.level === '0' || sp.level === 'Truque')
                                            ? 'Truque'
                                            : `Nv. ${sp.level}`;
                                        return {
                                            name: sp.name,
                                            damage: dmg,
                                            range: range,
                                            desc: sp.description ? sp.description.substring(0, 120) + '...' : '',
                                            category: 'Magias',
                                            spellLevel: sp.level,
                                            school: sp.school || '',
                                            isSpell: true,
                                            levelLabel: levelLabel
                                        };
                                    });

                                // 3. Itens mágicos com mecânicas equipados
                                const itemList = char.inventory?.items || [];
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

                                return [...weaponActions, ...spellActions, ...itemActions];
                            })()
                        });
                    }
                }
            }
        } catch (error) {
            console.error("❌ Erro ao buscar jogadores:", error);
        }

        return players;
    },

    /**
     * Calcula iniciativa para todos participantes
     */
    calculateInitiative(players, monsters) {
        const all = [];

        for (const player of players) {
            const dexMod = Math.floor((player.dexterity - 10) / 2);
            const roll = Math.floor(Math.random() * 20) + 1;
            all.push({
                ...player,
                initiative: dexMod + roll,
                initiativeRoll: roll,
                dexMod: dexMod,
                conMod: Math.floor(((player.constitution || 10) - 10) / 2),
                statusEffects: []
            });
        }

        for (const monster of monsters) {
            const dex = monster.stats?.dexterity || monster.secoes?.Atributos?.Destreza || monster.dexterity || 10;
            const hp = monster.hp || monster.stats?.hp || monster.stats?.maxHp || 10;
            const ac = monster.ac || monster.stats?.ac || monster.secoes?.CA || 10;

            const dexMod = Math.floor((dex - 10) / 2);
            const roll = Math.floor(Math.random() * 20) + 1;
            all.push({
                id: monster.id || `monster_${Date.now()}_${Math.random()}`,
                name: monster.name || 'Adversário',
                type: monster.type || 'monster',
                hp: hp,
                maxHp: hp,
                ac: ac,
                dexterity: dex,
                initiative: dexMod + roll,
                initiativeRoll: roll,
                dexMod: dexMod,
                conMod: 0,
                statusEffects: [],
                monsterData: monster
            });
        }

        all.sort((a, b) => {
            if (b.initiative !== a.initiative) {
                return b.initiative - a.initiative;
            }
            return b.dexterity - a.dexterity;
        });

        return all;
    },

    /**
     * Inicializa objeto de ações dos jogadores
     */
    initializePlayerActions(players) {
        const actions = {};

        for (const player of players) {
            actions[player.playerId] = {
                hasActed: false,
                isComplete: false,
                action: null,
                timestamp: null
            };
        }

        return actions;
    },

    /**
     * Registra ação de um jogador
     */
    async registerAction(playerId, actionData) {
        console.log(`📝 Registrando ação do jogador ${playerId}:`, actionData);

        if (!this.combatState) {
            throw new Error("Combate não inicializado");
        }

        const isComplete = this.isActionComplete(actionData);

        const activeParticipant = this.combatState.turnOrder[this.combatState.activeTurnIndex];
        if (activeParticipant.playerId !== playerId) {
            console.warn("⚠️ Não é o seu turno!");
            return { error: "Não é o seu turno" };
        }

        this.combatState.playerActions[playerId] = {
            hasActed: true,
            isComplete: isComplete,
            action: actionData,
            timestamp: new Date().toISOString()
        };

        try {
            await this.saveCombatState();

            console.log("🔍 [Debug] Verificando aplicação de dano:", {
                hasDamage: !!actionData.rollResults?.damage,
                damage: actionData.rollResults?.damage,
                target: actionData.target,
                actionData
            });

            if (actionData.rollResults?.damage && actionData.target) {
                console.log(`💥 [Debug] Aplicando ${actionData.rollResults.damage} de dano em ${actionData.target}`);

                const activeParticipant = this.combatState.turnOrder[this.combatState.activeTurnIndex];
                const targetParticipant = this.combatState.turnOrder.find(p => p.id === actionData.target);

                const actionName = actionData.name || actionData.details?.name || actionData.details?.label || 'Ação';
                const hitRoll = actionData.rollResults?.hit || actionData.rollResults?.attack || actionData.rollResults?.total || '?';
                const damage = actionData.rollResults?.damage || 0;

                const actionSummary = `rolou **${escapeHTML(String(hitRoll))}** para **${escapeHTML(actionName)}** contra **${escapeHTML(targetParticipant?.name || 'seu alvo')}**! (Dano: ${escapeHTML(String(damage))})`;
                this.sendCombatMessage(`${escapeHTML(activeParticipant.name)} ${actionSummary}`);

                await this.applyDamage(actionData.target, damage);

                const target = this.combatState.turnOrder.find(p => p.id === actionData.target);
                if (target && target.hp <= 0) {
                    logger.info(`💀 [Combat] Alvo ${target.name} foi derrotado!`);
                    await this.sendCombatMessage(`<i class="fas fa-skull"></i> **${escapeHTML(target.name)}** foi derrotado!`, 'system');
                }
            } else {
                const activeParticipant = this.combatState.turnOrder[this.combatState.activeTurnIndex];
                const actionType = actionData.type || 'unknown';
                const d20Roll = actionData.rollResults?.d20 || 0;
                const totalRoll = actionData.rollResults?.total || 0;

                if (['defend', 'dodge', 'flee'].includes(actionType)) {
                    let outcomeMsg = "";
                    if (actionType === 'dodge') {
                        if (totalRoll >= 12) {
                            const stats = activeParticipant.characterData?.stats || {};
                            const bio = activeParticipant.characterData?.bio || {};
                            const hdStr = stats.hit_dice_total || bio.hitDie || "1d4";

                            const match = hdStr.toString().match(/d(\d+)/i);
                            const dieSize = match ? parseInt(match[1]) : 4;

                            const healAmount = Math.floor(Math.random() * dieSize) + 1;

                            const maxHp = activeParticipant.maxHp || 10;
                            const newHp = Math.min((activeParticipant.hp || 0) + healAmount, maxHp);
                            activeParticipant.hp = newHp;

                            const updates = {
                                combatState: this.combatState,
                                updatedAt: serverTimestamp()
                            };

                            if (activeParticipant.type === 'player' && activeParticipant.characterId) {
                                this.syncCharacterHP(activeParticipant.characterId, newHp).catch(e =>
                                    console.warn("[Combat] Erro no sync da ficha:", e)
                                );
                            } else if (['monster', 'npc'].includes(activeParticipant.type)) {
                                try {
                                    const sessionRef = doc(db, "sessoes", this.sessionId);
                                    const snap = await getDoc(sessionRef);
                                    if (snap.exists()) {
                                        const npcsUpdates = this.getNPCSyncUpdates(snap.data(), activeParticipant.id, newHp);
                                        Object.assign(updates, npcsUpdates);
                                    }
                                } catch (err) {
                                    console.warn("[Combat] Erro no sync do monstro:", err);
                                }
                            }

                            try {
                                const sessionRef = doc(db, "sessoes", this.sessionId);
                                await updateDoc(sessionRef, updates);
                            } catch (e) {
                                console.warn(`⚠️ [Combat] Falha leve ao sincronizar combatState no dodge (jogador sem permissão):`, e);
                            }

                            outcomeMsg = `✨ **Sucesso!** Usou o fôlego (Dado de Vida d${dieSize}) e recuperou **${healAmount} HP** com uma evasão ágil.`;
                        } else {
                            outcomeMsg = `⚠️ **Falha na esquiva!** A manobra não foi rápida o suficiente.`;
                        }
                    } else if (actionType === 'defend') {
                        if (totalRoll >= 10) {
                            outcomeMsg = `🛡️ **Sucesso!** Assumiu uma postura defensiva sólida (CA efetiva aumentada).`;
                        } else {
                            outcomeMsg = `⚠️ **Postura Instável!** A defesa foi comprometida.`;
                        }
                    } else if (actionType === 'flee') {
                        if (totalRoll >= 15) {
                            outcomeMsg = `🏃 **Sucesso!** Conseguiu recuar rapidamente para um ponto seguro!`;
                        } else {
                            outcomeMsg = `⚠️ **Interceptado!** Não obteve sucesso em se afastar do perigo.`;
                        }
                    }

                    this.sendCombatMessage(`${escapeHTML(activeParticipant.name)}: ${outcomeMsg}`);
                } else {
                    const actionName = actionData.name || actionData.details?.name || 'Ação';
                    const rollStr = actionData.rollResults?.total ? ` (Rolagem: **${escapeHTML(String(actionData.rollResults.total))}**)` : '';
                    this.sendCombatMessage(`${escapeHTML(activeParticipant.name)} utilizou **${escapeHTML(actionName)}**${rollStr}.`);
                }
            }

            if (isComplete) {
                await this.nextTurn();
            }
        } catch (e) {
            console.error("❌ [Combat] Erro ao processar registro de ação:", e);
        }

        return { isComplete };
    },

    /**
     * Avança para o próximo turno na ordem de iniciativa
     */
    async nextTurn() {
        if (!this.combatState || this.combatState.phase === 'ended') return;

        const autoEnd = this.checkCombatEnd();
        if (autoEnd) {
            console.log("🏁 [Combat] Vitória/Derrota detectada no avanço de turno.");
            await this.endCombat(autoEnd.winner);
            return;
        }

        if (this.isAdvancing) {
            console.warn("⏳ [Combat] Já existe um avanço de turno em progresso. Ignorando chamada duplicada.");
            return;
        }

        this.isAdvancing = true;

        try {
            if (this.monsterTurnTimeout) {
                clearTimeout(this.monsterTurnTimeout);
                this.monsterTurnTimeout = null;
            }

            let nextIndex = this.combatState.activeTurnIndex;
            let originalIndex = nextIndex;
            let found = false;
            let safetyCounter = 0;
            const total = this.combatState.turnOrder.length;

            while (!found && safetyCounter < total) {
                nextIndex = (nextIndex + 1) % total;

                if (nextIndex === 0 && originalIndex !== 0) {
                    this.combatState.round++;
                    await this.sendCombatMessage(`\n🔄 **INÍCIO DA RODADA ${this.combatState.round}**`, 'system');

                    const players = this.combatState.turnOrder.filter(p => p.type === 'player');
                    this.combatState.playerActions = this.initializePlayerActions(players);
                }

                const actor = this.combatState.turnOrder[nextIndex];
                if (actor && actor.hp > 0) {
                    found = true;
                }
                safetyCounter++;
            }

            if (!found) {
                console.warn("⚠️ Nenhum combatente vivo encontrado!");
                this.isAdvancing = false;
                return;
            }

            this.combatState.activeTurnIndex = nextIndex;
            const currentActor = this.combatState.turnOrder[nextIndex];

            // Clear expired status effects when this actor's turn starts
            if (currentActor.statusEffects && currentActor.statusEffects.length > 0) {
                console.log(`🧹 [Combat] Limpando efeitos de ${currentActor.name}: ${currentActor.statusEffects.map(e => e.type).join(', ')}`);
                // Restore AC if defend bonus was active
                const defendEffect = currentActor.statusEffects.find(e => e.type === 'defend');
                if (defendEffect && defendEffect.acBonus) {
                    currentActor.ac = (currentActor.ac || 10) - defendEffect.acBonus;
                    console.log(`🛡️ [Combat] CA de ${currentActor.name} restaurada para ${currentActor.ac}`);
                }
                currentActor.statusEffects = [];
            }

            console.log(`➡️ Avançando turno para: ${currentActor.name} (Index: ${nextIndex})`);

            await this.saveCombatState();

            if (window.StageModule?.isGM) {
                if (currentActor.type === 'monster' || currentActor.type === 'npc') {
                    console.log(`🎭 Turno de ${currentActor.name}. Aguardando ação manual do Mestre.`);
                }
            }
        } catch (e) {
            console.error("❌ [Combat] Erro no avanço de turno:", e);
        } finally {
            this.isAdvancing = false;
        }
    },

    /**
     * Processa turno automático do monstro via Oráculo
     */
    async processMonsterTurn(monster) {
        console.log(`👹 Processando turno do monstro: ${monster.name}`);

        try {
            const result = await CombatOracle.executeMonsterTurn(this.combatState, monster);

            if (result && result.damage && result.targetId) {
                await this.applyDamage(result.targetId, result.damage);
            }

            console.log(`✅ [Combat] Turno do monstro ${monster.name} processado. Aguardando finalização manual pelo Mestre.`);

            if (this.monsterTurnTimeout) {
                clearTimeout(this.monsterTurnTimeout);
                this.monsterTurnTimeout = null;
            }

        } catch (e) {
            console.error("🔥 Erro no turno do monstro:", e);
            this.isAdvancing = false;
        }
    },

    /**
     * Valida se uma ação está completa
     */
    isActionComplete(actionData) {
        if (!actionData || !actionData.type) return false;

        switch (actionData.type) {
            case 'attack':
                return !!(actionData.target && (actionData.weapon || actionData.unarmed || actionData.details));
            case 'spell':
                return !!(actionData.target && (actionData.spell || actionData.details));
            case 'item':
                return !!actionData.item;
            case 'flee':
            case 'defend':
            case 'dodge':
                return true;
            default:
                return false;
        }
    },

    /**
     * Verifica se todos jogadores agiram
     */
    checkAllPlayersActed() {
        const actions = Object.values(this.combatState.playerActions);
        return actions.every(action => action.hasActed && action.isComplete);
    },

    /**
     * Retorna lista de jogadores que ainda não agiram
     */
    getPendingPlayers() {
        const pending = [];

        for (const [playerId, action] of Object.entries(this.combatState.playerActions)) {
            if (!action.hasActed || !action.isComplete) {
                const player = this.combatState.turnOrder.find(p => p.playerId === playerId);
                if (player) {
                    pending.push({
                        playerId,
                        name: player.name,
                        hasActed: action.hasActed,
                        isComplete: action.isComplete
                    });
                }
            }
        }

        return pending;
    },

    /**
     * Processa a rodada quando todos jogadores agiram
     */
    async processRound() {
        console.log(`⚔️ Processando Rodada ${this.combatState.round}...`);

        this.combatState.phase = "resolution";
        await this.saveCombatState();

        try {
            const actions = this.collectAllActions();

            const { default: CombatOracle } = await import('./combat-oracle.js');
            const results = await CombatOracle.narrateRound(this.combatState, actions);

            await this.applyResults(results);

            const combatEnded = this.checkCombatEnd();

            if (combatEnded) {
                await this.endCombat(combatEnded.winner);
            } else {
                await this.startNextRound();
            }

        } catch (error) {
            console.error("❌ Erro ao processar rodada:", error);
            this.combatState.phase = "action";
            await this.saveCombatState();
            throw error;
        }
    },

    /**
     * Coleta todas as ações da rodada
     */
    collectAllActions() {
        const actions = [];

        for (const [playerId, actionData] of Object.entries(this.combatState.playerActions)) {
            if (actionData.hasActed && actionData.isComplete) {
                const player = this.combatState.turnOrder.find(p => p.playerId === playerId);
                if (player) {
                    actions.push({
                        actorId: playerId,
                        actorName: player.name,
                        actorType: 'player',
                        characterData: player.characterData,
                        ...actionData.action
                    });
                }
            }
        }

        return actions;
    },

    /**
     * Aplica resultados da rodada
     */
    async applyResults(results) {
        if (!results || !results.results) return;

        for (const result of results.results) {
            if (result.targetId && result.damage) {
                await this.applyDamage(result.targetId, result.damage);
            }
        }

        this.combatState.roundHistory.push({
            round: this.combatState.round,
            narrative: results.narrative,
            results: results.results,
            timestamp: new Date().toISOString()
        });

        await this.saveCombatState();
    },

    /**
     * Verifica se o combate terminou
     */
    checkCombatEnd() {
        if (!this.combatState) return null;

        const turnOrder = this.combatState.turnOrder || [];

        const playersAlive = turnOrder.filter(p => (p.type === 'player' || p.type === 'ally' || p.type === 'npc') && p.hp > 0);
        const monstersAlive = turnOrder.filter(p => p.type === 'monster' && p.hp > 0);

        if (monstersAlive.length === 0) {
            return { ended: true, winner: 'players' };
        }

        if (playersAlive.length === 0) {
            return { ended: true, winner: 'monsters' };
        }

        return null;
    },

    /**
     * Inicia próxima rodada
     */
    async startNextRound() {
        this.combatState.round++;
        this.combatState.phase = "action";

        for (const playerId in this.combatState.playerActions) {
            this.combatState.playerActions[playerId] = {
                hasActed: false,
                isComplete: false,
                action: null,
                timestamp: null
            };
        }

        await this.saveCombatState();

        console.log(`✅ Rodada ${this.combatState.round} iniciada`);
    },

    /**
     * Encerra o combate
     */
    async endCombat(winner) {
        console.log(`🏁 Combate encerrado! Vencedor: ${winner}`);

        this.combatState.phase = "ended";
        this.combatState.winner = winner;
        this.combatState.endedAt = new Date().toISOString();

        await this.saveCombatState();

        const sessionRef = doc(db, "sessoes", this.sessionId);
        await updateDoc(sessionRef, {
            combatActive: false,
            linked_monsters: []
        });

        const message = winner === 'players'
            ? '🏆 **VITÓRIA!** Os heróis triunfaram sobre seus adversários!'
            : '💀 **DERROTA...** Fim da jornada. O mestre decide o que vai fazer agora.';

        await this.sendCombatMessage(message, 'system');

        if (this.sessionData && this.sessionData.mode === 'oracle') {
            const { default: CombatOracle } = await import('./combat-oracle.js');
            await CombatOracle.narrateCombatEnd(this.combatState, winner);
        } else if (!this.sessionData && this.sessionId) {
            try {
                const snap = await getDoc(doc(db, "sessoes", this.sessionId));
                if (snap.exists() && snap.data().mode === 'oracle') {
                    const { default: CombatOracle } = await import('./combat-oracle.js');
                    await CombatOracle.narrateCombatEnd(this.combatState, winner);
                }
            } catch (e) {
                console.warn("[Combat] Falha ao recuperar modo da sessão no encerramento", e);
            }
        }
    },

    /**
     * Salva estado do combate no Firestore
     */
    async saveCombatState() {
        try {
            if (!this.sessionId || !this.combatState) return;

            const sessionRef = doc(db, "sessoes", this.sessionId);

            const isActive = this.combatState.phase !== 'ended';

            await updateDoc(sessionRef, {
                combatActive: isActive,
                combatState: this.combatState,
                updatedAt: serverTimestamp()
            });
        } catch (e) {
            console.error("❌ [Combat] Falha ao salvar estado de combate:", e);
        }
    },

    /**
     * Envia mensagem de combate
     */
    async sendCombatMessage(text, type = 'system') {
        await addDoc(collection(db, "sessoes", this.sessionId, "session_messages"), {
            type: type,
            sender: 'Sistema de Combate',
            senderNickname: 'Sistema de Combate',
            text: text,
            chapterIndex: Number(window.StageModule?.currentChapterIdx || 0),
            timestamp: serverTimestamp()
        });
    },

    /**
     * Modal de criação de monstros
     */
    async offerMonsterCreation() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-stage';
            modal.innerHTML = `
                <div class="modal-stage-content parchment-mini">
                    <h2 class="medieval-title">⚔️ Invocar Adversários</h2>
                    <p class="mystic-msg">Nenhum monstro foi vinculado a esta sessão. Deseja que o Oráculo crie adversários apropriados para este combate?</p>
                    <div class="modal-actions-centered">
                        <button class="medieval-btn gold-btn" id="create-monsters-yes">
                            <i class="fas fa-wand-magic-sparkles"></i> Sim, invocar
                        </button>
                        <button class="medieval-btn secondary" id="create-monsters-no">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('create-monsters-yes').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(true);
            });

            document.getElementById('create-monsters-no').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
        });
    },

    /**
     * Cria monstros usando o Oráculo
     */
    async createMonstersWithOracle(players) {
        console.log("🔮 Solicitando criação de monstros ao Oráculo...");

        const { default: CombatOracle } = await import('./combat-oracle.js');
        const monsters = await CombatOracle.createContextualMonsters(
            this.sessionData,
            players.length,
            this.calculateAverageLevel(players)
        );

        const sessionRef = doc(db, "sessoes", this.sessionId);
        await updateDoc(sessionRef, {
            linked_monsters: monsters,
            ai_generated_monsters: monsters
        });

        await this.sendCombatMessage(
            `🔮 O Oráculo invocou ${monsters.length} adversário(s) das sombras!`,
            'system'
        );

        return monsters;
    },

    /**
     * Calcula nível médio dos jogadores
     */
    calculateAverageLevel(players) {
        const levels = players.map(p => p.characterData?.bio?.level || 1);
        return Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
    }
};

// ── Mix in damage sub-module methods ──
Object.assign(CombatEngine, createDamageMixin(CombatEngine));

window.CombatEngine = CombatEngine;
export default CombatEngine;
