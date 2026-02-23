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
import { GMPanelModule } from './modules/gm-panel.js';
import { PublicSessionsModule } from './modules/public-sessions.js';

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

        // 10% chance for Damien Kael Easter Egg (Temporary per session)
        // 10% Chance Damien, 10% Chance Eldrin, 80% Lyra
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
        this.bindEvents();
        this.initMusicPlayer();

        // Initialize Lyrics
        LyricsModule.init();

        // Initialize Items
        ItemsModule.init();

        // Initialize Admin
        AdminModule.init();

        WizardModule.initGuidanceListeners();
        ChangelogModule.loadChangelog();
        this.populateDataLists();

        // Init Dice
        DiceModule.init();

        // Init Spells
        SpellModule.init();

        // Init Monsters
        MonsterModule.init();

        // Init Content Modules (Generic)
        ContentModule.init();

        // Init Names
        NamesModule.init();

        // Init GM Panel
        GMPanelModule.init();

        // Check Changelog Notification
        const storedVersion = localStorage.getItem('lyraAppVersion');
        const badge = document.querySelector('.notification-badge');
        if (storedVersion !== APP_VERSION) {
            if (badge) badge.style.display = 'flex';
        } else {
            if (badge) badge.style.display = 'none';
        }

        // Start Trivia Rotation
        setInterval(() => this.showRandomTrivia(), 15000);

        // Expose helpers globally if needed by inline HTML (legacy)
        window.calculateModifier = calculateModifier;
        window.formatModifier = formatModifier;
    },

    showRandomTrivia() {
        const triviaEl = document.getElementById('rpg-trivia');
        if (!triviaEl) return;

        let trivia = RPG_TRIVIA[this.triviaIndex];

        // Damien Runic & Eldrin Poetic Conversion
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
        // Populate Races Datalist
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

            // Add click handlers
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

            // Update scroll indicators
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
            user: this.user,
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
            user: this.user,
            isInspection: this.isInspection
        };
    },

    getNavigationLoaders() {
        return {
            loadCharacters: () => this.loadCharacters(),
            loadMonsters: () => this.loadMonsters(),
            loadTraps: () => this.loadTraps(),
            loadSessions: () => this.loadSessions(),
            loadItems: () => ItemsModule.render(),
            loadMonsters: () => MonsterModule.render(),
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

                // Maintenance check is now handled by checkMaintenanceMode called in initAuth

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

                // Update modules
                window.CommunityModule = CommunityModule;
                CommunityModule.init(user);
                this.startPresenceHeartbeat(user.uid);
                this.startInvitationListener(user);
                this.loadUserData(user.uid); // Load other extensive data in background

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

        // Initial update
        updateUserPresence(userId);

        // Interval update every 3 minutes
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
            // Use userProfile if available, otherwise check if we have a user from auth (but role might not be loaded yet)
            // GM check is safer using this.userProfile which is populated in handleAuthStateChange
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
            // Carregar sessões do usuário
            this.loadSessions();
        } else if (viewId === 'public-sessions') {
            // Carregar sessões públicas
            PublicSessionsModule.loadPublicSessions();
        } else if (ContentModule.configs[viewId]) {
            ContentModule.switchToModule(viewId);
        } else if (viewId === 'names') {
            NamesModule.render();
        }

        // Update Music Player Visibility based on new view
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
            // User request: Always return to home (dashboard) on system change
            this.switchView('dashboard');
            this.populateCharSwitcher();
        }

        // Refresh dropdown UI to show correct 'selected' state
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

        this.chatHistory = []; // Reset history for the new character
        this.populateCharSwitcher();
    },

    // --- Loading Data wrappers ---
    async loadCharacters() {
        if (!this.user) return;
        const container = document.getElementById('fichas-list');

        // Update Title dynamically
        const titleEl = document.querySelector('#fichas .view-header h2');
        if (titleEl) {
            const system = SUPPORTED_SYSTEMS.find(s => s.id === this.currentSystem);
            const systemName = system ? system.name : this.currentSystem.toUpperCase();
            titleEl.innerHTML = `<i class="fas fa-user-shield"></i> Seus Personagens (${systemName})`;
        }

        const chars = await getCharacters(this.user.uid, this.currentSystem);
        container.innerHTML = chars.length ? chars.map(c => NavigationModule.renderCard(c, 'character')).join('') : '<p class="empty-state">Sem personagens.</p>';
    },
    async loadMonsters() {
        if (!this.user) return;
        const container = document.getElementById('monstros-grid');

        // Update Title dynamically
        const titleEl = document.querySelector('#monstros .view-header h2');
        if (titleEl) {
            const system = SUPPORTED_SYSTEMS.find(s => s.id === this.currentSystem);
            const systemName = system ? system.name : this.currentSystem.toUpperCase();
            titleEl.innerHTML = `<i class="fas fa-dragon"></i> Bestiário Arcano (${systemName})`;
        }

        MonsterModule.render();
    },
    async loadTraps() {
        if (!this.user) return;
        const container = document.getElementById('armadilhas-grid');

        // Update Title dynamically
        const titleEl = document.querySelector('#armadilhas .view-header h2');
        if (titleEl) {
            const system = SUPPORTED_SYSTEMS.find(s => s.id === this.currentSystem);
            const systemName = system ? system.name : this.currentSystem.toUpperCase();
            titleEl.innerHTML = `<i class="fas fa-skull-crossbones"></i> Armadilhas & Perigos (${systemName})`;
        }

        const items = await getTraps(this.user.uid, this.currentSystem);
        container.innerHTML = items.length ? items.map(c => NavigationModule.renderCard(c, 'trap')).join('') : '<p class="empty-state">Nenhuma armadilha.</p>';
    },
    async loadSessions() {
        if (!this.user) return;
        const container = document.getElementById('sessions-list');

        // Update Title dynamically
        const titleEl = document.querySelector('#sessoes .view-header h2');
        if (titleEl) {
            const system = SUPPORTED_SYSTEMS.find(s => s.id === this.currentSystem);
            const systemName = system ? system.name : this.currentSystem.toUpperCase();
            titleEl.innerHTML = `<i class="fas fa-feather-pointed"></i> Diários de Sessão (${systemName})`;
        }

        const items = await getSessions(this.user.uid, this.user.email, this.currentSystem);

        // 🏰 Nickname Hydration for "Meus Registros"
        const { PublicSessionsModule } = await import('./modules/public-sessions.js');
        const hydratedItems = [];
        for (const item of items) {
            if (!item.masterNickname && item.userId) {
                item.masterNickname = await PublicSessionsModule.getNickname(item.userId);
            }
            hydratedItems.push(item);
        }

        container.innerHTML = hydratedItems.length ? hydratedItems.map(c => NavigationModule.renderCard(c, 'session')).join('') : '<p class="empty-state">Nenhuma sessão.</p>';

        // Also refresh invites
        this.renderInvites();
    },

    async renderInvites() {
        if (!this.user) return;
        const mainContainer = document.getElementById('invites-list');
        const modalContainer = document.getElementById('modal-notifications-list');

        const { getInvites } = await import('./data.js');
        const invites = await getInvites(this.user.email);

        const renderHTML = (items) => {
            if (items.length === 0) return '<p class="empty-state">O horizonte está calmo. Nenhuma nova mensagem dos corvos.</p>';
            return items.map(inv => `
                <div class="notif-card invite parchment-mini" data-id="${inv.id}">
                    <div class="notif-header">
                        <i class="fas fa-envelope-open-text"></i>
                        <strong>Nova Jornada Disponível</strong>
                    </div>
                    <div class="notif-body">
                        Você foi convocado para a sessão <strong>${inv.sessionId.substring(0, 8)}...</strong>
                    </div>
                    <div class="notif-actions">
                        <button class="medieval-btn small accept-invite"><i class="fas fa-check"></i> Aceitar</button>
                        <button class="medieval-btn small secondary refuse-invite"><i class="fas fa-times"></i> Recusar</button>
                    </div>
                </div>
            `).join('');
        };

        const html = renderHTML(invites);

        if (mainContainer) {
            mainContainer.innerHTML = invites.length ? `
                <div class="invites-header">
                    <h3><i class="fas fa-envelope-open-text"></i> Convites de Jornada</h3>
                </div>
                <div class="invites-grid">${html}</div>
            ` : '';
            mainContainer.classList.toggle('hidden', invites.length === 0);
        }

        if (modalContainer) {
            modalContainer.innerHTML = html;
        }

        // Bind events for both containers
        [mainContainer, modalContainer].forEach(container => {
            if (!container) return;
            container.querySelectorAll('.accept-invite').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.closest('.notif-card, .invite-card').dataset.id;
                    this.handleInviteDecision(id, 'accepted');
                });
            });

            container.querySelectorAll('.refuse-invite').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.closest('.notif-card, .invite-card').dataset.id;
                    this.handleInviteDecision(id, 'refused');
                });
            });
        });
    },

    async handleInviteDecision(inviteId, status) {
        try {
            this.toggleLoading(true);
            const { db } = await import('./auth.js');
            const { doc, updateDoc, deleteDoc } = await import('firebase/firestore');

            const inviteRef = doc(db, "session_invites", inviteId);
            if (status === 'accepted') {
                const updateData = { status: 'accepted' };
                if (this.user?.uid) {
                    updateData.uid = this.user.uid;
                }
                await updateDoc(inviteRef, updateData);
                this.showAlert("Você agora faz parte desta jornada!", "Convite Aceito");
            } else {
                await deleteDoc(inviteRef);
                this.showAlert("O mensageiro retornou ao vácuo.", "Convite Recusado");
            }

            this.loadSessions();
        } catch (error) {
            console.error("Erro ao processar convite:", error);
            this.showAlert(translateFirebaseError(error), "Erro Arcano");
        } finally {
            this.toggleLoading(false);
        }
    },

    startInvitationListener(user) {
        if (this.inviteUnsubscribe) this.inviteUnsubscribe();

        import('./auth.js').then(({ db }) => {
            import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
                const q = query(
                    collection(db, "session_invites"),
                    where("email", "==", user.email.toLowerCase()),
                    where("status", "==", "invited")
                );

                this.inviteUnsubscribe = onSnapshot(q, (snapshot) => {
                    if (!snapshot.empty) {
                        const count = snapshot.size;
                        const badge = document.querySelector('.notification-badge');
                        if (badge) {
                            badge.textContent = count;
                            badge.style.display = 'flex';
                        }

                        // If current view is sessions, refresh
                        if (this.currentView === 'sessoes') {
                            this.renderInvites();
                        }
                    } else {
                        const badge = document.querySelector('.notification-badge');
                        if (badge && badge.textContent !== '!') {
                            badge.style.display = 'none';
                        }
                        if (this.currentView === 'sessoes') {
                            this.renderInvites();
                        }
                    }
                });
            });
        });
    },

    // --- Helpers ---
    checkAuth() {
        if (!this.user) {
            this.showAlert("Você precisa estar logado para acessar os tomos proibidos.", "Acesso Negado");
            return false;
        }
        return true;
    },

    openModal(id) {
        const wrapper = document.getElementById('modal-wrapper');
        const modalBody = document.getElementById('modal-body');
        const detailContainer = document.getElementById('detail-container');

        if (wrapper) {
            wrapper.classList.add('active');
            wrapper.classList.remove('hidden');
            const content = wrapper.querySelector('.parchment');
            if (content) content.scrollTop = 0;
        }

        // Reset Inspection state unless manually opening character sheet for another player
        if (id !== 'character-sheet') {
            this.isInspection = false;
        }

        // Restore modal body if it was hidden by Item Detail view
        if (modalBody) modalBody.classList.remove('hidden');
        if (detailContainer) {
            detailContainer.innerHTML = '';
            detailContainer.classList.add('hidden');
        }

        document.querySelectorAll('.wizard-container, .sheet-container, .wizard-step').forEach(c => c.classList.add('hidden'));
        const target = document.getElementById(id);
        if (target) target.classList.remove('hidden');
        NavigationModule.updateScrollIndicators();
    },

    closeModal() {
        if (SettingsModule.isNicknameRequired) {
            this.showAlert("Você precisa definir um Apelido Arcano antes de prosseguir para as Terras do Oeste.", "Destino Selado");
            return;
        }

        const wrapper = document.getElementById('modal-wrapper');
        const modalBody = document.getElementById('modal-body');
        const detailContainer = document.getElementById('detail-container');

        if (wrapper) {
            wrapper.classList.remove('active');
            wrapper.classList.add('hidden');
        }

        // Cleanup: Always ensure modal-body is ready for next open
        if (modalBody) modalBody.classList.remove('hidden');
        if (detailContainer) {
            detailContainer.innerHTML = '';
            detailContainer.classList.add('hidden');
        }
    },

    closeAlert() {
        const alertModal = document.getElementById('alert-modal');
        if (alertModal) alertModal.classList.add('hidden');
    },

    showAlert(message, title = "Decreto Real") {
        const modal = document.getElementById('alert-modal');
        const titleEl = document.getElementById('alert-title');
        const messageEl = document.getElementById('alert-message');
        if (modal && titleEl && messageEl) {
            titleEl.innerText = title;
            messageEl.innerText = message;
            modal.classList.remove('hidden');
        } else alert(message);
    },

    openAIPromptModal() {
        const modal = document.getElementById('monster-ai-prompt-modal');
        document.getElementById('ai-monster-prompt').value = '';
        modal.classList.remove('hidden');
    },

    showConfirm(message, title = "Confirmação Mística") {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-title');
            const messageEl = document.getElementById('confirm-message');
            const okBtn = document.getElementById('confirm-ok-btn');
            const cancelBtn = document.getElementById('confirm-cancel-btn');

            if (!modal || !okBtn || !cancelBtn) {
                resolve(confirm(message));
                return;
            }

            titleEl.innerText = title;
            messageEl.innerText = message;
            modal.classList.remove('hidden');

            const cleanup = (result) => {
                modal.classList.add('hidden');
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                resolve(result);
            };

            okBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);
        });
    },

    toggleLoading(show) {
        const loading = document.getElementById('mystic-loading');
        if (loading) loading.classList.toggle('hidden', !show);
    },

    async resizeImage(file, w, h) { return resizeImage(file, w, h); },

    // --- Chat ---
    async handleSendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        // Debounce / Rate Limit
        const now = Date.now();
        if (now - (this.lastMessageTime || 0) < 2000) {
            this.showAlert("Aguarde um pouco antes de enviar outra mensagem.", "Calma, viajante!");
            return;
        }

        if (!message || this.isWaitingForAI) return;
        if (!this.user) {
            this.addChatMsg('bot', "⚠️ Voce precisa fazer login.");
            return;
        }

        this.lastMessageTime = now;
        this.addChatMsg('user', message);
        input.value = '';
        this.isWaitingForAI = true;

        try {
            const idToken = await this.user.getIdToken();
            const aiContext = await this.getAIContext();
            const response = await sendMessageToLyra(message, idToken, this.chatHistory, aiContext, this.currentThemeName);
            this.addChatMsg('bot', response);
            this.chatHistory.push(
                { role: 'user', parts: [{ text: message }] },
                { role: 'model', parts: [{ text: response }] }
            );
        } catch (error) {
            console.error(error);
            this.addChatMsg('bot', "Falha mística...");
        } finally { this.isWaitingForAI = false; }
    },

    async getAIContext() {
        if (!this.user) return "";
        try {
            const characters = await getCharacters(this.user.uid, this.currentSystem);
            if (!characters || characters.length === 0) return "[Nenhum personagem encontrado no Salão das Fichas]";

            let context = "Você tem acesso ao Salão das Fichas atual:\n";
            characters.forEach(c => {
                context += `- ${c.name || c.bio?.name || 'Sem Nome'} (${c.bio?.race || '?'} ${c.bio?.class || '?'}, Nível ${c.bio?.level || 1})\n`;
            });

            if (this.currentCharacter) {
                const c = this.currentCharacter;
                context += `\n=== PERSONAGEM EM FOCO ===\n`;
                context += `Nome: ${c.name || 'Sem Nome'}\n`;
                context += `Raça/Classe: ${c.bio?.race || '?'} ${c.bio?.class || '?'}, Nível ${c.bio?.level || 1}\n`;
                context += `Vida: ${c.stats?.hp_current}/${c.stats?.hp_max} | CA: ${c.stats?.ac} | Ini: ${c.stats?.initiative > 0 ? '+' : ''}${c.stats?.initiative || 0}\n`;

                // Attributes
                const attrs = c.attributes || {};
                context += `Atributos: FOR ${attrs.str || 10}, DES ${attrs.dex || 10}, CON ${attrs.con || 10}, INT ${attrs.int || 10}, SAB ${attrs.wis || 10}, CAR ${attrs.cha || 10}\n`;

                // Proficient Skills (Only show proficient to save tokens)
                const skills = c.stats?.skills || {};
                const profSkills = Object.entries(skills).filter(([_, val]) => val.prof).map(([key, _]) => key).join(', ');
                if (profSkills) context += `Perícias: ${profSkills}\n`;

                // Inventory (Summary)
                if (c.inventory?.items && c.inventory.items.length > 0) {
                    const items = c.inventory.items.map(i => i.name).join(', ');
                    context += `Posses e Inventário: ${items}\n`;
                }

                if (c.story?.appearance) context += `Aparência: ${c.story.appearance}\n`;
                if (c.story?.backstory) context += `História (Resumo): ${c.story.backstory.substring(0, 300)}...\n`;
            }
            return context;
        } catch (e) {
            return "[Erro ao consultar o Salão das Fichas]";
        }
    },

    addChatMsg(sender, text) {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = `msg ${sender}`;
        if (sender === 'bot') {
            let avatar = 'assets/tokens/lyra.png';
            if (this.currentThemeName === 'damien') avatar = 'assets/tokens/damien.png';
            if (this.currentThemeName === 'eldrin') avatar = 'assets/tokens/eldrin.png';

            div.innerHTML = `<img src="${avatar}" class="chat-avatar"><span class="msg-content">${parseMarkdown(text)}</span>`;
        } else {
            div.innerHTML = `<span class="msg-content">${parseMarkdown(text)}</span>`;
        }
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },



    checkMusicAutoPlay() {
        const player = document.getElementById('mystic-player');
        const audio = document.getElementById('lyra-bg-music');
        const playBtn = document.getElementById('btn-play-pause');
        const autoPlayPref = document.getElementById('setting-autoplay');

        if (!audio || !playBtn) return;

        // Check Preference
        if (autoPlayPref && !autoPlayPref.checked) {
            console.log("🔇 Auto-play bloqueado por preferência do usuário.");
            this.shouldAutoPlay = false; // Flag to prevent interaction auto-play
            return;
        }

        this.shouldAutoPlay = true;

        audio.volume = 0.4;
        audio.play().then(() => {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            if (player) player.classList.add('playing');
        }).catch(e => {
            console.log("Autoplay waiting for interaction...");
        });
    },

    // --- Theme Manager ---
    setTheme(themeName) {
        this.currentThemeName = themeName || 'lyra';
        localStorage.setItem('lyra_current_theme', this.currentThemeName);
        const isDamien = (themeName === 'damien');
        const isEldrin = (themeName === 'eldrin');

        this.isDamien = isDamien; // Legacy flag for compatibility
        this.chatHistory = []; // Reset history for the new persona

        const body = document.body;
        const logo = document.querySelector('.header-logo');
        const lyraImg = document.querySelector('.hero-lyra');
        const scrollTitle = document.querySelector('.scroll-title');
        const sheetToken = document.getElementById('sheet-token');
        const hToken = document.getElementById('header-token');

        // Music Switch
        const audio = document.getElementById('lyra-bg-music');
        const trackName = document.querySelector('.track-name');

        // Reset Classes
        body.classList.remove('damien-theme', 'eldrin-theme', 'lyra-theme');

        // Reset Custom Properties (Lyra Default)
        document.documentElement.style.removeProperty('--gold');
        document.documentElement.style.removeProperty('--gold-light');
        document.documentElement.style.setProperty('--parchment', '#fcf5e5');
        document.documentElement.style.removeProperty('--ink');
        document.documentElement.style.removeProperty('--text-dark');

        let targetSrc = 'assets/music/lyra-theme.mp3';
        let targetName = 'The Whisper of the Stars';
        let aiName = 'Lyra';
        let logoSrc = 'assets/Lyra_logo.png';
        let heroSrc = 'assets/Lyra_the_wise.png';
        let titleText = "Conhecimento Arcano";

        // Apply Theme
        if (isDamien) {
            body.classList.add('damien-theme');
            document.documentElement.style.setProperty('--gold', '#9d6eff');
            document.documentElement.style.setProperty('--gold-light', '#bfa6ff');
            document.documentElement.style.setProperty('--parchment', '#1a1025');
            document.documentElement.style.setProperty('--ink', '#e0d5ff');
            document.documentElement.style.setProperty('--text-dark', '#e0d5ff');

            targetSrc = 'assets/music/damien-theme.mp3';
            targetName = 'The Hunger Beyond the Veil';
            aiName = 'Damien';
            logoSrc = 'assets/Damien_logo.png';
            heroSrc = 'assets/Damien_Kael.png';
            titleText = "Sussurros do Abismo";

        } else if (isEldrin) {
            body.classList.add('eldrin-theme');
            // Eldrin Vars are handled in CSS class

            targetSrc = 'assets/music/the-bard-theme.mp3';
            targetName = 'The Bard’s Lament';
            aiName = 'Eldrin';
            logoSrc = 'assets/Eldrin_logo.png';
            heroSrc = 'assets/Eldrin_the_Bard.png';
            titleText = "Canções de Outrora";
        } else {
            body.classList.add('lyra-theme');
        }

        // Logic Updates
        if (logo) logo.src = logoSrc;
        if (lyraImg) lyraImg.src = heroSrc;
        if (scrollTitle) scrollTitle.textContent = titleText;

        // Chat Buttons
        const chatBtns = document.querySelectorAll('button[data-view="chat"]');
        chatBtns.forEach(btn => {
            const fontStyle = 'font-family: var(--font-medieval); font-weight: bold; font-size: 0.9rem;';
            const pulseDiv = btn.querySelector('.portal-pulse');
            btn.innerHTML = `<i class="fas fa-comment-dots"></i> <span style='${fontStyle}'>Fale com ${aiName}</span>`;
            if (pulseDiv) btn.appendChild(pulseDiv);
        });

        const chatHeaderTitle = document.querySelector('.chat-header h2');
        if (chatHeaderTitle) chatHeaderTitle.innerHTML = `<i class="fas fa-scroll"></i> Pergunte a ${aiName}`;

        // Dynamic Persona Names in AI Modals
        const personaNames = [
            'spell-ai-persona',
            'monster-ai-persona-name',
            'generic-ai-persona-name'
        ];
        personaNames.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = aiName;
        });

        // Sync AI Prompt Placeholders
        this.updateAIPlaceholders(aiName);

        // Lyrics
        LyricsModule.setTheme(themeName);

        // Tokens
        if (sheetToken && (sheetToken.src.includes('Lyra') || sheetToken.src.includes('Damien') || sheetToken.src.includes('Eldrin'))) {
            // Only swap if it's a default token
            sheetToken.src = `assets/tokens/${aiName.toLowerCase()}.png`;
        }
        if (hToken) {
            hToken.src = `assets/tokens/${aiName.toLowerCase()}.png`;
        }

        // Update Existing Chat Avatars
        const chatAvatars = document.querySelectorAll('.chat-avatar');
        chatAvatars.forEach(img => {
            img.src = `assets/tokens/${aiName.toLowerCase()}.png`;
        });

        // Music Logic (Restored)
        if (audio) {
            const currentSrc = audio.getAttribute('src');
            const nowPlaying = document.querySelector('.player-now-playing');

            // UI Updates
            if (trackName) trackName.textContent = targetName;
            if (nowPlaying) nowPlaying.textContent = targetName;

            // Only reload if source changed
            if (currentSrc !== targetSrc) {
                const wasPlaying = !audio.paused;
                audio.src = targetSrc;
                if (wasPlaying) audio.play().catch(e => console.log("Audio play blocked", e));
            }
        }
    },

    initMusicPlayer() {
        const audio = document.getElementById('lyra-bg-music');
        if (!audio) return;


        const floatBtn = document.getElementById('btn-play-pause-float');
        const floatVolume = document.getElementById('player-volume-float');
        const floatProgress = document.getElementById('player-progress-bar-float');
        const floatContainer = document.getElementById('mystic-player');
        const floatToggle = document.getElementById('music-player-orb');
        const floatMinimize = document.querySelector('.player-minimize');


        const miniContainer = document.getElementById('gm-mini-music');
        const miniBtn = document.getElementById('btn-play-pause-mini');
        const miniVolume = document.getElementById('player-volume-mini');


        let isPlaying = false;


        const togglePlay = () => {
            if (audio.paused) {
                audio.play().then(() => {
                    isPlaying = true;
                    updateIcons();
                }).catch(e => console.error("Audio Play Error:", e));
            } else {
                audio.pause();
                isPlaying = false;
                updateIcons();
            }
        };

        const updateIcons = () => {
            const iconClass = isPlaying ? 'fa-pause' : 'fa-play';
            if (floatBtn) floatBtn.innerHTML = `<i class="fas ${iconClass}"></i>`;
            if (miniBtn) miniBtn.innerHTML = `<i class="fas ${iconClass}"></i>`;

            // Apply 'playing' class to the container for CSS animations (rotate/pulse)
            if (floatContainer) {
                if (isPlaying) floatContainer.classList.add('playing');
                else floatContainer.classList.remove('playing');
            }
        };


        const setVolume = (val) => {
            audio.volume = val;
            if (floatVolume) floatVolume.value = val;
            if (miniVolume) miniVolume.value = val;
        };


        if (floatBtn) floatBtn.addEventListener('click', togglePlay);
        if (miniBtn) miniBtn.addEventListener('click', togglePlay);

        if (floatVolume) floatVolume.addEventListener('input', (e) => setVolume(e.target.value));
        if (miniVolume) miniVolume.addEventListener('input', (e) => setVolume(e.target.value));

        if (audio) {
            audio.addEventListener('timeupdate', () => {
                if (floatProgress) {
                    const percent = (audio.currentTime / audio.duration) * 100;
                    floatProgress.style.width = `${percent}%`;
                }
            });

            audio.addEventListener('ended', () => {
                isPlaying = false;
                updateIcons();
            });
        }


        setVolume(0.5);


        if (floatToggle) {
            floatToggle.addEventListener('click', () => {
                floatContainer.classList.toggle('collapsed');
            });
        }
        if (floatMinimize) {
            floatMinimize.addEventListener('click', () => {
                floatContainer.classList.add('collapsed');
            });
        }


        this.updateMusicPlayerVisibility = () => {
            const currentView = this.currentView || 'dashboard';

            const isSessionOrGM = currentView === 'gm-panel' || currentView === 'session-stage' || currentView.startsWith('session-');

            if (isSessionOrGM) {
                if (floatContainer) floatContainer.classList.add('hidden');
                if (miniContainer) miniContainer.classList.remove('hidden');
            } else {
                if (floatContainer) floatContainer.classList.remove('hidden');
                if (miniContainer) miniContainer.classList.add('hidden');
            }
        };


        this.updateMusicPlayerVisibility();
    },

    updateAIPlaceholders(persona) {
        const placeholders = {
            'ai-spell-prompt': `Descreva a magia que deseja que ${persona} materialize...`,
            'ai-monster-prompt': `Descreva a criatura que deseja que ${persona} invoque...`,
            'generic-ai-prompt': `Descreva sua criação e deixe que ${persona} molde a essência...`
        };

        Object.entries(placeholders).forEach(([id, text]) => {
            const el = document.getElementById(id);
            if (el) {
                el.placeholder = text;
                el.rows = 8; // Global standardization to 8 rows
            }
        });
    },

    cycleTheme() {
        if (this.currentThemeName === 'lyra') this.setTheme('damien');
        else if (this.currentThemeName === 'damien') this.setTheme('eldrin');
        else this.setTheme('lyra');
    },






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

        // GLOBAL CLICK DELEGATE (Cards)
        document.addEventListener('click', (e) => {
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

            // Handle selection cards (Sessões, NPCs, etc.)
            const selectionCard = e.target.closest('.selection-card');
            if (selectionCard) {
                const target = selectionCard.dataset.target;
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

        // Wizard Controls
        document.getElementById('wiz-next')?.addEventListener('click', () => WizardModule.updateWizardStep(1));
        document.getElementById('wiz-prev')?.addEventListener('click', () => WizardModule.updateWizardStep(-1));
        document.getElementById('wiz-finish')?.addEventListener('click', () => WizardModule.handleWizardFinish(this.getWizardContext()));

        document.getElementById('mon-finish-btn')?.addEventListener('click', () => WizardModule.handleMonsterFinish(this.getWizardContext()));
        document.getElementById('sess-finish-btn')?.addEventListener('click', () => WizardModule.handleSessionFinish(this.getWizardContext()));
        document.getElementById('sess-next')?.addEventListener('click', () => WizardModule.updateWizardStep(1));
        document.getElementById('sess-magic-fill')?.addEventListener('click', () => WizardModule.fillSessionBlanksWithAI(this.getWizardContext()));
        document.getElementById('sess-prev')?.addEventListener('click', () => WizardModule.updateWizardStep(-1));

        // Wizard Entry Points
        document.getElementById('show-wizard-btn')?.addEventListener('click', () => WizardModule.showCreationWizard(this.getWizardContext()));
        document.getElementById('show-monster-btn')?.addEventListener('click', () => WizardModule.showMonsterCreator(this.getWizardContext()));
        document.getElementById('show-trap-btn')?.addEventListener('click', () => WizardModule.showTrapCreator(this.getWizardContext()));

        // Wizard Choice Cards
        document.querySelectorAll('.choice-card').forEach(card => card.addEventListener('click', (e) => WizardModule.handleChoiceClick(e.currentTarget)));


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
        document.querySelectorAll('.sheet-tab').forEach(tab => {
            tab.addEventListener('click', (e) => SheetModule.switchSheetTab(e.currentTarget.dataset.tab, this.getSheetContext()));
        });

        // Dynamic Lists

        // Global Action: Delete List Item & Prof Toggle
        document.getElementById('character-sheet')?.addEventListener('click', (e) => {
            if (SheetModule.isInspection) return; // Surgical guard
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
            // Allow clicking the entire proficiency row (skill or save)
            const profBtn = e.target.closest('.prof-toggle') || e.target.closest('.skill-item') || e.target.closest('.save-item');
            if (profBtn) {
                // If we clicked the row, find the actual toggle button or its data
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

        // Chat
        document.getElementById('send-msg-btn')?.addEventListener('click', () => this.handleSendMessage());
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleSendMessage(); });

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
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());
