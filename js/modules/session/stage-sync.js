/**
 * Stage Sync Sub-Module
 * Handles real-time Firestore sync, presence, and allied character data listeners.
 */

import { logger } from "../../logger.js";
import { escapeHTML } from "../utils.js";
import { db } from "../../auth.js";
import {
    doc, onSnapshot, collection, query, where, orderBy, limit
} from "firebase/firestore";
import CombatEngine from "../combat-engine.js";
import CombatUI from "../combat-ui.js";

const COLLECTIONS = {
    SESSIONS: "sessoes",
    MESSAGES: "session_messages"
};

/**
 * Returns sync-related methods to be mixed into StageModule.
 */
export function createSyncMixin(ctx) {
    return {
        setupRealtimeSync() {
            if (!ctx.sessionId) return;

            // Sync Session Data
            const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.sessionId);
            onSnapshot(sessionRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    ctx.activeSession = { id: snapshot.id, ...data };
                    ctx.isGM = ctx.user.uid === data.userId;
                    ctx.renderSessionUI();

                    // Fix Race Condition: Render cached messages once session data is ready
                    if (ctx.lastMessages && ctx.lastMessages.length > 0) {
                        ctx.renderMessages(ctx.lastMessages);
                    }

                    // Combat Sync
                    if (data.combatActive && data.combatState) {
                        if (CombatEngine) {
                            CombatEngine.sessionId = snapshot.id;
                            CombatEngine.combatState = data.combatState;
                        }
                        CombatUI.renderCombatPanel(data.combatState);
                    } else if (data.combatActive) {
                        document.getElementById('narrative-actions-container')?.classList.add('hidden');
                        document.getElementById('combat-actions-container')?.classList.remove('hidden');
                        document.getElementById('actions-sidebar')?.classList.remove('hidden');
                    } else {
                        CombatUI.hideCombatPanel();
                        document.getElementById('actions-sidebar')?.classList.remove('hidden');
                    }

                    // Session Concluded Sync (for Players)
                    if (data.sessionStatus === 'active') {
                        ctx.conclusionShown = false;
                    }

                    if (!ctx.isGM && data.sessionStatus === 'concluded' && !ctx.conclusionShown) {
                        ctx.conclusionShown = true;
                        ctx.showMysticAlert("📜 **O Mestre concluiu este capítulo.** A sessão encontra-se em repouso. Aguarde o mestre iniciar o próximo no Atrium e não esqueça de escolher sua ficha.", "Jornada em Repouso");
                    }

                    // Real-time Chapter Transition Sync
                    if (!ctx.isGM && data.activeChapterIndex !== undefined &&
                        Number(data.activeChapterIndex) !== Number(ctx.currentChapterIdx) &&
                        !ctx.transitionPromptShown) {

                        ctx.transitionPromptShown = true;
                        const nextChapterNum = Number(data.activeChapterIndex) + 1;
                        const chapterTitle = data.fullTimeline && data.fullTimeline[data.activeChapterIndex] ?
                            `: ${data.fullTimeline[data.activeChapterIndex].title}` : "";

                        ctx.showMysticConfirm(
                            `O Mestre avançou para o **Capítulo ${nextChapterNum}${chapterTitle}**. Deseja acompanhar a transição agora?`,
                            "Nova Jornada Disponível"
                        ).then(confirmed => {
                            if (confirmed) {
                                localStorage.setItem('lyra_active_chapter', data.activeChapterIndex);
                                window.location.href = `session-stage.html?id=${ctx.sessionId}&chapter=${data.activeChapterIndex}`;
                            } else {
                                setTimeout(() => { ctx.transitionPromptShown = false; }, 30000);
                            }
                        });
                    }

                    // Render Allied Block (NPCs from session)
                    ctx.renderAlliedCharacters();
                } else {
                    logger.warn("[StageModule] Snapshot vazio ou permissão negada...");
                    if (ctx.activeSession) {
                        ctx.showMysticAlert("A conexão com a sessão foi perdida.", "Vínculo Quebrado").then(() => {
                            window.close();
                        });
                    }
                }
            }, (error) => {
                logger.error("Erro no listener da sessão:", error);
            });

            // Sync Chat Messages
            const params = new URLSearchParams(window.location.search);

            const startChatListener = (actualIdx) => {
                if (ctx.chatUnsubscribe) {
                    ctx.chatUnsubscribe();
                    ctx.chatUnsubscribe = null;
                }

                ctx.currentChapterIdx = Number(actualIdx || 0);
                logger.info(`[Stage] Iniciando Listener do Chat para o Capítulo: ${ctx.currentChapterIdx}`);

                const chatRef = collection(db, COLLECTIONS.SESSIONS, ctx.sessionId, COLLECTIONS.MESSAGES);
                const q = query(
                    chatRef,
                    orderBy("timestamp", "asc"),
                    limit(500)
                );

                ctx.chatUnsubscribe = onSnapshot(q, (snapshot) => {
                    const allMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    const targetIdx = Number(ctx.currentChapterIdx);
                    const filteredMessages = allMessages.filter(msg => {
                        const msgIdx = (msg.chapterIndex !== undefined && msg.chapterIndex !== null)
                            ? Number(msg.chapterIndex)
                            : 0;
                        return msgIdx === targetIdx;
                    });

                    ctx.lastMessages = filteredMessages;
                    ctx.renderMessages(filteredMessages);
                }, (error) => {
                    logger.error("Erro no listener do chat:", error);
                });
            };

            // Always start with the current index
            startChatListener(ctx.currentChapterIdx);

            // Delegate clicks for inline tags
            document.getElementById('narrative-text')?.addEventListener('click', (e) => {
                const itemTag = e.target.closest('.inline-item');
                if (itemTag) {
                    ctx.handleInlineItemClick(itemTag.dataset);
                    return;
                }

                const npcTag = e.target.closest('.inline-npc');
                if (npcTag) {
                    ctx.handleInlineNPCClick(npcTag.dataset);
                    return;
                }

                const monsterTag = e.target.closest('.inline-monster');
                if (monsterTag) {
                    ctx.handleInlineMonsterClick(monsterTag.dataset);
                    return;
                }
            });
        },

        setupPresenceSync() {
            const q = query(
                collection(db, "session_invites"),
                where("sessionId", "==", ctx.sessionId),
                where("status", "in", ["online", "away", "offline", "accepted"])
            );

            onSnapshot(q, (snapshot) => {
                const participants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                logger.debug(`[Presence] Sincronizando: ${participants.length} total, Status: online`);

                const playersOnline = participants.filter(p => {
                    if (p.role === 'gm') return false;
                    if (p.id && (p.id.startsWith('self_') || p.id.startsWith('gm_'))) return false;
                    if (ctx.activeSession && (p.userId === ctx.activeSession.userId || p.uid === ctx.activeSession.userId)) return false;
                    return true;
                });
                const count = playersOnline.length;

                logger.debug(`[Presence] Aventureiros online: ${count}`);

                ctx.participantsNames = playersOnline
                    .map(p => p.characterName)
                    .filter(name => !!name);

                const countEl = document.getElementById('player-count');
                if (countEl) {
                    countEl.innerHTML = `<i class="fas fa-users"></i> ${count} Aventureiros`;
                }

                ctx.currentParticipants = participants;
                ctx.renderAlliedCharacters();
                ctx.setupAlliedDataListeners(participants);
            });
        },

        setupAlliedDataListeners(players) {
            if (!ctx.alliedListeners) ctx.alliedListeners = new Map();
            if (!ctx.alliedDataCache) ctx.alliedDataCache = new Map();

            const activeIds = new Set(players.map(p => p.characterId).filter(id => id));

            // Cleanup old
            for (const [id, unsub] of ctx.alliedListeners) {
                if (!activeIds.has(id)) {
                    unsub();
                    ctx.alliedListeners.delete(id);
                    ctx.alliedDataCache.delete(id);
                }
            }

            // Add new
            players.forEach(p => {
                if (p.characterId && !ctx.alliedListeners.has(p.characterId)) {
                    const unsub = onSnapshot(doc(db, "fichas", p.characterId), (snap) => {
                        if (snap.exists()) {
                            const data = snap.data();

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

                            ctx.alliedDataCache.set(p.characterId, {
                                hp: hpCurrent ?? "?",
                                maxHp: hpMax ?? "?",
                                ac: acVal ?? "?",
                                initiativeBonus: getVal(['attributes.INI.bonus', 'combat.initiativeBonus', 'stats.initiativeBonus']) ?? 0
                            });
                            ctx.renderAlliedCharacters();
                        }
                    });
                    ctx.alliedListeners.set(p.characterId, unsub);
                }
            });
        },

        async renderAlliedCharacters() {
            const container = document.getElementById('allied-list');
            if (!container) return;

            const players = (ctx.currentParticipants || []).filter(p => p.role !== 'gm' && p.characterId);
            const npcAllies = ctx.activeSession?.allies || [];
            const sessionNPCs = ctx.activeSession?.sessionNPCs || [];

            const allNPCs = [...npcAllies, ...sessionNPCs];

            if (players.length === 0 && allNPCs.length === 0) {
                container.innerHTML = `<p class="empty-msg-sml">Nenhum aliado no palco...</p>`;
                return;
            }

            let html = "";

            const getHpStatus = (current, max) => {
                if (current === "?" || max === "?") return { pct: 100, color: '#d4af37' };
                const pct = Math.min(100, Math.max(0, (current / max) * 100));
                let color = '#4caf50';
                if (pct <= 25) color = '#f44336';
                else if (pct <= 50) color = '#ff9800';
                return { pct, color };
            };

            // Render Players
            for (const p of players) {
                const charId = p.characterId;
                const data = ctx.alliedDataCache?.get(charId);

                const hp = data?.hp ?? "?";
                const maxHp = data?.maxHp ?? "?";
                const ac = data?.ac ?? "?";
                const { pct, color } = getHpStatus(hp, maxHp);

                html += `
                    <div class="ally-card-premium player-ally">
                        <div class="ally-header-sml">
                            <span class="ally-name-sml"><i class="fas fa-user-shield"></i> ${escapeHTML(p.characterName)}</span>
                            <span class="ally-ac-mini"><i class="fas fa-shield-alt"></i> ${ac}</span>
                        </div>
                        <div class="ally-hp-bar-container">
                            <div class="ally-hp-bar-fill" style="width: ${pct}%; background: ${color};"></div>
                            <span class="ally-hp-text">${hp}/${maxHp} HP</span>
                        </div>
                    </div>
                `;
            }

            // Render All NPCs
            for (const npc of allNPCs) {
                const hp = npc.hp ?? 0;
                const maxHp = npc.maxHp || npc.hp || 1;
                const { pct, color } = getHpStatus(hp, maxHp);

                html += `
                    <div class="ally-card-premium npc-ally" data-npc-id="${npc.instanceId || ''}" data-npc-name="${escapeHTML(npc.name)}">
                        <div class="ally-header-sml">
                            <span class="ally-name-sml"><i class="fas fa-user-ninja"></i> ${escapeHTML(npc.name)}</span>
                            <div class="ally-meta-mini">
                                <span class="ally-ac-mini"><i class="fas fa-shield-halved"></i> ${npc.ac || 10}</span>
                                ${ctx.isGM ? `<i class="fas fa-trash-alt delete-npc-btn" title="Remover NPC" onclick="window.StageModule.deleteNPC(this.closest('.npc-ally').dataset.npcId)"></i>` : ''}
                            </div>
                        </div>
                        <div class="ally-hp-bar-container">
                            <div class="ally-hp-bar-fill" style="width: ${pct}%; background: ${color};"></div>
                            <span class="ally-hp-text">${hp}/${maxHp} HP</span>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="allied-list-wrapper">
                    <div class="allied-scroll-arrow up hidden" onclick="document.getElementById('allied-list-content').scrollBy({top: -50, behavior: 'smooth'})">
                        <i class="fas fa-chevron-up"></i>
                    </div>
                    <div class="allied-list-content" id="allied-list-content">
                        ${html}
                    </div>
                    <div class="allied-scroll-arrow down hidden" onclick="document.getElementById('allied-list-content').scrollBy({top: 50, behavior: 'smooth'})">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
            `;

            // Setup scroll arrow visibility logic
            const contentEl = document.getElementById('allied-list-content');
            const arrowUp = container.querySelector('.allied-scroll-arrow.up');
            const arrowDown = container.querySelector('.allied-scroll-arrow.down');

            if (contentEl && arrowUp && arrowDown) {
                const updateArrows = () => {
                    const isScrollable = contentEl.scrollHeight > contentEl.clientHeight;
                    arrowUp.classList.toggle('hidden', !isScrollable || contentEl.scrollTop <= 5);
                    arrowDown.classList.toggle('hidden', !isScrollable || contentEl.scrollTop + contentEl.clientHeight >= contentEl.scrollHeight - 5);
                };

                contentEl.addEventListener('scroll', updateArrows);
                setTimeout(updateArrows, 150);
                window.addEventListener('resize', updateArrows);
            }
        }
    };
}
