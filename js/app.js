
import { login, logout, initAuth } from "./auth.js";
import { getCharacters, getCharacter, saveCharacter, getMonsters, saveMonster, getSessions, saveSession } from "./data.js";
import { sendMessageToLyra, createMonsterWithLyra, createCharacterWithLyra, processSessionWithLyra } from "./ai.js";
import { SUPPORTED_SYSTEMS } from "./constants.js";

const app = {
    user: null,
    currentView: localStorage.getItem('lyra_current_view') || 'dashboard',
    currentSystem: localStorage.getItem('lyra_current_system') || 'dnd5e',
    chatHistory: [],
    wizardStep: 1,
    creationMode: 'ai', // 'ai' or 'manual'
    currentCharacter: null,
    rpgTrivia: [
        "Dungeons & Dragons foi criado por Gary Gygax e Dave Arneson em 1974.",
        "O primeiro RPG comercializado foi o D&D original, vindo de um jogo de guerra chamado 'Chainmail'.",
        "Dados de 20 lados (d20) existem desde a Roma Antiga, mas não eram usados para RPGs.",
        "O nome 'Vecna' é um anagrama de Jack Vance, escritor que inspirou o sistema de magia do D&D.",
        "Tasha, do feitiço Riso Incontrolável, era o nome da filha de uma das jogadoras de Gygax.",
        "O cenário de 'Forgotten Realms' foi criado por Ed Greenwood quando ele tinha apenas 8 anos.",
        "Os Beholders e Mind Flayers são propriedade intelectual exclusiva da Wizards of the Coast.",
        "O d6 é o dado mais antigo do mundo, com exemplares datados de 5.000 anos atrás.",
        "Gary Gygax trabalhava como sapateiro enquanto escrevia as regras de D&D.",
        "A classe Bardo foi originalmente uma 'classe de prestígio' que exigia níveis em Lutador e Ladrão.",
        "O dragão Bahamut é inspirado na mitologia árabe, onde é um peixe gigante que sustenta a Terra.",
        "A primeira edição de D&D vinha em uma modesta caixa de madeira com três livretes.",
        "A 'Gygaxian Naturalism' é o termo para mundos de RPG que funcionam como ecossistemas reais.",
        "O 'Gamer Gate' original era o nome de uma taverna lendária em uma das primeiras campanhas de Gary.",
        "O primeiro personagem de Gary Gygax foi um mago chamado Mordenkainen.",
        "A TSR (empresa do D&D) quase faliu em 1982 devido a uma linha de agulhas de crochê tematizadas.",
        "Stephen King quase escreveu um suplemento oficial para o sistema GURPS nos anos 80.",
        "O RPG 'Cyberpunk 2020' previu corretamente o uso de videochamadas e interfaces neurais.",
        "Em 'Vampiro: A Máscara', o termo 'Kindred' foi escolhido para soar mais elegante que 'vampiro'.",
        "O sistema 'Pathfinder' surgiu de uma edição de D&D (3.5) que os fãs se recusaram a abandonar.",
        "A revista 'Dragon Magazine' publicou mais de 400 edições de conteúdo oficial de D&D.",
        "O termo 'Critical Hit' foi introduzido pela primeira vez em um jogo chamado 'Empire of the Petal Throne'."
    ],
    triviaIndex: 0,

    init() {
        console.log("⚔️ Lyra WebApp Initializing...");
        // Applying initial view immediately to prevent flicker
        this.switchView(this.currentView);
        this.populateSystems();
        this.bindEvents();
        this.showRandomTrivia();
        initAuth((user) => this.handleAuthStateChange(user));
    },

    populateSystems() {
        const selector = document.getElementById('system-selector');
        if (selector) {
            selector.innerHTML = SUPPORTED_SYSTEMS.map(s => `<option value="${s.id}" ${s.id === this.currentSystem ? 'selected' : ''}>${s.name}</option>`).join('');
        }
    },

    showRandomTrivia() {
        const triviaEl = document.getElementById('rpg-trivia');
        if (!triviaEl) return;

        // Shuffle once at start to avoid starting with the same one
        this.rpgTrivia = this.rpgTrivia.sort(() => Math.random() - 0.5);
        this.triviaIndex = 0;

        const updateText = () => {
            triviaEl.classList.add('fade-out');

            setTimeout(() => {
                this.triviaIndex = (this.triviaIndex + 1) % this.rpgTrivia.length;
                triviaEl.innerText = this.rpgTrivia[this.triviaIndex];
                triviaEl.classList.remove('fade-out');
            }, 800);
        };

        // Initial set
        triviaEl.innerText = this.rpgTrivia[this.triviaIndex];

        // Start interval - change every 12 seconds for better reading
        setInterval(updateText, 12000);
    },

    bindEvents() {
        console.log("🔗 Binding events...");

        // Dynamic Scroll Indicators hiding/showing
        window.addEventListener('scroll', () => this.updateScrollIndicators());
        window.addEventListener('resize', () => this.updateScrollIndicators());

        // Scroll indicators click logic
        document.getElementById('scroll-up')?.addEventListener('click', () => {
            window.scrollBy({
                top: -window.innerHeight * 0.7,
                behavior: 'smooth'
            });
        });
        document.getElementById('scroll-down')?.addEventListener('click', () => {
            window.scrollBy({
                top: window.innerHeight * 0.7,
                behavior: 'smooth'
            });
        });

        // Menu Toggle
        document.getElementById('menu-btn')?.addEventListener('click', () => this.openMenuAtSection('all'));
        document.getElementById('home-btn')?.addEventListener('click', () => this.switchView('dashboard'));
        document.querySelector('.close-menu')?.addEventListener('click', () => this.toggleMenu(false));
        document.querySelector('.menu-overlay')?.addEventListener('click', () => this.toggleMenu(false));

        // Nav Buttons (within menu)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                const action = e.currentTarget.getAttribute('data-action');
                if (view) this.switchView(view);
                else if (action) this.handleQuickAction(action);
                this.toggleMenu(false);
            });
        });

        // Dashboard Action Cards
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                const action = e.currentTarget.getAttribute('data-action');
                if (view) this.switchView(view);
                else if (action) this.handleQuickAction(action);
            });
        });

        // Global delegate for medieval-cards (dynamic content)
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.medieval-card');
            if (card && card.dataset.id && card.dataset.type) {
                this.viewItem(card.dataset.type, card.dataset.id);
            }
        });

        // Auth
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (this.user) logout();
                else login().catch(err => this.showAlert("Erro ao entrar: " + err.message, "Portal de Login"));
            });
        }

        // Chat
        const sendBtn = document.getElementById('send-msg-btn');
        const chatInput = document.getElementById('chat-input');
        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => this.handleSendMessage());
            chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleSendMessage(); });
        }

        // Wizards & Modals Show
        document.getElementById('show-wizard-btn')?.addEventListener('click', () => this.showCreationWizard());
        document.getElementById('show-monster-btn')?.addEventListener('click', () => this.showMonsterCreator());
        document.getElementById('show-trap-btn')?.addEventListener('click', () => this.showTrapCreator());
        document.getElementById('show-session-btn')?.addEventListener('click', () => this.showSessionEditor());

        // Close Modals (Backdrop & Button)
        document.querySelectorAll('.close-modal, .modal-backdrop').forEach(el => {
            el.addEventListener('click', () => this.closeModal());
        });

        // Wizard & Actions
        document.getElementById('wiz-next')?.addEventListener('click', () => this.updateWizardStep(1));
        document.getElementById('wiz-prev')?.addEventListener('click', () => this.updateWizardStep(-1));
        document.getElementById('wiz-finish')?.addEventListener('click', () => this.handleWizardFinish());
        document.getElementById('mon-finish-btn')?.addEventListener('click', () => this.handleMonsterFinish());
        document.getElementById('sess-finish-btn')?.addEventListener('click', () => this.handleSessionFinish());

        document.querySelectorAll('.sheet-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSheetTab(e.currentTarget.dataset.tab));
        });

        // System Selector
        document.getElementById('system-selector')?.addEventListener('change', (e) => this.handleSystemChange(e.target.value));

        // Choice Cards
        document.querySelectorAll('.choice-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleChoiceClick(e.currentTarget));
        });

        // Switch Character Button
        document.getElementById('switch-char-btn')?.addEventListener('click', () => {
            this.switchView('fichas');
        });

        // Sheet Actions
        document.getElementById('edit-sheet-btn')?.addEventListener('click', () => this.toggleSheetEdit(true));
        document.getElementById('save-sheet-btn')?.addEventListener('click', () => this.saveSheetChanges());
    },

    handleChoiceClick(card) {
        const mode = card.dataset.mode;
        this.creationMode = mode;
        const wizardId = card.closest('.wizard-container').id;

        if (wizardId === 'creation-wizard') {
            this.wizardStep = 1;
            this.updateWizardUI();
        } else if (wizardId === 'monster-wizard') {
            document.getElementById('mon-choice-step').classList.add('hidden');
            document.getElementById('mon-form').classList.remove('hidden');
        } else if (wizardId === 'session-wizard') {
            document.getElementById('sess-choice-step').classList.add('hidden');
            document.getElementById('sess-form').classList.remove('hidden');
        }
        // Update indicators after state change
        this.updateScrollIndicators();
    },

    handleSystemChange(systemId) {
        console.log("🎲 Alternando sistema para:", systemId);
        this.currentSystem = systemId;
        localStorage.setItem('lyra_current_system', systemId);
        if (this.user) {
            this.loadViewData(this.currentView);
        }
    },

    handleAuthStateChange(user) {
        this.user = user;
        this.updateAuthUI(user);
        if (user) {
            // console.log("👤 Usuário Logado:", user.uid);
            this.switchView(this.currentView); // Restore persisted view
        } else {
            this.switchView('dashboard');
        }
    },

    updateAuthUI(user) {
        const loginBtn = document.getElementById('login-btn');
        const tracker = document.getElementById('header-char-tracker');

        if (user) {
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <img src="${user.photoURL}" class="user-avatar" alt="Avatar">
                    <span>Sair</span>
                `;
            }
            // Show tracker if a character is selected
            if (this.currentCharacter) this.updateHeaderTracker(this.currentCharacter);
        } else {
            if (loginBtn) loginBtn.innerHTML = `<i class="fas fa-key"></i> Entrar`;
            tracker?.classList.add('hidden');
            this.clearAllViews();
        }
    },

    async switchView(viewId) {
        this.currentView = viewId;
        localStorage.setItem('lyra_current_view', viewId);

        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            // Trigger reflow for animation
            void targetView.offsetWidth;
            targetView.classList.add('view-enter');
        }

        if (viewId === 'fichas') await this.loadCharacters();
        if (viewId === 'monstros') await this.loadMonsters();
        if (viewId === 'armadilhas') await this.loadTraps();
        if (viewId === 'sessoes') await this.loadSessions();

        // Update active nav state
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
        });

        // Scroll lock logic: allow scrolling on all views
        document.body.style.overflow = 'auto';

        // Dynamic Indicators visibility
        this.updateScrollIndicators();
    },

    calculateModifier(score) {
        return Math.floor((score - 10) / 2);
    },

    formatModifier(val) {
        const mod = this.calculateModifier(val);
        return mod >= 0 ? `+${mod}` : mod;
    },

    updateScrollIndicators() {
        const up = document.getElementById('scroll-up');
        const down = document.getElementById('scroll-down');
        if (!up || !down) return;

        let scrollPos, windowHeight, totalHeight;
        const modal = document.querySelector('#modal-wrapper.active');
        const parchment = modal ? modal.querySelector('.parchment') : null;

        if (modal && parchment) {
            scrollPos = parchment.scrollTop;
            windowHeight = parchment.clientHeight;
            totalHeight = parchment.scrollHeight;
        } else {
            scrollPos = window.scrollY;
            windowHeight = window.innerHeight;
            totalHeight = document.documentElement.scrollHeight;
        }

        const threshold = 15;
        const canScrollUp = scrollPos > threshold;
        const canScrollDown = scrollPos + windowHeight < totalHeight - threshold;

        up.classList.toggle('hidden', !canScrollUp);
        down.classList.toggle('hidden', !canScrollDown || totalHeight <= windowHeight);

        const z = modal ? "10001" : "9000";
        up.style.zIndex = z;
        down.style.zIndex = z;
    },

    toggleMenu(show) {
        const menu = document.getElementById('side-menu');
        if (menu) menu.classList.toggle('hidden', !show);
    },

    openMenuAtSection(sectionId) {
        this.toggleMenu(true);
        document.querySelectorAll('.menu-section').forEach(sec => {
            sec.style.display = (sec.dataset.section === sectionId || sectionId === 'all') ? 'block' : 'none';
        });
    },

    handleQuickAction(action) {
        console.log("⚡ Action Triggered:", action);
        this.toggleMenu(false); // Close menu on action
        if (action === 'monster-gen') this.showMonsterCreator();
        else if (action === 'trap-gen') this.showTrapCreator();
        else if (action === 'fichas') this.switchView('fichas');
        else {
            this.showAlert(`Invocando magia para: ${action}. (Funcionalidade em desenvolvimento)`, "Magia em Preparo");
        }
    },

    checkAuth() {
        if (!this.user) {
            this.showAlert("Viajante, você precisa se identificar (Entrar) para que Lyra possa registrar seu progresso nos anais da história.", "Portal Fechado");
            login().catch(err => console.error("Login failed:", err));
            return false;
        }
        return true;
    },

    updateHeaderTracker(character) {
        const tracker = document.getElementById('header-char-tracker');
        if (!character || !this.user) {
            tracker?.classList.add('hidden');
            return;
        }

        tracker?.classList.remove('hidden');
        const b = character.secoes?.basico || {};
        document.getElementById('header-char-name').innerText = character.name || b.Nome || "Herói";
        document.getElementById('header-char-level').innerText = `Nível ${b.Nível || 1}`;
        document.getElementById('header-char-stats').innerText = `PV: ${b.PV_Atual || 10}/${b.PV_Total || 10} | CA: ${b.CA || 10}`;
    },

    async loadViewData(viewId) {
        if (!this.user) return;
        try {
            if (viewId === 'fichas') await this.loadCharacters();
            if (viewId === 'monstros') await this.loadMonsters();
            if (viewId === 'sessoes') await this.loadSessions();
            if (viewId === 'chat') this.focusChat();
        } catch (err) {
            console.error("❌ Erro ao carregar dados da vista:", err);
        }
    },

    // --- Wizards ---
    showCreationWizard() {
        if (!this.checkAuth()) return;
        console.log("✨ Abrindo Criador de Personagem");
        this.openModal('creation-wizard');
        this.wizardStep = 0; // Start at Choice Step
        this.updateWizardUI();
    },

    showMonsterCreator() {
        if (!this.checkAuth()) return;
        console.log("🐉 Abrindo Invocador de Monstros");
        document.getElementById('mon-cr').parentElement.classList.remove('hidden');
        document.getElementById('monster-wizard').querySelector('h3').innerText = "Invocação de Criatura";
        this.openModal('monster-wizard');
    },

    showMonsterCreator() {
        if (!this.checkAuth()) return;
        console.log("🐉 Abrindo Invocador de Criaturas");
        const monCr = document.getElementById('mon-cr');
        if (monCr) monCr.parentElement.classList.remove('hidden');
        const monTitle = document.getElementById('monster-wizard')?.querySelector('h3');
        if (monTitle) monTitle.innerText = "Origem da Criatura";
        this.openModal('monster-wizard');
    },

    showTrapCreator() {
        if (!this.checkAuth()) return;
        console.log("💀 Abrindo Invocador de Armadilhas");
        const monCr = document.getElementById('mon-cr');
        if (monCr) monCr.parentElement.classList.add('hidden');
        const monTitle = document.getElementById('monster-wizard')?.querySelector('h3');
        if (monTitle) monTitle.innerText = "Criação de Armadilha";
        this.openModal('monster-wizard');
    },

    showSessionEditor() {
        if (!this.checkAuth()) return;
        console.log("📝 Abrindo Diário de Sessão");
        this.openModal('session-wizard');
    },

    openModal(wizardId) {
        const wrapper = document.getElementById('modal-wrapper');
        const content = wrapper?.querySelector('.parchment');

        if (wrapper) {
            wrapper.classList.add('active');
            wrapper.classList.remove('hidden');

            // Listen for internal scrolling to update indicators
            if (content) {
                content.removeEventListener('scroll', () => this.updateScrollIndicators());
                content.addEventListener('scroll', () => this.updateScrollIndicators());
                // Scroll to top when opening
                content.scrollTop = 0;
            }
        }

        document.querySelectorAll('.wizard-container, .sheet-container, .wizard-step, #detail-container').forEach(c => c.classList.add('hidden'));
        const target = document.getElementById(wizardId);
        if (target) {
            target.classList.remove('hidden');
            // Back to choice step
            if (wizardId === 'creation-wizard') {
                this.wizardStep = 0;
                this.updateWizardUI();
            } else if (wizardId === 'monster-wizard') {
                document.getElementById('mon-choice-step').classList.remove('hidden');
                document.getElementById('mon-form').classList.add('hidden');
            } else if (wizardId === 'session-wizard') {
                document.getElementById('sess-choice-step').classList.remove('hidden');
                document.getElementById('sess-form').classList.add('hidden');
            }
        }
        this.updateScrollIndicators();
    },

    toggleLoading(show) {
        const loading = document.getElementById('mystic-loading');
        if (loading) loading.classList.toggle('hidden', !show);
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
        } else {
            alert(message);
        }
    },

    closeAlert() {
        document.getElementById('alert-modal')?.classList.add('hidden');
    },
    updateWizardStep(dir) {
        this.wizardStep += dir;
        this.updateWizardUI();
    },

    updateWizardUI() {
        document.querySelectorAll('.wizard-step').forEach(s => {
            const stepNum = parseInt(s.dataset.step);
            s.classList.toggle('hidden', stepNum !== this.wizardStep);
        });

        const progress = document.querySelector('.wizard-progress');
        const nav = document.querySelector('.wizard-nav');

        if (this.wizardStep === 0) {
            progress?.classList.add('hidden');
            nav?.classList.add('hidden'); // Hide nav buttons on choice step
        } else {
            progress?.classList.remove('hidden');
            nav?.classList.remove('hidden');
            document.querySelectorAll('.step-indicator').forEach(ind => {
                const indStep = parseInt(ind.dataset.step);
                ind.classList.toggle('active', indStep === this.wizardStep);
                ind.classList.toggle('completed', indStep < this.wizardStep);
            });

            document.getElementById('wiz-prev').classList.toggle('hidden', this.wizardStep === 1);
            document.getElementById('wiz-next').classList.toggle('hidden', this.wizardStep === 5);
            document.getElementById('wiz-finish').classList.toggle('hidden', this.wizardStep !== 5);
        }

        // Final message update
        const finalMsg = document.getElementById('wiz-final-msg');
        if (finalMsg) {
            finalMsg.innerText = this.creationMode === 'ai'
                ? "Lyra irá tecer a trama final do seu herói, gerando história, ideais e laços dinâmicamente."
                : "Seu herói está pronto para ser consagrado nos anais da história.";
        }
    },

    // --- Actions ---
    async handleWizardFinish() {
        this.toggleLoading(true);
        try {
            const skills = Array.from(document.querySelectorAll('.skills-selection input:checked')).map(i => i.value);
            const name = document.getElementById('wiz-name').value;
            const race = document.getElementById('wiz-race').value;
            const className = document.getElementById('wiz-class').value;
            const background = document.getElementById('wiz-background').value;
            const alignment = document.getElementById('wiz-alignment').value;
            const speed = document.getElementById('wiz-speed').value;

            const basicData = {
                name: name,
                secoes: {
                    basico: {
                        Nome: name,
                        Raça: race,
                        Classe: className,
                        Antecedente: background,
                        Alinhamento: alignment,
                        Nível: 1,
                        Velocidade: speed
                    },
                    atributos: {
                        Força: document.getElementById('wiz-str').value,
                        Destreza: document.getElementById('wiz-dex').value,
                        Constituição: document.getElementById('wiz-con').value,
                        Inteligência: document.getElementById('wiz-int').value,
                        Sabedoria: document.getElementById('wiz-wis').value,
                        Carisma: document.getElementById('wiz-cha').value
                    },
                    pericias: skills.reduce((acc, skill) => ({ ...acc, [skill]: "Proficiente" }), {}),
                    combate: {
                        HP: 10 + this.calculateModifier(document.getElementById('wiz-con').value),
                        CA: 10 + this.calculateModifier(document.getElementById('wiz-dex').value),
                        Iniciativa: this.calculateModifier(document.getElementById('wiz-dex').value)
                    },
                    historia: {
                        Personalidade: document.getElementById('wiz-traits').value,
                        Ideais: document.getElementById('wiz-ideals').value,
                        Vínculos: document.getElementById('wiz-bonds').value,
                        Defeitos: document.getElementById('wiz-flaws').value,
                        História: document.getElementById('wiz-backstory').value
                    }
                }
            };

            let finalData = basicData;
            if (this.creationMode === 'ai') {
                const idToken = await this.user.getIdToken();
                // We send the 'crunch' to get the 'fluff'
                const aiResult = await createCharacterWithLyra(basicData, idToken);
                if (aiResult) {
                    finalData.secoes.historia = {
                        Personalidade: aiResult.traits || aiResult.Personalidade || finalData.secoes.historia.Personalidade,
                        Ideais: aiResult.ideals || aiResult.Ideais || finalData.secoes.historia.Ideais,
                        Vínculos: aiResult.bonds || aiResult.Vínculos || finalData.secoes.historia.Vínculos,
                        Defeitos: aiResult.flaws || aiResult.Defeitos || finalData.secoes.historia.Defeitos,
                        História: aiResult.backstory || aiResult.História || finalData.secoes.historia.História
                    };
                }
            }

            await saveCharacter(this.user.uid, this.currentSystem, finalData);
            this.closeModal();
            this.loadCharacters();
        } catch (error) {
            this.showAlert("Erro ao consagrar herói: " + error.message, "Karma Ruim");
        } finally {
            this.toggleLoading(false);
        }
    },

    async handleMonsterFinish() {
        this.toggleLoading(true);
        try {
            const isTrap = document.getElementById('monster-wizard').querySelector('h3').innerText.includes("Armadilha");
            const monsterData = {
                name: document.getElementById('mon-name').value,
                cr: isTrap ? "Trap" : document.getElementById('mon-cr').value,
                type: document.getElementById('mon-type').value,
                prompt: document.getElementById('mon-prompt').value
            };

            let result;
            if (this.creationMode === 'ai') {
                const idToken = await this.user.getIdToken();
                result = await createMonsterWithLyra(monsterData, idToken);
            } else {
                result = {
                    ...monsterData,
                    stats: "Estatísticas manuais (em desenvolvimento)"
                };
            }

            if (isTrap) {
                await saveTrap(this.user.uid, this.currentSystem, result);
                this.loadTraps();
            } else {
                await saveMonster(this.user.uid, this.currentSystem, result);
                this.loadMonsters();
            }
            this.closeModal();
        } catch (error) {
            this.showAlert("Falha na invocação mística: " + error.message, "Contra-feitiço");
        } finally {
            this.toggleLoading(false);
        }
    },

    async handleSessionFinish() {
        this.toggleLoading(true);
        try {
            let sessionData = {
                title: document.getElementById('sess-title').value,
                summary: document.getElementById('sess-summary').value,
                notes: document.getElementById('sess-notes').value
            };

            if (this.creationMode === 'ai' && this.user) {
                const idToken = await this.user.getIdToken();
                const aiResponse = await processSessionWithLyra(sessionData, idToken);
                if (aiResponse) {
                    sessionData.summary = aiResponse;
                }
            }

            await saveSession(this.user.uid, this.currentSystem, sessionData);
            this.closeModal();
            this.loadSessions();
        } catch (error) {
            this.showAlert("Erro ao registrar: " + error.message, "Escriba Interrompido");
        } finally {
            this.toggleLoading(false);
        }
    },

    // --- Data Rendering ---
    async loadCharacters() {
        const container = document.getElementById('fichas-list');
        if (!this.user) return;
        const chars = await getCharacters(this.user.uid, this.currentSystem);
        container.innerHTML = chars.length ? chars.map(c => this.renderCard(c, 'character')).join('') : '<p class="empty-state">Sem personagens.</p>';
    },

    async loadMonsters() {
        if (!this.user) return;
        const monsters = await getMonsters(this.user.uid, this.currentSystem);
        const list = document.getElementById('monsters-list');
        if (list) {
            list.innerHTML = monsters.length ? monsters.map(m => this.renderCard(m, 'monster')).join('') : '<p class="empty-state">Nenhuma criatura invocada.</p>';
        }
    },

    async loadTraps() {
        if (!this.user) return;
        const traps = await getTraps(this.user.uid, this.currentSystem);
        const list = document.getElementById('traps-list');
        if (list) {
            list.innerHTML = traps.length ? traps.map(t => this.renderCard(t, 'trap')).join('') : '<p class="empty-state">Nenhuma armadilha armada.</p>';
        }
    },

    async loadSessions() {
        const container = document.getElementById('sessions-list');
        if (!this.user) return;
        const sessions = await getSessions(this.user.uid, this.currentSystem);
        container.innerHTML = sessions.length ? sessions.map(s => this.renderCard(s, 'session')).join('') : '<p class="empty-state">Nenhuma aventura narrada.</p>';
    },

    renderCard(item, type) {
        let subtitle = "";
        if (type === 'character') subtitle = `${item.secoes?.basico?.Raça || ''} ${item.secoes?.basico?.Classe || ''} (Nív ${item.secoes?.basico?.Nível || 1})`;
        if (type === 'monster') subtitle = `${item.secoes?.Tipo || ''} (ND ${item.secoes?.ND || '?'})`;
        if (type === 'trap') subtitle = `Perigo: ${item.secoes?.Dificuldade || 'Média'}`;
        if (type === 'session') subtitle = item.date ? new Date(item.date).toLocaleDateString() : 'Data desconhecida';

        return `
            <div class="medieval-card" data-id="${item.id}" data-type="${type}">
                <div class="card-glow"></div>
                <h3>${item.name || item.title || 'Sem Nome'}</h3>
                <span class="card-subtitle">${subtitle}</span>
            </div>
        `;
    },

    async viewItem(type, id) {
        if (type === 'character') await this.viewCharacter(id);
        else if (type === 'monster') await this.viewMonster(id);
        else if (type === 'trap') await this.viewTrap(id);
        else if (type === 'session') await this.viewSession(id);
        else alert(`Visualizando ${type}: ${id}`);
    },

    async viewMonster(id) {
        this.openModal('detail-container');
        const monster = await getMonster(id);
        const container = document.getElementById('detail-container');
        if (container && monster) {
            container.classList.remove('hidden');
            const s = monster.secoes || {};
            container.innerHTML = `
                <div class="details-container">
                    <h2><i class="fas fa-dragon"></i> ${monster.name}</h2>
                    <p><strong>Tipo:</strong> ${s.Tipo || '?'}</p>
                    <p><strong>ND (Nível de Desafio):</strong> ${s.ND || '?'}</p>
                    <div class="vital-stats">
                        <div class="vital-box"><span>CA</span><strong>${s.Status?.CA || 10}</strong></div>
                        <div class="vital-box"><span>PV</span><strong>${s.Status?.PV || 10}</strong></div>
                    </div>
                    <div class="text-block">${s.Descricao || s.Habilidades || 'Sem descrição.'}</div>
                </div>
            `;
        }
    },

    async viewTrap(id) {
        this.openModal('detail-container');
        const trap = await getTrap(id);
        const container = document.getElementById('detail-container');
        if (container && trap) {
            container.classList.remove('hidden');
            const s = trap.secoes || {};
            container.innerHTML = `
                <div class="details-container">
                    <h2><i class="fas fa-skull-crossbones"></i> ${trap.name}</h2>
                    <p><strong>Dificuldade:</strong> ${s.Dificuldade || 'Média'}</p>
                    <p><strong>Dano Estimado:</strong> ${s.Dano || '1d6'}</p>
                    <div class="text-block">${s.Descricao || 'Sem descrição.'}</div>
                    <div class="text-block"><strong>Mecanismo:</strong> ${s.Mecanismo || 'Não especificado.'}</div>
                </div>
            `;
        }
    },

    async viewSession(id) {
        this.openModal('detail-container');
        const session = await getSession(id);
        const container = document.getElementById('detail-container');
        if (container && session) {
            container.classList.remove('hidden');
            container.innerHTML = `
                <div class="details-container">
                    <h2><i class="fas fa-book-open"></i> ${session.title}</h2>
                    <p><strong>Data:</strong> ${session.date ? new Date(session.date).toLocaleDateString() : 'Desconhecida'}</p>
                    <div class="text-block"><strong>Resumo:</strong> ${session.summary || 'Sem resumo.'}</div>
                    <div class="text-block"><strong>Notas:</strong> ${session.notes || 'Sem notas.'}</div>
                </div>
            `;
        }
    },

    async viewCharacter(id) {
        this.openModal('character-sheet');
        const char = await getCharacter(id);
        this.currentCharacter = char; // Store globally
        this.populateSheet(char);
        this.updateHeaderTracker(char); // Update header
        this.switchSheetTab('geral');
    },

    populateSheet(char) {
        if (!char) return;
        const s = char.secoes || {};
        const b = s.basico || {};
        const attr = s.atributos || {};
        const comb = s.combate || {};
        const per = s.pericias || {};
        const rec = s.recursos || {};

        // D&D 5e Auto-Calculations
        const profBonus = parseInt(b.Bonus_Proficiencia) || 2;
        const dexMod = this.calculateModifier(attr.Destreza || 10);
        const wisMod = this.calculateModifier(attr.Sabedoria || 10);

        // Initiative (DEX based)
        const iniBase = parseInt(comb.Iniciativa);
        const initiative = isNaN(iniBase) ? dexMod : iniBase;

        // Passive Perception (10 + WIS + Prof if shared)
        const percProf = per["Percepção"] ? profBonus : 0;
        const passivePerc = 10 + wisMod + percProf;

        // Geral
        document.getElementById('sheet-char-name').innerText = char.name || b.Nome || 'Sem Nome';
        document.getElementById('sheet-char-info').innerText = `${b.Raça || '?'} • ${b.Classe || '?'} (Nível ${b.Nível || 1})`;
        document.getElementById('sheet-hp-curr').innerText = comb.HP || 10;
        document.getElementById('sheet-hp-max').innerText = comb.HP_Max || comb.HP || 10;
        document.getElementById('sheet-ca').innerText = comb.CA || 10;
        document.getElementById('sheet-inic').innerText = initiative >= 0 ? `+${initiative}` : initiative;
        document.getElementById('sheet-prof').innerText = profBonus >= 0 ? `+${profBonus}` : profBonus;
        document.getElementById('sheet-background').innerText = b.Antecedente || "Nenhum";
        document.getElementById('sheet-alignment').innerText = b.Alinhamento || "Neutro";
        document.getElementById('sheet-speed').innerText = b.Velocidade || "9m";
        document.getElementById('sheet-xp').innerText = b.XP || "0";

        // Passive Perception display
        const speedPanel = document.getElementById('sheet-speed').parentElement.parentElement;
        if (!document.getElementById('sheet-passive-perc')) {
            const p = document.createElement('p');
            p.innerHTML = `<strong>Percepção Passiva:</strong> <span id="sheet-passive-perc" class="editable" data-field="calculado.Percepcao_Passiva">${passivePerc}</span>`;
            speedPanel.appendChild(p);
        } else {
            document.getElementById('sheet-passive-perc').innerText = passivePerc;
        }

        const insp = document.getElementById('sheet-insp');
        if (insp) {
            insp.classList.toggle('fas', !!b.Inspiracao);
            insp.classList.toggle('far', !b.Inspiracao);
        }

        // Atributos
        const scoresGrid = document.getElementById('sheet-scores');
        if (scoresGrid) {
            const attrs = [
                { id: 'Força', l: 'FOR', v: attr.Força || 10 },
                { id: 'Destreza', l: 'DEX', v: attr.Destreza || 10 },
                { id: 'Constituição', l: 'CON', v: attr.Constituição || 10 },
                { id: 'Inteligência', l: 'INT', v: attr.Inteligência || 10 },
                { id: 'Sabedoria', l: 'WIS', v: attr.Sabedoria || 10 },
                { id: 'Carisma', l: 'CHA', v: attr.Carisma || 10 }
            ];
            scoresGrid.innerHTML = attrs.map(a => `
                <div class="score-box">
                    <span class="score-label">${a.l}</span>
                    <strong class="score-value editable" data-field="atributos.${a.id}">${a.v}</strong>
                    <span class="score-mod">${this.formatModifier(a.v)}</span>
                </div>
            `).join('');
        }

        // Perícias (with calculation)
        const skillsList = document.getElementById('sheet-skills');
        if (skillsList) {
            const skillMap = {
                "Acrobacia": "Destreza", "Adestramento de Animais": "Sabedoria", "Arcanismo": "Inteligência",
                "Atletismo": "Força", "Atuação": "Carisma", "Blefar": "Carisma", "Furtividade": "Destreza",
                "História": "Inteligência", "Intimidação": "Carisma", "Intuição": "Sabedoria",
                "Investigação": "Inteligência", "Medicina": "Sabedoria", "Natureza": "Inteligência",
                "Percepção": "Sabedoria", "Persuasão": "Carisma", "Prestidigitação": "Destreza",
                "Religião": "Inteligência", "Sobrevivência": "Sabedoria"
            };

            skillsList.innerHTML = Object.keys(skillMap).map(skillName => {
                const attrName = skillMap[skillName];
                const attrVal = attr[attrName] || 10;
                const mod = this.calculateModifier(attrVal);
                const isProf = !!per[skillName];
                const total = mod + (isProf ? profBonus : 0);

                return `
                    <div class="skill-item ${isProf ? 'proficient' : ''}" data-skill="${skillName}">
                        <div class="skill-total">${total >= 0 ? `+${total}` : total}</div>
                        <i class="fa-circle ${isProf ? 'fas' : 'far'} editable-toggle" data-field="pericias.${skillName}"></i>
                        <span>${skillName} <small>(${attrName.substring(0, 3)})</small></span>
                    </div>
                `;
            }).join('');
        }

        // Combate (Saves e Hit Dice)
        document.getElementById('sheet-hit-dice').innerText = comb.Dados_Vida || "1d8";
        // Death saves reset
        document.querySelectorAll('.death-row input').forEach(i => i.checked = false);

        // Recursos & Inventário
        document.getElementById('sheet-features').innerText = rec.Habilidades || "Nenhuma habilidade registrada.";
        document.getElementById('sheet-inventory').innerText = rec.Inventario || "Vazio.";

        // História
        document.getElementById('sheet-backstory').innerText = s.historia?.História || "Sem história.";
        document.getElementById('sheet-traits').innerText = s.historia?.Personalidade || "-";
        document.getElementById('sheet-ideals').innerText = s.historia?.Ideais || "-";
        document.getElementById('sheet-bonds').innerText = s.historia?.Vínculos || "-";
        document.getElementById('sheet-flaws').innerText = s.historia?.Defeitos || "-";
    },

    toggleSheetEdit(enable) {
        const sheet = document.getElementById('character-sheet');
        sheet.classList.toggle('edit-mode', enable);
        document.getElementById('edit-sheet-btn').classList.toggle('hidden', enable);
        document.getElementById('save-sheet-btn').classList.toggle('hidden', !enable);

        if (enable) {
            // Transform text into inputs
            sheet.querySelectorAll('.editable').forEach(el => {
                const val = el.innerText;
                const field = el.dataset.field;
                const isNum = !isNaN(val) || field.includes('HP') || field.includes('CA') || field.includes('XP');
                el.innerHTML = `<input type="${isNum ? 'number' : 'text'}" value="${val}" data-field="${field}">`;

                // Real-time modifier update for attributes
                if (field.includes('atributos')) {
                    const input = el.querySelector('input');
                    input.addEventListener('input', (e) => {
                        const scoreMod = el.parentElement.querySelector('.score-mod');
                        if (scoreMod) scoreMod.innerText = this.formatModifier(e.target.value);
                    });
                }
            });
            sheet.querySelectorAll('.editable-area').forEach(el => {
                const val = el.innerText;
                el.innerHTML = `<textarea data-field="${el.dataset.field}">${val}</textarea>`;
            });
            // Toggles (Inspiration/Skills) in edit mode are just clickable icons
            sheet.querySelectorAll('.editable-toggle').forEach(el => {
                el.onclick = () => {
                    el.classList.toggle('fas');
                    el.classList.toggle('far');
                };
            });
        } else {
            // Remove click handlers if disabling edit mode
            sheet.querySelectorAll('.editable-toggle').forEach(el => el.onclick = null);
        }
    },

    async saveSheetChanges() {
        if (!this.currentCharacter) return;
        this.toggleLoading(true);
        const sheet = document.getElementById('character-sheet');

        try {
            const updated = JSON.parse(JSON.stringify(this.currentCharacter)); // Deep clone
            if (!updated.secoes) updated.secoes = {};

            // Collect inputs
            sheet.querySelectorAll('[data-field]').forEach(el => {
                const field = el.dataset.field; // e.g. "basico.Nome"
                let val;

                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    val = el.value;
                    if (el.type === 'number') val = parseInt(val) || 0;
                } else if (el.classList.contains('editable-toggle')) {
                    val = el.classList.contains('fas'); // Boolean for toggles
                } else {
                    // Fallback for elements that already have inputs inside
                    const input = el.querySelector('input, textarea');
                    if (input) {
                        val = input.value;
                        if (input.type === 'number') val = parseInt(val) || 0;
                    }
                }

                if (val !== undefined) this.setNestedValue(updated.secoes, field, val);
            });

            await saveCharacter(this.user.uid, this.currentSystem, updated);
            this.currentCharacter = updated;
            this.toggleSheetEdit(false);
            this.populateSheet(updated);
            this.updateHeaderTracker(updated);
            this.showAlert("Ficha consagrada nos anais com sucesso!", "Êxito");
        } catch (err) {
            this.showAlert("Erro ao salvar: " + err.message, "Karma Ruim");
        } finally {
            this.toggleLoading(false);
        }
    },

    setNestedValue(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    },

    switchSheetTab(tabId) {
        document.querySelectorAll('.sheet-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
        document.querySelectorAll('.sheet-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`sheet-${tabId}`).classList.remove('hidden');
        this.updateScrollIndicators();
    },

    // --- Chat Logic ---
    async handleSendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message || this.isWaitingForAI) return;
        this.addMessageToUI('user', message);
        input.value = '';
        this.isWaitingForAI = true;
        try {
            const idToken = await this.user.getIdToken();
            const response = await sendMessageToLyra(message, idToken, this.chatHistory);
            this.addMessageToUI('bot', response);
            this.chatHistory.push({ role: 'user', content: message }, { role: 'bot', content: response });
        } catch (error) {
            this.addMessageToUI('bot', "Falha mística na conexão...");
        } finally { this.isWaitingForAI = false; }
    },

    addMessageToUI(sender, text) {
        const container = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${sender}`;

        if (sender === 'bot') {
            msgDiv.innerHTML = `
                <img src="assets/Lyra_Token.png" class="chat-avatar" alt="Lyra">
                <span class="msg-content">${text}</span>
            `;
        } else {
            msgDiv.innerHTML = `<span class="msg-content">${text}</span>`;
        }

        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    },

    focusChat() { setTimeout(() => document.getElementById('chat-input')?.focus(), 100); },

    clearAllViews() {
        ['fichas-list', 'monsters-list', 'traps-list', 'sessions-list', 'chat-messages'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
    },

    // PDF Export
    async exportPDF() { alert("Abrindo portal de exportação no EC2..."); }
};

window.app = app;
app.init();
