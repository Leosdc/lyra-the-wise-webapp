import * as DataModule from '../data.js';
import { getEmptyAbilityFromItem } from '../data.js';
import { NavigationModule } from './navigation.js';
import { auth } from '../auth.js';
import { SettingsModule } from './settings.js';
import { SUPPORTED_SYSTEMS } from '../constants.js';
import { generateItem } from '../ai.js';
import { sanitizeHTML, translateFirebaseError } from './utils.js';

export const ItemsModule = {
    cachedItems: [],
    isLoading: false,
    lastSystem: null,
    currentSource: 'system', // 'system' or 'personal'
    itemToShare: null,
    isInitialized: false,

    init() {
        if (this.isInitialized) return;

        this.injectHTML();
        this.currentSource = sessionStorage.getItem('lyra_items_source') || 'system';
        this.bindEvents();
        this.isInitialized = true;
    },

    injectHTML() {
        if (document.getElementById('item-creator-modal')) return;

        const modalHtml = `
            <!-- Forge Overlay -->
            <div id="forge-overlay" class="modal-overlay hidden">
                <div class="forge-container">
                    <div class="forge-animation">
                        <div class="forge-spinner">
                            <div class="forge-rune outer"></div>
                            <div class="forge-rune middle"></div>
                            <div class="forge-rune inner"></div>
                            <i class="fas fa-fire-alt forge-center-icon"></i>
                        </div>
                        <div class="forge-glow"></div>
                        <div class="forge-sparks"></div>
                    </div>
                    <div class="forge-status">
                        <h2 class="forge-title">Forjando...</h2>
                        <p class="forge-msg">Tecendo a essência arcana na matéria.</p>
                    </div>
                    <div class="forge-success-content hidden">
                        <h3>Obra-Prima Forjada!</h3>
                        <p>O item foi imbuído com essência arcana.</p>
                        <button class="medieval-btn" data-action="items-close-forge">Concluir</button>
                    </div>
                    <div class="forge-error-content hidden">
                        <h3 style="color: #ef4444;">Falha na Forja!</h3>
                        <p class="error-msg">A essência se dissipou antes de tomar forma.</p>
                        <button class="medieval-btn secondary" data-action="items-close-forge">Tentar Novamente</button>
                    </div>
                </div>
            </div>

            <!-- Item Creation Choice Modal -->
            <div id="item-creation-choice-modal" class="modal-overlay hidden">
                <div class="modal-content parchment" style="max-width: 600px;">
                    <button class="close-modal" id="close-choice-modal"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title" style="text-align: center; margin-bottom: 2rem;">
                        <i class="fas fa-hammer"></i> MÉTODO DE FORJA
                    </h2>
                    <div class="mode-choices">
                        <button id="choice-manual" class="choice-card">
                            <i class="fas fa-hammer"></i>
                            <h4>MANUAL</h4>
                            <p>Preencha os detalhes do item você mesmo.</p>
                        </button>
                        <button id="choice-ai" class="choice-card">
                            <i class="fas fa-wand-magic-sparkles"></i>
                            <h4>INSPIRAÇÃO ARCANA</h4>
                            <p>Deixe a magia moldar o item para você.</p>
                        </button>
                    </div>
                </div>
            </div>

            <!-- AI Item Prompt Modal -->
            <div id="item-ai-prompt-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal small">
                    <button class="close-modal" id="close-ai-prompt"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-sparkles"></i> Inspiração de <span id="ai-persona-name">Lyra</span></h2>
                    <div class="parchment-content">
                        <p>Descreva brevemente o item que deseja. A Magia tecerá os detalhes e adicionará um toque especial.</p>
                        <textarea id="ai-item-prompt" class="medieval-textarea" rows="5" placeholder="Ex: Uma espada feita de gelo eterno que brilha no escuro..."></textarea>
                        <div class="modal-actions">
                            <button id="confirm-ai-generation-btn" class="medieval-btn">Invocar Criação</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Item Creator Modal -->
            <div id="item-creator-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal wide">
                    <button class="close-modal" id="close-item-creator"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-hammer"></i> Forja de Itens</h2>
                    <form id="item-creator-form" class="parchment-content">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nome do Item</label>
                                <input type="text" id="create-item-name" class="medieval-input" required placeholder="Ex: Machado de Fogo">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Tipo</label>
                                <select id="create-item-type" class="medieval-select" required data-action-change="items-toggle-fields">
                                    <option value="weapon">Arma</option>
                                    <option value="armor">Armadura</option>
                                    <option value="wondrous">Item Mágico</option>
                                    <option value="potion">Poção / Consumível</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Raridade</label>
                                <select id="create-item-rarity" class="medieval-select" required>
                                    <option value="common">Comum</option>
                                    <option value="uncommon">Incomum</option>
                                    <option value="rare">Raro</option>
                                    <option value="very_rare">Muito Raro</option>
                                    <option value="legendary">Lendário</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Peso</label>
                                <input type="text" id="create-item-weight" class="medieval-input" placeholder="Ex: 2 kg">
                            </div>
                            <div class="form-group">
                                <label>Preço</label>
                                <input type="text" id="create-item-cost" class="medieval-input" placeholder="Ex: 10 po">
                            </div>
                        </div>

                        <div class="form-row stats-row-dynamic">
                            <div class="form-group creator-field-weapon" style="display: flex; gap: 0.5rem; width: 100%;">
                                <div style="flex: 1;">
                                    <label>Dano</label>
                                    <input type="text" id="create-item-damage" class="medieval-input" placeholder="Ex: 1d8">
                                </div>
                                <div style="flex: 1;">
                                    <label>Tipo</label>
                                    <input type="text" id="create-item-damage-type" class="medieval-input" placeholder="Ex: cortante">
                                </div>
                            </div>
                            <div class="form-group creator-field-armor hidden">
                                <label>Classe de Armadura (CA)</label>
                                <input type="text" id="create-item-ac" class="medieval-input" placeholder="Ex: 15 + DES">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Propriedades / Tags (Separadas por vírgula)</label>
                            <input type="text" id="create-item-props" class="medieval-input" placeholder="Ex: Pesada, Versátil, Mágica">
                        </div>

                        <div class="form-group">
                            <label>Crônica do Item (Descrição)</label>
                            <textarea id="create-item-desc" class="medieval-textarea" rows="4" placeholder="Descreva a história e os efeitos deste item..."></textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="medieval-btn">Forjar Item</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Share Item Modal -->
            <div id="share-item-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal small">
                    <button class="close-modal" id="close-share-modal"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-share-nodes"></i> Compartilhar Item</h2>
                    <div class="parchment-content">
                        <p>Informe o e-mail do destinatário para enviar esta relíquia:</p>
                        <div class="form-group">
                            <input type="email" id="share-target-email" class="medieval-input" placeholder="email@exemplo.com"
                                required>
                        </div>
                        <div class="modal-actions">
                            <button id="confirm-share-btn" class="medieval-btn">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    bindEvents() {
        // Delegated handler for items data-action clicks
        document.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;

            switch (actionEl.dataset.action) {
                case 'items-close-forge': this.closeForge(); break;
                case 'items-view-detail': {
                    const id = actionEl.dataset.itemId;
                    if (id) this.openItemDetail(id);
                    break;
                }
            }
        });

        // Type select change handler (replaces onchange inline)
        document.getElementById('create-item-type')?.addEventListener('change', (e) => {
            this.toggleCreatorFields(e.target.value);
        });
        // Selection Panel
        const selectionView = document.getElementById('itens-selection');
        if (selectionView) {
            selectionView.addEventListener('click', (e) => {
                const card = e.target.closest('.selection-card');
                if (!card) return;

                this.currentSource = card.dataset.source;
                sessionStorage.setItem('lyra_items_source', this.currentSource);
                // Don't pass loader here, let ItemsModule.render() handle it via mutation or just call it directly if needed.
                // But app.js switchView might call it.
                // Best practice: Pass the context, but ensure app.js doesn't duplicate.
                // Actually, for Items, it seems fine. For Monsters it was the issue.
                NavigationModule.switchView('itens', this.getNavigationContext());
            });
        }

        // Back button
        const backBtn = document.getElementById('back-to-items-selection');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                NavigationModule.switchView('itens-selection', this.getNavigationContext());
            });
        }

        // Search & Filter
        const searchInput = document.getElementById('items-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterItems(e.target.value);
            });
        }

        const catNav = document.getElementById('items-category-nav');
        if (catNav) {
            catNav.addEventListener('click', (e) => {
                const btn = e.target.closest('.cat-btn');
                if (!btn) return;
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilterType = btn.dataset.type;
                this.filterItems(searchInput?.value || '');
            });
        }

        // Creator Modal Trigger
        const newBtn = document.getElementById('items-new-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                if (this.currentSource === 'personal') {
                    this.openChoiceModal();
                } else {
                    this.openCreatorModal();
                }
            });
        }

        // Choice Modal Events
        document.getElementById('choice-manual')?.addEventListener('click', () => {
            document.getElementById('item-creation-choice-modal').classList.add('hidden');
            this.openCreatorModal();
        });

        document.getElementById('choice-ai')?.addEventListener('click', () => {
            document.getElementById('item-creation-choice-modal').classList.add('hidden');
            this.openAIPromptModal();
        });

        document.getElementById('close-choice-modal')?.addEventListener('click', () => {
            document.getElementById('item-creation-choice-modal').classList.add('hidden');
        });

        // AI Prompt Modal Events
        document.getElementById('close-ai-prompt')?.addEventListener('click', () => {
            document.getElementById('item-ai-prompt-modal').classList.add('hidden');
        });

        document.getElementById('confirm-ai-generation-btn')?.addEventListener('click', () => {
            this.handleAIRequest();
        });

        const closeCreator = document.getElementById('close-item-creator');
        if (closeCreator) {
            closeCreator.addEventListener('click', () => {
                document.getElementById('item-creator-modal').classList.add('hidden');
            });
        }

        const creatorForm = document.getElementById('item-creator-form');
        if (creatorForm) {
            creatorForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreateItem();
            });
        }

        // Sharing Modal
        const closeShare = document.getElementById('close-share-modal');
        if (closeShare) {
            closeShare.addEventListener('click', () => {
                document.getElementById('share-item-modal').classList.add('hidden');
                this.itemToShare = null;
            });
        }

        const confirmShare = document.getElementById('confirm-share-btn');
        if (confirmShare) {
            confirmShare.addEventListener('click', async () => {
                await this.handleShareConfirm();
            });
        }
    },

    getNavigationContext() {
        return {
            loadItems: () => this.render()
        };
    },

    currentFilterType: 'all',

    async render(containerId = 'items-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const searchInput = document.getElementById('items-search');
        if (searchInput) searchInput.value = '';
        this.currentFilterType = 'all';
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.type === 'all'));

        const title = document.querySelector('#itens .view-header h2');
        const currentSystem = localStorage.getItem('lyra_current_system') || 'dnd5e';

        if (title) {
            if (this.currentSource === 'system') {
                const system = SUPPORTED_SYSTEMS.find(s => s.id === currentSystem);
                const systemName = system ? system.name : currentSystem.toUpperCase();
                title.innerHTML = `<i class="fas fa-gem"></i> Galeria de Itens (${systemName})`;
            } else {
                title.innerHTML = '<i class="fas fa-hammer"></i> Meus Itens Criados';
            }
        }

        await this.loadItemsFromFirebase(currentSystem);
        this.filterItems('');
    },

    async loadItemsFromFirebase(systemId) {
        const container = document.getElementById('items-grid');
        if (container) {
            container.innerHTML = `
                <div class="loading-state-medieval" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--gold);">
                    <i class="fas fa-quill-pan-scroll fa-spin" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <span style="font-family: var(--font-medieval); letter-spacing: 2px;">Consultando os Anais...</span>
                </div>
            `;
        }

        this.isLoading = true;

        if (this.currentSource === 'system') {
            this.cachedItems = await DataModule.getGlobalItems(systemId);
        } else {
            const user = auth.currentUser;
            if (user) {
                this.cachedItems = await DataModule.getUserItems(user.uid, user.email);
            } else {
                this.cachedItems = [];
            }
        }

        this.lastSystem = systemId;
        this.isLoading = false;
    },

    filterItems(queryTerm) {
        const container = document.getElementById('items-grid');
        if (!container || this.isLoading) return;

        const normalizedQuery = queryTerm.toLowerCase().trim();

        const filtered = this.cachedItems
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(normalizedQuery) ||
                    (item.description && item.description.toLowerCase().includes(normalizedQuery));

                const matchesType = this.matchTypeFilter(item, this.currentFilterType);
                return matchesSearch && matchesType;
            });

        if (filtered.length === 0) {
            const emptyMsg = this.currentSource === 'system' ?
                'Nenhum item encontrado nos arquivos sagrados.' :
                'Você ainda não forjou nenhum item. Comece em "+ Novo"!';

            container.innerHTML = `
                <div class="empty-state-card">
                    <i class="fas fa-skull empty-skull-icon"></i>
                    <div class="empty-text-overlay">
                        <i class="fas fa-search-minus"></i>
                        <p>${emptyMsg}</p>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = filtered.map(item => this.createItemCard(item)).join('');

            if (this.currentSource === 'personal') {
                container.querySelectorAll('.share-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = e.target.closest('.item-card').dataset.id;
                        this.openShareModal(id);
                    });
                });

                container.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = e.target.closest('.item-card').dataset.id;
                        this.openEditModal(id);
                    });
                });

                container.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const id = e.target.closest('.item-card').dataset.id;
                        const confirmed = await window.app.showConfirm(
                            'Deseja realmente destruir esta relíquia? Esta ação não pode ser desfeita.',
                            'Sentença de Destruição'
                        );
                        if (confirmed) {
                            await this.handleDeleteItem(id);
                        }
                    });
                });
            }
        }
    },

    matchTypeFilter(item, filter) {
        if (filter === 'all') return true;

        const normalizedFilter = filter.toLowerCase();

        if (item.type === normalizedFilter) return true;
        if (item.subtype === normalizedFilter) return true;

        // Translations (UI uses English keys, Data might use Portuguese)
        if (normalizedFilter === 'potion' && (item.subtype === 'pocao' || item.type === 'pocao')) return true;
        if (normalizedFilter === 'weapon' && (item.subtype === 'arma' || item.type === 'arma')) return true;
        if (normalizedFilter === 'armor' && (item.subtype === 'armadura' || item.type === 'armadura')) return true;

        // Special case for 'wondrous' to include magic subtypes if filter is 'wondrous'
        if (normalizedFilter === 'wondrous' && (item.subtype === 'maravilhoso' || item.subtype === 'anel' || item.subtype === 'varinha')) return true;

        return false;
    },

    createItemCard(item) {
        const iconClass = this.getItemIcon(item);
        let rarityRaw = (item.rarity || 'common').toLowerCase();
        // Map Portuguese rarities to English CSS keys
        const rarityMap = {
            'comum': 'common',
            'incomum': 'uncommon',
            'raro': 'rare',
            'muito raro': 'very_rare',
            'muito_raro': 'very_rare',
            'lendário': 'legendary',
            'lendario': 'legendary'
        };
        const rarityKey = rarityMap[rarityRaw] || rarityRaw.replace(' ', '_');
        const rarityClass = `rarity-${rarityKey}`;

        let actionButtons = '';
        if (this.currentSource === 'personal' && item.isOwner) {
            actionButtons = `
                <div class="card-actions">
                    <button class="action-btn share-btn" title="Compartilhar"><i class="fas fa-share-nodes"></i></button>
                    <button class="action-btn edit-btn" title="Editar"><i class="fas fa-pen-to-square"></i></button>
                    <button class="action-btn delete-btn" title="Excluir"><i class="fas fa-trash-can"></i></button>
                </div>
            `;
        }

        const safeName = sanitizeHTML(item.name);

        return `
            <div class="item-card item-card-wrapper" style="position:relative;" data-id="${item.id}">
                ${actionButtons}
                <button class="gallery-card ${rarityClass}" data-action="items-view-detail" data-item-id="${item.id}">
                    <i class="${iconClass}"></i>
                    <span>${safeName}</span>
                </button>
            </div>
        `;
    },

    openChoiceModal() {
        document.getElementById('item-creation-choice-modal').classList.remove('hidden');
    },

    openAIPromptModal() {
        const persona = this.getCurrentPersona();
        const modal = document.getElementById('item-ai-prompt-modal');
        const nameSpan = modal.querySelector('#ai-persona-name');
        if (nameSpan) nameSpan.innerText = persona.charAt(0).toUpperCase() + persona.slice(1);

        document.getElementById('ai-item-prompt').value = '';
        modal.classList.remove('hidden');
    },

    getCurrentPersona() {
        if (document.body.classList.contains('damien-theme')) return 'damien';
        if (document.body.classList.contains('eldrin-theme')) return 'eldrin';
        return 'lyra'; // Default
    },

    async handleAIRequest() {
        const promptInput = document.getElementById('ai-item-prompt');
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        const btn = document.getElementById('confirm-ai-generation-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invocando...';

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado");

            const persona = this.getCurrentPersona();

            const item = await generateItem(prompt, persona);

            document.getElementById('item-ai-prompt-modal').classList.add('hidden');
            this.openCreatorModal(item);
        } catch (error) {
            console.error(error);
            alert("A magia falhou: " + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Invocar Criação';
        }
    },

    openCreatorModal(prefilledData = null) {
        this.editingItemId = null;
        const modal = document.getElementById('item-creator-modal');
        const form = document.getElementById('item-creator-form');
        const titleEl = modal.querySelector('.modal-title');
        const submitBtn = modal.querySelector('button[type="submit"]');

        if (form) form.reset();

        if (prefilledData) {
            document.getElementById('create-item-name').value = prefilledData.name || '';
            document.getElementById('create-item-type').value = prefilledData.type || 'weapon';
            document.getElementById('create-item-rarity').value = prefilledData.rarity || 'common';
            document.getElementById('create-item-weight').value = prefilledData.weight || '';
            document.getElementById('create-item-cost').value = prefilledData.cost || '';
            document.getElementById('create-item-damage').value = prefilledData.damage || '';
            document.getElementById('create-item-damage-type').value = prefilledData.damageType || '';
            document.getElementById('create-item-ac').value = prefilledData.ac || '';
            document.getElementById('create-item-props').value = (prefilledData.properties || []).join(', ');
            document.getElementById('create-item-desc').value = prefilledData.description || '';
            this.toggleCreatorFields(prefilledData.type || 'weapon');
        } else {
            this.toggleCreatorFields('weapon');
        }

        if (titleEl) {
            const icon = this.currentSource === 'system' ? 'fas fa-gem' : 'fas fa-hammer';
            const text = this.currentSource === 'system' ? 'Contribuição ao Sistema' : 'Forja de Relíquias';
            titleEl.innerHTML = `<i class="${icon}"></i> ${text}`;
        }

        if (submitBtn) {
            submitBtn.textContent = 'Forjar Item';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }

        modal.classList.remove('hidden');
    },

    async openEditModal(itemId) {
        const item = this.cachedItems.find(i => i.id === itemId);
        if (!item) return;

        this.editingItemId = itemId;

        const modal = document.getElementById('item-creator-modal');
        const form = document.getElementById('item-creator-form');
        const titleEl = modal.querySelector('.modal-title');
        const submitBtn = modal.querySelector('button[type="submit"]');

        document.getElementById('create-item-name').value = item.name || '';
        document.getElementById('create-item-type').value = item.type || 'weapon';
        document.getElementById('create-item-rarity').value = item.rarity || 'common';
        document.getElementById('create-item-weight').value = item.weight || '';
        document.getElementById('create-item-cost').value = item.cost || '';
        document.getElementById('create-item-damage').value = item.damage || '';
        document.getElementById('create-item-damage-type').value = item.damageType || '';
        document.getElementById('create-item-ac').value = item.ac || '';
        document.getElementById('create-item-props').value = (item.properties || []).join(', ');
        document.getElementById('create-item-desc').value = item.description || '';

        this.toggleCreatorFields(item.type || 'weapon');

        if (titleEl) titleEl.innerHTML = `<i class="fas fa-pen-fancy"></i> Editando Relíquia`;
        if (submitBtn) submitBtn.textContent = 'Salvar Alterações';

        modal.classList.remove('hidden');
    },

    toggleCreatorFields(type) {
        const weaponField = document.querySelector('.creator-field-weapon');
        const armorField = document.querySelector('.creator-field-armor');

        if (weaponField) weaponField.classList.toggle('hidden', type !== 'weapon');
        if (armorField) armorField.classList.toggle('hidden', type !== 'armor');
    },

    async handleCreateItem() {
        const user = auth.currentUser;
        if (!user) {
            alert("Você precisa estar logado para forjar itens.");
            return;
        }

        const name = document.getElementById('create-item-name').value;
        const type = document.getElementById('create-item-type').value;
        const rarity = document.getElementById('create-item-rarity').value;
        const weight = document.getElementById('create-item-weight').value;
        const cost = document.getElementById('create-item-cost').value;
        const damage = document.getElementById('create-item-damage').value;
        const damageType = document.getElementById('create-item-damage-type')?.value || '';
        const ac = document.getElementById('create-item-ac').value;
        const propsRaw = document.getElementById('create-item-props').value;
        const description = document.getElementById('create-item-desc').value;

        const properties = propsRaw ? propsRaw.split(',').map(p => p.trim()).filter(p => p) : [];

        try {
            const nickname = SettingsModule.currentPrefs?.nickname || user.displayName || 'Aventureiro Misterioso';

            // Build flat item payload (backward compat)
            const itemPayload = {
                name, type, rarity, description,
                weight, cost, damage, damageType, ac, properties,
                createdByNickname: nickname,
                systemId: localStorage.getItem('lyra_current_system') || 'dnd5e'
            };

            // Attach structured ability_data for the new unified schema
            itemPayload.ability_data = getEmptyAbilityFromItem(itemPayload);

            this.openForge();

            const creatorForm = document.getElementById('item-creator-form');
            const submitBtn = creatorForm?.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';
                submitBtn.innerHTML = '<i class="fas fa-quill fa-spin"></i> Tecendo...';
            }

            const creatorModal = document.getElementById('item-creator-modal');
            if (creatorModal) creatorModal.classList.add('hidden');

            if (this.editingItemId) {
                await DataModule.updateUserItem(this.editingItemId, itemPayload);
                this.showForgeSuccess("As propriedades da relíquia foram alteradas!", true);
                this.editingItemId = null;
            } else if (this.currentSource === 'system') {
                await DataModule.saveGlobalItem(itemPayload);
                this.showForgeSuccess("Item consagrado na Galeria do Sistema! Os deuses observam sua obra.", false);
            } else {
                await DataModule.saveUserItem(user.uid, user.email, itemPayload);
                this.showForgeSuccess("Item forjado com sucesso! Você pode encontrá-lo em 'Meus Itens'.", false);
            }

            document.getElementById('item-creator-form').reset();

            const currentSystem = localStorage.getItem('lyra_current_system') || 'dnd5e';
            await this.loadItemsFromFirebase(currentSystem);
            await this.render();
        } catch (error) {
            // Re-enable button on error
            const creatorForm = document.getElementById('item-creator-form');
            const submitBtn = creatorForm?.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.textContent = this.editingItemId ? 'Salvar Alterações' : 'Forjar Item';
            }

            console.error("Erro ao forjar item:", error);

            const isPermissionError = error.code === 'permission-denied' ||
                error.message?.toLowerCase().includes('permission') ||
                error.message?.toLowerCase().includes('insufficient');

            let errorMsg = "A essência se dissipou antes de tomar forma. Tente novamente.";
            if (isPermissionError) {
                const coll = this.currentSource === 'system' ? 'itens_database' : 'user_items';
                errorMsg = `Seu Firebase bloqueou a escrita na coleção '${coll}'. Verifique as Security Rules.`;
            }

            this.showForgeError(errorMsg);
        }
    },

    async handleDeleteItem(itemId) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const success = await DataModule.deleteUserItem(itemId, user.uid, user.email);
            if (success) {
                // Instant Refresh local cache and UI
                this.cachedItems = this.cachedItems.filter(i => i.id !== itemId);
                this.filterItems(document.getElementById('items-search')?.value || '');

                // Also trigger full background refresh to ensure sync
                this.init('personal');
                window.app.showAlert("O artefato foi removido de sua forja.", "Destruição Concluída");
            } else {
                window.app.showAlert("Você não tem permissão para destruir este item.", "Sentença Negada");
            }
        } catch (error) {
            console.error("Erro ao deletar item:", error);
            alert("Erro ao destruir o item.");
        }
    },

    openShareModal(itemId) {
        this.itemToShare = itemId;
        const modal = document.getElementById('share-item-modal');
        const title = modal.querySelector('.modal-title');
        const p = modal.querySelector('p');

        if (title) title.innerHTML = `<i class="fas fa-share-nodes"></i> Compartilhar Item`;
        if (p) p.innerText = "Informe o Apelido Arcano do destinatário para partilhar este item:";

        modal.classList.remove('hidden');
    },

    async handleShareConfirm() {
        const nickname = document.getElementById('share-target-email').value;
        if (!nickname) return;

        try {
            await DataModule.shareItem(this.itemToShare, nickname);
            window.app.showAlert(`O item foi enviado para ${nickname}!`, "Partilha Concluída");
            document.getElementById('share-item-modal').classList.add('hidden');
            document.getElementById('share-target-email').value = '';
            this.itemToShare = null;
        } catch (error) {
            alert(error.message);
        }
    },

    openForge() {
        const overlay = document.getElementById('forge-overlay');
        if (!overlay) return;

        const container = overlay.querySelector('.forge-container');
        if (container) {
            container.classList.remove('success');
            container.classList.remove('error');
        }

        const successContent = overlay.querySelector('.forge-success-content');
        if (successContent) successContent.classList.add('hidden');

        const errorContent = overlay.querySelector('.forge-error-content');
        if (errorContent) errorContent.classList.add('hidden');

        const status = overlay.querySelector('.forge-status');
        if (status) status.classList.remove('hidden');

        overlay.classList.remove('hidden');

        // Reset icon
        const iconEl = overlay.querySelector('.forge-center-icon');
        if (iconEl) {
            iconEl.className = 'fas fa-fire-alt forge-center-icon';
        }
    },

    showForgeSuccess(message, isEdit) {
        const overlay = document.getElementById('forge-overlay');
        if (!overlay) return;

        const container = overlay.querySelector('.forge-container');
        const successContent = overlay.querySelector('.forge-success-content');
        const titleEl = successContent?.querySelector('h3');
        const msgEl = successContent?.querySelector('p');

        if (titleEl) titleEl.innerText = isEdit ? "Relíquia Reformulada!" : "Obra-Prima Forjada!";
        if (msgEl) msgEl.innerText = message;

        const status = overlay.querySelector('.forge-status');
        if (status) status.classList.add('hidden');

        if (container) container.classList.add('success');
        if (successContent) successContent.classList.remove('hidden');

        // Update icon
        const iconEl = overlay.querySelector('.forge-center-icon');
        if (iconEl) {
            iconEl.className = 'fas fa-gem forge-center-icon';
        }
    },

    showForgeError(message) {
        const overlay = document.getElementById('forge-overlay');
        if (!overlay) return;

        const container = overlay.querySelector('.forge-container');
        const errorContent = overlay.querySelector('.forge-error-content');
        const msgEl = errorContent?.querySelector('.error-msg');

        if (msgEl) msgEl.innerText = message;

        const status = overlay.querySelector('.forge-status');
        if (status) status.classList.add('hidden');

        if (container) container.classList.add('error');
        if (errorContent) errorContent.classList.remove('hidden');

        // Update icon to burst
        const iconEl = overlay.querySelector('.forge-center-icon');
        if (iconEl) {
            iconEl.className = 'fas fa-burst forge-center-icon';
        }
    },

    closeForge() {
        const overlay = document.getElementById('forge-overlay');
        if (overlay) overlay.classList.add('hidden');
    },

    openItemDetail(itemId) {
        const item = this.cachedItems.find(i => i.id === itemId);
        if (!item) return;

        const modalWrapper = document.getElementById('modal-wrapper');
        const detailContainer = document.getElementById('detail-container');
        const modalBody = document.getElementById('modal-body');

        if (modalWrapper && detailContainer) {
            modalWrapper.classList.remove('hidden');
            if (modalBody) modalBody.classList.add('hidden');

            detailContainer.classList.remove('hidden');
            detailContainer.innerHTML = this.renderDetailContent(item);
        }
    },

    renderDetailContent(item) {
        const iconClass = this.getItemIcon(item);
        const typeLabel = this.formatType(item.subtype || item.type);

        let statsHtml = '';
        if (item.damage) statsHtml += `<div class="detail-stat"><strong>Dano</strong><span>${item.damage}</span></div>`;
        if (item.ac) statsHtml += `<div class="detail-stat"><strong>CA</strong><span>${item.ac}</span></div>`;
        if (item.weight && item.weight !== '-') statsHtml += `<div class="detail-stat"><strong>Peso</strong><span>${item.weight}</span></div>`;
        if (item.cost && item.cost !== '-') statsHtml += `<div class="detail-stat"><strong>Preço</strong><span>${item.cost}</span></div>`;
        if (item.rarity) statsHtml += `<div class="detail-stat"><strong>Raridade</strong><span>${this.translateRarity(item.rarity)}</span></div>`;

        const badges = (item.properties || []).map(p => `<span class="detail-badge">${p}</span>`).join('');

        // Structured ability mechanics (from ability_data or lazy-converted)
        const ab = item.ability_data || (item.identity ? item : null);
        let mechanicsHtml = '';
        if (ab) {
            const em = ab.execution_mechanics || {};
            const act = ab.activation || {};
            const tl = ab.trigger_logic || {};

            // Activation badge
            const actLabel = { 'Action': 'Ação', 'Bonus': 'Ação Bônus', 'Reaction': 'Reação', 'Passive': 'Passiva', 'Legendary': 'Lendária', 'Lair': 'Covil' };
            const actText = actLabel[act.type] || act.type || '';

            // Range
            const rangeMax = tl.range?.max || 0;
            const rangeUnit = tl.range?.unit || 'ft';
            const rangeText = rangeMax > 0 ? `${rangeMax} ${rangeUnit}` : 'Corpo a corpo';

            // Damage
            let dmgText = '';
            if (em.damage && em.damage.length > 0) {
                dmgText = em.damage.map(d => {
                    let s = `${d.dice_count || 1}d${d.dice_type || 6}`;
                    if (d.fixed_modifier) s += `+${d.fixed_modifier}`;
                    if (d.damage_type) s += ` ${d.damage_type}`;
                    if (d.is_magical) s += ' ✦';
                    return s;
                }).join(' + ');
            }

            // Save
            let saveText = '';
            if (em.has_save && em.save?.ability) {
                const successMap = { 'half_damage': 'metade do dano', 'no_damage': 'sem efeito', 'end_condition': 'encerra condição' };
                saveText = `CD ${em.save.dc_value || '?'} ${em.save.ability} (${successMap[em.save.on_success] || em.save.on_success})`;
            }

            // Conditions
            let condText = '';
            if (em.conditions && em.conditions.length > 0) {
                condText = em.conditions.map(c => {
                    const durMap = { '1_round': '1 rodada', '1_minute': '1 minuto' };
                    return `${c.id}${c.duration ? ` (${durMap[c.duration] || c.duration})` : ''}`;
                }).join(', ');
            }

            mechanicsHtml = `
                <div class="detail-mechanics">
                    <h3><i class="fas fa-cogs"></i> Mecânicas de Uso</h3>
                    <div class="detail-stats-grid">
                        ${actText ? `<div class="detail-stat"><strong>Ativação</strong><span>${actText}</span></div>` : ''}
                        ${rangeText ? `<div class="detail-stat"><strong>Alcance</strong><span>${rangeText}</span></div>` : ''}
                        ${dmgText ? `<div class="detail-stat"><strong>Dano</strong><span>${dmgText}</span></div>` : ''}
                        ${em.has_attack_roll ? `<div class="detail-stat"><strong>Ataque</strong><span>Rolagem de Ataque</span></div>` : ''}
                        ${saveText ? `<div class="detail-stat"><strong>Salvaguarda</strong><span>${saveText}</span></div>` : ''}
                        ${condText ? `<div class="detail-stat"><strong>Condições</strong><span>${condText}</span></div>` : ''}
                    </div>
                </div>
            `;
        }

        return `
            <div class="item-detail-view">
                <div class="detail-header">
                    <div class="detail-icon-large">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="detail-title-block">
                        <h2>${sanitizeHTML(item.name)}</h2>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="detail-subtitle">${typeLabel}</span>
                            ${item.createdByNickname ? `<span class="detail-owner" style="font-size: 0.8rem; font-style: italic; opacity: 0.8;"><i class="fas fa-hammer" style="font-size: 0.7rem;"></i> Forjado por: ${sanitizeHTML(item.createdByNickname)}</span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="detail-stats-grid">
                    ${statsHtml}
                </div>

                ${badges ? `<div class="detail-badges">${badges}</div>` : ''}

                ${mechanicsHtml}

                <div class="detail-description">
                    <h3>Crônica do Item</h3>
                    <p>${sanitizeHTML(item.description)}</p>
                </div>

            </div>
    `;
    },

    closeModal() {
        const modalWrapper = document.getElementById('modal-wrapper');
        const detailContainer = document.getElementById('detail-container');
        const modalBody = document.getElementById('modal-body');

        if (modalWrapper) {
            modalWrapper.classList.add('hidden');
            modalWrapper.classList.remove('active');

            // Clean up item detail and restore normal modal body
            if (detailContainer) {
                detailContainer.innerHTML = '';
                detailContainer.classList.add('hidden');
            }
            if (modalBody) modalBody.classList.remove('hidden');
        }
    },

    translateRarity(r) {
        const map = { common: 'Comum', uncommon: 'Incomum', rare: 'Raro', very_rare: 'Muito Raro', legendary: 'Lendário' };
        return map[r] || r;
    },

    getItemIcon(item) {
        const name = (item.name || "").toLowerCase();
        const subtype = (item.subtype || "").toLowerCase();
        const type = (item.type || "").toLowerCase();

        // ⚔️ Weapons (Using Free FontAwesome 6 alternatives)
        if (name.includes('espada') || name.includes('rapieira') || name.includes('cimitarra') || name.includes('arma +')) return 'fas fa-khanda';
        if (name.includes('machado') || name.includes('machadinha')) return 'fas fa-gavel';
        if (name.includes('martelo') || name.includes('malho') || name.includes('maul')) return 'fas fa-hammer';
        if (name.includes('arco') || name.includes('besta')) return 'fas fa-bullseye';
        if (name.includes('adaga') || name.includes('faca')) return 'fas fa-khanda'; // Best free multi-edged alternative
        if (name.includes('lança') || name.includes('tridente') || name.includes('alabarda') || name.includes('glaive') || name.includes('azagaia')) return 'fas fa-hand-fist';
        if (name.includes('maça') || name.includes('mangual') || name.includes('clava')) return 'fas fa-gavel';
        if (name.includes('dardo')) return 'fas fa-location-arrow';
        if (name.includes('funda')) return 'fas fa-circle-dot';
        if (name.includes('chicote')) return 'fas fa-ring';
        if (name.includes('rede')) return 'fas fa-table-cells';
        if (name.includes('zarabatana')) return 'fas fa-wind';

        // Weapon Fallback (Free)
        if (type === 'weapon' || type === 'arma' || subtype.includes('cac') || subtype.includes('dist')) return 'fas fa-khanda';

        // 🛡️ Armor & Shields (Free)
        if (subtype.includes('escudo') || name.includes('escudo')) return 'fas fa-shield-halved';
        if (type === 'armor' || type === 'armadura' || subtype === 'leve' || subtype === 'media' || subtype === 'pesada') return 'fas fa-shirt';

        // ✨ Magic & Potions (Free)
        if (subtype.includes('pocao') || name.includes('poção')) return 'fas fa-flask';
        if (subtype.includes('anel') || name.includes('anel')) return 'fas fa-ring';
        if (subtype.includes('varinha') || name.includes('varinha')) return 'fas fa-wand-magic-sparkles';
        if (type === 'wondrous' || subtype === 'maravilhoso') return 'fas fa-gem';
        if (subtype.includes('grimório') || name.includes('livro') || name.includes('tomo')) return 'fas fa-book';
        if (subtype.includes('pergaminho')) return 'fas fa-scroll';

        // 🎒 Gear & Misc (Free)
        if (name.includes('mochila') || name.includes('saco') || name.includes('bolsa')) return 'fas fa-bag-shopping';
        if (name.includes('lamparina') || name.includes('lanterna') || name.includes('tocha')) return 'fas fa-fire';
        if (name.includes('mapa') || name.includes('carta')) return 'fas fa-map';
        if (name.includes('bússola')) return 'fas fa-compass';
        if (name.includes('ferramenta') || subtype === 'ferramenta') return 'fas fa-toolbox';

        // General Fallback (Reliable Free Icon)
        return 'fas fa-chess-rook';
    },


    formatType(type) {
        const map = {
            'simples_cac': 'Simples (C-a-C)',
            'simples_dist': 'Simples (Distância)',
            'marcial_cac': 'Marcial (C-a-C)',
            'marcial_dist': 'Marcial (Distância)',
            'leve': 'Armadura Leve',
            'media': 'Armadura Média',
            'pesada': 'Armadura Pesada',
            'escudo': 'Escudo',
            'pocao': 'Poção',
            'maravilhoso': 'Item Maravilhoso',
            'varinha': 'Varinha',
            'anel': 'Anel',
            'magico': 'Item Mágico'
        };
        return map[type] || type;
    }
};

window.ItemsModule = ItemsModule;
export default ItemsModule;
