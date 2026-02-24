/**
 * GM Session Sub-Module
 * Handles session creation, editing, starting (manual/AI), and context building.
 */

import { db } from '../auth.js';
import { getAuth } from "firebase/auth";
import {
    collection, getDocs, query, where,
    doc, updateDoc, onSnapshot, serverTimestamp, setDoc
} from "firebase/firestore";
import { COLLECTIONS } from '../data.js';

/**
 * Returns session-management methods to be mixed into GMPanelModule.
 */
export function createSessionMixin(ctx) {
    return {
        async startSessionManual() {
            if (!ctx.activeSession) return;
            const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.activeSession.id);
            await updateDoc(sessionRef, {
                started: true,
                mode: 'manual',
                sessionStatus: 'active',
                activeChapterIndex: 0
            });
            ctx.activeSession.started = true;
            ctx.activeSession.mode = 'manual';

            window.open(`session-stage.html?id=${ctx.activeSession.id}`, '_blank');
            ctx.showStoryArea("");
        },

        async startSessionAI() {
            if (!ctx.activeSession) return;

            window.app.toggleLoading(true, "O Oráculo está consultando os anais...");

            try {
                const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.activeSession.id);

                await updateDoc(sessionRef, {
                    started: true,
                    mode: 'oracle',
                    sessionStatus: 'active',
                    activeChapterIndex: 0
                });

                // Ensure GM is a participant in Oracle mode
                const invitesRef = collection(db, "session_invites");
                const q = query(invitesRef,
                    where("sessionId", "==", ctx.activeSession.id),
                    where("email", "==", getAuth().currentUser.email.toLowerCase())
                );
                const inviteSnap = await getDocs(q);

                if (inviteSnap.empty) {
                    console.log("🛠️ GMPanel: Adicionando mestre como participante para o Oráculo (Idempotente)...");
                    const selfInviteId = `self_${ctx.activeSession.id}_${getAuth().currentUser.uid}`;
                    await setDoc(doc(invitesRef, selfInviteId), {
                        sessionId: ctx.activeSession.id,
                        email: getAuth().currentUser.email.toLowerCase(),
                        role: 'gm',
                        status: "online",
                        invitedAt: serverTimestamp(),
                        invitedBy: getAuth().currentUser.uid,
                        isSelfInvite: true
                    });
                }

                ctx.activeSession.started = true;
                ctx.activeSession.mode = 'oracle';

                const { default: OracleModule } = await import('./oracle.js');
                await OracleModule.initializeOracle(ctx.activeSession.id, ctx.activeSession);

                ctx.showStoryArea("Oráculo inicializado - veja a narrativa na sessão");
                window.open(`session-stage.html?id=${ctx.activeSession.id}`, '_blank');
                window.app.showAlert("O Oráculo manifestou a história!", "Sucesso");
            } catch (err) {
                console.error("Erro na inicialização do Oráculo:", err);
                window.app.showAlert("O Oráculo falhou em conectar os pontos: " + err.message);
            } finally {
                window.app.toggleLoading(false);
            }
        },

        async getCompleteContext() {
            const { getModuleItems, COLLECTIONS, getUserMonsters, getGlobalMonsters, getGlobalItems, getUserItems, getCharacter } = await import('../data.js');
            const userId = getAuth().currentUser.uid;
            const systemId = window.app.currentSystem;
            const userEmail = getAuth().currentUser.email;

            const npcs = await getUserMonsters(userId, userEmail);
            const itemGlobals = await getGlobalItems(systemId);
            const itemUsers = await getUserItems(userId, userEmail);
            const items = [...itemGlobals, ...itemUsers];

            const monsterGlobals = await getGlobalMonsters(systemId);
            const monsterUsers = await getUserMonsters(userId, userEmail);
            const monsters = [...monsterGlobals, ...monsterUsers];

            const encounters = await getModuleItems(COLLECTIONS.ENCOUNTERS, userId, systemId);
            const campaigns = await getModuleItems(COLLECTIONS.CAMPAIGNS, userId, systemId);
            const plots = await getModuleItems(COLLECTIONS.PLOTS, userId, systemId);
            const scenes = await getModuleItems(COLLECTIONS.SCENES, userId, systemId);
            const motivations = await getModuleItems(COLLECTIONS.MOTIVATIONS, userId, systemId);

            const filterLinked = (all, type) => all.filter(x => (ctx.activeSession[`linked_${type}s`] || []).includes(x.id));

            // Get Player Character Data
            const players = [];
            const qInvites = query(collection(db, "session_invites"), where("sessionId", "==", ctx.activeSession.id));
            const inviteSnapshot = await getDocs(qInvites);
            for (const invDoc of inviteSnapshot.docs) {
                const data = invDoc.data();
                if (data.characterId) {
                    const char = await getCharacter(data.characterId);
                    if (char) {
                        players.push({
                            name: char.bio?.name || data.characterName,
                            race: char.bio?.race,
                            class: char.bio?.class,
                            level: char.bio?.level,
                            background: char.bio?.background
                        });
                    }
                }
            }

            return {
                title: ctx.activeSession.title,
                system: systemId,
                players: players,
                npcs: filterLinked(npcs, 'npc').map(n => ({ name: n.name, details: n.description || n.story })),
                items: filterLinked(items, 'item').map(i => ({ name: i.title || i.name, details: i.description })),
                monsters: filterLinked(monsters, 'monster').map(m => ({ name: m.name, details: m.stats || m.description })),
                encounters: filterLinked(encounters, 'encounter').map(e => ({ name: e.title || e.name, details: e.description })),
                campaigns: filterLinked(campaigns, 'campaign').map(c => ({ name: c.title || c.name, details: c.description })),
                plots: filterLinked(plots, 'plot').map(p => ({ name: p.title || p.name, details: p.description })),
                scenes: filterLinked(scenes, 'scene').map(s => ({ name: s.title || s.name, details: s.description })),
                motivations: filterLinked(motivations, 'motivation').map(m => ({ name: m.title || m.name, details: m.description }))
            };
        },

        openSessionCreateModal(isEdit = false) {
            ctx.isEditing = isEdit;
            const modal = document.getElementById('gm-session-create-modal');
            if (!modal) return;

            const titleInput = document.getElementById('gm-new-session-title');
            const modalTitle = modal.querySelector('.modal-title');

            if (isEdit && ctx.activeSession) {
                if (titleInput) titleInput.value = ctx.activeSession.title;
                if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-pen-fancy"></i> Alterar Destino';
                modal.classList.remove('hidden');
            } else {
                ctx.openChoiceModal();
            }
        },

        closeSessionCreateModal() {
            document.getElementById('gm-session-create-modal')?.classList.add('hidden');
        },

        openEditSessionModal() {
            if (!ctx.activeSession) return;
            ctx.openSessionCreateModal(true);
        },

        async updateSessionMetadata(newTitle) {
            if (!ctx.activeSession) return;

            try {
                const docRef = doc(db, COLLECTIONS.SESSIONS, ctx.activeSession.id);
                await updateDoc(docRef, {
                    title: newTitle,
                    updatedAt: serverTimestamp()
                });

                ctx.activeSession.title = newTitle;
                document.getElementById('active-session-title').innerText = newTitle;
                window.app.showAlert("O título da saga foi alterado.", "Cronista Atento");
            } catch (err) {
                console.error("Erro ao atualizar sessão:", err);
                window.app.showAlert("Não foi possível alterar os anais.", "Erro");
            }
        },

        async confirmMetadataUpdate() {
            const titleInput = document.getElementById('gm-new-session-title');
            const title = titleInput.value?.trim();
            if (!title) return;

            await ctx.updateSessionMetadata(title);
            ctx.closeSessionCreateModal();
        }
    };
}
