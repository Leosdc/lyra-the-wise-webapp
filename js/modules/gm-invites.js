/**
 * GM Invites Sub-Module
 * Handles player invitations, cancel, real-time listener, and player sheet viewing.
 */

import { db } from '../auth.js';
import { getAuth } from "firebase/auth";
import {
    collection, addDoc, getDocs, query, where,
    doc, updateDoc, onSnapshot, serverTimestamp, deleteDoc, increment
} from "firebase/firestore";
import { COLLECTIONS } from '../data.js';
import { AccessRequestsModule } from './access-requests.js';

const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Returns invitation-management methods to be mixed into GMPanelModule.
 */
export function createInvitesMixin(ctx) {
    return {
        openInviteModal() {
            if (!ctx.activeSession) {
                window.app.showAlert("Inicie uma sessão antes de convidar heróis.", "Aviso");
                return;
            }
            document.getElementById('gm-invite-modal').classList.remove('hidden');
        },

        closeInviteModal() {
            document.getElementById('gm-invite-modal').classList.add('hidden');
        },

        async sendInvite() {
            const emailInput = document.getElementById('invite-email-input');
            const inputVal = emailInput.value.trim();
            if (!inputVal) return;

            const app = window.app;
            try {
                app.toggleLoading(true, "Enviando mensageiro pelo vácuo...");

                let targetEmail = inputVal.toLowerCase();
                let targetNickname = null;

                // Check if input is a nickname (doesn't contain @)
                if (!inputVal.includes('@')) {
                    const { getUserByNickname } = await import('../data.js');
                    const user = await getUserByNickname(inputVal);
                    if (user) {
                        targetEmail = user.email.toLowerCase();
                        targetNickname = user.nickname;
                    } else {
                        app.showAlert(`Nenhum viajante encontrado com a Identidade Arcana "${inputVal}".`, "Busca Falhou");
                        app.toggleLoading(false);
                        return;
                    }
                }

                // Check if already invited
                const q = query(
                    collection(db, "session_invites"),
                    where("sessionId", "==", ctx.activeSession.id),
                    where("email", "==", targetEmail)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    app.showAlert(`Este viajante já foi convocado para esta jornada.`, "Aviso");
                    app.toggleLoading(false);
                    return;
                }

                const inviteData = {
                    sessionId: ctx.activeSession.id,
                    email: targetEmail,
                    nickname: targetNickname,
                    status: "invited",
                    createdAt: serverTimestamp()
                };

                await addDoc(collection(db, "session_invites"), inviteData);

                // Increment session player count
                const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.activeSession.id);
                await updateDoc(sessionRef, {
                    currentPlayers: increment(1)
                });

                app.showAlert(`O convite foi enviado para ${targetNickname || targetEmail} através do éter arcano.`, "Mensageiro Partiu");
                emailInput.value = "";
                ctx.closeInviteModal();
            } catch (error) {
                console.error("Erro ao enviar convite:", error);
                app.showAlert("O mensageiro se perdeu no caminho das estrelas.", "Falha no Envio");
            } finally {
                app.toggleLoading(false);
            }
        },

        async cancelInvite(inviteId, label) {
            const confirmed = await window.app.showConfirm(
                `Deseja realmente cancelar o convite de "${label}"? O vínculo será desfeito e o acesso negado.`,
                "Cancelar Convite"
            );

            if (!confirmed) return;

            window.app.toggleLoading(true, "Desfazendo vínculo...");
            try {
                await deleteDoc(doc(db, "session_invites", inviteId));

                // Decrement player count
                if (ctx.activeSession) {
                    const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.activeSession.id);
                    await updateDoc(sessionRef, {
                        currentPlayers: increment(-1)
                    });
                }

                window.app.showAlert(`O convite de "${label}" foi revogado.`, "Vínculo Desfeito");
            } catch (error) {
                console.error("Erro ao cancelar convite:", error);
                window.app.showAlert("Falha ao cancelar convite no éter.");
            } finally {
                window.app.toggleLoading(false);
            }
        },

        startInviteListener(sessionId) {
            if (ctx.unsubscribeInvites) ctx.unsubscribeInvites();
            if (ctx.unsubscribeAccessRequests) ctx.unsubscribeAccessRequests();

            const list = document.getElementById('gm-player-list');
            if (!list) return;

            let currentInvites = [];
            let currentRequests = [];

            const renderUnifiedList = () => {
                list.innerHTML = "";
                const gmEmail = getAuth().currentUser.email.toLowerCase();
                let onlineCount = 0;

                // 1. Render Requests (First)
                currentRequests.forEach(req => {
                    const li = document.createElement('li');
                    li.className = `player-item request`;
                    li.innerHTML = `
                        <div class="player-status invited" style="background: var(--gold); box-shadow: 0 0 5px var(--gold);"></div>
                        <div class="player-info">
                            <span class="player-name">${req.requesterNickname || req.requesterName || "Interessado"} <span class="request-badge">Pedido</span></span>
                            <span class="player-sheet pending">Deseja participar da crônica</span>
                        </div>
                        <div class="player-actions">
                            <button class="medieval-btn icon-only accept-glow" title="Aceitar" onclick="GMPanelModule.acceptAccessRequest('${req.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="medieval-btn icon-only reject-glow" title="Recusar" onclick="GMPanelModule.rejectAccessRequest('${req.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                    list.appendChild(li);
                });

                // 2. Render Invites
                currentInvites.forEach(invite => {
                    // IGNORE GM/OWNER in this list
                    if (invite.role === 'gm' || invite.email?.toLowerCase() === gmEmail) {
                        return;
                    }

                    if (['accepted', 'online'].includes(invite.status)) onlineCount++;

                    const rawName = invite.characterName || invite.nickname || invite.displayName || invite.email || "Aventureiro(a)";
                    const safeName = escapeHtml(rawName);
                    const safeCharName = escapeHtml(invite.characterName || (invite.status === 'invited' ? 'Aguardando Aceite...' : 'Escolhendo Ficha...'));
                    const safeInviteId = escapeHtml(invite.id);
                    const safeCharId = escapeHtml(invite.characterId || '');
                    const safeCancelTarget = escapeHtml(invite.nickname || invite.email || 'Aventureiro');

                    const li = document.createElement('li');
                    li.className = `player-item list-item-v2 ${invite.status}`;
                    li.innerHTML = `
                        <div class="player-status ${invite.status}"></div>
                        <div class="player-info">
                            <span class="player-name">${safeName}</span>
                            <span class="player-sheet ${invite.characterId ? 'ready' : 'pending'}">
                                ${safeCharName}
                            </span>
                        </div>
                        <div class="player-actions">
                            ${invite.characterId ? `
                                <button class="medieval-btn icon-only inspiration-glow-btn ${invite.inspiration ? 'active' : ''}" 
                                        title="${invite.inspiration ? 'Retirar Inspiração' : 'Conceder Inspiração'}" 
                                        onclick="GMPanelModule.togglePlayerInspiration('${safeInviteId}', '${safeCharId}', ${!!invite.inspiration})">
                                    <i class="fas fa-star"></i>
                                </button>
                                <button class="medieval-btn icon-only gold-glow" title="Visualizar Ficha" onclick="GMPanelModule.viewPlayerSheet('${safeCharId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            ` : ''}
                            <button class="medieval-btn icon-only delete-glow" title="Cancelar Convite" onclick="GMPanelModule.cancelInvite('${safeInviteId}', '${safeCancelTarget}')">
                                <i class="fas fa-trash-can"></i>
                            </button>
                        </div>
                    `;
                    list.appendChild(li);
                });

                const countEl = document.getElementById('active-player-count');
                if (countEl) countEl.innerText = onlineCount;
            };

            // Invites Listener
            const qi = query(collection(db, "session_invites"), where("sessionId", "==", sessionId));
            ctx.unsubscribeInvites = onSnapshot(qi, (snapshot) => {
                currentInvites = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                const gmEmail = getAuth().currentUser?.email?.toLowerCase();
                ctx._currentInvites = currentInvites.filter(p => p.role !== 'gm' && !p.id.startsWith('self_') && p.email?.toLowerCase() !== gmEmail);
                renderUnifiedList();

                // Atualiza a convocação de heróis do modal VTT caso esteja aberto
                const mapModal = document.getElementById('gm-map-modal');
                if (mapModal && !mapModal.classList.contains('hidden') && typeof ctx.renderVTTControlPanel === 'function') {
                    ctx.renderVTTControlPanel(ctx._currentInvites);
                }
            });

            // Access Requests Listener
            const qr = query(
                collection(db, 'session_access_requests'),
                where('sessionId', '==', sessionId),
                where('status', '==', 'pending')
            );
            ctx.unsubscribeAccessRequests = onSnapshot(qr, (snapshot) => {
                currentRequests = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                renderUnifiedList();
            });
        },

        async acceptAccessRequest(requestId) {
            try {
                window.app.toggleLoading(true, "Abrindo os portões...");
                await AccessRequestsModule.acceptRequest(requestId);
                window.app.showAlert("Viajante aceito na jornada!", "Sucesso");
            } catch (error) {
                console.error("Erro ao aceitar pedido:", error);
                window.app.showAlert("Falha ao aceitar viajante.");
            } finally {
                window.app.toggleLoading(false);
            }
        },

        async rejectAccessRequest(requestId) {
            try {
                const confirmed = await window.app.showConfirm("Deseja realmente ignorar esta solicitação?", "Recusar Acesso");
                if (!confirmed) return;

                window.app.toggleLoading(true, "Fechando os portões...");
                await AccessRequestsModule.rejectRequest(requestId);
            } catch (error) {
                console.error("Erro ao recusar pedido:", error);
                window.app.showAlert("Falha ao recusar pedido.");
            } finally {
                window.app.toggleLoading(false);
            }
        },

        formatStatus(status) {
            switch (status) {
                case 'invited': return 'Convidado';
                case 'accepted': return 'Aceitou';
                case 'online': return 'Online';
                case 'refused': return 'Recusado';
                default: return 'Desconhecido';
            }
        },

        async viewPlayerSheet(characterId) {
            if (!characterId) return;
            window.app.toggleLoading(true, "Lendo os anais do herói...");
            try {
                const { getCharacter } = await import('../data.js');
                const character = await getCharacter(characterId);
                if (character) {
                    const { SheetModule } = await import('./sheet.js');
                    window.app.openModal('character-sheet');

                    SheetModule.populateSheet(character, {
                        ...window.app.getSheetContext(),
                        isInspection: true
                    });
                    SheetModule.switchSheetTab('geral', {
                        ...window.app.getSheetContext(),
                        isInspection: true
                    });
                } else {
                    window.app.showAlert("Esta ficha parece ter se desmaterializado.");
                }
            } catch (err) {
                console.error("Erro ao abrir ficha do jogador:", err);
                window.app.showAlert("Falha ao acessar os registros do herói.");
            } finally {
                window.app.toggleLoading(false);
            }
        }
    };
}
