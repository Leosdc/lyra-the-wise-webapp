import { generateNames } from '../ai.js';
import { auth } from '../auth.js';
import { SUPPORTED_SYSTEMS, RACES, CLASSES } from '../constants.js';

export const NamesModule = {
    names: [],
    isLoading: false,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const genBtn = document.getElementById('generate-names-btn');
        if (genBtn) {
            genBtn.onclick = () => this.handleGenerate();
        }

        // Custom Race Select (if needed, or just standard select)
    },

    async render() {
        const systemId = localStorage.getItem('lyra_current_system') || 'dnd5e';
        this.populateFilters(systemId);
        this.updateView();
    },

    async populateFilters(systemId) {
        const raceSelect = document.getElementById('names-race-filter');
        const classSelect = document.getElementById('names-class-filter');

        if (raceSelect) {
            const currentRace = raceSelect.value;
            raceSelect.innerHTML = '<option value="">Qualquer Raça</option>' +
                RACES.map(r => `<option value="${r}">${r}</option>`).join('');
            raceSelect.value = currentRace;
        }

        if (classSelect) {
            const currentClass = classSelect.value;
            classSelect.innerHTML = '<option value="">Qualquer Classe</option>' +
                CLASSES.map(c => `<option value="${c}">${c}</option>`).join('');
            classSelect.value = currentClass;
        }
    },

    async handleGenerate() {
        const user = auth.currentUser;
        if (!user) {
            window.app.showAlert("Você precisa de uma conta para consultar o Oráculo de Nomes.", "Acesso Negado");
            return;
        }

        const race = document.getElementById('names-race-filter').value;
        const clazz = document.getElementById('names-class-filter').value;
        const gender = document.querySelector('input[name="names-gender"]:checked')?.value || 'unissex';

        const btn = document.getElementById('generate-names-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invocando...';

        try {
            const idToken = await user.getIdToken();
            const newNames = await generateNames(race, clazz, gender, idToken);
            this.names = newNames;
            this.updateView();
        } catch (e) {
            window.app.showAlert(e.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Gerar 10 Nomes';
        }
    },

    updateView() {
        const container = document.getElementById('names-display-box');
        if (!container) return;

        if (this.names.length === 0) {
            container.innerHTML = '<p class="empty-names-msg">Os deuses aguardam sua escolha...</p>';
            return;
        }

        container.innerHTML = `
            <div class="names-list-grid">
                ${this.names.map(name => `
                    <div class="name-item">
                        <span>${name}</span>
                        <button class="copy-name-btn" title="Copiar Nome">
                            <i class="fas fa-clone"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        // Bind copy buttons after rendering
        container.querySelectorAll('.copy-name-btn').forEach((btn, index) => {
            const name = this.names[index];
            btn.onclick = (e) => this.copyName(name, e);
        });
    },

    copyName(name, event) {
        navigator.clipboard.writeText(name);
        const btn = event.currentTarget || event.target.closest('button');
        const icon = btn.querySelector('i');
        if (!icon) return;

        const originalClass = icon.className;

        icon.className = 'fas fa-check-circle';
        btn.classList.add('copied');

        setTimeout(() => {
            icon.className = originalClass;
            btn.classList.remove('copied');
        }, 1500);
    }
};

window.NamesModule = NamesModule;
