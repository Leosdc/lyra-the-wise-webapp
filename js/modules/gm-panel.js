/**
 * GMPanelModule (Painel do Mestre) — Barrel
 * Core panel logic, UI rendering, timeline, saga, content linking.
 *
 * Sub-modules:
 *  - gm-session.js  → Session start (manual/AI), context, create/edit modals
 *  - gm-invites.js  → Invitation send/cancel, listener, player sheet view
 */

import { db } from '../auth.js';
import { getAuth } from "firebase/auth";
import {
    collection, addDoc, getDocs, query, where,
    doc, getDoc, updateDoc, onSnapshot, serverTimestamp, setDoc, increment, deleteDoc
} from "firebase/firestore";
import { COLLECTIONS } from '../data.js';

import { createSessionMixin } from './gm-session.js';
import { createInvitesMixin } from './gm-invites.js';

export const GMPanelModule = {
    activeSession: null,
    unsubscribeInvites: null,
    unsubscribeSession: null,
    isEditing: false,

    init() {
        window.GMPanelModule = this;
        this.bindEvents();
    },

    bindEvents() {
        this.setupEventListeners();
        this.syncMiniMusic();

        // Toggle visibility/privacy
        document.getElementById('toggle-visibility-btn')?.addEventListener('click', () => this.toggleVisibility());

        // Save Story
        document.getElementById('save-gm-notes')?.addEventListener('click', () => this.saveStory());

        // Prolong Session
        document.getElementById('btn-prolong-session')?.addEventListener('click', () => this.prolongSession());

        // Session Summary
        const summaryBtn = document.getElementById('btn-session-summary');
        if (summaryBtn) summaryBtn.addEventListener('click', () => this.generateSessionSummary());

        // Auto-expand Summary Textarea
        const summaryDisplay = document.getElementById('session-summary-display');
        if (summaryDisplay) {
            summaryDisplay.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        }

        // Selection View Logic
        const selectionView = document.getElementById('gm-selection');
        if (selectionView) {
            selectionView.addEventListener('click', (e) => {
                const card = e.target.closest('.selection-card');
                if (!card) return;

                const action = card.dataset.action;
                if (action === 'new-journey') {
                    window.WizardModule.showSessionWizard(window.app, 'manual');
                } else if (action === 'past-records') {
                    window.app.switchView('sessoes');
                }
            });
        }

        // Edit Session Button
        const editBtn = document.getElementById('edit-session-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.openEditSessionModal());
        }

        // Confirm Metadata Update (Edit Title)
        const confirmMetadataBtn = document.getElementById('confirm-new-session-btn');
        if (confirmMetadataBtn) confirmMetadataBtn.addEventListener('click', () => this.confirmMetadataUpdate());

        // Enter Atrium Button (Unified Start/Enter)
        const enterBtn = document.getElementById('btn-enter-session');
        if (enterBtn) {
            enterBtn.addEventListener('click', () => {
                this.openSessionSelectModal('enter');
            });
        }

        // Custom Select Trigger
        document.getElementById('gm-session-select-trigger')?.addEventListener('click', () => {
            const container = document.getElementById('gm-session-select-container');
            const wrapper = document.getElementById('gm-session-select-options-wrapper');
            if (container && wrapper) {
                const isOpen = container.classList.toggle('open');
                wrapper.classList.toggle('hidden', !isOpen);
                if (isOpen) {
                    const list = document.getElementById('gm-session-select-options');
                    if (list) window.NavigationModule.updateDropdownScroll(list);
                }
            }
        });

        // Close custom select on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#gm-session-select-container')) {
                document.getElementById('gm-session-select-container')?.classList.remove('open');
                document.getElementById('gm-session-select-options-wrapper')?.classList.add('hidden');
            }
        });

        // Dropdown Scroll Listeners
        const sessionList = document.getElementById('gm-session-select-options');
        if (sessionList) {
            sessionList.addEventListener('scroll', () => window.NavigationModule.updateDropdownScroll(sessionList));
        }

        // Status Selector
        document.getElementById('gm-session-status-select')?.addEventListener('change', (e) => this.updateSessionStatus(e.target.value));
    },

    // --- Status & Story ---
    async updateSessionStatus(newStatus) {
        if (!this.activeSession) return;

        try {
            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            this.activeSession.status = newStatus;
            window.app.showAlert(`Estado da crônica atualizado: ${newStatus}`, "Destino Alterado");
        } catch (err) {
            console.error(err);
            window.app.showAlert("Falha ao atualizar o estado da sessão.");
        }
    },

    prolongSession() {
        const countInput = document.getElementById('prolong-session-count');
        const posSelect = document.getElementById('prolong-session-position');
        if (countInput) countInput.value = "1";
        if (posSelect) posSelect.value = "end";

        const modal = document.getElementById('gm-prolong-session-modal');
        if (modal) modal.classList.remove('hidden');
    },

    closeProlongModal() {
        document.getElementById('gm-prolong-session-modal')?.classList.add('hidden');
    },

    async confirmProlongSession() {
        if (!this.activeSession) return;

        const countInput = document.getElementById('prolong-session-count');
        const posSelect = document.getElementById('prolong-session-position');
        const count = parseInt(countInput?.value || "1");
        const position = posSelect?.value || "end";

        this.closeProlongModal();

        if (isNaN(count) || count <= 0) {
            window.app.showAlert("A quantidade de capítulos deve ser um número positivo.");
            return;
        }

        window.app.toggleLoading(true, "As parcas estão tecendo novos fios...");
        try {
            const { prolongTimelineWithLyra } = await import('../ai.js');
            const idToken = await getAuth().currentUser.getIdToken();
            const newSessions = await prolongTimelineWithLyra(this.activeSession, count, position, idToken);

            let updatedTimeline = this.activeSession.fullTimeline || [];
            if (position === 'start') {
                updatedTimeline = [...newSessions, ...updatedTimeline];
            } else if (position === 'middle') {
                const mid = Math.floor(updatedTimeline.length / 2);
                updatedTimeline.splice(mid, 0, ...newSessions);
            } else {
                updatedTimeline = [...updatedTimeline, ...newSessions];
            }

            updatedTimeline.forEach((s, i) => s.session = i + 1);

            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                fullTimeline: updatedTimeline,
                updatedAt: serverTimestamp()
            });

            this.activeSession.fullTimeline = updatedTimeline;
            this.renderTimeline(this.activeSession);
            window.app.showAlert(`${count} Novos capítulos foram registrados na cronologia.`, "Linha do Tempo Expandida");
        } catch (error) {
            console.error(error);
            window.app.showAlert("Falha ao expandir a cronologia: " + error.message);
        } finally {
            window.app.toggleLoading(false);
        }
    },

    async generateSessionSummary() {
        if (!this.activeSession) return;

        window.app.toggleLoading(true, "A Mente Arcana está sintetizando o destino...");
        try {
            const { summarizeSession } = await import('../ai.js');
            const idToken = await getAuth().currentUser.getIdToken();
            const summary = await summarizeSession(this.activeSession, idToken);

            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                summary: summary,
                updatedAt: serverTimestamp()
            });

            this.activeSession.summary = summary;
            this.showSummary(summary);
            window.app.showAlert("O resumo da crônica foi atualizado!", "Sucesso");
        } catch (error) {
            console.error(error);
            window.app.showAlert("Falha ao tecer o resumo.");
        } finally {
            window.app.toggleLoading(false);
        }
    },

    showSummary(summary) {
        const container = document.getElementById('session-summary-container');
        const display = document.getElementById('session-summary-display');
        if (container && display && summary) {
            container.classList.remove('hidden');
            display.value = summary;
            display.style.height = 'auto';
            display.style.height = (display.scrollHeight) + 'px';
        }
    },

    async handleAtriumEntry() {
        this.openSessionSelectModal('enter');
    },

    async toggleVisibility() {
        if (!this.activeSession) return;
        const btn = document.getElementById('toggle-visibility-btn');
        const isPublic = this.activeSession.visibility === 'public';
        const newVisibility = isPublic ? 'private' : 'public';

        try {
            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                visibility: newVisibility,
                updatedAt: serverTimestamp()
            });
            this.activeSession.visibility = newVisibility;

            if (btn) {
                btn.innerHTML = newVisibility === 'public' ?
                    '<i class="fas fa-eye"></i> PÚBLICO' :
                    '<i class="fas fa-eye-slash"></i> PRIVADO';
                btn.classList.toggle('secondary', newVisibility === 'private');
            }
            window.app.showAlert(`Sessão agora está ${newVisibility === 'public' ? 'Pública' : 'Privada'}.`);
        } catch (err) {
            console.error(err);
            window.app.showAlert("Falha ao alterar visibilidade.");
        }
    },

    createNewSession() {
        console.log("🕯️ Invocando o Mago do Destino...");
        window.WizardModule.showSessionWizard(window.app, 'manual');
    },

    async saveStory() {
        if (!this.activeSession) return;
        const textArea = document.getElementById('gm-story-editor') || document.getElementById('gm-story-input-central');
        if (!textArea) return;

        const newStory = textArea.value;
        window.app.toggleLoading(true, "Gravando nos anais...");

        try {
            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                story: newStory,
                updatedAt: serverTimestamp()
            });
            this.activeSession.story = newStory;
            window.app.showAlert("História salva com sucesso!", "Anais Atualizados");
        } catch (err) {
            console.error(err);
            window.app.showAlert("Falha ao salvar história.");
        } finally {
            window.app.toggleLoading(false);
        }
    },

    // --- Music ---
    setupEventListeners() {
        const miniBtn = document.getElementById('gm-mini-play-pause');
        if (miniBtn) {
            miniBtn.addEventListener('click', () => this.toggleMiniMusic());
        }

        const mainAudio = document.getElementById('lyra-bg-music');
        if (mainAudio) {
            mainAudio.addEventListener('play', () => this.syncMiniMusicState(true));
            mainAudio.addEventListener('pause', () => this.syncMiniMusicState(false));
        }
    },

    syncMiniMusic() {
        const mainAudio = document.getElementById('lyra-bg-music');
        if (mainAudio) {
            this.syncMiniMusicState(!mainAudio.paused);

            const nowPlaying = document.querySelector('.player-now-playing');
            const nowPlayingMini = document.querySelector('.music-name-mini');
            if (nowPlaying && nowPlayingMini) {
                nowPlayingMini.textContent = nowPlaying.textContent || "Melodia Arcana";
            }
        }
    },

    syncMiniMusicState(isPlaying) {
        const miniBtn = document.getElementById('gm-mini-play-pause');
        if (miniBtn) {
            const icon = miniBtn.querySelector('i');
            if (icon) {
                icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
            }
        }
    },

    toggleMiniMusic() {
        const mainAudio = document.getElementById('lyra-bg-music');
        const mainPlayPauseBtn = document.getElementById('btn-play-pause');

        if (mainAudio && mainPlayPauseBtn) {
            mainPlayPauseBtn.click();
        }
    },

    // --- Panel Loading ---
    async loadPanel(user, systemId) {
        if (!user) return;

        const systemDisplay = document.getElementById('active-system-display');
        if (systemDisplay) {
            const { SUPPORTED_SYSTEMS } = await import('../constants.js');
            const system = SUPPORTED_SYSTEMS.find(s => s.id === systemId);
            systemDisplay.innerText = system ? system.name : systemId.toUpperCase();
        }

        const q = query(
            collection(db, COLLECTIONS.SESSIONS),
            where("userId", "==", user.uid),
            where("systemId", "==", systemId),
            where("status", "in", ["active", "preparing"])
        );

        if (this.unsubscribeSession) this.unsubscribeSession();

        this.unsubscribeSession = onSnapshot(q, async (snapshot) => {
            if (!snapshot.empty) {
                // Se uma sessão específica já foi selecionada (ex: clique no card),
                // encontrar essa sessão no snapshot em vez de sempre pegar a primeira.
                let targetDoc = snapshot.docs[0];
                if (this.activeSession?.id) {
                    const found = snapshot.docs.find(d => d.id === this.activeSession.id);
                    if (found) targetDoc = found;
                }
                const sessionData = { id: targetDoc.id, ...targetDoc.data() };
                this.activeSession = sessionData;

                // Ensure GM is a participant (Idempotent)
                const invitesRef = collection(db, "session_invites");
                const selfInviteId = `self_${sessionData.id}_${user.uid}`;
                const selfInviteRef = doc(invitesRef, selfInviteId);
                const selfInviteSnap = await getDoc(selfInviteRef);

                if (!selfInviteSnap.exists()) {
                    console.log("🛠️ GMPanel: Adicionando mestre como participante automático...");
                    await setDoc(selfInviteRef, {
                        sessionId: sessionData.id,
                        email: user.email.toLowerCase(),
                        role: 'gm',
                        status: "online",
                        invitedAt: serverTimestamp(),
                        invitedBy: user.uid,
                        isSelfInvite: true
                    });
                }

                this.displayActiveSession(this.activeSession);

                // AUTO-REPAIR: Sync player count (exclude GM)
                const invitesSnap = await getDocs(query(collection(db, "session_invites"), where("sessionId", "==", sessionData.id)));
                const actualPlayers = invitesSnap.docs.filter(d => {
                    const data = d.data();
                    return data.role !== 'gm' && !d.id.startsWith('self_') && data.userId !== sessionData.userId;
                });
                const count = actualPlayers.length;
                if (count !== sessionData.currentPlayers) {
                    await updateDoc(doc(db, COLLECTIONS.SESSIONS, sessionData.id), { currentPlayers: count });
                }
            } else {
                this.activeSession = null;
                document.body.classList.remove('gm-panel-active');
                document.getElementById('no-active-session')?.classList.remove('hidden');
                document.getElementById('active-session-ui')?.classList.add('hidden');
            }
        }, (err) => {
            console.error("❌ Erro no listener da sessão ativa:", err);
        });
    },

    // --- Display ---
    displayActiveSession(session) {
        document.body.classList.add('gm-panel-active');
        document.getElementById('no-active-session').classList.add('hidden');
        document.getElementById('active-session-ui').classList.remove('hidden');
        document.getElementById('active-session-title').innerText = session.title || "Sessão Sem Título";

        const statusSelect = document.getElementById('gm-session-status-select');
        if (statusSelect) {
            statusSelect.value = session.status || "preparing";
        }

        const storyInput = document.getElementById('gm-story-input-central');
        if (storyInput) {
            storyInput.value = session.story || "";
            storyInput.readOnly = !!session.started;
            storyInput.classList.toggle('readonly-perchment', !!session.started);
        }

        const oracleSection = document.getElementById('oracle-summary-section');
        if (oracleSection) {
            oracleSection.classList.toggle('hidden', !session.started);

            const avatarImg = document.getElementById('oracle-avatar-img');
            if (avatarImg && window.app) {
                const theme = window.app.currentThemeName || 'lyra';
                const avatars = {
                    'lyra': 'assets/Lyra_the_wise.png',
                    'damien': 'assets/Damien_Kael.png',
                    'eldrin': 'assets/Eldrin_the_Bard.png'
                };
                avatarImg.src = avatars[theme] || avatars['lyra'];
            }

            // Fix text if available
            const oracleText = document.getElementById('oracle-summary-text');
            if (oracleText && session.summary) {
                oracleText.innerText = session.summary;
            }
        }

        if (session.started) {
            this.showStoryArea(session.story);
        } else {
            this.showStartOptions();
            if (session.story) {
                const storyArea = document.getElementById('gm-story-container');
                if (storyArea) storyArea.classList.remove('hidden');
            }
        }

        this.startInviteListener(session.id);
        this.renderSagaData(session);
        this.renderTimeline(session);
        this.showSummary(session.summary);
    },

    showStartOptions() {
        document.getElementById('gm-session-start-options').classList.remove('hidden');
        document.getElementById('gm-story-container').classList.add('hidden');
        const oracleSection = document.getElementById('oracle-summary-section');
        if (oracleSection) oracleSection.classList.add('hidden');
    },

    showStoryArea(storyContent = "") {
        document.getElementById('gm-session-start-options').classList.remove('hidden'); // KEEP BUTTON VISIBLE
        document.getElementById('gm-story-container').classList.remove('hidden');
        const storyArea = document.getElementById('gm-story-input-central');
        if (storyArea) {
            storyArea.value = storyContent;
            storyArea.readOnly = true;
            storyArea.classList.add('readonly-perchment');
        }
    },

    // --- Timeline & Saga ---
    renderTimeline(session) {
        const track = document.getElementById('gm-timeline-track');
        const container = document.getElementById('gm-timeline-summary');

        if (!track || !container) return;

        if (!session.fullTimeline || session.fullTimeline.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        track.innerHTML = '';

        session.fullTimeline.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'timeline-card';
            card.onclick = () => this.showChapterDetail(index);

            const sessionNum = item.session || (index + 1);
            const title = item.title || `Sessão ${sessionNum}`;
            const summary = item.summary || item.description || "Sem registro nos anais.";

            card.innerHTML = `
                <div class="timeline-card-header">
                    <span class="timeline-session-number">Sessão ${sessionNum}</span>
                    ${item.status === 'completed' ? '<i class="fas fa-flag-checkered" style="color:var(--gold); font-size: 0.8rem;" title="Concluída"></i>' : ''}
                </div>
                <div class="timeline-card-title">${title}</div>
                <div class="timeline-card-summary">${summary}</div>
            `;

            track.appendChild(card);
        });
    },

    openChoiceModal() {
        const modal = document.getElementById('gm-session-create-modal');
        if (modal) modal.classList.add('hidden'); // Close create modal if open

        window.app.showChoiceModal(
            "Mestrear com auxílio do Oráculo (IA) ou seguir sua própria trilha (Manual)?",
            [
                { text: "Modo Oráculo (IA)", action: () => this.startSessionAI(), primary: true },
                { text: "Modo Manual", action: () => this.startSessionManual() }
            ],
            "assets/tokens/lyra.png"
        );
    },

    renderSagaData(session) {
        const container = document.getElementById('gm-saga-data');
        if (!container) return;

        const fields = [
            { id: 'hook', label: 'Gancho', icon: 'fa-anchor' },
            { id: 'goal', label: 'Objetivo', icon: 'fa-bullseye' },
            { id: 'locations', label: 'Locais', icon: 'fa-map-marked-alt' },
            { id: 'npcs', label: 'NPCs', icon: 'fa-users' },
            { id: 'threats', label: 'Ameaças', icon: 'fa-skull-crossbones' },
            { id: 'encounters', label: 'Encontros', icon: 'fa-swords' },
            { id: 'climax', label: 'Clímax', icon: 'fa-fire' },
            { id: 'treasure', label: 'Tesouros', icon: 'fa-coins' },
            { id: 'resolution', label: 'Resolução', icon: 'fa-scroll' },
            { id: 'atmosphere', label: 'Atmosfera', icon: 'fa-wind' }
        ];

        let html = '';
        fields.forEach(field => {
            let val = session[field.id];
            if (val && val.trim()) {
                const formattedVal = val
                    .replace(/,\s*(\d+\.)/g, '$1')
                    .replace(/(\d+\.\s)/g, (match, p1, offset) => {
                        return offset === 0 ? match : `<br>${match}`;
                    });

                html += `
                    <div class="saga-item">
                        <div class="saga-label">
                            <i class="fas ${field.icon}"></i>
                            <span>${field.label}</span>
                        </div>
                        <div class="saga-content">${formattedVal}</div>
                    </div>
                `;
            }
        });

        if (!html) {
            html = `
                <div class="saga-item empty">
                    <i class="fas fa-feather-pointed"></i>
                    <p>Nenhum detalhe adicional narrado ainda.</p>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    showChapterDetail(index) {
        if (!this.activeSession || !this.activeSession.fullTimeline) return;
        const chapter = this.activeSession.fullTimeline[index];
        if (!chapter) return;

        const modal = document.getElementById('gm-chapter-detail-modal');
        const content = document.getElementById('gm-chapter-detail-content');
        const title = document.getElementById('gm-chapter-detail-title');

        if (!modal || !content) return;

        const sessionNum = chapter.session || (index + 1);
        title.innerHTML = `<i class="fas fa-scroll"></i> Capítulo ${sessionNum}: ${chapter.title || "Sem Título"}`;

        const fields = [
            { label: 'Resumo', val: chapter.summary || chapter.description, icon: 'fa-feather-alt' },
            { label: 'Gancho', val: chapter.hook, icon: 'fa-anchor' },
            { label: 'Objetivo', val: chapter.goal, icon: 'fa-bullseye' },
            { label: 'Locais', val: chapter.locations, icon: 'fa-map-marked-alt' },
            { label: 'NPCs', val: chapter.npcs, icon: 'fa-users' },
            { label: 'Ameaças', val: chapter.threats, icon: 'fa-skull-crossbones' },
            { label: 'Encontros', val: chapter.encounters, icon: 'fa-swords' },
            { label: 'Clímax', val: chapter.climax, icon: 'fa-fire' },
            { label: 'Tesouro', val: chapter.treasure, icon: 'fa-coins' }
        ];

        let detailHtml = '';
        fields.forEach(f => {
            if (f.val) {
                const formattedVal = f.val
                    .replace(/,\s*(\d+\.)/g, '$1')
                    .replace(/(\d+\.\s)/g, (match, p1, offset) => {
                        return offset === 0 ? match : `<br>${match}`;
                    });
                detailHtml += `
                    <div class="saga-field" style="margin-bottom: 15px; border-bottom: 1px solid rgba(212,175,55,0.1); padding-bottom: 10px;">
                        <div class="field-label" style="font-weight: bold; color: var(--gold);"><i class="fas ${f.icon}"></i> ${f.label}</div>
                        <div class="field-content" style="margin-top: 5px;">${formattedVal}</div>
                    </div>
                `;
            }
        });

        content.innerHTML = detailHtml || '<p class="empty-msg">Nenhum detalhe registrado para este capítulo.</p>';
        modal.classList.remove('hidden');
    },

    // --- Content Linking ---
    async filterSearch(type, queryText) {
        if (!queryText || queryText.length < 2) {
            this.renderLinkedContent();
            return;
        }

        const containerId = type === 'item' ? 'gm-treasure-list' : `gm-${type}-list`;
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const { getModuleItems, COLLECTIONS, getUserMonsters, getGlobalMonsters, getGlobalItems, getUserItems, getUserNPCs } = await import('../data.js');
            let items = [];
            const userId = getAuth().currentUser.uid;
            const systemId = window.app.currentSystem;

            switch (type) {
                case 'npc':
                    items = await getUserNPCs(userId, getAuth().currentUser.email);
                    break;
                case 'monster':
                    const globals = await getGlobalMonsters(systemId);
                    const users = await getUserMonsters(userId, getAuth().currentUser.email);
                    items = [...globals, ...users];
                    break;
                case 'item':
                    const gItems = await getGlobalItems(systemId);
                    const uItems = await getUserItems(userId, getAuth().currentUser.email);
                    const tItems = await getModuleItems(COLLECTIONS.TREASURES, userId, systemId);
                    items = [...gItems, ...uItems, ...tItems];
                    break;
                case 'encounter':
                    items = await getModuleItems(COLLECTIONS.ENCOUNTERS, userId, systemId);
                    break;
                case 'campaign':
                    items = await getModuleItems(COLLECTIONS.CAMPAIGNS, userId, systemId);
                    break;
                case 'plot':
                    items = await getModuleItems(COLLECTIONS.PLOTS, userId, systemId);
                    break;
                case 'scene':
                    items = await getModuleItems(COLLECTIONS.SCENES, userId, systemId);
                    break;
                case 'motivation':
                    items = await getModuleItems(COLLECTIONS.MOTIVATIONS, userId, systemId);
                    break;
            }

            const linkedKey = `linked_${type}s`;
            const linkedIds = this.activeSession[linkedKey] || [];

            const filtered = items.filter(item =>
                (item.name || item.title || "").toLowerCase().includes(queryText.toLowerCase())
            ).slice(0, 15);

            if (filtered.length === 0) {
                container.innerHTML = `<p class="empty-state">Nenhum resultado.</p>`;
                return;
            }

            container.innerHTML = filtered.map(item => {
                const isLinked = linkedIds.includes(item.id);
                return `
                <div class="mini-card searchable ${isLinked ? 'already-linked' : ''}" 
                     onclick="GMPanelModule.linkContent('${type}', '${item.id}')">
                    <i class="fas ${this.getIconForType(type)}"></i>
                    <span>${(item.name || item.title || "").substring(0, 18)}</span>
                    ${isLinked ? '<i class="fas fa-check-circle linked-badge"></i>' : ''}
                </div>
            `;
            }).join('');
        } catch (err) {
            console.error("Erro na busca:", err);
        }
    },

    getIconForType(type) {
        switch (type) {
            case 'npc': return 'fa-user-shield';
            case 'item': return 'fa-gem';
            case 'monster': return 'fa-dragon';
            case 'encounter': return 'fa-shield';
            case 'campaign': return 'fa-map-location-dot';
            case 'plot': return 'fa-wand-magic-sparkles';
            case 'scene': return 'fa-image';
            case 'motivation': return 'fa-heart-pulse';
            default: return 'fa-scroll';
        }
    },

    async linkContent(type, itemId) {
        if (!this.activeSession) return;

        const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
        const linkedKey = `linked_${type}s`;

        const currentLinks = this.activeSession[linkedKey] || [];
        if (!currentLinks.includes(itemId)) {
            currentLinks.push(itemId);
            await updateDoc(sessionRef, { [linkedKey]: currentLinks });
            this.activeSession[linkedKey] = currentLinks;
            window.app.showAlert("Vinculado à sessão!", "Sucesso");

            this.renderLinkedContent();

            document.querySelectorAll('#gm-sidebar-left .search-input').forEach(input => {
                input.value = '';
            });
        } else {
            window.app.showAlert("Já está vinculado.");
        }
    },

    async unlinkContent(type, itemId) {
        if (!this.activeSession) return;

        const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
        const linkedKey = `linked_${type}s`;

        let currentLinks = this.activeSession[linkedKey] || [];
        currentLinks = currentLinks.filter(id => id !== itemId);

        await updateDoc(sessionRef, { [linkedKey]: currentLinks });
        this.activeSession[linkedKey] = currentLinks;

        window.app.showAlert("Removido da sessão.", "Sucesso");
        this.renderLinkedContent();
    },

    async renderMiniList(type, containerId, linkedOnly = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const linkedKey = `linked_${type}s`;
        const ids = this.activeSession ? (this.activeSession[linkedKey] || []) : [];

        if (linkedOnly && ids.length === 0) {
            container.innerHTML = `<p class="empty-state">Nada vinculado.</p>`;
            return;
        }

        try {
            const { getModuleItems, COLLECTIONS, getUserMonsters, getGlobalMonsters, getGlobalItems, getUserItems, getUserNPCs } = await import('../data.js');
            let allItems = [];
            const userId = getAuth().currentUser.uid;
            const systemId = window.app.currentSystem;

            switch (type) {
                case 'npc':
                    allItems = await getUserNPCs(userId, getAuth().currentUser.email);
                    break;
                case 'monster':
                    const globals = await getGlobalMonsters(systemId);
                    const users = await getUserMonsters(userId, getAuth().currentUser.email);
                    allItems = [...globals, ...users];
                    break;
                case 'item':
                    const gItems = await getGlobalItems(systemId);
                    const uItems = await getUserItems(userId, getAuth().currentUser.email);
                    const tItems = await getModuleItems(COLLECTIONS.TREASURES, userId, systemId);
                    allItems = [...gItems, ...uItems, ...tItems];
                    break;
                case 'encounter':
                    allItems = await getModuleItems(COLLECTIONS.ENCOUNTERS, userId, systemId);
                    break;
                case 'campaign':
                    allItems = await getModuleItems(COLLECTIONS.CAMPAIGNS, userId, systemId);
                    break;
                case 'plot':
                    allItems = await getModuleItems(COLLECTIONS.PLOTS, userId, systemId);
                    break;
                case 'scene':
                    allItems = await getModuleItems(COLLECTIONS.SCENES, userId, systemId);
                    break;
                case 'motivation':
                    allItems = await getModuleItems(COLLECTIONS.MOTIVATIONS, userId, systemId);
                    break;
            }

            const items = allItems.filter(i => ids.includes(i.id));
            console.log(`[MiniList:${type}] Total=${allItems.length}, IDs Linked=${ids.length}, Match=${items.length}`, { ids, itemIds: allItems.map(i => i.id) });

            container.innerHTML = items.map(item => `
                <div class="mini-card linked" title="${item.name || item.title}">
                    <i class="fas ${this.getIconForType(type)}"></i>
                    <span>${(item.name || item.title).substring(0, 18)}</span>
                    <button class="btn-unlink" onclick="event.stopPropagation(); GMPanelModule.unlinkContent('${type}', '${item.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        } catch (err) {
            console.error(`Erro ao carregar lista mini (${type}):`, err);
        }
    },

    // --- Session Selection & Switching ---
    async openSessionSelectModal(mode = 'switch') {
        const modal = document.getElementById('gm-session-select-modal');
        const container = document.getElementById('gm-session-select-container');
        const optionsList = document.getElementById('gm-session-select-options');
        const textDisplay = document.getElementById('gm-session-select-text');
        const hiddenValue = document.getElementById('gm-session-select-value');
        const confirmBtn = document.getElementById('gm-session-select-confirm');
        const title = modal?.querySelector('.modal-title');

        if (!modal || !optionsList || !confirmBtn) return;

        container?.classList.remove('open');
        document.getElementById('gm-session-select-options-wrapper')?.classList.add('hidden');
        if (textDisplay) textDisplay.textContent = "Consultando os anais...";
        if (hiddenValue) hiddenValue.value = "";

        if (title) {
            title.innerHTML = mode === 'enter'
                ? '<i class="fas fa-scroll"></i> ESCOLHER CAPÍTULO'
                : '<i class="fas fa-exchange-alt"></i> ALTERNAR CRÔNICA';
        }

        modal.classList.remove('hidden');
        optionsList.innerHTML = '<div class="custom-select-option">Consultando os anais...</div>';

        const selectOption = (val, label) => {
            if (textDisplay) textDisplay.textContent = label;
            if (hiddenValue) hiddenValue.value = val;
            container?.classList.remove('open');
            document.getElementById('gm-session-select-options-wrapper')?.classList.add('hidden');
        };

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // CASE A: Entering Atrium (Chapter Selection from Active Session)
        if (mode === 'enter' && this.activeSession && this.activeSession.fullTimeline) {
            if (textDisplay) textDisplay.textContent = "Selecione um capítulo da trilha...";

            let optionsHtml = '';
            this.activeSession.fullTimeline.forEach((item, index) => {
                const sessionNum = item.session || (index + 1);
                const itemTitle = item.title || `Sessão ${sessionNum}`;
                optionsHtml += `<div class="custom-select-option" data-value="${index}">Sessão ${sessionNum}: ${itemTitle}</div>`;
            });
            optionsList.innerHTML = optionsHtml;

            optionsList.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.addEventListener('click', () => selectOption(opt.dataset.value, opt.textContent));
            });

            newConfirmBtn.addEventListener('click', () => {
                const selectedIndex = hiddenValue.value;
                if (selectedIndex !== "") {
                    this.switchSession(this.activeSession.id, 'enter', selectedIndex);
                } else {
                    window.app.showAlert("Selecione um capítulo antes de prosseguir.");
                }
            });
            return;
        }

        // CASE B: Switching Saga (Top-level Session Selection)
        try {
            const user = getAuth().currentUser;
            const systemId = window.app.currentSystem;

            const q = query(
                collection(db, COLLECTIONS.SESSIONS),
                where("userId", "==", user.uid),
                where("systemId", "==", systemId),
                where("status", "in", ["active", "preparing"])
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                optionsList.innerHTML = '<div class="custom-select-option">Nenhuma trilha encontrada.</div>';
                if (textDisplay) textDisplay.textContent = "Nenhuma trilha encontrada.";
                return;
            }

            if (textDisplay) textDisplay.textContent = "Escolha uma crônica...";
            let optionsHtml = '';
            snapshot.docs.forEach((docSnap, index) => {
                const data = docSnap.data();
                const isActive = mode === 'switch' && this.activeSession && this.activeSession.id === docSnap.id;
                optionsHtml += `
                    <div class="custom-select-option ${isActive ? 'disabled' : ''}" data-value="${docSnap.id}">
                        ${index + 1}. ${data.title || "Sem Título"}
                    </div>`;
            });
            optionsList.innerHTML = optionsHtml;

            optionsList.querySelectorAll('.custom-select-option:not(.disabled)').forEach(opt => {
                opt.addEventListener('click', () => selectOption(opt.dataset.value, opt.textContent));
            });

            newConfirmBtn.addEventListener('click', () => {
                const selectedId = hiddenValue.value;
                if (selectedId) {
                    this.switchSession(selectedId, mode);
                } else {
                    window.app.showAlert("Selecione um destino antes de prosseguir.");
                }
            });

        } catch (err) {
            console.error(err);
            optionsList.innerHTML = '<div class="custom-select-option">Erro ao carregar os anais.</div>';
            if (textDisplay) textDisplay.textContent = "Erro de conexão astral.";
        }
    },

    closeSessionSelectModal() {
        document.getElementById('gm-session-select-modal')?.classList.add('hidden');
    },

    async switchSession(sessionId, mode = 'switch', chapterIndex = null) {
        this.closeSessionSelectModal();

        if (mode === 'enter') {
            window.app.toggleLoading(true, "Abrindo os portões do Atrium...");
            try {
                const qInvites = query(collection(db, "session_invites"), where("sessionId", "==", sessionId));
                const snapshotInvites = await getDocs(qInvites);
                const participants = snapshotInvites.docs.map(d => d.data());
                const gmEmail = getAuth().currentUser.email.toLowerCase();

                const withoutSheet = participants.filter(p =>
                    p.email.toLowerCase() !== gmEmail &&
                    p.role !== 'gm' &&
                    !p.characterId
                );

                if (withoutSheet.length > 0) {
                    window.app.showAlert(`Faltam aventureiros escolherem suas fichas (${withoutSheet.length} pendentes).`, "Acesso Negado");
                    return;
                }

                localStorage.setItem('lyra_active_session', sessionId);

                let finalIdx = chapterIndex;
                if (chapterIndex === null) {
                    const sessionDoc = await getDoc(doc(db, COLLECTIONS.SESSIONS, sessionId));
                    if (sessionDoc.exists()) {
                        const data = sessionDoc.data();
                        const uncompleted = (data.fullTimeline || []).findIndex(ch => ch.status !== 'completed');
                        finalIdx = uncompleted !== -1 ? uncompleted : 0;
                    } else {
                        finalIdx = 0;
                    }
                } else {
                    finalIdx = parseInt(chapterIndex, 10);
                    if (isNaN(finalIdx)) finalIdx = 0;
                }

                const targetIdx = Number(finalIdx || 0);

                const sessRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
                await updateDoc(sessRef, {
                    activeChapterIndex: targetIdx,
                    sessionStatus: 'active',
                    updatedAt: serverTimestamp()
                });

                localStorage.setItem('lyra_active_session', sessionId);
                localStorage.setItem('lyra_active_chapter', targetIdx);
                window.open(`session-stage.html?id=${sessionId}&chapter=${targetIdx}`, '_blank');
            } catch (err) {
                console.error(err);
                window.app.showAlert("Erro ao validar acesso à sessão.");
            } finally {
                window.app.toggleLoading(false);
            }
            return;
        }

        window.app.toggleLoading(true, "Alternando entre realidades...");
        try {
            const docRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                if (this.unsubscribeInvites) this.unsubscribeInvites();

                this.activeSession = { id: snap.id, ...snap.data() };
                this.displayActiveSession(this.activeSession);
                window.app.showAlert("Saindo de uma trilha e entrando em outra...", "Realidade Alternada");
            }
        } catch (err) {
            console.error(err);
            window.app.showAlert("Falha ao alternar sessão.");
        } finally {
            window.app.toggleLoading(false);
        }
    }
};

// ── Mix in sub-module methods ──
Object.assign(GMPanelModule, createSessionMixin(GMPanelModule));
Object.assign(GMPanelModule, createInvitesMixin(GMPanelModule));

window.GMPanelModule = GMPanelModule;
