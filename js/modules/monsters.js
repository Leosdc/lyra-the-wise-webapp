
import * as DataModule from '../data.js';
import { NavigationModule } from './navigation.js';
import { auth } from '../auth.js';
import { SettingsModule } from './settings.js';
import { generateMonster } from '../ai.js';
import { sanitizeHTML, translateFirebaseError } from './utils.js';

export const MonsterModule = {
    // State
    cachedItems: [],
    filteredItems: [],
    displayItems: [],
    currentSource: 'system', // 'system' or 'personal'
    itemsPerPage: 60, // Increased from 30 to see more initially
    currentPage: 1,
    filters: {
        search: '',
        cr: 'all',
        type: 'all',
        size: 'all'
    },
    isLoading: false,
    editingItemId: null,

    async init() {
        this.injectHTML();
        this.currentSource = sessionStorage.getItem('lyra_monstros_source') || 'system';
        this.bindEvents();
        this.bindFilters();
        this.setupInfiniteScroll();
    },

    injectHTML() {
        if (document.getElementById('monster-creator-modal')) return;

        const modalHtml = `
            <!-- CINEMATIC SUMMONING OVERLAY -->
            <div id="summoning-overlay" class="modal-overlay hidden">
                <div class="summoning-container">
                    <div class="summoning-animation">
                        <div class="summoning-spinner">
                            <div class="summoning-rune outer"></div>
                            <div class="summoning-rune middle"></div>
                            <div class="summoning-rune inner"></div>
                            <i class="fas fa-dragon summoning-center-icon"></i>
                        </div>
                        <div class="summoning-glow"></div>
                    </div>
                    <div class="summoning-status">
                        <h2 class="summoning-title">Invocando...</h2>
                        <p class="summoning-msg">Manifestando a essência da criatura no plano material.</p>
                    </div>
                    <div class="summoning-success-content hidden">
                        <h3 class="summoning-success-title">Manifestação Concluída!</h3>
                        <p class="summoning-success-msg">A criatura agora habita os registros desta realidade.</p>
                        <button class="medieval-btn" data-action="monsters-close-summoning">Concluir</button>
                    </div>
                    <div class="summoning-error-content hidden">
                        <h3 style="color: #ef4444;">Falha na Invocação!</h3>
                        <p class="error-msg">A essência se dissipou antes de atravessar o véu.</p>
                        <button class="medieval-btn secondary" data-action="monsters-close-summoning">Tentar Novamente</button>
                    </div>
                </div>
            </div>

            <!-- Monster Creator Modal -->
            <div id="monster-creator-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal wide">
                    <button class="close-modal" id="close-monster-creator"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title" id="monster-creator-title"><i class="fas fa-hammer"></i> Bestiário Arcano</h2>
                    <form id="monster-creator-form" class="parchment-content">
                        <div class="form-grid-3">
                            <div class="form-group">
                                <label>Nome da Criatura</label>
                                <input type="text" id="create-monster-name" class="medieval-input" required>
                            </div>
                            <div class="form-group">
                                <label>ND (Nível de Desafio)</label>
                                <input type="text" id="create-monster-cr" class="medieval-input" placeholder="0, 1/4, 2, 30...">
                            </div>
                            <div class="form-group">
                                <label>Tipo</label>
                                <select id="create-monster-type" class="medieval-select">
                                    <option value="Aberração">Aberração</option>
                                    <option value="Besta">Besta</option>
                                    <option value="Celestial">Celestial</option>
                                    <option value="Constructo">Constructo</option>
                                    <option value="Dragão">Dragão</option>
                                    <option value="Elemental">Elemental</option>
                                    <option value="Fada">Fada</option>
                                    <option value="Ínfero">Ínfero</option>
                                    <option value="Gigante">Gigante</option>
                                    <option value="Humanoide">Humanoide</option>
                                    <option value="Monstruosidade">Monstruosidade</option>
                                    <option value="Gosma">Gosma</option>
                                    <option value="Planta">Planta</option>
                                    <option value="Morto-Vivo">Morto-Vivo</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-grid-3">
                            <div class="form-group">
                                <label>Tamanho</label>
                                <select id="create-monster-size" class="medieval-select">
                                    <option value="Tiny">Miúdo (Tiny)</option>
                                    <option value="Small">Pequeno (Small)</option>
                                    <option value="Medium" selected>Médio (Medium)</option>
                                    <option value="Large">Grande (Large)</option>
                                    <option value="Huge">Enorme (Huge)</option>
                                    <option value="Gargantuan">Imenso (Gargantuan)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Vida (PV)</label>
                                <input type="text" id="create-monster-hp" class="medieval-input" placeholder="Ex: 45 (7d8 + 14)">
                            </div>
                            <div class="form-group">
                                <label>Armadura (CA)</label>
                                <input type="number" id="create-monster-ac" class="medieval-input" placeholder="10">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Ações & Habilidades</label>
                            <textarea id="create-monster-description" class="medieval-textarea" rows="8" placeholder="Habilidades especiais, ataques e descrições..."></textarea>
                        </div>

                        <div class="form-group">
                            <label>Atributos</label>
                            <div class="stats-grid-creator">
                                <div class="stat-creator">
                                    <label>FOR</label>
                                    <input type="number" id="create-monster-for" class="medieval-input" value="10">
                                </div>
                                <div class="stat-creator">
                                    <label>DES</label>
                                    <input type="number" id="create-monster-des" class="medieval-input" value="10">
                                </div>
                                <div class="stat-creator">
                                    <label>CON</label>
                                    <input type="number" id="create-monster-con" class="medieval-input" value="10">
                                </div>
                                <div class="stat-creator">
                                    <label>INT</label>
                                    <input type="number" id="create-monster-int" class="medieval-input" value="10">
                                </div>
                                <div class="stat-creator">
                                    <label>SAB</label>
                                    <input type="number" id="create-monster-sab" class="medieval-input" value="10">
                                </div>
                                <div class="stat-creator">
                                    <label>CAR</label>
                                    <input type="number" id="create-monster-car" class="medieval-input" value="10">
                                </div>
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button type="submit" class="medieval-btn">REGISTRAR NA CRIPTA</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Monster Creation Choice Modal -->
            <div id="monster-creation-choice-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal medium">
                    <button id="close-monster-choice-modal" class="close-modal"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-hammer"></i> MÉTODO DE FORJA</h2>
                    <div class="mode-choices">
                        <button id="monster-choice-manual" class="choice-card">
                            <i class="fas fa-hammer"></i>
                            <h4>MANUAL</h4>
                            <p>Preencha os detalhes da criatura você mesmo.</p>
                        </button>
                        <button id="monster-choice-ai" class="choice-card">
                            <i class="fas fa-wand-magic-sparkles"></i>
                            <h4>INSPIRAÇÃO ARCANA</h4>
                            <p>Deixe a magia moldar a criatura para você.</p>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Monster AI Prompt Modal -->
            <div id="monster-ai-prompt-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal medium">
                    <button id="close-monster-ai-prompt" class="close-modal"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-wand-magic-sparkles"></i> Inspiração de <span id="monster-ai-persona-name">Lyra</span></h2>
                    <div class="parchment-content">
                        <p>Descreva o efeito mágico que deseja invocar. A Magia cuidará dos componentes e rituais.</p>
                        <textarea id="ai-monster-prompt" class="medieval-textarea" rows="8" placeholder="Ex: Um lobo das sombras com olhos flamejantes que caça nas noites sem lua..."></textarea>
                        <div class="modal-actions">
                            <button id="confirm-monster-generation-btn" class="medieval-btn">INVOCAR MAGIA</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    bindEvents() {
        // Delegated handler for monster data-action clicks
        document.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;

            switch (actionEl.dataset.action) {
                case 'monsters-close-summoning': this.closeSummoning(); break;
                case 'monsters-view-detail': {
                    const id = actionEl.dataset.monsterId;
                    if (id) this.viewDetail(id);
                    break;
                }
            }
        });
        // Selection Screen
        document.querySelectorAll('#monstros-selection .selection-card').forEach(card => {
            card.addEventListener('click', () => {
                this.currentSource = card.dataset.source;
                sessionStorage.setItem('lyra_monstros_source', this.currentSource);
                this.resetFilters();
                NavigationModule.switchView('monstros', this.getNavigationContext());
            });
        });

        const newBtn = document.getElementById('monstros-new-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                if (this.currentSource === 'personal') {
                    this.openChoiceModal();
                } else {
                    this.openCreatorModal();
                }
            });
        }

        const backBtn = document.getElementById('back-to-monstros-selection');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                NavigationModule.switchView('monstros-selection', {});
            });
        }

        // Choice Modal Events
        document.getElementById('monster-choice-manual')?.addEventListener('click', () => {
            this.closeModal('monster-creation-choice-modal');
            this.openCreatorModal();
        });

        document.getElementById('monster-choice-ai')?.addEventListener('click', () => {
            this.closeModal('monster-creation-choice-modal');
            this.openAIPromptModal();
        });

        document.getElementById('close-monster-choice-modal')?.addEventListener('click', () => {
            this.closeModal('monster-creation-choice-modal');
        });

        // AI Prompt Modal Events
        document.getElementById('close-monster-ai-prompt')?.addEventListener('click', () => {
            this.closeModal('monster-ai-prompt-modal');
        });

        document.getElementById('confirm-monster-generation-btn')?.addEventListener('click', () => {
            this.handleAIRequest();
        });

        const closeCreator = document.getElementById('close-monster-creator');
        if (closeCreator) {
            closeCreator.addEventListener('click', () => {
                this.closeModal('monster-creator-modal');
            });
        }

        const creatorForm = document.getElementById('monster-creator-form');
        if (creatorForm) {
            creatorForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreate();
            });
        }
    },

    bindFilters() {
        const searchInput = document.getElementById('monstros-search');
        const crFilter = document.getElementById('monstros-filter-cr');
        const typeFilter = document.getElementById('monstros-filter-type');
        const sizeFilter = document.getElementById('monstros-filter-size');

        searchInput?.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        crFilter?.addEventListener('change', (e) => {
            this.filters.cr = e.target.value;
            this.applyFilters();
        });

        typeFilter?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
        });

        sizeFilter?.addEventListener('change', (e) => {
            this.filters.size = e.target.value;
            this.applyFilters();
        });
    },

    getNavigationContext() {
        return {
            loadMonsters: () => this.render()
        };
    },

    setupInfiniteScroll() {
        const container = document.getElementById('monstros-grid');
        if (!container) return;

        window.addEventListener('scroll', () => {
            if (this.isLoading) return;
            if (this.displayItems.length >= this.filteredItems.length) return;
            if (this.filteredItems.length === 0) return;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;

            // Only trigger if we are actually scrolling and near bottom
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                this.loadMore();
            }
        });
    },

    resetFilters() {
        this.filters = { search: '', cr: 'all', type: 'all', size: 'all' };

        // Update UI
        const si = document.getElementById('monstros-search');
        if (si) si.value = '';

        const cf = document.getElementById('monstros-filter-cr');
        if (cf) cf.value = 'all';

        const tf = document.getElementById('monstros-filter-type');
        if (tf) tf.value = 'all';

        const sf = document.getElementById('monstros-filter-size');
        if (sf) sf.value = 'all';
    },

    async render() {
        const container = document.getElementById('monstros-grid');
        const titleEl = document.getElementById('monstros-title');
        const newBtn = document.getElementById('monstros-new-btn');

        if (!container) return;

        // Update Title and New Button visibility
        const systemName = this.getSystemName();
        if (titleEl) {
            titleEl.innerHTML = this.currentSource === 'system'
                ? `<i class="fas fa-dragon"></i> Bestiário do Sistema (${systemName})`
                : `<i class="fas fa-flask"></i> Meus Monstros`;
        }

        if (newBtn) {
            newBtn.classList.toggle('hidden', this.currentSource === 'system');
        }

        container.innerHTML = '<div class="loading-quill"><i class="fas fa-quill fa-spin"></i> Consultando tomos...</div>';

        await this.loadData();
        this.applyFilters();
    },

    async loadData() {
        const user = auth.currentUser;
        const systemId = window.app?.currentSystem || 'dnd5e';

        try {
            if (this.currentSource === 'system') {
                this.cachedItems = await DataModule.getGlobalMonsters(systemId);
            } else {
                if (!user) {
                    this.cachedItems = [];
                    return;
                }
                this.cachedItems = await DataModule.getUserMonsters(user.uid, user.email);
            }
        } catch (error) {
            console.error("Erro ao carregar monstros:", error);
            const msg = translateFirebaseError(error);
            container.innerHTML = `<p class="empty-state">${msg}</p>`;
            this.cachedItems = [];
        }
    },

    applyFilters() {
        const { search, cr, type, size } = this.filters;

        this.filteredItems = this.cachedItems.filter(m => {
            const matchesSearch = m.name.toLowerCase().includes(search);

            const monsterCR = m.cr || m.secoes?.ND || '0';
            let matchesCR = cr === 'all';
            if (!matchesCR) {
                if (cr === '10+') {
                    // Handle ND above 10 (always numeric strings or numbers)
                    matchesCR = parseFloat(monsterCR) >= 10;
                } else if (cr === '20+') {
                    matchesCR = parseFloat(monsterCR) >= 20;
                } else {
                    // Exact match for fractions (1/2, 1/4, 1/8) and numbers
                    matchesCR = monsterCR.toString() === cr;
                }
            }

            const monsterType = (m.type || m.secoes?.Tipo || '').toLowerCase();
            const matchesType = type === 'all' || monsterType.includes(type.toLowerCase());

            const sizeMap = {
                'tiny': 'miúdo',
                'small': 'pequeno',
                'medium': 'médio',
                'large': 'grande',
                'huge': 'enorme',
                'gargantuan': 'imenso'
            };

            const monsterSize = (m.size || m.secoes?.Tamanho || m.detalhes?.tamanho || 'Médio').toLowerCase().trim();
            const normalizedSize = sizeMap[monsterSize] || monsterSize;

            const matchesSize = size === 'all' || normalizedSize === size.toLowerCase().trim();

            return matchesSearch && matchesCR && matchesType && matchesSize;
        });

        this.currentPage = 1;
        this.displayItems = this.filteredItems.slice(0, this.itemsPerPage * this.currentPage);
        this.renderList();
    },

    loadMore() {
        if (this.displayItems.length >= this.filteredItems.length) return;

        this.currentPage++;
        const nextBatch = this.filteredItems.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );

        this.displayItems = [...this.displayItems, ...nextBatch];

        const container = document.getElementById('monstros-grid');
        const fragment = document.createRange().createContextualFragment(
            nextBatch.map(m => this.createCard(m)).join('')
        );
        container.appendChild(fragment);
        this.bindCardActions();
    },

    renderList() {
        const container = document.getElementById('monstros-grid');
        if (!container) return;

        if (this.displayItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card">
                    <i class="fas fa-skull empty-skull-icon"></i>
                    <div class="empty-text-overlay">
                        <p>Nenhuma criatura encontrada nos registros.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.displayItems.map(m => this.createCard(m)).join('');
        this.bindCardActions();
    },

    createCard(monster) {
        const isUserMonster = this.currentSource === 'personal';
        const crLabel = monster.cr || monster.secoes?.ND || '0';
        const typeLabel = monster.type || monster.secoes?.Tipo || 'Desconhecido';

        const actionButtons = (isUserMonster && monster.isOwner) ? `
            <div class="card-actions">
                <button class="action-btn share-btn" data-id="${monster.id}" title="Compartilhar">
                    <i class="fas fa-share-nodes"></i>
                </button>
                <button class="action-btn edit-btn" data-id="${monster.id}" title="Editar">
                    <i class="fas fa-pen-to-square"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${monster.id}" title="Excluir">
                    <i class="fas fa-trash-can"></i>
                </button>
            </div>
        ` : '';

        const safeName = sanitizeHTML(monster.name);
        const safeType = sanitizeHTML(typeLabel);

        return `
            <div class="item-card-wrapper">
                <div class="item-card monster-card" data-id="${monster.id}">
                    <div class="monster-cr-badge">ND ${crLabel}</div>
                    ${actionButtons}
                    <button class="gallery-card" data-action="monsters-view-detail" data-monster-id="${monster.id}">
                        <div class="monster-icon-wrapper">
                            <i class="fas fa-dragon"></i>
                        </div>
                        <div class="monster-info">
                            <span>${safeName}</span>
                            <div class="monster-type-label">${safeType}</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
    },


    bindCardActions() {
        const container = document.getElementById('monstros-grid');
        if (!container) return;

        container.querySelectorAll('.delete-btn').forEach(btn => {
            if (btn.closest('.monster-card')) {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    const confirmed = await window.app.showConfirm("Deseja banir esta criatura permanentemente?", "Banimento");
                    if (confirmed) {
                        await this.handleDelete(id);
                    }
                };
            }
        });

        container.querySelectorAll('.edit-btn').forEach(btn => {
            if (btn.closest('.monster-card')) {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    const monster = this.cachedItems.find(m => m.id === id);
                    if (monster) this.openCreatorModal(monster);
                };
            }
        });

        container.querySelectorAll('.share-btn').forEach(btn => {
            if (btn.closest('.monster-card')) {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    window.app.showAlert("Funcionalidade de compartilhar em breve!", "Sabedoria Compartilhada");
                };
            }
        });
    },

    async viewDetail(id) {
        if (NavigationModule) {
            await NavigationModule.viewMonster(id, window.app);
        }
    },

    // --- CRUD ---
    openChoiceModal() {
        document.getElementById('monster-creation-choice-modal').classList.remove('hidden');
    },

    openAIPromptModal() {
        const modal = document.getElementById('monster-ai-prompt-modal');
        document.getElementById('ai-monster-prompt').value = '';
        modal.classList.remove('hidden');
    },


    async handleAIRequest() {
        const promptInput = document.getElementById('ai-monster-prompt');
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        const btn = document.getElementById('confirm-monster-generation-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invocando...';

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado");

            const persona = window.app?.currentThemeName || 'lyra';

            const { generateMonster } = await import('../ai.js');
            const monster = await generateMonster(prompt, persona);

            this.closeModal('monster-ai-prompt-modal');
            this.openCreatorModal(monster);
        } catch (error) {
            console.error(error);
            window.app.showAlert("A invocação falhou: " + error.message, "Erro Arcano");
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'INVOCAR CRIAÇÃO';
        }
    },

    openCreatorModal(monster = null) {
        const modal = document.getElementById('monster-creator-modal');
        const form = document.getElementById('monster-creator-form');
        const title = document.getElementById('monster-creator-title');

        if (modal && form) {
            form.reset();
            this.editingItemId = monster && monster.id ? monster.id : null;
            title.innerHTML = this.editingItemId ? `<i class="fas fa-pen"></i> Editar Criatura` : `<i class="fas fa-hammer"></i> Nova Criatura`;

            if (monster) {
                // Base Info
                document.getElementById('create-monster-name').value = monster.name || '';
                document.getElementById('create-monster-cr').value = monster.cr || monster.secoes?.ND || '';

                // Normalize Type
                const TYPE_MAP = {
                    'aberration': 'Aberração', 'aberracao': 'Aberração', 'aberração': 'Aberração',
                    'beast': 'Besta', 'besta': 'Besta',
                    'celestial': 'Celestial',
                    'construct': 'Constructo', 'constructo': 'Constructo',
                    'dragon': 'Dragão', 'dragao': 'Dragão', 'dragão': 'Dragão',
                    'elemental': 'Elemental',
                    'fey': 'Fada', 'fada': 'Fada',
                    'fiend': 'Ínfero', 'infero': 'Ínfero', 'ínfero': 'Ínfero',
                    'giant': 'Gigante', 'gigante': 'Gigante',
                    'humanoid': 'Humanoide', 'humanoide': 'Humanoide',
                    'monstrosity': 'Monstruosidade', 'monstruosidade': 'Monstruosidade',
                    'ooze': 'Gosma', 'gosma': 'Gosma',
                    'plant': 'Planta', 'planta': 'Planta',
                    'undead': 'Morto-Vivo', 'mortovivo': 'Morto-Vivo', 'morto-vivo': 'Morto-Vivo'
                };
                let typeVal = monster.type || monster.secoes?.Tipo || '';
                if (typeVal && typeof typeVal === 'string') {
                    const normalized = typeVal.toLowerCase().trim()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove accents
                        .replace(/ç/g, 'c');

                    const baseType = normalized.split(' ')[0].replace(/[(),]/g, '');
                    typeVal = TYPE_MAP[normalized] || TYPE_MAP[baseType] || typeVal.charAt(0).toUpperCase() + typeVal.slice(1);
                }
                const typeEl = document.getElementById('create-monster-type');
                if (typeEl) {
                    // Ensure the value exists or add it
                    const exists = Array.from(typeEl.options).some(opt => opt.value === typeVal);
                    if (!exists && typeVal) {
                        const opt = new Option(typeVal, typeVal);
                        typeEl.add(opt);
                    }
                    typeEl.value = typeVal;
                }

                // Normalize Size
                const SIZE_MAP = {
                    'miúdo': 'Tiny', 'tiny': 'Tiny',
                    'pequeno': 'Small', 'small': 'Small',
                    'médio': 'Medium', 'medium': 'Medium',
                    'grande': 'Large', 'large': 'Large',
                    'enorme': 'Huge', 'huge': 'Huge',
                    'imenso': 'Gargantuan', 'gargantuan': 'Gargantuan'
                };
                let sizeVal = monster.size || monster.secoes?.Tamanho || 'Medium';
                if (sizeVal && typeof sizeVal === 'string') {
                    const normalized = sizeVal.toLowerCase().trim();
                    sizeVal = SIZE_MAP[normalized] || sizeVal.charAt(0).toUpperCase() + sizeVal.slice(1).toLowerCase();
                }
                const sizeEl = document.getElementById('create-monster-size');
                if (sizeEl) sizeEl.value = sizeVal;

                // Stats & Description
                document.getElementById('create-monster-hp').value = monster.hp || monster.secoes?.Status?.PV || '';
                document.getElementById('create-monster-ac').value = monster.ac || monster.secoes?.Status?.CA || '';
                document.getElementById('create-monster-description').value = monster.description || monster.secoes?.Descricao || '';

                // Attributes
                const attr = monster.attributes || monster.secoes?.Atributos || {};
                document.getElementById('create-monster-for').value = attr.FOR || 10;
                document.getElementById('create-monster-des').value = attr.DES || 10;
                document.getElementById('create-monster-con').value = attr.CON || 10;
                document.getElementById('create-monster-int').value = attr.INT || 10;
                document.getElementById('create-monster-sab').value = attr.SAB || 10;
                document.getElementById('create-monster-car').value = attr.CAR || 10;
            }

            modal.classList.remove('hidden');
        }
    },

    closeModal(id) {
        document.getElementById(id)?.classList.add('hidden');
    },

    async handleCreate() {
        const user = auth.currentUser;
        if (!user) return;

        const monsterData = {
            name: document.getElementById('create-monster-name').value,
            cr: document.getElementById('create-monster-cr').value,
            type: document.getElementById('create-monster-type').value,
            size: document.getElementById('create-monster-size').value,
            hp: document.getElementById('create-monster-hp').value,
            ac: document.getElementById('create-monster-ac').value,
            description: document.getElementById('create-monster-description').value,
            systemId: window.app?.currentSystem || 'dnd5e',
            secoes: {
                ND: document.getElementById('create-monster-cr').value,
                Tipo: document.getElementById('create-monster-type').value,
                Tamanho: document.getElementById('create-monster-size').value,
                Status: {
                    PV: document.getElementById('create-monster-hp').value,
                    CA: document.getElementById('create-monster-ac').value
                },
                Atributos: {
                    FOR: parseInt(document.getElementById('create-monster-for').value) || 10,
                    DES: parseInt(document.getElementById('create-monster-des').value) || 10,
                    CON: parseInt(document.getElementById('create-monster-con').value) || 10,
                    INT: parseInt(document.getElementById('create-monster-int').value) || 10,
                    SAB: parseInt(document.getElementById('create-monster-sab').value) || 10,
                    CAR: parseInt(document.getElementById('create-monster-car').value) || 10
                },
                Descricao: document.getElementById('create-monster-description').value
            }
        };

        this.openSummoning();
        this.closeModal('monster-creator-modal');

        try {
            const nickname = SettingsModule.currentPrefs?.nickname || user.displayName || 'Viajante';

            if (this.editingItemId) {
                await DataModule.updateUserMonster(this.editingItemId, monsterData);
                this.showSummoningSuccess("Criatura atualizada nos registros.", true);
            } else {
                await DataModule.saveUserMonster(user.uid, user.email, {
                    ...monsterData,
                    createdByNickname: nickname
                });
                this.showSummoningSuccess("Nova criatura registrada no bestiário.", false);
            }
            await this.render();
        } catch (error) {
            console.error(error);
            this.showSummoningError("Erro ao salvar criatura: " + error.message);
        }
    },


    openSummoning() {
        const overlay = document.getElementById('summoning-overlay');
        if (!overlay) return;

        const container = overlay.querySelector('.summoning-container');
        if (container) {
            container.classList.remove('success');
            container.classList.remove('error');
        }

        overlay.querySelector('.summoning-success-content')?.classList.add('hidden');
        overlay.querySelector('.summoning-error-content')?.classList.add('hidden');
        const status = overlay.querySelector('.summoning-status');
        if (status) status.classList.remove('hidden');

        overlay.classList.remove('hidden');

        // Reset icon to default dragon
        const iconEl = overlay.querySelector('.summoning-center-icon');
        if (iconEl) {
            iconEl.className = 'fas fa-dragon summoning-center-icon';
        }
    },

    showSummoningSuccess(message, isEdit) {
        const overlay = document.getElementById('summoning-overlay');
        if (!overlay) return;

        const container = overlay.querySelector('.summoning-container');
        const successContent = overlay.querySelector('.summoning-success-content');
        const status = overlay.querySelector('.summoning-status');
        const titleEl = successContent?.querySelector('.summoning-success-title');
        const msgEl = successContent?.querySelector('.summoning-success-msg');

        if (titleEl) titleEl.innerText = isEdit ? "Anais Atualizados!" : "Manifestação Concluída!";
        if (msgEl) msgEl.innerText = message;

        if (status) status.classList.add('hidden');
        if (container) container.classList.add('success');
        if (successContent) successContent.classList.remove('hidden');

        // Update icon - remains dragon for success
        const iconEl = overlay.querySelector('.summoning-center-icon');
        if (iconEl) {
            iconEl.className = 'fas fa-dragon summoning-center-icon';
        }
    },

    showSummoningError(message) {
        const overlay = document.getElementById('summoning-overlay');
        if (!overlay) return;

        const container = overlay.querySelector('.summoning-container');
        const status = overlay.querySelector('.summoning-status');
        const errorContent = overlay.querySelector('.summoning-error-content');
        const msgEl = errorContent?.querySelector('.error-msg');

        if (status) status.classList.add('hidden');
        if (msgEl) msgEl.innerText = message || "A essência se dissipou.";
        if (container) container.classList.add('error');
        if (errorContent) errorContent.classList.remove('hidden');

        // Update icon to burst
        const iconEl = overlay.querySelector('.summoning-center-icon');
        if (iconEl) {
            iconEl.className = 'fas fa-burst summoning-center-icon';
        }
    },

    closeSummoning() {
        document.getElementById('summoning-overlay')?.classList.add('hidden');
    },

    async handleDelete(id) {
        const user = auth.currentUser;
        if (!user) return;

        window.app.toggleLoading(true);
        try {
            const success = await DataModule.deleteUserMonster(id, user.uid);
            if (success) {
                window.app.showAlert("Criatura banida dos seus registros.", "Banimento Concluído");
                await this.render();
            } else {
                window.app.showAlert("Somente o criador pode banir esta criatura.", "Acesso Negado");
            }
        } catch (error) {
            console.error(error);
            window.app.showAlert("Erro ao banir criatura.", "Erro Arcano");
        } finally {
            window.app.toggleLoading(false);
        }
    },

    getSystemName() {
        const sysId = window.app?.currentSystem || 'dnd5e';
        const systems = [
            { id: 'dnd5e', name: 'D&D 5e' },
            { id: 'pathfinder2', name: 'Pathfinder 2e' },
            { id: 'coc7', name: 'Call of Cthulhu 7e' }
        ];
        const found = systems.find(s => s.id === sysId);
        return found ? found.name : sysId.toUpperCase();
    }
};

window.MonsterModule = MonsterModule;
export default MonsterModule;
