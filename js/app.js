
import { login, logout, initAuth } from "./auth.js";
import {
    getCharacters, getCharacter, saveCharacter, deleteCharacter,
    getMonsters, saveMonster, deleteMonster,
    getSessions, saveSession, deleteSession,
    uploadCharacterToken
} from "./data.js";
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
    isDamien: false, // Infiltration flag
    isDeleteMode: false, // Toggle bulk delete visibility
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
        "O primeiro personagem de Gary Gygax foi um mago chamado Mordenkainen.",
        "A TSR (empresa do D&D) quase faliu em 1982 devido a uma linha de agulhas de crochê tematizadas.",
        "Stephen King quase escreveu um suplemento oficial para o sistema GURPS nos anos 80.",
        "O RPG 'Cyberpunk 2020' previu corretamente o uso de videochamadas e interfaces neurais.",
        "Em 'Vampiro: A Máscara', o termo 'Kindred' foi escolhido para soar mais elegante que 'vampiro'.",
        "O sistema 'Pathfinder' surgiu de uma edição de D&D (3.5) que os fãs se recusaram a abandonar.",
        "A revista 'Dragon Magazine' publicou mais de 400 edições de conteúdo oficial de D&D.",
        "O termo 'Critical Hit' foi introduzido pela primeira vez em um jogo chamado 'Empire of the Petal Throne'.",
        "O primeiro cenário de campanha publicado foi Blackmoor, de Dave Arneson.",
        "O conceito de Pontos de Vida (HP) foi adaptado de jogos navais para simular a resistência de heróis.",
        "O Mímico foi criado por Gygax para impedir que jogadores saíssem abrindo baús sem checar armadilhas.",
        "A aventura 'Tumba dos Horrores' foi feita especificamente para desafiar jogadores de níveis muito altos.",
        "Vin Diesel joga D&D há mais de 30 anos e tem o nome de seu personagem tatuado no peito.",
        "A cena inicial de 'E.T.: O Extraterrestre' mostra os personagens jogando D&D em casa.",
        "O termo 'Dungeon Master' é uma marca registrada da Wizards of the Coast.",
        "A deusa Tiamat, embora baseada na Babilônia, teve sua forma de 5 cabeças inventada para o RPG.",
        "No início, os jogadores ganhavam experiência (XP) encontrando ouro, e não derrotando monstros.",
        "A classe Paladino foi inspirada nos Doze Pares de França da literatura medieval.",
        "O 'D20 System' foi lançado sob uma licença aberta (OGL), permitindo que qualquer um criasse jogos compatíveis.",
        "A 'Sessão Zero' é considerada a regra não escrita mais importante para alinhar expectativas no grupo.",
        "A Sanidade foi introduzida como mecânica principal no RPG 'Chamado de Cthulhu' em 1981.",
        "A maior campanha contínua de RPG do mundo está ativa há mais de 40 anos com o mesmo mestre.",
        "O RPG brasileiro 'Tormenta' nasceu como um encarte para a revista Dragão Brasil em 1999.",
        "O d10 é o único dado comum de RPG que não é um sólido platônico regular.",
        "A primeira tradução oficial de D&D para o português foi lançada pela Grow em 1992.",
        "Existem dados de RPG feitos de pedras preciosas, metal, ossos e até meteoritos reais.",
        "O termo 'Tank' veio do RPG de mesa para descrever o personagem que protege o resto do grupo.",
        "O primeiro RPG de terror foi 'Bunnies & Burrows', onde você jogava com coelhos tentando sobreviver.",
        "A 'Maldição dos Dados' é a superstição de que dados podem ter 'sorte' ou 'azar' acumulados.",
        "O sistema GURPS é famoso por ter suplementos tão detalhados que são usados como referência histórica.",
        "No cenário 'Dark Sun', a magia é tão poderosa que drena a vida das plantas ao redor do conjurador.",
        "O Alinhamento original de D&D tinha apenas três opções: Ordeiro, Neutro e Caótico.",
        "A classe Monge foi inspirada nos filmes de artes marciais dos anos 70 que Gygax adorava.",
        "Muitos nomes em Greyhawk são anagramas dos nomes dos amigos de Gary Gygax.",
        "O 'X-Card' é uma ferramenta de segurança moderna usada para pular temas sensíveis na mesa.",
        "O Beholder foi ideia de Terry Kuntz, irmão de um dos jogadores originais de Gary.",
        "O RPG é hoje reconhecido por psicólogos como uma ferramenta eficaz para desenvolver empatia e socialização."
    ],
    triviaIndex: 0,

    init() {
        console.log("⚔️ Lyra WebApp Initializing...");
        // Applying initial view immediately to prevent flicker
        this.switchView(this.currentView);

        // 10% chance for Damien Kael Easter Egg
        this.isDamien = Math.random() < 0.1;
        if (this.isDamien) {
            document.body.classList.add('damien-theme');
            console.warn("💀 Damien Kael has infiltrated the system...");
        }

        initAuth(this.handleAuthStateChange.bind(this));
        this.populateSystems();
        this.showRandomTrivia();
        this.bindEvents();
        this.loadUserPreferences();

        if (this.isDamien) this.applyDamienAssets();
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

            // Update display text
            const currentSystem = SUPPORTED_SYSTEMS.find(s => s.id === this.currentSystem);
            if (textDisplay && currentSystem) {
                textDisplay.textContent = currentSystem.name;
            }

            // Add click handlers to options
            optionsContainer.querySelectorAll('.custom-select-option').forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    const text = option.textContent.trim();

                    // Update selection
                    optionsContainer.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');

                    // Update display and hidden input
                    textDisplay.textContent = text;
                    hiddenInput.value = value;

                    // Close dropdown
                    document.getElementById('system-selector-container').classList.remove('open');
                    document.getElementById('system-selector-options-wrapper').classList.add('hidden');

                    // Trigger system change
                    this.handleSystemChange(value);
                });
            });

            // Bind scroll indicators
            optionsContainer.addEventListener('scroll', () => this.updateDropdownScroll(optionsContainer));
            this.updateDropdownScroll(optionsContainer);
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
                let text = this.rpgTrivia[this.triviaIndex];

                // Damien Rune Conversion
                if (this.isDamien) {
                    text = [...text].map(char => {
                        if (char === ' ') return ' ';
                        // Random Runic character from Unicode range 0x16A0 - 0x16F0
                        return String.fromCharCode(0x16A0 + Math.floor(Math.random() * 80));
                    }).join('');
                }

                triviaEl.textContent = text;
                triviaEl.classList.remove('fade-out');
                this.triviaIndex = (this.triviaIndex + 1) % this.rpgTrivia.length;
            }, 800);
        };

        updateText();
        setInterval(updateText, 10000);
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
        document.getElementById('menu-btn')?.addEventListener('click', () => this.toggleMenu(true));
        document.querySelectorAll('.close-menu, .menu-overlay').forEach(el => {
            el.addEventListener('click', () => this.toggleMenu(false));
        });

        // Custom System Selector Toggle
        document.getElementById('system-selector-trigger')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const container = document.getElementById('system-selector-container');
            const wrapper = document.getElementById('system-selector-options-wrapper');
            const options = document.getElementById('system-selector-options');
            const isOpen = container.classList.contains('open');

            if (isOpen) {
                container.classList.remove('open');
                wrapper.classList.add('hidden');
            } else {
                container.classList.add('open');
                wrapper.classList.remove('hidden');
                this.updateDropdownScroll(options);
            }
        });

        // Close system selector when clicking outside
        document.addEventListener('click', (e) => {
            const container = document.getElementById('system-selector-container');
            const wrapper = document.getElementById('system-selector-options-wrapper');
            if (container && !container.contains(e.target)) {
                container.classList.remove('open');
                wrapper?.classList.add('hidden');
            }
        });
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

        document.getElementById('bulk-delete-fichas-btn')?.addEventListener('click', () => this.toggleDeleteMode());

        // Settings & Perfil
        document.getElementById('settings-btn')?.addEventListener('click', () => this.openSettings());
        document.getElementById('save-settings-btn')?.addEventListener('click', () => this.saveSettings());

        document.getElementById('cursor-selector')?.addEventListener('click', (e) => {
            const option = e.target.closest('.cursor-option');
            if (option) {
                document.querySelectorAll('.cursor-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            }
        });

        // Global delegate for medieval-cards (dynamic content)
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.card-delete-btn');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                const card = deleteBtn.closest('.medieval-card');
                if (card && card.dataset.id && card.dataset.type) {
                    this.deleteItem(card.dataset.id, card.dataset.type, e);
                }
                return;
            }

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

        // Switch Character Button - Open Dropdown
        document.getElementById('switch-char-btn')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('char-switcher-dropdown');
            const isOpen = !dropdown.classList.contains('hidden');

            if (isOpen) {
                dropdown.classList.add('hidden');
            } else {
                // Populate and show dropdown
                await this.populateCharSwitcher();
                dropdown.classList.remove('hidden');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('char-switcher-dropdown');
            const container = document.querySelector('.char-switcher-container');
            if (dropdown && !container?.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        document.getElementById('edit-sheet-btn')?.addEventListener('click', () => this.toggleSheetEdit(true));
        document.getElementById('cancel-sheet-btn')?.addEventListener('click', () => this.cancelSheetEdit());
        document.getElementById('save-sheet-btn')?.addEventListener('click', () => this.saveSheetChanges());

        // Dynamic Lists: Add Buttons
        document.getElementById('add-attack-btn')?.addEventListener('click', () => this.addListItem('combat.attacks', { name: '', bonus: '', damage: '' }));
        document.getElementById('add-spell-btn')?.addEventListener('click', () => this.addListItem('spells.list', { name: '', level: '', range: '' }));
        document.getElementById('add-item-btn')?.addEventListener('click', () => this.addListItem('inventory.items', { name: '', quantity: 1, weight: 0 }));

        // Global delegate for delete list items & proficiency toggles
        document.getElementById('character-sheet')?.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.delete-list-item');
            if (delBtn) {
                const listPath = delBtn.dataset.list;
                const index = parseInt(delBtn.dataset.index);
                this.removeListItem(listPath, index);
                return;
            }

            const profBtn = e.target.closest('.prof-toggle');
            if (profBtn && document.getElementById('character-sheet').classList.contains('edit-mode')) {
                const field = profBtn.dataset.field;
                const type = profBtn.dataset.type; // 'skills' or 'saves'
                this.toggleProficiency(type, field);
            }
        });

        // Token Upload
        document.getElementById('token-upload')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file || !this.currentCharacter) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showAlert("Por favor, selecione uma imagem válida.", "Erro");
                return;
            }

            // Validate file size (max 2MB before compression)
            const MAX_SIZE = 2 * 1024 * 1024; // 2MB
            if (file.size > MAX_SIZE) {
                this.showAlert("Imagem muito pesada! O limite original é de 2MB. Tente reduzir o arquivo ou usar outro formato.", "Arquivo Grande");
                return;
            }

            try {
                this.toggleLoading(true);

                // Resize image to 400x400 before upload
                const resizedBlob = await this.resizeImage(file, 400, 400);

                const url = await uploadCharacterToken(this.user.uid, this.currentCharacter.id, resizedBlob);
                this.currentCharacter.tokenUrl = url;
                await saveCharacter(this.user.uid, this.currentSystem, this.currentCharacter);
                document.getElementById('sheet-token').src = url;
                this.showAlert("Token atualizado com sucesso!", "Imagem");
            } catch (error) {
                console.error("Erro no upload:", error);
                this.showAlert("Erro ao enviar imagem: " + error.message, "Erro");
            } finally {
                this.toggleLoading(false);
                e.target.value = ''; // Reset input
            }
        });

        // Settings & Profile
        document.getElementById('settings-btn')?.addEventListener('click', () => this.openSettings());
        document.getElementById('save-settings-btn')?.addEventListener('click', () => this.saveSettings());

        // Cursor Selector Delegation
        document.getElementById('cursor-selector')?.addEventListener('click', (e) => {
            const option = e.target.closest('.cursor-option');
            if (option) {
                document.querySelectorAll('.cursor-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // Optional: Preview cursor immediately
                const cursor = option.dataset.cursor;
                if (cursor) {
                    document.body.className = document.body.className.replace(/cursor-\S+/g, '');
                    document.body.classList.add(`cursor-${cursor}`);
                }
            }
        });
    },

    // Resize image using canvas
    async resizeImage(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Calculate new dimensions (square crop)
                const size = Math.min(img.width, img.height);
                const sx = (img.width - size) / 2;
                const sy = (img.height - size) / 2;

                canvas.width = maxWidth;
                canvas.height = maxHeight;

                // Draw cropped and resized image
                ctx.drawImage(img, sx, sy, size, size, 0, 0, maxWidth, maxHeight);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Falha ao processar imagem'));
                }, 'image/jpeg', 0.7); // 70% quality is perfect for 400x400 tokens
            };

            img.onerror = () => reject(new Error('Falha ao carregar imagem'));
            img.src = URL.createObjectURL(file);
        });
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

    async handleSystemChange(systemId) {
        console.log("🎲 Alternando sistema para:", systemId);

        // Save current character for current system before switching
        if (this.currentCharacter && this.currentSystem) {
            localStorage.setItem(`lyra_char_${this.currentSystem}`, this.currentCharacter.id);
        }

        this.currentSystem = systemId;
        localStorage.setItem('lyra_current_system', systemId);

        // Try to restore last character for this system
        const savedCharId = localStorage.getItem(`lyra_char_${systemId}`);
        if (savedCharId && this.user) {
            try {
                const char = await getCharacter(savedCharId);
                if (char) {
                    this.selectCharacter(char);
                } else {
                    this.currentCharacter = null;
                    this.updateHeaderTracker(null);
                }
            } catch {
                this.currentCharacter = null;
                this.updateHeaderTracker(null);
            }
        } else {
            this.currentCharacter = null;
            this.updateHeaderTracker(null);
        }

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
        const userActions = document.getElementById('user-profile-actions');

        if (user) {
            userActions?.classList.remove('hidden');
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <img src="${user.photoURL || 'assets/Lyra_Token.png'}" class="user-avatar" alt="Avatar">
                    <span>Sair</span>
                `;
                loginBtn.onclick = () => logout();
            }
            tracker?.classList.remove('hidden');
            this.selectCharacter(this.currentCharacter);
            this.loadUserPreferences();
        } else {
            userActions?.classList.add('hidden');
            if (loginBtn) {
                loginBtn.innerHTML = `<i class="fas fa-key"></i> Entrar`;
                loginBtn.onclick = () => login();
            }
            tracker?.classList.add('hidden');
            this.clearAllViews();
        }
    },

    async loadUserPreferences() {
        if (!this.user) return;
        // In a real app, we'd fetch from Firestore collection 'users'
        // For now, let's use localStorage as a fallback/cache
        const prefs = JSON.parse(localStorage.getItem(`lyra_prefs_${this.user.uid}`) || '{}');
        this.applyPreferences(prefs);
    },

    applyPreferences(prefs) {
        if (!prefs) return;

        // Apply cursor
        document.body.className = document.body.className.replace(/cursor-\S+/g, '');
        if (prefs.cursor) {
            document.body.classList.add(`cursor-${prefs.cursor}`);
        }

        // Fill settings fields if modal is open (or just keep in data)
        const nick = document.getElementById('setting-nickname');
        const wa = document.getElementById('setting-whatsapp');
        const bio = document.getElementById('setting-bio');

        if (nick) nick.value = prefs.nickname || '';
        if (wa) wa.value = prefs.whatsapp || '';
        if (bio) bio.value = prefs.bio || '';

        if (prefs.cursor) {
            const opt = document.querySelector(`.cursor-option[data-cursor="${prefs.cursor}"]`);
            if (opt) {
                document.querySelectorAll('.cursor-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            }
        }
    },

    openSettings() {
        this.openModal('settings-modal');
    },

    async saveSettings() {
        if (!this.user) return;

        const nickname = document.getElementById('setting-nickname').value;
        const whatsapp = document.getElementById('setting-whatsapp').value;
        const bio = document.getElementById('setting-bio').value;
        const selectedCursor = document.querySelector('.cursor-option.active')?.dataset.cursor;

        const prefs = {
            nickname,
            whatsapp,
            bio,
            cursor: selectedCursor
        };

        localStorage.setItem(`lyra_prefs_${this.user.uid}`, JSON.stringify(prefs));
        this.applyPreferences(prefs);
        this.closeModal('settings-modal');
        this.showAlert("Preferências consagradas com sucesso!", "Selo Real");
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

    updateDropdownScroll(container) {
        if (!container) return;
        const wrapper = container.parentElement;
        const up = wrapper.querySelector('.dropdown-scroll-arrow.up');
        const down = wrapper.querySelector('.dropdown-scroll-arrow.down');

        if (!up || !down) return;

        const scrollPos = container.scrollTop;
        const containerHeight = container.clientHeight;
        const totalHeight = container.scrollHeight;
        const threshold = 5;

        const canScrollUp = scrollPos > threshold;
        const canScrollDown = scrollPos + containerHeight < totalHeight - threshold;

        up.classList.toggle('hidden', !canScrollUp);
        down.classList.toggle('hidden', !canScrollDown || totalHeight <= containerHeight);
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
        // Consolidating with selectCharacter for simplicity
        this.selectCharacter(character);
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

    selectCharacter(char) {
        this.currentCharacter = char;
        const info = document.getElementById('header-char-info');

        if (!char) {
            info?.classList.add('hidden');
            return;
        }

        // Persist selection for this system
        if (char && char.id) {
            localStorage.setItem(`lyra_char_${this.currentSystem}`, char.id);
        }

        // Show info part
        info?.classList.remove('hidden');
        const b = char.secoes?.basico || {};
        const comb = char.secoes?.combate || {};

        document.getElementById('header-char-name').textContent = char.name || b.Nome || 'Sem Nome';
        document.getElementById('header-char-level').textContent = `Nível ${b.Nível || 1}`;
        const statsEl = document.getElementById('header-char-stats');
        if (statsEl) statsEl.style.display = 'none';

        // Update token if available index.html uses header-char-token? No, I should check.
        // Actually, looking at index.html, there is no token in the header tracker yet.
        // But selectCharacter previously tried to update it. I'll leave it but wrap with check.
        const tokenImg = document.querySelector('.header-char-token');
        if (tokenImg) {
            tokenImg.src = char.tokenUrl || (this.isDamien ? 'assets/Damien_Token.png' : 'assets/Lyra_Token.png');
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

    async handleWizardFinish() {
        const name = document.getElementById('wiz-name').value.trim();
        const race = document.getElementById('wiz-race').value.trim();
        const className = document.getElementById('wiz-class').value;

        if (!name || !race || !className) {
            this.showAlert("Nome, Raça e Classe são obrigatórios para a jornada!", "Campos Faltando");
            return;
        }

        this.toggleLoading(true);
        try {
            const { SYSTEM_TEMPLATES } = await import('./constants.js');
            const template = JSON.parse(JSON.stringify(SYSTEM_TEMPLATES[this.currentSystem] || SYSTEM_TEMPLATES['dnd5e']));

            // Mapping Wizard values to Alfa 2.0 Structure
            template.bio.name = name;
            template.bio.race = race;
            template.bio.class = className;
            template.bio.background = document.getElementById('wiz-background').value;
            template.bio.alignment = document.getElementById('wiz-alignment').value;
            template.bio.level = 1;

            template.attributes.str = parseInt(document.getElementById('wiz-str').value) || 10;
            template.attributes.dex = parseInt(document.getElementById('wiz-dex').value) || 10;
            template.attributes.con = parseInt(document.getElementById('wiz-con').value) || 10;
            template.attributes.int = parseInt(document.getElementById('wiz-int').value) || 10;
            template.attributes.wis = parseInt(document.getElementById('wiz-wis').value) || 10;
            template.attributes.cha = parseInt(document.getElementById('wiz-cha').value) || 10;

            const skills = Array.from(document.querySelectorAll('.skills-selection input:checked')).map(i => i.value);
            template.proficiencies_choice.skills = skills;

            template.stats.speed = document.getElementById('wiz-speed').value || "9m";

            // Story & Fluff
            template.story.traits = document.getElementById('wiz-traits').value;
            template.story.ideals = document.getElementById('wiz-ideals').value;
            template.story.bonds = document.getElementById('wiz-bonds').value;
            template.story.flaws = document.getElementById('wiz-flaws').value;
            template.story.mannerisms = document.getElementById('wiz-mannerisms').value;
            template.story.talents = document.getElementById('wiz-talents').value;
            template.story.notes = document.getElementById('wiz-backstory').value;

            let finalData = { name: name, ...template };

            if (this.creationMode === 'ai') {
                const idToken = await this.user.getIdToken();
                const aiResult = await createCharacterWithLyra(finalData, idToken);
                if (aiResult) {
                    finalData.story.traits = aiResult.traits || aiResult.Personalidade || finalData.story.traits;
                    finalData.story.ideals = aiResult.ideals || aiResult.Ideais || finalData.story.ideals;
                    finalData.story.bonds = aiResult.bonds || aiResult.Vínculos || finalData.story.bonds;
                    finalData.story.flaws = aiResult.flaws || aiResult.Defeitos || finalData.story.flaws;
                    finalData.story.mannerisms = aiResult.mannerisms || aiResult.Maneirismos || finalData.story.mannerisms;
                    finalData.story.talents = aiResult.talents || aiResult.Talentos || finalData.story.talents;
                    finalData.story.notes = aiResult.backstory || aiResult.História || finalData.story.notes;
                }
            }

            // Run initial calculation to set HP, Save DC, etc.
            this.calculateDND5eStats(finalData);
            // Set current HP to max HP initially
            finalData.stats.hp_current = finalData.stats.hp_max;

            await saveCharacter(this.user.uid, this.currentSystem, finalData);
            this.closeModal();
            this.loadCharacters();
            this.showAlert(`${name} acaba de ser invocado no multiverso!`, "Herói Criado");
        } catch (error) {
            console.error("Erro na Wizard:", error);
            this.showAlert("A convergência falhou: " + error.message, "Erro Místico");
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
        const list = document.getElementById('monsters-list');
        if (!this.user) {
            if (list) list.innerHTML = '<p class="empty-state">Faça login para ver seu bestiário.</p>';
            return;
        }
        const monsters = await getMonsters(this.user.uid, this.currentSystem);
        if (list) {
            list.innerHTML = monsters.length ? monsters.map(m => this.renderCard(m, 'monster')).join('') : '<p class="empty-state">Nenhuma criatura invocada.</p>';
        }
    },

    async loadTraps() {
        const list = document.getElementById('traps-list');
        if (!this.user) {
            if (list) list.innerHTML = '<p class="empty-state">Faça login para ver suas armadilhas.</p>';
            return;
        }
        const traps = await getTraps(this.user.uid, this.currentSystem);
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
                const b = char.secoes?.basico || {};
                const isCurrent = this.currentCharacter?.id === char.id;
                const race = char.bio?.race || char.secoes?.basico?.Raça || 'Raça?';
                const clazz = char.bio?.class || char.secoes?.basico?.Classe || 'Classe?';
                const level = char.bio?.level || char.secoes?.basico?.Nível || 1;

                return `
                    <div class="char-switcher-item ${isCurrent ? 'active' : ''}" data-char-id="${char.id}">
                        <div class="switcher-item-content">
                            <img src="${char.tokenUrl || (this.isDamien ? 'assets/Damien_Token.png' : 'assets/Lyra_Token.png')}" alt="Token">
                            <div class="switcher-text">
                                <strong>${char.name || char.bio?.name || 'Sem Nome'}</strong>
                                <span>${race} ${clazz} (Nív ${level})</span>
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
                        document.getElementById('char-switcher-dropdown').classList.add('hidden');
                    }
                });
            });

            // Bind scroll indicators
            list.addEventListener('scroll', () => this.updateDropdownScroll(list));
            this.updateDropdownScroll(list);
        } catch (error) {
            console.error("Erro ao carregar personagens:", error);
            list.innerHTML = '<p class="empty-state">Erro ao carregar personagens.</p>';
        }
    },

    renderCard(item, type) {
        let subtitle = "";
        let tokenHtml = "";

        if (type === 'character') {
            subtitle = `${item.secoes?.basico?.Raça || ''} ${item.secoes?.basico?.Classe || ''} (Nív ${item.secoes?.basico?.Nível || 1})`;
            if (item.tokenUrl) {
                tokenHtml = `<img src="${item.tokenUrl}" class="card-token" alt="Token">`;
            }
        }
        if (type === 'monster') subtitle = `${item.secoes?.Tipo || ''} (ND ${item.secoes?.ND || '?'})`;
        if (type === 'trap') subtitle = `Perigo: ${item.secoes?.Dificuldade || 'Média'}`;
        if (type === 'session') subtitle = item.date ? new Date(item.date).toLocaleDateString() : 'Data desconhecida';

        return `
            <div class="medieval-card ${tokenHtml ? 'has-token' : ''}" data-id="${item.id}" data-type="${type}">
                <button class="card-delete-btn" title="Excluir"><i class="fas fa-trash-can"></i></button>
                <div class="card-glow"></div>
                ${tokenHtml}
                <div class="card-info">
                    <h3>${item.name || item.title || 'Sem Nome'}</h3>
                    <span class="card-subtitle">${subtitle}</span>
                </div>
            </div>
        `;
    },

    async viewItem(type, id) {
        if (this.isDeleteMode) return; // Don't open if in delete mode
        if (type === 'character') await this.viewCharacter(id);
        else if (type === 'monster') await this.viewMonster(id);
        else if (type === 'trap') await this.viewTrap(id);
        else if (type === 'session') await this.viewSession(id);
        else alert(`Visualizando ${type}: ${id}`);
    },

    toggleDeleteMode() {
        this.isDeleteMode = !this.isDeleteMode;
        const body = document.body;
        const btn = document.getElementById('bulk-delete-fichas-btn');

        if (this.isDeleteMode) {
            body.classList.add('delete-mode');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> Concluir';
                btn.classList.remove('secondary');
            }
        } else {
            body.classList.remove('delete-mode');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-trash-can"></i> Excluir';
                btn.classList.add('secondary');
            }
        }
    },

    async deleteItem(id, type, e) {
        if (e) e.stopPropagation();

        const itemTypeLabel = {
            'character': 'este personagem',
            'monster': 'este monstro',
            'session': 'esta sessão',
            'trap': 'esta armadilha'
        }[type] || 'este item';

        const confirmed = await this.showConfirm(
            `Tem certeza que deseja apagar ${itemTypeLabel}? Esta ação não poderá ser desfeita.`,
            "Confirmar Exclusão"
        );

        if (!confirmed) return;

        try {
            if (type === 'character') await deleteCharacter(id);
            else if (type === 'monster') await deleteMonster(id);
            else if (type === 'session') await deleteSession(id);
            // Traps use characters collection often but let's assume separate logic if needed
            // For now, based on imports:
            else if (type === 'trap') await deleteCharacter(id);

            this.showAlert("Item excluído com sucesso.", "Cripta do Esquecimento");

            // Refresh lists
            if (this.currentView === 'fichas') this.loadCharacters();
            else if (this.currentView === 'monstros') this.loadMonsters();
            else if (this.currentView === 'sessoes') this.loadSessions();
            else if (this.currentView === 'dashboard') this.loadDashboardItems();

        } catch (error) {
            console.error("Erro ao excluir:", error);
            this.showAlert("Erro ao excluir o item.", "Erro Arcano");
        }
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

    async updateHeaderTracker(char) {
        const tracker = document.getElementById('header-char-tracker');
        if (!char) {
            tracker?.classList.add('hidden');
            return;
        }

        tracker?.classList.remove('hidden');
        document.getElementById('header-token').src = char.tokenUrl || (this.isDamien ? 'assets/Damien_Token.png' : 'assets/Lyra_Token.png');
        document.getElementById('header-name').innerText = char.name || char.bio?.name || 'Sem Nome';

        // Use new structure or fallback
        const level = char.bio?.level || char.secoes?.basico?.Nível || 1;
        const race = char.bio?.race || char.secoes?.basico?.Raça || 'Raça?';
        const clazz = char.bio?.class || char.secoes?.basico?.Classe || 'Classe?';

        document.getElementById('header-info').innerText = `${race} ${clazz} (Nív ${level})`;

        const hpCurr = char.stats?.hp_current ?? char.secoes?.combate?.HP ?? 10;
        const hpMax = char.stats?.hp_max ?? char.secoes?.combate?.HP_Max ?? 10;
        const ac = char.stats?.ac ?? char.secoes?.combate?.CA ?? 10;

        document.getElementById('header-hp-bar').style.width = `${(hpCurr / hpMax) * 100}%`;
        document.getElementById('header-hp-text').innerText = `${hpCurr}/${hpMax}`;
        document.getElementById('header-ac-val').innerText = ac;
    },

    calculateDND5eStats(char) {
        // Core reativity: Update dependent stats before rendering
        if (!char.bio) char.bio = {};
        if (!char.attributes) char.attributes = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        if (!char.stats) char.stats = { hp_max: 10, hp_current: 10, ac: 10, initiative: 0, speed: "9m" };

        const level = parseInt(char.bio.level) || 1;
        const profBonus = Math.ceil(level / 4) + 1;
        char.stats.proficiency_bonus = profBonus;

        const getMod = (val) => Math.floor((parseInt(val) - 10) / 2);
        const strMod = getMod(char.attributes.str);
        const dexMod = getMod(char.attributes.dex);
        const conMod = getMod(char.attributes.con);
        const intMod = getMod(char.attributes.int);
        const wisMod = getMod(char.attributes.wis);
        const chaMod = getMod(char.attributes.cha);

        // Passive Perception
        const perProf = (char.proficiencies_choice?.skills || []).includes('percepcao') ? profBonus : 0;
        const perExpert = (char.proficiencies_choice?.expertise || []).includes('percepcao') ? profBonus : 0;
        char.stats.passive_perception = 10 + wisMod + perProf + perExpert;

        // Initiative & Speed (Base)
        char.stats.initiative = dexMod;

        // Encumbrance
        if (char.inventory) {
            let totalWeight = 0;
            (char.inventory.items || []).forEach(item => {
                totalWeight += (parseFloat(item.weight) || 0) * (parseInt(item.quantity) || 1);
            });
            // 50 coins = 1 lb
            const coins = char.inventory.coins || {};
            const totalCoins = (parseInt(coins.pc) || 0) + (parseInt(coins.pp) || 0) + (parseInt(coins.pe) || 0) + (parseInt(coins.po) || 0) + (parseInt(coins.pl) || 0);
            totalWeight += totalCoins / 50;

            char.inventory.encumbrance = {
                current: parseFloat(totalWeight.toFixed(2)),
                limit: (parseInt(char.attributes.str) || 10) * 15
            };
        }

        // Initial HP Calculation if zero or not set
        if (!char.stats.hp_max || char.stats.hp_max === 0) {
            const hitDie = char.bio.hitDie ? parseInt(char.bio.hitDie.replace('d', '')) : 8;
            char.stats.hp_max = hitDie + conMod + ((level - 1) * (Math.floor(hitDie / 2) + 1 + conMod));
            char.stats.hp_current = char.stats.hp_max;
        }

        // AC Calculation (Basic: 10 + Dex)
        if (!char.stats.ac || char.stats.ac === 10) {
            char.stats.ac = 10 + dexMod;
        }

        return { strMod, dexMod, conMod, intMod, wisMod, chaMod, profBonus };
    },

    populateSheet(char) {
        if (!char) return;

        // 1. Run Engine
        const mods = this.calculateDND5eStats(char);

        // Header Info
        document.getElementById('sheet-char-name').innerText = char.name || char.bio?.name || 'Sem Nome';
        document.getElementById('sheet-char-info').innerText = `${char.bio?.race || '?'} • ${char.bio?.class || '?'} • Nível ${char.bio?.level || 1}`;
        document.getElementById('sheet-token').src = char.tokenUrl || (this.isDamien ? 'assets/Damien_Token.png' : 'assets/Lyra_Token.png');

        // --- ABA PRINCIPAL ---
        const b = char.bio || {};
        document.getElementById('sheet-background').innerText = b.background || "Nenhum";
        document.getElementById('sheet-alignment').innerText = b.alignment || "Neutro";
        document.getElementById('sheet-xp').innerText = b.xp || "0";
        document.getElementById('sheet-player-name').innerText = b.playerName || "-";

        document.getElementById('sheet-prof').innerText = mods.profBonus >= 0 ? `+${mods.profBonus}` : mods.profBonus;
        document.getElementById('sheet-passive-percep').innerText = char.stats.passive_perception;

        // Scores
        const scoresGrid = document.getElementById('sheet-scores');
        if (scoresGrid) {
            const attrMap = [
                { id: 'str', l: 'FOR', v: char.attributes.str, m: mods.strMod },
                { id: 'dex', l: 'DEX', v: char.attributes.dex, m: mods.dexMod },
                { id: 'con', l: 'CON', v: char.attributes.con, m: mods.conMod },
                { id: 'int', l: 'INT', v: char.attributes.int, m: mods.intMod },
                { id: 'wis', l: 'WIS', v: char.attributes.wis, m: mods.wisMod },
                { id: 'cha', l: 'CHA', v: char.attributes.cha, m: mods.chaMod }
            ];
            scoresGrid.innerHTML = attrMap.map(a => `
                    <span class="score-mod">${a.m >= 0 ? `+${a.m}` : a.m}</span>
                </div>
            `).join('');
        }

        // Saves & Skills
        const savesContainer = document.getElementById('sheet-saves');
        if (savesContainer) {
            const saves = [
                { id: 'str', l: 'Força' }, { id: 'dex', l: 'Destreza' }, { id: 'con', l: 'Constituição' },
                { id: 'int', l: 'Inteligência' }, { id: 'wis', l: 'Sabedoria' }, { id: 'cha', l: 'Carisma' }
            ];
            savesContainer.innerHTML = saves.map(s => {
                const isProf = (char.proficiencies_choice?.saves || []).includes(s.id);
                const val = mods[`${s.id}Mod`] + (isProf ? mods.profBonus : 0);
                return `
                    <div class="prof-item">
                        <span class="prof-indicator prof-toggle ${isProf ? 'active' : ''}" data-type="saves" data-field="${s.id}"></span>
                        <span class="prof-label">${s.l}</span>
                        <span class="prof-val">${val >= 0 ? `+${val}` : val}</span>
                    </div>
                `;
            }).join('');
        }

        const skillsContainer = document.getElementById('sheet-skills');
        if (skillsContainer) {
            const skills = [
                { id: 'acrobacia', l: 'Acrobacia (Des)' }, { id: 'adestrar_animais', l: 'Adestrar Animais (Sab)' },
                { id: 'arcanismo', l: 'Arcanismo (Int)' }, { id: 'atletismo', l: 'Atletismo (For)' },
                { id: 'atuacao', l: 'Atuação (Car)' }, { id: 'enganacao', l: 'Enganação (Car)' },
                { id: 'furtividade', l: 'Furtividade (Des)' }, { id: 'historia', l: 'História (Int)' },
                { id: 'intimidacao', l: 'Intimidação (Car)' }, { id: 'intuicao', l: 'Intuição (Sab)' },
                { id: 'investigacao', l: 'Investigação (Int)' }, { id: 'medicina', l: 'Medicina (Sab)' },
                { id: 'natureza', l: 'Natureza (Int)' }, { id: 'percepcao', l: 'Percepção (Sab)' },
                { id: 'persuasao', l: 'Persuasão (Car)' }, { id: 'prestidigitacao', l: 'Prestidigitação (Des)' },
                { id: 'religiao', l: 'Religião (Int)' }, { id: 'sobrevivencia', l: 'Sobrevivência (Sab)' }
            ];
            skillsContainer.innerHTML = skills.map(sk => {
                const isProf = (char.proficiencies_choice?.skills || []).includes(sk.id);
                const isExpert = (char.proficiencies_choice?.expertise || []).includes(sk.id);
                const attr = sk.l.match(/\((.*?)\)/)[1].toLowerCase().replace('sab', 'wis').replace('des', 'dex').replace('for', 'str').replace('car', 'cha');
                const val = mods[`${attr}Mod`] + (isProf ? mods.profBonus : 0) + (isExpert ? mods.profBonus : 0);
                return `
                    <div class="prof-item">
                        <span class="prof-indicator prof-toggle ${isProf ? 'active' : ''} ${isExpert ? 'expert' : ''}" data-type="skills" data-field="${sk.id}"></span>
                        <span class="prof-label">${sk.l}</span>
                        <span class="prof-val">${val >= 0 ? `+${val}` : val}</span>
                    </div>
                `;
            }).join('');
        }

        // --- ABA COMBATE ---
        const s = char.stats || {};
        document.getElementById('sheet-ca').innerText = s.ac;
        document.getElementById('sheet-inic').innerText = s.initiative >= 0 ? `+ ${s.initiative} ` : s.initiative;
        document.getElementById('sheet-speed').innerText = s.speed;

        document.getElementById('sheet-hp-curr').value = s.hp_current;
        document.getElementById('sheet-hp-max').value = s.hp_max;
        document.getElementById('sheet-hp-temp').value = s.hp_temp || 0;

        document.getElementById('sheet-hd-curr').value = s.hit_dice_current;
        const hdTotalEl = document.getElementById('sheet-hd-total');
        if (hdTotalEl) hdTotalEl.innerText = s.hit_dice_total;

        // Death Saves
        const ds = char.death_saves || { successes: 0, failures: 0 };
        for (let i = 1; i <= 3; i++) {
            const sEl = document.getElementById(`death-s${i}`);
            const fEl = document.getElementById(`death-f${i}`);
            if (sEl) sEl.checked = ds.successes >= i;
            if (fEl) fEl.checked = ds.failures >= i;
        }

        // --- ABA MOCHILA ---
        const inv = char.inventory || { coins: {}, items: [], encumbrance: { current: 0, limit: 150 } };
        const coins = inv.coins || {};
        document.querySelectorAll('.coin-item input').forEach(input => {
            const field = input.dataset.field.split('.').pop();
            input.value = coins[field] || 0;
        });

        const weightBar = document.getElementById('weight-progress');
        const weightText = document.getElementById('weight-text');
        if (weightBar && weightText) {
            const perc = Math.min((inv.encumbrance.current / inv.encumbrance.limit) * 100, 100);
            weightBar.style.width = `${perc}%`;
            weightText.innerText = `${inv.encumbrance.current} / ${inv.encumbrance.limit} lbs`;
        }

        // --- ABA COMBATE: ATAQUES ---
        const attacksBody = document.getElementById('attacks-body');
        if (attacksBody) {
            attacksBody.innerHTML = (char.combat?.attacks || []).map((atk, i) => `
                <div class="list-item-v2" data-index="${i}">
                    <input type="text" value="${atk.name || ''}" placeholder="Nome" data-list="combat.attacks" data-field="name" readonly>
                    <input type="text" value="${atk.bonus || ''}" placeholder="Bônus" data-list="combat.attacks" data-field="bonus" readonly>
                    <input type="text" value="${atk.damage || ''}" placeholder="Dano" data-list="combat.attacks" data-field="damage" readonly>
                    <button class="icon-btn delete-list-item" data-list="combat.attacks" data-index="${i}"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        // --- ABA MAGIA: LISTA ---
        const spellsBody = document.getElementById('spells-body');
        if (spellsBody) {
            spellsBody.innerHTML = (char.spells?.list || []).map((sp, i) => `
                <div class="list-item-v2" data-index="${i}">
                    <input type="text" value="${sp.name || ''}" placeholder="Magia" data-list="spells.list" data-field="name" readonly>
                    <input type="text" value="${sp.level || ''}" placeholder="Nív" data-list="spells.list" data-field="level" readonly>
                    <input type="text" value="${sp.range || ''}" placeholder="Alcance" data-list="spells.list" data-field="range" readonly>
                    <button class="icon-btn delete-list-item" data-list="spells.list" data-index="${i}"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        // --- ABA MOCHILA: ITENS ---
        const inventoryBody = document.getElementById('inventory-body');
        if (inventoryBody) {
            inventoryBody.innerHTML = (char.inventory?.items || []).map((it, i) => `
                <div class="list-item-v2" data-index="${i}">
                    <input type="text" value="${it.name || ''}" placeholder="Item" data-list="inventory.items" data-field="name" readonly>
                    <input type="number" value="${it.quantity || 1}" placeholder="Qtd" data-list="inventory.items" data-field="quantity" readonly>
                    <input type="text" value="${it.weight || 0}" placeholder="Peso" data-list="inventory.items" data-field="weight" readonly>
                    <button class="icon-btn delete-list-item" data-list="inventory.items" data-index="${i}"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        // --- ABA CRÔNICAS ---
        const story = char.story || {};
        const chronicSection = document.getElementById('sheet-historia');
        if (chronicSection) {
            chronicSection.querySelectorAll('textarea').forEach(txt => {
                const field = txt.dataset.field.split('.').pop();
                txt.value = story[field] || "";
            });
        }
    },

    toggleSheetEdit(enable) {
        const sheet = document.getElementById('character-sheet');
        sheet.classList.toggle('edit-mode', enable);
        document.getElementById('edit-sheet-btn').classList.toggle('hidden', enable);
        document.getElementById('cancel-sheet-btn')?.classList.toggle('hidden', !enable);
        document.getElementById('save-sheet-btn').classList.toggle('hidden', !enable);

        if (enable) {
            this.characterBackup = JSON.parse(JSON.stringify(this.currentCharacter));

            // Editable Spans (Principal)
            sheet.querySelectorAll('.editable').forEach(el => {
                const val = el.innerText === '-' ? '' : el.innerText;
                const field = el.dataset.field;
                const isNum = field.includes('attributes') || field.includes('xp');
                el.innerHTML = `<input type="${isNum ? 'number' : 'text'}" value="${val}" data-field="${field}">`;
            });

            // Textareas (Crônicas)
            sheet.querySelectorAll('textarea[data-field]').forEach(txt => {
                txt.readOnly = false;
            });

            // Inputs Diretos (Combate/Mochila)
            sheet.querySelectorAll('input[data-field]').forEach(input => {
                input.readOnly = false;
                input.disabled = false;
            });

            // Selects
            sheet.querySelectorAll('select[data-field]').forEach(sel => sel.disabled = false);

            // Alinhamento -> Select
            const alignmentEl = document.getElementById('sheet-alignment');
            if (alignmentEl) {
                const current = alignmentEl.innerText;
                alignmentEl.innerHTML = `
                    <select data-field="bio.alignment" class="wizard-select small">
                        <option value="Leal e Bom" ${current === 'Leal e Bom' ? 'selected' : ''}>Leal e Bom</option>
                        <option value="Neutro e Bom" ${current === 'Neutro e Bom' ? 'selected' : ''}>Neutro e Bom</option>
                        <option value="Caótico e Bom" ${current === 'Caótico e Bom' ? 'selected' : ''}>Caótico e Bom</option>
                        <option value="Leal e Neutro" ${current === 'Leal e Neutro' ? 'selected' : ''}>Leal e Neutro</option>
                        <option value="Neutro" ${current === 'Neutro' ? 'selected' : ''}>Neutro</option>
                        <option value="Caótico e Neutro" ${current === 'Caótico e Neutro' ? 'selected' : ''}>Caótico e Neutro</option>
                        <option value="Leal e Mau" ${current === 'Leal e Mau' ? 'selected' : ''}>Leal e Mau</option>
                        <option value="Neutro e Mau" ${current === 'Neutro e Mau' ? 'selected' : ''}>Neutro e Mau</option>
                        <option value="Caótico e Mau" ${current === 'Caótico e Mau' ? 'selected' : ''}>Caótico e Mau</option>
                    </select>
                `;
            }
        } else {
            // Restore display mode or discard changes
            if (this.currentCharacter) this.populateSheet(this.currentCharacter);
            sheet.querySelectorAll('textarea[data-field]').forEach(txt => txt.readOnly = true);
            sheet.querySelectorAll('input[data-field]').forEach(input => {
                input.readOnly = true;
                input.disabled = (input.type === 'checkbox');
            });
            sheet.querySelectorAll('select[data-field]').forEach(sel => sel.disabled = true);
        }
    },

    // --- Dynamic Lists: Add/Remove ---
    addListItem(path, template) {
        if (!this.currentCharacter) return;
        const keys = path.split('.');
        let target = this.currentCharacter;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        const lastKey = keys[keys.length - 1];
        if (!target[lastKey]) target[lastKey] = [];
        target[lastKey].push({ ...template });
        this.populateSheet(this.currentCharacter);
        this.toggleSheetEdit(true); // Manter modo edição
    },

    removeListItem(path, index) {
        if (!this.currentCharacter) return;
        const keys = path.split('.');
        let target = this.currentCharacter;
        for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
        const lastKey = keys[keys.length - 1];
        target[lastKey].splice(index, 1);
        this.populateSheet(this.currentCharacter);
        this.toggleSheetEdit(true);
    },

    toggleProficiency(type, field) {
        if (!this.currentCharacter) return;
        if (!this.currentCharacter.proficiencies_choice) {
            this.currentCharacter.proficiencies_choice = { skills: [], expertise: [], saves: [] };
        }
        const list = this.currentCharacter.proficiencies_choice[type] || [];
        const idx = list.indexOf(field);
        if (idx === -1) {
            list.push(field);
        } else {
            list.splice(idx, 1);
        }
        this.currentCharacter.proficiencies_choice[type] = list;
        this.populateSheet(this.currentCharacter);
        this.toggleSheetEdit(true);
    },

    cancelSheetEdit() {
        if (this.characterBackup) {
            this.currentCharacter = JSON.parse(JSON.stringify(this.characterBackup));
            this.populateSheet(this.currentCharacter);
        }
        this.toggleSheetEdit(false);
    },

    async saveSheetChanges() {
        if (!this.currentCharacter) return;

        const sheet = document.getElementById('character-sheet');
        const updates = {
            bio: { ...this.currentCharacter.bio },
            attributes: { ...this.currentCharacter.attributes },
            stats: { ...this.currentCharacter.stats },
            story: { ...this.currentCharacter.story },
            combat: { ...this.currentCharacter.combat || {} },
            spells: { ...this.currentCharacter.spells || {} },
            inventory: { ...this.currentCharacter.inventory || {} },
            proficiencies_choice: { ...this.currentCharacter.proficiencies_choice || {} }
        };

        // Gather basic inputs
        sheet.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field;
            const keys = field.split('.');
            let val;

            if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                val = el.type === 'number' ? parseInt(el.value) || 0 : el.value;
            } else {
                // For editable spans replaced by inputs
                const input = el.querySelector('input, select');
                if (input) {
                    val = input.type === 'number' ? parseInt(input.value) || 0 : input.value;
                } else {
                    return; // Skip if no input found
                }
            }

            // Deep set
            let target = updates;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!target[keys[i]]) target[keys[i]] = {};
                target = target[keys[i]];
            }
            target[keys[keys.length - 1]] = val;
        });

        // Gather Lists (Special treatment to ensure arrays are preserved and updated)
        const gatherList = (selector, path) => {
            const items = [];
            sheet.querySelectorAll(`${selector} .list-item-v2`).forEach(row => {
                const item = {};
                row.querySelectorAll('input').forEach(input => {
                    const f = input.dataset.field;
                    item[f] = input.type === 'number' ? parseInt(input.value) || 0 : input.value;
                });
                items.push(item);
            });
            const keys = path.split('.');
            let target = updates;
            for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
            target[keys[keys.length - 1]] = items;
        };

        gatherList('#attacks-body', 'combat.attacks');
        gatherList('#spells-body', 'spells.list');
        gatherList('#inventory-body', 'inventory.items');

        try {
            const { updateCharacter } = await import('./data.js');
            await updateCharacter(this.currentCharacter.id, updates);
            this.currentCharacter = { ...this.currentCharacter, ...updates };
            this.populateSheet(this.currentCharacter);
            this.toggleSheetEdit(false);
            this.showAlert("Ficha salva com sucesso!", "Grimório de Personagens");
        } catch (err) {
            this.showAlert("Erro ao salvar: " + err.message, "Aviso");
        } finally {
            this.toggleLoading(false);
        }
    },

    getNestedValue(obj, path) {
        if (!path) return undefined;
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === undefined || current === null) return undefined;
            current = current[part];
        }
        return current;
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

        // Check if user is logged in
        if (!this.user) {
            this.addMessageToUI('bot', "⚠️ Você precisa fazer login para conversar com Lyra. Clique em 'Entrar' no canto superior direito.");
            return;
        }

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

    showConfirm(message, title = "Aviso do Destino") {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-title');
            const msgEl = document.getElementById('confirm-message');
            const okBtn = document.getElementById('confirm-ok-btn');
            const cancelBtn = document.getElementById('confirm-cancel-btn');

            titleEl.innerText = title;
            msgEl.innerText = message;
            modal.classList.remove('hidden');

            const cleanup = (result) => {
                modal.classList.add('hidden');
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                resolve(result);
            };

            okBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);
            modal.querySelector('.modal-backdrop').onclick = () => cleanup(false);
        });
    },

    // PDF Export
    async exportPDF() { alert("Abrindo portal de exportação no EC2..."); },

    // Damien Assets Infiltration
    applyDamienAssets() {
        // Logo
        const logo = document.querySelector('.header-logo');
        if (logo) logo.src = 'assets/Damien_logo.png';

        // Hero Image
        const lyraImg = document.querySelector('.hero-lyra');
        if (lyraImg) lyraImg.src = 'assets/Damien_Kael.png';

        // Scroll Title (change text)
        const scrollTitle = document.querySelector('.scroll-title');
        if (scrollTitle) scrollTitle.textContent = "Sussurros do Abismo";

        // Default Character sheet token
        const sheetToken = document.getElementById('sheet-token');
        if (sheetToken && sheetToken.src.includes('Lyra_Token.png')) {
            sheetToken.src = 'assets/Damien_Token.png';
        }
    }
};

window.app = app;
app.init();
