/**
 * GMPanelModule (Painel do Mestre) — Barrel
 * Core panel logic, UI rendering, timeline, saga, content linking.
 *
 * Sub-modules:
 *  - gm-session.js  → Session start (manual/AI), context, create/edit modals
 *  - gm-invites.js  → Invitation send/cancel, listener, player sheet view
 */

import { db } from '../auth.js';
import { getAuth } from "firebase/auth";
import {
    collection, addDoc, getDocs, query, where,
    doc, getDoc, updateDoc, onSnapshot, serverTimestamp, setDoc, increment, deleteDoc,
    query as firestoreQuery, updateDoc as firestoreUpdate
} from "firebase/firestore";
import { COLLECTIONS } from '../data.js';

import { createSessionMixin } from './gm-session.js';
import { createInvitesMixin } from './gm-invites.js';
import { WizardModule } from './wizard.js';

export const GMPanelModule = {
    activeSession: null,
    unsubscribeInvites: null,
    unsubscribeAccessRequests: null,
    unsubscribeSession: null,
    isEditing: false,

    init() {
        this.injectHTML();
        window.GMPanelModule = this;
        this.bindEvents();

        // Mixing in sub-modules
        Object.assign(this, createInvitesMixin(this));
        Object.assign(this, createSessionMixin(this));
    },

    /**
     * Toggles a player's inspiration state from the GM Panel.
     * Updates both the character document and the session invite (for mirroring).
     */
    async togglePlayerInspiration(inviteId, charId, currentState) {
        if (!charId) return;
        const newState = !currentState;
        
        try {
            const { updateCharacter } = await import('../data.js');
            // 1. Update character truth
            await updateCharacter(charId, { 'stats.inspiration': newState });
            
            // 2. Update invite mirror
            if (inviteId) {
                await updateDoc(doc(db, "session_invites", inviteId), {
                    inspiration: newState
                });
            }
        } catch (err) {
            console.error("Erro ao alternar inspiração:", err);
            window.app.showAlert("Falha ao conceder inspiração ao viajante.");
        }
    },

    injectHTML() {
        if (document.getElementById('gm-panel')) return;

        const gmHtml = `
            <!-- Painel do Mestre: Seleção Inicial -->
            <section id="gm-selection" class="view hidden">
                <div class="view-header">
                    <h2><i class="fas fa-desktop"></i> Painel do Mestre</h2>
                    <button class="medieval-btn small secondary" data-action="gm-back-dashboard">
                        <i class="fas fa-arrow-left"></i> Voltar
                    </button>
                </div>
                <div class="selection-grid">
                    <div class="selection-card" data-action="new-journey">
                        <div class="selection-icon"><i class="fas fa-wand-sparkles"></i></div>
                        <div class="selection-info">
                            <h3>Nova Jornada</h3>
                            <p>Abra os portões de uma nova aventura neste sistema.</p>
                        </div>
                    </div>
                    <div class="selection-card" data-target="my-sessions">
                        <div class="selection-icon"><i class="fas fa-book-journal-whills"></i></div>
                        <div class="selection-info">
                            <h3>Meus Registros</h3>
                            <p>Consulte os anais de sessões passadas.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Painel do Mestre: Principal -->
            <section id="gm-panel" class="view hidden">
                <div class="view-header">
                    <h2><i class="fas fa-desktop"></i> Painel do Mestre</h2>
                    <div class="header-actions">
                        <button class="medieval-btn small secondary" data-action="gm-back-selection">
                            <i class="fas fa-arrow-left"></i> Voltar
                        </button>
                    </div>
                </div>

                <div class="gm-panel-container">
                    <aside class="gm-sidebar" id="gm-sidebar-left">
                        <div class="gm-sidebar-content">
                            <div class="gm-search-section">
                                <div class="mini-grid-header">Estado da Crônica</div>
                                <div class="session-sidebar-info">
                                    <div class="gm-status-selector-container">
                                        <div class="gm-status-row">
                                            <select id="gm-session-status-select" class="medieval-select small">
                                                <option value="preparing">🟠 Preparando</option>
                                                <option value="active">🟢 Em Andamento</option>
                                                <option value="completed">📜 Concluída</option>
                                                <option value="archived">🌑 Arquivada</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="session-stats-mini">
                                        <span><i class="fas fa-users"></i> <span id="active-player-count">0</span> Jogadores</span>
                                    </div>
                                    <div class="gm-control-groups">
                                        <div class="control-group-row">
                                            <button class="medieval-btn small" id="toggle-visibility-btn" title="Privacidade"><i class="fas fa-eye-slash"></i> PRIVADO</button>
                                            <button class="medieval-btn small primary" id="save-gm-notes" title="Salvar Anais"><i class="fas fa-save"></i> SALVAR</button>
                                        </div>
                                        <div class="control-group-row">
                                            <button class="medieval-btn small gold-pulse" id="btn-session-summary" title="Resumo do Oráculo"><i class="fas fa-magic"></i> RESUMO</button>
                                            <button class="medieval-btn small secondary" id="btn-prolong-session" title="Expandir Cronologia"><i class="fas fa-expand-arrows-alt"></i> EXPANDIR</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="gm-search-section">
                                <div class="mini-grid-header">Dados da Saga</div>
                                <div id="gm-saga-data" class="saga-data-container">
                                    <div class="saga-item empty"><i class="fas fa-feather-pointed"></i><p>Nenhum dado vinculado ainda.</p></div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main class="gm-main-area">
                        <div id="no-active-session" class="gm-session-info">
                            <i class="fas fa-scroll fa-3x" style="color: var(--gold); margin-bottom: 1rem;"></i>
                            <h3>Nenhuma Temporada Ativa</h3>
                            <p>Invoque uma nova jornada para começar a mestrear.</p>
                            <div class="system-warning" style="margin: 1rem 0; color: var(--gold); font-size: 0.9rem;">
                                <i class="fas fa-info-circle"></i> A sessão será vinculada ao sistema: <strong id="active-system-display">D&D 5e</strong>
                            </div>
                            <button class="medieval-btn" data-action="gm-create-session">
                                <i class="fas fa-wand-sparkles"></i> Iniciar Nova Sessão
                            </button>
                        </div>

                        <div id="active-session-ui" class="gm-session-info hidden">
                            <div class="session-header-flex">
                                <h3 id="active-session-title">Título da Sessão</h3>
                                <button class="medieval-btn icon-only small" id="edit-session-btn" title="Editar Título"><i class="fas fa-pen-fancy"></i></button>
                            </div>
                            <div id="session-summary-container" class="session-summary-container hidden" style="margin-top: 20px;">
                                <div class="medieval-subtitle"><i class="fas fa-feather"></i> RESUMO DA CRÔNICA</div>
                                <textarea id="session-summary-display" class="gm-summary-area" readonly placeholder="O Oráculo ainda não teceu o resumo..."></textarea>
                            </div>
                            <div id="gm-session-start-options" class="gm-session-start-options" style="display: flex; justify-content: center; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
                                <button class="medieval-btn primary large" id="btn-enter-session"><i class="fas fa-door-open"></i> ADENTRAR ATRIUM</button>
                                <button class="medieval-btn primary large" id="btn-enter-vtt" style="background: linear-gradient(135deg, #2d5a27, #4a8c3f); border-color: #5dba50;"><i class="fas fa-map-location-dot"></i> ADENTRAR VTT</button>
                            </div>
                            <div id="gm-timeline-summary" class="gm-timeline-summary hidden">
                                <div class="timeline-header-row">
                                    <div class="medieval-subtitle"><i class="fas fa-hourglass-half"></i> CRONOLOGIA DA SAGA</div>
                                    <div class="timeline-header-actions">
                                        <button class="medieval-btn icon-only small" id="btn-toggle-timeline-edit" title="Editar Cronologia"><i class="fas fa-pen"></i></button>
                                    </div>
                                </div>
                                <div class="timeline-track" id="gm-timeline-track"></div>
                            </div>
                        </div>
                    </main>

                    <aside class="gm-sidebar" id="gm-sidebar-right">
                        <div class="gm-sidebar-header">
                            <h3>Aventureiros</h3>
                            <button class="medieval-btn icon-only" data-action="gm-open-invite" title="Convidar Jogador"><i class="fas fa-user-plus"></i></button>
                        </div>
                        <div class="gm-sidebar-content">
                            <ul class="player-list" id="gm-player-list"></ul>
                            <div class="gm-map-section">
                                <div class="gm-sidebar-header"><h3>MAPA</h3><button class="medieval-btn icon-only" data-action="gm-open-map" title="Configurar Mapa"><i class="fas fa-map"></i></button></div>
                                <div id="gm-map-container" class="gm-map-container"><div class="map-grid-overlay"></div><div class="map-placeholder"><i class="fas fa-compass fa-spin"></i><p>Em breve: Mapas Táticos</p></div></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <!-- GM Modals -->
            <div id="gm-add-content-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal small">
                    <button class="close-modal" data-action="gm-close-add-menu"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-toolbox"></i> Arsenal do Mestre</h2>
                    <div class="parchment-content">
                        <p>O que desejas manifestar nesta jornada?</p>
                        <div class="selection-grid-mini">
                            <div class="selection-card-mini" data-action="gm-open-creator" data-creator-type="npc"><i class="fas fa-user-shield"></i><span>NPC / Monstro</span></div>
                            <div class="selection-card-mini" data-action="gm-open-creator" data-creator-type="treasure"><i class="fas fa-gem"></i><span>Tesouro</span></div>
                            <div class="selection-card-mini" data-action="gm-open-creator" data-creator-type="item"><i class="fas fa-sword"></i><span>Item Mágico</span></div>
                            <div class="selection-card-mini" data-action="gm-open-creator" data-creator-type="encounter"><i class="fas fa-skull-crossbones"></i><span>Encontro</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="gm-session-create-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal small">
                    <button class="close-modal" data-action="gm-close-session-create"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-scroll"></i> Alterar Destino</h2>
                    <div class="parchment-content">
                        <div class="form-group"><label>Título da Saga</label><input type="text" id="gm-new-session-title" class="medieval-input" placeholder="Ex: A Queda de Phandalin"></div>
                        <div class="modal-actions"><button class="medieval-btn primary" id="confirm-new-session-btn"><i class="fas fa-save"></i> Salvar Alterações</button></div>
                    </div>
                </div>
            </div>

            <div id="gm-session-select-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal small allow-overflow">
                    <button class="close-modal" data-action="gm-close-session-select"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-scroll"></i> ESCOLHER CAPÍTULO</h2>
                    <div class="parchment-content">
                        <div class="form-group" style="margin-top: 20px;">
                            <label>Selecione o Destino</label>
                            <div class="custom-select-container" id="gm-session-select-container">
                                <div class="custom-select-trigger" id="gm-session-select-trigger"><span id="gm-session-select-text">Selecione um capítulo...</span><i class="fas fa-chevron-down"></i></div>
                                <div class="custom-select-options-wrapper hidden" id="gm-session-select-options-wrapper">
                                    <div class="custom-select-options" id="gm-session-select-options"></div>
                                </div>
                                <input type="hidden" id="gm-session-select-value">
                            </div>
                        </div>
                        <div class="modal-actions-centered" style="margin-top: 20px;"><button class="medieval-btn gold-pulse" id="gm-session-select-confirm"><i class="fas fa-check"></i> CONFIRMAR TRILHA</button></div>
                    </div>
                </div>
            </div>

            <div id="gm-chapter-detail-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal">
                    <button class="close-modal" data-action="gm-close-chapter-detail"><i class="fas fa-times"></i></button>
                    <h2 id="gm-chapter-detail-title" class="modal-title"><i class="fas fa-scroll"></i> Detalhes do Capítulo</h2>
                    <div id="gm-chapter-detail-content" class="parchment-content" style="max-height: 70vh; overflow-y: auto;"></div>
                </div>
            </div>

            <div id="gm-prolong-session-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal small">
                    <button class="close-modal" data-action="gm-close-prolong"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-expand-arrows-alt"></i> Prolongar Jornada</h2>
                    <div class="parchment-content">
                        <p>Defina como a trama deve se expandir.</p>
                        <div class="form-group"><label>Quantidade de Capítulos (Sessões)</label><input type="number" id="prolong-session-count" class="medieval-input" value="1" min="1" max="5"></div>
                        <div class="form-group">
                            <label>Onde os novos capítulos se encaixam?</label>
                            <select id="prolong-session-position" class="medieval-select">
                                <option value="end">No FIM da atual cronologia</option>
                                <option value="start">No COMEÇO da atual cronologia</option>
                                <option value="middle">No MEIO (entre capítulos)</option>
                            </select>
                        </div>
                        <div class="modal-actions-centered"><button class="medieval-btn gold-pulse" data-action="gm-confirm-prolong"><i class="fas fa-wand-magic-sparkles"></i> TECER DESTINO</button></div>
                    </div>
                </div>
            </div>

            <div id="gm-invite-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal small">
                    <button class="close-modal" data-action="gm-close-invite"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-ghost"></i> Convocar Viajante</h2>
                    <div class="parchment-content">
                        <div class="form-group"><label>Identidade Arcana (Nickname ou E-mail)</label><input type="text" id="invite-email-input" class="medieval-input" placeholder="Ex: Gandalf ou heroi@reino.com"></div>
                        <div class="modal-actions"><button class="medieval-btn gold-pulse" data-action="gm-send-invite">Enviar Mensageiro</button></div>
                    </div>
                </div>
            </div>

            <div id="gm-manual-session-modal" class="modal-overlay hidden">
                <div class="modal-content medieval-modal small">
                    <button class="close-modal" data-action="gm-close-manual-session"><i class="fas fa-times"></i></button>
                    <h2 class="modal-title"><i class="fas fa-feather-pointed"></i> Nova Sessão Manual</h2>
                    <div class="parchment-content">
                        <div class="form-group"><label>Título da Sessão</label><input type="text" id="manual-session-title" class="medieval-input" placeholder="Ex: A Emboscada na Floresta"></div>
                        <div class="form-group"><label>Descrição / Resumo</label><textarea id="manual-session-desc" class="medieval-textarea" placeholder="Descreva brevemente o que aconteceu nesta sessão..."></textarea></div>
                        <div class="modal-actions-centered"><button class="medieval-btn gold-pulse" data-action="gm-confirm-manual-session"><i class="fas fa-plus"></i> Adicionar à Cronologia</button></div>
                    </div>
                </div>
            </div>

            <!-- VTT Map Modal -->
            <div id="gm-map-modal" class="modal-overlay hidden" style="z-index: 9999;">
                <div class="modal-content medieval-modal large allow-overflow" style="width: 98vw; max-width: 1600px; height: 92vh; padding: 10px; display: flex; flex-direction: column; background: rgba(20, 10, 5, 0.98); border: 2px solid var(--gold); box-shadow: 0 0 30px var(--gold-shadow); margin: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 8px; margin-bottom: 8px;">
                        <h2 class="modal-title" style="margin: 0; font-size: 1.4rem; color: var(--gold);"><i class="fas fa-map-marked-alt"></i> Mapa Tático - Lyra VTT</h2>
                        <button class="close-modal" data-action="gm-close-map" style="position: static; background: none; border: none; color: var(--gold); cursor: pointer; font-size: 1.2rem; margin-right: 10px;"><i class="fas fa-times"></i></button>
                    </div>
                    <div style="flex: 1; display: flex; gap: 12px; overflow: hidden; border-radius: 4px;">
                        <!-- Coluna do VTT Iframe -->
                        <div class="parchment-content" style="flex: 3; padding: 0; overflow: hidden; background: #000; position: relative; border: 1px solid rgba(212, 175, 55, 0.15);">
                            <iframe id="gm-vtt-iframe" src="" style="width: 100%; height: 100%; border: none;" allow="clipboard-read; clipboard-write"></iframe>
                        </div>
                        <!-- Painel Lateral de Controle VTT -->
                        <aside id="gm-vtt-control-sidebar" style="flex: 1; min-width: 280px; max-width: 360px; background: rgba(12, 6, 3, 0.95); border: 1px solid var(--gold); border-radius: 4px; padding: 12px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);">
                            <!-- Conteúdo injetado dinamicamente via JavaScript -->
                        </aside>
                    </div>
                </div>
            </div>
        `;
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('beforeend', gmHtml);
        } else {
            document.body.insertAdjacentHTML('beforeend', gmHtml);
        }
    },

    bindEvents() {
        this.setupEventListeners();
        this.syncMiniMusic();

        // Delegated handler for all data-action clicks in GM panel
        document.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;

            const action = actionEl.dataset.action;
            switch (action) {
                case 'gm-back-dashboard': window.app.switchView('dashboard'); break;
                case 'gm-back-selection': window.app.switchView('gm-selection'); break;
                case 'gm-create-session': this.createNewSession(); break;
                case 'gm-open-invite': this.openInviteModal(); break;
                case 'gm-close-add-menu': this.closeAddMenu(); break;
                case 'gm-open-creator': this.openCreator(actionEl.dataset.creatorType); break;
                case 'gm-close-session-create': this.closeSessionCreateModal(); break;
                case 'gm-close-session-select': this.closeSessionSelectModal(); break;
                case 'gm-close-chapter-detail': document.getElementById('gm-chapter-detail-modal')?.classList.add('hidden'); break;
                case 'gm-close-prolong': this.closeProlongModal(); break;
                case 'gm-confirm-prolong': this.confirmProlongSession(); break;
                case 'gm-close-invite': this.closeInviteModal(); break;
                case 'gm-send-invite': this.sendInvite(); break;
                case 'gm-close-manual-session': document.getElementById('gm-manual-session-modal')?.classList.add('hidden'); break;
                case 'gm-confirm-manual-session': this.confirmManualSession(); break;
                case 'gm-open-map': this.openMapModal(); break;
                case 'gm-close-map': this.closeMapModal(); break;
            }
        });

        // Toggle visibility/privacy
        document.getElementById('toggle-visibility-btn')?.addEventListener('click', () => this.toggleVisibility());

        // Save Story
        document.getElementById('save-gm-notes')?.addEventListener('click', () => this.saveStory());

        // Prolong Session
        document.getElementById('btn-prolong-session')?.addEventListener('click', () => this.prolongSession());

        // Toggle Timeline Edit Mode
        document.getElementById('btn-toggle-timeline-edit')?.addEventListener('click', () => this.toggleTimelineEditMode());

        // Session Summary
        const summaryBtn = document.getElementById('btn-session-summary');
        if (summaryBtn) summaryBtn.addEventListener('click', () => this.generateSessionSummary());

        // Auto-expand Summary Textarea
        const summaryDisplay = document.getElementById('session-summary-display');
        if (summaryDisplay) {
            summaryDisplay.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        }

        // Selection View Logic
        const selectionView = document.getElementById('gm-selection');
        if (selectionView) {
            selectionView.addEventListener('click', (e) => {
                const card = e.target.closest('.selection-card');
                if (!card) return;

                const action = card.dataset.action;
                if (action === 'new-journey') {
                    WizardModule.showSessionWizard(window.app.getWizardContext(), 'manual');
                } else if (action === 'past-records') {
                    window.app.switchView('sessoes');
                }
            });
        }

        // Edit Session Button
        const editBtn = document.getElementById('edit-session-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.openEditSessionModal());
        }

        // Confirm Metadata Update (Edit Title)
        const confirmMetadataBtn = document.getElementById('confirm-new-session-btn');
        if (confirmMetadataBtn) confirmMetadataBtn.addEventListener('click', () => this.confirmMetadataUpdate());

        // Enter Atrium Button (Unified Start/Enter)
        const enterBtn = document.getElementById('btn-enter-session');
        if (enterBtn) {
            enterBtn.addEventListener('click', () => {
                this.openSessionSelectModal('enter');
            });
        }

        // Enter VTT Button (Opens VTT map in new tab)
        const enterVttBtn = document.getElementById('btn-enter-vtt');
        if (enterVttBtn) {
            enterVttBtn.addEventListener('click', () => {
                window.open('vtt/app/index.html', '_blank');
            });
        }

        // Custom Select Trigger
        document.getElementById('gm-session-select-trigger')?.addEventListener('click', () => {
            const container = document.getElementById('gm-session-select-container');
            const wrapper = document.getElementById('gm-session-select-options-wrapper');
            if (container && wrapper) {
                const isOpen = container.classList.toggle('open');
                wrapper.classList.toggle('hidden', !isOpen);
                if (isOpen) {
                    const list = document.getElementById('gm-session-select-options');
                    if (list) window.NavigationModule.updateDropdownScroll(list);
                }
            }
        });

        // Close custom select on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#gm-session-select-container')) {
                document.getElementById('gm-session-select-container')?.classList.remove('open');
                document.getElementById('gm-session-select-options-wrapper')?.classList.add('hidden');
            }
        });

        // Dropdown Scroll Listeners
        const sessionList = document.getElementById('gm-session-select-options');
        if (sessionList) {
            sessionList.addEventListener('scroll', () => window.NavigationModule.updateDropdownScroll(sessionList));
        }

        // Status Selector
        document.getElementById('gm-session-status-select')?.addEventListener('change', (e) => this.updateSessionStatus(e.target.value));
    },

    // --- Status & Story ---
    async updateSessionStatus(newStatus) {
        if (!this.activeSession) return;

        try {
            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            this.activeSession.status = newStatus;
            window.app.showAlert(`Estado da crônica atualizado: ${newStatus}`, "Destino Alterado");
        } catch (err) {
            console.error(err);
            window.app.showAlert("Falha ao atualizar o estado da sessão.");
        }
    },

    prolongSession() {
        const countInput = document.getElementById('prolong-session-count');
        const posSelect = document.getElementById('prolong-session-position');
        if (countInput) countInput.value = "1";
        if (posSelect) posSelect.value = "end";

        const modal = document.getElementById('gm-prolong-session-modal');
        if (modal) modal.classList.remove('hidden');
    },

    closeProlongModal() {
        document.getElementById('gm-prolong-session-modal')?.classList.add('hidden');
    },

    async confirmProlongSession() {
        if (!this.activeSession) return;

        const countInput = document.getElementById('prolong-session-count');
        const posSelect = document.getElementById('prolong-session-position');
        const count = parseInt(countInput?.value || "1");
        const position = posSelect?.value || "end";

        this.closeProlongModal();

        if (isNaN(count) || count <= 0) {
            window.app.showAlert("A quantidade de capítulos deve ser um número positivo.");
            return;
        }

        window.app.toggleLoading(true, "As parcas estão tecendo novos fios...");
        try {
            const { prolongTimelineWithLyra } = await import('../ai.js');
            const newSessions = await prolongTimelineWithLyra(this.activeSession, count, position);

            let updatedTimeline = this.activeSession.fullTimeline || [];
            if (position === 'start') {
                updatedTimeline = [...newSessions, ...updatedTimeline];
            } else if (position === 'middle') {
                const mid = Math.floor(updatedTimeline.length / 2);
                updatedTimeline.splice(mid, 0, ...newSessions);
            } else {
                updatedTimeline = [...updatedTimeline, ...newSessions];
            }

            updatedTimeline.forEach((s, i) => s.session = i + 1);

            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                fullTimeline: updatedTimeline,
                updatedAt: serverTimestamp()
            });

            this.activeSession.fullTimeline = updatedTimeline;
            this.renderTimeline(this.activeSession);
            window.app.showAlert(`${count} Novos capítulos foram registrados na cronologia.`, "Linha do Tempo Expandida");
        } catch (error) {
            console.error(error);
            window.app.showAlert("Falha ao expandir a cronologia: " + error.message);
        } finally {
            window.app.toggleLoading(false);
        }
    },

    async generateSessionSummary() {
        if (!this.activeSession) return;

        window.app.toggleLoading(true, "A Mente Arcana está sintetizando o destino...");
        try {
            const { summarizeSession } = await import('../ai.js');
            const summary = await summarizeSession(this.activeSession);

            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                summary: summary,
                updatedAt: serverTimestamp()
            });

            this.activeSession.summary = summary;
            this.showSummary(summary);
            window.app.showAlert("O resumo da crônica foi atualizado!", "Sucesso");
        } catch (error) {
            console.error(error);
            window.app.showAlert("Falha ao tecer o resumo.");
        } finally {
            window.app.toggleLoading(false);
        }
    },

    showSummary(summary) {
        const container = document.getElementById('session-summary-container');
        const display = document.getElementById('session-summary-display');
        if (container && display && summary) {
            container.classList.remove('hidden');
            display.value = summary;
            display.style.height = 'auto';
            display.style.height = (display.scrollHeight) + 'px';
        }
    },

    async handleAtriumEntry() {
        this.openSessionSelectModal('enter');
    },

    async toggleVisibility() {
        if (!this.activeSession) return;
        const btn = document.getElementById('toggle-visibility-btn');
        const isPublic = this.activeSession.visibility === 'public';
        const newVisibility = isPublic ? 'private' : 'public';

        try {
            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                visibility: newVisibility,
                updatedAt: serverTimestamp()
            });
            this.activeSession.visibility = newVisibility;

            if (btn) {
                btn.innerHTML = newVisibility === 'public' ?
                    '<i class="fas fa-eye"></i> PÚBLICO' :
                    '<i class="fas fa-eye-slash"></i> PRIVADO';
                btn.classList.toggle('secondary', newVisibility === 'private');
            }
            window.app.showAlert(`Sessão agora está ${newVisibility === 'public' ? 'Pública' : 'Privada'}.`);
        } catch (err) {
            console.error(err);
            window.app.showAlert("Falha ao alterar visibilidade.");
        }
    },

    createNewSession() {
        console.log("🕯️ Invocando o Mago do Destino...");
        WizardModule.showSessionWizard(window.app.getWizardContext(), 'manual');
    },

    async saveStory() {
        if (!this.activeSession) return;
        const textArea = document.getElementById('gm-story-editor') || document.getElementById('gm-story-input-central');
        if (!textArea) return;

        const newStory = textArea.value;
        window.app.toggleLoading(true, "Gravando nos anais...");

        try {
            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                story: newStory,
                updatedAt: serverTimestamp()
            });
            this.activeSession.story = newStory;
            window.app.showAlert("História salva com sucesso!", "Anais Atualizados");
        } catch (err) {
            console.error(err);
            window.app.showAlert("Falha ao salvar história.");
        } finally {
            window.app.toggleLoading(false);
        }
    },

    // --- Music ---
    setupEventListeners() {
        const miniBtn = document.getElementById('gm-mini-play-pause');
        if (miniBtn) {
            miniBtn.addEventListener('click', () => this.toggleMiniMusic());
        }

        const mainAudio = document.getElementById('lyra-bg-music');
        if (mainAudio) {
            mainAudio.addEventListener('play', () => this.syncMiniMusicState(true));
            mainAudio.addEventListener('pause', () => this.syncMiniMusicState(false));
        }
    },

    syncMiniMusic() {
        const mainAudio = document.getElementById('lyra-bg-music');
        if (mainAudio) {
            this.syncMiniMusicState(!mainAudio.paused);

            const nowPlaying = document.querySelector('.player-now-playing');
            const nowPlayingMini = document.querySelector('.music-name-mini');
            if (nowPlaying && nowPlayingMini) {
                nowPlayingMini.textContent = nowPlaying.textContent || "Melodia Arcana";
            }
        }
    },

    syncMiniMusicState(isPlaying) {
        const miniBtn = document.getElementById('gm-mini-play-pause');
        if (miniBtn) {
            const icon = miniBtn.querySelector('i');
            if (icon) {
                icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
            }
        }
    },

    toggleMiniMusic() {
        const mainAudio = document.getElementById('lyra-bg-music');
        const mainPlayPauseBtn = document.getElementById('btn-play-pause');

        if (mainAudio && mainPlayPauseBtn) {
            mainPlayPauseBtn.click();
        }
    },

    // --- Panel Loading ---
    async loadPanel(user, systemId) {
        if (!user) return;

        const systemDisplay = document.getElementById('active-system-display');
        if (systemDisplay) {
            const { SUPPORTED_SYSTEMS } = await import('../constants.js');
            const system = SUPPORTED_SYSTEMS.find(s => s.id === systemId);
            systemDisplay.innerText = system ? system.name : systemId.toUpperCase();
        }

        const q = query(
            collection(db, COLLECTIONS.SESSIONS),
            where("userId", "==", user.uid),
            where("systemId", "==", systemId),
            where("status", "in", ["active", "preparing"])
        );

        if (this.unsubscribeInvites) this.unsubscribeInvites();
        if (this.unsubscribeAccessRequests) this.unsubscribeAccessRequests();
        if (this.unsubscribeSession) this.unsubscribeSession();

        this.unsubscribeSession = onSnapshot(q, async (snapshot) => {
            if (!snapshot.empty) {
                // Se uma sessão específica já foi selecionada (ex: clique no card),
                // encontrar essa sessão no snapshot em vez de sempre pegar a primeira.
                let targetDoc = snapshot.docs[0];
                if (this.activeSession?.id) {
                    const found = snapshot.docs.find(d => d.id === this.activeSession.id);
                    if (found) targetDoc = found;
                }
                const sessionData = { id: targetDoc.id, ...targetDoc.data() };
                this.activeSession = sessionData;

                // Ensure GM is a participant (Idempotent)
                const invitesRef = collection(db, "session_invites");
                const selfInviteId = `self_${sessionData.id}_${user.uid}`;
                const selfInviteRef = doc(invitesRef, selfInviteId);
                const selfInviteSnap = await getDoc(selfInviteRef);

                if (!selfInviteSnap.exists()) {
                    console.log("🛠️ GMPanel: Adicionando mestre como participante automático...");
                    await setDoc(selfInviteRef, {
                        sessionId: sessionData.id,
                        email: user.email.toLowerCase(),
                        role: 'gm',
                        status: "online",
                        invitedAt: serverTimestamp(),
                        invitedBy: user.uid,
                        isSelfInvite: true
                    });
                }

                this.displayActiveSession(this.activeSession);

                // AUTO-REPAIR: Sync player count (exclude GM)
                const invitesSnap = await getDocs(query(collection(db, "session_invites"), where("sessionId", "==", sessionData.id)));
                const actualPlayers = invitesSnap.docs.filter(d => {
                    const data = d.data();
                    return data.role !== 'gm' && !d.id.startsWith('self_') && data.userId !== sessionData.userId;
                });
                const count = actualPlayers.length;
                if (count !== sessionData.currentPlayers) {
                    await updateDoc(doc(db, COLLECTIONS.SESSIONS, sessionData.id), { currentPlayers: count });
                }
            } else {
                this.activeSession = null;
                document.body.classList.remove('gm-panel-active');
                document.getElementById('no-active-session')?.classList.remove('hidden');
                document.getElementById('active-session-ui')?.classList.add('hidden');
            }
        }, (err) => {
            console.error("❌ Erro no listener da sessão ativa:", err);
        });
    },

    // --- Display ---
    displayActiveSession(session) {
        document.body.classList.add('gm-panel-active');
        document.getElementById('no-active-session').classList.add('hidden');
        document.getElementById('active-session-ui').classList.remove('hidden');
        document.getElementById('active-session-title').innerText = session.title || "Sessão Sem Título";

        const statusSelect = document.getElementById('gm-session-status-select');
        if (statusSelect) {
            statusSelect.value = session.status || "preparing";
        }


        this.startInviteListener(session.id);
        this.renderSagaData(session);
        this.renderTimeline(session);
        this.showSummary(session.summary);
    },

    showStartOptions() {
        document.getElementById('gm-session-start-options').classList.remove('hidden');
    },

    showStoryArea(storyContent = "") {
        document.getElementById('gm-session-start-options').classList.remove('hidden'); // KEEP BUTTON VISIBLE
    },

    // --- Timeline Edit Mode ---
    isTimelineEditMode: false,
    dragSrcIndex: null,

    toggleTimelineEditMode() {
        this.isTimelineEditMode = !this.isTimelineEditMode;
        const btn = document.getElementById('btn-toggle-timeline-edit');
        const container = document.getElementById('gm-timeline-summary');

        if (btn) {
            btn.innerHTML = this.isTimelineEditMode
                ? '<i class="fas fa-check"></i>'
                : '<i class="fas fa-pen"></i>';
            btn.title = this.isTimelineEditMode ? 'Concluir Edição' : 'Editar Cronologia';
        }

        container?.classList.toggle('edit-mode-active', this.isTimelineEditMode);

        if (this.activeSession) {
            this.renderTimeline(this.activeSession);
        }
    },

    openManualSessionModal() {
        const titleInput = document.getElementById('manual-session-title');
        const descInput = document.getElementById('manual-session-desc');
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        document.getElementById('gm-manual-session-modal')?.classList.remove('hidden');
    },

    async confirmManualSession() {
        if (!this.activeSession) return;

        const title = document.getElementById('manual-session-title')?.value?.trim();
        const desc = document.getElementById('manual-session-desc')?.value?.trim();

        if (!title) {
            window.app.showAlert('Preencha pelo menos o título da sessão.', 'Campo Obrigatório');
            return;
        }

        const timeline = this.activeSession.fullTimeline || [];
        const newEntry = {
            session: timeline.length + 1,
            title: title,
            summary: desc || 'Registrada manualmente pelo mestre.',
            description: desc || '',
            manual: true,
            status: 'pending'
        };

        timeline.push(newEntry);

        // Renumber all sessions
        timeline.forEach((s, i) => s.session = i + 1);

        try {
            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                fullTimeline: timeline,
                updatedAt: serverTimestamp()
            });
            this.activeSession.fullTimeline = timeline;
            this.renderTimeline(this.activeSession);
            document.getElementById('gm-manual-session-modal')?.classList.add('hidden');
            window.app.showAlert('Sessão adicionada à cronologia!', 'Crônica Expandida');
        } catch (err) {
            console.error('Erro ao adicionar sessão manual:', err);
            window.app.showAlert('Falha ao registrar nos anais.', 'Erro');
        }
    },

    vttInvitesUnsubscribe: null,

    openMapModal() {
        const modal = document.getElementById('gm-map-modal');
        const iframe = document.getElementById('gm-vtt-iframe');
        
        if (modal && iframe) {
            modal.classList.remove('hidden');
            iframe.src = '/vtt/app/index.html';
            
            // Inicializa a integração
            import('./vtt-integration.js').then(({ VTTIntegration }) => {
                // Passa o ID da sessão ativa para a integração
                VTTIntegration.init(iframe, this.activeSession?.id);
                
                // Envia dados iniciais da sessão após o carregamento
                VTTIntegration.waitForGame(async (game, scene) => {
                    if (this.activeSession) {
                        // 0. Envia a identidade do jogador (neste caso, o Mestre) para destravar a inicialização da cena
                        try {
                            const auth = getAuth();
                            const user = auth.currentUser;
                            if (user) {
                                VTTIntegration.sendPlayerID(user.uid, true);
                            }
                        } catch (err) {
                            console.error("[Lyra VTT] Erro ao sincronizar a identidade do mestre:", err);
                        }

                        // 1. Carrega o mapa da campanha/sessão
                        const mapUrl = this.activeSession.mapUrl || "/assets/maps/default.jpg";
                        const cellSize = this.activeSession.cellSize || 50;
                        VTTIntegration.loadMap(mapUrl, cellSize);

                        // 1.5. Caso existam variáveis de sessão salvas (vttVariables) no Firebase, reinjeta-as para restaurar o estado do VTT
                        if (this.activeSession.vttVariables) {
                            console.log("[Lyra VTT] Enviando variáveis salvas no Firebase para restaurar o estado do VTT...");
                            VTTIntegration.sendToVTT({
                                type: "LoadSession",
                                content: this.activeSession.vttVariables
                            });
                        }
                        
                        // 2. Conecta um Listener em Tempo Real para os participantes da sessão no Painel de Controle
                        try {
                            const { collection, query, where, onSnapshot } = await import("firebase/firestore");
                            
                            if (this.vttInvitesUnsubscribe) this.vttInvitesUnsubscribe();
                            
                            const q = query(
                                collection(db, "session_invites"),
                                where("sessionId", "==", this.activeSession.id)
                            );
                            
                            this.vttInvitesUnsubscribe = onSnapshot(q, (snapshot) => {
                                const players = snapshot.docs
                                    .map(d => ({ id: d.id, ...d.data() }))
                                    .filter(p => p.role !== 'gm' && !p.id.startsWith('self_'));
                                
                                this.renderVTTControlPanel(players);
                            });
                        } catch (err) {
                            console.error("[Lyra VTT] Erro ao carregar ouvintes de tempo real para participantes:", err);
                        }
                    }
                });
            });
        }
    },

    closeMapModal() {
        const modal = document.getElementById('gm-map-modal');
        const iframe = document.getElementById('gm-vtt-iframe');
        
        if (modal && iframe) {
            modal.classList.add('hidden');
            iframe.src = ''; // Libera recursos/memória do GDevelop
            
            if (this.vttInvitesUnsubscribe) {
                this.vttInvitesUnsubscribe();
                this.vttInvitesUnsubscribe = null;
            }
            
            import('./vtt-integration.js').then(({ VTTIntegration }) => {
                VTTIntegration.destroy();
            });
        }
    },

    renderVTTControlPanel(players) {
        const sidebar = document.getElementById('gm-vtt-control-sidebar');
        if (!sidebar) return;

        const currentCellSize = this.activeSession?.cellSize || 50;

        let playersHtml = "";
        if (players.length === 0) {
            playersHtml = `
                <div style="color: rgba(212, 175, 55, 0.6); text-align: center; font-size: 0.85rem; padding: 20px 0; border: 1px dashed rgba(212, 175, 55, 0.2); border-radius: 4px; background: rgba(0,0,0,0.3);">
                    <i class="fas fa-ghost" style="font-size: 1.6rem; display: block; margin-bottom: 8px; color: rgba(212, 175, 55, 0.4);"></i>
                    Nenhum viajante participante nesta sessão.
                </div>
            `;
        } else {
            players.forEach(p => {
                const labelName = p.characterName || p.nickname || p.displayName || p.email;
                const statusColor = p.status === 'online' ? '#2ecc71' : (p.status === 'accepted' ? '#f1c40f' : '#7f8c8d');
                const statusLabel = p.status === 'online' ? 'Online' : (p.status === 'accepted' ? 'Aceito' : 'Convidado');
                const hasSheet = !!p.characterId;

                playersHtml += `
                    <div style="background: rgba(30, 15, 8, 0.45); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 4px; padding: 10px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">
                        <div style="display: flex; flex-direction: column; overflow: hidden; gap: 2px;">
                            <strong style="color: var(--gold); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${labelName}">${labelName}</strong>
                            <span style="font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); display: flex; align-items: center; gap: 4px;">
                                <span style="width: 5px; height: 5px; border-radius: 50%; background: ${statusColor}; display: inline-block;"></span>
                                ${statusLabel} ${p.nickname ? `(${p.nickname})` : ''}
                            </span>
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button class="medieval-btn small gold-pulse" style="flex: 1; padding: 4px 8px; font-size: 0.75rem; margin: 0; display: flex; justify-content: center; align-items: center; gap: 4px;" 
                                    ${hasSheet ? '' : 'disabled title="Aventureiro não escolheu ficha de personagem ainda"'} 
                                    onclick="GMPanelModule.spawnPlayerToken('${p.characterId || p.id}')">
                                <i class="fas fa-street-view"></i> Invocar Token
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        sidebar.innerHTML = `
            <!-- Seção de Configuração do Tabuleiro/Mapa de Fundo -->
            <div style="border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 14px; display: flex; flex-direction: column; gap: 8px;">
                <div class="medieval-subtitle" style="margin: 0 0 4px 0; font-size: 0.95rem; color: var(--gold); display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-map"></i> Cenário da Grade
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label class="medieval-btn small gold-pulse" style="display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; margin: 0; padding: 6px 12px; font-size: 0.8rem; width: 100%;">
                        <i class="fas fa-cloud-arrow-up"></i> Upload do Mapa
                        <input type="file" id="vtt-map-upload-input" accept="image/*" style="display: none;">
                    </label>
                    <div style="font-size: 0.65rem; color: rgba(212, 175, 55, 0.5); text-align: center;">
                        * Recomendado imagens de até 500KB
                    </div>
                    <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
                        <input type="number" id="vtt-grid-size-input" class="medieval-input small" value="${currentCellSize}" min="20" max="200" style="width: 65px; text-align: center; font-size: 0.8rem; padding: 3px 6px; margin: 0;" title="Tamanho da Grade (px)">
                        <button class="medieval-btn small secondary" id="vtt-apply-grid-btn" style="flex: 1; padding: 4px 8px; font-size: 0.75rem; margin: 0; display: flex; justify-content: center; align-items: center; gap: 4px;">
                            <i class="fas fa-arrows-alt"></i> Redimensionar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Seção de Aventureiros -->
            <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <div class="medieval-subtitle" style="margin: 0 0 10px 0; font-size: 0.95rem; color: var(--gold); display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-shield-halved"></i> Convocação de Heróis
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; flex: 1; overflow-y: auto; padding-right: 2px;" id="vtt-players-list-container">
                    ${playersHtml}
                </div>
            </div>
        `;

        // Vincula eventos de mapa e upload
        this.bindVTTMapControlEvents();
    },

    bindVTTMapControlEvents() {
        const fileInput = document.getElementById('vtt-map-upload-input');
        const gridInput = document.getElementById('vtt-grid-size-input');
        const applyGridBtn = document.getElementById('vtt-apply-grid-btn');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (file.size > 2 * 1024 * 1024) {
                    window.app.showAlert("O arquivo selecionado excede 2MB. Selecione um mapa mais leve para garantir o carregamento em tempo real nos navegadores dos jogadores.", "Aviso de Limite");
                    return;
                }

                window.app.toggleLoading(true, "Tecendo o novo cenário nas parcas...");
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const base64Url = event.target.result;
                    const cellSize = parseInt(gridInput?.value || "50");

                    try {
                        // 1. Salva no Firestore
                        await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                            mapUrl: base64Url,
                            cellSize: cellSize,
                            updatedAt: serverTimestamp()
                        });

                        // 2. Propaga imediatamente no VTT
                        import('./vtt-integration.js').then(({ VTTIntegration }) => {
                            VTTIntegration.loadMap(base64Url, cellSize);
                        });

                        window.app.showAlert("O novo cenário de combate foi manifestado com sucesso!", "Saga Atualizada");
                    } catch (err) {
                        console.error("[Lyra VTT] Erro ao salvar mapa local no Firestore:", err);
                        window.app.showAlert("Falha ao registrar novo tabuleiro no éter.");
                    } finally {
                        window.app.toggleLoading(false);
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        if (applyGridBtn && gridInput) {
            applyGridBtn.addEventListener('click', async () => {
                const cellSize = parseInt(gridInput.value || "50");
                if (isNaN(cellSize) || cellSize < 20 || cellSize > 200) {
                    window.app.showAlert("O tamanho da grade deve ser entre 20 e 200 pixels.", "Aviso");
                    return;
                }

                window.app.toggleLoading(true, "Redimensionando as teias da grade...");
                try {
                    const mapUrl = this.activeSession?.mapUrl || "/assets/maps/default.jpg";
                    await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                        cellSize: cellSize,
                        updatedAt: serverTimestamp()
                    });

                    import('./vtt-integration.js').then(({ VTTIntegration }) => {
                        VTTIntegration.loadMap(mapUrl, cellSize);
                    });

                    window.app.showAlert(`Tamanho do grid tático ajustado para ${cellSize}px.`, "Grade Sincronizada");
                } catch (err) {
                    console.error("[Lyra VTT] Erro ao atualizar cellSize:", err);
                    window.app.showAlert("Erro ao propagar alteração de grade.");
                } finally {
                    window.app.toggleLoading(false);
                }
            });
        }
    },

    spawnPlayerToken(characterId) {
        if (!characterId) return;

        import('./vtt-integration.js').then(({ VTTIntegration }) => {
            // Instancia o token do herói em posição de entrada (x=4, y=4)
            const playerPayload = [{
                characterId: characterId,
                id: characterId,
                x: 4,
                y: 4
            }];

            VTTIntegration.loadPlayers(playerPayload);
            window.app.showAlert("O herói foi invocado no tabuleiro tático!", "Token Convocado");
        });
    },

    async deleteTimelineEntry(index) {
        if (!this.activeSession || !this.activeSession.fullTimeline) return;

        const item = this.activeSession.fullTimeline[index];
        const title = item?.title || `Sessão ${index + 1}`;

        const confirmed = await window.app.showConfirm(
            `Deseja realmente excluir "${title}" da cronologia? Esta ação não poderá ser desfeita.`,
            "Apagar Capítulo"
        );
        if (!confirmed) return;

        const timeline = [...this.activeSession.fullTimeline];
        timeline.splice(index, 1);

        // Renumber
        timeline.forEach((s, i) => s.session = i + 1);

        try {
            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                fullTimeline: timeline,
                updatedAt: serverTimestamp()
            });
            this.activeSession.fullTimeline = timeline;
            this.renderTimeline(this.activeSession);
            window.app.showAlert('Sessão removida da cronologia.', 'Capítulo Apagado');
        } catch (err) {
            console.error('Erro ao excluir sessão:', err);
            window.app.showAlert('Falha ao excluir dos anais.', 'Erro');
        }
    },

    async reorderTimeline(fromIndex, toIndex) {
        if (!this.activeSession || !this.activeSession.fullTimeline) return;
        if (fromIndex === toIndex) return;

        const timeline = [...this.activeSession.fullTimeline];
        const [moved] = timeline.splice(fromIndex, 1);
        timeline.splice(toIndex, 0, moved);

        // Renumber
        timeline.forEach((s, i) => s.session = i + 1);

        try {
            await updateDoc(doc(db, COLLECTIONS.SESSIONS, this.activeSession.id), {
                fullTimeline: timeline,
                updatedAt: serverTimestamp()
            });
            this.activeSession.fullTimeline = timeline;
            this.renderTimeline(this.activeSession);
        } catch (err) {
            console.error('Erro ao reordenar timeline:', err);
            window.app.showAlert('Falha ao reordenar a cronologia.', 'Erro');
        }
    },

    // --- Timeline & Saga ---
    renderTimeline(session) {
        const track = document.getElementById('gm-timeline-track');
        const container = document.getElementById('gm-timeline-summary');

        if (!track || !container) return;

        const hasTimeline = session.fullTimeline && session.fullTimeline.length > 0;

        // In edit mode, always show the timeline area (even if empty, so user can add)
        if (!hasTimeline && !this.isTimelineEditMode) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        track.innerHTML = '';

        if (hasTimeline) {
            session.fullTimeline.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = `timeline-card${item.manual ? ' timeline-card--manual' : ''}`;
                card.dataset.index = index;

                if (this.isTimelineEditMode) {
                    card.draggable = true;
                    card.addEventListener('dragstart', (e) => {
                        this.dragSrcIndex = index;
                        card.classList.add('dragging');
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(index));
                    });
                    card.addEventListener('dragend', () => {
                        card.classList.remove('dragging');
                        track.querySelectorAll('.timeline-card').forEach(c => c.classList.remove('drag-over'));
                    });
                    card.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        card.classList.add('drag-over');
                    });
                    card.addEventListener('dragleave', () => {
                        card.classList.remove('drag-over');
                    });
                    card.addEventListener('drop', (e) => {
                        e.preventDefault();
                        card.classList.remove('drag-over');
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                        const toIndex = index;
                        if (fromIndex !== toIndex) {
                            this.reorderTimeline(fromIndex, toIndex);
                        }
                    });
                } else {
                    card.onclick = () => this.showChapterDetail(index);
                }

                const sessionNum = item.session || (index + 1);
                const title = item.title || `Sessão ${sessionNum}`;
                const summary = item.summary || item.description || "Sem registro nos anais.";

                card.innerHTML = `
                    <div class="timeline-card-header">
                        <span class="timeline-session-number">${this.isTimelineEditMode ? '<i class="fas fa-grip-vertical drag-handle"></i> ' : ''}Sessão ${sessionNum}</span>
                        <div class="timeline-card-badges">
                            ${item.manual ? '<i class="fas fa-feather-pointed" style="color:var(--crimson); font-size: 0.8rem;" title="Criada Manualmente"></i>' : ''}
                            ${item.status === 'completed' ? '<i class="fas fa-flag-checkered" style="color:var(--gold); font-size: 0.8rem;" title="Concluída"></i>' : ''}
                            ${this.isTimelineEditMode ? `<button class="btn-delete-session" data-delete-index="${index}" title="Excluir Sessão"><i class="fas fa-trash"></i></button>` : ''}
                        </div>
                    </div>
                    <div class="timeline-card-title">${title}</div>
                    <div class="timeline-card-summary">${summary}</div>
                `;

                track.appendChild(card);
            });

            // Bind delete buttons
            if (this.isTimelineEditMode) {
                track.querySelectorAll('.btn-delete-session').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const idx = parseInt(btn.dataset.deleteIndex, 10);
                        this.deleteTimelineEntry(idx);
                    });
                });
            }
        }

        // In edit mode, add a "+" card at the end
        if (this.isTimelineEditMode) {
            const addCard = document.createElement('div');
            addCard.className = 'timeline-card timeline-card--add';
            addCard.innerHTML = `
                <div class="timeline-add-content">
                    <i class="fas fa-plus"></i>
                    <span>Nova Sessão</span>
                </div>
            `;
            addCard.onclick = () => this.openManualSessionModal();
            track.appendChild(addCard);
        }
    },

    openChoiceModal() {
        const modal = document.getElementById('gm-session-create-modal');
        if (modal) modal.classList.add('hidden'); // Close create modal if open

        window.app.showChoiceModal(
            "Mestrear com auxílio do Oráculo (IA) ou seguir sua própria trilha (Manual)?",
            [
                { text: "Modo Oráculo (IA)", action: () => this.startSessionAI(), primary: true },
                { text: "Modo Manual", action: () => this.startSessionManual() }
            ],
            "assets/tokens/lyra.png"
        );
    },

    renderSagaData(session) {
        const container = document.getElementById('gm-saga-data');
        if (!container) return;

        const fields = [
            { id: 'hook', label: 'Gancho', icon: 'fa-anchor' },
            { id: 'goal', label: 'Objetivo', icon: 'fa-bullseye' },
            { id: 'locations', label: 'Locais', icon: 'fa-map-marked-alt' },
            { id: 'npcs', label: 'NPCs', icon: 'fa-users' },
            { id: 'threats', label: 'Ameaças', icon: 'fa-skull-crossbones' },
            { id: 'encounters', label: 'Encontros', icon: 'fa-swords' },
            { id: 'climax', label: 'Clímax', icon: 'fa-fire' },
            { id: 'treasure', label: 'Tesouros', icon: 'fa-coins' },
            { id: 'resolution', label: 'Resolução', icon: 'fa-scroll' },
            { id: 'atmosphere', label: 'Atmosfera', icon: 'fa-wind' }
        ];

        let html = '';
        fields.forEach(field => {
            let val = session[field.id];
            if (val && val.trim()) {
                const formattedVal = val
                    .replace(/,\s*(\d+\.)/g, '$1')
                    .replace(/(\d+\.\s)/g, (match, p1, offset) => {
                        return offset === 0 ? match : `<br>${match}`;
                    });

                html += `
                    <div class="saga-item">
                        <div class="saga-label">
                            <i class="fas ${field.icon}"></i>
                            <span>${field.label}</span>
                        </div>
                        <div class="saga-content">${formattedVal}</div>
                    </div>
                `;
            }
        });

        if (!html) {
            html = `
                <div class="saga-item empty">
                    <i class="fas fa-feather-pointed"></i>
                    <p>Nenhum detalhe adicional narrado ainda.</p>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    showChapterDetail(index) {
        if (!this.activeSession || !this.activeSession.fullTimeline) return;
        const chapter = this.activeSession.fullTimeline[index];
        if (!chapter) return;

        const modal = document.getElementById('gm-chapter-detail-modal');
        const content = document.getElementById('gm-chapter-detail-content');
        const title = document.getElementById('gm-chapter-detail-title');

        if (!modal || !content) return;

        const sessionNum = chapter.session || (index + 1);
        title.innerHTML = `<i class="fas fa-scroll"></i> Capítulo ${sessionNum}: ${chapter.title || "Sem Título"}`;

        const fields = [
            { label: 'Resumo', val: chapter.summary || chapter.description, icon: 'fa-feather-alt' },
            { label: 'Gancho', val: chapter.hook, icon: 'fa-anchor' },
            { label: 'Objetivo', val: chapter.goal, icon: 'fa-bullseye' },
            { label: 'Locais', val: chapter.locations, icon: 'fa-map-marked-alt' },
            { label: 'NPCs', val: chapter.npcs, icon: 'fa-users' },
            { label: 'Ameaças', val: chapter.threats, icon: 'fa-skull-crossbones' },
            { label: 'Encontros', val: chapter.encounters, icon: 'fa-swords' },
            { label: 'Clímax', val: chapter.climax, icon: 'fa-fire' },
            { label: 'Tesouro', val: chapter.treasure, icon: 'fa-coins' }
        ];

        let detailHtml = '';
        fields.forEach(f => {
            if (f.val) {
                const formattedVal = f.val
                    .replace(/,\s*(\d+\.)/g, '$1')
                    .replace(/(\d+\.\s)/g, (match, p1, offset) => {
                        return offset === 0 ? match : `<br>${match}`;
                    });
                detailHtml += `
                    <div class="saga-field" style="margin-bottom: 15px; border-bottom: 1px solid rgba(212,175,55,0.1); padding-bottom: 10px;">
                        <div class="field-label" style="font-weight: bold; color: var(--gold);"><i class="fas ${f.icon}"></i> ${f.label}</div>
                        <div class="field-content" style="margin-top: 5px;">${formattedVal}</div>
                    </div>
                `;
            }
        });

        content.innerHTML = detailHtml || '<p class="empty-msg">Nenhum detalhe registrado para este capítulo.</p>';
        modal.classList.remove('hidden');
    },

    // --- Content Linking ---
    async filterSearch(type, queryText) {
        if (!queryText || queryText.length < 2) {
            this.renderLinkedContent();
            return;
        }

        const containerId = type === 'item' ? 'gm-treasure-list' : `gm-${type}-list`;
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const { getModuleItems, COLLECTIONS, getUserMonsters, getGlobalMonsters, getGlobalItems, getUserItems, getUserNPCs } = await import('../data.js');
            let items = [];
            const userId = getAuth().currentUser.uid;
            const systemId = window.app.currentSystem;

            switch (type) {
                case 'npc':
                    items = await getUserNPCs(userId, getAuth().currentUser.email);
                    break;
                case 'monster':
                    const globals = await getGlobalMonsters(systemId);
                    const users = await getUserMonsters(userId, getAuth().currentUser.email);
                    items = [...globals, ...users];
                    break;
                case 'item':
                    const gItems = await getGlobalItems(systemId);
                    const uItems = await getUserItems(userId, getAuth().currentUser.email);
                    const tItems = await getModuleItems(COLLECTIONS.TREASURES, userId, systemId);
                    items = [...gItems, ...uItems, ...tItems];
                    break;
                case 'encounter':
                    items = await getModuleItems(COLLECTIONS.ENCOUNTERS, userId, systemId);
                    break;
                case 'campaign':
                    items = await getModuleItems(COLLECTIONS.CAMPAIGNS, userId, systemId);
                    break;
                case 'plot':
                    items = await getModuleItems(COLLECTIONS.PLOTS, userId, systemId);
                    break;
                case 'scene':
                    items = await getModuleItems(COLLECTIONS.SCENES, userId, systemId);
                    break;
                case 'motivation':
                    items = await getModuleItems(COLLECTIONS.MOTIVATIONS, userId, systemId);
                    break;
            }

            const linkedKey = `linked_${type}s`;
            const linkedIds = this.activeSession[linkedKey] || [];

            const filtered = items.filter(item =>
                (item.name || item.title || "").toLowerCase().includes(queryText.toLowerCase())
            ).slice(0, 15);

            if (filtered.length === 0) {
                container.innerHTML = `<p class="empty-state">Nenhum resultado.</p>`;
                return;
            }

            container.innerHTML = filtered.map(item => {
                const isLinked = linkedIds.includes(item.id);
                return `
                <div class="mini-card searchable ${isLinked ? 'already-linked' : ''}" 
                     onclick="GMPanelModule.linkContent('${type}', '${item.id}')">
                    <i class="fas ${this.getIconForType(type)}"></i>
                    <span>${(item.name || item.title || "").substring(0, 18)}</span>
                    ${isLinked ? '<i class="fas fa-check-circle linked-badge"></i>' : ''}
                </div>
            `;
            }).join('');
        } catch (err) {
            console.error("Erro na busca:", err);
        }
    },

    getIconForType(type) {
        switch (type) {
            case 'npc': return 'fa-user-shield';
            case 'item': return 'fa-gem';
            case 'monster': return 'fa-dragon';
            case 'encounter': return 'fa-shield';
            case 'campaign': return 'fa-map-location-dot';
            case 'plot': return 'fa-wand-magic-sparkles';
            case 'scene': return 'fa-image';
            case 'motivation': return 'fa-heart-pulse';
            default: return 'fa-scroll';
        }
    },

    async linkContent(type, itemId) {
        if (!this.activeSession) return;

        const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
        const linkedKey = `linked_${type}s`;

        const currentLinks = this.activeSession[linkedKey] || [];
        if (!currentLinks.includes(itemId)) {
            currentLinks.push(itemId);
            await updateDoc(sessionRef, { [linkedKey]: currentLinks });
            this.activeSession[linkedKey] = currentLinks;
            window.app.showAlert("Vinculado à sessão!", "Sucesso");

            this.renderLinkedContent();

            document.querySelectorAll('#gm-sidebar-left .search-input').forEach(input => {
                input.value = '';
            });
        } else {
            window.app.showAlert("Já está vinculado.");
        }
    },

    async unlinkContent(type, itemId) {
        if (!this.activeSession) return;

        const sessionRef = doc(db, COLLECTIONS.SESSIONS, this.activeSession.id);
        const linkedKey = `linked_${type}s`;

        let currentLinks = this.activeSession[linkedKey] || [];
        currentLinks = currentLinks.filter(id => id !== itemId);

        await updateDoc(sessionRef, { [linkedKey]: currentLinks });
        this.activeSession[linkedKey] = currentLinks;

        window.app.showAlert("Removido da sessão.", "Sucesso");
        this.renderLinkedContent();
    },

    async renderMiniList(type, containerId, linkedOnly = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const linkedKey = `linked_${type}s`;
        const ids = this.activeSession ? (this.activeSession[linkedKey] || []) : [];

        if (linkedOnly && ids.length === 0) {
            container.innerHTML = `<p class="empty-state">Nada vinculado.</p>`;
            return;
        }

        try {
            const { getModuleItems, COLLECTIONS, getUserMonsters, getGlobalMonsters, getGlobalItems, getUserItems, getUserNPCs } = await import('../data.js');
            let allItems = [];
            const userId = getAuth().currentUser.uid;
            const systemId = window.app.currentSystem;

            switch (type) {
                case 'npc':
                    allItems = await getUserNPCs(userId, getAuth().currentUser.email);
                    break;
                case 'monster':
                    const globals = await getGlobalMonsters(systemId);
                    const users = await getUserMonsters(userId, getAuth().currentUser.email);
                    allItems = [...globals, ...users];
                    break;
                case 'item':
                    const gItems = await getGlobalItems(systemId);
                    const uItems = await getUserItems(userId, getAuth().currentUser.email);
                    const tItems = await getModuleItems(COLLECTIONS.TREASURES, userId, systemId);
                    allItems = [...gItems, ...uItems, ...tItems];
                    break;
                case 'encounter':
                    allItems = await getModuleItems(COLLECTIONS.ENCOUNTERS, userId, systemId);
                    break;
                case 'campaign':
                    allItems = await getModuleItems(COLLECTIONS.CAMPAIGNS, userId, systemId);
                    break;
                case 'plot':
                    allItems = await getModuleItems(COLLECTIONS.PLOTS, userId, systemId);
                    break;
                case 'scene':
                    allItems = await getModuleItems(COLLECTIONS.SCENES, userId, systemId);
                    break;
                case 'motivation':
                    allItems = await getModuleItems(COLLECTIONS.MOTIVATIONS, userId, systemId);
                    break;
            }

            const items = allItems.filter(i => ids.includes(i.id));
            console.log(`[MiniList:${type}] Total=${allItems.length}, IDs Linked=${ids.length}, Match=${items.length}`, { ids, itemIds: allItems.map(i => i.id) });

            container.innerHTML = items.map(item => `
                <div class="mini-card linked" title="${item.name || item.title}">
                    <i class="fas ${this.getIconForType(type)}"></i>
                    <span>${(item.name || item.title).substring(0, 18)}</span>
                    <button class="btn-unlink" onclick="event.stopPropagation(); GMPanelModule.unlinkContent('${type}', '${item.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        } catch (err) {
            console.error(`Erro ao carregar lista mini (${type}):`, err);
        }
    },

    // --- Session Selection & Switching ---
    async openSessionSelectModal(mode = 'switch') {
        const modal = document.getElementById('gm-session-select-modal');
        const container = document.getElementById('gm-session-select-container');
        const optionsList = document.getElementById('gm-session-select-options');
        const textDisplay = document.getElementById('gm-session-select-text');
        const hiddenValue = document.getElementById('gm-session-select-value');
        const confirmBtn = document.getElementById('gm-session-select-confirm');
        const title = modal?.querySelector('.modal-title');

        if (!modal || !optionsList || !confirmBtn) return;

        container?.classList.remove('open');
        document.getElementById('gm-session-select-options-wrapper')?.classList.add('hidden');
        if (textDisplay) textDisplay.textContent = "Consultando os anais...";
        if (hiddenValue) hiddenValue.value = "";

        if (title) {
            title.innerHTML = mode === 'enter'
                ? '<i class="fas fa-scroll"></i> ESCOLHER CAPÍTULO'
                : '<i class="fas fa-exchange-alt"></i> ALTERNAR CRÔNICA';
        }

        modal.classList.remove('hidden');
        optionsList.innerHTML = '<div class="custom-select-option">Consultando os anais...</div>';

        const selectOption = (val, label) => {
            if (textDisplay) textDisplay.textContent = label;
            if (hiddenValue) hiddenValue.value = val;
            container?.classList.remove('open');
            document.getElementById('gm-session-select-options-wrapper')?.classList.add('hidden');
        };

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // CASE A: Entering Atrium (Chapter Selection from Active Session)
        if (mode === 'enter' && this.activeSession && this.activeSession.fullTimeline) {
            if (textDisplay) textDisplay.textContent = "Selecione um capítulo da trilha...";

            let optionsHtml = '';
            this.activeSession.fullTimeline.forEach((item, index) => {
                const sessionNum = item.session || (index + 1);
                const itemTitle = item.title || `Sessão ${sessionNum}`;
                optionsHtml += `<div class="custom-select-option" data-value="${index}">Sessão ${sessionNum}: ${itemTitle}</div>`;
            });
            optionsList.innerHTML = optionsHtml;

            optionsList.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.addEventListener('click', () => selectOption(opt.dataset.value, opt.textContent));
            });

            newConfirmBtn.addEventListener('click', () => {
                const selectedIndex = hiddenValue.value;
                if (selectedIndex !== "") {
                    this.switchSession(this.activeSession.id, 'enter', selectedIndex);
                } else {
                    window.app.showAlert("Selecione um capítulo antes de prosseguir.");
                }
            });
            return;
        }

        // CASE B: Switching Saga (Top-level Session Selection)
        try {
            const user = getAuth().currentUser;
            const systemId = window.app.currentSystem;

            const q = query(
                collection(db, COLLECTIONS.SESSIONS),
                where("userId", "==", user.uid),
                where("systemId", "==", systemId),
                where("status", "in", ["active", "preparing"])
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                optionsList.innerHTML = '<div class="custom-select-option">Nenhuma trilha encontrada.</div>';
                if (textDisplay) textDisplay.textContent = "Nenhuma trilha encontrada.";
                return;
            }

            if (textDisplay) textDisplay.textContent = "Escolha uma crônica...";
            let optionsHtml = '';
            snapshot.docs.forEach((docSnap, index) => {
                const data = docSnap.data();
                const isActive = mode === 'switch' && this.activeSession && this.activeSession.id === docSnap.id;
                optionsHtml += `
                    <div class="custom-select-option ${isActive ? 'disabled' : ''}" data-value="${docSnap.id}">
                        ${index + 1}. ${data.title || "Sem Título"}
                    </div>`;
            });
            optionsList.innerHTML = optionsHtml;

            optionsList.querySelectorAll('.custom-select-option:not(.disabled)').forEach(opt => {
                opt.addEventListener('click', () => selectOption(opt.dataset.value, opt.textContent));
            });

            newConfirmBtn.addEventListener('click', () => {
                const selectedId = hiddenValue.value;
                if (selectedId) {
                    this.switchSession(selectedId, mode);
                } else {
                    window.app.showAlert("Selecione um destino antes de prosseguir.");
                }
            });

        } catch (err) {
            console.error(err);
            optionsList.innerHTML = '<div class="custom-select-option">Erro ao carregar os anais.</div>';
            if (textDisplay) textDisplay.textContent = "Erro de conexão astral.";
        }
    },

    closeSessionSelectModal() {
        document.getElementById('gm-session-select-modal')?.classList.add('hidden');
    },

    async switchSession(sessionId, mode = 'switch', chapterIndex = null) {
        this.closeSessionSelectModal();

        if (mode === 'enter') {
            window.app.toggleLoading(true, "Abrindo os portões do Atrium...");
            try {
                const qInvites = query(collection(db, "session_invites"), where("sessionId", "==", sessionId));
                const snapshotInvites = await getDocs(qInvites);
                const participants = snapshotInvites.docs.map(d => d.data());
                const gmEmail = getAuth().currentUser.email.toLowerCase();

                const withoutSheet = participants.filter(p =>
                    p.email.toLowerCase() !== gmEmail &&
                    p.role !== 'gm' &&
                    !p.characterId
                );

                if (withoutSheet.length > 0) {
                    window.app.showAlert(`Aviso: Faltam aventureiros escolherem suas fichas (${withoutSheet.length} pendentes).`, "Preparação pendente");
                }

                localStorage.setItem('lyra_active_session', sessionId);

                let finalIdx = chapterIndex;
                if (chapterIndex === null) {
                    const sessionDoc = await getDoc(doc(db, COLLECTIONS.SESSIONS, sessionId));
                    if (sessionDoc.exists()) {
                        const data = sessionDoc.data();
                        const uncompleted = (data.fullTimeline || []).findIndex(ch => ch.status !== 'completed');
                        finalIdx = uncompleted !== -1 ? uncompleted : 0;
                    } else {
                        finalIdx = 0;
                    }
                } else {
                    finalIdx = parseInt(chapterIndex, 10);
                    if (isNaN(finalIdx)) finalIdx = 0;
                }

                const targetIdx = Number(finalIdx || 0);

                const sessRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
                await updateDoc(sessRef, {
                    activeChapterIndex: targetIdx,
                    sessionStatus: 'active',
                    updatedAt: serverTimestamp()
                });

                localStorage.setItem('lyra_active_session', sessionId);
                localStorage.setItem('lyra_active_chapter', targetIdx);
                window.open(`session-stage.html?id=${sessionId}&chapter=${targetIdx}`, '_blank');
            } catch (err) {
                console.error(err);
                window.app.showAlert("Erro ao validar acesso à sessão.");
            } finally {
                window.app.toggleLoading(false);
            }
            return;
        }

        window.app.toggleLoading(true, "Alternando entre realidades...");
        try {
            const docRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                if (this.unsubscribeInvites) this.unsubscribeInvites();
                if (this.unsubscribeAccessRequests) this.unsubscribeAccessRequests();

                this.activeSession = { id: snap.id, ...snap.data() };
                this.displayActiveSession(this.activeSession);
                window.app.showAlert("Saindo de uma trilha e entrando em outra...", "Realidade Alternada");
            }
        } catch (err) {
            console.error(err);
            window.app.showAlert("Falha ao alternar sessão.");
        } finally {
            window.app.toggleLoading(false);
        }
    }
};

// ── Mix in sub-module methods ──
Object.assign(GMPanelModule, createSessionMixin(GMPanelModule));
Object.assign(GMPanelModule, createInvitesMixin(GMPanelModule));

window.GMPanelModule = GMPanelModule;
