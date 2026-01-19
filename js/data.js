
import { db } from "./auth.js";
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

const COLLECTIONS = {
    CHARACTERS: "fichas",
    MONSTERS: "monstros",
    SESSIONS: "sessoes"
};

export const getCharacters = async (userId) => {
    const q = query(
        collection(db, COLLECTIONS.CHARACTERS),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCharacter = async (id) => {
    const docRef = doc(db, COLLECTIONS.CHARACTERS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
};

export const saveCharacter = async (userId, charData) => {
    const data = {
        ...charData,
        userId,
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

export const getMonsters = async (userId) => {
    const q = query(collection(db, COLLECTIONS.MONSTERS), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveMonster = async (userId, monsterData) => {
    const data = { ...monsterData, userId, updatedAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTIONS.MONSTERS), data);
    return docRef.id;
};

export const getSessions = async (userId) => {
    const q = query(collection(db, COLLECTIONS.SESSIONS), where("userId", "==", userId), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveSession = async (userId, sessionData) => {
    const data = { ...sessionData, userId, updatedAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTIONS.SESSIONS), data);
    return docRef.id;
};
