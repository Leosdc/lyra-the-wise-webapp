/**
 * Access Requests Module
 * Manages player requests to join active public sessions
 */

import { db } from '../auth.js';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp,
    onSnapshot,
    increment,
    getDoc
} from 'firebase/firestore';

export const AccessRequestsModule = {
    /**
     * Create a new access request for a session
     */
    async createAccessRequest(session, user) {
        try {
            // Check if there's already a pending request
            const existing = await this.getExistingRequest(session.id, user.uid);
            if (existing) {
                throw new Error("Já existe uma solicitação pendente para esta sessão.");
            }

            const requestData = {
                sessionId: session.id,
                sessionTitle: session.title,
                requesterId: user.uid,
                requesterEmail: user.email,
                requesterNickname: (await import('./settings.js')).SettingsModule?.currentPrefs?.nickname || user.displayName || "Aventureiro Misterioso",
                requesterName: user.displayName || "Aventureiro(a)",
                status: 'pending', // pending, accepted, rejected
                createdAt: serverTimestamp(),
                gmId: session.userId // The session creator
            };

            const docRef = await addDoc(collection(db, 'session_access_requests'), requestData);
            console.log("✅ Solicitação de acesso enviada:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("❌ Erro ao criar solicitação de acesso:", error);
            throw error;
        }
    },

    /**
     * Check if user already has a pending or accepted request
     */
    async getExistingRequest(sessionId, userId) {
        const q = query(
            collection(db, 'session_access_requests'),
            where('sessionId', '==', sessionId),
            where('requesterId', '==', userId),
            where('status', 'in', ['pending', 'accepted'])
        );
        const snapshot = await getDocs(q);
        return snapshot.empty ? null : snapshot.docs[0].data();
    },

    /**
     * Get pending requests for a specific session (for GM)
     */
    async getPendingRequests(sessionId) {
        const q = query(
            collection(db, 'session_access_requests'),
            where('sessionId', '==', sessionId),
            where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Listen for pending requests for a session (Real-time)
     */
    listenToRequests(sessionId, callback) {
        const q = query(
            collection(db, 'session_access_requests'),
            where('sessionId', '==', sessionId),
            where('status', '==', 'pending')
        );
        return onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(requests);
        });
    },

    /**
     * Accept an access request
     */
    async acceptRequest(requestId) {
        try {
            const requestRef = doc(db, 'session_access_requests', requestId);
            const snapshot = await getDocs(query(collection(db, 'session_access_requests'), where('__name__', '==', requestId)));
            if (snapshot.empty) throw new Error("Solicitação não encontrada");

            const reqData = snapshot.docs[0].data();

            // 1. Update request status
            await updateDoc(requestRef, {
                status: 'accepted',
                respondedAt: serverTimestamp()
            });

            // 2. Create session invite
            await addDoc(collection(db, "session_invites"), {
                sessionId: reqData.sessionId,
                email: reqData.requesterEmail.toLowerCase(),
                status: 'invited',
                invitedAt: serverTimestamp(),
                invitedBy: reqData.gmId
            });

            // 3. Increment session player count
            const sessionRef = doc(db, 'sessoes', reqData.sessionId);
            await updateDoc(sessionRef, {
                currentPlayers: increment(1)
            });

            console.log("✅ Solicitação aceita, convite criado e contador incrementado:", requestId);
            return true;
        } catch (error) {
            console.error("❌ Erro ao aceitar solicitação:", error);
            throw error;
        }
    },

    /**
     * Reject an access request
     */
    async rejectRequest(requestId) {
        try {
            const requestRef = doc(db, 'session_access_requests', requestId);
            await updateDoc(requestRef, {
                status: 'rejected',
                respondedAt: serverTimestamp()
            });
            console.log("❌ Solicitação rejeitada:", requestId);
            return true;
        } catch (error) {
            console.error("❌ Erro ao rejeitar solicitação:", error);
            throw error;
        }
    }
};
