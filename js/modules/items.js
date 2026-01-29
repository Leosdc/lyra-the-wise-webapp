import * as DataModule from '../data.js';
import { NavigationModule } from './navigation.js';
import { auth } from '../auth.js';
import { SettingsModule } from './settings.js';

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
                this.openCreatorModal();
            });
        }

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

            // Re-bind click events for share/delete if personal
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
                        if (confirm('Deseja realmente destruir esta relíquia? Esta ação não pode ser desfeita.')) {
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
                    <button class="action-btn edit-btn" title="Editar"><i class="fas fa-pen-to-square"></i></button>
                    <button class="action-btn delete-btn" title="Excluir"><i class="fas fa-trash-can"></i></button>
                </div>
            `;
        }

        return `
            <div class="item-card item-card-wrapper" style="position:relative;" data-id="${item.id}">
                ${actionButtons}
                <button class="action-card ${rarityClass}" onclick="ItemsModule.openItemDetail('${item.id}')">
                    <i class="${iconClass}"></i>
                    <span>${item.name}</span>
                </button>
            </div>
        `;
    },

    openCreatorModal() {
        this.editingItemId = null;
        const modal = document.getElementById('item-creator-modal');
        const form = document.getElementById('item-creator-form');
        const titleEl = modal.querySelector('.modal-title');
        const submitBtn = modal.querySelector('button[type="submit"]');

        if (form) form.reset();

        // Reset dynamic fields to default (weapon display)
        this.toggleCreatorFields('weapon');

        if (titleEl) {
            const icon = this.currentSource === 'system' ? 'fas fa-gem' : 'fas fa-hammer';
            const text = this.currentSource === 'system' ? 'Contribuição ao Sistema' : 'Forja de Relíquias';
            titleEl.innerHTML = `<i class="${icon}"></i> ${text}`;
        }

        if (submitBtn) submitBtn.textContent = 'Forjar Item';

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

        // Fill fields
        document.getElementById('create-item-name').value = item.name || '';
        document.getElementById('create-item-type').value = item.type || 'weapon';
        document.getElementById('create-item-rarity').value = item.rarity || 'common';
        document.getElementById('create-item-weight').value = item.weight || '';
        document.getElementById('create-item-cost').value = item.cost || '';
        document.getElementById('create-item-damage').value = item.damage || '';
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
        const ac = document.getElementById('create-item-ac').value;
        const propsRaw = document.getElementById('create-item-props').value;
        const description = document.getElementById('create-item-desc').value;

        // Parse properties
        const properties = propsRaw ? propsRaw.split(',').map(p => p.trim()).filter(p => p) : [];

        try {
            const nickname = SettingsModule.currentPrefs?.nickname || user.displayName || 'Aventureiro Misterioso';
            const itemPayload = {
                name, type, rarity, description,
                weight, cost, damage, ac, properties,
                createdByNickname: nickname,
                systemId: localStorage.getItem('lyra_current_system') || 'dnd5e'
            };

            // Show Forge Overlay
            this.openForge();

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

            document.getElementById('item-creator-modal').classList.add('hidden');
            document.getElementById('item-creator-form').reset();

            // Refresh view
            await this.init(this.currentSource); // Re-fetch items to include new one
        } catch (error) {
            this.closeForge(); // Hide forge if error so user can see alert
            console.error("Erro ao forjar item:", error);

            const isPermissionError = error.code === 'permission-denied' ||
                error.message?.toLowerCase().includes('permission') ||
                error.message?.toLowerCase().includes('insufficient');

            if (isPermissionError) {
                const coll = this.currentSource === 'system' ? 'itens_database' : 'user_items';
                alert(`🧙 ALERTA DE SEGURANÇA: \n\nSeu Firebase bloqueou a escrita na coleção '${coll}'.\n\nIsso acontece porque as Security Rules do seu banco de dados estão configuradas como 'Apenas Leitura' para esta coleção.\n\nPara corrigir, acesse seu Firebase Console e permita 'write' para usuários autenticados.`);
            } else {
                alert("Erro ao forjar o item. Tente novamente.");
            }
        }
    },

    async handleDeleteItem(itemId) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const success = await DataModule.deleteUserItem(itemId, user.uid);
            if (success) {
                // Refresh list
                await this.init(this.currentSource);
            } else {
                alert("Você não tem permissão para destruir este item.");
            }
        } catch (error) {
            console.error("Erro ao deletar item:", error);
            alert("Erro ao destruir o item.");
        }
    },

    openShareModal(itemId) {
        this.itemToShare = itemId;
        document.getElementById('share-item-modal').classList.remove('hidden');
    },

    async handleShareConfirm() {
        const email = document.getElementById('share-target-email').value;
        if (!email) return;

        try {
            await DataModule.shareItem(this.itemToShare, email);
            alert(`Item compartilhado com ${email}!`);
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
        if (container) container.classList.remove('success');

        const successContent = overlay.querySelector('.forge-success-content');
        if (successContent) successContent.classList.add('hidden');

        const status = overlay.querySelector('.forge-status');
        if (status) status.classList.remove('hidden');

        overlay.classList.remove('hidden');
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

        if (container) container.classList.add('success');
        if (successContent) successContent.classList.remove('hidden');
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
        if (item.damage) statsHtml += `< div class="detail-stat" ><strong>Dano</strong><span>${item.damage}</span></div > `;
        if (item.ac) statsHtml += `< div class="detail-stat" ><strong>CA</strong><span>${item.ac}</span></div > `;
        if (item.weight && item.weight !== '-') statsHtml += `< div class="detail-stat" ><strong>Peso</strong><span>${item.weight}</span></div > `;
        if (item.cost && item.cost !== '-') statsHtml += `< div class="detail-stat" ><strong>Preço</strong><span>${item.cost}</span></div > `;
        if (item.rarity) statsHtml += `< div class="detail-stat" ><strong>Raridade</strong><span>${this.translateRarity(item.rarity)}</span></div > `;

        const badges = (item.properties || []).map(p => `< span class="detail-badge" > ${p}</span > `).join('');

        return `
            < div class="item-detail-view" >
                <div class="detail-header">
                    <div class="detail-icon-large">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="detail-title-block">
                        <h2>${item.name}</h2>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="detail-subtitle">${typeLabel}</span>
                            ${item.createdByNickname ? `<span class="detail-owner" style="font-size: 0.8rem; font-style: italic; opacity: 0.8;"><i class="fas fa-hammer" style="font-size: 0.7rem;"></i> Forjado por: ${item.createdByNickname}</span>` : ''}
                        </div>
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
            </div >
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
