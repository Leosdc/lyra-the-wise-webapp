import { logger } from './logger.js';
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
    setDoc,
    updateDoc,
    deleteDoc,
    getCountFromServer,
    arrayUnion,
    arrayRemove,
    limit,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const COLLECTIONS = {
    CHARACTERS: "fichas",
    MONSTERS: "monstros",
    GLOBAL_MONSTERS: "bestiary",
    SESSIONS: "sessoes",
    GLOBAL_ITEMS: "itens_database",
    USER_ITEMS: "user_items",
    USERS: "user_preferences",
    CONFIG: "global_config",
    SPELLS: "spells",
    USER_SPELLS: "user_spells",
    USER_MONSTERS: "user_monsters",
    GLOBAL_CHAT: "global_chat",
    CONTACTS: "contacts",
    // New Modules
    VILLAINS: "user_villains",
    NPCS: "user_npcs",
    CAMPAIGNS: "user_campaigns",
    ENCOUNTERS: "user_encounters",
    PUZZLES: "user_puzzles",
    TREASURES: "user_treasures",
    SCENES: "user_scenes",
    PLOTS: "user_plots",
    MOTIVATIONS: "user_motivations",
    RULES: "user_rules",
    NAMES: "user_names",
    TRAPS: "user_traps"
};


export const getCollectionCount = async (collectionName) => {
    try {
        const coll = collection(db, collectionName);
        const snapshot = await getCountFromServer(coll);
        return snapshot.data().count;
    } catch (error) {
        logger.error(`Erro ao contar coleção ${collectionName}:`, error);
        return 0;
    }
};

export { COLLECTIONS };


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
            logger.error('🔒 Acesso negado. Verifique suas permissões.');

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



// --- Bestiary (Global/System) ---
export const getGlobalMonsters = async (systemId) => {
    logger.debug("Executing getGlobalMonsters v3 (Resilient)");
    try {
        // 1. Try System Bestiary (New Structure)
        // This might fail if user is not logged in (Permission Denied) as per rules
        try {
            const monstersRef = collection(db, 'systems', systemId, COLLECTIONS.GLOBAL_MONSTERS);
            const q = query(monstersRef);
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (primaryError) {
            logger.info("Info: Primary bestiary fetch restricted, using secondary collection fallback.");
            // Verify if permission error, continue to fallback
        }

        // 2. Fallback to root 'monstros' collection (Legacy/Public)
        // Rule: allow read: if true; (Public access)
        logger.debug("Attempting fallback to legacy monsters...");
        const dbQ = query(
            collection(db, COLLECTIONS.MONSTERS),
            where("systemId", "==", systemId)
        );
        const dbSnapshot = await getDocs(dbQ);
        return dbSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Error getting global monsters (Final):", error);
        return [];
    }
};


// --- User Monsters (Personal/Shared) ---
export const saveUserMonster = async (userId, userEmail, monsterData) => {
    const data = {
        ...monsterData,
        userId,
        createdByEmail: userEmail,
        createdByNickname: monsterData.createdByNickname || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sharedWith: monsterData.sharedWith || []
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.USER_MONSTERS), data);
    return docRef.id;
};



export const updateUserMonster = async (monsterId, monsterData) => {
    const docRef = doc(db, COLLECTIONS.USER_MONSTERS, monsterId);
    const data = {
        ...monsterData,
        updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, data);
};

export const deleteUserMonster = async (monsterId, userId) => {
    const docRef = doc(db, COLLECTIONS.USER_MONSTERS, monsterId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().userId === userId) {
        await deleteDoc(docRef);
        return true;
    }
    return false;
};
export const getMonster = async (id) => {
    console.log("Executing getMonster v2 (System Aware)"); // debug version
    // Try global in current system (default to dnd5e if not found, or all systems)
    // Since we don't have systemId passed, we try 'dnd5e' as it's the main one.
    // Ideally this function should accept systemId.
    const systemId = localStorage.getItem('lyra_current_system') || 'dnd5e';

    try {
        let docRef = doc(db, 'systems', systemId, COLLECTIONS.GLOBAL_MONSTERS, id);
        let snap = await getDoc(docRef);
        if (snap.exists()) return { id: snap.id, ...snap.data(), systemId };

        // Try user monsters
        docRef = doc(db, COLLECTIONS.USER_MONSTERS, id);
        snap = await getDoc(docRef);
        if (snap.exists()) return { id: snap.id, ...snap.data(), description: snap.data().description || snap.data().desc };
    } catch (e) {
        console.error("Error fetching monster:", e);
    }

    return null;
};

export const getUserMonsters = async (userId, userEmail) => {
    try {
        const qCreated = query(
            collection(db, COLLECTIONS.USER_MONSTERS),
            where("userId", "==", userId)
        );

        const qShared = query(
            collection(db, COLLECTIONS.USER_MONSTERS),
            where("sharedWith", "array-contains", userEmail)
        );

        const [snapCreated, snapShared] = await Promise.all([
            getDocs(qCreated),
            getDocs(qShared)
        ]);

        const createdMonsters = snapCreated.docs.map(doc => ({ ...doc.data(), id: doc.id, isOwner: true }));
        const sharedMonsters = snapShared.docs.map(doc => ({ ...doc.data(), id: doc.id, isOwner: false }));

        const allMonsters = [...createdMonsters];
        sharedMonsters.forEach(monster => {
            if (!allMonsters.find(m => m.id === monster.id)) {
                allMonsters.push(monster);
            }
        });

        return allMonsters.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
        console.error("Erro ao buscar monstros do usuário:", error);
        return [];
    }
};

export const shareMonster = async (monsterId, targetEmail) => {
    const docRef = doc(db, COLLECTIONS.USER_MONSTERS, monsterId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Monstro não encontrado.");

    const sharedWith = docSnap.data().sharedWith || [];
    if (!sharedWith.includes(targetEmail)) {
        sharedWith.push(targetEmail);
        await updateDoc(docRef, { sharedWith });
    }
    return true;
};

const TRAPS_COLLECTION = "armadilhas";
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


export const getSpells = async (systemId) => {
    try {
        let spells = [];
        const seenIds = new Set();

        // 1. Try System Spells (Nested Structure)
        if (systemId) {
            try {
                console.log(`[DataModule] Searching nested spells for system: ${systemId}...`);
                const spellsRef = collection(db, 'systems', systemId, COLLECTIONS.SPELLS);
                const qSnapshot = await getDocs(query(spellsRef));
                console.log(`[DataModule] Nested result: ${qSnapshot.size} spells.`);

                qSnapshot.docs.forEach(doc => {
                    if (!seenIds.has(doc.id)) {
                        spells.push({ id: doc.id, ...doc.data() });
                        seenIds.add(doc.id);
                    }
                });
            } catch (e) {
                console.warn("[DataModule] Nested spells fetch failed:", e);
            }
        }

        // 2. Fetch root 'spells' (Legacy/Global)
        console.log(`[DataModule] Searching root spells for system: ${systemId}...`);
        const rootQ = query(
            collection(db, COLLECTIONS.SPELLS),
            where("systemId", "==", systemId)
        );
        const rootSnapshot = await getDocs(rootQ);
        console.log(`[DataModule] Root result: ${rootSnapshot.size} spells.`);

        rootSnapshot.docs.forEach(doc => {
            if (!seenIds.has(doc.id)) {
                spells.push({ id: doc.id, ...doc.data() });
                seenIds.add(doc.id);
            }
        });

        console.log(`[DataModule] Total spells merged: ${spells.length}`);
        return spells;

    } catch (error) {
        console.error("Erro ao buscar grimório:", error);
        return [];
    }
};

export const getSpell = async (systemId, spellId) => {
    try {
        const docRef = doc(db, 'systems', systemId, COLLECTIONS.SPELLS, spellId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
        return null;
    } catch (error) {
        console.error("Erro ao buscar feitiço:", error);
        return null;
    }
};

export const getSystemData = async (systemId) => {
    try {
        const docRef = doc(db, 'systems', systemId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
        return null;
    } catch (error) {
        console.error("Erro ao buscar dados do sistema:", error);
        return null;
    }
};

export const getSystemRules = async (systemId) => {
    try {
        const rulesRef = collection(db, 'systems', systemId, COLLECTIONS.RULES);
        const qSnapshot = await getDocs(query(rulesRef));
        if (!qSnapshot.empty) {
            return qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        return [];
    } catch (error) {
        console.error("Erro ao buscar regras do sistema:", error);
        return [];
    }
};


export const getSessions = async (userId, userEmail, systemId) => {
    // 1. Get owned sessions
    const qOwned = query(
        collection(db, COLLECTIONS.SESSIONS),
        where("userId", "==", userId),
        where("systemId", "==", systemId)
    );

    // 2. Get joined sessions (where invite status is accepted, online, or offline)
    const qJoined = query(
        collection(db, "session_invites"),
        where("email", "==", userEmail.toLowerCase()),
        where("status", "in", ["accepted", "online", "offline"])
    );

    const [ownedSnap, joinedSnap] = await Promise.all([getDocs(qOwned), getDocs(qJoined)]);

    const owned = ownedSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), isOwner: true }));

    // For joined sessions, we need to fetch the session details
    const joinedIds = [...new Set(joinedSnap.docs.map(d => d.data().sessionId))];
    const joinedPromises = joinedIds.map(id => getDoc(doc(db, COLLECTIONS.SESSIONS, id)));
    const joinedSnaps = await Promise.all(joinedPromises);

    // Deduplicate: If owned, don't show in joined list
    const ownedIds = new Set(owned.map(s => s.id));
    const joined = joinedSnaps
        .filter(s => s.exists() && !ownedIds.has(s.id))
        .map(s => ({ id: s.id, ...s.data(), isOwner: false }));

    return [...owned, ...joined].sort((a, b) => {
        const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt || 0);
        const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt || 0);
        return dateB - dateA;
    });
};

export const getInvites = async (email) => {
    const q = query(
        collection(db, "session_invites"),
        where("email", "==", email.toLowerCase()),
        where("status", "==", "invited")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getSession = async (id) => {
    const docRef = doc(db, COLLECTIONS.SESSIONS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
};

export const saveSession = async (userId, systemId, sessionData) => {
    const data = {
        ...sessionData,
        userId,
        systemId,
        updatedAt: serverTimestamp()
    };

    if (sessionData.id) {
        const docRef = doc(db, COLLECTIONS.SESSIONS, sessionData.id);
        const cleanData = { ...data };
        delete cleanData.id;
        await updateDoc(docRef, cleanData);
        return sessionData.id;
    } else {
        data.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, COLLECTIONS.SESSIONS), data);
        return docRef.id;
    }
};

export const deleteSession = async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.SESSIONS, id));
};


export const getGlobalItems = async (systemId) => {
    try {
        // 1. Try System Items (Nested Structure)
        try {
            const itemsRef = collection(db, 'systems', systemId, COLLECTIONS.GLOBAL_ITEMS);
            const qSnapshot = await getDocs(query(itemsRef));
            if (!qSnapshot.empty) {
                return qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (e) {
            console.info("Nested items fetch restricted or empty.");
        }

        // 2. Fallback to root 'itens_database'
        const rootQ = query(
            collection(db, COLLECTIONS.GLOBAL_ITEMS),
            where("systemId", "==", systemId)
        );
        const rootSnapshot = await getDocs(rootQ);
        return rootSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Erro ao buscar itens globais:", error);
        return [];
    }
};


export const saveUserSpell = async (userId, userEmail, spellData) => {
    const data = {
        ...spellData,
        userId,
        createdByEmail: userEmail,
        createdByNickname: spellData.createdByNickname || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sharedWith: spellData.sharedWith || []
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.USER_SPELLS), data);
    return docRef.id;
};

export const updateUserSpell = async (spellId, spellData) => {
    const docRef = doc(db, COLLECTIONS.USER_SPELLS, spellId);
    const data = {
        ...spellData,
        updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, data);
};

export const deleteUserSpell = async (spellId, userId, userEmail) => {
    const docRef = doc(db, COLLECTIONS.USER_SPELLS, spellId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return false;

    const data = snap.data();

    // Se o usuário é o criador, pode apagar completamente
    if (data.userId === userId) {
        await deleteDoc(docRef);
        return true;
    }

    // Se a magia foi compartilhada com este usuário, remove ele da lista
    if (data.sharedWith && Array.isArray(data.sharedWith) && data.sharedWith.includes(userEmail)) {
        const updatedSharedWith = data.sharedWith.filter(email => email !== userEmail);
        await updateDoc(docRef, { sharedWith: updatedSharedWith });
        return true;
    }

    return false;
};

export const getUserSpells = async (userId, userEmail) => {
    try {
        const qCreated = query(
            collection(db, COLLECTIONS.USER_SPELLS),
            where("userId", "==", userId)
        );

        const qShared = query(
            collection(db, COLLECTIONS.USER_SPELLS),
            where("sharedWith", "array-contains", userEmail)
        );

        const [snapCreated, snapShared] = await Promise.all([
            getDocs(qCreated),
            getDocs(qShared)
        ]);

        const createdSpells = snapCreated.docs.map(doc => ({ ...doc.data(), id: doc.id, isOwner: true }));
        const sharedSpells = snapShared.docs.map(doc => ({ ...doc.data(), id: doc.id, isOwner: false }));

        const allSpells = [...createdSpells];
        sharedSpells.forEach(spell => {
            if (!allSpells.find(s => s.id === spell.id)) {
                allSpells.push(spell);
            }
        });

        return allSpells.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
        console.error("Erro ao buscar magias do usuário:", error);
        return [];
    }
};

export const shareSpell = async (spellId, targetEmail) => {
    // Validar email
    if (!targetEmail || typeof targetEmail !== 'string' || !targetEmail.trim()) {
        throw new Error("Email inválido.");
    }

    const docRef = doc(db, COLLECTIONS.USER_SPELLS, spellId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Magia não encontrada.");

    const data = docSnap.data();
    const sharedWith = Array.isArray(data.sharedWith) ? data.sharedWith : [];

    const emailToShare = targetEmail.trim().toLowerCase();

    if (!sharedWith.includes(emailToShare)) {
        sharedWith.push(emailToShare);
        await updateDoc(docRef, { sharedWith });
    }
    return true;
};


export const saveUserItem = async (userId, userEmail, itemData) => {
    const data = {
        ...itemData,
        userId,
        createdByEmail: userEmail,
        createdByNickname: itemData.createdByNickname || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sharedWith: itemData.sharedWith || []
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.USER_ITEMS), data);
    return docRef.id;
};

export const saveGlobalItem = async (itemData) => {
    const data = {
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.GLOBAL_ITEMS), data);
    return docRef.id;
};

export const updateUserItem = async (itemId, itemData) => {
    const docRef = doc(db, COLLECTIONS.USER_ITEMS, itemId);
    const data = {
        ...itemData,
        updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, data);
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
    // Validar email
    if (!targetEmail || typeof targetEmail !== 'string' || !targetEmail.trim()) {
        throw new Error("Email inválido.");
    }

    const docRef = doc(db, COLLECTIONS.USER_ITEMS, itemId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Item não encontrado.");

    const data = docSnap.data();
    const sharedWith = Array.isArray(data.sharedWith) ? data.sharedWith : [];

    const emailToShare = targetEmail.trim().toLowerCase();

    if (!sharedWith.includes(emailToShare)) {
        sharedWith.push(emailToShare);
        await updateDoc(docRef, { sharedWith });
    }
    return true;
};

export const deleteUserItem = async (itemId, userId, userEmail) => {
    const docRef = doc(db, COLLECTIONS.USER_ITEMS, itemId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return false;

    const data = snap.data();

    // Se o usuário é o criador, pode apagar completamente
    if (data.userId === userId) {
        await deleteDoc(docRef);
        return true;
    }

    // Se o item foi compartilhado com este usuário, remove ele da lista
    if (data.sharedWith && Array.isArray(data.sharedWith) && data.sharedWith.includes(userEmail)) {
        const updatedSharedWith = data.sharedWith.filter(email => email !== userEmail);
        await updateDoc(docRef, { sharedWith: updatedSharedWith });
        return true;
    }

    return false;
};


export const getUserProfile = async (userId) => {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
};

export const ensureUserProfile = async (user) => {
    if (!user) return null;
    const profile = await getUserProfile(user.uid);
    if (!profile) {
        const data = {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user',
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), data, { merge: true });
    }
};

export const createUserProfile = async (user) => {
    const profile = await getUserProfile(user.uid);
    if (!profile) {
        const data = {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user',
            createdAt: new Date().toISOString(),
            status: 'active',
            aiEnabled: true
        };
        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), data);
    } else {
        const updates = {};
        if (!profile.email) updates.email = user.email;
        if (!profile.role) updates.role = 'user';
        if (!profile.status) updates.status = 'active';
        if (profile.aiEnabled === undefined) updates.aiEnabled = true;

        if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), updates);
        }
    }
    return profile || await getUserProfile(user.uid);
};

export const updateUserAIStatus = async (userId, status) => {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, { aiEnabled: status });
};

export const updateUserAlphaStatus = async (userId, status) => {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, { alphaTester: status });
};

export const getGlobalConfig = async () => {
    try {
        const docRef = doc(db, COLLECTIONS.CONFIG, 'settings');
        const snap = await getDoc(docRef);
        if (snap.exists()) return snap.data();
        return { aiActive: true, maintenanceMode: false };
    } catch (error) {
        console.warn("⚠️ [Data] Falha ao carregar configuração global (possível erro de permissão):", error.message);
        return { aiActive: true, maintenanceMode: false };
    }
};

export const updateGlobalConfig = async (updates) => {
    const docRef = doc(db, COLLECTIONS.CONFIG, 'settings');
    await setDoc(docRef, updates, { merge: true });
};

export const getAllUsers = async () => {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateUserRole = async (userId, role) => {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, { role });
};

export const updateUserStatus = async (userId, status) => {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, { status });
};



export const getUserByNickname = async (nickname) => {
    if (!nickname) return null;
    const cleanNick = nickname.trim().toLowerCase();

    // First try normalized lowercase search
    const q = query(
        collection(db, COLLECTIONS.USERS),
        where("nickname_lower", "==", cleanNick)
    );
    let snap = await getDocs(q);

    // Fallback: If no match found by nickname_lower, try raw nickname (case sensitive)
    // This handles legacy records that haven't been updated with nickname_lower yet
    if (snap.empty) {
        const qFallback = query(
            collection(db, COLLECTIONS.USERS),
            where("nickname", "==", nickname.trim())
        );
        snap = await getDocs(qFallback);
    }

    if (snap.empty) return null;
    return { uid: snap.docs[0].id, ...snap.docs[0].data() };
};

export const checkNicknameAvailability = async (nickname) => {
    if (!nickname || nickname.length < 3) return false;
    const cleanNick = nickname.trim().toLowerCase();

    // Check nickname_lower
    const q = query(
        collection(db, COLLECTIONS.USERS),
        where("nickname_lower", "==", cleanNick)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return false;

    // Check raw nickname (case sensitive) for legacy safety
    const qFallback = query(
        collection(db, COLLECTIONS.USERS),
        where("nickname", "==", nickname.trim())
    );
    const snapFallback = await getDocs(qFallback);
    return snapFallback.empty;
};

export const setNickname = async (userId, nickname) => {
    const isAvailable = await checkNicknameAvailability(nickname);
    if (!isAvailable) throw new Error('Este nickname já está em uso.');

    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        nickname: nickname,
        nickname_lower: nickname.toLowerCase()
    });
};

export const addContact = async (userId, targetNickname) => {
    const q = query(
        collection(db, COLLECTIONS.USERS),
        where("nickname_lower", "==", targetNickname.trim().toLowerCase())
    );
    const snap = await getDocs(q);

    if (snap.empty) {
        throw new Error("Viajante não encontrado com este nome.");
    }

    const targetUser = snap.docs[0].data();
    const targetId = snap.docs[0].id;

    if (targetId === userId) {
        throw new Error("Você não pode adicionar a si mesmo!");
    }

    const myRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(myRef, {
        contacts: arrayUnion({
            uid: targetId,
            nickname: targetUser.nickname || targetNickname
        })
    });

    return targetUser.nickname;
};

export const getContacts = async (userId) => {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return snap.data().contacts || [];
    }
    return [];
};

export const removeContact = async (userId, contactObj) => {
    const myRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(myRef, {
        contacts: arrayRemove(contactObj)
    });
};


export const subscribeToGlobalChat = (callback) => {
    const q = query(
        collection(db, COLLECTIONS.GLOBAL_CHAT),
        orderBy("createdAt", "desc"),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
        callback(messages);
    }, (error) => {
        logger.error("Global Chat Sync Error (Permission Denied? Check Rules):", error);

    });
};

export const sendGlobalMessage = async (user, text) => {
    if (!user || !text.trim()) return;

    const profile = await getUserProfile(user.uid);
    const name = profile?.nickname || user.displayName || "Viajante Desconhecido";

    await addDoc(collection(db, COLLECTIONS.GLOBAL_CHAT), {
        userId: user.uid,
        username: name,
        text: text.trim(),
        createdAt: serverTimestamp(),
    });
};
// --- GENERIC CRUD FOR NEW MODULES ---

export const getModuleItems = async (collectionName, userId, systemId) => {
    try {
        const q = query(
            collection(db, collectionName),
            where("userId", "==", userId),
            where("systemId", "==", systemId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id, isOwner: true }))
            .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } catch (error) {
        console.error(`Erro ao buscar itens da coleção ${collectionName}:`, error);
        return [];
    }
};

export const saveModuleItem = async (collectionName, userId, systemId, itemData) => {
    const data = {
        ...itemData,
        userId,
        systemId,
        createdAt: itemData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (itemData.id) {
        const id = itemData.id;
        const docRef = doc(db, collectionName, id);
        const cleanData = { ...data };
        delete cleanData.id;
        await updateDoc(docRef, cleanData);
        return id;
    } else {
        const cleanData = { ...data };
        delete cleanData.id;
        const docRef = await addDoc(collection(db, collectionName), cleanData);
        return docRef.id;
    }
};

export const deleteModuleItem = async (collectionName, id) => {
    await deleteDoc(doc(db, collectionName, id));
};

export const getModuleItem = async (collectionName, id) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
};

export const updateUserPresence = async (userId) => {
    if (!userId) return;
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        await updateDoc(userRef, {
            lastOnline: serverTimestamp()
        });
    } catch (error) {
        console.error("Erro ao atualizar presença:", error);
    }
};

// --- NPCs (Separate from Monsters/Bestiary) ---
export const getUserNPCs = async (userId, userEmail) => {
    try {
        const qCreated = query(
            collection(db, COLLECTIONS.NPCS),
            where("userId", "==", userId)
        );

        const qShared = query(
            collection(db, COLLECTIONS.NPCS),
            where("sharedWith", "array-contains", userEmail)
        );

        const [snapCreated, snapShared] = await Promise.all([
            getDocs(qCreated),
            getDocs(qShared)
        ]);

        const createdNPCs = snapCreated.docs.map(doc => ({ ...doc.data(), id: doc.id, isOwner: true }));
        const sharedNPCs = snapShared.docs.map(doc => ({ ...doc.data(), id: doc.id, isOwner: false }));

        const allNPCs = [...createdNPCs];
        sharedNPCs.forEach(npc => {
            if (!allNPCs.find(n => n.id === npc.id)) {
                allNPCs.push(npc);
            }
        });

        return allNPCs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
        console.error("Erro ao buscar NPCs do usuário:", error);
        return [];
    }
};

export const subscribeToOnlineUsers = (callback) => {
    // Users active in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const q = query(
        collection(db, COLLECTIONS.USERS),
        orderBy("lastOnline", "desc"),
        limit(20)
    );

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const now = Date.now();
        const onlineUsers = users.filter(u => {
            if (!u.lastOnline) return false;
            const lastActive = u.lastOnline.toMillis ? u.lastOnline.toMillis() : new Date(u.lastOnline).getTime();
            return (now - lastActive) < (10 * 60 * 1000);
        });
        callback(onlineUsers);
    }, (error) => {
        console.error("Erro ao sincronizar usuários online:", error);
    });
};

