/**
 * Atrium Arcano - Session Stage Module (Barrel)
 * Handles real-time gameplay, narrative oracle, and synchronized chat.
 * 
 * Sub-modules:
 *  - session/stage-chat.js    → Chat, messages, narrative editor, inline handlers
 *  - session/stage-sync.js    → Real-time Firestore sync, presence, allied data
 *  - session/stage-combat.js  → Combat initiation, tracker, monster selector, conclude chapter
 *  - session/stage-actions.js → Sidebar actions, player actions, master panel, access requests, UI helpers
 */

import { logger } from "../logger.js";
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
    where,
    getDocs,
    setDoc,
    addDoc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { narrateCharacterEntry } from "../ai.js";
import RollRequestModule from "./roll-request.js";
import HeroActions from "./hero-actions.js";
import CombatPrep from "./combat-prep.js";

// Sub-module mixins
import { createChatMixin } from "./session/stage-chat.js";
import { createSyncMixin } from "./session/stage-sync.js";
import { createCombatMixin } from "./session/stage-combat.js";
import { createActionsMixin } from "./session/stage-actions.js";

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

        const isInvalidId = (id) => !id || id === 'undefined' || id === 'null' || id.trim() === '';

        if (!isInvalidId(idFromUrl)) {
            localStorage.setItem('lyra_active_session', idFromUrl);
            this.sessionId = idFromUrl;
            logger.debug("StageModule: ID sincronizado do URL:", this.sessionId);
        } else {
            const fallbackId = localStorage.getItem('lyra_active_session');
            if (!isInvalidId(fallbackId)) {
                this.sessionId = fallbackId;
                logger.debug("StageModule: ID recuperado do Cofre Arcano (localStorage):", this.sessionId);
            }
        }

        // Chapter Detection
        const chapterVal = params.get('chapter') || params.get('session');
        if (chapterVal !== null) {
            this.currentChapterIdx = parseInt(chapterVal, 10) || 0;
            logger.info("StageModule: Capítulo sintonizado do URL:", this.currentChapterIdx);
        } else {
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
                    logger.info("StageModule: Alma sincronizada com sucesso no Atrium.");

                    this.toggleLoading(true, "Sincronizando com o Atrium Arcano...");

                    await this.checkParticipantStatus();

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

                    this.renderSidebarActions();
                    this.renderSessionUI();
                    this.bindEvents();
                    this.setupRealtimeSync();
                    this.setupPresenceSync();
                    this.updatePresence("online");

                    const chatContainer = document.getElementById('session-messages');
                    if (chatContainer) {
                        chatContainer.addEventListener('scroll', () => this.updateScrollIndicators());
                        this.updateScrollIndicators();
                    }

                    logger.info(`✅ Session Stage inicializado para sessão ${this.sessionId}`);

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
        } else {
            logger.warn("RollRequestModule não carregado.");
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
                const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);
                const sessionSnap = await getDoc(sessionRef);

                if (sessionSnap.exists()) {
                    const sessionData = sessionSnap.data();
                    logger.debug(`[StageModule] Verificando GM: SessãoOwner=${sessionData.userId}, User=${this.user.uid}, Mode=${sessionData.mode}`);

                    const isSessionOwner = String(sessionData.userId) === String(this.user.uid);

                    if (isSessionOwner) {
                        this.isGM = true;
                        this.activeSession = { id: sessionSnap.id, ...sessionData };
                        logger.info("StageModule: Mestre Absoluto identificado. Acesso concedido.");

                        const selfInviteId = `gm_${this.sessionId}_${this.user.uid}`;
                        const inviteRef = doc(collection(db, "session_invites"), selfInviteId);

                        await setDoc(inviteRef, {
                            sessionId: this.sessionId,
                            email: this.user.email.toLowerCase(),
                            status: "online",
                            uid: this.user.uid,
                            role: 'gm',
                            characterId: null,
                            characterName: 'Mestre da Saga',
                            invitedAt: serverTimestamp(),
                            lastSeen: serverTimestamp()
                        }, { merge: true });

                        this.participantId = selfInviteId;
                        this.initAccessRequestListener();
                        return;
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

            if (!this.activeSession) {
                const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.sessionId);
                const sessionSnap = await getDoc(sessionRef);
                if (sessionSnap.exists()) {
                    this.activeSession = { id: sessionSnap.id, ...sessionSnap.data() };
                }
            }

            if (this.activeSession && String(this.activeSession.userId) === String(this.user.uid)) {
                this.isGM = true;
                logger.info("StageModule: Mestre identificado via invite existente.");
                return;
            }

            if (!this.isGM && !participant.characterId) {
                await this.showCharacterSelection();
            } else {
                const charRef = doc(db, "fichas", participant.characterId);

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

        const { escapeHTML } = await import('./utils.js');
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

            if (this.activeSession?.mode !== 'oracle') {
                this.addSystemMessage(`${this.user.displayName || "Um viajante"} manifestou-se como ${charName}.`);
            }

            try {
                const { getCharacter } = await import('../data.js');
                this.characterData = await getCharacter(charId);
                this.renderSidebarActions();

                if (this.activeSession?.mode === 'oracle') {
                    logger.info("🧩 Solicitando entrada épica ao Oráculo para:", charName);

                    const historyQuery = query(
                        collection(db, COLLECTIONS.SESSIONS, this.sessionId, COLLECTIONS.MESSAGES),
                        where("type", "==", "oracle"),
                        orderBy("timestamp", "desc"),
                        limit(10)
                    );
                    const historySnap = await getDocs(historyQuery);
                    const alreadyNarrated = historySnap.docs.some(d => d.data().text?.includes(charName));

                    if (!alreadyNarrated) {
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

        // Footer Actions
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

    // Duplicate useMagic at line 1202 is overridden by the mixin from stage-actions.js
    // (the original had two useMagic definitions; the mixin one is authoritative)

    async extendNarrative() {
        if (!this.isGM) return;
        // Delegate to AI extend functionality
        try {
            const token = await this.user.getIdToken();
            const result = await extendSessionStory(
                this.activeSession,
                this.currentChapterIdx,
                this.lastMessages,
                token
            );
            if (result) {
                this.addSystemMessage(result);
            }
        } catch (err) {
            logger.error("Erro ao estender narrativa:", err);
            this.showMysticAlert("O Oráculo falhou ao tecer o destino: " + err.message);
        }
    }
};

// ── Mix in sub-module methods ──
Object.assign(StageModule, createChatMixin(StageModule));
Object.assign(StageModule, createSyncMixin(StageModule));
Object.assign(StageModule, createCombatMixin(StageModule));
Object.assign(StageModule, createActionsMixin(StageModule));

window.StageModule = StageModule;
document.addEventListener('DOMContentLoaded', () => StageModule.init());

export default StageModule;
