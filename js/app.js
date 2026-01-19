
import { login, logout, initAuth } from "./auth.js";
import { getCharacters, getCharacter, saveCharacter, getMonsters, saveMonster, getSessions, saveSession } from "./data.js";
import { sendMessageToLyra, createMonsterWithLyra } from "./ai.js";

const app = {
    user: null,
    currentView: 'dashboard',
    chatHistory: [],
    wizardStep: 1,
    currentCharacter: null,

    init() {
        console.log("⚔️ Lyra WebApp Initializing...");
        this.bindEvents();
        initAuth((user) => this.handleAuthStateChange(user));
    },

    bindEvents() {
        console.log("🔗 Binding events...");

        // Nav Buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.currentTarget.getAttribute('data-view')));
        });

        // Dashboard Action Cards
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => this.switchView(e.currentTarget.getAttribute('data-view')));
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
                else login().catch(err => alert("Erro ao entrar: " + err.message));
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
    },

    handleAuthStateChange(user) {
        this.user = user;
        const loginBtn = document.getElementById('login-btn');
        if (user) {
            console.log("👤 Usuário logado:", user.email);
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <img src="${user.photoURL}" class="user-avatar" alt="Avatar">
                    <span>Sair</span>
                `;
            }
            this.loadViewData(this.currentView);
        } else {
            console.log("👤 Usuário deslogado");
            if (loginBtn) loginBtn.innerHTML = `<i class="fas fa-key"></i> Entrar`;
            this.clearAllViews();
            this.switchView('dashboard');
        }
    },

    switchView(viewId) {
        console.log("🖼️ Alternando para vista:", viewId);
        this.currentView = viewId;
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-view') === viewId));
        document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.remove('hidden');
        if (this.user) this.loadViewData(viewId);
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
        console.log("✨ Abrindo Criador de Personagem");
        this.openModal('creation-wizard');
        this.wizardStep = 1;
        this.updateWizardUI();
    },

    showMonsterCreator() {
        console.log("🐉 Abrindo Invocador de Monstros");
        document.getElementById('mon-cr').parentElement.classList.remove('hidden');
        document.getElementById('monster-wizard').querySelector('h3').innerText = "Invocação de Criatura";
        this.openModal('monster-wizard');
    },

    showTrapCreator() {
        console.log("💀 Abrindo Invocador de Armadilhas");
        document.getElementById('mon-cr').parentElement.classList.add('hidden');
        document.getElementById('monster-wizard').querySelector('h3').innerText = "Criação de Armadilha";
        this.openModal('monster-wizard');
    },

    showSessionEditor() {
        console.log("📝 Abrindo Diário de Sessão");
        this.openModal('session-wizard');
    },

    openModal(wizardId) {
        document.getElementById('modal-wrapper').classList.add('active');
        document.querySelectorAll('.wizard-container, .sheet-container, .modal-content > div:not(.close-modal):not(#modal-body)').forEach(c => c.classList.add('hidden'));
        const target = document.getElementById(wizardId);
        if (target) target.classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modal-wrapper').classList.remove('active');
    },

    updateWizardStep(dir) {
        this.wizardStep += dir;
        this.updateWizardUI();
    },

    updateWizardUI() {
        document.querySelectorAll('.wizard-step').forEach(s => s.classList.add('hidden'));
        document.querySelector(`.wizard-step[data-step="${this.wizardStep}"]`).classList.remove('hidden');
        document.querySelectorAll('.step-indicator').forEach(i => i.classList.toggle('active', parseInt(i.dataset.step) === this.wizardStep));
        document.getElementById('wiz-prev').classList.toggle('hidden', this.wizardStep === 1);
        document.getElementById('wiz-next').classList.toggle('hidden', this.wizardStep === 4);
        document.getElementById('wiz-finish').classList.toggle('hidden', this.wizardStep !== 4);
    },

    // --- Actions ---
    async handleWizardFinish() {
        const data = {
            name: document.getElementById('wiz-name').value,
            secoes: { basico: { Nome: document.getElementById('wiz-name').value, Raça: document.getElementById('wiz-race').value, Classe: document.getElementById('wiz-class').value } }
        };
        await saveCharacter(this.user.uid, data);
        this.closeModal();
        this.loadCharacters();
    },

    async handleMonsterFinish() {
        const btn = document.getElementById('mon-finish-btn');
        btn.disabled = true;
        btn.innerText = "Invocando...";

        try {
            const isTrap = document.getElementById('monster-wizard').querySelector('h3').innerText.includes("Armadilha");
            const monsterData = {
                name: document.getElementById('mon-name').value,
                cr: isTrap ? "Trap" : document.getElementById('mon-cr').value,
                type: document.getElementById('mon-type').value,
                prompt: document.getElementById('mon-prompt').value
            };

            const idToken = await this.user.getIdToken();
            const result = await createMonsterWithLyra(monsterData, idToken);

            await saveMonster(this.user.uid, result);

            console.log("👹 Conteúdo Invocado:", result);
            alert(`Sucesso! ${result.name} foi conjurado.`);
            this.closeModal();
            this.loadMonsters();
        } catch (error) {
            alert("Falha na invocação mística: " + error.message);
        } finally {
            btn.disabled = false;
            btn.innerText = "Invocar";
        }
    },

    async handleSessionFinish() {
        const btn = document.getElementById('sess-finish-btn');
        btn.disabled = true;
        btn.innerText = "Registrando...";

        try {
            const sessionData = {
                title: document.getElementById('sess-title').value,
                summary: document.getElementById('sess-summary').value,
                notes: document.getElementById('sess-notes').value
            };

            await saveSession(this.user.uid, sessionData);

            alert("Crônica registrada nos anais!");
            this.closeModal();
            this.loadSessions();
        } catch (error) {
            alert("Erro ao registrar: " + error.message);
        } finally {
            btn.disabled = false;
            btn.innerText = "Registrar";
        }
    },

    // --- Data Rendering ---
    async loadCharacters() {
        const container = document.getElementById('fichas-list');
        const chars = await getCharacters(this.user.uid);
        container.innerHTML = chars.length ? chars.map(c => this.renderCard(c, 'fichas')).join('') : '<p class="empty-state">Sem personagens.</p>';
    },

    async loadMonsters() {
        const container = document.getElementById('monsters-list');
        const monsters = await getMonsters(this.user.uid);
        container.innerHTML = monsters.length ? monsters.map(m => this.renderCard(m, 'monstros')).join('') : '<p class="empty-state">O bestiário está vazio.</p>';
    },

    async loadSessions() {
        const container = document.getElementById('sessions-list');
        const sessions = await getSessions(this.user.uid);
        container.innerHTML = sessions.length ? sessions.map(s => this.renderCard(s, 'sessoes')).join('') : '<p class="empty-state">Nenhuma aventura narrada.</p>';
    },

    renderCard(item, type) {
        const b = item.secoes?.basico || {};
        return `<div class="medieval-card" data-type="${type}" data-id="${item.id}">
            <div class="card-title">${item.name || b.Nome || item.title || 'Sem Nome'}</div>
            <div class="card-subtitle">${b.Raça || item.type || ''} ${b.Classe || item.cr || ''}</div>
        </div>`;
    },

    async viewItem(type, id) {
        if (type === 'fichas') await this.viewCharacter(id);
        else alert(`Visualizando ${type}: ${id}`);
    },

    async viewCharacter(id) {
        this.openModal('character-sheet');
        const char = await getCharacter(id);
        this.populateSheet(char);
        this.switchSheetTab('geral');
    },

    populateSheet(char) {
        const b = char.secoes?.basico || {};
        document.getElementById('sheet-char-name').innerText = char.name || b.Nome || 'Sem Nome';
        document.getElementById('sheet-char-info').innerText = `${b.Raça || '?'} • ${b.Classe || '?'}`;
    },

    switchSheetTab(tabId) {
        document.querySelectorAll('.sheet-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
        document.querySelectorAll('.sheet-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`sheet-${tabId}`).classList.remove('hidden');
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
        ['fichas-list', 'monsters-list', 'sessions-list', 'chat-messages'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
    },

    // PDF Export
    async exportPDF() { alert("Abrindo portal de exportação no EC2..."); }
};

window.app = app;
app.init();
