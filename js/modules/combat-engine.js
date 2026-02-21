/**
 * Combat Engine - Motor de Turnos Inteligente
 * Sistema revolucionário de combate com integração total de IA e fichas
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
                // Verificar se já existe (com ou sem sufixo _n)
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
                    // Buscar DADOS COMPLETOS da ficha
                    const char = await getCharacter(invite.characterId);

                    if (char) {
                        // Tentar resolver Player ID (UID real)
                        let resolvedPlayerId = invite.uid || inviteDoc.id;

                        // Fallback: Se não tem UID mas tem email, tentar buscar perfil
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

                        // Mapeamento robusto de HP e AC (Igual ao Presence/CombatUI)
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
                            // DADOS COMPLETOS DA FICHA
                            characterData: {
                                bio: char.bio || {},
                                stats: char.stats || {},
                                combat: char.combat || { attacks: [] },
                                spells: char.spells || { list: [], slots: {} },
                                inventory: char.inventory || { items: [] },
                                background: char.background || {}
                            },
                            actions: char.combat?.attacks || [] // 🛡️ [Mapping] Map attacks to actions for UI consistency
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

        // Jogadores: DEX modifier + d20
        for (const player of players) {
            const dexMod = Math.floor((player.dexterity - 10) / 2);
            const roll = Math.floor(Math.random() * 20) + 1;
            all.push({
                ...player,
                initiative: dexMod + roll,
                initiativeRoll: roll,
                dexMod: dexMod
            });
        }

        // Monstros: mesma lógica
        for (const monster of monsters) {
            // Suportar múltiplas estruturas de monstros
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
                monsterData: monster
            });
        }

        // Ordenar por iniciativa (maior primeiro)
        all.sort((a, b) => {
            if (b.initiative !== a.initiative) {
                return b.initiative - a.initiative;
            }
            // Desempate: maior DEX vence
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

        // Validar completude da ação
        const isComplete = this.isActionComplete(actionData);

        // Verificar se é o turno do jogador
        const activeParticipant = this.combatState.turnOrder[this.combatState.activeTurnIndex];
        if (activeParticipant.playerId !== playerId) {
            console.warn("⚠️ Não é o seu turno!");
            return { error: "Não é o seu turno" };
        }

        // Registrar ação
        this.combatState.playerActions[playerId] = {
            hasActed: true,
            isComplete: isComplete,
            action: actionData,
            timestamp: new Date().toISOString()
        };

        // Salvar e avançar turno
        try {
            await this.saveCombatState();

            // APLICAÇÃO AUTOMÁTICA DE DANO (Se houver resultado de rolagem)
            console.log("🔍 [Debug] Verificando aplicação de dano:", {
                hasDamage: !!actionData.rollResults?.damage,
                damage: actionData.rollResults?.damage,
                target: actionData.target,
                actionData
            });

            if (actionData.rollResults?.damage && actionData.target) {
                console.log(`💥 [Debug] Aplicando ${actionData.rollResults.damage} de dano em ${actionData.target}`);

                // 🛡️ [Bugfix] Generate visual feedback for the player
                const activeParticipant = this.combatState.turnOrder[this.combatState.activeTurnIndex];
                const targetParticipant = this.combatState.turnOrder.find(p => p.id === actionData.target);

                // Robust property access for action name and results
                const actionName = actionData.name || actionData.details?.name || actionData.details?.label || 'Ação';
                const hitRoll = actionData.rollResults?.hit || actionData.rollResults?.attack || actionData.rollResults?.total || '?';
                const damage = actionData.rollResults?.damage || 0;

                const actionSummary = `rolou **${escapeHTML(String(hitRoll))}** para **${escapeHTML(actionName)}** contra **${escapeHTML(targetParticipant?.name || 'seu alvo')}**! (Dano: ${escapeHTML(String(damage))})`;
                this.sendCombatMessage(`${escapeHTML(activeParticipant.name)} ${actionSummary}`);

                await this.applyDamage(actionData.target, damage);

                // Re-verificar se o alvo morreu após o dano para atualizar CombatState localmente
                const target = this.combatState.turnOrder.find(p => p.id === actionData.target);
                if (target && target.hp <= 0) {
                    logger.info(`💀 [Combat] Alvo ${target.name} foi derrotado!`);
                    await this.sendCombatMessage(`<i class="fas fa-skull"></i> **${escapeHTML(target.name)}** foi derrotado!`, 'system');
                }
            } else {
                // Defensive Actions / Utilities
                const activeParticipant = this.combatState.turnOrder[this.combatState.activeTurnIndex];
                const actionType = actionData.type || 'unknown';
                const d20Roll = actionData.rollResults?.d20 || 0;
                const totalRoll = actionData.rollResults?.total || 0;

                if (['defend', 'dodge', 'flee'].includes(actionType)) {
                    // Specific logic for defensive actions
                    let outcomeMsg = "";
                    if (actionType === 'dodge') {
                        // Dodge: if total roll is >= 12, recover some HP
                        if (totalRoll >= 12) {
                            // Lógica do Dado de Vida
                            const stats = activeParticipant.characterData?.stats || {};
                            const bio = activeParticipant.characterData?.bio || {};
                            const hdStr = stats.hit_dice_total || bio.hitDie || "1d4"; // Fallback para 1d4

                            // Extrair o tamanho do dado (ex: "1d8" -> 8)
                            const match = hdStr.toString().match(/d(\d+)/i);
                            const dieSize = match ? parseInt(match[1]) : 4;

                            const healAmount = Math.floor(Math.random() * dieSize) + 1; // 1d(dieSize)

                            // Apply heal safely
                            const maxHp = activeParticipant.maxHp || 10;
                            const newHp = Math.min((activeParticipant.hp || 0) + healAmount, maxHp);
                            activeParticipant.hp = newHp;

                            // 🛡️ [Atomic Sync] Persist healing to Firestore (akin to applyDamage)
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
                    // Generic fallback for other actions without damage
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

        // 🛡️ [Bugfix] Check if combat should end before advancing
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
            // Limpar qualquer timeout de turno de monstro pendente
            if (this.monsterTurnTimeout) {
                clearTimeout(this.monsterTurnTimeout);
                this.monsterTurnTimeout = null;
            }

            let nextIndex = this.combatState.activeTurnIndex;
            let originalIndex = nextIndex;
            let found = false;
            let safetyCounter = 0;
            const total = this.combatState.turnOrder.length;

            // Loop para encontrar o próximo vivo, evitando recursão descontrolada
            while (!found && safetyCounter < total) {
                nextIndex = (nextIndex + 1) % total;

                // Início de nova rodada
                if (nextIndex === 0 && originalIndex !== 0) {
                    this.combatState.round++;
                    await this.sendCombatMessage(`\n🔄 **INÍCIO DA RODADA ${this.combatState.round}**`, 'system');

                    // Resetar ações
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

            console.log(`➡️ Avançando turno para: ${currentActor.name} (Index: ${nextIndex})`);

            await this.saveCombatState();

            // FLOW AUTOMÁTICO: O Mestre agora escolhe tudo manualmente via painel
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

            // Aplicar dano se houver
            if (result && result.damage && result.targetId) {
                await this.applyDamage(result.targetId, result.damage);
            }

            console.log(`✅ [Combat] Turno do monstro ${monster.name} processado. Aguardando finalização manual pelo Mestre.`);

            // O turno NÃO avança mais sozinho. O mestre deve clicar em "Finalizar Turno".
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
                // Precisa de alvo e arma (ou detalhes da UI)
                return !!(actionData.target && (actionData.weapon || actionData.unarmed || actionData.details));

            case 'spell':
                // Precisa de alvo e magia (ou detalhes da UI)
                return !!(actionData.target && (actionData.spell || actionData.details));

            case 'item':
                // Precisa de item (alvo é opcional)
                return !!actionData.item;

            case 'flee':
            case 'defend':
            case 'dodge':
                // Não precisa de detalhes adicionais
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
            // 1. Coletar todas as ações
            const actions = this.collectAllActions();

            // 2. Enviar para Combat Oracle para narrativa
            const { default: CombatOracle } = await import('./combat-oracle.js');
            const results = await CombatOracle.narrateRound(this.combatState, actions);

            // 3. Aplicar resultados (dano, HP, etc)
            await this.applyResults(results);

            // 4. Verificar condições de vitória
            const combatEnded = this.checkCombatEnd();

            if (combatEnded) {
                await this.endCombat(combatEnded.winner);
            } else {
                // 5. Preparar próxima rodada
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

        // Salvar histórico da rodada
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

        // Aliados + Jogadores
        const playersAlive = turnOrder.filter(p => (p.type === 'player' || p.type === 'ally' || p.type === 'npc') && p.hp > 0);
        // Monstros (Inimigos)
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

        // Resetar ações dos jogadores
        for (const playerId in this.combatState.playerActions) {
            this.combatState.playerActions[playerId] = {
                hasActed: false,
                isComplete: false,
                action: null,
                timestamp: null
            };
        }

        await this.saveCombatState();

        // await this.sendCombatMessage(
        //     `\n🔄 **RODADA ${this.combatState.round}**\n\nAguardando ações dos jogadores...`,
        //     'system'
        // );

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

        // Atualizar sessão
        const sessionRef = doc(db, "sessoes", this.sessionId);
        await updateDoc(sessionRef, {
            combatActive: false,
            linked_monsters: [] // 🧹 Limpa monstros para evitar que retornem no próximo combate
        });

        const message = winner === 'players'
            ? '🏆 **VITÓRIA!** Os heróis triunfaram sobre seus adversários!'
            : '💀 **DERROTA...** Fim da jornada. O mestre decide o que vai fazer agora.';

        await this.sendCombatMessage(message, 'system');

        // Notificar Combat Oracle para narrativa de encerramento
        if (this.sessionData && this.sessionData.mode === 'oracle') {
            const { default: CombatOracle } = await import('./combat-oracle.js');
            await CombatOracle.narrateCombatEnd(this.combatState, winner);
        } else if (!this.sessionData && this.sessionId) {
            // Fallback: Tentar recuperar dados da sessão se estiverem nulos
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

            // 🛡️ [Bugfix] Don't force combatActive: true if combat is ended
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
     * Aplica dano a um participante e sincroniza, se necessário
     */
    async applyDamage(targetId, damage) {
        if (!damage || damage <= 0) return;

        let target = this.combatState.turnOrder.find(p => p.id === targetId);

        if (!target) {
            console.log(`🔍 [Combat] Buscando alvo por substring de nome: ${targetId}`);
            target = this.combatState.turnOrder.find(p =>
                p.name.toLowerCase().includes(targetId.toLowerCase()) ||
                targetId.toLowerCase().includes(p.name.toLowerCase())
            );
        }

        if (!target) {
            console.warn(`⚠️ [Combat] Alvo ${targetId} não encontrado para aplicação de dano.`);
            return;
        }

        console.log(`💥 [Combat] Aplicando ${damage} de dano em ${target.name}`);

        // 🛡️ [Robustness] Fetch fresh HP from sheet if it's a character to avoid stale data
        let currentHp = target.hp;
        if (target.type === 'player' && target.characterId) {
            try {
                // Manual fetch to ensure we have the absolute latest value before subtraction
                const charRef = doc(db, "fichas", target.characterId);
                const charSnap = await getDoc(charRef);
                if (charSnap.exists()) {
                    const data = charSnap.data();
                    const getVal = (paths) => {
                        for (const path of paths) {
                            const val = path.split('.').reduce((obj, key) => obj?.[key], data);
                            if (val !== undefined && val !== null) return val;
                        }
                        return null;
                    };
                    const freshHp = getVal(['stats.hp_current', 'attributes.HP.current', 'combat.hp.current', 'stats.hp', 'hp', 'attributes.Vida.atual', 'vida_atual']);
                    if (freshHp !== null) {
                        console.log(`✅ [Combat] HP de ${target.name} atualizado da ficha: ${target.hp} -> ${freshHp}`);
                        currentHp = freshHp;
                    }
                }
            } catch (err) {
                console.warn(`[Combat] Erro ao buscar HP atualizado para ${target.name}`, err);
            }
        } else if (target.type === 'monster' || target.type === 'npc') {
            // 🛡️ [Robustness] Fetch fresh HP from session for monsters/NPCs
            try {
                const sessionRef = doc(db, "sessoes", this.sessionId);
                const snap = await getDoc(sessionRef);
                if (snap.exists()) {
                    const data = snap.data();
                    const baseId = target.id.includes('_') ? target.id.substring(0, target.id.lastIndexOf('_')) : target.id;

                    // Check all lists for the most recent HP
                    let freshHp = null;
                    const findHp = (list) => list?.find(it => it.id === target.id || it.id === baseId)?.hp;

                    freshHp = findHp(data.linked_monsters) ?? findHp(data.allies) ?? findHp(data.sessionNPCs);

                    if (freshHp !== null && freshHp !== undefined) {
                        console.log(`✅ [Combat] HP de monstro ${target.name} atualizado da sessão: ${target.hp} -> ${freshHp}`);
                        currentHp = freshHp;
                    }
                }
            } catch (err) {
                console.warn(`[Combat] Erro ao buscar HP atualizado para monstro ${target.name}`, err);
            }
        }

        const damageAmount = Number(damage) || 0;
        const initialHp = Number(currentHp) || 0;
        target.hp = Math.max(0, initialHp - damageAmount);

        console.log(`⚖️ [Combat] Cálculo de dano: ${initialHp} - ${damageAmount} = ${target.hp}`);

        // 🛡️ [Atomic Sync] Consolidate all session updates into one write
        const updates = {
            combatState: this.combatState,
            updatedAt: serverTimestamp()
        };

        // If it's a character, sync with the character sheet (separate write, as it's a different collection)
        if (target.type === 'player' && target.characterId) {
            await this.syncCharacterHP(target.characterId, target.hp);
        } else if (target.type === 'monster' || target.type === 'npc') {
            // Se for monstro ou NPC, ler a sessão novamente para garantir que não perdemos atualizações de outros campos
            try {
                const sessionRef = doc(db, "sessoes", this.sessionId);
                const snap = await getDoc(sessionRef);
                if (snap.exists()) {
                    const sessionUpdates = this.getNPCSyncUpdates(snap.data(), target.id, target.hp);
                    Object.assign(updates, sessionUpdates);
                }
            } catch (err) {
                console.warn("[Combat] Erro ao consolidar atualizações de monstro", err);
            }
        }

        const sessionRef = doc(db, "sessoes", this.sessionId);
        try {
            await updateDoc(sessionRef, updates);
            console.log(`💾 [Combat] Estado e HP de ${target.name} sincronizados atomicamente.`);
        } catch (e) {
            console.warn(`⚠️ [Combat] Falha ao sincronizar HP de ${target.name} na sessão (Provável falta de permissão):`, e);
            // Non-blocking: Player acts locally, GM's client will likely commit the state on turn change
        }

        // Verificar fim do combate se alguém morreu
        if (target.hp <= 0) {
            console.log(`💀 [Combat] ${target.name} chegou a 0 HP. Verificando fim do combate...`);
            const endResult = this.checkCombatEnd();
            if (endResult) {
                await this.endCombat(endResult.winner);
            }
        }
    },

    /**
     * Calcula os campos de atualização para sincronizar HP de um NPC/Monstro
     * @returns {Object} Updates object for updateDoc
     */
    getNPCSyncUpdates(sessionData, entityId, newHP) {
        const updates = {};
        const baseId = entityId.includes('_') ? entityId.substring(0, entityId.lastIndexOf('_')) : entityId;

        // 1. linked_monsters
        if (sessionData.linked_monsters) {
            const list = [...sessionData.linked_monsters];
            const idx = list.findIndex(m => m.id === entityId);
            if (idx !== -1) {
                list[idx].hp = newHP;
                updates.linked_monsters = list;
            }
        }

        // 2. allies
        if (sessionData.allies) {
            const list = [...sessionData.allies];
            const idx = list.findIndex(a => a.id === entityId || a.id === baseId);
            if (idx !== -1) {
                list[idx].hp = newHP;
                updates.allies = list;
            }
        }

        // 3. sessionNPCs
        if (sessionData.sessionNPCs) {
            const list = [...sessionData.sessionNPCs];
            const idx = list.findIndex(n => n.id === entityId || n.id === baseId);
            if (idx !== -1) {
                list[idx].hp = newHP;
                updates.sessionNPCs = list;
            }
        }

        return updates;
    },

    /**
     * Sincroniza HP de um NPC/Monstro com a sessão no Firestore
     */
    /**
     * Sincroniza HP com a ficha no Firestore
     */
    async syncCharacterHP(characterId, newHP) {
        try {
            const { db } = await import('../auth.js');
            const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");

            const charRef = doc(db, "fichas", characterId);

            // Atualização ROBUSTA em todos os caminhos possíveis
            await updateDoc(charRef, {
                "combat.hp.current": newHP,
                "stats.hp": newHP,
                "stats.hp_current": newHP,
                "attributes.HP.current": newHP,
                "attributes.Vida.atual": newHP,
                updatedAt: serverTimestamp()
            });

            console.log(`💾 [Combat] Ficha ${characterId} sincronizada com HP: ${newHP}`);
        } catch (e) {
            console.error("❌ [Combat] Erro ao sincronizar HP com a ficha:", e);
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

        // Salvar monstros na sessão
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
    },

    /**
     * Executa ataque manual de um monstro (Direcionado pelo Mestre)
     */
    async executeManualMonsterAttack(monsterId, targetId, attackName = "Ataque", rolls = null) {
        console.log(`⚔️ CombatEngine: Ataque manual solicitado. Monstro: ${monsterId} -> Alvo: ${targetId} com ${attackName}`);

        const monster = this.combatState.turnOrder.find(p => p.id === monsterId);
        const target = this.combatState.turnOrder.find(p => p.id === targetId);

        if (!monster || !target) return;

        try {
            let result;

            // 🛡️ [Performance] Remove slow AI narration for monster attacks as requested
            // determine hit based on rolls or decision
            const ac = target.ac || 10;
            const hit = rolls && rolls.hit !== undefined ? (rolls.hit >= ac || rolls.hit === 20) : (Math.random() > 0.5);
            const damageValue = rolls && rolls.damage !== undefined ? rolls.damage : (hit ? 5 : 0);

            result = {
                hit: hit,
                damage: damageValue,
                narrative: null // No AI narrative to speed up combat
            };

            if (result.hit && result.damage) {
                await this.applyDamage(targetId, result.damage);
            }

            // REMOVED Redundant summary to avoid duplicate chat messages
            // Finalized result is sent as structured system message below

            // Adicionar mensagem estruturada de sistema para o chat (Acerto/Dano)
            let systemMsg = `⚔️ **${escapeHTML(monster.name)}** ataca **${escapeHTML(target.name)}** com **${escapeHTML(attackName)}**!\n`;
            systemMsg += `Acerto: **${result.hit ? 'ACERTOU' : 'ERROU'}**\n`;
            if (result.hit && result.damage > 0) {
                systemMsg += `Dano: **${escapeHTML(String(result.damage))}**`;
            }

            await addDoc(collection(db, "sessoes", this.sessionId, "session_messages"), {
                text: systemMsg,
                senderId: "system",
                senderNickname: "Sistema de Combate",
                role: "system",
                type: "system",
                chapterIndex: Number(window.StageModule?.currentChapterIdx || 0),
                timestamp: serverTimestamp()
            });

            await this.saveCombatState();

            // Avançar turno após o ataque
            setTimeout(async () => {
                await this.nextTurn();
            }, 3000);

        } catch (e) {
            console.error("Erro no ataque manual:", e);
        }
    },

    // Helper para o prompt legado
    getManualAttackPrompt(monster, target, attackName) {
        return `Você é o Mestre Arcano. É o turno de **${monster.name}**.
Ele ataca **${target.name}** utilizando **${attackName}**.

DADOS DO MONSTRO:
HP: ${monster.hp} | CA: ${monster.ac}
Ações: ${monster.monsterData?.actions || ""}

DADOS DO ALVO:
Nombre: ${target.name} | CA: ${target.ac}

**TAREFA:**
1. Narre o ataque de forma épica em PRIMEIRA PESSOA.
2. Determine se acertou (baseado na CA ${target.ac}) e o dano (baseado no texto da ação).
3. Se o texto da ação não for claro sobre bônus de acerto, use +4. Se não for claro sobre dano, use 2d6+2.

**FORMATO (JSON):**
{
  "narrative": "...",
  "hit": true/false,
  "damage": número
}
APENAS JSON.`;
    }
};

window.CombatEngine = CombatEngine;
export default CombatEngine;
