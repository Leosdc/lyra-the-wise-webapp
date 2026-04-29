
import * as DataModule from '../data.js';
import { NavigationModule } from './navigation.js';
import { auth } from '../auth.js';
import { generateEntity } from '../ai.js';
import { sanitizeHTML } from './utils.js';
import { EntitySheetModule } from './entity-sheet.js';

export const MonsterModule = {
    // State
    cachedItems: [],
    filteredItems: [],
    displayItems: [],
    currentSource: 'system', // 'system' or 'personal'
    itemsPerPage: 60,
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

        // Listen for entity-saved events to refresh list
        window.addEventListener('entity-saved', (e) => {
            if (e.detail?.type === 'monster') this.render();
        });
    },

    injectHTML() {
        if (document.getElementById('summoning-overlay')) return;

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
            // Open Entity Sheet for new monster
            EntitySheetModule.openNewEntity('monster');
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

            if (scrollTop + clientHeight >= scrollHeight - 300) {
                this.loadMore();
            }
        });
    },

    resetFilters() {
        this.filters = { search: '', cr: 'all', type: 'all', size: 'all' };
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
                // Load from unified entity system
                this.cachedItems = await DataModule.getEntities('monster', user.uid, user.email);
            }
        } catch (error) {
            console.error("Erro ao carregar monstros:", error);
            this.cachedItems = [];
        }
    },

    applyFilters() {
        const { search, cr, type, size } = this.filters;

        this.filteredItems = this.cachedItems.filter(m => {
            const matchesSearch = (m.name || '').toLowerCase().includes(search);

            // Support both new (bio.cr) and legacy (cr, secoes.ND) format
            const monsterCR = m.bio?.cr || m.cr || m.secoes?.ND || '0';
            let matchesCR = cr === 'all';
            if (!matchesCR) {
                if (cr === '10+') matchesCR = parseFloat(monsterCR) >= 10;
                else if (cr === '20+') matchesCR = parseFloat(monsterCR) >= 20;
                else matchesCR = monsterCR.toString() === cr;
            }

            const monsterType = (m.bio?.creature_type || m.type || m.secoes?.Tipo || '').toLowerCase();
            const matchesType = type === 'all' || monsterType.includes(type.toLowerCase());

            const sizeMap = {
                'tiny': 'miúdo', 'small': 'pequeno', 'medium': 'médio',
                'large': 'grande', 'huge': 'enorme', 'gargantuan': 'imenso'
            };
            const monsterSize = (m.bio?.size || m.size || m.secoes?.Tamanho || 'Médio').toLowerCase().trim();
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
        // Support both new (bio.cr) and legacy format
        const crLabel = monster.bio?.cr || monster.cr || monster.secoes?.ND || '0';
        const typeLabel = monster.bio?.creature_type || monster.type || monster.secoes?.Tipo || 'Desconhecido';

        // Show additional stats for new format
        const acLabel = monster.stats?.ac || monster.ac || monster.secoes?.Status?.CA || '';
        const hpLabel = monster.stats?.hp_max || monster.hp || monster.secoes?.Status?.PV || '';

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

        // Show stats row for new format entities
        const statsRow = (acLabel || hpLabel) ? `
            <div class="monster-stats-row">
                ${acLabel ? `<span>CA ${acLabel}</span>` : ''}
                ${hpLabel ? `<span>PV ${hpLabel}</span>` : ''}
            </div>
        ` : '';

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
                            <span class="monster-name">${safeName}</span>
                            <div class="monster-type-label">${safeType}</div>
                            ${statsRow}
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
                    // Open in Entity Sheet for editing
                    EntitySheetModule.openExistingEntity('monster', id);
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
        // Use the new standard entity sheet for both system and personal monsters
        EntitySheetModule.openExistingEntity('monster', id, this.currentSource);
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

            // Use the new entity generator
            const entity = await generateEntity('monster', prompt, persona);

            this.closeModal('monster-ai-prompt-modal');
            
            // Open entity sheet pre-populated with AI data
            EntitySheetModule.openEntityFromAI('monster', entity);
        } catch (error) {
            console.error(error);
            window.app.showAlert("A invocação falhou: " + error.message, "Erro Arcano");
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'INVOCAR CRIAÇÃO';
        }
    },

    closeModal(id) {
        document.getElementById(id)?.classList.add('hidden');
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
            const success = await DataModule.deleteEntity('monster', id, user.uid);
            if (success) {
                // Update local cache immediately to prevent persistence bug
                this.cachedItems = this.cachedItems.filter(m => m.id !== id);
                this.applyFilters();
                
                window.app.showAlert("Criatura banida dos seus registros.", "Banimento Concluído");
                // Optional: fully re-render if needed, but applyFilters() already calls renderList()
                // await this.render(); 
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
