/**
 * App Modals Sub-Module
 * Handles modal open/close, alerts, confirms, and loading states.
 */

import { SettingsModule } from '../modules/settings.js';
import { NavigationModule } from '../modules/navigation.js';

/**
 * Returns modal/helper methods to be mixed into the app object.
 */
export function createModalsMixin(ctx) {
    return {
        checkAuth() {
            if (!ctx.user) {
                ctx.showAlert("Você precisa estar logado para acessar os tomos proibidos.", "Acesso Negado");
                return false;
            }
            return true;
        },

        openModal(id) {
            const wrapper = document.getElementById('modal-wrapper');
            const modalBody = document.getElementById('modal-body');
            const detailContainer = document.getElementById('detail-container');

            if (wrapper) {
                wrapper.classList.add('active');
                wrapper.classList.remove('hidden');
                const content = wrapper.querySelector('.parchment');
                if (content) content.scrollTop = 0;
            }

            if (id !== 'character-sheet') {
                ctx.isInspection = false;
            }

            if (modalBody) modalBody.classList.remove('hidden');
            if (detailContainer) {
                detailContainer.innerHTML = '';
                detailContainer.classList.add('hidden');
            }

            document.querySelectorAll('.wizard-container, .sheet-container, .wizard-step').forEach(c => c.classList.add('hidden'));
            const target = document.getElementById(id);
            if (target) target.classList.remove('hidden');
            NavigationModule.updateScrollIndicators();
        },

        closeModal() {
            if (SettingsModule.isNicknameRequired) {
                ctx.showAlert("Você precisa definir um Apelido Arcano antes de prosseguir para as Terras do Oeste.", "Destino Selado");
                return;
            }

            const wrapper = document.getElementById('modal-wrapper');
            const modalBody = document.getElementById('modal-body');
            const detailContainer = document.getElementById('detail-container');

            if (wrapper) {
                wrapper.classList.remove('active');
                wrapper.classList.add('hidden');
            }

            if (modalBody) modalBody.classList.remove('hidden');
            if (detailContainer) {
                detailContainer.innerHTML = '';
                detailContainer.classList.add('hidden');
            }
        },

        closeAlert() {
            const alertModal = document.getElementById('alert-modal');
            if (alertModal) alertModal.classList.add('hidden');
        },

        showAlert(message, title = "Decreto Real") {
            const modal = document.getElementById('alert-modal');
            const titleEl = document.getElementById('alert-title');
            const messageEl = document.getElementById('alert-message');
            if (modal && titleEl && messageEl) {
                titleEl.innerText = title;
                messageEl.innerText = message;
                modal.classList.remove('hidden');
            } else alert(message);
        },

        openAIPromptModal() {
            const modal = document.getElementById('monster-ai-prompt-modal');
            document.getElementById('ai-monster-prompt').value = '';
            modal.classList.remove('hidden');
        },

        showConfirm(message, title = "Confirmação Mística") {
            return new Promise((resolve) => {
                const modal = document.getElementById('confirm-modal');
                const titleEl = document.getElementById('confirm-title');
                const messageEl = document.getElementById('confirm-message');
                const okBtn = document.getElementById('confirm-ok-btn');
                const cancelBtn = document.getElementById('confirm-cancel-btn');

                if (!modal || !okBtn || !cancelBtn) {
                    resolve(confirm(message));
                    return;
                }

                titleEl.innerText = title;
                messageEl.innerText = message;
                modal.classList.remove('hidden');

                const cleanup = (result) => {
                    modal.classList.add('hidden');
                    okBtn.onclick = null;
                    cancelBtn.onclick = null;
                    resolve(result);
                };

                okBtn.onclick = () => cleanup(true);
                cancelBtn.onclick = () => cleanup(false);
            });
        },

        toggleLoading(show) {
            const loading = document.getElementById('mystic-loading');
            if (loading) loading.classList.toggle('hidden', !show);
        }
    };
}
