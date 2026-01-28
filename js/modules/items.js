import * as DataModule from '../data.js';
import { NavigationModule } from './navigation.js';

export const ItemsModule = {
    cachedItems: [],
    isLoading: false,
    lastSystem: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // ... (this stays same, but I need to include it in the replacement chunk)
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
                this.filterItems(document.getElementById('items-search')?.value || '');
            });
        }
    },

    currentFilterType: 'all',

    async render(containerId = 'items-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const searchInput = document.getElementById('items-search');
        if (searchInput) searchInput.value = '';

        const currentSystem = localStorage.getItem('lyra_current_system') || 'dnd5e';
        if (this.cachedItems.length === 0 || this.lastSystem !== currentSystem) {
            await this.loadItemsFromFirebase(currentSystem);
        }

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
        this.cachedItems = await DataModule.getGlobalItems(systemId);
        this.lastSystem = systemId;
        this.isLoading = false;
    },

    filterItems(queryTerm) {
        const container = document.getElementById('items-grid');
        const emptyState = document.getElementById('items-empty-state');
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
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            container.innerHTML = filtered.map(item => this.createItemCard(item)).join('');
        }
    },

    matchTypeFilter(item, filter) {
        if (filter === 'all') return true;

        // Match by type or subtype
        if (item.type === filter) return true;
        if (item.subtype === filter) return true;

        // Special case for 'wondrous' to include magic subtypes if filter is 'wondrous'
        if (filter === 'wondrous' && (item.subtype === 'maravilhoso' || item.subtype === 'anel' || item.subtype === 'varinha')) return true;

        return false;
    },

    createItemCard(item) {
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
        const item = this.cachedItems.find(i => i.id === itemId);
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

        // Specific Weapons
        if (name.includes('espada') || name.includes('rapieira') || name.includes('cimitarra')) return 'fas fa-sword';
        if (name.includes('machado') || name.includes('machadinha')) return 'fas fa-axe';
        if (name.includes('martelo') || name.includes('malho') || name.includes('maul')) return 'fas fa-hammer';
        if (name.includes('arco') || name.includes('besta')) return 'fas fa-bullseye';
        if (name.includes('adaga') || name.includes('faca')) return 'fas fa-dagger';
        if (name.includes('lança') || name.includes('tridente') || name.includes('alabarda') || name.includes('glaive')) return 'fas fa-staff';
        if (name.includes('maça') || name.includes('mangual') || name.includes('clava')) return 'fas fa-mace';
        if (name.includes('dardo')) return 'fas fa-location-arrow'; // Dart
        if (name.includes('funda')) return 'fas fa-circle-dot'; // Sling
        if (name.includes('chicote')) return 'fas fa-ring'; // Whip

        // Armor & Shields
        if (subtype.includes('escudo')) return 'fas fa-shield-halved';
        if (type === 'armor') return 'fas fa-shirt';

        // Magic & Potions
        if (subtype.includes('pocao')) return 'fas fa-flask';
        if (subtype.includes('anel')) return 'fas fa-ring';
        if (subtype.includes('varinha')) return 'fas fa-wand-magic-sparkles';
        if (type === 'wondrous') return 'fas fa-gem';

        return 'fas fa-scroll';
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
