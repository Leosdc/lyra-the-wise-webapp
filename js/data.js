
import { db, storage } from "./auth.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const COLLECTIONS = {
    CHARACTERS: "fichas",
    MONSTERS: "monstros",
    SESSIONS: "sessoes",
    GLOBAL_ITEMS: "itens_database",
    USER_ITEMS: "user_items"
};

// Upload character token image
export const uploadCharacterToken = async (userId, characterId, file) => {
    const storageRef = ref(storage, `tokens/${userId}/${characterId}.jpg`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};

export const getCharacters = async (userId, systemId) => {
    try {
        const q = query(
            collection(db, COLLECTIONS.CHARACTERS),
            where("userId", "==", userId),
            where("systemId", "==", systemId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
        if (error.code === 'permission-denied') {
            console.error('🔒 Acesso negado. Verifique suas permissões.');
            // Only throw user-friendly error if needed, or handle upstream
            throw new Error('Permissão negada ao acessar os anais dos personagens.');
        }
        throw error;
    }
};

export const getCharacter = async (id) => {
    const docRef = doc(db, COLLECTIONS.CHARACTERS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
};

export const updateCharacter = async (charId, updates) => {
    const docRef = doc(db, COLLECTIONS.CHARACTERS, charId);
    const data = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, data);
};

export const saveCharacter = async (userId, systemId, charData) => {
    const data = {
        ...charData,
        userId,
        systemId,
        updatedAt: new Date().toISOString()
    };

    if (charData.id) {
        const docRef = doc(db, COLLECTIONS.CHARACTERS, charData.id);
        delete data.id;
        await updateDoc(docRef, data);
        return charData.id;
    } else {
        const docRef = await addDoc(collection(db, COLLECTIONS.CHARACTERS), data);
        return docRef.id;
    }
};
export const deleteCharacter = async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.CHARACTERS, id));
};

// --- Monsters ---
export const getMonsters = async (userId, systemId) => {
    const q = query(
        collection(db, COLLECTIONS.MONSTERS),
        where("userId", "==", userId),
        where("systemId", "==", systemId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const getMonster = async (id) => {
    const docRef = doc(db, COLLECTIONS.MONSTERS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
};

export const saveMonster = async (userId, systemId, monsterData) => {
    const data = { ...monsterData, userId, systemId, updatedAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTIONS.MONSTERS), data);
    return docRef.id;
};

export const deleteMonster = async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.MONSTERS, id));
};

// --- Traps (missing) ---
const TRAPS_COLLECTION = "armadilhas"; // Assuming collection name
export const getTraps = async (userId, systemId) => {
    const q = query(
        collection(db, TRAPS_COLLECTION),
        where("userId", "==", userId),
        where("systemId", "==", systemId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const getTrap = async (id) => {
    const docRef = doc(db, TRAPS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
};

export const saveTrap = async (userId, systemId, trapData) => {
    const data = { ...trapData, userId, systemId, updatedAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, TRAPS_COLLECTION), data);
    return docRef.id;
};

export const deleteTrap = async (id) => {
    await deleteDoc(doc(db, TRAPS_COLLECTION, id));
};

// --- Sessions ---
export const getSessions = async (userId, systemId) => {
    const q = query(
        collection(db, COLLECTIONS.SESSIONS),
        where("userId", "==", userId),
        where("systemId", "==", systemId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const getSession = async (id) => {
    const docRef = doc(db, COLLECTIONS.SESSIONS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
};

export const saveSession = async (userId, systemId, sessionData) => {
    const data = { ...sessionData, userId, systemId, updatedAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTIONS.SESSIONS), data);
    return docRef.id;
};

export const deleteSession = async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.SESSIONS, id));
};

// --- Global Items Database ---
export const getGlobalItems = async (systemId) => {
    try {
        const q = query(
            collection(db, COLLECTIONS.GLOBAL_ITEMS),
            where("systemId", "==", systemId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Erro ao buscar itens globais:", error);
        return [];
    }
};

// --- User Created Items ---
export const saveUserItem = async (userId, userEmail, itemData) => {
    const data = {
        ...itemData,
        userId,
        createdByEmail: userEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sharedWith: itemData.sharedWith || []
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.USER_ITEMS), data);
    return docRef.id;
};

export const getUserItems = async (userId, userEmail) => {
    try {
        // Query items created by the user
        const qCreated = query(
            collection(db, COLLECTIONS.USER_ITEMS),
            where("userId", "==", userId)
        );

        // Query items shared with the user's email
        const qShared = query(
            collection(db, COLLECTIONS.USER_ITEMS),
            where("sharedWith", "array-contains", userEmail)
        );

        const [snapCreated, snapShared] = await Promise.all([
            getDocs(qCreated),
            getDocs(qShared)
        ]);

        const createdItems = snapCreated.docs.map(doc => ({ id: doc.id, isOwner: true, ...doc.data() }));
        const sharedItems = snapShared.docs.map(doc => ({ id: doc.id, isOwner: false, ...doc.data() }));

        // Deduplicate in case an item meets both criteria (unlikely but safe)
        const allItems = [...createdItems];
        sharedItems.forEach(item => {
            if (!allItems.find(i => i.id === item.id)) {
                allItems.push(item);
            }
        });

        return allItems.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
        console.error("Erro ao buscar itens do usuário:", error);
        return [];
    }
};

export const shareItem = async (itemId, targetEmail) => {
    const docRef = doc(db, COLLECTIONS.USER_ITEMS, itemId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Item não encontrado.");

    const sharedWith = docSnap.data().sharedWith || [];
    if (!sharedWith.includes(targetEmail)) {
        sharedWith.push(targetEmail);
        await updateDoc(docRef, { sharedWith });
    }
    return true;
};

export const deleteUserItem = async (itemId, userId) => {
    // Only owner can delete
    const docRef = doc(db, COLLECTIONS.USER_ITEMS, itemId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().userId === userId) {
        await deleteDoc(docRef);
        return true;
    }
    return false;
};
