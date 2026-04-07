/**
 * Lyra the Wise - Main Application Module (Barrel)
 * Core initialization, auth flow, navigation, and event binding.
 *
 * Sub-modules:
 *  - core/app-theme.js   → Theme switching, music player, AI persona
 *  - core/app-chat.js    → AI chat (Lyra / Damien / Eldrin)
 *  - core/app-modals.js  → Modal management, alerts, confirms, loading
 *  - core/app-loaders.js → Data loading (characters, monsters, etc.), invitations
 */

import { logger } from './logger.js';
import { login, logout, initAuth } from './auth.js';
import {
    getCharacters, getCharacter, saveCharacter, deleteCharacter, uploadCharacterToken,
    getGlobalMonsters, getUserMonsters, deleteUserMonster,
    getTraps, getTrap, saveTrap, deleteTrap,
    getSessions, getSession, saveSession, deleteSession,
    createUserProfile, getGlobalConfig, getUserItems, updateUserPresence
} from './data.js';
import { RPG_TRIVIA, SUPPORTED_SYSTEMS, APP_VERSION } from './constants.js';

import { NavigationModule } from './modules/navigation.js';
import { NamesModule } from './modules/names.js';
import { ChangelogModule } from './modules/changelog-loader.js';
import { DiceModule } from './modules/dice.js';
import { AuthUI } from './modules/auth-ui.js';
import { ListModule } from './modules/lists.js';
import LyricsModule from './modules/lyrics.js';
import { ItemsModule } from './modules/items.js';
import { SheetModule } from './modules/sheet.js';
import { WizardModule } from './modules/wizard.js';
import { SettingsModule } from './modules/settings.js';
import { calculateModifier, formatModifier, resizeImage, getNestedValue, setNestedValue, parseMarkdown, translateFirebaseError } from './modules/utils.js';
import { sendMessageToLyra } from './ai.js';
import { AdminModule } from './modules/admin.js';
import { SpellModule } from './modules/spells.js';
import { MonsterModule } from './modules/monsters.js';
import CommunityModule from './modules/community.js';
import { ContentModule } from './modules/content_modules.js';
import { EntitySheetModule } from './modules/entity-sheet.js';
import { GMPanelModule } from './modules/gm-panel.js';
import { PublicSessionsModule } from './modules/public-sessions.js';
import { ChatUIModule } from './modules/chat_ui.js';

// Sub-module mixins
import { createThemeMixin } from './core/app-theme.js';
import { createChatMixin } from './core/app-chat.js';
import { createModalsMixin } from './core/app-modals.js';
import { createLoadersMixin } from './core/app-loaders.js';

const app = {
    user: null,
    currentCharacter: null,
    currentSystem: localStorage.getItem('lyra_current_system') || 'dnd5e',
    currentView: sessionStorage.getItem('lyra_current_view') || 'dashboard',
    isDamien: false,
    isDeleteMode: false,
    chatHistory: [],
    triviaIndex: 0,
    isWaitingForAI: false,
    isInspection: false,
    previousView: sessionStorage.getItem('lyra_previous_view') || null,
    parseMarkdown: parseMarkdown,

    init() {
        // Theme Easter Egg
        const roll = Math.random();
        if (roll < 0.25) {
            this.setTheme('eldrin');
        } else if (roll < 0.50) {
            this.setTheme('damien');
        } else {
            this.setTheme('lyra');
        }

        initAuth(async (user) => {
            await this.handleAuthStateChange(user);
            await this.checkMaintenanceMode(user);
        });
        this.populateSystems();
        this.showRandomTrivia();
        this.initMusicPlayer();
        NavigationModule.init();

        LyricsModule.init();
        SheetModule.init();
        ItemsModule.init();
        AdminModule.init();
        WizardModule.init(this.getWizardContext());
        ChangelogModule.init();
        this.populateDataLists();
        DiceModule.init();
        SpellModule.init();
        MonsterModule.init();
        EntitySheetModule.init();
        ContentModule.init();
        NamesModule.init();
        GMPanelModule.init();
        ChatUIModule.init(this);

        this.bindEvents(); // Bind events after all modules inject their HTML

        // Changelog Notification
        const storedVersion = localStorage.getItem('lyraAppVersion');
        const badge = document.querySelector('.notification-badge');
        if (storedVersion !== APP_VERSION) {
            if (badge) badge.style.display = 'flex';
        } else {
            if (badge) badge.style.display = 'none';
        }

        setInterval(() => this.showRandomTrivia(), 15000);

        window.calculateModifier = calculateModifier;
        window.formatModifier = formatModifier;
    },

    showRandomTrivia() {
        const triviaEl = document.getElementById('rpg-trivia');
        if (!triviaEl) return;

        let trivia = RPG_TRIVIA[this.triviaIndex];

        if (this.currentThemeName === 'damien') {
            trivia = this.convertToRunic(trivia);
        } else if (this.currentThemeName === 'eldrin') {
            trivia = "♫ " + trivia + " ♫";
        }

        triviaEl.style.opacity = 0;
        setTimeout(() => {
            triviaEl.innerText = trivia;
            triviaEl.style.opacity = 1;
            this.triviaIndex = (this.triviaIndex + 1) % RPG_TRIVIA.length;
        }, 500);
    },

    convertToRunic(text) {
        const runicMap = {
            'a': 'ᚠ', 'b': 'ᚢ', 'c': 'ᚦ', 'd': 'ᚨ', 'e': 'ᚱ', 'f': 'ᚲ', 'g': 'ᚷ', 'h': 'ᚹ',
            'i': 'ᚺ', 'j': 'ᚻ', 'k': 'ᛁ', 'l': 'ᛃ', 'm': 'ᛄ', 'n': 'ᛅ', 'o': 'ᛆ', 'p': 'ᛇ',
            'q': 'ᛈ', 'r': 'ᛉ', 's': 'ᛊ', 't': 'ᛋ', 'u': 'ᛌ', 'v': 'ᛍ', 'w': 'ᛎ', 'x': 'ᛏ',
            'y': 'ᛐ', 'z': 'ᛑ'
        };
        return text.toLowerCase().split('').map(char => runicMap[char] || char).join('');
    },

    populateSystems() {
        const optionsContainer = document.getElementById('system-selector-options');
        const textDisplay = document.getElementById('system-selector-text');
        const hiddenInput = document.getElementById('system-selector');

        if (optionsContainer) {
            optionsContainer.innerHTML = SUPPORTED_SYSTEMS.map(s => `
                <div class="custom-select-option ${s.id === this.currentSystem ? 'selected' : ''}" data-value="${s.id}">
                    ${s.name}
                </div>
            `).join('');

            const currentSystem = SUPPORTED_SYSTEMS.find(s => s.id === this.currentSystem);
            if (textDisplay && currentSystem) textDisplay.textContent = currentSystem.name;

            optionsContainer.querySelectorAll('.custom-select-option').forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    textDisplay.textContent = option.textContent.trim();
                    if (hiddenInput) hiddenInput.value = value;
                    document.getElementById('system-selector-container').classList.remove('open');
                    document.getElementById('system-selector-options-wrapper').classList.add('hidden');
                    this.handleSystemChange(value);
                });
            });
        }
    },

    populateDataLists() {
        const raceList = document.getElementById('races-list');
        if (raceList) {
            import('./constants.js').then(({ RACES }) => {
                raceList.innerHTML = RACES.map(r => `<option value="${r}">`).join('');
            });
        }
    },

    async populateCharSwitcher() {
        const list = document.getElementById('char-switcher-list');
        if (!this.user || !list) {
            if (list) list.innerHTML = '<p class="empty-state">Faça login para ver personagens.</p>';
            return;
        }

        list.innerHTML = '<p class="loading-text">Carregando...</p>';

        try {
            const characters = await getCharacters(this.user.uid, this.currentSystem);

            if (characters.length === 0) {
                list.innerHTML = '<p class="empty-state">Nenhum personagem neste sistema.</p>';
                return;
            }

            list.innerHTML = characters.map(char => {
                const isCurrent = this.currentCharacter?.id === char.id;
                const race = char.bio?.race || char.secoes?.basico?.Raça || '-';
                const clazz = char.bio?.class || char.secoes?.basico?.Classe || '-';
                const level = char.bio?.level || char.secoes?.basico?.Nível || 1;

                return `
                    <div class="char-switcher-item ${isCurrent ? 'active' : ''}" data-char-id="${char.id}">
                        <div class="switcher-item-content">
                            <img src="${char.tokenUrl || (this.isDamien ? 'assets/tokens/damien.png' : 'assets/tokens/lyra.png')}" alt="Token" class="switcher-token">
                            <div class="switcher-info">
                                <strong>${char.name || char.bio?.name || 'Sem Nome'}</strong>
                                <span>${race || '-'} | ${clazz || '-'} (Nív ${level})</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            list.querySelectorAll('.char-switcher-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const charId = item.dataset.charId;
                    const char = characters.find(c => c.id === charId);
                    if (char) {
                        this.selectCharacter(char);
                        document.getElementById('char-switcher-dropdown')?.classList.add('hidden');
                    }
                });
            });

            NavigationModule.updateDropdownScroll(list);
        } catch (error) {
            logger.error("Erro ao povoar switcher:", error);
            const friendlyMsg = translateFirebaseError(error);
            list.innerHTML = `<p class="empty-state">${friendlyMsg}</p>`;
        }
    },

    // --- Context & Dependency Injection ---
    getWizardContext() {
        return {
            get user() { return app.user; },
            currentSystem: this.currentSystem,
            checkAuth: () => this.checkAuth(),
            openModal: (id) => this.openModal(id),
            closeModal: () => this.closeModal(),
            showAlert: (msg, title) => this.showAlert(msg, title),
            toggleLoading: (show) => this.toggleLoading(show),
            calculateStats: (char) => SheetModule.calculateDND5eStats(char),
            refreshList: () => this.loadCharacters(),
            refreshMonsters: () => this.loadMonsters(),
            refreshTraps: () => this.loadTraps(),
            refreshSessions: () => this.loadSessions(),
            isDamien: this.isDamien
        };
    },

    getSheetContext() {
        return {
            isDamien: this.isDamien,
            showAlert: (msg, title) => this.showAlert(msg, title),
            toggleLoading: (show) => this.toggleLoading(show),
            updateScrollIndicators: () => NavigationModule.updateScrollIndicators(),
            openModal: (id) => this.openModal(id),
            closeModal: (id) => this.closeModal(id),
            get user() { return app.user; },
            isInspection: this.isInspection
        };
    },

    getNavigationLoaders() {
        return {
            loadCharacters: () => this.loadCharacters(),
            loadMonsters: () => MonsterModule.render(),
            loadTraps: () => this.loadTraps(),
            loadSessions: () => this.loadSessions(),
            loadItems: () => ItemsModule.render(),
            loadVillains: () => ContentModule.switchToModule('villains'),
            loadNpcs: () => ContentModule.switchToModule('npcs'),
            loadGMPanel: () => GMPanelModule.loadPanel(this.user, this.currentSystem),
            loadCampaigns: () => ContentModule.switchToModule('campaigns'),
            loadEncounters: () => ContentModule.switchToModule('encounters'),
            loadPuzzles: () => ContentModule.switchToModule('puzzles'),
            loadTreasures: () => ContentModule.switchToModule('treasures'),
            loadScenes: () => ContentModule.switchToModule('scenes'),
            loadPlots: () => ContentModule.switchToModule('plots'),
            loadMotivations: () => ContentModule.switchToModule('motivations'),
            loadRules: () => ContentModule.switchToModule('rules'),
            loadArmadilhas: () => ContentModule.switchToModule('armadilhas'),
            loadNames: () => NamesModule.render(),
            loadCommunity: () => CommunityModule.init(this.user),
            showMonsterCreator: () => WizardModule.showMonsterCreator(this.getWizardContext()),
            showTrapCreator: () => WizardModule.showTrapCreator(this.getWizardContext()),
            showAlert: (msg, title) => this.showAlert(msg, title),
            showConfirm: (msg, title) => this.showConfirm(msg, title),
            deleteCharacter: (id) => deleteCharacter(id),
            deleteMonster: (id) => deleteUserMonster(id, this.user?.uid),
            deleteTrap: (id) => deleteTrap(id),
            deleteSession: (id) => deleteSession(id),
            refreshList: (type) => {
                if (type === 'character') this.loadCharacters();
                else if (type === 'monster') this.loadMonsters();
                else if (type === 'trap') this.loadTraps();
                else if (type === 'session') this.loadSessions();
                else if (type === 'items') ItemsModule.render();
            }
        };
    },

    // --- State Handlers ---
    async handleAuthStateChange(user) {
        this.user = user;

        const uiUpdateOptions = {
            selectCharacter: (char) => { if (char) this.selectCharacter(char); },
            clearAllViews: () => {
                const ids = ['fichas-list', 'monsters-list', 'traps-list', 'sessions-list', 'chat-messages'];
                ids.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerHTML = '';
                })
            },
            currentCharacter: this.currentCharacter
        };

        if (user) {
            try {
                this.toggleLoading(true);

                const profilePromise = createUserProfile(user);
                const configPromise = getGlobalConfig();

                const charRestorationPromise = (async () => {
                    try {
                        const savedChatId = localStorage.getItem(`lyra_char_${user.uid}_${this.currentSystem}`);
                        if (savedChatId) {
                            return await getCharacter(savedChatId);
                        } else {
                            const chars = await getCharacters(user.uid, this.currentSystem);
                            return chars.length > 0 ? chars[0] : null;
                        }
                    } catch (e) {
                        console.warn("⚠️ [Auth] Falha não-crítica ao buscar personagem:", e.message);
                        return null;
                    }
                })();

                const [profile, config, characterToSelect] = await Promise.all([
                    profilePromise,
                    configPromise,
                    charRestorationPromise
                ]);

                this.userProfile = profile;

                const alphaBadge = document.getElementById('alpha-badge');
                if (alphaBadge) {
                    alphaBadge.classList.toggle('hidden', !profile?.alphaTester);
                }

                const adminBtn = document.getElementById('admin-portal-btn');
                if (adminBtn) {
                    adminBtn.classList.toggle('hidden', profile?.role !== 'gm');
                }

                await AuthUI.update(user, { ...uiUpdateOptions, selectCharacter: null });

                if (SettingsModule.isNicknameRequired) {
                    this.openModal('settings-modal');
                }

                if (this.currentView === 'portal' && profile?.role !== 'gm') {
                    console.warn("🛡️ [Auth] Redirecionando de área restrita...");
                    this.currentView = 'dashboard';
                }

                NavigationModule.switchView(this.currentView, this.getNavigationLoaders());
                this.checkMusicAutoPlay();

                if (characterToSelect) {
                    this.selectCharacter(characterToSelect);
                }

                this.populateCharSwitcher();

                window.CommunityModule = CommunityModule;
                CommunityModule.init(user);
                this.startPresenceHeartbeat(user.uid);
                this.startInvitationListener(user);
                this.loadUserData(user.uid);

            } catch (error) {
                logger.error("🔥 [ERRO CRÍTICO] Falha no fluxo de autenticação:", error);
                this.showAlert(translateFirebaseError(error), "Falha na Trama");
                throw error;
            } finally {
                this.toggleLoading(false);
            }
        } else {
            await AuthUI.update(null, uiUpdateOptions);
            NavigationModule.switchView('dashboard', this.getNavigationLoaders());
        }
    },

    async loadUserData(userId) {
        try {
            if (this.userProfile?.email) {
                this.userItems = await getUserItems(userId, this.userProfile.email);
            }
        } catch (error) {
            console.warn("⚠️ [App] Erro ao carregar dados secundários:", error);
        }
    },

    startPresenceHeartbeat(userId) {
        if (this.presenceInterval) clearInterval(this.presenceInterval);
        updateUserPresence(userId);
        this.presenceInterval = setInterval(() => {
            updateUserPresence(userId);
        }, 3 * 60 * 1000);
    },

    async checkMaintenanceMode(user) {
        try {
            const config = await getGlobalConfig();
            const overlay = document.getElementById('maintenance-overlay');

            if (!overlay) return;

            const isMaintenance = config?.maintenanceMode === true;
            const isGM = this.userProfile?.role === 'gm';

            if (isMaintenance && !isGM) {
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } else {
                overlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        } catch (error) {
            logger.error("Erro ao verificar manutenção:", error);
        }
    },

    switchView(viewId) {
        NavigationModule.toggleMenu(false);
        if (viewId === 'dashboard') {
            // Dashboard is always accessible
        } else if (!this.user) {
            this.showAlert("Você precisa estar logado para acessar os anais arcanos.", "Portal Trancado");
            return;
        }

        this.previousView = this.currentView;
        this.currentView = viewId;
        sessionStorage.setItem('lyra_current_view', viewId);
        sessionStorage.setItem('lyra_previous_view', this.previousView || 'dashboard');
        NavigationModule.switchView(viewId, this.getNavigationLoaders());

        if (viewId === 'itens') {
            ItemsModule.render();
        } else if (viewId === 'portal') {
            if (this.userProfile?.role === 'gm') {
                AdminModule.loadPortal();
            } else {
                this.switchView('dashboard');
                return;
            }
        } else if (viewId === 'grimorio') {
            SpellModule.loadGrimoire(SpellModule.currentSource || 'system');
        } else if (viewId === 'monstros') {
            MonsterModule.render();
        } else if (viewId === 'gm-panel') {
            GMPanelModule.loadPanel(this.user, this.currentSystem);
        } else if (viewId === 'my-sessions') {
            // If we came from player-sessions, it was already loaded with 'player'
            // Otherwise default to 'gm' (from GM selection)
            if (this.lastSessionRole !== 'player') {
                this.loadSessions('gm');
            }
            this.lastSessionRole = null; // Reset
        } else if (viewId === 'sessoes') {
            // Selection view, no data load needed here anymore
        } else if (viewId === 'public-sessions') {
            PublicSessionsModule.loadPublicSessions();
        } else if (ContentModule.configs[viewId]) {
            ContentModule.switchToModule(viewId);
        } else if (viewId === 'names') {
            NamesModule.render();
        } else if (viewId === 'chat') {
            ChatUIModule.updatePersonaName();
        }

        if (this.updateMusicPlayerVisibility) {
            this.updateMusicPlayerVisibility();
        }
    },

    goBack() {
        if (this.previousView && this.previousView !== this.currentView) {
            this.switchView(this.previousView);
        } else {
            this.switchView('dashboard');
        }
    },

    handleQuickAction(action) {
        NavigationModule.toggleMenu(false);

        if (action === 'monster-gen' || action === 'monster-btn') {
            WizardModule.showMonsterCreator(this.getWizardContext());
        } else if (action === 'trap-gen' || action === 'trap-btn') {
            WizardModule.showTrapCreator(this.getWizardContext());
        } else if (action === 'character-wizard' || action === 'wizard-btn') {
            WizardModule.showCreationWizard(this.getWizardContext());
        } else if (action === 'session-editor' || action === 'session-btn') {
            WizardModule.showSessionEditor(this.getWizardContext());
        } else if (action === 'gm-screen') {
            this.switchView('gm-selection');
        } else if (action === 'dice-roller') {
            DiceModule.openModal();
        } else {
            this.showAlert(`Invocando magia para: ${action}. (Funcionalidade em desenvolvimento)`, "Magia em Preparo");
        }
    },

    async handleSystemChange(systemId) {
        if (this.currentCharacter && this.currentSystem) {
            localStorage.setItem(`lyra_char_${this.currentSystem}`, this.currentCharacter.id);
        }

        this.currentSystem = systemId;
        localStorage.setItem('lyra_current_system', systemId);

        const savedCharId = localStorage.getItem(`lyra_char_${systemId}`);
        if (savedCharId && this.user) {
            try {
                const char = await getCharacter(savedCharId);
                if (char) this.selectCharacter(char);
                else {
                    this.currentCharacter = null;
                    NavigationModule.updateHeaderTracker(null, this.isDamien);
                }
            } catch {
                this.currentCharacter = null;
                NavigationModule.updateHeaderTracker(null, this.isDamien);
            }
        } else {
            this.currentCharacter = null;
            NavigationModule.updateHeaderTracker(null, this.isDamien);
        }

        if (this.user) {
            this.switchView('dashboard');
            this.populateCharSwitcher();
        }

        this.populateSystems();
    },

    selectCharacter(char) {
        if (!char) {
            this.currentCharacter = null;
            NavigationModule.updateHeaderTracker(null, this.isDamien);
            return;
        }
        this.currentCharacter = char;
        NavigationModule.updateHeaderTracker(char, this.isDamien);
        this.isDeleteMode = false;

        if (this.user) {
            localStorage.setItem(`lyra_char_${this.user.uid}_${this.currentSystem}`, char.id);
        }

        this.chatHistory = [];
        this.populateCharSwitcher();
    },

    // --- Delete Mode ---
    toggleDeleteMode(type) {
        this.isDeleteMode = !this.isDeleteMode;
        const btn = document.getElementById('bulk-delete-fichas-btn');
        const container = document.getElementById('fichas-list');

        if (this.isDeleteMode) {
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> Concluir';
                btn.classList.add('active');
            }
            container?.classList.add('delete-mode-active');
            document.querySelectorAll('.medieval-card').forEach(c => c.classList.add('is-delete-mode'));
            this.showAlert("Selecione as fichas que deseja apagar e clique em 'Concluir' no botão.", "Modo Exclusão");
        } else {
            const selected = document.querySelectorAll('.medieval-card.is-selected');
            if (selected.length > 0) {
                this.handleBulkDelete(selected, type);
            } else {
                this.exitDeleteMode();
            }
        }
    },

    exitDeleteMode() {
        this.isDeleteMode = false;
        const btn = document.getElementById('bulk-delete-fichas-btn');
        const container = document.getElementById('fichas-list');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-trash-can"></i> Excluir';
            btn.classList.remove('active');
        }
        container?.classList.remove('delete-mode-active');
        document.querySelectorAll('.medieval-card').forEach(c => {
            c.classList.remove('is-delete-mode');
            c.classList.remove('is-selected');
        });
    },

    async handleBulkDelete(selectedCards, type) {
        const count = selectedCards.length;
        const confirmed = await this.showConfirm(`Deseja realmente apagar ${count} itens permanentemente?`, "Limpeza Profunda");

        if (confirmed) {
            this.toggleLoading(true);
            try {
                for (const card of selectedCards) {
                    const id = card.dataset.id;
                    if (type === 'character') await deleteCharacter(id);
                }
                this.showAlert(`${count} itens removidos do multiverso.`, "Sucesso");
                this.loadCharacters();
            } catch (err) {
                this.showAlert("A remoção falhou: " + err.message);
            } finally {
                this.toggleLoading(false);
            }
        }
        this.exitDeleteMode();
    },

    // --- Event Binding (The Glue) ---
    bindEvents() {
        console.log("🔗 Connecting Runes (Binding Events)...");

        // Header Community Button
        document.getElementById('header-community-btn')?.addEventListener('click', () => {
            NavigationModule.switchView('community', this.getNavigationLoaders());
        });

        // GLOBAL CLICK DELEGATE (Cards + data-action)
        document.addEventListener('click', (e) => {
            // Handle data-action attributes (from index.html)
            const actionEl = e.target.closest('[data-action]');
            if (actionEl) {
                switch (actionEl.dataset.action) {
                    case 'app-go-back': this.goBack(); return;
                    case 'app-close-alert': this.closeAlert(); return;
                    case 'app-refresh-public-sessions':
                        if (window.PublicSessionsModule) window.PublicSessionsModule.loadPublicSessions();
                        return;
                }
            }

            const deleteBtn = e.target.closest('.card-delete-btn');
            const card = e.target.closest('.medieval-card');

            if (deleteBtn && card) {
                e.preventDefault();
                e.stopImmediatePropagation();
                NavigationModule.deleteItem(card.dataset.id, card.dataset.type, this.getNavigationLoaders());
                return;
            }

            if (this.isDeleteMode && card) {
                e.stopImmediatePropagation();
                card.classList.toggle('is-selected');
                return;
            }

            if (card) {
                const type = card.dataset.type;
                const id = card.dataset.id;

                if (type === 'character') {
                    this.openModal('character-sheet');
                    getCharacter(id).then(c => {
                        if (c) {
                            this.selectCharacter(c);
                            SheetModule.populateSheet(c, this.getSheetContext());
                            SheetModule.switchSheetTab('geral', this.getSheetContext());
                        }
                    });
                } else {
                    NavigationModule.viewItem(type, id, this.getSheetContext());
                }
            }

            const selectionCard = e.target.closest('.selection-card');
            if (selectionCard) {
                const target = selectionCard.dataset.target;
                if (target === 'player-sessions') {
                    this.lastSessionRole = 'player';
                    this.loadSessions('player');
                    this.switchView('my-sessions');
                    return;
                }
                if (target === 'my-sessions' || target === 'public-sessions') {
                    this.switchView(target);
                }
            }
        });

        // Chat Navigation
        const chatCloseBtn = document.getElementById('chat-close-btn');
        if (chatCloseBtn) {
            chatCloseBtn.addEventListener('click', () => this.switchView('dashboard'));
        }

        // Navigation
        document.querySelectorAll('.nav-btn, .action-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                const action = e.currentTarget.dataset.action;
                if (view) this.switchView(view);
                else if (action) this.handleQuickAction(action);
            });
        });

        // Menu
        document.getElementById('home-btn')?.addEventListener('click', () => this.switchView('dashboard'));
        document.getElementById('menu-btn')?.addEventListener('click', () => NavigationModule.openMenuAtSection('all'));

        // Changelog & Notification Center
        document.getElementById('changelog-btn')?.addEventListener('click', () => {
            const modal = document.getElementById('changelog-modal');
            if (modal) {
                modal.classList.remove('hidden');
                ChangelogModule.loadChangelog();
                this.renderInvites();
            }

            localStorage.setItem('lyraAppVersion', APP_VERSION);
            const badge = document.querySelector('.notification-badge');
            if (badge) badge.style.display = 'none';
        });
        document.getElementById('close-changelog')?.addEventListener('click', () => {
            document.getElementById('changelog-modal')?.classList.add('hidden');
        });
        document.querySelectorAll('.close-menu, .menu-overlay').forEach(el => el.addEventListener('click', () => NavigationModule.toggleMenu(false)));

        // Wizard Entry Points
        document.getElementById('show-wizard-btn')?.addEventListener('click', () => WizardModule.showCreationWizard(this.getWizardContext()));
        document.getElementById('show-monster-btn')?.addEventListener('click', () => WizardModule.showMonsterCreator(this.getWizardContext()));
        document.getElementById('show-trap-btn')?.addEventListener('click', () => WizardModule.showTrapCreator(this.getWizardContext()));

        document.getElementById('settings-btn')?.addEventListener('click', () => {
            if (this.checkAuth()) this.openModal('settings-modal');
        });
        document.getElementById('save-settings-btn')?.addEventListener('click', () => SettingsModule.saveSettings(this.user, { showAlert: this.showAlert, closeModal: this.closeModal }));
        document.getElementById('cursor-selector')?.addEventListener('click', (e) => {
            const option = e.target.closest('.cursor-option');
            if (option) {
                document.querySelectorAll('.cursor-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                const cursor = option.dataset.cursor;
                if (cursor) document.body.className = document.body.className.replace(/cursor-\S+/g, '') + ` cursor-${cursor}`;
            }
        });

        // Sheet Actions
        document.getElementById('save-sheet-btn')?.addEventListener('click', async () => {
            this.currentCharacter = await SheetModule.saveSheetChanges(this.currentCharacter, this.getSheetContext());
        });

        // Sheet Tabs
        document.querySelectorAll('#character-sheet .sheet-tab').forEach(tab => {
            tab.addEventListener('click', (e) => SheetModule.switchSheetTab(e.currentTarget.dataset.tab, this.getSheetContext()));
        });

        // Global Action: Delete List Item & Prof Toggle
        document.getElementById('character-sheet')?.addEventListener('click', (e) => {
            if (SheetModule.isInspection) return;
            const delBtn = e.target.closest('.delete-list-item');
            if (delBtn) {
                const listPath = delBtn.dataset.list;
                const index = parseInt(delBtn.dataset.index);

                if (listPath === 'inventory.items') {
                    const item = this.currentCharacter.inventory?.items[index];
                    if (item && item.name && this.currentCharacter.combat?.attacks) {
                        const atkIdx = this.currentCharacter.combat.attacks.findIndex(a => a.name === item.name);
                        if (atkIdx !== -1) {
                            ListModule.removeItem(this.currentCharacter, 'combat.attacks', atkIdx);
                        }
                    }
                }

                ListModule.removeItem(this.currentCharacter, listPath, index);
                SheetModule.populateSheet(this.currentCharacter, this.getSheetContext());
                return;
            }
            const profBtn = e.target.closest('.prof-toggle') || e.target.closest('.skill-item') || e.target.closest('.save-item');
            if (profBtn) {
                const target = profBtn.classList.contains('prof-toggle') ? profBtn : profBtn.querySelector('.prof-toggle');
                if (target) {
                    ListModule.toggleProficiency(this.currentCharacter, target.dataset.type, target.dataset.field);
                    SheetModule.populateSheet(this.currentCharacter, this.getSheetContext());
                }
            }
        });

        document.getElementById('token-upload')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file || !this.currentCharacter) return;

            try {
                this.toggleLoading(true);
                const blob = await resizeImage(file, 400, 400);
                const url = await uploadCharacterToken(this.user.uid, this.currentCharacter.id, blob);
                this.currentCharacter.tokenUrl = url;
                await saveCharacter(this.user.uid, this.currentSystem, this.currentCharacter);
                document.getElementById('sheet-token').src = url;
                this.showAlert("Token atualizado!", "Imagem");
            } catch (err) { this.showAlert(err.message); }
            finally { this.toggleLoading(false); }
        });

        // Scroll
        window.addEventListener('scroll', () => NavigationModule.updateScrollIndicators());
        window.addEventListener('resize', () => NavigationModule.updateScrollIndicators());
        document.getElementById('scroll-up')?.addEventListener('click', () => window.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' }));
        document.getElementById('scroll-down')?.addEventListener('click', () => window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' }));

        // System Selector
        document.getElementById('system-selector')?.addEventListener('change', (e) => this.handleSystemChange(e.target.value));

        // Character Switcher Toggle
        document.getElementById('switch-char-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('char-switcher-dropdown');
            dropdown?.classList.toggle('hidden');
            if (dropdown && !dropdown.classList.contains('hidden')) {
                this.populateCharSwitcher();
            }
        });

        document.getElementById('char-switcher-list')?.addEventListener('scroll', (e) => {
            NavigationModule.updateDropdownScroll(e.target);
        });

        // System Selector Scroll
        document.getElementById('system-selector-options')?.addEventListener('scroll', (e) => {
            NavigationModule.updateDropdownScroll(e.target);
        });

        // Custom System Selector Trigger
        document.getElementById('system-selector-trigger')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const container = document.getElementById('system-selector-container');
            const wrapper = document.getElementById('system-selector-options-wrapper');
            const options = document.getElementById('system-selector-options');
            if (container?.classList.contains('open')) {
                container.classList.remove('open');
                wrapper?.classList.add('hidden');
            } else {
                container?.classList.add('open');
                wrapper?.classList.remove('hidden');
                if (options) NavigationModule.updateDropdownScroll(options);
            }
        });

        // Close dropdowns on global click
        document.addEventListener('click', () => {
            document.getElementById('char-switcher-dropdown')?.classList.add('hidden');
            document.getElementById('system-selector-container')?.classList.remove('open');
            document.getElementById('system-selector-options-wrapper')?.classList.add('hidden');
        });

        // Modal Close
        document.querySelectorAll('#modal-wrapper .close-modal, #modal-wrapper .modal-backdrop').forEach(el => el.addEventListener('click', () => this.closeModal()));
        document.querySelectorAll('.close-alert, #alert-ok-btn').forEach(el => el.addEventListener('click', () => document.getElementById('alert-modal').classList.add('hidden')));

        // Auth
        document.getElementById('login-btn')?.addEventListener('click', () => {
            if (this.user) {
                import('./auth.js').then(m => m.logout());
            } else {
                import('./auth.js').then(m => m.login());
            }
        });

        // Chat events are now handled by ChatUIModule

        // Bulk Delete Actions
        document.getElementById('bulk-delete-fichas-btn')?.addEventListener('click', () => this.toggleDeleteMode('character'));
        document.getElementById('confirm-bulk-delete')?.addEventListener('click', () => this.handleBulkDelete());

        // Summoning Overlay Handlers
        document.getElementById('finish-summoning-btn')?.addEventListener('click', () => {
            document.getElementById('summoning-overlay')?.classList.add('hidden');
        });
        document.getElementById('close-summoning-btn')?.addEventListener('click', () => {
            document.getElementById('summoning-overlay')?.classList.add('hidden');
        });
    },

    // --- Global Helpers ---
    closeSummoning() {
        document.getElementById('summoning-overlay')?.classList.add('hidden');
    },

    async resizeImage(file, w, h) { return resizeImage(file, w, h); }
};

// ── Mix in sub-module methods ──
Object.assign(app, createThemeMixin(app));
Object.assign(app, createChatMixin(app));
Object.assign(app, createModalsMixin(app));
Object.assign(app, createLoadersMixin(app));

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());
