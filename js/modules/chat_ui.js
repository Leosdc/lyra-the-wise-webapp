/**
 * Chat UI Module
 * Handles the dynamic injection and management of the AI Chat interface.
 */
import { parseMarkdown } from './utils.js';

export const ChatUIModule = {
    init(app) {
        this.app = app;
        this.injectHTML();
        this.bindEvents();
    },

    injectHTML() {
        if (document.getElementById('chat')) return;

        const chatHtml = `
            <!-- AI Chat View -->
            <section id="chat" class="view hidden">
                <div class="chat-container">
                    <button class="close-btn-medieval" id="chat-close-btn-alt">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="chat-header">
                        <h2><i class="fas fa-comment-dots"></i> Fale com <span id="chat-persona-name">Lyra</span></h2>
                    </div>
                    <div id="chat-messages" class="chat-messages">
                        <!-- Mensagens aqui -->
                    </div>
                    <div class="chat-input-area">
                        <textarea id="chat-input" class="medieval-textarea" placeholder="Sua mensagem..."></textarea>
                        <button id="send-msg-btn" class="medieval-btn">ENVIAR</button>
                    </div>
                </div>
            </section>
        `;
        document.getElementById('main-content')?.insertAdjacentHTML('beforeend', chatHtml);
    },

    bindEvents() {
        // Personagem name update based on theme
        this.updatePersonaName();

        document.getElementById('chat-close-btn-alt')?.addEventListener('click', () => {
            this.app.switchView('dashboard');
        });

        document.getElementById('send-msg-btn')?.addEventListener('click', () => {
            this.app.handleSendMessage();
        });

        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.app.handleSendMessage();
            }
        });
    },

    updatePersonaName() {
        const span = document.getElementById('chat-persona-name');
        if (!span) return;

        const theme = this.app.currentThemeName || 'lyra';
        span.innerText = theme.charAt(0).toUpperCase() + theme.slice(1);

        // Update any existing bot avatars in the view if theme changed
        const avatarPath = `assets/tokens/${theme}.png`;
        document.querySelectorAll('#chat-messages .chat-avatar').forEach(img => {
            img.src = avatarPath;
        });
    }
};
