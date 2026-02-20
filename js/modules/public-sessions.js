/**
 * Public Sessions Module
 * Handles loading and displaying public sessions
 */

import { db } from '../auth.js';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    increment
} from 'firebase/firestore';

const nicknameCache = new Map();

export const PublicSessionsModule = {
    async getNickname(userId) {
        if (nicknameCache.has(userId)) return nicknameCache.get(userId);

        try {
            const { getUserProfile } = await import('../data.js');
            const profile = await getUserProfile(userId);
            const nickname = profile?.nickname || profile?.displayName || 'Mestre Desconhecido';
            nicknameCache.set(userId, nickname);
            return nickname;
        } catch (e) {
            return 'Mestre Desconhecido';
        }
    },

    async loadPublicSessions() {
        const container = document.getElementById('public-sessions-list');
        if (!container) return;

        container.innerHTML = '<div class="loading-msg"><i class="fas fa-spinner fa-spin"></i> Carregando sessões públicas...</div>';

        try {
            const sessionsRef = collection(db, 'sessoes');
            const q = query(
                sessionsRef,
                where('visibility', '==', 'public'),
                orderBy('createdAt', 'desc'),
                limit(20)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                container.innerHTML = '<div class="empty-msg">Nenhuma sessão pública disponível no momento.</div>';
                return;
            }

            const sessions = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                const nickname = data.masterNickname || await this.getNickname(data.userId);
                sessions.push({ id: doc.id, ...data, masterNickname: nickname });
            }

            container.innerHTML = sessions.map(session => this.renderPublicSessionCard(session)).join('');

        } catch (error) {
            console.error('Erro ao carregar sessões públicas:', error);
            container.innerHTML = '<div class="empty-msg">Erro ao carregar sessões públicas.</div>';
        }
    },

    renderPublicSessionCard(session) {
        const isActive = session.status === 'active' || session.started;
        const playerCount = session.currentPlayers || 0;
        const maxPlayers = session.maxPlayers || 6;
        const isFull = playerCount >= maxPlayers;

        const statusBadge = isActive ?
            '<span class="session-badge active">Em Andamento</span>' :
            '<span class="session-badge preparing">Preparando</span>';

        const modeBadge = session.mode === 'oracle' ?
            '<span class="session-badge oracle">Oráculo</span>' :
            '<span class="session-badge manual">Manual</span>';

        const actionButton = isActive ?
            `<button class="medieval-btn secondary" data-session-id="${session.id}" data-action="request-access" style="width: 100%;">
                <i class="fas fa-door-open"></i> Solicitar Acesso
            </button>` :
            `<button class="medieval-btn" data-session-id="${session.id}" data-action="join-now" style="width: 100%;">
                <i class="fas fa-sign-in-alt"></i> Entrar Agora
            </button>`;

        return `
            <div class="session-card" data-session-id="${session.id}">
                <div class="session-card-header">
                    <h3 class="session-title">${session.title || 'Sessão sem título'}</h3>
                    <div class="session-badges">
                        ${modeBadge}
                        ${statusBadge}
                    </div>
                </div>
                <p class="session-summary">${session.summary || 'Sem descrição disponível.'}</p>
                <div class="session-meta">
                    <div class="session-meta-item">
                        <i class="fas fa-users"></i>
                        <span>${playerCount}/${maxPlayers} jogadores</span>
                    </div>
                    <div class="session-meta-item">
                        <i class="fas fa-gamepad"></i>
                        <span>${session.systemId || 'D&D 5e'}</span>
                    </div>
                    <div class="session-meta-item">
                        <i class="fas fa-crown" style="color: var(--gold);"></i>
                        <span style="color: var(--gold-bright); font-weight: bold;">Mestre: ${session.masterNickname || 'Desconhecido'}</span>
                    </div>
                </div>
                <div class="session-actions">
                    ${isFull ? '<span class="session-full-msg">Sessão cheia</span>' : actionButton}
                </div>
            </div>
        `;
    },

    async showSessionDetails(sessionId) {
        try {
            window.app.toggleLoading(true);
            const session = await getSession(sessionId);
            if (!session) throw new Error("Sessão não encontrada.");

            const modalContent = `
                <div class="session-detail-view">
                    <div class="detail-header">
                        <h2 class="medieval-title">${session.title || 'Sessão sem título'}</h2>
                        <div class="detail-badges">
                            <span class="session-badge ${session.mode}">${session.mode === 'oracle' ? 'Oráculo' : 'Manual'}</span>
                            <span class="session-badge ${session.status}">${session.status === 'active' || session.started ? 'Em Andamento' : 'Preparando'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-scroll"></i> A Crônica</h3>
                        <div class="detail-story">${session.summary || 'Sem descrição disponível.'}</div>
                    </div>

                    <div class="detail-meta-grid">
                        <div class="meta-box">
                            <i class="fas fa-users"></i>
                            <label>Jogadores</label>
                            <span>${session.currentPlayers || 0}/${session.maxPlayers || 6}</span>
                        </div>
                        <div class="meta-box">
                            <i class="fas fa-gamepad"></i>
                            <label>Sistema</label>
                            <span>${session.systemId || 'D&D 5e'}</span>
                        </div>
                        <div class="meta-box master">
                            <i class="fas fa-crown"></i>
                            <label>Mestre</label>
                            <span>${session.masterNickname || 'Desconhecido'}</span>
                        </div>
                    </div>

                    <div class="detail-actions">
                        <button class="medieval-btn secondary close-session-detail" onclick="app.closeModal()">
                            <i class="fas fa-times"></i> Fechar
                        </button>
                    </div>
                </div>
            `;

            // Use the app's modal system
            const detailContainer = document.getElementById('detail-container');
            const modalBody = document.getElementById('modal-body');

            if (detailContainer && modalBody) {
                // Open modal first to set up wrapper and clear any previous content properly
                window.app.openModal('detail-container');

                // Now populate and adjust visibility
                detailContainer.innerHTML = modalContent;
                detailContainer.classList.remove('hidden');
                modalBody.classList.add('hidden');
            } else {
                // Fallback to alert if modal structure is missing
                window.app.showAlert(session.summary, session.title);
            }

        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            window.app.showAlert("Não foi possível carregar os detalhes da sessão.");
        } finally {
            window.app.toggleLoading(false);
        }
    }
};

import { AccessRequestsModule } from './access-requests.js';
import { getSession } from '../data.js';

// Bind click events for session actions
document.addEventListener('click', async (e) => {
    // 1. Check for action buttons first
    const btn = e.target.closest('[data-action]');
    if (btn) {
        const action = btn.dataset.action;
        const sessionId = btn.dataset.sessionId;

        if (action === 'join-now') {
            try {
                window.app.toggleLoading(true);
                const session = await getSession(sessionId);
                if (!session) throw new Error("Sessão não encontrada.");

                // Check if full
                if ((session.currentPlayers || 0) >= (session.maxPlayers || 6)) {
                    window.app.showAlert("Esta sessão já atingiu o limite de jogadores.", "Sessão Cheia");
                    return;
                }

                // Direct join flow: logic to add user to session_invites (self-invite)
                const { db } = await import('../auth.js');
                const {
                    doc, runTransaction, serverTimestamp
                } = await import('firebase/firestore');

                const inviteId = `${sessionId}_${window.app.user.uid}`;
                const inviteRef = doc(db, "session_invites", inviteId);
                const sessionRef = doc(db, "sessoes", sessionId);

                await runTransaction(db, async (transaction) => {
                    // 1. Check if already invited (using deterministic ID)
                    const inviteSnap = await transaction.get(inviteRef);
                    if (inviteSnap.exists()) {
                        throw new Error("Você já faz parte desta jornada.");
                    }

                    // 2. Get session data to check capacity
                    const sessionSnap = await transaction.get(sessionRef);
                    if (!sessionSnap.exists()) throw new Error("Sessão não encontrada.");

                    const sessionData = sessionSnap.data();
                    const current = sessionData.currentPlayers || 0;
                    const max = sessionData.maxPlayers || 6;

                    if (current >= max) {
                        throw new Error("Esta sessão já atingiu o limite de jogadores.");
                    }

                    // 3. Create the invite
                    transaction.set(inviteRef, {
                        sessionId: sessionId,
                        email: window.app.user.email.toLowerCase(),
                        userId: window.app.user.uid,
                        nickname: (await import('./settings.js')).SettingsModule?.currentPrefs?.nickname || window.app.user.displayName || 'Aventureiro',
                        status: 'invited',
                        invitedAt: serverTimestamp(),
                        invitedBy: sessionData.userId
                    });

                    // 4. Update player count
                    transaction.update(sessionRef, {
                        currentPlayers: current + 1
                    });
                });

                window.app.showAlert("Convite recebido! Verifique seus 'Meus Registros' para aceitar e entrar.", "Acesso Concedido");
                window.app.switchView('my-sessions');

            } catch (error) {
                console.error("Erro ao entrar na sessão:", error);
                window.app.showAlert("Erro ao processar entrada: " + error.message);
            } finally {
                window.app.toggleLoading(false);
            }
        } else if (action === 'request-access') {
            try {
                window.app.toggleLoading(true);
                const session = await getSession(sessionId);
                if (!session) throw new Error("Sessão não encontrada.");

                await AccessRequestsModule.createAccessRequest(session, window.app.user);
                window.app.showAlert("Sua solicitação foi enviada ao mestre. Você será notificado quando for aceito.", "Solicitação Enviada");

            } catch (error) {
                console.error("Erro ao solicitar acesso:", error);
                window.app.showAlert("Não foi possível enviar a solicitação: " + error.message);
            } finally {
                window.app.toggleLoading(false);
            }
        }
        return; // Stop after processing button
    }

    // 2. Check if clicked a session card (to open details)
    const card = e.target.closest('.session-card');
    if (card) {
        const sessionId = card.dataset.sessionId;
        if (sessionId) {
            PublicSessionsModule.showSessionDetails(sessionId);
        }
    }
});

window.PublicSessionsModule = PublicSessionsModule;
export default PublicSessionsModule;
