import DOMPurify from 'dompurify';
import {
    checkNicknameAvailability,
    setNickname,

    subscribeToGlobalChat,
    sendGlobalMessage,
    getUserProfile,
    subscribeToOnlineUsers
} from '../data.js';

const CommunityModule = {
    user: null, // Will be set by app.js
    _lastMessageTime: null,

    unsubscribeChat: null,
    unsubscribeOnline: null,
    isInitialized: false,

    init(user) {
        this.user = user;
        this.injectHTML();
        this.bindEvents();

        // Init chat immediately to receive background notifications
        this.initChat();
        this.initOnlineList();
    },

    injectHTML() {
        if (document.getElementById('community')) return;

        const communityHtml = `
            <!-- Community & Chat View -->
            <section id="community" class="view hidden">
                <div class="community-layout-container">
                    <div class="chat-container">
                        <button class="close-btn-medieval" id="community-close-btn-alt"><i class="fas fa-times"></i></button>
                        <div class="chat-header">
                            <h2><i class="fas fa-globe"></i> GUILDA (GLOBAL)</h2>
                        </div>

                        <div class="community-layout">
                            <!-- Main Chat -->
                            <div class="community-main">
                                <div id="global-chat-messages" class="chat-messages">
                                    <!-- JS Injects messages -->
                                </div>
                                <div class="chat-input-area">
                                    <textarea id="global-chat-input" class="medieval-textarea" placeholder="Sua mensagem, viajante..."></textarea>
                                    <button id="send-global-msg" class="medieval-btn">ENVIAR</button>
                                </div>
                            </div>

                            <!-- Sidebar -->
                            <div class="community-sidebar">
                                <div class="sidebar-header">
                                    <h3><i class="fas fa-users"></i> VIAJANTES</h3>
                                </div>
                                <div id="online-users-list" class="online-list">
                                    <!-- Dynamic Content -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('beforeend', communityHtml);
        } else {
            document.body.insertAdjacentHTML('beforeend', communityHtml);
        }
    },

    bindEvents() {
        const closeBtns = ['community-close-btn', 'community-close-btn-alt'];
        closeBtns.forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => {
                if (window.app && window.app.switchView) {
                    window.app.switchView('dashboard');
                } else {
                    document.getElementById('community').classList.add('hidden');
                }
            });
        });

        // Chat
        document.getElementById('send-global-msg')?.addEventListener('click', () => this.handleSendMessage());
        document.getElementById('global-chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Settings Nickname Validation
        const nickInput = document.getElementById('setting-nickname');
        if (nickInput) {
            nickInput.addEventListener('blur', (e) => this.handleNicknameChange(e.target.value));
        }
    },

    async handleNicknameChange(nickname) {
        if (!nickname) return;
        const feedback = document.getElementById('nickname-feedback');

        try {
            const isAvailable = await checkNicknameAvailability(nickname);
            if (!isAvailable) {
                if (feedback) {
                    feedback.textContent = "Este nome já está sendo usado por outro viajante.";
                    feedback.className = "error-text";
                }
            } else {
                if (feedback) {
                    feedback.textContent = "Nome disponível!";
                    feedback.className = "success-text";
                }
            }
        } catch (e) {
            console.error("Erro ao verificar nick", e);
        }
    },

    // --- Chat Logic ---
    initChat() {
        if (this.unsubscribeChat) return;

        this.unsubscribeChat = subscribeToGlobalChat((messages) => {
            this.renderChatMessages(messages);
            this.checkForNotifications(messages);
        });

        if (!this.unsubscribeOnline) {
            this.initOnlineList();
        }

        this.isInitialized = true;
    },

    checkForNotifications(messages) {
        if (messages.length === 0) return;

        const latestMsg = messages[messages.length - 1];
        const lastSeen = localStorage.getItem('lyra_community_last_read') || 0;

        // Don't notify for our own messages or if the community view is currently open
        const isCommunityOpen = !document.getElementById('community')?.classList.contains('hidden');

        if (latestMsg.userId !== this.user?.uid && latestMsg.createdAt?.seconds > lastSeen) {
            if (!isCommunityOpen) {
                this.setNotificationState(true);
                this.clearNotifications();
            }
        }
    },

    setNotificationState(active) {
        const communityCard = document.querySelector('.action-card[data-view="community"]');
        if (communityCard) {
            communityCard.classList.toggle('has-notification', active);
        } else {
            if (active) console.warn("⚠️ [Community] Card de comunidade não encontrado para aplicar notificação.");
        }
    },

    clearNotifications() {
        this.setNotificationState(false);
        localStorage.setItem('lyra_community_last_read', Math.floor(Date.now() / 1000));
        // Force scroll when notifications are cleared (usually when opening the view)
        this.scrollToBottom();
    },

    initOnlineList() {
        if (this.unsubscribeOnline) return;

        this.unsubscribeOnline = subscribeToOnlineUsers((users) => {
            this.renderOnlineUsers(users);
        });
    },

    renderOnlineUsers(users) {
        const container = document.getElementById('online-users-list');
        if (!container) return;

        // Render the list of online users
        container.innerHTML = users.map(u => `
            <div class="online-user-item">
                <span class="status-dot pulsing"></span>
                <span class="user-nickname ${u.role === 'gm' ? 'gm-name' : ''}">${u.nickname || u.displayName || 'Viajante'}</span>
                ${u.role === 'gm' ? '<i class="fas fa-shield-halved gm-icon" title="Mestre"></i>' : ''}
                ${u.role === 'bot' ? '<i class="fas fa-wand-magic-sparkles bot-icon" title="Entidade Arcana"></i>' : ''}
            </div>
        `).join('');
    },

    renderChatMessages(messages) {
        const container = document.getElementById('global-chat-messages');
        if (!container) return;

        container.innerHTML = messages.map(msg => `
            <div class="msg ${msg.userId === this.user.uid ? 'user' : 'other'}">
                <div class="msg-header">
                    <span class="msg-author">${msg.username}</span>
                    <span class="msg-time">${msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                </div>
                <div class="msg-content">${DOMPurify.sanitize(msg.text)}</div>
            </div>
        `).join('');

        this.scrollToBottom();
    },

    scrollToBottom() {
        const container = document.getElementById('global-chat-messages');
        if (!container) return;

        // Use requestAnimationFrame + small timeout for reliable scroll after render/transition
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 50);
        });
    },

    async handleSendMessage() {
        const input = document.getElementById('global-chat-input');
        const message = input.value.trim();
        if (!message) return;

        // Rate limiting: máximo 1 mensagem por segundo
        const now = Date.now();
        if (this._lastMessageTime && (now - this._lastMessageTime) < 1000) {
            console.warn('[Community] Rate limit: aguarde antes de enviar outra mensagem.');
            return;
        }
        this._lastMessageTime = now;

        input.value = '';
        try {
            await sendGlobalMessage(this.user, message);
        } catch (e) {
            console.error("Erro ao enviar mensagem", e);
            alert("O corvo falhou ao entregar sua mensagem.");
        }
    }
};

export default CommunityModule;
