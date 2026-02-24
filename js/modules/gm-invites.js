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

            const q = query(
                collection(db, "session_invites"),
                where("sessionId", "==", sessionId)
            );

            let previousReadyCount = -1;

            ctx.unsubscribeInvites = onSnapshot(q, (snapshot) => {
                const list = document.getElementById('gm-player-list');
                if (!list) return;

                list.innerHTML = "";
                let totalInvited = snapshot.size;
                let readyCount = 0;
                let onlineCount = 0;
                const gmEmail = getAuth().currentUser.email.toLowerCase();

                snapshot.forEach(docSnap => {
                    const invite = docSnap.data();

                    // IGNORE GM/OWNER in this list
                    if (invite.role === 'gm' || invite.email.toLowerCase() === gmEmail) {
                        return;
                    }

                    const isReady = invite.characterId && invite.status !== 'refused';
                    if (isReady) readyCount++;
                    if (['accepted', 'online'].includes(invite.status)) onlineCount++;

                    const li = document.createElement('li');
                    li.className = `player-item list-item-v2 ${invite.status}`;
                    li.dataset.type = 'character';
                    li.dataset.id = invite.characterId;
                    li.dataset.mode = 'inspection';
                    li.innerHTML = `
                        <div class="player-status ${invite.status}"></div>
                        <div class="player-info">
                            <span class="player-name">${invite.nickname || invite.displayName || "Aventureiro(a)"}</span>
                            <span class="player-sheet ${invite.characterId ? 'ready' : 'pending'}">
                                ${invite.characterName || (invite.status === 'invited' ? 'Aguardando Aceite...' : 'Escolhendo Ficha...')}
                            </span>
                        </div>
                        <div class="player-actions">
                            ${invite.characterId ? `
                                <button class="medieval-btn icon-only gold-glow" title="Visualizar Ficha" onclick="GMPanelModule.viewPlayerSheet('${invite.characterId}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            ` : ''}
                            <button class="medieval-btn icon-only delete-glow" title="Cancelar Convite" onclick="GMPanelModule.cancelInvite('${docSnap.id}', '${invite.nickname || invite.email}')">
                                <i class="fas fa-trash-can"></i>
                            </button>
                        </div>
                    `;
                    list.appendChild(li);
                });

                previousReadyCount = readyCount;

                const countEl = document.getElementById('active-player-count');
                if (countEl) countEl.innerText = onlineCount;
            });
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
