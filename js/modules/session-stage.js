/**
 * Atrium Arcano - Session Stage Module
 * Handles real-time gameplay, narrative oracle, and synchronized chat.
 */

import { logger } from "../logger.js";
import { escapeHTML, sanitizeHTML } from "./utils.js";
import { db } from "../auth.js";
import {
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    orderBy,
    limit,
    addDoc,
    where,
    getDocs,
    setDoc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { extendSessionStory, generateMonster } from "../ai.js";
import * as DataModule from "../data.js";
import CombatEngine from "./combat-engine.js";
import CombatUI from "./combat-ui.js";
import HeroActions from "./hero-actions.js";
import CombatPrep from "./combat-prep.js";
import RollRequestModule from "./roll-request.js";
import { AccessRequestsModule } from "./access-requests.js";
import { narrateCharacterEntry } from "../ai.js";
import ContentParser from "./content-parser.js";

const COLLECTIONS = {
    SESSIONS: "sessoes",
    MESSAGES: "session_messages"
};

const StageModule = {
    activeSession: null,
    sessionId: null,
    isGM: false,
    user: null,
    currentChapterIdx: 0,
    lastRollResult: undefined,
    chatUnsubscribe: null,
    lastMessages: [],

    async init() {
        logger.info("StageModule: Invocando Atrium Arcano...");

        // 0. Apply Theme from storage
        const theme = localStorage.getItem('lyra_current_theme') || 'lyra';
        document.body.classList.add(`${theme}-theme`);

        // 1. Get Session ID from URL or fallback to localStorage
        const params = new URLSearchParams(window.location.search);
        let idFromUrl = params.get('id') || params.get('sessionId');

        // Robust check for invalid URL params
        const isInvalidId = (id) => !id || id === 'undefined' || id === 'null' || id.trim() === '';

        if (!isInvalidId(idFromUrl)) {
            // URL ID is valid, sync it to localStorage
            localStorage.setItem('lyra_active_session', idFromUrl);
            this.sessionId = idFromUrl;
            logger.debug("StageModule: ID sincronizado do URL:", this.sessionId);
        } else {
            // Fallback to localStorage
            const fallbackId = localStorage.getItem('lyra_active_session');
            if (!isInvalidId(fallbackId)) {
                this.sessionId = fallbackId;
                logger.debug("StageModule: ID recuperado do Cofre Arcano (localStorage):", this.sessionId);
            }
        }

        // 🛡️ Robust Chapter Detection: Run independently of ID source
        const chapterVal = params.get('chapter') || params.get('session');
        if (chapterVal !== null) {
            this.currentChapterIdx = parseInt(chapterVal, 10) || 0;
            logger.info("StageModule: Capítulo sintonizado do URL:", this.currentChapterIdx);
        } else {
            // Fallback to localStorage persistence
            const savedChapter = localStorage.getItem('lyra_active_chapter');
            if (savedChapter !== null) {
                this.currentChapterIdx = parseInt(savedChapter, 10) || 0;
                logger.info("StageModule: Capítulo recuperado do Cofre Arcano:", this.currentChapterIdx);
            }
        }

        if (isInvalidId(this.sessionId)) {
            logger.error("StageModule: Frequência não identificada.", { url: window.location.href });
            this.showMysticAlert("A convocação falhou: Sessão não identificada. Retornando ao plano material...", "Erro de Conexão").then(() => {
                window.location.href = "index.html";
            });
            return;
        }

        // 2. Auth Sync
        onAuthStateChanged(getAuth(), async (user) => {
            try {
                if (user) {
                    this.user = user;
                    logger.info("StageModule: Alma sincronizada:", user.email);

                    // Show loader during initialization
                    this.toggleLoading(true, "Sincronizando com o Atrium Arcano...");

                    // CRITICAL: Wait for role check to complete BEFORE rendering UI
                    await this.checkParticipantStatus();

                    // CRITICAL FIX: Ensure activeSession is loaded before rendering
                    if (!this.activeSession) {
                        logger.warn("⚠️ activeSession não carregado após checkParticipantStatus, carregando agora...");
                        const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);
                        const sessionSnap = await getDoc(sessionRef);
                        if (sessionSnap.exists()) {
                            this.activeSession = { id: sessionSnap.id, ...sessionSnap.data() };
                            logger.info("✅ activeSession carregado:", this.activeSession.mode);
                        }
                    } else {
                        logger.debug("🔍 [DEBUG] activeSession JÁ existe. Dados completos:", this.activeSession);
                    }

                    // Only render UI after we know if user is GM or player AND session is loaded
                    this.renderSidebarActions();
                    this.renderSessionUI();
                    this.bindEvents();
                    this.setupRealtimeSync();
                    this.setupPresenceSync();
                    this.updatePresence("online");

                    // Scroll indicators
                    const chatContainer = document.getElementById('session-messages');
                    if (chatContainer) {
                        chatContainer.addEventListener('scroll', () => this.updateScrollIndicators());
                        this.updateScrollIndicators();
                    }

                    logger.info(`✅ Session Stage inicializado para sessão ${this.sessionId}`);

                    // Hide loader after everything is ready
                    setTimeout(() => this.toggleLoading(false), 500);
                } else {
                    logger.warn("StageModule: Nenhuma alma detectada. Redirecionando...");
                    window.location.href = "index.html";
                }
            } catch (err) {
                logger.error("StageModule: Falha crítica na inicialização:", err);
                this.toggleLoading(false);
                alert("Erro ao conectar com o Atrium Arcano: " + err.message);
            }
        });

        // Handle scroll for indicators
        const narrativeEl = document.getElementById('narrative-text');
        if (narrativeEl) {
            narrativeEl.addEventListener('scroll', () => this.updateScrollIndicators());
            window.addEventListener('resize', () => this.updateScrollIndicators());
            // Initial check
            setTimeout(() => this.updateScrollIndicators(), 1000);
        }

        // Handle tab closing
        window.addEventListener('beforeunload', () => {
            this.updatePresence("offline");
        });

        // Initialize Roll Request Module
        if (window.RollRequestModule) {
            window.RollRequestModule.init(this.sessionId, this.currentChapterIdx);
        }
    },

    requestRoll() {
        if (!this.isGM) return;
        if (window.RollRequestModule) {
            window.RollRequestModule.openRequestModal();
        }
    },

    updateScrollIndicators() {
        const up = document.getElementById('scroll-up');
        const down = document.getElementById('scroll-down');
        const container = document.getElementById('narrative-text');
        if (!up || !down || !container) return;

        const scrollPos = container.scrollTop;
        const windowHeight = container.clientHeight;
        const totalHeight = container.scrollHeight;

        const threshold = 20;
        const canScrollUp = scrollPos > threshold;
        const canScrollDown = scrollPos + windowHeight < totalHeight - threshold;
        const isTrulyScrollable = totalHeight > windowHeight + 5;

        up.classList.toggle('hidden', !canScrollUp || !isTrulyScrollable);
        down.classList.toggle('hidden', !canScrollDown || !isTrulyScrollable);
    },

    async updatePresence(status) {
        if (!this.participantId) return;
        try {
            const inviteRef = doc(db, "session_invites", this.participantId);
            await updateDoc(inviteRef, {
                status: status,
                lastSeen: serverTimestamp()
            });
        } catch (err) { logger.error("Erro Presence:", err); }
    },

    async checkParticipantStatus() {
        if (!this.sessionId) return;

        try {
            const q = query(
                collection(db, "session_invites"),
                where("email", "==", this.user.email.toLowerCase())
            );

            const snapshot = await getDocs(q);
            const playerInvite = snapshot.docs.find(d => d.data().sessionId === this.sessionId);

            if (!playerInvite) {
                // Check if user is the GM (using more robust getDoc)
                const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);
                const sessionSnap = await getDoc(sessionRef);

                if (sessionSnap.exists()) {
                    const sessionData = sessionSnap.data();
                    logger.debug(`[StageModule] Verificando GM: SessãoOwner=${sessionData.userId}, User=${this.user.uid}, Mode=${sessionData.mode}`);

                    // MUDANÇA ARQUITETURAL: Em modo oráculo, não há GM - todos são jogadores
                    const isOracleMode = sessionData.mode === 'oracle';
                    const isSessionOwner = String(sessionData.userId) === String(this.user.uid);

                    if (isSessionOwner) {
                        // GM MODE: Master of the Session
                        this.isGM = true;
                        this.activeSession = { id: sessionSnap.id, ...sessionData };
                        logger.info("StageModule: Mestre Absoluto identificado. Acesso concedido.");

                        // Create self-invite for presence tracking if not exists
                        const selfInviteId = `gm_${this.sessionId}_${this.user.uid}`;
                        const inviteRef = doc(collection(db, "session_invites"), selfInviteId);

                        // Idempotent write
                        await setDoc(inviteRef, {
                            sessionId: this.sessionId,
                            email: this.user.email.toLowerCase(),
                            status: "online",
                            uid: this.user.uid,
                            role: 'gm',
                            characterId: null, // GM has no character sheet
                            characterName: 'Mestre da Saga',
                            invitedAt: serverTimestamp(),
                            lastSeen: serverTimestamp()
                        }, { merge: true }); // Merge to avoid overwriting existing data

                        this.participantId = selfInviteId;
                        this.initAccessRequestListener();
                        return; // Successfully initialized as GM
                    } else {
                        logger.warn(`[StageModule] Detecção de Mestre FALHOU. Owner(${sessionData.userId}) !== User(${this.user.uid})`);
                    }
                } else {
                    logger.error(`[StageModule] Sessão ${this.sessionId} não encontrada no banco. Limpando cache.`);
                    localStorage.removeItem('lyra_active_session');
                }

                this.showMysticAlert(`Barreira Arcana: Acesso negado.\nSessão: ${this.sessionId}\nCaso tenha acabado de criar a sessão, aguarde um momento para o reCAPTCHA validar seu acesso.`, "Acesso Negado").then(() => {
                    window.location.href = "index.html";
                });
                return;
            }

            const participant = playerInvite.data();
            this.participantId = playerInvite.id;

            // Fetch session data immediately if not loaded to get systemId
            if (!this.activeSession) {
                const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);
                const sessionSnap = await getDoc(sessionRef);
                if (sessionSnap.exists()) {
                    this.activeSession = { id: sessionSnap.id, ...sessionSnap.data() };
                }
            }

            // CRITICAL CHECK: Even if invite exists, check if user is GM
            if (this.activeSession && String(this.activeSession.userId) === String(this.user.uid)) {
                this.isGM = true;
                logger.info("StageModule: Mestre identificado via invite existente.");
                return;
            }

            // If not GM and no character yet, show selection
            if (!this.isGM && !participant.characterId) {
                await this.showCharacterSelection();
            } else {
                // Real-time character data sync for Sidebar
                const charRef = doc(db, "fichas", participant.characterId);

                // Cleanup old listener if exists
                if (this.charUnsubscribe) this.charUnsubscribe();

                this.charUnsubscribe = onSnapshot(charRef, (charSnap) => {
                    if (charSnap.exists()) {
                        this.characterData = { id: charSnap.id, ...charSnap.data() };
                        logger.debug("[Sidebar:Data] Carregado:", {
                            name: this.characterData.bio?.name,
                            spells: this.characterData.spells?.list?.length || 0,
                            prepSpells: this.characterData.spells?.list?.filter(s => s.prepared).length || 0,
                            items: this.characterData.inventory?.items?.length || 0,
                            equippedItems: this.characterData.inventory?.items?.filter(i => i.equipped).length || 0
                        });
                        this.renderSidebarActions();
                    } else {
                        logger.warn("StageModule: Ficha do personagem não encontrada.");
                    }
                }, (err) => {
                    logger.error("Erro no listener da ficha:", err);
                });
            }
        } catch (error) {
            logger.error("StageModule: Erro de comunicação com o Atrium Arcaro.", error);
            if (error.code === 'permission-denied') {
                logger.warn("DICA: O Firebase AppCheck pode estar bloqueando sua conexão local.");
                this.showMysticAlert("Sua conexão foi recusada pelos guardiões (AppCheck). Tente recarregar a página ou verifique se o reCAPTCHA está visível.", "Barreira de Segurança");
            } else {
                this.showMysticAlert("Ocorreu uma falha na conexão astral: " + error.message, "Erro Místico");
            }
        }
    },

    async showCharacterSelection() {
        const { getCharacters } = await import('../data.js');
        const systemId = this.activeSession?.systemId || "dnd5e";
        const characters = await getCharacters(this.user.uid, systemId);

        if (characters.length === 0) {
            this.showMysticAlert("Você não possui fichas para este sistema. Crie uma ficha antes de adentrar o Atrium.", "Sem Registros").then(() => {
                window.close();
                setTimeout(() => { window.location.href = "index.html"; }, 500);
            });
            return;
        }

        const modalHtml = `
            <div class="modal-stage">
                <div class="modal-stage-content">
                    <h2 class="medieval-title">Manifeste sua Presença</h2>
                    <p>Escolha qual herói dará voz ao seu destino nesta jornada.</p>
                    <div class="char-grid">
                        ${characters.map(char => {
            const name = char.name || char.bio?.name || 'Sem Nome';
            const charClass = char.bio?.class || char.class || 'Aventureiro';
            const level = char.bio?.level || char.level || 1;
            const token = char.tokenUrl || char.token || 'assets/tokens/default_char.png';

            return `
                                <div class="char-select-card" onclick="StageModule.selectCharacter('${char.id}', '${name.replace(/'/g, "\\'")}', '${token}')">
                                    <img src="${token}" alt="${name}">
                                    <h4>${name}</h4>
                                    <p>${charClass} Nível ${level}</p>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('modal-container');
        if (container) container.innerHTML = modalHtml;
    },

    async selectCharacter(charId, charName, charToken) {
        if (!this.participantId) return;

        try {
            // 3. Prevent duplicate entry message if already manifested
            if (this.isManifesting) return;
            this.isManifesting = true;

            const inviteRef = doc(db, "session_invites", this.participantId);
            await updateDoc(inviteRef, {
                characterId: charId,
                characterName: charName,
                characterToken: charToken,
                uid: this.user.uid,
                status: "online"
            });

            document.getElementById('modal-container').innerHTML = "";

            // Only add system message if NOT in oracle mode (oracle will narrate)
            if (this.activeSession?.mode !== 'oracle') {
                this.addSystemMessage(`${this.user.displayName || "Um viajante"} manifestou-se como ${charName}.`);
            }

            // Load data immediately
            try {
                const { getCharacter } = await import('../data.js');
                this.characterData = await getCharacter(charId);
                this.renderSidebarActions();

                // ORACLE ENTRY NARRATION: Se for modo oráculo, pedir narração de entrada
                if (this.activeSession?.mode === 'oracle') {
                    logger.info("🧩 Solicitando entrada épica ao Oráculo para:", charName);

                    // Check if already narrated in this session history to avoid duplicates
                    const historyQuery = query(
                        collection(db, COLLECTIONS.SESSIONS, this.sessionId, COLLECTIONS.MESSAGES),
                        where("type", "==", "oracle"),
                        orderBy("timestamp", "desc"),
                        limit(10)
                    );
                    const historySnap = await getDocs(historyQuery);
                    const alreadyNarrated = historySnap.docs.some(d => d.data().text?.includes(charName));

                    if (!alreadyNarrated) {
                        // Coletar contexto recente
                        const recentMsgs = [];
                        const msgSnapshot = await getDocs(query(
                            collection(db, COLLECTIONS.SESSIONS, this.sessionId, COLLECTIONS.MESSAGES),
                            where("chapterIndex", "==", this.currentChapterIdx),
                            orderBy("timestamp", "desc"),
                            limit(5)
                        ));
                        msgSnapshot.forEach(d => recentMsgs.unshift(d.data()));

                        const context = {
                            story: this.activeSession.story,
                            recentMessages: recentMsgs.map(m => `${m.sender}: ${m.text}`)
                        };

                        const narration = await narrateCharacterEntry(context, this.characterData);

                        // Adicionar mensagem do oráculo ao chat no subcoleção da sessão
                        await addDoc(collection(db, COLLECTIONS.SESSIONS, this.sessionId, COLLECTIONS.MESSAGES), {
                            sender: "Oráculo",
                            text: narration,
                            timestamp: serverTimestamp(),
                            type: "oracle",
                            chapterIndex: Number(this.currentChapterIdx || 0)
                        });
                    }
                }

            } catch (e) {
                logger.error("Erro ao carregar dados ou narrar entrada:", e);
            }
        } catch (err) {
            logger.error("Erro ao vincular personagem:", err);
            alert("O vínculo falhou. Tente novamente.");
        } finally {
            this.isManifesting = false;
        }
    },

    bindEvents() {
        // Chat
        document.getElementById('send-chat-btn')?.addEventListener('click', () => this.sendChat());
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChat();
            }
        });


        // Sidebar Actions
        document.getElementById('btn-refresh-sidebar')?.addEventListener('click', () => {
            logger.debug("[Sidebar] Refresh manual solicitado.");
            this.renderSidebarActions();
        });

        // GM Actions
        document.getElementById('btn-extend-narrative')?.addEventListener('click', () => this.extendNarrative());
        document.getElementById('btn-start-encounter')?.addEventListener('click', () => this.startCombat());
        document.getElementById('btn-request-roll')?.addEventListener('click', () => this.requestRoll());


        // Footer Actions - Exit closes the tab (dashboard is in another tab)
        // Session Controls
        document.getElementById('btn-exit-atrium')?.addEventListener('click', async () => {
            const confirmed = await this.showMysticConfirm("Deseja realmente sair do Atrium? A aba será fechada.", "Despedida Arcana");
            if (confirmed) {
                window.close();
            }
        });

        document.getElementById('btn-end-session')?.addEventListener('click', () => {
            this.concludeChapter();
        });

        // Hero/Master Actions
        const heroActionsBtn = document.getElementById('btn-hero-actions');
        if (heroActionsBtn) {
            heroActionsBtn.addEventListener('click', () => {
                if (this.isGM) {
                    this.showMasterActionsPanel();
                } else if (window.HeroActions) {
                    window.HeroActions.openBackpackModal();
                } else {
                    logger.warn("HeroActions module not loaded.");
                }
            });
        }
    },


    setupRealtimeSync() {
        if (!this.sessionId) return;

        // Sync Session Data
        const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);
        onSnapshot(sessionRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                this.activeSession = { id: snapshot.id, ...data };
                this.isGM = this.user.uid === data.userId;
                this.renderSessionUI();

                // 🛡️ Fix Race Condition: Render cached messages once session data is ready
                if (this.lastMessages && this.lastMessages.length > 0) {
                    this.renderMessages(this.lastMessages);
                }

                // ⚔️ Combat Sync
                if (data.combatActive && data.combatState) {
                    // Sincronizar motor de combate
                    if (CombatEngine) {
                        CombatEngine.sessionId = snapshot.id;
                        CombatEngine.combatState = data.combatState;
                    }
                    CombatUI.renderCombatPanel(data.combatState);
                } else if (data.combatActive) {
                    // Loading state: ensure containers are correct
                    document.getElementById('narrative-actions-container')?.classList.add('hidden');
                    document.getElementById('combat-actions-container')?.classList.remove('hidden');
                    document.getElementById('actions-sidebar')?.classList.remove('hidden');
                } else {
                    CombatUI.hideCombatPanel();
                    document.getElementById('actions-sidebar')?.classList.remove('hidden');
                }

                // 🚪 Session Concluded Sync (for Players)
                if (data.sessionStatus === 'active') {
                    this.conclusionShown = false;
                }

                if (!this.isGM && data.sessionStatus === 'concluded' && !this.conclusionShown) {
                    this.conclusionShown = true;
                    this.showMysticAlert("📜 **O Mestre concluiu este capítulo.** Os ecos da jornada foram guardados nos anais do tempo.", "Jornada Concluída")
                        .then(() => {
                            window.close();
                        });
                }

                // 🚀 Real-time Chapter Transition Sync
                if (!this.isGM && data.activeChapterIndex !== undefined &&
                    Number(data.activeChapterIndex) !== Number(this.currentChapterIdx) &&
                    !this.transitionPromptShown) {

                    this.transitionPromptShown = true;
                    const nextChapterNum = Number(data.activeChapterIndex) + 1;
                    const chapterTitle = data.fullTimeline && data.fullTimeline[data.activeChapterIndex] ?
                        `: ${data.fullTimeline[data.activeChapterIndex].title}` : "";

                    this.showMysticConfirm(
                        `O Mestre avançou para o **Capítulo ${nextChapterNum}${chapterTitle}**. Deseja acompanhar a transição agora?`,
                        "Nova Jornada Disponível"
                    ).then(confirmed => {
                        if (confirmed) {
                            localStorage.setItem('lyra_active_chapter', data.activeChapterIndex);
                            window.location.href = `session-stage.html?id=${this.sessionId}&chapter=${data.activeChapterIndex}`;
                        } else {
                            // Don't show again immediately but keep monitoring
                            setTimeout(() => { this.transitionPromptShown = false; }, 30000);
                        }
                    });
                }

                // Render Allied Block (NPCs from session)
                this.renderAlliedCharacters();
            } else {
                logger.warn("[StageModule] Snapshot vazio ou permissão negada...");
                if (this.activeSession) {
                    this.showMysticAlert("A conexão com a sessão foi perdida.", "Vínculo Quebrado").then(() => {
                        window.close();
                    });
                }
            }
        }, (error) => {
            logger.error("Erro no listener da sessão:", error);
        });

        // Sync Chat Messages
        const params = new URLSearchParams(window.location.search);
        let chapterParam = params.has('chapter') ? parseInt(params.get('chapter'), 10) : null;

        const startChatListener = (actualIdx) => {
            // 🛡️ Cleanup previous listener
            if (this.chatUnsubscribe) {
                this.chatUnsubscribe();
                this.chatUnsubscribe = null;
            }

            this.currentChapterIdx = Number(actualIdx || 0);
            logger.info(`[Stage] Iniciando Listener do Chat para o Capítulo: ${this.currentChapterIdx}`);

            const chatRef = collection(db, COLLECTIONS.SESSIONS, this.sessionId, COLLECTIONS.MESSAGES);
            // 🚀 Query recent 500 messages, ordered by timestamp asc. 
            // ASC is safer for early chapters as they stay in the snapshot longer.
            const q = query(
                chatRef,
                orderBy("timestamp", "asc"),
                limit(500)
            );

            this.chatUnsubscribe = onSnapshot(q, (snapshot) => {
                const allMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 🛡️ Local Isolation Filter with Robust Legacy Support
                const targetIdx = Number(this.currentChapterIdx);
                const filteredMessages = allMessages.filter(msg => {
                    const msgIdx = (msg.chapterIndex !== undefined && msg.chapterIndex !== null)
                        ? Number(msg.chapterIndex)
                        : 0; // Legacy mapping
                    return msgIdx === targetIdx;
                });

                this.lastMessages = filteredMessages;
                this.renderMessages(filteredMessages);
            }, (error) => {
                logger.error("Erro no listener do chat:", error);
            });
        };

        // Always start with the current index (pre-detected in init or default 0)
        startChatListener(this.currentChapterIdx);

        // Delegate clicks for inline tags
        document.getElementById('narrative-text')?.addEventListener('click', (e) => {
            const itemTag = e.target.closest('.inline-item');
            if (itemTag) {
                this.handleInlineItemClick(itemTag.dataset);
                return;
            }

            const npcTag = e.target.closest('.inline-npc');
            if (npcTag) {
                this.handleInlineNPCClick(npcTag.dataset);
                return;
            }

            const monsterTag = e.target.closest('.inline-monster');
            if (monsterTag) {
                this.handleInlineMonsterClick(monsterTag.dataset);
                return;
            }
        });
    },

    setupPresenceSync() {
        // Fetch all participants who accepted and maybe have a character
        const q = query(
            collection(db, "session_invites"),
            where("sessionId", "==", this.sessionId),
            where("status", "in", ["online", "away", "offline", "accepted"])
        );

        onSnapshot(q, (snapshot) => {
            const participants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            logger.debug(`[Presence] Sincronizando: ${participants.length} total, Status: online`);

            // Count total players (exclude GM)
            // Robust check: exclude by role OR if ID starts with 'self_' OR if uid matches session owner
            const playersOnline = participants.filter(p => {
                if (p.role === 'gm') return false;
                if (p.id && (p.id.startsWith('self_') || p.id.startsWith('gm_'))) return false;
                if (this.activeSession && (p.userId === this.activeSession.userId || p.uid === this.activeSession.userId)) return false;
                return true;
            });
            const count = playersOnline.length;

            logger.debug(`[Presence] Aventureiros online: ${count}`);

            // Update participant names for auto-linking
            this.participantsNames = playersOnline
                .map(p => p.characterName)
                .filter(name => !!name);

            const countEl = document.getElementById('player-count');
            if (countEl) {
                countEl.innerHTML = `<i class="fas fa-users"></i> ${count} Aventureiros`;
            }

            // Store for Allied Block rendering
            this.currentParticipants = participants;
            this.renderAlliedCharacters();

            // Setup character data listeners for real-time HP/AC in Allied Block
            // PASS ALL PARTICIPANTS, not just online ones
            this.setupAlliedDataListeners(participants);
        });
    },

    setupAlliedDataListeners(players) {
        if (!this.alliedListeners) this.alliedListeners = new Map();
        if (!this.alliedDataCache) this.alliedDataCache = new Map();

        const activeIds = new Set(players.map(p => p.characterId).filter(id => id));

        // Cleanup old
        for (const [id, unsub] of this.alliedListeners) {
            if (!activeIds.has(id)) {
                unsub();
                this.alliedListeners.delete(id);
                this.alliedDataCache.delete(id);
            }
        }

        // Add new
        players.forEach(p => {
            if (p.characterId && !this.alliedListeners.has(p.characterId)) {
                const unsub = onSnapshot(doc(db, "fichas", p.characterId), (snap) => {
                    if (snap.exists()) {
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

                        this.alliedDataCache.set(p.characterId, {
                            hp: hpCurrent ?? "?",
                            maxHp: hpMax ?? "?",
                            ac: acVal ?? "?",
                            initiativeBonus: getVal(['attributes.INI.bonus', 'combat.initiativeBonus', 'stats.initiativeBonus']) ?? 0
                        });
                        this.renderAlliedCharacters();
                    }
                });
                this.alliedListeners.set(p.characterId, unsub);
            }
        });
    },

    async renderAlliedCharacters() {
        const container = document.getElementById('allied-list');
        if (!container) return;

        const players = (this.currentParticipants || []).filter(p => p.role !== 'gm' && p.characterId);
        const npcAllies = this.activeSession?.allies || [];
        const sessionNPCs = this.activeSession?.sessionNPCs || []; // NPCs from Oracle

        // Merge all NPC sources
        const allNPCs = [...npcAllies, ...sessionNPCs];

        if (players.length === 0 && allNPCs.length === 0) {
            container.innerHTML = `<p class="empty-msg-sml">Nenhum aliado no palco...</p>`;
            return;
        }

        let html = "";

        // Helper for HP Color/Percentage
        const getHpStatus = (current, max) => {
            if (current === "?" || max === "?") return { pct: 100, color: '#d4af37' };
            const pct = Math.min(100, Math.max(0, (current / max) * 100));
            let color = '#4caf50'; // Green
            if (pct <= 25) color = '#f44336'; // Red
            else if (pct <= 50) color = '#ff9800'; // Orange
            return { pct, color };
        };

        // Render Players
        for (const p of players) {
            const charId = p.characterId;
            const data = this.alliedDataCache?.get(charId);

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
                <div class="ally-card-premium npc-ally" data-npc-name="${escapeHTML(npc.name)}">
                    <div class="ally-header-sml">
                        <span class="ally-name-sml"><i class="fas fa-user-ninja"></i> ${escapeHTML(npc.name)}</span>
                        <div class="ally-meta-mini">
                            <span class="ally-ac-mini"><i class="fas fa-shield-halved"></i> ${npc.ac || 10}</span>
                            ${this.isGM ? `<i class="fas fa-trash-alt delete-npc-btn" title="Remover NPC" onclick="window.StageModule.deleteNPC('${npc.name}')"></i>` : ''}
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
            // Initial check after a small delay to ensure rendering is complete
            setTimeout(updateArrows, 150);

            // Re-check on window resize too
            window.addEventListener('resize', updateArrows);
        }
    },

    renderSessionUI() {
        if (!this.activeSession) return;

        // Update Title & Status
        document.getElementById('session-title').textContent = this.activeSession.title || "Sessão Sem Título";
        document.getElementById('session-status').innerHTML = `<i class="fas fa-check-circle" style="color: #4caf50;"></i> Conectado`;

        // Update Sidebar according to role
        this.renderSidebarActions();

        if (this.isGM) {
            const heroBtn = document.getElementById('btn-hero-actions');
            if (heroBtn) {
                heroBtn.innerHTML = `<i class="fas fa-hat-wizard"></i> AÇÃO DO MESTRE`;
            }
            this.injectManualNarrativeEditor();
        }
    },


    injectManualNarrativeEditor() {
        const mainArea = document.querySelector('.stage-main');
        if (!mainArea || document.getElementById('gm-narrative-editor')) return;

        // Load story from current chapter if available
        const chapterIdx = this.currentChapterIdx;

        let initialText = '';
        if (this.activeSession && this.activeSession.fullTimeline && this.activeSession.fullTimeline[chapterIdx]) {
            initialText = this.activeSession.fullTimeline[chapterIdx].story || '';
        }

        // ONLY fallback to root story for the first chapter (index 0) or if this isn't a timeline-based session
        if (!initialText && chapterIdx === 0) {
            initialText = this.activeSession?.story || '';
        }

        const editor = document.createElement('div');
        editor.id = 'gm-narrative-editor';
        editor.className = 'gm-narrative-panel';
        editor.innerHTML = `
            <h4 class="medieval-header-sml"><i class="fas fa-feather-pointed"></i> Tecendo o Destino (Notas & IA)</h4>
            <div class="gm-input-group">
                <textarea id="gm-narrative-input" placeholder="Escreva aqui a continuação da história ou suas anotações...">${initialText}</textarea>
                <button class="gold-btn-chat" id="btn-gm-send-story" title="Enviar para o Chat">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div class="gm-narrative-actions">
                <button class="medieval-btn btn-magic-enhance full-width" onclick="StageModule.enhanceNarrativeNotes()">
                    <i class="fas fa-wand-magic-sparkles"></i> Melhorar com Magia
                </button>
            </div>
        `;

        mainArea.appendChild(editor);

        const textarea = editor.querySelector('textarea');
        const sendBtn = editor.querySelector('#btn-gm-send-story');

        // Send Logic
        const sendMessage = async () => {
            const text = textarea.value.trim();
            if (!text) return;

            try {
                // Send as GM message to the central narrative board
                const chatRef = collection(db, COLLECTIONS.SESSIONS, this.sessionId, COLLECTIONS.MESSAGES);
                await addDoc(chatRef, {
                    text: text,
                    sender: "Mestre",
                    senderId: this.user.uid,
                    timestamp: serverTimestamp(),
                    role: "system", // Ensures it goes to the central board
                    type: "system",
                    chapterIndex: Number(this.currentChapterIdx || 0),
                    photoURL: this.user.photoURL || null
                });

                // Clear input
                textarea.value = '';

                // Visual feedback
                const originalIcon = sendBtn.innerHTML;
                sendBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => sendBtn.innerHTML = originalIcon, 1000);

            } catch (error) {
                logger.error("Error sending GM message:", error);
                alert("Erro ao enviar mensagem.");
            }
        };

        sendBtn.addEventListener('click', sendMessage);

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Auto-save logic (Optional - keeping it for 'Notes' persistence if needed, 
        // but user seems to want it as a chat input. I'll COMMENT IT OUT or remove it to avoid confusion 
        // if the user intends this purely as a message box. 
        // However, the section title is "Notas". 
        // I will keep the auto-update of the story state but maybe NOT clear the text? 
        // No, typically 'Send' clears. 
        // Let's assume 'Send' clears and sends. Auto-save is for draft.
        /*
        let saveTimeout;
        textarea.addEventListener('input', () => {
             clearTimeout(saveTimeout);
             saveTimeout = setTimeout(() => this.updateSessionStory(), 2000);
        });
        */
    },

    async enhanceNarrativeNotes() {
        const textarea = document.getElementById('gm-narrative-input');
        if (!textarea) return;

        const text = textarea.value.trim();
        if (!text) {
            this.showMysticAlert("Escreva algumas sementes de ideias antes de pedir a benção do Oráculo.", "Vazio de Inspiração");
            return;
        }

        const originalHtml = document.querySelector('.btn-magic-enhance').innerHTML;
        document.querySelector('.btn-magic-enhance').innerHTML = `<i class="fas fa-spinner fa-spin"></i> Tecendo...`;
        document.querySelector('.btn-magic-enhance').disabled = true;

        try {
            const prompt = `Você é o Oráculo Arcano. Melhore e torne mais épico o seguinte parágrafo de narração ou anotação para um RPG de fantasia, mantendo o sentido original, mas usando um vocabulário rico e imersivo.
            
            TEXTOR ORIGINAL:
            "${text}"
            
            RETORNE APENAS O TEXTO MELHORADO, SEM TÍTULOS OU COMENTÁRIOS ADICIONAIS.`;

            const { callGeminiAPI } = await import('../ai.js');
            const token = await this.user.getIdToken();
            const enhanced = await callGeminiAPI(prompt, token);

            if (enhanced) {
                textarea.value = enhanced.trim();
                this.showMysticAlert("O Oráculo abençoou suas palavras.", "Magia Concluída");
            }
        } catch (err) {
            logger.error("Erro ao melhorar notas:", err);
            this.showMysticAlert("A conexão com o plano das ideias falhou.");
        } finally {
            document.querySelector('.btn-magic-enhance').innerHTML = originalHtml;
            document.querySelector('.btn-magic-enhance').disabled = false;
        }
    },

    async updateSessionStory() {
        const input = document.getElementById('gm-narrative-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        try {
            const params = new URLSearchParams(window.location.search);
            const chapterIdx = parseInt(params.get('chapter') || '0', 10);

            const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);

            // Sync current chapter story in the timeline
            let updates = {
                story: text, // Global story (secondary/fallback)
                updatedAt: serverTimestamp()
            };

            if (this.activeSession && this.activeSession.fullTimeline) {
                const newTimeline = [...this.activeSession.fullTimeline];
                if (newTimeline[chapterIdx]) {
                    // Update the specific chapter's summary/description as the story develops
                    newTimeline[chapterIdx].story = text;
                    updates.fullTimeline = newTimeline;
                }
            }

            // ONLY update root story if we are in the first chapter to avoid global contamination
            if (chapterIdx !== 0) {
                delete updates.story;
            }

            await updateDoc(sessionRef, updates);
            logger.info("[Stage] Notas da sessão salvas.");
        } catch (err) {
            logger.error("Erro ao atualizar história:", err);
        }
    },

    renderSidebarActions() {
        const container = document.getElementById('contextual-actions');
        const title = document.getElementById('sidebar-role-title');
        if (!container || !this.activeSession) return;

        const sessionMode = this.activeSession.mode || 'manual';
        const isOracleMode = sessionMode === 'oracle';
        const isCombatActive = this.activeSession.combatActive;
        const showGMCommands = this.isGM && !isCombatActive;

        // "Concluir" is GM exclusive
        const btnEnd = document.getElementById('btn-end-session');
        if (btnEnd) {
            btnEnd.style.display = this.isGM ? 'flex' : 'none';
        }

        if (isCombatActive) {
            document.getElementById('actions-sidebar')?.classList.remove('hidden');
            document.getElementById('narrative-actions-container')?.classList.add('hidden');
            document.getElementById('combat-actions-container')?.classList.remove('hidden');
            container.innerHTML = "";
            title.textContent = "Ações do Herói";
            return;
        }

        document.getElementById('narrative-actions-container')?.classList.remove('hidden');
        document.getElementById('combat-actions-container')?.classList.add('hidden');

        // Only show waiting screen for PLAYERS in oracle mode
        if (isOracleMode && !this.isGM) {
            document.getElementById('actions-sidebar')?.classList.remove('hidden');
            container.innerHTML = `
                <div class="sidebar-info-msg oracle-waiting">
                    <i class="fas fa-scroll"></i>
                    <p>O Oráculo tece o destino...</p>
                    <span class="wait-badge">Aguardando o Mestre...</span>
                </div>
            `;
            title.textContent = "Aguardando";
            return;
        }

        if (this.isGM) {
            // GM sidebar now shows a placeholder, actions are in showMasterActionsPanel
            document.getElementById('actions-sidebar')?.classList.remove('hidden');
            container.innerHTML = `
                <div class="sidebar-info-msg">
                    <i class="fas fa-shield-alt"></i>
                    <p>Lateral reservada para Iniciativa e Combate.</p>
                </div>
            `;
        } else {
            document.getElementById('actions-sidebar')?.classList.remove('hidden');
            const char = this.characterData;

            if (!char) {
                container.innerHTML = `<p class="mystic-msg">Aguardando vínculo com a alma do herói...</p>`;
                return;
            }

            const spells = char.spells?.list || [];
            const items = char.inventory?.items || [];
            const attacks = char.combat?.attacks || [];

            container.innerHTML = `
                <div class="player-actions-scroll">
                    <div class="action-section">
                        <h4>Ações Rápidas</h4>
                        <div class="action-grid">
                            <button class="medieval-btn small" id="btn-roll-d20-fast">1d20</button>
                            <button class="medieval-btn small" id="btn-roll-d12-fast">1d12</button>
                            <button class="medieval-btn small" id="btn-roll-d10-fast">1d10</button>
                            <button class="medieval-btn small" id="btn-roll-d8-fast">1d8</button>
                            <button class="medieval-btn small" id="btn-roll-d6-fast">1d6</button>
                            <button class="medieval-btn small" id="btn-roll-d4-fast">1d4</button>
                        </div>
                    </div>
                    <div class="action-section">
                        <h4>Combate</h4>
                        <div class="action-list">
                            ${attacks.length ? attacks.map(atk => `
                                <div class="action-item combat-item" data-atk-name="${atk.name}" data-atk-bonus="${atk.bonus}" data-atk-damage="${atk.damage}">
                                    <span class="atk-name">${atk.name}</span>
                                    <span class="atk-bonus">${atk.bonus >= 0 ? '+' : ''}${atk.bonus}</span>
                                </div>
                            `).join('') : '<p class="empty-msg">Nenhum ataque preparado.</p>'}
                        </div>
                    </div>
                    <div class="action-section">
                        <h4>Magias Preparadas</h4>
                        <div class="action-list">
                            ${Array.isArray(spells) && spells.filter(s => s.prepared === true).length ? spells.filter(s => s.prepared === true).map(s => `
                                <div class="action-item magic-item" data-spell-name="${s.name}">
                                    <span class="spell-name">${s.name}</span>
                                    <span class="spell-lvl">Nível ${s.level}</span>
                                </div>
                            `).join('') : '<p class="empty-msg">Nenhuma magia preparada.</p>'}
                        </div>
                    </div>
                    <div class="action-section">
                        <h4>Equipados</h4>
                        <div class="action-list">
                            ${Array.isArray(items) && items.filter(i => i.equipped === true).length ? items.filter(i => i.equipped === true).map(i => `
                                <div class="action-item inventory-item" data-item-name="${i.name}">
                                    <span class="item-name">${i.name}</span>
                                    <span class="item-qty">x${i.quantity || 1}</span>
                                </div>
                            `).join('') : '<p class="empty-msg">Nenhum item equipado.</p>'}
                        </div>
                    </div>
                </div>
            `;

            container.querySelectorAll('.combat-item').forEach(el => {
                el.addEventListener('click', () => this.rollAttack(el.dataset.atkName, el.dataset.atkBonus, el.dataset.atkDamage));
            });
            container.querySelectorAll('.magic-item').forEach(el => {
                el.addEventListener('click', () => this.useMagic(el.dataset.spellName));
            });
            container.querySelectorAll('.inventory-item').forEach(el => {
                el.addEventListener('click', () => this.useItem(el.dataset.itemName));
            });
            document.getElementById('btn-roll-d20-fast')?.addEventListener('click', () => this.rollDice('1d20'));
            document.getElementById('btn-roll-d12-fast')?.addEventListener('click', () => this.rollDice('1d12'));
            document.getElementById('btn-roll-d10-fast')?.addEventListener('click', () => this.rollDice('1d10'));
            document.getElementById('btn-roll-d8-fast')?.addEventListener('click', () => this.rollDice('1d8'));
            document.getElementById('btn-roll-d6-fast')?.addEventListener('click', () => this.rollDice('1d6'));
            document.getElementById('btn-roll-d4-fast')?.addEventListener('click', () => this.rollDice('1d4'));
        }
    },

    async useMagic(spellName) {
        if (this.lastRollResult === undefined) {
            this.lastRollResult = Math.floor(Math.random() * 20) + 1;
            this.addSystemMessage(`${this.characterData?.bio?.name || this.user.displayName || 'O Jogador'} rolou **${this.lastRollResult}** para conjurar.`);
        }
        const sender = this.characterData?.bio?.name || this.user.displayName || 'O Jogador';
        this.addSystemMessage(`${sender} manifesta a magia **${spellName}** com resultado **${this.lastRollResult}**!`);
        this.lastRollResult = undefined;
    },

    async renderMessages(messages) {
        if (!this.activeSession) {
            logger.debug("[Stage] Ignorando renderMessages: activeSession ainda não carregada.");
            return;
        }
        const chatContainer = document.getElementById('session-messages');
        const narrativeBoard = document.getElementById('narrative-text');
        if (!chatContainer || !narrativeBoard) return;

        // Split messages
        const chatMsgs = [];
        const narrativeMsgs = [];

        // 🛡️ Consolidated Intro logic
        const chapterIndex = Number(this.currentChapterIdx || 0);

        // Define intro text: prioritize chapter summary/description over root session story
        const hasTimeline = this.activeSession.fullTimeline && Array.isArray(this.activeSession.fullTimeline);
        const chapter = (hasTimeline && this.activeSession.fullTimeline[chapterIndex]) ? this.activeSession.fullTimeline[chapterIndex] : this.activeSession;

        let introText = (chapter.summary || chapter.description || "").trim();

        // Root story is ONLY a fallback for Chapter 0 if chapter summary is missing
        if (!introText && chapterIndex === 0) {
            introText = (this.activeSession.story || "").trim();
        }

        logger.debug(`[Stage:Render] Renderizando Capítulo: ${chapterIndex}, Intro Detectada: ${!!introText}`);

        // Check if the current intro is already in the filtered message list
        const hasStoryInHistory = messages.some(m =>
            (m.type === 'oracle' || m.oracleType === 'initialize') &&
            (m.text || '').trim() === introText.trim()
        );

        if (!hasStoryInHistory && introText) {
            narrativeMsgs.push({
                type: 'oracle',
                oracleType: 'initialize',
                sender: 'Oráculo Arcano',
                text: introText,
                timestamp: this.activeSession.startedAt || { toDate: () => new Date() },
                chapterTitle: chapter.title || (chapterIndex === 0 ? "Início da Saga" : `Capítulo ${chapterIndex + 1}`)
            });
        }

        messages.forEach(msg => {
            const isOracle = msg.type === 'oracle' || msg.oracleType || msg.sender === 'Oráculo Arcano';
            const isSystem = msg.type === 'system' || msg.role === 'system' || msg.senderId === 'system' || msg.type === 'roll_request' || msg.sender === 'Sistema de Combate' || msg.sender === 'Legado Arcano';
            const isCombat = msg.type === 'combat' || msg.type === 'narrative_action';

            if (isOracle || isSystem || isCombat) {
                // Prepend logic handled above, just add other messages normally
                const isRedundantIntro = msg.oracleType === 'initialize' && narrativeMsgs.some(n => n.oracleType === 'initialize' && n.text === msg.text);
                if (!isRedundantIntro) {
                    narrativeMsgs.push(msg);
                }
            } else {
                chatMsgs.push(msg);
            }
        });

        // 1. Render Chat (Sidebar)
        chatContainer.innerHTML = chatMsgs.map(msg => this.formatChatMessage(msg)).join('');
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Collect known names for auto-linking
        const knownNames = [];
        if (this.participantsNames) {
            this.participantsNames.forEach(name => knownNames.push(name));
        }
        if (this.characterData?.bio?.name && !knownNames.includes(this.characterData.bio.name)) {
            knownNames.push(this.characterData.bio.name);
        }
        if (this.activeSession?.linked_npcs) {
            this.activeSession.linked_npcs.forEach(n => knownNames.push(n.name || n.title));
        }
        if (this.activeSession?.sessionNPCs) {
            this.activeSession.sessionNPCs.forEach(n => knownNames.push(n.name));
        }

        // 2. Render Narrative (Center)
        const narrativeHTML = narrativeMsgs.map(msg => {
            const isSummary = msg.oracleType === 'summary';
            const isIntro = msg.oracleType === 'initialize';
            const msgText = (msg.text || msg.message || '').trim();
            const decoratedText = (msg.isRawHTML || !ContentParser.decorateText) ? msgText : ContentParser.decorateText(msgText, knownNames);

            // Check for Roll Request
            let rollCardHTML = '';
            if (msg.type === 'roll_request' || msg.rollRequest) {
                rollCardHTML = RollRequestModule.renderRollRequestCard(msg);
            }

            if (isIntro || isSummary) {
                const title = escapeHTML(msg.chapterTitle || (isSummary ? "Resumo do Oráculo" : "Ecos do Destino"));
                return `<div class="chat-msg oracle-msg oracle-summary"><div class="narrative-parchment-flow"><div class="parchment-header"><span class="chapter-marker">${isIntro ? 'Manifestação' : 'Recapitulação'}</span><h2 class="chapter-title">${title}</h2></div><div class="parchment-body">${decoratedText}</div></div><div class="narrative-divider-mystic"><i class="fas fa-feather-alt"></i><span>E assim se escreve...</span><i class="fas fa-feather-alt"></i></div></div>`;
            }

            const isRollReq = msg.type === 'roll_request' || msg.rollRequest;
            const content = isRollReq ? rollCardHTML : `${decoratedText}${rollCardHTML}`;

            return `<div class="narrative-bubble narrative-text-animate"><div class="bubble-header"><i class="fas fa-feather-pointed"></i><span>${this.formatTime(msg.timestamp)}</span></div><div class="bubble-text">${content}</div></div>`;
        }).join('');

        if (narrativeBoard.innerHTML !== narrativeHTML) {
            narrativeBoard.innerHTML = narrativeHTML;
            narrativeBoard.scrollTop = narrativeBoard.scrollHeight;
        }
    },

    formatChatMessage(msg) {
        const timeStr = this.formatTime(msg.timestamp);
        const isGM = msg.role === 'gm';
        const isSystem = msg.role === 'system';

        // Force GM name to be "Mestre"
        let sender = msg.senderNickname || msg.sender || 'Desconhecido';
        if (isGM) sender = "Mestre";

        const text = msg.text || msg.message || '';
        const isLocal = msg.senderId === this.user.uid;

        return `
            <div class="chat-msg ${isGM ? 'gm-msg' : ''} ${isSystem ? 'system-msg' : ''} ${isLocal ? 'local-msg' : ''}">
                <span class="msg-sender">${escapeHTML(sender)} ${isLocal ? '(Você)' : ''}</span>
                <span class="msg-text">${(isSystem || sender === 'Oráculo' || sender === 'Oráculo Arcano' || sender === 'Sistema de Combate') ? text : escapeHTML(text)}</span>
                <span class="msg-time">${timeStr}</span>
            </div>
        `;
    },

    formatTime(timestamp) {
        if (!timestamp) return "";
        if (timestamp.toDate) return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return "";
    },

    async handleInlineItemClick(data) {
        const { name, desc, props } = data;

        const confirm = await this.showMysticAlert(`
            <div class="inline-preview">
                <i class="fas fa-gem fa-2x" style="color:var(--gold); margin-bottom:10px;"></i>
                <h3>${escapeHTML(name)}</h3>
                <p><em>${escapeHTML(props)}</em></p>
                <div class="preview-desc">${escapeHTML(desc)}</div>
                <div style="margin-top:15px; font-size:0.9rem; opacity:0.8;">Deseja manifestar este item em sua mochila?</div>
            </div>
        `, "Tesouro Encontrado", true);

        if (confirm && this.characterData) {
            try {
                const { ContentParser } = await import('./content-parser.js');
                // We fake a result to reuse content parser logic or manually add
                const newItem = {
                    name,
                    description: desc,
                    properties: props,
                    rarity: "Comum",
                    weight: 1,
                    quantity: 1,
                    type: "Item"
                };

                // Add to character inventory
                const charRef = doc(db, COLLECTIONS.CHARACTERS, this.characterData.id);
                const updatedInventory = { ...(this.characterData.inventory || { items: [] }) };
                updatedInventory.items = [...(updatedInventory.items || []), newItem];

                await updateDoc(charRef, { inventory: updatedInventory });
                this.showMysticAlert(`${name} foi adicionado à sua mochila.`, "Item Equipado");
            } catch (err) {
                logger.error("Erro ao equipar item:", err);
                this.showMysticAlert("Falha ao materializar item.");
            }
        }
    },

    async handleInlineNPCClick(data) {
        const { name, race, desc } = data;

        this.showMysticAlert(`
            <div class="inline-preview">
                <i class="fas fa-user-shield fa-2x" style="color:var(--gold); margin-bottom:10px;"></i>
                <h3>${escapeHTML(name)}</h3>
                <p><strong>${escapeHTML(race)}</strong></p>
                <div class="preview-desc">${escapeHTML(desc)}</div>
            </div>
        `, "Registro de Encontro");
    },

    // REMOVED: Duplicate function - using Firestore version at line 1382

    async handleInlineMonsterClick(dataset) {
        const { name, details } = dataset;

        await this.showMysticAlert(`
            <div class="inline-preview">
                <i class="fas fa-dragon fa-2x" style="color:var(--gold); margin-bottom:10px;"></i>
                <h3>${escapeHTML(name)}</h3>
                <div class="preview-desc">${escapeHTML(details)}</div>
            </div>
        `, "Conhecimento de Criatura");
    },

    toggleLoading(show, message = "Invocando o Palco...") {
        const loader = document.getElementById('loader');
        const msgEl = document.getElementById('loader-message');
        if (!loader) return;

        if (show) {
            if (msgEl) msgEl.textContent = message;
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    },

    async sendChat() {
        if (!this.isGM && !this.characterData) {
            this.showCharacterSelection();
            return;
        }

        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        try {
            const chatRef = collection(db, COLLECTIONS.SESSIONS, this.sessionId, COLLECTIONS.MESSAGES);
            await addDoc(chatRef, {
                text,
                senderId: this.user.uid,
                senderNickname: (this.characterData?.bio?.name) || this.user.displayName || "Viajante",
                role: this.isGM ? "gm" : "player",
                chapterIndex: Number(this.currentChapterIdx || 0),
                timestamp: serverTimestamp()
            });
            input.value = '';

            // AUTONOMOUS ORACLE: Reactive response if session is in Oracle mode
            if (this.activeSession?.mode === 'oracle' && !this.activeSession.combatActive) {
                // Sincronização: Verificar se todos os jogadores falaram
                const canProceed = await this.checkIfAllPlayersReadyForOracle();

                if (canProceed) {
                    this.addSystemMessage('<i class="fas fa-wand-magic-sparkles"></i> Todos se manifestaram. O Mestre está tecendo o destino...');
                    const { default: OracleModule } = await import('./oracle.js');
                    OracleModule.sessionId = this.sessionId;
                    OracleModule.sessionData = this.activeSession;
                    OracleModule.extendNarrative();
                }
            }
        } catch (err) {
            logger.error("Erro ao enviar mensagem:", err);
        }
    },

    async checkIfAllPlayersReadyForOracle() {
        try {
            // 1. Obter aventureiros online
            const qInvites = query(
                collection(db, "session_invites"),
                where("sessionId", "==", this.sessionId),
                where("status", "==", "online")
            );
            const snapshotInvites = await getDocs(qInvites);
            const onlineCount = snapshotInvites.size;

            if (onlineCount <= 0) return false;

            // 2. Obter mensagens recentes (Index-Free Refactor)
            const qMessages = query(
                collection(db, COLLECTIONS.SESSIONS, this.sessionId, COLLECTIONS.MESSAGES),
                orderBy("timestamp", "desc"),
                limit(50) // Pegamos um lote maior para filtrar em memória
            );
            const msgSnap = await getDocs(qMessages);
            // Filtragem manual para evitar necessidade de índice composto no Firestore
            const messages = msgSnap.docs
                .map(d => d.data())
                .filter(m => m.chapterIndex === this.currentChapterIdx);

            const lastOracleIdx = messages.findIndex(m => m.role === 'gm' || m.type === 'oracle');
            const messagesAfterOracle = lastOracleIdx === -1 ? messages : messages.slice(0, lastOracleIdx);

            // 3. Contar quantos jogadores ÚNICOS (não GMs) falaram depois do Oráculo
            const gmId = this.activeSession.userId;
            const playersWhoSpoke = new Set(
                messagesAfterOracle
                    .filter(m => m.senderId !== gmId && m.role !== 'gm')
                    .map(m => m.senderId)
            );

            // 4. Obter contagem de jogadores reais online (excluindo GM do requisito)
            const realPlayerInvites = snapshotInvites.docs.filter(d => {
                const data = d.data();
                return data.uid !== gmId && !data.isGM; // Adjusted slightly for safety
            });
            const requiredCount = realPlayerInvites.length;


            // Retorna true se todos os jogadores (excluindo mestre) falaram
            return playersWhoSpoke.size >= requiredCount && requiredCount > 0;

        } catch (err) {
            logger.error("Erro no NarrativeSync:", err);
            return false;
        }
    },


    async startCombat() {
        if (!this.isGM) return;

        try {
            logger.info("⚔️ GM Action: Iniciar Combate");

            // Show Loading State in Sidebar (User Request)
            const combatContainer = document.getElementById('sidebar-combat-list');
            if (combatContainer) {
                combatContainer.innerHTML = `
                    <div class="combat-loading">
                        <i class="fas fa-swords fa-spin"></i>
                        <p>Invocando as Leis da Guerra...<br><small>Preparando o campo de batalha.</small></p>
                    </div>
                `;
                document.getElementById('sidebar-combat-round').textContent = "-";
                document.getElementById('combat-turn-status').textContent = "Iniciando...";
                this.renderSidebarActions();
            }

            // Inicializar Combat Engine
            CombatEngine.sessionId = this.sessionId;
            CombatEngine.sessionData = this.activeSession;

            // 🛡️ REQUISITO: Verificar se há monstros vinculados
            const monsters = this.activeSession.linked_monsters || [];
            if (monsters.length === 0) {
                logger.warn("⚠️ Nenhum adversário pronto. Abrindo a Forja...");
                if (window.CombatPrep) {
                    window.CombatPrep.openPrepModal('combat');
                }
                return;
            }

            const combatState = await CombatEngine.initCombat(this.sessionId, this.activeSession);

            // Renderizar UI
            CombatUI.renderCombatPanel(combatState);

            this.showMysticAlert('<i class="fas fa-swords"></i> Combate iniciado! Os jogadores podem agora selecionar suas ações.');

        } catch (err) {
            logger.error("Erro ao iniciar combate:", err);
            this.showMysticAlert("Erro ao iniciar combate: " + err.message);
        }
    },

    displayCombatTracker(turnOrder) {
        // Create combat tracker UI in sidebar
        const container = document.getElementById('contextual-actions');
        if (!container) return;

        let html = `
            <div class="combat-tracker">
                <h3 class="combat-title"><i class="fas fa-swords"></i> Ordem de Iniciativa</h3>
                <div class="combat-list">
        `;

        turnOrder.forEach((participant, index) => {
            const isActive = index === 0;
            const icon = participant.type === 'player' ? 'user-shield' : 'skull';
            html += `
                <div class="combat-participant ${isActive ? 'active-turn' : ''}" data-index="${index}">
                    <span class="participant-icon">${icon}</span>
                    <div class="participant-info">
                        <span class="participant-name">${participant.name}</span>
                        <span class="participant-stats">HP: ${participant.hp}/${participant.maxHp} | CA: ${participant.ac}</span>
                    </div>
                    <span class="participant-initiative">${participant.initiative}</span>
                </div>
            `;
        });

        html += `
                </div>
                <div class="combat-actions">
                    <button class="medieval-btn small" onclick="StageModule.nextCombatTurn()">
                        Próximo Turno
                    </button>
                    <button class="medieval-btn small secondary" onclick="StageModule.endCombat()">
                        Encerrar Combate
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    async nextCombatTurn() {
        if (!this.isGM) return;
        const { default: CombatModule } = await import('./combat.js');
        CombatModule.sessionId = this.sessionId;

        // Get current combat state from session
        const sessionRef = doc(db, "sessoes", this.sessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (sessionSnap.exists()) {
            const data = sessionSnap.data();
            CombatModule.turnOrder = data.combatTurnOrder || [];
            CombatModule.currentTurnIndex = data.currentTurnIndex || 0;
            CombatModule.round = data.combatRound || 1;
            CombatModule.combatActive = data.combatActive || false;
        }

        await CombatModule.nextTurn();
        this.displayCombatTracker(CombatModule.turnOrder);
    },

    async endCombat() {
        if (!this.isGM) return;
        const confirmed = await this.showMysticConfirm("Encerrar o combate? Isso removerá os adversários atuais para que a próxima luta comece do zero.", "Fim de Batalha");
        if (confirmed) {
            const { default: CombatModule } = await import('./combat.js');
            CombatModule.sessionId = this.sessionId;
            await CombatModule.endCombat();

            // Requisito: Limpar monstros vinculados para que o próximo combate seja virgem
            const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);
            await updateDoc(sessionRef, {
                linked_monsters: [],
                updatedAt: serverTimestamp()
            });

            this.renderSidebarActions(); // Restore normal sidebar
        }
    },

    async addMonstersToCombat(monsters) {
        // 1. Prepare monster data with unique IDs for combat
        const combatants = monsters.map(m => ({
            ...m,
            combatId: Date.now() + Math.random().toString(36).substr(2, 9),
            currentHp: m.hp || 10,
            maxHp: m.hp || 10,
            initiative: Math.floor(Math.random() * 20) + (m.attributes?.DES ? Math.floor((m.attributes.DES - 10) / 2) : 0)
        }));

        // 2. Add to session (using arrayUnion or rewriting combat list)
        const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);

        // We'll append to existing monsters if any
        const currentMonsters = this.activeSession.monsters || [];
        const newMonsterList = [...currentMonsters, ...combatants];

        await updateDoc(sessionRef, {
            monsters: newMonsterList,
            combatActive: true,
            updatedAt: serverTimestamp()
        });

        this.addSystemMessage(`<i class="fas fa-swords"></i> **Combate Iniciado!** ${auditMonsters(monsters)}`);

        function auditMonsters(list) {
            const names = list.map(m => m.name).join(', ');
            return `O Mestre invocou: ${names}`;
        }
    },

    showMonsterSelector() {
        return new Promise(async (resolve, reject) => {
            // Load Data
            const systemId = this.activeSession?.systemId || 'dnd5e';
            const user = this.user;

            let systemMonsters = [];
            let userMonsters = [];

            try {
                // Fetch in parallel
                const [sys, usr] = await Promise.all([
                    DataModule.getGlobalMonsters(systemId),
                    user ? DataModule.getUserMonsters(user.uid, user.email) : []
                ]);
                systemMonsters = sys;
                userMonsters = usr;
            } catch (e) {
                logger.error("Erro ao carregar monstros:", e);
                alert("O grimório está inacessível no momento.");
                reject();
                return;
            }

            // Create Modal
            const modal = document.createElement('div');
            modal.className = 'modal-stage';
            modal.innerHTML = `
                <div class="modal-stage-content monster-selector-modal" style="max-width: 800px; height: 80vh; display: flex; flex-direction: column;">
                    <h3 style="flex-shrink: 0;"><i class="fas fa-dragon"></i> Invocação de Criaturas</h3>
                    
                    <div class="selector-controls" style="flex-shrink: 0; padding: 10px; border-bottom: 1px solid #333; display: flex; gap: 10px;">
                         <input type="text" id="monster-search" placeholder="Buscar criatura..." class="medieval-input" style="flex: 1;">
                         <button class="medieval-btn small" id="btn-ask-oracle"><i class="fas fa-eye"></i> Oráculo</button>
                    </div>

                    <div class="roll-tabs" style="flex-shrink: 0; margin-top: 10px;">
                        <button class="roll-tab active" data-tab="system-monsters">Sistema</button>
                        <button class="roll-tab" data-tab="my-monsters">Meus Monstros</button>
                    </div>

                    <div class="monster-list-container" style="flex: 1; overflow-y: auto; padding: 10px;">
                        <div id="list-system-monsters" class="monster-list active"></div>
                        <div id="list-my-monsters" class="monster-list"></div>
                    </div>

                    <div class="selected-monsters-bar" style="flex-shrink: 0; padding: 10px; border-top: 1px solid #333; min-height: 50px; display: flex; gap: 5px; flex-wrap: wrap;">
                        <span style="color: #888; font-size: 0.8rem; width: 100%;">Selecionados:</span>
                        <div id="selected-list" style="display: flex; gap: 5px; flex-wrap: wrap; width: 100%;"></div>
                    </div>

                    <div class="modal-actions" style="flex-shrink: 0; justify-content: flex-end; padding-top: 10px;">
                        <button class="medieval-btn" id="confirm-summon">Invocação</button>
                        <button class="medieval-btn secondary" id="cancel-summon">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            let selected = [];

            // Render Functions
            const renderList = (items, containerId) => {
                const container = modal.querySelector('#' + containerId);
                container.innerHTML = items.map(m => `
                    <div class="monster-row" data-id="${m.id}">
                        <span class="monster-name">${m.name}</span>
                        <span class="monster-cr">ND ${m.cr || m.secoes?.ND || '-'}</span>
                        <button class="add-btn"><i class="fas fa-plus"></i></button>
                    </div>
                `).join('');

                container.querySelectorAll('.add-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const row = e.target.closest('.monster-row');
                        const id = row.dataset.id;
                        const monster = items.find(m => m.id === id);
                        addSelection(monster);
                    });
                });
            };

            const addSelection = (monster) => {
                selected.push(monster);
                renderSelected();
            };

            const removeSelection = (index) => {
                selected.splice(index, 1);
                renderSelected();
            };

            const renderSelected = () => {
                const container = modal.querySelector('#selected-list');
                container.innerHTML = selected.map((m, idx) => `
                    <div class="selected-token" onclick="this.remove()" data-idx="${idx}">
                        ${m.name} <i class="fas fa-times"></i>
                    </div>
                `).join('');

                // Re-bind remove
                container.querySelectorAll('.selected-token').forEach(token => {
                    token.addEventListener('click', () => removeSelection(token.dataset.idx));
                });
            };

            // Initial Render
            renderList(systemMonsters, 'list-system-monsters');
            renderList(userMonsters, 'list-my-monsters');

            // Tabs
            modal.querySelectorAll('.roll-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    modal.querySelectorAll('.roll-tab').forEach(t => t.classList.remove('active'));
                    modal.querySelectorAll('.monster-list').forEach(l => l.classList.remove('active')); // CSS hidden toggle needed

                    tab.classList.add('active');
                    const target = modal.querySelector('#list-' + tab.dataset.tab);
                    target.classList.add('active');

                    // Toggle visibility manually since we used class 'active' for tabs but need display logic
                    modal.querySelectorAll('.monster-list').forEach(l => l.style.display = 'none');
                    target.style.display = 'block';
                });
            });
            // Force initial display
            modal.querySelector('#list-system-monsters').style.display = 'block';
            modal.querySelector('#list-my-monsters').style.display = 'none';

            // Filter
            modal.querySelector('#monster-search').addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filteredSys = systemMonsters.filter(m => m.name.toLowerCase().includes(term));
                const filteredUser = userMonsters.filter(m => m.name.toLowerCase().includes(term));
                renderList(filteredSys, 'list-system-monsters');
                renderList(filteredUser, 'list-my-monsters');
            });

            // Oracle
            const oracleBtn = modal.querySelector('#btn-ask-oracle');
            if (oracleBtn) {
                oracleBtn.addEventListener('click', async () => {
                    const promptText = prompt("Descreva o cenário para o Oráculo sugerir criaturas:");
                    if (!promptText) return;

                    // Placeholder for AI logic
                    alert("O Oráculo sussurra: 'Ainda estou aprendendo a ver além do véu...' (Em breve!)");
                });
            }


            // Confirm/Cancel
            modal.querySelector('#confirm-summon').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(selected);
            });

            modal.querySelector('#cancel-summon').addEventListener('click', () => {
                document.body.removeChild(modal);
                reject();
            });
        });
    },

    requestRoll() {
        if (!this.isGM) return;
        if (window.RollRequestModule) {
            window.RollRequestModule.openRequestModal();
        } else {
            logger.warn("RollRequestModule não carregado.");
        }
    },

    /**
     * Use AI to improve GM notes
     */
    async showMasterActionsPanel() {
        const modal = document.createElement('div');
        modal.className = 'modal-stage';
        const isManual = this.activeSession?.mode !== 'oracle';

        modal.innerHTML = `
            <div class="modal-stage-content master-actions">
                <h2><i class="fas fa-crown"></i> Ações do Mestre</h2>
                <p>O que você deseja manifestar nesta rodada da crônica?</p>
                
                <div class="master-actions-grid">
                    <div class="master-action-btn" id="m-btn-npc">
                        <i class="fas fa-user-plus"></i>
                        <span>Criar NPC</span>
                    </div>
                    <div class="master-action-btn" id="m-btn-combat">
                        <i class="fas fa-skull-crossbones"></i>
                        <span>Iniciar Combate</span>
                    </div>
                    <div class="master-action-btn" id="m-btn-roll">
                        <i class="fas fa-dice-d20"></i>
                        <span>Pedir Rolagem</span>
                    </div>
                </div>

                <div class="modal-actions-centered">
                    <button class="medieval-btn secondary" id="btn-close-master">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#m-btn-npc').addEventListener('click', () => {
            document.body.removeChild(modal);
            if (window.CombatPrep) window.CombatPrep.openPrepModal('npc');
        });
        modal.querySelector('#m-btn-combat').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.startCombat();
        });
        modal.querySelector('#m-btn-roll').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.requestRoll();
        });
        modal.querySelector('#btn-close-master').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    },

    async concludeChapter() {
        const confirmed = await this.showMysticConfirm(
            "Você está prestes a concluir as páginas deste capítulo. O estado atual será salvo e os heróis descansarão.",
            "Concluir Capítulo"
        );

        if (confirmed) {
            this.toggleLoading(true, "Registrando nos anais do tempo...");
            try {
                const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);
                const currentChapterIdx = this.currentChapterIdx || 0;

                // Update fullTimeline if it exists
                let updates = {
                    updatedAt: serverTimestamp()
                };

                if (this.activeSession.fullTimeline) {
                    const newTimeline = [...this.activeSession.fullTimeline];
                    if (newTimeline[currentChapterIdx]) {
                        newTimeline[currentChapterIdx].status = 'completed';
                        newTimeline[currentChapterIdx].concludedAt = new Date().toISOString();
                        newTimeline[currentChapterIdx].id = newTimeline[currentChapterIdx].id || `ch_${Date.now()}`;
                    }
                    updates.fullTimeline = newTimeline;
                }

                // 🛡️ REQUISITO: Marcar como concluído e LIMPAR ESTADO DE COMBATE
                updates.sessionStatus = 'concluded';
                updates.combatActive = false;
                updates.combatState = null;
                updates.linked_monsters = [];

                await updateDoc(sessionRef, updates);
                this.showMysticAlert("Capítulo concluído com sucesso. O destino está guardado.", "Jornada Registrada");

                // Opção de fechar após o alert
                setTimeout(() => window.close(), 3000);
            } catch (err) {
                logger.error("Erro ao concluir capítulo:", err);
                this.showMysticAlert("Falha ao registrar conclusão: " + err.message);
            } finally {
                this.toggleLoading(false);
            }
        }
    },




    async aiSummary() {
        if (!this.isGM) return;

        // Only use Oracle if session is in oracle mode
        if (this.activeSession.mode !== 'oracle') {
            this.showMysticAlert("Esta sessão está em modo manual.");
            return;
        }

        try {
            this.addSystemMessage('<i class="fas fa-scroll-old"></i> O Oráculo está compilando os ecos desta jornada...');
            const { default: OracleModule } = await import('./oracle.js');
            // Initialize Oracle with current session context
            OracleModule.sessionId = this.sessionId;
            OracleModule.sessionData = this.activeSession;

            await OracleModule.generateSummary();
        } catch (err) {
            logger.error("Falha ao gerar resumo:", err);
            this.showMysticAlert("O Oráculo falhou: " + err.message);
        }
    },

    // Player Actions
    async rollDice(formula = "1d20") {
        const roll = Math.floor(Math.random() * 20) + 1;
        this.lastRollResult = roll;
        const sender = this.characterData?.bio?.name || this.user.displayName || 'O Jogador';
        await this.addSystemMessage(`${sender} rolou **${roll}** (${formula})`);
    },

    async rollAttack(name, bonus, damage) {
        const d20 = Math.floor(Math.random() * 20) + 1;
        const bonusVal = parseInt(bonus) || 0;
        const total = d20 + bonusVal;
        const sender = this.characterData?.bio?.name || this.user.displayName || 'Guerreiro';

        let msg = `${sender} ataca com **${name}**! <i class="fas fa-swords"></i>\n`;
        msg += `Acerto: **${total}** (d20: ${d20} + ${bonusVal})`;
        if (d20 === 20) msg += ' <i class="fas fa-sparkles"></i> **CRÍTICO!**';
        if (d20 === 1) msg += ' <i class="fas fa-skull"></i> **FALHA CRÍTICA!**';

        if (damage) {
            msg += `\nDano Base: ${damage}`;
        }

        this.lastRollResult = total;
        await this.addSystemMessage(msg);
    },

    async useItem(itemName) {
        const sender = this.characterData?.bio?.name || this.user.displayName || 'Aventureiro';
        await this.addSystemMessage(`${sender} utilizou **${itemName}**.`);
    },

    async useMagic(spellName) {
        if (this.lastRollResult === undefined) {
            this.lastRollResult = Math.floor(Math.random() * 20) + 1;
            const sender = this.characterData?.bio?.name || this.user.displayName || 'Mago';
            await this.addSystemMessage(`${sender} rolou **${this.lastRollResult}** para conjurar.`);
        }
        const sender = this.characterData?.bio?.name || this.user.displayName || 'Mago';
        await this.addSystemMessage(`${sender} manifesta a magia **${spellName}** com resultado **${this.lastRollResult}**!`);
        this.lastRollResult = undefined;
    },

    async addSystemMessage(text) {
        try {
            const chatRef = collection(db, COLLECTIONS.SESSIONS, this.sessionId, COLLECTIONS.MESSAGES);
            await addDoc(chatRef, {
                text,
                senderId: "system",
                senderNickname: "Legado Arcano",
                role: "system",
                chapterIndex: Number(this.currentChapterIdx || 0),
                timestamp: serverTimestamp()
            });
        } catch (err) {
            console.error("Erro ao enviar mensagem de sistema:", err);
        }
    },

    // UI Helpers: Mystic Notifications
    showMysticAlert(message, title = "Aviso do Oráculo") {
        return new Promise((resolve) => {
            const modalHtml = `
                <div class="modal-stage alert-modal">
                    <div class="modal-stage-content mini parchment-mini">
                        <h2 class="medieval-title">${title}</h2>
                        <p class="mystic-msg">${message}</p>
                        <div class="modal-actions-centered">
                            <button class="medieval-btn" id="mystic-alert-ok">Entendido</button>
                        </div>
                    </div>
                </div>
            `;
            const container = document.getElementById('modal-container');
            if (container) {
                container.innerHTML = modalHtml;
                document.getElementById('mystic-alert-ok').addEventListener('click', () => {
                    container.innerHTML = "";
                    resolve(true);
                });
            } else {
                alert(message);
                resolve(true);
            }
        });
    },

    // --- Access Requests Management (GM/Owner) ---
    initAccessRequestListener() {
        if (!this.sessionId || this.requestUnsubscribe) return;

        console.log("👁️ Iniciando vigilância do Atrium (Solicitações de Acesso)");
        this.requestUnsubscribe = AccessRequestsModule.listenToRequests(this.sessionId, (requests) => {
            if (requests.length > 0) {
                this.displayAccessRequests(requests);
            } else {
                this.hideAccessRequests();
            }
        });
    },

    displayAccessRequests(requests) {
        let container = document.getElementById('access-requests-notif');
        if (!container) {
            container = document.createElement('div');
            container.id = 'access-requests-notif';
            container.className = 'access-requests-layer';
            document.body.appendChild(container);
        }

        const count = requests.length;
        container.innerHTML = `
            <div class="access-requests-badge parchment-mini">
                <i class="fas fa-door-open blink"></i>
                <span>${count} alma${count > 1 ? 's' : ''} batendo no Atrium</span>
                <button class="medieval-btn small" id="view-requests-btn">Ver</button>
            </div>
        `;

        document.getElementById('view-requests-btn').addEventListener('click', () => {
            this.showRequestsModal(requests);
        });
    },

    hideAccessRequests() {
        const container = document.getElementById('access-requests-notif');
        if (container) container.remove();
    },

    async showRequestsModal(requests) {
        const modalHtml = `
            <div class="modal-stage alert-modal">
                <div class="modal-stage-content parchment">
                    <h2 class="medieval-title">Solicitações de Entrada</h2>
                    <div class="requests-list">
                        ${requests.map(req => `
                            <div class="request-item">
                                <div class="request-info">
                                    <strong>${req.requesterNickname || req.requesterName}</strong>
                                    <span class="request-type">Aventureiro(a)</span>
                                </div>
                                <div class="request-actions">
                                    <button class="medieval-btn small" data-req-id="${req.id}" data-action="accept">Aceitar</button>
                                    <button class="medieval-btn small secondary" data-req-id="${req.id}" data-action="reject">Rejeitar</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-actions-centered">
                        <button class="medieval-btn" id="close-requests-modal">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.innerHTML = modalHtml;

            modalContainer.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.reqId;
                    const action = e.target.dataset.action;

                    if (action === 'accept') {
                        await AccessRequestsModule.acceptRequest(id);
                        this.showMysticAlert("Nova alma aceita na jornada!", "Acesso Concedido");
                    } else {
                        await AccessRequestsModule.rejectRequest(id);
                    }

                    modalContainer.innerHTML = "";
                });
            });

            document.getElementById('close-requests-modal').addEventListener('click', () => {
                modalContainer.innerHTML = "";
            });
        }
    },

    async deleteNPC(npcName) {
        if (!this.isGM) return;
        const confirmed = await this.showMysticConfirm(`Deseja remover ${npcName} do palco de aliados?`, "Eliminar Aliado");
        if (confirmed) {
            try {
                const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);
                // We need to check both 'allies' and 'sessionNPCs' arrays
                const newAllies = (this.activeSession.allies || []).filter(n => n.name !== npcName);
                const newSessionNPCs = (this.activeSession.sessionNPCs || []).filter(n => n.name !== npcName);

                await updateDoc(sessionRef, {
                    allies: newAllies,
                    sessionNPCs: newSessionNPCs,
                    updatedAt: serverTimestamp()
                });

                this.showMysticAlert(`${npcName} foi removido.`);
            } catch (err) {
                console.error("Erro ao deletar NPC:", err);
            }
        }
    },

    showMysticConfirm(message, title = "Decisão Necessária") {
        return new Promise((resolve) => {
            const modalHtml = `
                <div class="modal-stage alert-modal">
                    <div class="modal-stage-content mini parchment-mini">
                        <h2 class="medieval-title">${title}</h2>
                        <p class="mystic-msg">${message}</p>
                        <div class="modal-actions-centered">
                            <button class="medieval-btn" id="mystic-confirm-yes">Sim</button>
                            <button class="medieval-btn secondary" id="mystic-confirm-no">Não</button>
                        </div>
                    </div>
                </div>
            `;
            const container = document.getElementById('modal-container');
            if (container) {
                container.innerHTML = modalHtml;
                document.getElementById('mystic-confirm-yes').addEventListener('click', () => {
                    container.innerHTML = "";
                    resolve(true);
                });
                document.getElementById('mystic-confirm-no').addEventListener('click', () => {
                    container.innerHTML = "";
                    resolve(false);
                });
            } else {
                resolve(confirm(message));
            }
        });
    }
};

window.StageModule = StageModule;
document.addEventListener('DOMContentLoaded', () => StageModule.init());

export default StageModule;
