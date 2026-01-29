import * as DataModule from '../data.js';
import { NavigationModule } from './navigation.js';

export const ItemsModule = {
    cachedItems: [],
    isLoading: false,
    lastSystem: null,
    currentSource: 'system', // 'system' or 'personal'
    itemToShare: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Selection Panel
        const selectionView = document.getElementById('itens-selection');
        if (selectionView) {
            selectionView.addEventListener('click', (e) => {
                const card = e.target.closest('.selection-card');
                if (!card) return;

                this.currentSource = card.dataset.source;
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

        // Creator Modal
        const newBtn = document.getElementById('items-new-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                NavigationModule.openModal('item-creator-modal');
            });
        }

        const closeCreator = document.getElementById('close-item-creator');
        if (closeCreator) {
            closeCreator.addEventListener('click', () => {
                NavigationModule.closeModal('item-creator-modal');
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
        // This will be called by NavigationModule.switchView if needed
        return {
            loadItems: () => this.render()
        };
    },

    currentFilterType: 'all',

    async render(containerId = 'items-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Reset state
        const searchInput = document.getElementById('items-search');
        if (searchInput) searchInput.value = '';
        this.currentFilterType = 'all';
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.type === 'all'));

        // Update Title according to source
        const title = document.querySelector('#itens .view-header h2');
        if (title) {
            if (this.currentSource === 'system') {
                title.innerHTML = '<i class="fas fa-gem"></i> Galeria de Itens (Sistema)';
            } else {
                title.innerHTML = '<i class="fas fa-hammer"></i> Meus Itens Criados';
            }
        }

        const currentSystem = localStorage.getItem('lyra_current_system') || 'dnd5e';
        await this.loadItemsFromFirebase(currentSystem);
        this.filterItems('');
    },

    async loadItemsFromFirebase(systemId) {
        const container = document.getElementById('items-grid');
        if (container) {
            container.innerHTML = `
                <div class="loading-state-medieval" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--gold);">
                    <i class="fas fa-quill-pan-scroll fa-spin" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <span style="font-family: 'Cinzel', serif; letter-spacing: 2px;">Consultando os Anais...</span>
                </div>
            `;
        }

        this.isLoading = true;

        if (this.currentSource === 'system') {
            this.cachedItems = await DataModule.getGlobalItems(systemId);
        } else {
            // Personal Items
            const user = JSON.parse(sessionStorage.getItem('lyra_user'));
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

            // Re-bind click events for share/delete if personal
            if (this.currentSource === 'personal') {
                container.querySelectorAll('.share-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = e.target.closest('.item-card').dataset.id;
                        this.openShareModal(id);
                    });
                });
            }
        }
    },

    matchTypeFilter(item, filter) {
        if (filter === 'all') return true;

        const normalizedFilter = filter.toLowerCase();

        // Match by type or subtype with translation support
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
        const rarityClass = `rarity-${item.rarity || 'common'}`;

        // Action buttons if personal source and owner
        let actionButtons = '';
        if (this.currentSource === 'personal' && item.isOwner) {
            actionButtons = `
                <div class="card-actions">
                    <button class="action-btn share-btn" title="Compartilhar"><i class="fas fa-share-nodes"></i></button>
                </div>
            `;
        }

        return `
            <div class="item-card-wrapper" style="position:relative;">
                ${actionButtons}
                <button class="action-card ${rarityClass}" onclick="ItemsModule.openItemDetail('${item.id}')">
                    <i class="${iconClass}"></i>
                    <span>${item.name}</span>
                </button>
            </div>
        `;
    },

    async handleCreateItem() {
        const user = JSON.parse(sessionStorage.getItem('lyra_user'));
        if (!user) {
            alert("Você precisa estar logado para forjar itens.");
            return;
        }

        const name = document.getElementById('create-item-name').value;
        const type = document.getElementById('create-item-type').value;
        const rarity = document.getElementById('create-item-rarity').value;
        const description = document.getElementById('create-item-desc').value;

        try {
            await DataModule.saveUserItem(user.uid, user.email, {
                name, type, rarity, description,
                systemId: localStorage.getItem('lyra_current_system') || 'dnd5e'
            });

            NavigationModule.closeModal('item-creator-modal');
            document.getElementById('item-creator-form').reset();

            // If already in personal view, refresh
            if (this.currentSource === 'personal') {
                await this.render();
            } else {
                alert("Item forjado com sucesso! Você pode encontrá-lo em 'Meus Itens'.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao forjar o item. Tente novamente.");
        }
    },

    openShareModal(itemId) {
        this.itemToShare = itemId;
        NavigationModule.openModal('share-item-modal');
    },

    async handleShareConfirm() {
        const email = document.getElementById('share-target-email').value;
        if (!email) return;

        try {
            await DataModule.shareItem(this.itemToShare, email);
            alert(`Item compartilhado com ${email}!`);
            NavigationModule.closeModal('share-item-modal');
            document.getElementById('share-target-email').value = '';
            this.itemToShare = null;
        } catch (error) {
            alert(error.message);
        }
    },

    openItemDetail(itemId) {
        const item = this.cachedItems.find(i => i.id === itemId);
        if (!item) return;

        const modalWrapper = document.getElementById('modal-wrapper');
        const detailContainer = document.getElementById('detail-container');
        const modalBody = document.getElementById('modal-body');

        if (modalWrapper && detailContainer) {
            NavigationModule.openModal('detail-container');
            detailContainer.innerHTML = this.renderDetailContent(item);
        }
    },

    renderDetailContent(item) {
        const iconClass = this.getItemIcon(item);
        const typeLabel = this.formatType(item.subtype || item.type);

        // Compact stats grid
        let statsHtml = '';
        if (item.damage) statsHtml += `<div class="detail-stat"><strong>Dano</strong><span>${item.damage}</span></div>`;
        if (item.ac) statsHtml += `<div class="detail-stat"><strong>CA</strong><span>${item.ac}</span></div>`;
        if (item.weight && item.weight !== '-') statsHtml += `<div class="detail-stat"><strong>Peso</strong><span>${item.weight}</span></div>`;
        if (item.cost && item.cost !== '-') statsHtml += `<div class="detail-stat"><strong>Preço</strong><span>${item.cost}</span></div>`;
        if (item.rarity) statsHtml += `<div class="detail-stat"><strong>Raridade</strong><span>${this.translateRarity(item.rarity)}</span></div>`;

        const badges = (item.properties || []).map(p => `<span class="detail-badge">${p}</span>`).join('');

        return `
            <div class="item-detail-view">
                <div class="detail-header">
                    <div class="detail-icon-large">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="detail-title-block">
                        <h2>${item.name}</h2>
                        <span class="detail-subtitle">${typeLabel}</span>
                    </div>
                </div>

                <div class="detail-stats-grid">
                    ${statsHtml}
                </div>

                ${badges ? `<div class="detail-badges">${badges}</div>` : ''}

                <div class="detail-description">
                    <h3>Crônica do Item</h3>
                    <p>${item.description}</p>
                </div>

                <div class="detail-actions">
                    <button class="medieval-btn small secondary" onclick="ItemsModule.closeModal()">Fechar</button>
                    <button class="medieval-btn small" onclick="alert('Exploração em Alpha: Em breve, este item será adicionado diretamente à sua ficha!')">
                        <i class="fas fa-hand-holding-magic"></i> Reivindicar Tesouro
                    </button>
                </div>
            </div>
        `;
    },

    closeModal() {
        NavigationModule.closeModal();
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
        if (type === 'weapon' || subtype.includes('cac') || subtype.includes('dist')) return 'fas fa-khanda';

        // 🛡️ Armor & Shields (Free)
        if (subtype.includes('escudo') || name.includes('escudo')) return 'fas fa-shield-halved';
        if (type === 'armor' || subtype === 'leve' || subtype === 'media' || subtype === 'pesada') return 'fas fa-shirt';

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
