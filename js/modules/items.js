import { ITEMS_DATABASE } from '../items-data.js';
import { NavigationModule } from './navigation.js';

export const ItemsModule = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Search Input
        const searchInput = document.getElementById('items-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterItems(e.target.value);
            });
        }

        // Filter Dropdown (Delegated or Direct)
        const filterSelect = document.getElementById('items-filter-type');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilterType = e.target.value;
                this.filterItems(document.getElementById('items-search')?.value || '');
            });
        }
    },

    currentFilterType: 'all',

    render(containerId = 'items-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Initial render with all items (or filtered if state exists)
        this.filterItems('');
    },

    filterItems(queryTerm) {
        const container = document.getElementById('items-grid');
        const emptyState = document.getElementById('items-empty-state');
        if (!container) return;

        const system = localStorage.getItem('lyra_current_system') || 'dnd5e';
        const allItems = ITEMS_DATABASE[system] || [];

        const normalizedQuery = queryTerm.toLowerCase().trim();

        const filtered = allItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(normalizedQuery) ||
                (item.description && item.description.toLowerCase().includes(normalizedQuery));

            const matchesType = this.matchTypeFilter(item, this.currentFilterType);

            return matchesSearch && matchesType;
        });

        // Determine if Lyra or Damien theme for specific styles
        const isDamien = document.body.classList.contains('damien-theme');

        if (filtered.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            container.innerHTML = filtered.map(item => this.createItemCard(item)).join('');
        }
    },

    matchTypeFilter(item, filter) {
        if (filter === 'all') return true;
        if (filter === 'weapon') return item.type === 'weapon';
        if (filter === 'armor') return item.type === 'armor';
        if (filter === 'wondrous') return item.type === 'wondrous';

        // Subtype matches (simple check)
        if (filter === 'potion') return item.subtype === 'pocao';
        if (filter === 'ring') return item.subtype === 'anel';

        return true;
    },

    createItemCard(item) {
        // EXACT match of the Dashboard .action-card style (160x160 button > i + span)
        const iconClass = this.getItemIcon(item);
        const rarityClass = `rarity-${item.rarity || 'common'}`;

        return `
            <button class="action-card ${rarityClass}" onclick="ItemsModule.openItemDetail('${item.id}')">
                <i class="${iconClass}"></i>
                <span>${item.name}</span>
            </button>
        `;
    },

    openItemDetail(itemId) {
        const system = localStorage.getItem('lyra_current_system') || 'dnd5e';
        const item = ITEMS_DATABASE[system]?.find(i => i.id === itemId);
        if (!item) return;

        const modalWrapper = document.getElementById('modal-wrapper');
        const detailContainer = document.getElementById('detail-container');
        const modalBody = document.getElementById('modal-body');

        if (modalWrapper && detailContainer) {
            modalWrapper.classList.remove('hidden');
            modalWrapper.classList.add('active'); // active usually triggers CSS transitions

            // Surgical Hiding: Hide only the sibling container inside the modal
            if (modalBody) modalBody.classList.add('hidden');

            detailContainer.classList.remove('hidden');
            detailContainer.innerHTML = this.renderDetailContent(item);
        }
    },

    renderDetailContent(item) {
        const iconClass = this.getItemIcon(item);
        const typeLabel = this.formatType(item.subtype || item.type);

        // Stats for the grid
        let statsGrid = '';
        if (item.damage) statsGrid += `<div class="detail-stat"><strong>Dano</strong><span>${item.damage}</span></div>`;
        if (item.ac) statsGrid += `<div class="detail-stat"><strong>CA</strong><span>${item.ac}</span></div>`;
        if (item.weight) statsGrid += `<div class="detail-stat"><strong>Peso</strong><span>${item.weight}</span></div>`;
        if (item.cost) statsGrid += `<div class="detail-stat"><strong>Preço</strong><span>${item.cost}</span></div>`;
        if (item.rarity) statsGrid += `<div class="detail-stat"><strong>Raridade</strong><span class="rarity-text ${item.rarity}">${this.translateRarity(item.rarity)}</span></div>`;

        // Tags
        const badges = (item.properties || []).map(p => `<span class="detail-badge">${p}</span>`).join('');

        return `
            <div class="item-detail-view">
                <div class="detail-top-section">
                    <div class="detail-icon-large ${item.rarity || 'common'}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="detail-header-info">
                        <h2>${item.name}</h2>
                        <div class="detail-subtitle">${typeLabel}</div>
                    </div>
                </div>

                <div class="detail-stats-container">
                    ${statsGrid}
                </div>

                ${badges ? `<div class="detail-badges-container">${badges}</div>` : ''}

                <div class="detail-divider"></div>

                <div class="detail-description">
                    <h3>Descrição</h3>
                    <p>${item.description}</p>
                </div>

                <div class="detail-actions">
                    <button class="medieval-btn" onclick="ItemsModule.closeModal()">Fechar</button>
                    <!-- Future: <button class="medieval-btn secondary">Pegar</button> -->
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
        if (item.subtype?.includes('pocao')) return 'fas fa-flask';
        if (item.subtype?.includes('anel')) return 'fas fa-ring';
        if (item.subtype === 'escudo') return 'fas fa-shield-halved';
        if (item.type === 'armor') return 'fas fa-shirt'; // Or vest
        if (item.subtype?.includes('cac')) return 'fas fa-khanda'; // Melee
        if (item.subtype?.includes('dist')) return 'fas fa-bow-arrow'; // Ranged (generic fallback font awesome) checks needed
        if (item.name.toLowerCase().includes('arco')) return 'fas fa-bullseye';
        if (item.name.toLowerCase().includes('besta')) return 'fas fa-crosshairs';
        if (item.type === 'weapon') return 'fas fa-sword';
        if (item.type === 'wondrous') return 'fas fa-gem';
        return 'fas fa-box';
    },

    formatType(type) {
        const map = {
            'simples_cac': 'Simples (C-a-C)',
            'simples_dist': 'Simples (Distância)',
            'marcial_cac': 'Marcial (C-a-C)',
            'marcial_dist': 'Marcial (Distância)',
            'leve': 'Leve',
            'media': 'Média',
            'pesada': 'Pesada',
            'escudo': 'Escudo',
            'pocao': 'Poção',
            'maravilhoso': 'Item Maravilhoso',
            'varinha': 'Varinha',
            'anel': 'Anel'
        };
        return map[type] || type;
    }
};
