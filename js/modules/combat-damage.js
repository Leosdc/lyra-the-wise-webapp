/**
 * Combat Damage Sub-Module
 * Handles damage application, HP syncing, and manual monster attacks.
 */

import { db } from "../auth.js";
import {
    doc, getDoc, updateDoc, collection, addDoc, serverTimestamp
} from "firebase/firestore";
import { escapeHTML } from "./utils.js";

/**
 * Returns damage-related methods to be mixed into CombatEngine.
 */
export function createDamageMixin(ctx) {
    return {
        /**
         * Aplica dano a um participante e sincroniza, se necessário
         */
        async applyDamage(targetId, damage) {
            if (!damage || damage <= 0) return;

            let target = ctx.combatState.turnOrder.find(p => p.id === targetId);

            if (!target) {
                console.log(`🔍 [Combat] Buscando alvo por substring de nome: ${targetId}`);
                target = ctx.combatState.turnOrder.find(p =>
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
                    const sessionRef = doc(db, "sessoes", ctx.sessionId);
                    const snap = await getDoc(sessionRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        const baseId = target.id.includes('_') ? target.id.substring(0, target.id.lastIndexOf('_')) : target.id;

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
                combatState: ctx.combatState,
                updatedAt: serverTimestamp()
            };

            if (target.type === 'player' && target.characterId) {
                await ctx.syncCharacterHP(target.characterId, target.hp);
            } else if (target.type === 'monster' || target.type === 'npc') {
                try {
                    const sessionRef = doc(db, "sessoes", ctx.sessionId);
                    const snap = await getDoc(sessionRef);
                    if (snap.exists()) {
                        const sessionUpdates = ctx.getNPCSyncUpdates(snap.data(), target.id, target.hp);
                        Object.assign(updates, sessionUpdates);
                    }
                } catch (err) {
                    console.warn("[Combat] Erro ao consolidar atualizações de monstro", err);
                }
            }

            const sessionRef = doc(db, "sessoes", ctx.sessionId);
            try {
                await updateDoc(sessionRef, updates);
                console.log(`💾 [Combat] Estado e HP de ${target.name} sincronizados atomicamente.`);
            } catch (e) {
                console.warn(`⚠️ [Combat] Falha ao sincronizar HP de ${target.name} na sessão (Provável falta de permissão):`, e);
            }

            // Verificar fim do combate se alguém morreu
            if (target.hp <= 0) {
                console.log(`💀 [Combat] ${target.name} chegou a 0 HP. Verificando fim do combate...`);
                const endResult = ctx.checkCombatEnd();
                if (endResult) {
                    await ctx.endCombat(endResult.winner);
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
         * Executa ataque manual de um monstro (Direcionado pelo Mestre)
         */
        async executeManualMonsterAttack(monsterId, targetId, attackName = "Ataque", rolls = null) {
            console.log(`⚔️ CombatEngine: Ataque manual solicitado. Monstro: ${monsterId} -> Alvo: ${targetId} com ${attackName}`);

            const monster = ctx.combatState.turnOrder.find(p => p.id === monsterId);
            const target = ctx.combatState.turnOrder.find(p => p.id === targetId);

            if (!monster || !target) return;

            try {
                let result;

                // Check target for defensive status effects
                const targetEffects = target.statusEffects || [];
                const hasDodge = targetEffects.some(e => e.type === 'dodge');
                const hasDefend = targetEffects.some(e => e.type === 'defend');

                const ac = target.ac || 10; // AC already includes defend bonus if active
                let hit;
                let hitNote = '';

                if (rolls && rolls.hit !== undefined) {
                    // GM rolled manually — but if target is dodging, we impose disadvantage on the ATTACKER
                    if (hasDodge && !rolls.isAlreadyDisadvantaged) {
                        // Roll a second d20 and take the lower
                        const secondRoll = Math.floor(Math.random() * 20) + 1;
                        const originalRoll = rolls.hit;
                        const disadvantagedRoll = Math.min(originalRoll, secondRoll);
                        hit = (disadvantagedRoll >= ac || disadvantagedRoll === 20);
                        if (disadvantagedRoll === 1) hit = false;
                        hitNote = ` *(Alvo esquivando: ${originalRoll} e ${secondRoll} → ${disadvantagedRoll})*`;
                    } else {
                        hit = (rolls.hit >= ac || rolls.hit === 20);
                        if (rolls.hit === 1) hit = false;
                    }
                } else {
                    hit = Math.random() > 0.5;
                }

                if (hasDefend && !hit) {
                    hitNote += ' *(Alvo defendendo: CA +2)*';
                }

                const damageValue = rolls && rolls.damage !== undefined ? rolls.damage : (hit ? 5 : 0);

                result = {
                    hit: hit,
                    damage: damageValue,
                    narrative: null
                };

                if (result.hit && result.damage) {
                    await ctx.applyDamage(targetId, result.damage);
                }

                let systemMsg = `<i class="fas fa-swords" style="color: var(--gold); margin-right: 6px;"></i> **${escapeHTML(monster.name)}** ataca **${escapeHTML(target.name)}** com **${escapeHTML(attackName)}**!\n`;
                systemMsg += `Acerto: **${result.hit ? '<i class="fas fa-check-circle" style="color: #4caf50; margin-right: 4px;"></i> ACERTOU' : '<i class="fas fa-times-circle" style="color: #f44336; margin-right: 4px;"></i> ERROU'}**${hitNote}\n`;
                if (result.hit && result.damage > 0) {
                    systemMsg += `Dano: **${escapeHTML(String(result.damage))}**`;
                }

                await addDoc(collection(db, "sessoes", ctx.sessionId, "session_messages"), {
                    text: systemMsg,
                    senderId: "system",
                    senderNickname: "Sistema de Combate",
                    role: "system",
                    type: "system",
                    chapterIndex: Number(window.StageModule?.currentChapterIdx || 0),
                    timestamp: serverTimestamp()
                });

                await ctx.saveCombatState();

                setTimeout(async () => {
                    // Guard: don't advance turn if combat already ended (target death triggered endCombat)
                    if (ctx.combatState?.phase === 'ended') {
                        console.log('🏁 [Combat] Combate já encerrado, ignorando avanço de turno.');
                        return;
                    }
                    await ctx.nextTurn();
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
}
