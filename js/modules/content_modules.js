import * as DataModule from '../data.js';
import { NavigationModule } from './navigation.js';
import { auth } from '../auth.js';
import { generateModuleContent, generateEntity } from '../ai.js';
import { EntitySheetModule } from './entity-sheet.js';

export const ContentModule = {
    // Current active config
    activeModule: null,
    cachedItems: [],
    currentSource: 'personal',
    filters: { search: '' },

    // Entity types that use the sheet-based system (not generic name+desc)
    SHEET_ENTITY_TYPES: ['villains', 'npcs'],
    // Map of module keys to their configurations
    configs: {
        'villains': {
            id: 'villains',
            collection: DataModule.COLLECTIONS.VILLAINS,
            icon: 'fa-mask',
            title: 'Vilões',
            entityType: 'villain',
            sheetBased: true,
            aiPrompt: 'Descreva o vilão que deseja criar. A Magia tecerá sua história sombria e motivações.',
            aiPlaceholder: 'Ex: Um necromante que busca vingança contra o reino que o exilou...'
        },
        'npcs': {
            id: 'npcs',
            collection: DataModule.COLLECTIONS.NPCS,
            icon: 'fa-users-gear',
            title: 'NPCs',
            entityType: 'npc',
            sheetBased: true,
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
            aiPlaceholder: 'Ex: Uma placa de pressão que dispara dardos envenenados das paredes...',
            selectionTitle: 'Biblioteca de Armadilhas',
            selectionDescSystem: 'Armadilhas oficiais e perigos ambientais.',
            selectionDescPersonal: 'Gerencie seus próprios mecanismos mortais.'
        }
    },

    init() {
        this.injectHTML();
        this.bindGlobalEvents();

        // Listen for entity-saved events to refresh sheet-based module lists
        window.addEventListener('entity-saved', (e) => {
            const type = e.detail?.type;
            if (type === 'villain' && this.activeModule?.id === 'villains') this.render();
            if (type === 'npc' && this.activeModule?.id === 'npcs') this.render();
        });
    },

    injectSelectionHTML(moduleId) {
        const config = this.configs[moduleId];
        if (!config || document.getElementById(`${moduleId}-selection`)) return;

        const html = `
            <!-- ${config.title} Selection View -->
            <section id="${moduleId}-selection" class="view hidden">
                <div class="view-header">
                    <h2><i class="fas ${config.icon}"></i> ${config.selectionTitle || config.title}</h2>
                </div>
                <div class="selection-grid">
                    <div class="selection-card" data-source="system">
                        <div class="selection-icon"><i class="fas ${config.id === 'npcs' ? 'fa-users' : (config.id === 'armadilhas' || config.id === 'monstros' || config.id === 'villains' ? 'fa-skull' : 'fa-scroll')}"></i></div>
                        <div class="selection-info">
                            <h3>Sistema</h3>
                            <p>${config.selectionDescSystem || 'Consulte os arquivos oficiais.'}</p>
                        </div>
                    </div>
                    <div class="selection-card" data-source="personal">
                        <div class="selection-icon"><i class="fas ${config.id === 'npcs' ? 'fa-id-card' : (config.id === 'villains' ? 'fa-user-ninja' : 'fa-hammer')}"></i></div>
                        <div class="selection-info">
                            <h3>${config.id === 'npcs' ? 'Meus NPCs' : (config.id === 'villains' ? 'Meus Vilões' : 'Minhas Criações')}</h3>
                            <p>${config.selectionDescPersonal || 'Gerencie seu próprio arsenal.'}</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
        document.getElementById('main-content')?.insertAdjacentHTML('beforeend', html);
        this.bindSelectionEvents(moduleId);
    },

    bindSelectionEvents(moduleId) {
        const section = document.getElementById(`${moduleId}-selection`);
        if (!section) return;

        section.querySelectorAll('.selection-card').forEach(card => {
            card.addEventListener('click', () => {
                const source = card.dataset.source;
                this.openModule(moduleId, source);
            });
        });
    },

    async openModule(moduleId, source = 'personal') {
        this.activeModule = this.configs[moduleId];
        this.currentSource = source;

        // If the module view itself is not in DOM (the generic ones often reuse the 'itens' or 'grimorio' style but need their own section)
        // Actually, many modules share the same 'grid' style. 
        // For now, we assume the specific module section (e.g., #npcs, #villains) is either in index.html or injected.

        // For simple modules, we can inject the main view too if missing
        this.injectMainViewHTML(moduleId);

        NavigationModule.switchView(moduleId, {
            [`load${moduleId.charAt(0).toUpperCase()}${moduleId.slice(1)}`]: () => this.switchToModule(moduleId)
        });
    },

    injectMainViewHTML(moduleId) {
        if (document.getElementById(moduleId)) return;
        const config = this.configs[moduleId];

        const html = `
            <section id="${moduleId}" class="view hidden">
                <div class="view-header">
                    <h2><i class="fas ${config.icon}"></i> ${config.title}</h2>
                    <div class="header-actions">
                        <button id="back-to-${moduleId}-selection" class="medieval-btn small secondary">
                            <i class="fas fa-arrow-left"></i> Voltar
                        </button>
                        <button id="${moduleId}-new-btn" class="medieval-btn small">
                            <i class="fas fa-plus"></i> Novo
                        </button>
                    </div>
                </div>
                <div class="items-controls-bar">
                    <div class="items-search-container">
                        <div class="search-wrapper">
                            <i class="fas fa-search"></i>
                            <input type="text" id="${moduleId}-search" class="premium-search-input" placeholder="Pesquisar...">
                        </div>
                    </div>
                </div>
                <div id="${moduleId}-grid" class="items-grid-layout"></div>
            </section>
        `;
        document.getElementById('main-content')?.insertAdjacentHTML('beforeend', html);

        // Bind back button
        document.getElementById(`back-to-${moduleId}-selection`)?.addEventListener('click', () => {
            NavigationModule.switchView(`${moduleId}-selection`, {});
        });

        // Bind search
        document.getElementById(`${moduleId}-search`)?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.renderItems();
        });

        // Bind new button
        document.getElementById(`${moduleId}-new-btn`)?.addEventListener('click', () => {
            this.openChoiceModal();
        });
    },


    injectHTML() {
        if (document.getElementById('generic-choice-modal')) return;

        const modalHtml = `
            <!-- Generic Choice Modal -->
            <div id="generic-choice-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal medium">
                    <button class="close-modal" id="close-generic-choice-modal"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-hammer"></i> <span id="generic-choice-title">MÉTODO DE FORJA</span></h2>
                    <div class="mode-choices">
                        <button class="choice-card" id="generic-choice-manual">
                            <i class="fas fa-hammer"></i>
                            <h4>MANUAL</h4>
                            <p>Preencha os detalhes do item você mesmo.</p>
                        </button>
                        <button class="choice-card" id="generic-choice-ai">
                            <i class="fas fa-wand-magic-sparkles"></i>
                            <h4>INSPIRAÇÃO ARCANA</h4>
                            <p>Deixe a magia moldar o item para você.</p>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Generic AI Prompt Modal -->
            <div id="generic-ai-prompt-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal small">
                    <button class="close-modal" id="close-generic-ai-prompt"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-sparkles"></i> Inspiração de <span id="generic-ai-persona-name">Lyra</span></h2>
                    <div class="parchment-content">
                        <p id="generic-ai-prompt-description">Descreva brevemente o item que deseja. A Magia tecerá os detalhes e adicionará um toque especial.</p>
                        <textarea id="generic-ai-prompt" class="medieval-textarea" rows="5" placeholder="Ex: Uma espada feita de gelo eterno que brilha no escuro..."></textarea>
                        <div class="modal-actions">
                            <button id="confirm-generic-ai-btn" class="medieval-btn">Invocar Criação</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Generic Creator Modal -->
            <div id="generic-creator-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal wide">
                    <button class="close-modal" id="close-generic-creator"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-scroll" id="generic-creator-icon"></i> <span id="generic-creator-title">Criação Arcana</span></h2>
                    <form id="generic-creator-form" class="parchment-content">
                        <div class="form-group">
                            <label>Nome / Título</label>
                            <input type="text" id="generic-create-name" class="medieval-input" required>
                        </div>
                        <div class="form-group">
                            <label>Descrição / Detalhes (Markdown aceito)</label>
                            <textarea id="generic-create-desc" class="medieval-textarea" rows="12" required></textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="medieval-btn">Salvar em Meus Anais</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
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

        // Generic Creator Modal Events
        document.getElementById('close-generic-creator')?.addEventListener('click', () => {
            document.getElementById('generic-creator-modal')?.classList.add('hidden');
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
            // For sheet-based modules (villains, npcs), use getEntities
            if (this.activeModule.sheetBased && this.activeModule.entityType) {
                this.cachedItems = await DataModule.getEntities(this.activeModule.entityType, user.uid, user.email);
            } else {
                this.cachedItems = await DataModule.getModuleItems(this.activeModule.collection, user.uid, systemId);
            }
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
                    ${this.activeModule.sheetBased && item.bio ? `<div class="monster-type-label" style="font-size: 0.7rem; opacity: 0.7;">${item.bio.race || item.bio.creature_type || ''} ${item.bio.class || ''}</div>` : ''}
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
                    // For sheet-based modules, open entity sheet
                    if (this.activeModule.sheetBased && this.activeModule.entityType) {
                        EntitySheetModule.openExistingEntity(this.activeModule.entityType, id);
                    } else {
                        this.openCreatorModal(id);
                    }
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
                        // For sheet-based modules, use deleteEntity
                        if (this.activeModule.sheetBased && this.activeModule.entityType) {
                            const user = auth.currentUser;
                            await DataModule.deleteEntity(this.activeModule.entityType, id, user?.uid);
                        } else {
                            await DataModule.deleteModuleItem(this.activeModule.collection, id);
                        }
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
        // For sheet-based modules (villains, npcs), route through entity sheet
        if (this.activeModule.sheetBased) {
            const modal = document.getElementById('generic-choice-modal');
            if (!modal) return;

            const titleSpan = document.getElementById('generic-choice-title');
            if (titleSpan) titleSpan.innerText = `MÉTODO DE CRIAÇÃO - ${this.activeModule.title.toUpperCase()}`;

            modal.classList.remove('hidden');

            document.getElementById('generic-choice-manual').onclick = () => {
                modal.classList.add('hidden');
                EntitySheetModule.openNewEntity(this.activeModule.entityType);
            };

            document.getElementById('generic-choice-ai').onclick = () => {
                modal.classList.add('hidden');
                this.openAIPromptModal();
            };

            document.getElementById('close-generic-choice-modal').onclick = () => {
                modal.classList.add('hidden');
            };
            return;
        }

        // Original generic flow for non-sheet modules
        const modal = document.getElementById('generic-choice-modal');
        if (!modal) return;

        const titleSpan = document.getElementById('generic-choice-title');
        if (titleSpan) titleSpan.innerText = `MÉTODO DE CRIAÇÃO - ${this.activeModule.title.toUpperCase()}`;

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
                const persona = this.getCurrentPersona();

                // For sheet-based modules, use generateEntity
                if (this.activeModule.sheetBased && this.activeModule.entityType) {
                    const entity = await generateEntity(this.activeModule.entityType, prompt, persona);
                    modal.classList.add('hidden');
                    EntitySheetModule.openEntityFromAI(this.activeModule.entityType, entity);
                } else {
                    const { generateModuleContent } = await import('../ai.js');
                    const result = await generateModuleContent(this.activeModule.id.toUpperCase(), prompt, persona);
                    modal.classList.add('hidden');
                    this.openCreatorModal(null, result);
                }
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

            // Find current item to preserve createdAt if editing
            const existingItem = this.editingId ? this.cachedItems.find(i => i.id === this.editingId) : null;

            const payload = {
                id: this.editingId,
                name: document.getElementById('generic-create-name').value,
                description: document.getElementById('generic-create-desc').value,
                author: window.app.userProfile?.nickname || user.displayName || 'Mestre Anônimo',
                createdAt: existingItem?.createdAt || new Date().toISOString()
            };

            this.openSummoning();
            modal.classList.add('hidden');

            try {
                // IMPORTANT: saveModuleItem expects (collection, userId, systemId, itemData)
                await DataModule.saveModuleItem(this.activeModule.collection, user.uid, systemId, payload);

                this.showSummoningSuccess(
                    this.editingId ? "Anais atualizados com sucesso." : "Novo registro manifestado nos anais.",
                    !!this.editingId
                );

                this.editingId = null;
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

        // For sheet-based modules, open entity sheet
        if (this.activeModule.sheetBased && this.activeModule.entityType) {
            EntitySheetModule.openExistingEntity(this.activeModule.entityType, id);
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
