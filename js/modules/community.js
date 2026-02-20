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

    unsubscribeChat: null,
    unsubscribeOnline: null,
    isInitialized: false,

    init(user) {
        this.user = user;
        this.bindEvents();

        // Init chat immediately to receive background notifications
        this.initChat();
        this.initOnlineList();
    },

    bindEvents() {
        document.getElementById('community-close-btn')?.addEventListener('click', () => {
            if (window.app && window.app.switchView) {
                window.app.switchView('dashboard');
            } else {
                document.getElementById('community').classList.add('hidden');
            }
        });

        // Chat
        document.getElementById('send-global-msg')?.addEventListener('click', () => this.handleSendMessage());
        document.getElementById('global-chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
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
            <div class="msg ${msg.userId === this.user.uid ? 'user' : 'bot'}">
                <div class="msg-header">
                    <span class="msg-author">${msg.username}</span>
                    <span class="msg-time">${msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                </div>
                <div class="msg-content">${msg.text}</div>
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

        // Debounce / Rate Limit
        if (!message) return;

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
