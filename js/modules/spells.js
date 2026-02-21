
import * as DataModule from '../data.js';
import { generateSpell } from '../ai.js';
import { sanitizeHTML as escapeHTML, translateFirebaseError } from './utils.js';
import { SUPPORTED_SYSTEMS } from '../constants.js';
import { auth } from '../auth.js';
import { SettingsModule } from './settings.js';
import { NavigationModule } from './navigation.js';
import { logger } from '../logger.js';

export const SpellModule = {
    allSpells: [],
    filteredSpells: [],
    currentSource: 'system', // 'system' or 'personal'
    isLoading: false,
    filters: {
        search: '',
        level: 'all',
        class: 'all',
        school: 'all'
    },
    schoolIcons: {
        'abjuracao': 'assets/icons/schools/abjuration.png',
        'adivinhacao': 'assets/icons/schools/divination.png',
        'conjuracao': 'assets/icons/schools/conjuration.png',
        'encantamento': 'assets/icons/schools/enchantment.png',
        'evocacao': 'assets/icons/schools/evocation.png',
        'ilusao': 'assets/icons/schools/illusion.png',
        'necromancia': 'assets/icons/schools/necromancy.png',
        'transmutacao': 'assets/icons/schools/transmutation.png'
    },

    getSchoolIcon(school) {
        if (!school) return 'fa-scroll';
        const norm = school.toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ç/g, 'c');

        return this.schoolIcons[norm] || '';
    },

    async init() {
        this.bindEvents();
    },

    bindEvents() {

        document.querySelectorAll('#grimorio-selection .selection-card[data-source]').forEach(card => {
            card.addEventListener('click', () => {
                const source = card.dataset.source;
                logger.info(`[Grimoire] Selecionado: ${source}`);
                this.currentSource = source;
                if (window.app) {
                    window.app.switchView('grimorio');
                }
            });
        });

        document.getElementById('back-to-spell-selection')?.addEventListener('click', () => {
            // Go back to selection
            NavigationModule.switchView('grimorio-selection', {});
        });

        document.getElementById('spell-new-btn')?.addEventListener('click', () => {
            document.getElementById('spell-creation-choice-modal').classList.remove('hidden');
        });

        document.getElementById('spell-choice-manual')?.addEventListener('click', () => {
            document.getElementById('spell-creation-choice-modal').classList.add('hidden');
            this.openCreatorModal();
        });

        document.getElementById('spell-choice-ai')?.addEventListener('click', () => {
            document.getElementById('spell-creation-choice-modal').classList.add('hidden');
            this.openAIPrompt();
        });

        document.getElementById('close-spell-choice-modal')?.addEventListener('click', () => {
            document.getElementById('spell-creation-choice-modal').classList.add('hidden');
        });

        document.getElementById('close-spell-ai-prompt')?.addEventListener('click', () => {
            document.getElementById('spell-ai-prompt-modal').classList.add('hidden');
        });

        document.getElementById('confirm-spell-generation-btn')?.addEventListener('click', () => {
            this.handleAIRequest();
        });

        document.getElementById('close-spell-creator')?.addEventListener('click', () => {
            document.getElementById('spell-creator-modal').classList.add('hidden');
        });

        document.getElementById('spell-creator-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateSpell();
        });

        const searchInput = document.getElementById('spell-search');
        const levelFilter = document.getElementById('spell-level-filter');
        const classFilter = document.getElementById('spell-class-filter');
        const schoolFilter = document.getElementById('spell-school-filter');

        searchInput?.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        levelFilter?.addEventListener('change', (e) => {
            this.filters.level = e.target.value;
            this.applyFilters();
        });

        classFilter?.addEventListener('change', (e) => {
            this.filters.class = e.target.value;
            this.applyFilters();
        });

        schoolFilter?.addEventListener('change', (e) => {
            this.filters.school = e.target.value;
            this.applyFilters();
        });

        // Sharing Modal
        document.getElementById('close-share-modal')?.addEventListener('click', () => {
            document.getElementById('share-item-modal').classList.add('hidden');
            this.spellToShare = null;
        });

        document.getElementById('confirm-share-btn')?.addEventListener('click', async () => {
            if (this.spellToShare) {
                await this.handleShareConfirm();
            }
        });
    },

    async loadGrimoire(source = 'system') {
        const user = auth.currentUser;
        if (source === 'personal' && !user) {
            alert("Você precisa estar logado para acessar seu grimório pessoal.");
            return;
        }

        this.currentSource = source;

        const titleEl = document.getElementById('grimoire-title');
        const newBtn = document.getElementById('spell-new-btn');
        const container = document.getElementById('spells-grid');



        if (titleEl) {
            if (this.currentSource === 'system') {
                const system = SUPPORTED_SYSTEMS.find(s => s.id === window.app.currentSystem);
                titleEl.innerHTML = `<i class="fas fa-book-journal-whills"></i> Grimório do Sistema (${system?.name || 'D&D 5e'})`;
            } else {
                titleEl.innerHTML = `<i class="fas fa-book-reader"></i> Meu Grimório Pessoal`;
            }
        }

        if (newBtn) {
            if (this.currentSource === 'personal') {
                newBtn.classList.remove('hidden');
                newBtn.style.display = 'inline-flex';
            } else {
                newBtn.classList.add('hidden');
                newBtn.style.display = 'none';
            }
        }

        container.innerHTML = '<div class="loading-quill"><i class="fas fa-quill fa-spin"></i> Consultando a Trama...</div>';

        try {
            let rawSpells = [];
            if (source === 'system') {
                rawSpells = await DataModule.getSpells(window.app.currentSystem);
            } else {
                rawSpells = await DataModule.getUserSpells(user.uid, user.email);
            }

            this.allSpells = rawSpells.sort((a, b) => {
                if (a.level !== b.level) return a.level - b.level;
                return a.name.localeCompare(b.name);
            });

            this.applyFilters();
        } catch (error) {
            logger.error("Erro ao carregar grimório:", error);
            const msg = translateFirebaseError(error);
            container.innerHTML = `<p class="empty-state">${msg}</p>`;
        }
    },

    applyFilters() {
        this.filteredSpells = this.allSpells.filter(spell => {
            const matchesSearch = spell.name.toLowerCase().includes(this.filters.search) ||
                (spell.description || '').toLowerCase().includes(this.filters.search);

            const matchesLevel = this.filters.level === 'all' || spell.level.toString() === this.filters.level;

            const spellClasses = (Array.isArray(spell.classes) ? spell.classes : (spell.classes || '').split(/,\s*/));
            const activeClassFilter = (this.filters.class === 'Guarda') ? 'Patrulheiro' : this.filters.class;

            const matchesClass = this.filters.class === 'all' ||
                spellClasses.some(c => c.trim().toLowerCase() === activeClassFilter.toLowerCase());

            const matchesSchool = this.filters.school === 'all' || (spell.school || '').toLowerCase() === this.filters.school.toLowerCase();

            return matchesSearch && matchesLevel && matchesClass && matchesSchool;
        });

        this.renderSpells();
    },

    renderSpells() {
        const container = document.getElementById('spells-grid');
        if (!container) return;

        if (this.filteredSpells.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card">
                    <i class="fas fa-skull empty-skull-icon"></i>
                    <div class="empty-text-overlay">
                        <i class="fas fa-search-minus"></i>
                        <p>Nenhum feitiço encontrado.</p>
                    </div>
                </div>
            `;
            return;
        }

        const html = this.filteredSpells.map(spell => {
            const iconPath = this.getSchoolIcon(spell.school);
            const levelLabel = spell.level === 0 ? 'T' : spell.level;

            const iconHtml = iconPath
                ? `<img src="${iconPath}" alt="${spell.school}" class="school-icon-img" onerror="this.src='assets/icons/scroll.png'">`
                : `<i class="fa-solid fa-scroll"></i>`;

            const isUserSpell = this.currentSource === 'personal';
            let actionButtons = '';

            if (isUserSpell && spell.isOwner) {
                actionButtons = `
                    <div class="card-actions">
                        <button class="action-btn share-btn" title="Compartilhar"><i class="fas fa-share-nodes"></i></button>
                        <button class="action-btn edit-btn" title="Editar"><i class="fas fa-pen-to-square"></i></button>
                        <button class="action-btn delete-btn" title="Excluir"><i class="fas fa-trash-can"></i></button>
                    </div>
                `;
            }

            return `
                <div class="item-card-wrapper">
                    <div class="item-card spell-card" data-id="${spell.id}">
                        <div class="spell-level-corner">${levelLabel}</div>
                        ${actionButtons}
                        <button class="gallery-card" onclick="SpellModule.viewSpell('${spell.id}')">
                             <div class="spell-icon-wrapper">
                                ${iconHtml}
                            </div>
                            <div class="spell-info">
                                <span>${escapeHTML(spell.name)}</span>
                                <div class="spell-school-label">${escapeHTML(spell.school || 'Magia')}</div>
                            </div>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        // Add event listeners for dynamic buttons
        if (this.currentSource === 'personal') {
            container.querySelectorAll('.share-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = e.target.closest('.spell-card').dataset.id;
                    this.openShareModal(id);
                });
            });

            container.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = e.target.closest('.spell-card').dataset.id;
                    this.openEditModal(id);
                });
            });

            container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = e.target.closest('.spell-card').dataset.id;
                    this.handleDeleteSpell(id, e);
                });
            });
        }
    },

    openCreatorModal(prefilledData = null) {
        this.editingSpellId = null;
        const modal = document.getElementById('spell-creator-modal');
        const form = document.getElementById('spell-creator-form');
        const titleEl = modal.querySelector('.modal-title');
        const submitBtn = modal.querySelector('button[type="submit"]');

        if (form) form.reset();

        if (prefilledData) {
            document.getElementById('create-spell-name').value = prefilledData.name || '';
            document.getElementById('create-spell-level').value = prefilledData.level || 0;
            document.getElementById('create-spell-school').value = prefilledData.school || '';
            document.getElementById('create-spell-time').value = prefilledData.casting_time || prefilledData.castingTime || '';
            document.getElementById('create-spell-range').value = prefilledData.range || '';
            document.getElementById('create-spell-duration').value = prefilledData.duration || '';
            document.getElementById('create-spell-components').value = prefilledData.components || '';
            document.getElementById('create-spell-classes').value = Array.isArray(prefilledData.classes) ? prefilledData.classes.join(', ') : (prefilledData.classes || '');
            document.getElementById('create-spell-desc').value = prefilledData.description || '';
        }

        if (titleEl) {
            titleEl.innerHTML = `<i class="fas fa-scroll"></i> Escrivaninha de Magias`;
        }
        if (submitBtn) {
            submitBtn.textContent = 'Inscrever Magia';
        }

        modal.classList.remove('hidden');
    },

    openEditModal(spellId) {
        const spell = this.allSpells.find(s => s.id === spellId);
        if (!spell) return;

        this.editingSpellId = spellId;
        this.openCreatorModal(spell);

        const modal = document.getElementById('spell-creator-modal');
        const titleEl = modal.querySelector('.modal-title');
        const submitBtn = modal.querySelector('button[type="submit"]');

        if (titleEl) titleEl.innerHTML = `<i class="fas fa-pen-fancy"></i> Alterando Pergaminho`;
        if (submitBtn) submitBtn.textContent = 'Salvar Alterações';
    },

    openAIPrompt() {
        const promptInput = document.getElementById('ai-spell-prompt');
        if (promptInput) promptInput.value = '';

        document.getElementById('spell-ai-prompt-modal').classList.remove('hidden');
    },

    async handleAIRequest() {
        const prompt = document.getElementById('ai-spell-prompt').value;
        if (!prompt.trim()) {
            alert("Por favor, descreva a magia que deseja invocar.");
            return;
        }

        const btn = document.getElementById('confirm-spell-generation-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invocando...';

        try {
            const user = auth.currentUser;
            const idToken = await user.getIdToken();
            const persona = window.app?.currentThemeName || 'lyra';

            const { generateSpell } = await import('../ai.js');
            const spell = await generateSpell(prompt, persona, idToken);

            document.getElementById('spell-ai-prompt-modal').classList.add('hidden');
            this.openCreatorModal(spell); // Fill the form with AI data
        } catch (error) {
            logger.error("Erro no SpellModule:", error);
            alert("A magia falhou: " + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Invocar Magia';
        }
    },

    async handleCreateSpell() {
        const user = auth.currentUser;
        if (!user) {
            alert("Você precisa estar logado.");
            return;
        }

        const name = document.getElementById('create-spell-name').value;
        const level = parseInt(document.getElementById('create-spell-level').value);
        const school = document.getElementById('create-spell-school').value;
        const castingTime = document.getElementById('create-spell-time').value;
        const range = document.getElementById('create-spell-range').value;
        const duration = document.getElementById('create-spell-duration').value;
        const components = document.getElementById('create-spell-components').value;
        const classesRaw = document.getElementById('create-spell-classes').value;
        const description = document.getElementById('create-spell-desc').value;

        const classes = classesRaw ? classesRaw.split(',').map(c => c.trim()) : [];

        const spellData = {
            name, level, school, castingTime, range, duration, components, classes, description,
            systemId: window.app.currentSystem
        };

        const btn = document.querySelector('#spell-creator-form button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-quill fa-spin"></i> Inscrevendo...';
        }

        try {
            // Close the creator modal immediately to show the inscription animation
            document.getElementById('spell-creator-modal').classList.add('hidden');
            this.openInscription();

            const nickname = SettingsModule.currentPrefs?.nickname || user.displayName || 'Aventureiro';
            spellData.createdByNickname = nickname;

            if (this.editingSpellId) {
                await DataModule.updateUserSpell(this.editingSpellId, spellData);
                this.editingSpellId = null;
            } else {
                await DataModule.saveUserSpell(user.uid, user.email, spellData);
            }

            // Reload and Render
            await this.loadGrimoire('personal');

            this.showInscriptionSuccess();

        } catch (error) {
            logger.error("Erro ao salvar magia:", error);
            this.showInscriptionError("Erro ao inscrever: " + error.message);

            // Re-open creator modal if failed? Or just show error on overlay. 
            // The Item module shows error on overlay.
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Inscrever Magia'; // Reset button text
            }
        }

    },

    async handleDeleteSpell(spellId, event) {
        event?.stopPropagation();

        const confirmed = await window.app.showConfirm(
            "Deseja realmente apagar esta inscrição de seu grimório? A sabedoria contida poderá ser perdida para sempre.",
            "Sentença de Esquecimento"
        );
        if (!confirmed) return;

        const user = auth.currentUser;
        if (await DataModule.deleteUserSpell(spellId, user.uid, user.email)) {
            this.allSpells = this.allSpells.filter(s => s.id !== spellId);
            this.applyFilters();
            window.app.showAlert("O feitiço foi removido de seu grimório.", "Esquecimento Concluído");
        } else {
            window.app.showAlert("Você não pode apagar este feitiço.", "Vínculo Inquebrável");
        }
    },

    openShareModal(spellId) {
        this.spellToShare = spellId;
        const modal = document.getElementById('share-item-modal');
        const title = modal.querySelector('.modal-title');
        const p = modal.querySelector('p');

        if (title) title.innerHTML = `<i class="fas fa-share-nodes"></i> Compartilhar Magia`;
        if (p) p.innerText = "Informe o Apelido Arcano do mago para partilhar este conhecimento:";

        modal.classList.remove('hidden');
    },

    async handleShareConfirm() {
        // We reuse the 'share-target-email' input ID for now, just changing the label
        const nickname = document.getElementById('share-target-email').value;
        if (!nickname) return;

        try {
            // shareSpell was updated to expect a nickname
            await DataModule.shareSpell(this.spellToShare, nickname);
            window.app.showAlert(`O pergaminho foi enviado para o mago ${nickname}!`, "Partilha Concluída");
            document.getElementById('share-item-modal').classList.add('hidden');
            document.getElementById('share-target-email').value = '';
            this.spellToShare = null;
        } catch (error) {
            alert(error.message);
        }
    },
    openInscription() {
        const overlay = document.getElementById('inscription-overlay');
        if (!overlay) return;

        const container = overlay.querySelector('.inscription-container');
        if (container) {
            container.classList.remove('success');
            container.classList.remove('error');
        }

        const successContent = overlay.querySelector('.inscription-success-content');
        if (successContent) successContent.classList.add('hidden');

        const errorContent = overlay.querySelector('.inscription-error-content');
        if (errorContent) errorContent.classList.add('hidden');

        const status = overlay.querySelector('.inscription-status');
        if (status) status.classList.remove('hidden');

        overlay.classList.remove('hidden');

        // Reset icon
        const iconEl = overlay.querySelector('.inscription-center-icon');
        if (iconEl) {
            iconEl.className = 'fas fa-quill inscription-center-icon';
        }
    },

    showInscriptionSuccess() {
        const overlay = document.getElementById('inscription-overlay');
        if (!overlay) return;

        const container = overlay.querySelector('.inscription-container');
        const successContent = overlay.querySelector('.inscription-success-content');
        const status = overlay.querySelector('.inscription-status');

        if (status) status.classList.add('hidden');
        if (container) container.classList.add('success');
        if (successContent) successContent.classList.remove('hidden');

        // Update icon to scroll
        const iconEl = overlay.querySelector('.inscription-center-icon');
        if (iconEl) {
            iconEl.className = 'fas fa-scroll inscription-center-icon';
        }
    },

    showInscriptionError(message) {
        const overlay = document.getElementById('inscription-overlay');
        if (!overlay) return;

        const container = overlay.querySelector('.inscription-container');
        const status = overlay.querySelector('.inscription-status');
        const errorContent = overlay.querySelector('.inscription-error-content');
        const msgEl = errorContent?.querySelector('.error-msg');

        if (status) status.classList.add('hidden');
        if (msgEl) msgEl.innerText = message || "A magia se desfez.";
        if (container) container.classList.add('error');
        if (errorContent) errorContent.classList.remove('hidden');

        // Update icon to burst
        const iconEl = overlay.querySelector('.inscription-center-icon');
        if (iconEl) {
            iconEl.className = 'fas fa-burst inscription-center-icon';
        }
    },

    closeInscription() {
        document.getElementById('inscription-overlay').classList.add('hidden');
    },

    async viewSpell(spellId) {
        const spell = this.allSpells.find(s => s.id === spellId);

        if (!spell) return;

        const modalWrapper = document.getElementById('modal-wrapper');
        const detailContainer = document.getElementById('detail-container');
        const modalBody = document.getElementById('modal-body');

        if (modalWrapper && detailContainer) {
            modalWrapper.classList.remove('hidden');
            modalWrapper.classList.add('active'); // Ensure CSS triggers

            if (modalBody) modalBody.classList.add('hidden');

            detailContainer.classList.remove('hidden');

            const iconPath = this.getSchoolIcon(spell.school);
            const levelText = spell.level === 0 ? 'Truque' : `${spell.level}º Nível`;

            const iconHtml = this.getSchoolIcon(spell.school)
                ? `<img src="${this.getSchoolIcon(spell.school)}" class="detail-icon-premium" onerror="this.onerror=null;this.replaceWith(document.createRange().createContextualFragment('<i class=\'fas fa-scroll fa-3x\'></i>'))">`
                : `<i class="fas fa-scroll fa-3x"></i>`;

            detailContainer.innerHTML = `
                <div class="item-detail-view spell-detail-redesign">
                    <div class="detail-header">
                        <div class="detail-icon-large">
                            ${iconHtml}
                        </div>
                        <div class="detail-title-block">
                            <h2>${escapeHTML(spell.name)}</h2>
                            <span class="detail-subtitle">${escapeHTML(spell.school)} | ${levelText}</span>
                        </div>

                    </div>

                    <div class="detail-stats-grid">
                        <div class="detail-stat">
                            <strong>Conjuramento</strong>
                            <span>${escapeHTML(spell.castingTime || spell.casting_time || '-')}</span>
                        </div>
                        <div class="detail-stat">
                            <strong>Alcance</strong>
                            <span>${escapeHTML(spell.range || '-')}</span>
                        </div>
                        <div class="detail-stat">
                            <strong>Duração</strong>
                            <span>${escapeHTML(spell.duration || '-')}</span>
                        </div>
                        <div class="detail-stat">
                            <strong>Componentes</strong>
                            <span>${escapeHTML(spell.components || '-')}</span>
                        </div>
                    </div>

                    ${spell.material ? `
                        <div class="spell-material-box">
                            <i class="fas fa-gem"></i>
                            <p><strong>Materiais:</strong> <em>${escapeHTML(spell.material)}</em></p>
                        </div>
                    ` : ''}

                    <div class="detail-description">
                        <h3>Efeito Arcano</h3>
                        <div class="spell-description-content">
                            ${(spell.description || '').split('\n').map(p => p.trim() ? `<p>${escapeHTML(p)}</p>` : '').join('')}
                        </div>
                    </div>

                    <div class="detail-badges" style="margin-top: 1rem;">
                        <span class="detail-badge"><i class="fas fa-users"></i> ${escapeHTML((spell.classes || []).join(', '))}</span>
                    </div>

                </div>
            `;
        }
    }
};

window.SpellModule = SpellModule; 
