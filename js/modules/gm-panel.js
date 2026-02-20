import { db } from '../auth.js';
import { getAuth } from "firebase/auth";
import {
    collection, addDoc, getDocs, query, where,
    doc, getDoc, updateDoc, onSnapshot, serverTimestamp, setDoc, increment, deleteDoc
} from "firebase/firestore";
import { COLLECTIONS } from '../data.js';

/**
 * GMPanelModule (Painel do Mestre)
 * Manages game sessions, story notes, and player invitations.
 */

export const GMPanelModule = {
    activeSession: null,
    unsubscribeInvites: null,
    isEditing: false,

    init() {
        window.GMPanelModule = this; // Expose globally
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

        // Session START Buttons (Inside Active Panel)
        // REMOVED: btn-start-manual and btn-start-ai (mode is set at creation now)
        // Only keep btn-enter-session for direct Atrium access

        const enterBtn = document.getElementById('btn-enter-session');
        if (enterBtn) enterBtn.addEventListener('click', () => this.handleAtriumEntry());

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

        // Status Selector & Enter Atrium
        document.getElementById('gm-session-status-select')?.addEventListener('change', (e) => this.updateSessionStatus(e.target.value));
        document.getElementById('btn-enter-atrium')?.addEventListener('click', () => {
            if (this.activeSession) {
                // 🛡️ Always open selection modal to confirm destination (Fixes Chapter 1/Legacy access)
                this.openSessionSelectModal('enter');
            }
        });
    },

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
        // Reset form to defaults
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

            // Re-index session numbers
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

            // Trigger auto-expand programmatically
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
        const textArea = document.getElementById('gm-story-editor');
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

            // Sync current track name from main player
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
            mainPlayPauseBtn.click(); // Reuse existing logic in main player
        }
    },

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
                const sessionData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
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

    displayActiveSession(session) {
        document.body.classList.add('gm-panel-active');
        document.getElementById('no-active-session').classList.add('hidden');
        document.getElementById('active-session-ui').classList.remove('hidden');
        document.getElementById('active-session-title').innerText = session.title || "Sessão Sem Título";

        // Initialize Status Selector
        const statusSelect = document.getElementById('gm-session-status-select');
        if (statusSelect) {
            statusSelect.value = session.status || "preparing";
        }

        const storyInput = document.getElementById('gm-story-input-central');
        if (storyInput) {
            storyInput.value = session.story || "";
            // Intro becomes static (readonly) after session starts
            storyInput.readOnly = !!session.started;
            storyInput.classList.toggle('readonly-perchment', !!session.started);
        }

        const oracleSection = document.getElementById('oracle-summary-section');
        if (oracleSection) {
            oracleSection.classList.toggle('hidden', !session.started);

            // Dynamic Avatar based on Theme
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
        }

        // Check if session has explicitly started
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
        document.getElementById('gm-session-start-options').classList.add('hidden');
        document.getElementById('gm-story-container').classList.remove('hidden');
        const storyArea = document.getElementById('gm-story-input-central');
        if (storyArea) {
            storyArea.value = storyContent;
            storyArea.readOnly = true;
            storyArea.classList.add('readonly-perchment');
        }
    },

    renderTimeline(session) {
        const track = document.getElementById('gm-timeline-track');
        const container = document.getElementById('gm-timeline-summary');

        if (!track || !container) return;

        if (!session.fullTimeline || session.fullTimeline.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        track.innerHTML = ''; // Clear previous

        session.fullTimeline.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'timeline-card';
            card.onclick = () => this.showChapterDetail(index);

            // Format check: AI sometimes returns different structures
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
                // Formatting improvement: Detect numbered lists (1. ... 2. ...) and ensure they are on new lines
                // We also replace commas immediately preceding a new number (e.g., ",2." -> "\n2.")
                const formattedVal = val
                    .replace(/,\s*(\d+\.)/g, '$1') // Remove commas between numbered items
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

        let html = '';
        fields.forEach(f => {
            if (f.val) {
                const formattedVal = f.val
                    .replace(/,\s*(\d+\.)/g, '$1') // Remove commas between items
                    .replace(/(\d+\.\s)/g, (match, p1, offset) => {
                        return offset === 0 ? match : `<br>${match}`;
                    });
                html += `
                    <div class="saga-field" style="margin-bottom: 15px; border-bottom: 1px solid rgba(212,175,55,0.1); padding-bottom: 10px;">
                        <div class="field-label" style="font-weight: bold; color: var(--gold);"><i class="fas ${f.icon}"></i> ${f.label}</div>
                        <div class="field-content" style="margin-top: 5px;">${formattedVal}</div>
                    </div>
                `;
            }
        });

        content.innerHTML = html || '<p class="empty-msg">Nenhum detalhe registrado para este capítulo.</p>';
        modal.classList.remove('hidden');
    },

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

            // Decouple logic: Refresh the persistent list
            this.renderLinkedContent();

            // Clear ALL search inputs in the left sidebar to be safe
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

    async startSessionManual() {
        if (!this.activeSession) return;
        const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
        await updateDoc(sessionRef, {
            started: true,
            mode: 'manual',
            sessionStatus: 'active',
            activeChapterIndex: 0
        });
        this.activeSession.started = true;
        this.activeSession.mode = 'manual';

        // Open the Session Stage in a new tab
        window.open(`session-stage.html?id=${this.activeSession.id}`, '_blank');

        this.showStoryArea("");
    },

    async startSessionAI() {
        if (!this.activeSession) return;

        window.app.toggleLoading(true, "O Oráculo está consultando os anais...");

        try {
            const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);

            // Set session mode to oracle and mark as started
            await updateDoc(sessionRef, {
                started: true,
                mode: 'oracle',
                sessionStatus: 'active',
                activeChapterIndex: 0
            });

            // Ensure GM is a participant in Oracle mode (so the AI sees them)
            const invitesRef = collection(db, "session_invites");
            const q = query(invitesRef,
                where("sessionId", "==", this.activeSession.id),
                where("email", "==", getAuth().currentUser.email.toLowerCase())
            );
            const inviteSnap = await getDocs(q);

            if (inviteSnap.empty) {
                console.log("🛠️ GMPanel: Adicionando mestre como participante para o Oráculo (Idempotente)...");
                const selfInviteId = `self_${this.activeSession.id}_${getAuth().currentUser.uid}`;
                await setDoc(doc(invitesRef, selfInviteId), {
                    sessionId: this.activeSession.id,
                    email: getAuth().currentUser.email.toLowerCase(),
                    role: 'gm', // Fix: Define role immediately
                    status: "online",
                    invitedAt: serverTimestamp(),
                    invitedBy: getAuth().currentUser.uid,
                    isSelfInvite: true
                });
            }

            this.activeSession.started = true;
            this.activeSession.mode = 'oracle';

            // Initialize Oracle with full session context
            const { default: OracleModule } = await import('./oracle.js');
            await OracleModule.initializeOracle(this.activeSession.id, this.activeSession);

            this.showStoryArea("Oráculo inicializado - veja a narrativa na sessão");

            // Open the Session Stage in a new tab
            window.open(`session-stage.html?id=${this.activeSession.id}`, '_blank');

            window.app.showAlert("O Oráculo manifestou a história!", "Sucesso");
        } catch (err) {
            console.error("Erro na inicialização do Oráculo:", err);
            window.app.showAlert("O Oráculo falhou em conectar os pontos: " + err.message);
        } finally {
            window.app.toggleLoading(false);
        }
    },

    async getCompleteContext() {
        const { getModuleItems, COLLECTIONS, getUserMonsters, getGlobalMonsters, getGlobalItems, getUserItems, getCharacter } = await import('../data.js');
        const userId = getAuth().currentUser.uid;
        const systemId = window.app.currentSystem;
        const userEmail = getAuth().currentUser.email;

        const npcs = await getUserMonsters(userId, userEmail);
        const itemGlobals = await getGlobalItems(systemId);
        const itemUsers = await getUserItems(userId, userEmail);
        const items = [...itemGlobals, ...itemUsers];

        const monsterGlobals = await getGlobalMonsters(systemId);
        const monsterUsers = await getUserMonsters(userId, userEmail);
        const monsters = [...monsterGlobals, ...monsterUsers];

        const encounters = await getModuleItems(COLLECTIONS.ENCOUNTERS, userId, systemId);
        const campaigns = await getModuleItems(COLLECTIONS.CAMPAIGNS, userId, systemId);
        const plots = await getModuleItems(COLLECTIONS.PLOTS, userId, systemId);
        const scenes = await getModuleItems(COLLECTIONS.SCENES, userId, systemId);
        const motivations = await getModuleItems(COLLECTIONS.MOTIVATIONS, userId, systemId);

        const filterLinked = (all, type) => all.filter(x => (this.activeSession[`linked_${type}s`] || []).includes(x.id));

        // Get Player Character Data
        const players = [];
        const q = query(collection(db, "session_invites"), where("sessionId", "==", this.activeSession.id));
        const inviteSnapshot = await getDocs(q);
        for (const doc of inviteSnapshot.docs) {
            const data = doc.data();
            if (data.characterId) {
                const char = await getCharacter(data.characterId);
                if (char) {
                    players.push({
                        name: char.bio?.name || data.characterName,
                        race: char.bio?.race,
                        class: char.bio?.class,
                        level: char.bio?.level,
                        background: char.bio?.background
                    });
                }
            }
        }

        return {
            title: this.activeSession.title,
            system: systemId,
            players: players,
            npcs: filterLinked(npcs, 'npc').map(n => ({ name: n.name, details: n.description || n.story })),
            items: filterLinked(items, 'item').map(i => ({ name: i.title || i.name, details: i.description })),
            monsters: filterLinked(monsters, 'monster').map(m => ({ name: m.name, details: m.stats || m.description })),
            encounters: filterLinked(encounters, 'encounter').map(e => ({ name: e.title || e.name, details: e.description })),
            campaigns: filterLinked(campaigns, 'campaign').map(c => ({ name: c.title || c.name, details: c.description })),
            plots: filterLinked(plots, 'plot').map(p => ({ name: p.title || p.name, details: p.description })),
            scenes: filterLinked(scenes, 'scene').map(s => ({ name: s.title || s.name, details: s.description })),
            motivations: filterLinked(motivations, 'motivation').map(m => ({ name: m.title || m.name, details: m.description }))
        };
    },

    openSessionCreateModal(isEdit = false) {
        // Redundant for creation (handled by Wizard), but kept for EDITING title
        this.isEditing = isEdit;
        const modal = document.getElementById('gm-session-create-modal');
        if (!modal) return;

        const titleInput = document.getElementById('gm-new-session-title');
        const modalTitle = modal.querySelector('.modal-title');

        if (isEdit && this.activeSession) {
            if (titleInput) titleInput.value = this.activeSession.title;
            if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-pen-fancy"></i> Alterar Destino';
            modal.classList.remove('hidden');
        } else {
            // Creation is now always through Wizard
            this.openChoiceModal();
        }
    },

    closeSessionCreateModal() {
        document.getElementById('gm-session-create-modal')?.classList.add('hidden');
    },

    openEditSessionModal() {
        if (!this.activeSession) return;
        this.openSessionCreateModal(true);
    },

    async updateSessionMetadata(newTitle) {
        if (!this.activeSession) return;
        const app = window.app;

        try {
            const docRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
            await updateDoc(docRef, {
                title: newTitle,
                updatedAt: serverTimestamp()
            });

            this.activeSession.title = newTitle;
            document.getElementById('active-session-title').innerText = newTitle;
            app.showAlert("O título da saga foi alterado.", "Cronista Atento");
        } catch (err) {
            console.error("Erro ao atualizar sessão:", err);
            app.showAlert("Não foi possível alterar os anais.", "Erro");
        }
    },

    async confirmMetadataUpdate() {
        const titleInput = document.getElementById('gm-new-session-title');
        const title = titleInput.value?.trim();
        if (!title) return;

        await this.updateSessionMetadata(title);
        this.closeSessionCreateModal();
    },

    async saveStory() {
        if (!this.activeSession) return;
        const story = document.getElementById('gm-story-input-central').value;
        const app = window.app;

        try {
            const docRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
            await updateDoc(docRef, {
                story: story,
                updatedAt: serverTimestamp()
            });
            this.activeSession.story = story;
            app.showAlert("Crônicas salvas com sucesso.", "Escriba Satisfeito");
        } catch (error) {
            console.error("Erro ao salvar notas:", error);
        }
    },

    toggleVisibility() {
        if (!this.activeSession) return;
        const btn = document.getElementById('toggle-visibility-btn');
        const isPrivate = this.activeSession.visibility === 'private';
        const newVisibility = isPrivate ? 'public' : 'private';

        this.activeSession.visibility = newVisibility;
        btn.innerHTML = newVisibility === 'public' ?
            '<i class="fas fa-eye"></i> Público' :
            '<i class="fas fa-eye-slash"></i> Privado';

        btn.classList.toggle('primary', newVisibility === 'public');

        const docRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
        updateDoc(docRef, { visibility: newVisibility });
    },

    openInviteModal() {
        if (!this.activeSession) {
            window.app.showAlert("Inicie uma sessão antes de convidar heróis.", "Aviso");
            return;
        }
        document.getElementById('gm-invite-modal').classList.remove('hidden');
    },

    closeInviteModal() {
        document.getElementById('gm-invite-modal').classList.add('hidden');
    },

    async sendInvite() {
        const emailInput = document.getElementById('invite-email-input');
        const inputVal = emailInput.value.trim();
        if (!inputVal) return;

        const app = window.app;
        try {
            app.toggleLoading(true, "Enviando mensageiro pelo vácuo...");

            let targetEmail = inputVal.toLowerCase();
            let targetNickname = null;

            // Check if input is a nickname (doesn't contain @)
            if (!inputVal.includes('@')) {
                const { getUserByNickname } = await import('../data.js');
                const user = await getUserByNickname(inputVal);
                if (user) {
                    targetEmail = user.email.toLowerCase();
                    targetNickname = user.nickname;
                } else {
                    app.showAlert(`Nenhum viajante encontrado com a Identidade Arcana "${inputVal}".`, "Busca Falhou");
                    app.toggleLoading(false);
                    return;
                }
            }

            // Check if already invited
            const q = query(
                collection(db, "session_invites"),
                where("sessionId", "==", this.activeSession.id),
                where("email", "==", targetEmail)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                app.showAlert(`Este viajante já foi convocado para esta jornada.`, "Aviso");
                app.toggleLoading(false);
                return;
            }

            const inviteData = {
                sessionId: this.activeSession.id,
                email: targetEmail,
                nickname: targetNickname, // Store nickname if found
                status: "invited",
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "session_invites"), inviteData);

            // Increment session player count for manual invites
            const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
            await updateDoc(sessionRef, {
                currentPlayers: increment(1)
            });

            app.showAlert(`O convite foi enviado para ${targetNickname || targetEmail} através do éter arcano.`, "Mensageiro Partiu");
            emailInput.value = "";
            this.closeInviteModal();
        } catch (error) {
            console.error("Erro ao enviar convite:", error);
            app.showAlert("O mensageiro se perdeu no caminho das estrelas.", "Falha no Envio");
        } finally {
            app.toggleLoading(false);
        }
    },

    async cancelInvite(inviteId, label) {
        const confirmed = await window.app.showConfirm(
            `Deseja realmente cancelar o convite de "${label}"? O vínculo será desfeito e o acesso negado.`,
            "Cancelar Convite"
        );

        if (!confirmed) return;

        window.app.toggleLoading(true, "Desfazendo vínculo...");
        try {
            await deleteDoc(doc(db, "session_invites", inviteId));

            // Decrement player count
            if (this.activeSession) {
                const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
                await updateDoc(sessionRef, {
                    currentPlayers: increment(-1)
                });
            }

            window.app.showAlert(`O convite de "${label}" foi revogado.`, "Vínculo Desfeito");
        } catch (error) {
            console.error("Erro ao cancelar convite:", error);
            window.app.showAlert("Falha ao cancelar convite no éter.");
        } finally {
            window.app.toggleLoading(false);
        }
    },

    startInviteListener(sessionId) {
        if (this.unsubscribeInvites) this.unsubscribeInvites();

        const q = query(
            collection(db, "session_invites"),
            where("sessionId", "==", sessionId)
        );

        let previousReadyCount = -1;

        this.unsubscribeInvites = onSnapshot(q, (snapshot) => {
            const list = document.getElementById('gm-player-list');
            if (!list) return;

            list.innerHTML = "";
            let totalInvited = snapshot.size;
            let readyCount = 0;
            let onlineCount = 0;
            const gmEmail = getAuth().currentUser.email.toLowerCase();

            snapshot.forEach(doc => {
                const invite = doc.data();

                // IGNORE GM/OWNER in this list
                if (invite.role === 'gm' || invite.email.toLowerCase() === gmEmail) {
                    return;
                }

                const isReady = invite.characterId && invite.status !== 'refused';
                if (isReady) readyCount++;
                if (['accepted', 'online'].includes(invite.status)) onlineCount++;

                const li = document.createElement('li');
                li.className = `player-item list-item-v2 ${invite.status}`;
                li.dataset.type = 'character';
                li.dataset.id = invite.characterId;
                li.dataset.mode = 'inspection';
                li.innerHTML = `
                    <div class="player-status ${invite.status}"></div>
                    <div class="player-info">
                        <span class="player-name">${invite.nickname || invite.displayName || "Aventureiro(a)"}</span>
                        <span class="player-sheet ${invite.characterId ? 'ready' : 'pending'}">
                            ${invite.characterName || (invite.status === 'invited' ? 'Aguardando Aceite...' : 'Escolhendo Ficha...')}
                        </span>
                    </div>
                    <div class="player-actions">
                        ${invite.characterId ? `
                            <button class="medieval-btn icon-only gold-glow" title="Visualizar Ficha" onclick="GMPanelModule.viewPlayerSheet('${invite.characterId}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        ` : ''}
                        <button class="medieval-btn icon-only delete-glow" title="Cancelar Convite" onclick="GMPanelModule.cancelInvite('${doc.id}', '${invite.nickname || invite.email}')">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </div>
                `;
                list.appendChild(li);
            });

            // REMOVED: GM notification and button control
            // Start buttons (btn-start-manual, btn-start-ai) were removed
            // Mode is now set at session creation, not at start

            previousReadyCount = readyCount;

            const countEl = document.getElementById('active-player-count');
            if (countEl) countEl.innerText = onlineCount;
        });
    },

    formatStatus(status) {
        switch (status) {
            case 'invited': return 'Convidado';
            case 'accepted': return 'Aceitou';
            case 'online': return 'Online';
            case 'refused': return 'Recusado';
            default: return 'Desconhecido';
        }
    },

    async viewPlayerSheet(characterId) {
        if (!characterId) return;
        window.app.toggleLoading(true, "Lendo os anais do herói...");
        try {
            const { getCharacter } = await import('../data.js');
            const character = await getCharacter(characterId);
            if (character) {
                const { SheetModule } = await import('./sheet.js');
                window.app.openModal('character-sheet');

                // Do NOT call app.selectCharacter(character) here to protect GM identity
                // Instead, populate directly in Inspection Mode
                SheetModule.populateSheet(character, {
                    ...window.app.getSheetContext(),
                    isInspection: true
                });
                SheetModule.switchSheetTab('geral', {
                    ...window.app.getSheetContext(),
                    isInspection: true
                });
            } else {
                window.app.showAlert("Esta ficha parece ter se desmaterializado.");
            }
        } catch (err) {
            console.error("Erro ao abrir ficha do jogador:", err);
            window.app.showAlert("Falha ao acessar os registros do herói.");
        } finally {
            window.app.toggleLoading(false);
        }
    },

    async openSessionSelectModal(mode = 'switch') {
        const modal = document.getElementById('gm-session-select-modal');
        const container = document.getElementById('gm-session-select-container');
        const optionsList = document.getElementById('gm-session-select-options');
        const textDisplay = document.getElementById('gm-session-select-text');
        const hiddenValue = document.getElementById('gm-session-select-value');
        const confirmBtn = document.getElementById('gm-session-select-confirm');
        const title = modal?.querySelector('.modal-title');

        if (!modal || !optionsList || !confirmBtn) return;

        // Reset custom select state
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

        // Helper to handle custom option selection
        const selectOption = (val, label) => {
            if (textDisplay) textDisplay.textContent = label;
            if (hiddenValue) hiddenValue.value = val;
            container?.classList.remove('open');
            document.getElementById('gm-session-select-options-wrapper')?.classList.add('hidden');
        };

        // Remove old listener if exists
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

            const { collection, getDocs, query, where } = await import("firebase/firestore");
            const { db } = await import('../auth.js');

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
            snapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                const isActive = mode === 'switch' && this.activeSession && this.activeSession.id === doc.id;
                optionsHtml += `
                    <div class="custom-select-option ${isActive ? 'disabled' : ''}" data-value="${doc.id}">
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
                    // Try to find if we have a pre-selected chapter index or find first uncompleted
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
                // Verify if players are ready for THIS session
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

                // If chapterIndex is null (Quick Enter), auto-detect first uncompleted
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

                // 🛡️ SYNC: Update active chapter and reset conclusion status in Firestore
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
                // Remove player list listener for old session
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

window.GMPanelModule = GMPanelModule;
