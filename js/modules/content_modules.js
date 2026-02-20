import * as DataModule from '../data.js';
import { NavigationModule } from './navigation.js';
import { auth } from '../auth.js';
import { generateModuleContent } from '../ai.js';

export const ContentModule = {
    // Current active config
    activeModule: null,
    cachedItems: [],
    currentSource: 'personal',
    filters: { search: '' },

    // Map of module keys to their configurations (using lowercase IDs from view)
    configs: {
        'villains': {
            id: 'villains',
            collection: DataModule.COLLECTIONS.VILLAINS,
            icon: 'fa-mask',
            title: 'Vilões',
            aiPrompt: 'Descreva o vilão que deseja criar. A Magia tecerá sua história sombria e motivações.',
            aiPlaceholder: 'Ex: Um necromante que busca vingança contra o reino que o exilou...'
        },
        'npcs': {
            id: 'npcs',
            collection: DataModule.COLLECTIONS.NPCS,
            icon: 'fa-users-gear',
            title: 'NPCs',
            aiPrompt: 'Descreva o personagem que deseja criar. A Magia moldará sua personalidade e história.',
            aiPlaceholder: 'Ex: Um ferreiro anão com um segredo sobre armas antigas...'
        },
        'campaigns': {
            id: 'campaigns',
            collection: DataModule.COLLECTIONS.CAMPAIGNS,
            icon: 'fa-map-location-dot',
            title: 'Campanhas',
            aiPrompt: 'Descreva a campanha que deseja criar. A Magia tecerá uma jornada épica.',
            aiPlaceholder: 'Ex: Uma jornada para salvar o reino de uma antiga maldição...'
        },
        'encounters': {
            id: 'encounters',
            collection: DataModule.COLLECTIONS.ENCOUNTERS,
            icon: 'fa-crosshairs',
            title: 'Encontros',
            aiPrompt: 'Descreva o encontro que deseja criar. A Magia definirá os desafios e inimigos.',
            aiPlaceholder: 'Ex: Uma emboscada de goblins em uma floresta sombria...'
        },
        'puzzles': {
            id: 'puzzles',
            collection: DataModule.COLLECTIONS.PUZZLES,
            icon: 'fa-puzzle-piece',
            title: 'Puzzles',
            aiPrompt: 'Descreva o enigma que deseja criar. A Magia formulará o quebra-cabeça e sua solução.',
            aiPlaceholder: 'Ex: Um quebra-cabeça de runas antigas que abre uma porta secreta...'
        },
        'treasures': {
            id: 'treasures',
            collection: DataModule.COLLECTIONS.TREASURES,
            icon: 'fa-coins',
            title: 'Tesouros',
            aiPrompt: 'Descreva o tesouro que deseja criar. A Magia revelará riquezas e maravilhas.',
            aiPlaceholder: 'Ex: Um baú cheio de moedas de ouro e uma gema mágica...'
        },
        'scenes': {
            id: 'scenes',
            collection: DataModule.COLLECTIONS.SCENES,
            icon: 'fa-image',
            title: 'Cenas',
            aiPrompt: 'Descreva a cena que deseja criar. A Magia pintará o ambiente e atmosfera.',
            aiPlaceholder: 'Ex: Uma taverna movimentada à noite, com música e bebidas...'
        },
        'plots': {
            id: 'plots',
            collection: DataModule.COLLECTIONS.PLOTS,
            icon: 'fa-wand-magic-sparkles',
            title: 'Tramas',
            aiPrompt: 'Descreva a trama que deseja criar. A Magia tecerá intrigas e reviravoltas.',
            aiPlaceholder: 'Ex: Uma conspiração para derrubar o rei e colocar um impostor no trono...'
        },
        'motivations': {
            id: 'motivations',
            collection: DataModule.COLLECTIONS.MOTIVATIONS,
            icon: 'fa-heart-pulse',
            title: 'Motivações',
            aiPrompt: 'Descreva a motivação que deseja criar. A Magia revelará os desejos profundos.',
            aiPlaceholder: 'Ex: Vingança pela morte de um ente querido nas mãos de um tirano...'
        },
        'rules': {
            id: 'rules',
            collection: DataModule.COLLECTIONS.RULES,
            icon: 'fa-book-open',
            title: 'Regras',
            aiPrompt: 'Descreva a regra customizada que deseja criar. A Magia formulará mecânicas balanceadas.',
            aiPlaceholder: 'Ex: Uma regra para combate aéreo com criaturas voadoras...'
        },
        'armadilhas': {
            id: 'armadilhas',
            collection: DataModule.COLLECTIONS.TRAPS,
            icon: 'fa-skull-crossbones',
            title: 'Armadilhas',
            aiPrompt: 'Descreva a armadilha que deseja criar. A Magia definirá os perigos e mecanismos.',
            aiPlaceholder: 'Ex: Uma sala com chão que desaba revelando espinhos envenenados...'
        }
    },

    init() {
        // Global listeners for specialized interactions
        this.bindGlobalEvents();
    },

    bindGlobalEvents() {
        // Prevent binding multiple times
        if (this._eventsbound) return;
        this._eventsbound = true;

        // Handle all selection-cards for all content modules
        Object.keys(this.configs).forEach(id => {
            const container = document.getElementById(`${id}-selection`);
            if (container) {
                container.querySelectorAll('.selection-card').forEach(card => {
                    card.onclick = () => {
                        const source = card.dataset.source;
                        this.currentSource = source;
                        sessionStorage.setItem(`lyra_${id}_source`, source);
                        // Trigger switch through app to ensure auth check and logic
                        window.app.switchView(id);
                    };
                });
            }
        });
    },

    async switchToModule(moduleId) {
        this.activeModule = this.configs[moduleId];
        if (!this.activeModule) return;

        this.currentSource = sessionStorage.getItem(`lyra_${moduleId}_source`) || 'personal';
        this.filters.search = '';

        // Re-bind specific listeners for this view
        this.setupListeners();

        await this.render();
    },

    setupListeners() {
        const id = this.activeModule.id;

        // Back button
        const backBtn = document.getElementById(`back-to-${id}-selection`);
        if (backBtn) {
            backBtn.onclick = () => window.app.switchView(`${id}-selection`);
        }

        // New button
        const newBtn = document.getElementById(`${id}-new-btn`);
        if (newBtn) {
            newBtn.onclick = () => this.openChoiceModal();
        }

        // Search
        const searchInput = document.getElementById(`${id}-search`) || document.getElementById(`${id}-search-input`);
        if (searchInput) {
            searchInput.oninput = (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            };
        }
    },

    async render() {
        if (!this.activeModule) return;
        const id = this.activeModule.id;
        const container = document.getElementById(`${id}-grid`);
        if (!container) return;

        // Reset UI
        const newBtn = document.getElementById(`${id}-new-btn`);
        if (newBtn) newBtn.classList.toggle('hidden', this.currentSource === 'system');

        const title = document.querySelector(`#${id} .view-header h2`);
        if (title) {
            title.innerHTML = `<i class="fas ${this.activeModule.icon}"></i> ${this.activeModule.title} ${this.currentSource === 'system' ? '(Sistema)' : '(Pessoal)'}`;
        }

        container.innerHTML = '<div class="loading-quill"><i class="fas fa-quill fa-spin"></i> Carregando...</div>';

        await this.loadData();
        this.applyFilters();
    },

    async loadData() {
        const user = auth.currentUser;
        const systemId = localStorage.getItem('lyra_current_system') || 'dnd5e';

        if (this.currentSource === 'system') {
            if (this.activeModule.id === 'rules') {
                this.cachedItems = await DataModule.getSystemRules(systemId);
            } else {
                // Per user request, system is empty for other modules for now
                this.cachedItems = [];
            }
        } else if (user) {
            this.cachedItems = await DataModule.getModuleItems(this.activeModule.collection, user.uid, systemId);
        } else {
            this.cachedItems = [];
        }
    },

    applyFilters() {
        const id = this.activeModule.id;
        const container = document.getElementById(`${id}-grid`);
        if (!container) return;

        const query = this.filters.search.toLowerCase();
        const filtered = this.cachedItems.filter(item =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );

        if (filtered.length === 0) {
            container.innerHTML = `<div class="empty-state-card"><p>Nenhum registro encontrado.</p></div>`;
            return;
        }

        // Verify all items have IDs
        filtered.forEach((item, index) => {
            if (!item.id) {
                console.error(`ContentModule: Item at index ${index} has no ID:`, item);
            }
        });

        container.innerHTML = filtered.map(item => this.createCard(item)).join('');
        this.bindCardActions();
    },

    createCard(item) {
        // Validate item has required fields
        if (!item.id) {
            console.error('ContentModule.createCard: Item missing ID:', item);
            return `<div class="item-card-wrapper error-card"><p>Erro: Item sem ID</p></div>`;
        }

        // Show action buttons for all personal items (user owns all items in personal collection)
        const showActions = this.currentSource === 'personal';
        const actions = showActions ? `
            <div class="card-actions">
                <button class="action-btn edit-btn" data-id="${item.id}"><i class="fas fa-pen"></i></button>
                <button class="action-btn delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        ` : '';

        return `
            <div class="item-card-wrapper" data-id="${item.id}">
                ${actions}
                <button class="gallery-card">
                    <i class="fas ${this.activeModule.icon}"></i>
                    <span>${item.name || 'Sem nome'}</span>
                </button>
            </div>
        `;
    },

    bindCardActions() {
        const container = document.getElementById(`${this.activeModule.id}-grid`);
        if (!container) return;

        // Bind gallery card clicks
        container.querySelectorAll('.gallery-card').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const wrapper = btn.closest('.item-card-wrapper');
                const id = wrapper?.dataset.id;
                if (id) {
                    this.viewDetail(id);
                } else {
                    console.error('ContentModule: No ID found on card wrapper');
                }
            };
        });

        // Bind edit buttons
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) {
                    this.openCreatorModal(id);
                } else {
                    console.error('ContentModule: No ID found on edit button');
                }
            };
        });

        // Bind delete buttons
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (!id) {
                    console.error('ContentModule: No ID found on delete button');
                    return;
                }
                const confirmed = await window.app.showConfirm('Deseja realmente excluir este registro?', 'Confirmação');
                if (confirmed) {
                    try {
                        await DataModule.deleteModuleItem(this.activeModule.collection, id);
                        await this.loadData();
                        this.applyFilters();
                    } catch (error) {
                        console.error('ContentModule: Error deleting item:', error);
                        window.app.showAlert('Erro ao excluir o item: ' + error.message);
                    }
                }
            };
        });
    },

    openChoiceModal() {
        const modal = document.getElementById('generic-creation-choice-modal');
        if (!modal) return;

        // Update title based on active module
        const titleSpan = document.getElementById('generic-choice-title');
        if (titleSpan) {
            titleSpan.innerText = `MÉTODO DE CRIAÇÃO - ${this.activeModule.title.toUpperCase()}`;
        }

        modal.classList.remove('hidden');

        document.getElementById('generic-choice-manual').onclick = () => {
            modal.classList.add('hidden');
            this.openCreatorModal();
        };

        document.getElementById('generic-choice-ai').onclick = () => {
            modal.classList.add('hidden');
            this.openAIPromptModal();
        };

        document.getElementById('close-generic-choice-modal').onclick = () => {
            modal.classList.add('hidden');
        };
    },

    getCurrentPersona() {
        if (document.body.classList.contains('damien-theme')) return 'damien';
        if (document.body.classList.contains('eldrin-theme')) return 'eldrin';
        return 'lyra';
    },

    openAIPromptModal() {
        const modal = document.getElementById('generic-ai-prompt-modal');
        if (!modal) return;

        // Update persona name
        const personaSpan = document.getElementById('generic-ai-persona-name');
        if (personaSpan) {
            const persona = this.getCurrentPersona();
            personaSpan.innerText = persona.charAt(0).toUpperCase() + persona.slice(1);
        }

        // Update prompt description and placeholder based on active module
        const descriptionEl = document.getElementById('generic-ai-prompt-description');
        if (descriptionEl) {
            descriptionEl.innerText = this.activeModule.aiPrompt;
        }

        const promptInput = document.getElementById('generic-ai-prompt');
        if (promptInput) {
            promptInput.value = '';
            promptInput.placeholder = this.activeModule.aiPlaceholder;
        }

        modal.classList.remove('hidden');

        document.getElementById('confirm-generic-ai-btn').onclick = async () => {
            const prompt = promptInput.value;
            if (!prompt) return;

            const btn = document.getElementById('confirm-generic-ai-btn');
            const originalText = btn.innerText;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invocando...';

            try {
                const user = auth.currentUser;
                const idToken = await user.getIdToken();
                const persona = this.getCurrentPersona();

                const { generateModuleContent } = await import('../ai.js');
                const result = await generateModuleContent(this.activeModule.id.toUpperCase(), prompt, persona, idToken);
                modal.classList.add('hidden');
                this.openCreatorModal(null, result);
            } catch (e) {
                window.app.showAlert(e.message);
            } finally {
                btn.disabled = false;
                btn.innerText = originalText;
            }
        };

        document.getElementById('close-generic-ai-prompt').onclick = () => {
            modal.classList.add('hidden');
        };
    },

    openCreatorModal(id = null, prefilled = null) {
        const modal = document.getElementById('generic-creator-modal');
        if (!modal) return;

        // Update icon and title based on active module
        const iconEl = document.getElementById('generic-creator-icon');
        const titleEl = document.getElementById('generic-creator-title');
        if (iconEl) {
            iconEl.className = `fas ${this.activeModule.icon}`;
        }
        if (titleEl) {
            titleEl.innerText = `Criação de ${this.activeModule.title}`;
        }

        modal.classList.remove('hidden');

        const form = document.getElementById('generic-creator-form');
        form.reset();

        let data = prefilled;
        this.editingId = id;

        if (id) {
            data = this.cachedItems.find(i => i.id === id);
        }

        if (data) {
            document.getElementById('generic-create-name').value = data.name || '';
            let desc = data.description || '';
            const otherFields = Object.keys(data).filter(k => !['id', 'name', 'description', 'userId', 'systemId', 'createdAt', 'updatedAt'].includes(k));
            if (otherFields.length > 0) {
                // Convert objects/arrays to readable strings WITHOUT markdown
                const extra = otherFields.map(k => {
                    const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    let value = data[k];

                    // Handle arrays - join elements
                    if (Array.isArray(value)) {
                        value = value.map(item => {
                            if (typeof item === 'object' && item !== null) {
                                // Convert object to "key: value" pairs
                                return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ');
                            }
                            return String(item);
                        }).join(', ');
                    }
                    // Handle objects - convert to readable format
                    else if (typeof value === 'object' && value !== null) {
                        value = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
                    }

                    // NO ASTERISKS - plain text only
                    return `${label}: ${value}`;
                }).join('\n\n');
                desc = extra + '\n\n' + desc;
            }
            document.getElementById('generic-create-desc').value = desc.trim();
        }

        form.onsubmit = async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            const systemId = localStorage.getItem('lyra_current_system') || 'dnd5e';

            const payload = {
                id: this.editingId,
                name: document.getElementById('generic-create-name').value,
                description: document.getElementById('generic-create-desc').value
            };

            this.openSummoning();
            modal.classList.add('hidden');

            try {
                await DataModule.saveModuleItem(this.activeModule.collection, user.uid, systemId, payload);
                this.showSummoningSuccess(this.editingId ? "Anais atualizados com sucesso." : "Novo registro manifestado nos anais.", !!this.editingId);
                await this.loadData();
                this.applyFilters();
            } catch (err) {
                console.error(err);
                this.showSummoningError("A essência se dissipou: " + err.message);
            }
        };

        document.getElementById('close-generic-creator').onclick = () => {
            modal.classList.add('hidden');
        };
    },

    async viewDetailById(moduleId, id) {
        const config = this.configs[moduleId] || Object.values(this.configs).find(c => c.collection.includes(moduleId));
        if (!config) return;

        // Ensure module is loaded to have cachedItems
        this.activeModule = config;
        await this.loadData();
        this.viewDetail(id);
    },

    async viewDetail(id) {
        if (!id) {
            console.error('ContentModule.viewDetail: ID is null or undefined');
            window.app.showAlert('Erro ao abrir detalhes: ID inválido');
            return;
        }

        const item = this.cachedItems.find(i => i.id === id);
        if (!item) {
            console.warn('ContentModule: Item not found in cache:', id);
            window.app.showAlert('Item não encontrado. Tente recarregar a página.');
            return;
        }

        // Use the global app.openModal to ensure consistent overlay behavior and indicator updates
        window.app.openModal('detail-container');
        const detailContainer = document.getElementById('detail-container');

        if (detailContainer) {
            detailContainer.classList.remove('hidden');
            detailContainer.innerHTML = `
                <div class="item-detail-view content-detail-redesign">
                    <div class="detail-header">
                         <div class="detail-icon-large"><i class="fas ${this.activeModule.icon}"></i></div>
                         <div class="detail-title-block">
                            <h2>${item.name}</h2>
                            <span class="detail-subtitle">${this.activeModule.title}</span>
                         </div>
                    </div>
                    <div class="detail-description parchment-content">
                        ${window.app.parseMarkdown ? window.app.parseMarkdown(item.description) : item.description.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        }
    },

    toggleLoading(show) {
        window.app.toggleLoading(show);
    },

    // --- Summoning Effect ---
    openSummoning() {
        const overlay = document.getElementById('summoning-overlay');
        if (!overlay) return;

        overlay.querySelector('.summoning-success-content')?.classList.add('hidden');
        overlay.querySelector('.summoning-error-content')?.classList.add('hidden');
        overlay.querySelector('.summoning-status')?.classList.remove('hidden');

        // Personalize icon
        const iconEl = overlay.querySelector('.summoning-center-icon');
        if (iconEl && this.activeModule) {
            iconEl.className = `fas ${this.activeModule.icon} summoning-center-icon`;
        }

        overlay.classList.remove('hidden');
    },

    showSummoningSuccess(message, isEdit) {
        const overlay = document.getElementById('summoning-overlay');
        if (!overlay) return;

        const successContent = overlay.querySelector('.summoning-success-content');
        if (successContent) {
            const titleEl = successContent.querySelector('.summoning-success-title');
            const msgEl = successContent.querySelector('.summoning-success-msg');
            if (titleEl) titleEl.innerText = isEdit ? "Fluxo Estabilizado!" : "Manifestação Concluída!";
            if (msgEl) msgEl.innerText = message;
            successContent.classList.remove('hidden');
        }
        overlay.querySelector('.summoning-status')?.classList.add('hidden');
    },

    showSummoningError(message) {
        const overlay = document.getElementById('summoning-overlay');
        if (!overlay) return;

        const errorContent = overlay.querySelector('.summoning-error-content');
        if (errorContent) {
            errorContent.querySelector('.error-msg').innerText = message || "A energia arcana entrou em colapso.";
            errorContent.classList.remove('hidden');
        }
        overlay.querySelector('.summoning-status')?.classList.add('hidden');
    }
};

window.ContentModule = ContentModule;
