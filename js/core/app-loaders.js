/**
 * App Loaders Sub-Module
 * Handles data loading (characters, monsters, traps, sessions) and invitation management.
 */

import {
    getCharacters, getTraps, getSessions, getInvites
} from '../data.js';
import { NavigationModule } from '../modules/navigation.js';
import { MonsterModule } from '../modules/monsters.js';
import { translateFirebaseError } from '../modules/utils.js';

// System definitions (shared constant)
const SUPPORTED_SYSTEMS = [
    { id: "dnd5e", name: "D&D 5ª Edição", icon: "fa-dragon" },
    { id: "tormenta20", name: "Tormenta 20", icon: "fa-shield-halved" },
    { id: "coc", name: "Call of Cthulhu", icon: "fa-skull" },
    { id: "custom", name: "Sistema Customizado", icon: "fa-cogs" }
];

/**
 * Returns loader-related methods to be mixed into the app object.
 */
export function createLoadersMixin(ctx) {
    return {
        async loadCharacters() {
            if (!ctx.user) return;
            const container = document.getElementById('fichas-list');

            const titleEl = document.querySelector('#fichas .view-header h2');
            if (titleEl) {
                const system = SUPPORTED_SYSTEMS.find(s => s.id === ctx.currentSystem);
                const systemName = system ? system.name : ctx.currentSystem.toUpperCase();
                titleEl.innerHTML = `<i class="fas fa-user-shield"></i> Seus Personagens (${systemName})`;
            }

            const chars = await getCharacters(ctx.user.uid, ctx.currentSystem);
            container.innerHTML = chars.length ? chars.map(c => NavigationModule.renderCard(c, 'character')).join('') : '<p class="empty-state">Sem personagens.</p>';
        },

        async loadMonsters() {
            if (!ctx.user) return;

            const titleEl = document.querySelector('#monstros .view-header h2');
            if (titleEl) {
                const system = SUPPORTED_SYSTEMS.find(s => s.id === ctx.currentSystem);
                const systemName = system ? system.name : ctx.currentSystem.toUpperCase();
                titleEl.innerHTML = `<i class="fas fa-dragon"></i> Bestiário Arcano (${systemName})`;
            }

            MonsterModule.render();
        },

        async loadTraps() {
            if (!ctx.user) return;
            const container = document.getElementById('armadilhas-grid');

            const titleEl = document.querySelector('#armadilhas .view-header h2');
            if (titleEl) {
                const system = SUPPORTED_SYSTEMS.find(s => s.id === ctx.currentSystem);
                const systemName = system ? system.name : ctx.currentSystem.toUpperCase();
                titleEl.innerHTML = `<i class="fas fa-skull-crossbones"></i> Armadilhas & Perigos (${systemName})`;
            }

            const items = await getTraps(ctx.user.uid, ctx.currentSystem);
            container.innerHTML = items.length ? items.map(c => NavigationModule.renderCard(c, 'trap')).join('') : '<p class="empty-state">Nenhuma armadilha.</p>';
        },

        async loadSessions(roleFilter = 'all') {
            if (!ctx.user) return;
            const container = document.getElementById('sessions-list');

            const titleEl = document.querySelector('#sessoes .view-header h2');
            if (titleEl) {
                const system = SUPPORTED_SYSTEMS.find(s => s.id === ctx.currentSystem);
                const systemName = system ? system.name : ctx.currentSystem.toUpperCase();
                titleEl.innerHTML = `<i class="fas fa-feather-pointed"></i> Diários de Sessão (${systemName})`;
            }

            const items = await getSessions(ctx.user.uid, ctx.user.email, ctx.currentSystem, roleFilter);

            const { PublicSessionsModule } = await import('../modules/public-sessions.js');
            const hydratedItems = [];
            for (const item of items) {
                if (!item.masterNickname && item.userId) {
                    item.masterNickname = await PublicSessionsModule.getNickname(item.userId);
                }
                hydratedItems.push(item);
            }

            container.innerHTML = hydratedItems.length ? hydratedItems.map(c => NavigationModule.renderCard(c, 'session')).join('') : '<p class="empty-state">Nenhuma sessão.</p>';

            ctx.renderInvites();
        },

        async renderInvites() {
            if (!ctx.user) return;
            const mainContainer = document.getElementById('invites-list');
            const modalContainer = document.getElementById('modal-notifications-list');

            const invites = await getInvites(ctx.user.email);

            const renderHTML = (items) => {
                if (items.length === 0) return '<p class="empty-state">O horizonte está calmo. Nenhuma nova mensagem dos corvos.</p>';
                return items.map(inv => `
                    <div class="notif-card invite parchment-mini" data-id="${inv.id}">
                        <div class="notif-header">
                            <i class="fas fa-envelope-open-text"></i>
                            <strong>Nova Jornada Disponível</strong>
                        </div>
                        <div class="notif-body">
                            Você foi convocado para a sessão <strong>${inv.sessionId.substring(0, 8)}...</strong>
                        </div>
                        <div class="notif-actions">
                            <button class="medieval-btn small accept-invite"><i class="fas fa-check"></i> Aceitar</button>
                            <button class="medieval-btn small secondary refuse-invite"><i class="fas fa-times"></i> Recusar</button>
                        </div>
                    </div>
                `).join('');
            };

            const html = renderHTML(invites);

            if (mainContainer) {
                mainContainer.innerHTML = invites.length ? `
                    <div class="invites-header">
                        <h3><i class="fas fa-envelope-open-text"></i> Convites de Jornada</h3>
                    </div>
                    <div class="invites-grid">${html}</div>
                ` : '';
                mainContainer.classList.toggle('hidden', invites.length === 0);
            }

            if (modalContainer) {
                modalContainer.innerHTML = html;
            }

            [mainContainer, modalContainer].forEach(container => {
                if (!container) return;
                container.querySelectorAll('.accept-invite').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.closest('.notif-card, .invite-card').dataset.id;
                        ctx.handleInviteDecision(id, 'accepted');
                    });
                });

                container.querySelectorAll('.refuse-invite').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.closest('.notif-card, .invite-card').dataset.id;
                        ctx.handleInviteDecision(id, 'refused');
                    });
                });
            });
        },

        async handleInviteDecision(inviteId, status) {
            try {
                ctx.toggleLoading(true);
                const { db } = await import('../auth.js');
                const { doc, updateDoc, deleteDoc } = await import('firebase/firestore');

                const inviteRef = doc(db, "session_invites", inviteId);
                if (status === 'accepted') {
                    const updateData = { status: 'accepted' };
                    if (ctx.user?.uid) {
                        updateData.uid = ctx.user.uid;
                    }
                    await updateDoc(inviteRef, updateData);
                    ctx.showAlert("Você agora faz parte desta jornada!", "Convite Aceito");
                } else {
                    await deleteDoc(inviteRef);
                    ctx.showAlert("O mensageiro retornou ao vácuo.", "Convite Recusado");
                }

                ctx.loadSessions();
            } catch (error) {
                console.error("Erro ao processar convite:", error);
                ctx.showAlert(translateFirebaseError(error), "Erro Arcano");
            } finally {
                ctx.toggleLoading(false);
            }
        },

        startInvitationListener(user) {
            if (ctx.inviteUnsubscribe) ctx.inviteUnsubscribe();

            import('../auth.js').then(({ db }) => {
                import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
                    const q = query(
                        collection(db, "session_invites"),
                        where("email", "==", user.email.toLowerCase()),
                        where("status", "==", "invited")
                    );

                    ctx.inviteUnsubscribe = onSnapshot(q, (snapshot) => {
                        if (!snapshot.empty) {
                            const count = snapshot.size;
                            const badge = document.querySelector('.notification-badge');
                            if (badge) {
                                badge.textContent = count;
                                badge.style.display = 'flex';
                            }

                            if (ctx.currentView === 'sessoes') {
                                ctx.renderInvites();
                            }
                        } else {
                            const badge = document.querySelector('.notification-badge');
                            if (badge && badge.textContent !== '!') {
                                badge.style.display = 'none';
                            }
                            if (ctx.currentView === 'sessoes') {
                                ctx.renderInvites();
                            }
                        }
                    });
                });
            });
        }
    };
}

export { SUPPORTED_SYSTEMS };
