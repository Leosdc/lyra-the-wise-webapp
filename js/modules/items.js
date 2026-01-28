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
        const iconClass = this.getItemIcon(item);
        const rarityClass = `rarity-${item.rarity || 'common'}`;

        let statsHtml = '';
        if (item.damage) statsHtml += `<span class="item-stat"><i class="fas fa-gavel"></i> ${item.damage}</span>`;
        if (item.ac) statsHtml += `<span class="item-stat"><i class="fas fa-shield-alt"></i> CA ${item.ac}</span>`;
        if (item.weight && item.weight !== '-') statsHtml += `<span class="item-stat"><i class="fas fa-weight-hanging"></i> ${item.weight}</span>`;

        // Encode item ID to pass to handler
        return `
            <div class="item-card ${rarityClass}" onclick="ItemsModule.openItemDetail('${item.id}')">
                <div class="item-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="item-info">
                    <h4 class="item-name">${item.name}</h4>
                    <div class="item-meta">
                        <span class="item-type">${this.formatType(item.subtype || item.type)}</span>
                        ${statsHtml}
                    </div>
                </div>
                <div class="item-cost">
                    ${item.cost !== '-' ? item.cost : ''}
                </div>
            </div>
        `;
    },

    openItemDetail(itemId) {
        const system = localStorage.getItem('lyra_current_system') || 'dnd5e';
        const item = ITEMS_DATABASE[system]?.find(i => i.id === itemId);
        if (!item) return;

        const modalWrapper = document.getElementById('modal-wrapper');
        const detailContainer = document.getElementById('detail-container');
        const modalBody = document.getElementById('modal-body'); // Hide other wizards

        if (modalWrapper && detailContainer) {
            // Reset Modal
            modalWrapper.classList.remove('hidden');
            modalWrapper.classList.add('active');

            // Hide other content
            if (modalBody) modalBody.classList.add('hidden'); // Instead of hiding children, hide container if possible, or hide children
            document.querySelectorAll('.wizard-container, .sheet-container').forEach(el => el.classList.add('hidden'));

            detailContainer.classList.remove('hidden');
            detailContainer.innerHTML = this.renderDetailContent(item);
        }
    },

    renderDetailContent(item) {
        const iconClass = this.getItemIcon(item);
        const typeLabel = this.formatType(item.subtype || item.type);

        // Properties Badge
        const badges = (item.properties || []).map(p => `<span class="detail-badge property">${p}</span>`).join('');

        // Main Stats
        let statsGrid = '';
        if (item.damage) statsGrid += `<div class="detail-stat"><strong>Dano</strong><span>${item.damage}</span></div>`;
        if (item.ac) statsGrid += `<div class="detail-stat"><strong>CA</strong><span>${item.ac}</span></div>`;
        if (item.weight) statsGrid += `<div class="detail-stat"><strong>Peso</strong><span>${item.weight}</span></div>`;
        if (item.cost) statsGrid += `<div class="detail-stat"><strong>Preço</strong><span>${item.cost}</span></div>`;
        if (item.rarity) statsGrid += `<div class="detail-stat"><strong>Raridade</strong><span class="rarity-${item.rarity}">${this.translateRarity(item.rarity)}</span></div>`;

        return `
            <div class="item-detail-view">
                <div class="detail-header">
                    <div class="detail-icon-large rarity-${item.rarity || 'common'}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="detail-title-block">
                        <h2>${item.name}</h2>
                        <span class="detail-subtitle">${typeLabel}</span>
                    </div>
                </div>

                <div class="detail-stats-grid">
                    ${statsGrid}
                </div>

                ${badges ? `<div class="detail-badges">${badges}</div>` : ''}

                <div class="detail-divider"></div>

                <div class="detail-description">
                    <h3>Descrição</h3>
                    <p>${item.description}</p>
                </div>

                <div class="detail-actions">
                    <button class="medieval-btn" onclick="document.getElementById('modal-wrapper').classList.add('hidden')">Fechar</button>
                     <button class="medieval-btn secondary" onclick="alert('Em breve: Adicionar ao Personagem')"><i class="fas fa-plus"></i> Pegar</button>
                </div>
            </div>
        `;
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
