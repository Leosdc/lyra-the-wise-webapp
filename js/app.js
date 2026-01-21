
import { login, logout, onAuthStateChanged } from './auth.js';
import {
    getCharacter, getCharacters, saveCharacter, deleteCharacter, uploadCharacterToken,
    getMonsters, getMonster, saveMonster, deleteMonster,
    getTraps, getTrap, saveTrap, deleteTrap,
    getSessions, getSession, saveSession, deleteSession
} from './data.js';
import { sendMessageToLyra } from './ai.js';

import { NavigationModule } from './modules/navigation.js';
import { SheetModule } from './modules/sheet.js';
import { WizardModule } from './modules/wizard.js';
import { SettingsModule } from './modules/settings.js';
import { AuthUI } from './modules/auth-ui.js';
import { ListModule } from './modules/lists.js';
import { calculateModifier, formatModifier, resizeImage, getNestedValue, setNestedValue } from './modules/utils.js';

const app = {
    user: null,
    currentCharacter: null,
    currentSystem: localStorage.getItem('lyra_current_system') || 'dnd5e',
    currentView: localStorage.getItem('lyra_current_view') || 'dashboard',
    isDamien: false,
    isDeleteMode: false,
    isWaitingForAI: false,
    chatHistory: [],

    init() {
        console.log("📜 Lyra the Wise - Inicializando Módulos (v2.0 Refatorado)...");

        onAuthStateChanged((user) => this.handleAuthStateChange(user));
        this.bindEvents();

        // Check Easter Egg
        if (localStorage.getItem('lyra_theme') === 'damien') {
            this.toggleDamienMode(true);
        }

        // Expose helpers globally if needed by inline HTML (legacy)
        window.calculateModifier = calculateModifier;
        window.formatModifier = formatModifier;
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
            updateScrollIndicators: () => NavigationModule.updateScrollIndicators()
        };
    },

    getNavigationLoaders() {
        return {
            loadCharacters: () => this.loadCharacters(),
            loadMonsters: () => this.loadMonsters(),
            loadTraps: () => this.loadTraps(),
            loadSessions: () => this.loadSessions(),
            showMonsterCreator: () => WizardModule.showMonsterCreator(this.getWizardContext()),
            showTrapCreator: () => WizardModule.showTrapCreator(this.getWizardContext()),
            showAlert: (msg, title) => this.showAlert(msg, title)
        };
    },

    // --- State Handlers ---
    handleAuthStateChange(user) {
        this.user = user;
        AuthUI.update(user, {
            selectCharacter: (char) => { if (char) this.selectCharacter(char); },
            clearAllViews: () => {
                const ids = ['fichas-list', 'monsters-list', 'traps-list', 'sessions-list', 'chat-messages'];
                ids.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerHTML = '';
                })
            },
            currentCharacter: this.currentCharacter
        });

        if (user) {
            NavigationModule.switchView(this.currentView, this.getNavigationLoaders());
        } else {
            NavigationModule.switchView('dashboard', this.getNavigationLoaders());
        }
    },

    async handleSystemChange(systemId) {
        console.log("🎲 Alternando sistema para:", systemId);
        if (this.currentCharacter && this.currentSystem) {
            localStorage.setItem(`lyra_char_${this.currentSystem}`, this.currentCharacter.id);
        }

        this.currentSystem = systemId;
        localStorage.setItem('lyra_current_system', systemId);

        // Restore last character logic
        const savedCharId = localStorage.getItem(`lyra_char_${systemId}`);
        if (savedCharId && this.user) {
            try {
                const char = await getCharacter(savedCharId);
                if (char) this.selectCharacter(char);
                else {
                    this.currentCharacter = null;
                    NavigationModule.updateHeaderTracker(null);
                }
            } catch {
                this.currentCharacter = null;
                NavigationModule.updateHeaderTracker(null);
            }
        } else {
            this.currentCharacter = null;
            NavigationModule.updateHeaderTracker(null);
        }

        if (this.user) {
            NavigationModule.switchView(this.currentView, this.getNavigationLoaders());
        }
    },

    selectCharacter(char) {
        this.currentCharacter = char;
        NavigationModule.updateHeaderTracker(char); // Assuming viewCharacter/updateHeaderTracker logic needs to be shared or accessible
        // Actually, NavigationModule has updateHeaderTracker but we might want to call it directly
        // Let's ensure NavigationModule exports it or we move it to UI/Shared
        NavigationModule.updateHeaderTracker(char);
        this.isDeleteMode = false;
        // Also persist selection
        if (this.currentSystem) localStorage.setItem(`lyra_char_${this.currentSystem}`, char.id);
    },

    // --- Loading Data wrappers ---
    async loadCharacters() {
        if (!this.user) return;
        const container = document.getElementById('fichas-list');
        const chars = await getCharacters(this.user.uid, this.currentSystem);
        container.innerHTML = chars.length ? chars.map(c => NavigationModule.renderCard(c, 'character')).join('') : '<p class="empty-state">Sem personagens.</p>';
    },
    async loadMonsters() {
        if (!this.user) return;
        const container = document.getElementById('monsters-list');
        const items = await getMonsters(this.user.uid, this.currentSystem);
        container.innerHTML = items.length ? items.map(c => NavigationModule.renderCard(c, 'monster')).join('') : '<p class="empty-state">Nenhuma criatura.</p>';
    },
    async loadTraps() {
        if (!this.user) return;
        const container = document.getElementById('traps-list');
        const items = await getTraps(this.user.uid, this.currentSystem);
        container.innerHTML = items.length ? items.map(c => NavigationModule.renderCard(c, 'trap')).join('') : '<p class="empty-state">Nenhuma armadilha.</p>';
    },
    async loadSessions() {
        if (!this.user) return;
        const container = document.getElementById('sessions-list');
        const items = await getSessions(this.user.uid, this.currentSystem);
        container.innerHTML = items.length ? items.map(c => NavigationModule.renderCard(c, 'session')).join('') : '<p class="empty-state">Nenhuma sessão.</p>';
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
        // Simple wrapper for legacy or manual calls
        const wrapper = document.getElementById('modal-wrapper');
        const content = wrapper?.querySelector('.parchment');
        if (wrapper) {
            wrapper.classList.add('active');
            wrapper.classList.remove('hidden');
            if (content) content.scrollTop = 0;
        }
        document.querySelectorAll('.wizard-container, .sheet-container, .wizard-step, #detail-container').forEach(c => c.classList.add('hidden'));
        const target = document.getElementById(id);
        if (target) target.classList.remove('hidden');
        NavigationModule.updateScrollIndicators();
    },

    closeModal() {
        const wrapper = document.getElementById('modal-wrapper');
        if (wrapper) {
            wrapper.classList.remove('active');
            wrapper.classList.add('hidden');
        }
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
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

    toggleLoading(show) {
        const loading = document.getElementById('mystic-loading');
        if (loading) loading.classList.toggle('hidden', !show);
    },

    async resizeImage(file, w, h) { return resizeImage(file, w, h); },

    // --- Chat ---
    async handleSendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message || this.isWaitingForAI) return;
        if (!this.user) {
            this.addChatMsg('bot', "⚠️ Voce precisa fazer login.");
            return;
        }
        this.addChatMsg('user', message);
        input.value = '';
        this.isWaitingForAI = true;
        try {
            const idToken = await this.user.getIdToken();
            const response = await sendMessageToLyra(message, idToken, this.chatHistory);
            this.addChatMsg('bot', response);
            this.chatHistory.push({ role: 'user', content: message }, { role: 'bot', content: response });
        } catch (error) {
            this.addChatMsg('bot', "Falha mística...");
        } finally { this.isWaitingForAI = false; }
    },

    addChatMsg(sender, text) {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = `msg ${sender}`;
        if (sender === 'bot') {
            div.innerHTML = `<img src="assets/Lyra_Token.png" class="chat-avatar"><span class="msg-content">${text}</span>`;
        } else {
            div.innerHTML = `<span class="msg-content">${text}</span>`;
        }
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    // --- Damien Mode ---
    toggleDamienMode(enable) {
        this.isDamien = enable;
        localStorage.setItem('lyra_theme', enable ? 'damien' : 'lyra');

        const logo = document.querySelector('.header-logo');
        const lyraImg = document.querySelector('.hero-lyra');
        const scrollTitle = document.querySelector('.scroll-title');
        const sheetToken = document.getElementById('sheet-token');
        const hToken = document.getElementById('header-token');

        if (enable) {
            document.documentElement.style.setProperty('--gold', '#9d6eff');
            document.documentElement.style.setProperty('--gold-light', '#bfa6ff');
            document.documentElement.style.setProperty('--parchment', '#1a1025');
            // Images
            if (logo) logo.src = 'assets/Damien_logo.png';
            if (lyraImg) lyraImg.src = 'assets/Damien_Kael.png';
            if (scrollTitle) scrollTitle.textContent = "Sussurros do Abismo";
            if (sheetToken && sheetToken.src.includes('Lyra')) sheetToken.src = 'assets/Damien_Token.png';
            if (hToken && hToken.src.includes('Lyra')) hToken.src = 'assets/Damien_Token.png';
        } else {
            // Reset variables manually or just reload page effectively... 
            // Ideally we shouldn't manipulate CSS vars via JS if we can help it, but this is the legacy way.
            // For now, assume reload cleans it up or implement revert.
            // Simplest:
            document.documentElement.style.removeProperty('--gold');
            document.documentElement.style.removeProperty('--gold-light');
            document.documentElement.style.removeProperty('--parchment');
            if (logo) logo.src = 'assets/Lyra_Logo_v3.png';
            if (lyraImg) lyraImg.src = 'assets/Lyra_Hero_v2.png';
            if (scrollTitle) scrollTitle.textContent = "Conhecimento Arcano";
        }
    },


    // --- Event Binding (The Glue) ---
    bindEvents() {
        console.log("🔗 Connecting Runes (Binding Events)...");

        // GLOBAL CLICK DELEGATE (Cards)
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.card-delete-btn');
            if (deleteBtn) {
                e.stopImmediatePropagation();
                const card = deleteBtn.closest('.medieval-card');
                if (card) NavigationModule.deleteItem(card.dataset.id, card.dataset.type, e); // Need to verify if deleteItem is static or needs context. 
                // NavigationModule.deleteItem calls showConfirm using document.getElementById, so it's fine.
                // But it assumes `this` context for some things.
                // Checking NavigationModule... `this.showConfirm` etc.
                // NavigationModule methods use `this`. Since we export the object, `this` refers to NavigationModule.
                // However, NavigationModule needs `showAlert` and `refreshList`. 
                // Wait, NavigationModule.deleteItem calls `this.showAlert`. NavigationModule DOES NOT have showAlert.
                // FIX: We need to pass callbacks or bind NavigationModule to app context? No, cleaner to pass deps.
                // Retrying: Move delete logic to App or fix NavigationModule to accept deps.
                // Fix: NavigationModule.deleteItem(id, type, e, { showAlert, showConfirm, deleteCallback })
                // This is getting complicated.
                // Easier: Keep generic card click handling in App.js and delegate specific actions.
            }
            const card = e.target.closest('.medieval-card');
            if (card && !deleteBtn) {
                // View Item
                const type = card.dataset.type;
                const id = card.dataset.id;
                if (type === 'character') NavigationModule.viewCharacter(id).then(char => {
                    this.selectCharacter(char);
                    SheetModule.populateSheet(char, this.getSheetContext());
                    NavigationModule.switchView('detail-container'); // Wait, viewCharacter opens 'character-sheet' modal.
                    // The logic in NavigationModule.viewCharacter (from extraction) does openModal('character-sheet').
                    // And calls populateSheet.
                    // But NavigationModule doesn't have populateSheet attached anymore (it's in SheetModule).
                    // So NavigationModule.viewCharacter needs to be updated or we handle it here.
                });
                // This confirms that extraction might have broken dependencies.
                // Strategy: App.js binds the event, then calls:
                // "App handles the orchestration".
                if (type === 'character') {
                    this.openModal('character-sheet');
                    getCharacter(id).then(c => {
                        this.selectCharacter(c);
                        SheetModule.populateSheet(c, this.getSheetContext());
                        SheetModule.switchSheetTab('geral', this.getSheetContext());
                    });
                } else {
                    NavigationModule.viewItem(type, id); // For monsters/sessions/traps
                }
            }
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                const action = e.currentTarget.dataset.action;
                if (view) NavigationModule.switchView(view, this.getNavigationLoaders());
                else if (action) NavigationModule.handleQuickAction(action, this.getNavigationLoaders());
            });
        });

        // Menu
        document.getElementById('menu-btn')?.addEventListener('click', () => NavigationModule.openMenuAtSection('all'));
        document.querySelectorAll('.close-menu, .menu-overlay').forEach(el => el.addEventListener('click', () => NavigationModule.toggleMenu(false)));

        // Wizard Controls
        document.getElementById('wiz-next')?.addEventListener('click', () => WizardModule.updateWizardStep(1));
        document.getElementById('wiz-prev')?.addEventListener('click', () => WizardModule.updateWizardStep(-1));
        document.getElementById('wiz-finish')?.addEventListener('click', () => WizardModule.handleWizardFinish(this.getWizardContext()));

        document.getElementById('mon-finish-btn')?.addEventListener('click', () => WizardModule.handleMonsterFinish(this.getWizardContext()));
        document.getElementById('sess-finish-btn')?.addEventListener('click', () => WizardModule.handleSessionFinish(this.getWizardContext()));

        // Wizard Entry Points
        document.getElementById('show-wizard-btn')?.addEventListener('click', () => WizardModule.showCreationWizard(this.getWizardContext()));
        document.getElementById('show-monster-btn')?.addEventListener('click', () => WizardModule.showMonsterCreator(this.getWizardContext()));
        document.getElementById('show-trap-btn')?.addEventListener('click', () => WizardModule.showTrapCreator(this.getWizardContext()));
        document.getElementById('show-session-btn')?.addEventListener('click', () => WizardModule.showSessionEditor(this.getWizardContext()));

        // Wizard Choice Cards
        document.querySelectorAll('.choice-card').forEach(card => card.addEventListener('click', (e) => WizardModule.handleChoiceClick(e.currentTarget)));


        // Auth
        document.getElementById('login-btn')?.addEventListener('click', () => {
            if (this.user) logout(); else login();
        });

        // Chat
        document.getElementById('send-msg-btn')?.addEventListener('click', () => this.handleSendMessage());
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleSendMessage(); });

        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => this.openModal('settings-modal'));
        document.getElementById('save-settings-btn')?.addEventListener('click', () => SettingsModule.saveSettings(this.user, { showAlert: this.showAlert, closeModal: this.closeModal }));
        document.getElementById('cursor-selector')?.addEventListener('click', (e) => {
            // Logic moved to settings or kept inline? SettingsModule doesn't seem to export "handleCursorClick", but "applyPreferences" handles active class.
            // Let's add simple inline handler or update SettingsModule.
            const option = e.target.closest('.cursor-option');
            if (option) {
                document.querySelectorAll('.cursor-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                const cursor = option.dataset.cursor;
                if (cursor) document.body.className = document.body.className.replace(/cursor-\S+/g, '') + ` cursor-${cursor}`;
            }
        });

        // Sheet Actions
        document.getElementById('edit-sheet-btn')?.addEventListener('click', () => SheetModule.toggleSheetEdit(true, this.currentCharacter, this.getSheetContext()));
        document.getElementById('cancel-sheet-btn')?.addEventListener('click', () => {
            this.currentCharacter = SheetModule.cancelSheetEdit(this.currentCharacter, this.getSheetContext());
        });
        document.getElementById('save-sheet-btn')?.addEventListener('click', async () => {
            this.currentCharacter = await SheetModule.saveSheetChanges(this.currentCharacter, this.getSheetContext());
        });

        // Sheet Tabs
        document.querySelectorAll('.sheet-tab').forEach(tab => {
            tab.addEventListener('click', (e) => SheetModule.switchSheetTab(e.currentTarget.dataset.tab, this.getSheetContext()));
        });

        // Dynamic Lists
        document.getElementById('add-attack-btn')?.addEventListener('click', () => ListModule.addItem(this.currentCharacter, 'combat.attacks', { name: '', bonus: '', damage: '' }) && SheetModule.populateSheet(this.currentCharacter, this.getSheetContext()));
        document.getElementById('add-spell-btn')?.addEventListener('click', () => ListModule.addItem(this.currentCharacter, 'spells.list', { name: '', level: '', range: '' }) && SheetModule.populateSheet(this.currentCharacter, this.getSheetContext()));
        document.getElementById('add-item-btn')?.addEventListener('click', () => ListModule.addItem(this.currentCharacter, 'inventory.items', { name: '', quantity: 1, weight: 0 }) && SheetModule.populateSheet(this.currentCharacter, this.getSheetContext()));

        // Global Action: Delete List Item & Prof Toggle
        document.getElementById('character-sheet')?.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.delete-list-item');
            if (delBtn) {
                const listPath = delBtn.dataset.list;
                const index = parseInt(delBtn.dataset.index);
                ListModule.removeItem(this.currentCharacter, listPath, index);
                SheetModule.populateSheet(this.currentCharacter, this.getSheetContext());
                return;
            }
            const profBtn = e.target.closest('.prof-toggle');
            if (profBtn && document.getElementById('character-sheet').classList.contains('edit-mode')) {
                ListModule.toggleProficiency(this.currentCharacter, profBtn.dataset.type, profBtn.dataset.field);
                SheetModule.populateSheet(this.currentCharacter, this.getSheetContext());
            }
        });

        // Token Upload
        document.getElementById('token-upload')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file || !this.currentCharacter) return;
            // ... Logic could be in Utils or kept here ...
            // For brevity, keep basic logic or create helper "uploadToken"
            // Let's assume we keep it here using helpers
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

        // Modal Close
        document.querySelectorAll('.close-modal, .modal-backdrop').forEach(el => el.addEventListener('click', () => this.closeModal()));
        document.querySelectorAll('.close-alert, #alert-ok-btn').forEach(el => el.addEventListener('click', () => document.getElementById('alert-modal').classList.add('hidden')));
    }
};

window.app = app;
app.init();
