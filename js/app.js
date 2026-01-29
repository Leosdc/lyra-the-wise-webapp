
import { login, logout, initAuth } from './auth.js';
import {
    getCharacter, getCharacters, saveCharacter, deleteCharacter, uploadCharacterToken,
    getMonsters, getMonster, saveMonster, deleteMonster,
    getTraps, getTrap, saveTrap, deleteTrap,
    getSessions, getSession, saveSession, deleteSession
} from './data.js';
import { RPG_TRIVIA, SUPPORTED_SYSTEMS, APP_VERSION } from './constants.js';

import { NavigationModule } from './modules/navigation.js';
import { SheetModule } from './modules/sheet.js';
import { WizardModule } from './modules/wizard.js';
import { SettingsModule } from './modules/settings.js';
import { AuthUI } from './modules/auth-ui.js';
import { ListModule } from './modules/lists.js';
import LyricsModule from './modules/lyrics.js';
import { ItemsModule } from './modules/items.js';
import { ChangelogModule } from './modules/changelog-loader.js';
import { calculateModifier, formatModifier, resizeImage, getNestedValue, setNestedValue, parseMarkdown } from './modules/utils.js';
import { sendMessageToLyra } from './ai.js';
import { DiceModule } from './modules/dice.js';

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

    init() {
        console.log("📜 Lyra the Wise - Inicializando Módulos (v2.0 Refatorado)...");

        // 10% chance for Damien Kael Easter Egg (Temporary per session)
        // 10% Chance Damien, 10% Chance Eldrin, 80% Lyra
        const roll = Math.random();
        if (roll < 0.1) {
            this.setTheme('damien');
        } else if (roll < 0.2) {
            this.setTheme('eldrin');
        } else {
            this.setTheme('lyra');
        }


        initAuth(this.handleAuthStateChange.bind(this));
        this.populateSystems();
        this.showRandomTrivia();
        this.bindEvents();
        this.initMusicPlayer();

        // Initialize Lyrics
        LyricsModule.init();

        // Initialize Items
        ItemsModule.init();

        WizardModule.initGuidanceListeners();
        ChangelogModule.loadChangelog();
        this.populateDataLists();

        // Init Dice
        DiceModule.init();

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
        window.ItemsModule = ItemsModule; // Allow onclick access
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
            console.error("Erro ao povoar switcher:", error);
            if (error.message.includes("permissions")) {
                list.innerHTML = '<p class="empty-state">Erro de Permissão: Verifique se as Security Rules no Firebase batem com os nomes das coleções (ex: "fichas").</p>';
            } else {
                list.innerHTML = '<p class="empty-state">Erro ao carregar personagens. Verifique a conexão astral.</p>';
            }
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
            updateScrollIndicators: () => NavigationModule.updateScrollIndicators()
        };
    },

    getNavigationLoaders() {
        return {
            loadCharacters: () => this.loadCharacters(),
            loadMonsters: () => this.loadMonsters(),
            loadTraps: () => this.loadTraps(),
            loadSessions: () => this.loadSessions(),
            loadItems: () => ItemsModule.render(),
            showMonsterCreator: () => WizardModule.showMonsterCreator(this.getWizardContext()),
            showTrapCreator: () => WizardModule.showTrapCreator(this.getWizardContext()),
            showAlert: (msg, title) => this.showAlert(msg, title),
            showConfirm: (msg, title) => this.showConfirm(msg, title),
            deleteCharacter: (id) => deleteCharacter(id),
            deleteMonster: (id) => deleteMonster(id),
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
        await AuthUI.update(user, {
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
            // Load User Preferences (and check auto-play)
            await SettingsModule.loadUserPreferences(user);
            this.checkMusicAutoPlay();

            NavigationModule.switchView(this.currentView, this.getNavigationLoaders());

            // Restore character from persistence
            const savedChatId = localStorage.getItem(`lyra_char_${user.uid}_${this.currentSystem}`);
            if (savedChatId) {
                getCharacter(savedChatId).then(char => {
                    if (char) this.selectCharacter(char);
                });
            } else {
                // Auto-select first if none saved
                getCharacters(user.uid, this.currentSystem).then(chars => {
                    if (chars.length > 0) this.selectCharacter(chars[0]);
                });
            }

            this.populateCharSwitcher();
        } else {
            NavigationModule.switchView('dashboard', this.getNavigationLoaders());
        }
    },

    switchView(viewId) {
        if (viewId === 'dashboard') {
            // Dashboard is always accessible
        } else if (!this.user) {
            this.showAlert("Você precisa estar logado para acessar os anais arcanos.", "Portal Trancado");
            return;
        }

        this.currentView = viewId;
        sessionStorage.setItem('lyra_current_view', viewId);
        NavigationModule.switchView(viewId, this.getNavigationLoaders());

        if (viewId === 'itens') {
            ItemsModule.render();
        }
    },

    handleQuickAction(action) {
        console.log("⚡ Action Triggered:", action);
        NavigationModule.toggleMenu(false);

        if (action === 'monster-gen' || action === 'monster-btn') {
            WizardModule.showMonsterCreator(this.getWizardContext());
        } else if (action === 'trap-gen' || action === 'trap-btn') {
            WizardModule.showTrapCreator(this.getWizardContext());
        } else if (action === 'character-wizard' || action === 'wizard-btn') {
            WizardModule.showCreationWizard(this.getWizardContext());
        } else if (action === 'session-editor' || action === 'session-btn') {
            WizardModule.showSessionEditor(this.getWizardContext());
        } else if (action === 'dice-roller') {
            DiceModule.openModal();
        } else {
            this.showAlert(`Invocando magia para: ${action}. (Funcionalidade em desenvolvimento)`, "Magia em Preparo");
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
            NavigationModule.switchView(this.currentView, this.getNavigationLoaders());
            this.populateCharSwitcher();
        }
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

        // Persist with User UID to avoid cross-user issues
        if (this.user) {
            localStorage.setItem(`lyra_char_${this.user.uid}_${this.currentSystem}`, char.id);
        }

        this.populateCharSwitcher();
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
        const wrapper = document.getElementById('modal-wrapper');
        const modalBody = document.getElementById('modal-body');
        const detailContainer = document.getElementById('detail-container');

        if (wrapper) {
            wrapper.classList.add('active');
            wrapper.classList.remove('hidden');
            const content = wrapper.querySelector('.parchment');
            if (content) content.scrollTop = 0;
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
            this.chatHistory.push({ role: 'user', content: message }, { role: 'model', content: response });
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
                    context += `Inventário: ${items}\n`;
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

    initMusicPlayer() {
        const player = document.getElementById('mystic-player');
        const audio = document.getElementById('lyra-bg-music');
        const playBtn = document.getElementById('btn-play-pause');
        const volumeSlider = document.getElementById('player-volume');
        const progressBar = document.getElementById('player-progress-bar');
        const orb = player?.querySelector('.player-orb');
        const minimize = player?.querySelector('.player-minimize');

        if (!player || !audio) return;

        // Toggle Expand/Collapse
        orb.onclick = () => player.classList.toggle('collapsed');
        minimize.onclick = (e) => {
            e.stopPropagation();
            player.classList.add('collapsed');
        };

        // Play/Pause
        playBtn.onclick = () => {
            if (audio.paused) {
                audio.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                player.classList.add('playing');
            } else {
                audio.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                player.classList.remove('playing');
            }
        };

        // Volume
        volumeSlider.oninput = (e) => {
            audio.volume = e.target.value;
        };

        // Progress Tracking
        audio.ontimeupdate = () => {
            if (audio.duration) {
                const pct = (audio.currentTime / audio.duration) * 100;
                if (progressBar) progressBar.style.width = pct + '%';
            }
        };

        // Interaction Unblocker
        document.body.addEventListener('click', () => {
            if (audio.paused && this.shouldAutoPlay) {
                this.checkMusicAutoPlay();
            }
        }, { once: true });
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
        this.currentThemeName = themeName || 'lyra'; // 'lyra', 'damien', 'eldrin'
        const isDamien = (themeName === 'damien');
        const isEldrin = (themeName === 'eldrin');

        this.isDamien = isDamien; // Legacy flag for compatibility

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
        body.classList.remove('damien-theme', 'eldrin-theme');

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
        }

        // Logic Updates
        if (logo) logo.src = logoSrc;
        if (lyraImg) lyraImg.src = heroSrc;
        if (scrollTitle) scrollTitle.textContent = titleText;

        // Chat Buttons
        const chatBtns = document.querySelectorAll('button[data-view="chat"]');
        chatBtns.forEach(btn => {
            const fontStyle = 'font-family: "Cinzel", serif; font-weight: bold; font-size: 0.9rem;';
            btn.innerHTML = `<i class="fas fa-comment-dots"></i> <span style='${fontStyle}'>Fale com ${aiName}</span>`;
        });

        const chatHeaderTitle = document.querySelector('.chat-header h2');
        if (chatHeaderTitle) chatHeaderTitle.innerHTML = `<i class="fas fa-scroll"></i> Pergunte a ${aiName}`;

        // Music
        if (audio) {
            const currentSrc = audio.getAttribute('src');
            const nowPlaying = document.querySelector('.player-now-playing');

            // UI Updates (Full Player & Pill)
            if (trackName) trackName.textContent = targetName;
            if (nowPlaying) nowPlaying.textContent = targetName;

            // Only reload audio if source changed
            if (currentSrc !== targetSrc) {
                const wasPlaying = !audio.paused;
                audio.src = targetSrc;
                if (wasPlaying) audio.play().catch(() => { });
            }
        }

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
    },

    cycleTheme() {
        if (this.currentThemeName === 'lyra') this.setTheme('damien');
        else if (this.currentThemeName === 'damien') this.setTheme('eldrin');
        else this.setTheme('lyra');
    },




    // --- Event Binding (The Glue) ---
    bindEvents() {
        console.log("🔗 Connecting Runes (Binding Events)...");

        // GLOBAL CLICK DELEGATE (Cards)
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.card-delete-btn');
            const card = e.target.closest('.medieval-card');

            if (deleteBtn && card) {
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
        });
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

        // Changelog Button Check
        document.getElementById('changelog-btn')?.addEventListener('click', () => {
            localStorage.setItem('lyraAppVersion', APP_VERSION);
            const badge = document.querySelector('.notification-badge');
            if (badge) badge.style.display = 'none';
        });
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

        // Bulk Delete Actions
        document.getElementById('bulk-delete-fichas-btn')?.addEventListener('click', () => this.toggleDeleteMode('character'));
        document.getElementById('confirm-bulk-delete')?.addEventListener('click', () => this.handleBulkDelete());

        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            if (this.checkAuth()) this.openModal('settings-modal');
        });
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
        document.getElementById('add-item-btn')?.addEventListener('click', () => ListModule.addItem(this.currentCharacter, 'inventory.items', { name: '', quantity: 1, weight: 0, description: '' }) && SheetModule.populateSheet(this.currentCharacter, this.getSheetContext()));

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
        document.querySelectorAll('.close-modal, .modal-backdrop').forEach(el => el.addEventListener('click', () => this.closeModal()));
        document.querySelectorAll('.close-alert, #alert-ok-btn').forEach(el => el.addEventListener('click', () => document.getElementById('alert-modal').classList.add('hidden')));
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());
