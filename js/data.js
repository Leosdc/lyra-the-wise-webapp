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
    TRAPS: "user_traps",
    // Entity System (v2 Sheet-based)
    USER_ABILITIES: "user_abilities"
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

// --- ENTITY SYSTEM (v2 Sheet-based for Monsters, Villains, NPCs) ---

const ENTITY_COLLECTION_MAP = {
    'monster': COLLECTIONS.USER_MONSTERS,
    'villain': COLLECTIONS.VILLAINS,
    'npc': COLLECTIONS.NPCS
};

export const getEmptyEntity = (entityType) => ({
    name: "",
    entity_type: entityType,
    bio: {
        race: "", class: "", subrace: "", archetype: "",
        alignment: "Neutro", background: "", level: 1,
        cr: "0", size: "Medium", creature_type: "", xp: "0", playerName: ""
    },
    attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    stats: {
        ac: 10, initiative: 0, speed: "9m",
        hp_current: 10, hp_max: 10, hp_temp: 0,
        hit_dice_current: 1, hit_dice_total: "1d8"
    },
    proficiencies_choice: { saves: [], skills: [], expertise: [] },
    combat: { attacks: [] },
    spells: { ability: "int", slots: {}, list: [] },
    inventory: {
        coins: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
        items: [],
        encumbrance: { current: 0, limit: 150 }
    },
    story: {
        traits: "", ideals: "", bonds: "", flaws: "",
        mannerisms: "", talents: "", appearance: "", notes: ""
    },
    abilities: [],
    death_saves: { successes: 0, failures: 0 },
    tokenUrl: "",
    sharedWith: []
});

export const getEmptyAbility = (abilityOrigin) => ({
    uid: "",
    identity: {
        name: "",
        origin: abilityOrigin || "Item", // Item | Spell | Custom_Attack | Class_Skill | Race | Feat
        tags: [],
        source: { book: "", page: "" }
    },
    activation: {
        type: "Action", // Action | Bonus | Reaction | No Action | Passive | Legendary | Lair
        cost: 1,
        slot: {
            resource_id: "", // spell_slots | item_charges | proficiency_uses | superiority_dice
            level_required: 0,
            consume: false
        }
    },
    trigger_logic: {
        range: { min: 0, max: 0, unit: "ft" },
        target: {
            type: "Entity", // Entity | Place | Self
            quantity: 1,
            matriz: {
                shape: "Point", // Sphere | Cone | Line | Square | Point
                value: 0,
                unit: "ft",
                origin: "self" // self | target_point
            }
        }
    },
    execution_mechanics: {
        has_save: false,
        save: {
            ability: "", // DEX | CON | WIS | STR | INT | CHA
            dc_type: "fixed", // scaling | fixed
            dc_value: 0,
            on_success: "no_damage" // half_damage | no_damage | end_condition
        },
        has_attack_roll: false,
        damage: [], // [{ dice_count: 1, dice_type: 6, fixed_modifier: 0, damage_type: "slashing", is_magical: false, scaling_type: "none" }]
        conditions: [] // [{ id: "poisoned", duration: "1_round", save_at_end: false }]
    },
    description: "",
    equipment_details: {
        rarity: "common",
        cost: "",
        weight: 0,
        quantity: 1,
        item_type: "Weapon", // Weapon | Armor | Potion | Scroll | Wondrous | Ring | Staff | Wand
        ac_bonus: null,
        properties: [],
        equipped: false
    },
    spell_details: {
        level: 0,
        school: "",
        casting_time: "",
        duration: "",
        components: "",
        classes: [],
        prepared: false,
        concentration: false
    },
    meta: {
        visibility: "public",
        is_native: false,
        created_by: ""
    }
});

/**
 * Converts a legacy flat item object into the unified AbilitySchema.
 * Used for lazy migration when displaying existing items.
 */
export const getEmptyAbilityFromItem = (item) => {
    if (!item) return getEmptyAbility("Item");

    const ability = getEmptyAbility("Item");
    ability.uid = item.id || `item_${Date.now()}`;
    ability.identity.name = item.name || "";
    ability.identity.origin = "Item";
    ability.identity.tags = (item.properties || []).slice();
    ability.description = item.description || "";

    // Equipment details
    ability.equipment_details = {
        rarity: (item.rarity || "common").toLowerCase(),
        cost: item.cost || "",
        weight: parseFloat(item.weight) || 0,
        quantity: parseInt(item.quantity) || 1,
        item_type: item.type || item.subtype || "Weapon",
        ac_bonus: item.ac || null,
        properties: (item.properties || []).slice(),
        equipped: item.equipped || false
    };

    // Parse damage string if weapon (e.g. "1d8")
    if (item.damage) {
        ability.execution_mechanics.has_attack_roll = true;
        
        let diceCount = 1;
        let diceType = 6;
        let fixedMod = 0;
        let dmgType = item.damageType ? item.damageType.trim() : "slashing";
        
        // If damageType wasn't explicitly given, maybe the user wrote it inside damage (legacy "1d8 cortante")
        if (!item.damageType && item.damage.match(/(\d+)d(\d+)\s*(?:\+\s*(\d+))?\s*(.*)/i)) {
            const dmgMatch = item.damage.match(/(\d+)d(\d+)\s*(?:\+\s*(\d+))?\s*(.*)/i);
            diceCount = parseInt(dmgMatch[1]) || 1;
            diceType = parseInt(dmgMatch[2]) || 6;
            fixedMod = parseInt(dmgMatch[3]) || 0;
            dmgType = dmgMatch[4]?.trim() || "slashing";
        } else {
            // Modern pure dice match
            const dmgMatch = item.damage.match(/(\d+)d(\d+)\s*(?:\+\s*(\d+))?/i);
            if (dmgMatch) {
                diceCount = parseInt(dmgMatch[1]) || 1;
                diceType = parseInt(dmgMatch[2]) || 6;
                fixedMod = parseInt(dmgMatch[3]) || 0;
            }
        }

        ability.execution_mechanics.damage = [{
            dice_count: diceCount,
            dice_type: diceType,
            fixed_modifier: fixedMod,
            damage_type: dmgType,
            is_magical: (item.rarity && item.rarity !== "common" && item.rarity !== "comum") || false,
            scaling_type: "none"
        }];
    }

    // Activation — items typically don't consume slots
    ability.activation.type = "Action";
    ability.activation.cost = 1;

    ability.meta.created_by = item.createdByNickname || "";

    return ability;
};

/**
 * Converts a legacy flat spell object into the unified AbilitySchema.
 * Used for lazy migration when displaying existing spells.
 */
export const getEmptyAbilityFromSpell = (spell) => {
    if (!spell) return getEmptyAbility("Spell");

    const ability = getEmptyAbility("Spell");
    ability.uid = spell.id || `spell_${Date.now()}`;
    ability.identity.name = spell.name || "";
    ability.identity.origin = "Spell";
    ability.identity.tags = [];
    ability.description = spell.description || "";

    // Spell details
    ability.spell_details = {
        level: parseInt(spell.level) || 0,
        school: spell.school || "",
        casting_time: spell.castingTime || spell.casting_time || "",
        duration: spell.duration || "",
        components: spell.components || "",
        classes: Array.isArray(spell.classes) ? spell.classes : (spell.classes || "").split(/,\s*/),
        prepared: spell.prepared || false,
        concentration: (spell.duration || "").toLowerCase().includes("concentração") || (spell.duration || "").toLowerCase().includes("concentration") || false
    };

    // Activation type from casting time
    const ct = (spell.castingTime || spell.casting_time || "").toLowerCase();
    if (ct.includes("bônus") || ct.includes("bonus")) {
        ability.activation.type = "Bonus";
    } else if (ct.includes("reação") || ct.includes("reaction")) {
        ability.activation.type = "Reaction";
    } else {
        ability.activation.type = "Action";
    }

    // Slot consumption
    const spellLevel = parseInt(spell.level) || 0;
    if (spellLevel > 0) {
        ability.activation.slot = {
            resource_id: "spell_slots",
            level_required: spellLevel,
            consume: true
        };
    }

    // Parse range  
    const rangeStr = spell.range || "";
    const rangeMatch = rangeStr.match(/(\d+)\s*(metro|m|ft|feet|pé)/i);
    if (rangeMatch) {
        const val = parseInt(rangeMatch[1]) || 0;
        const unit = rangeMatch[2].toLowerCase().startsWith("m") ? "m" : "ft";
        ability.trigger_logic.range = { min: 0, max: val, unit };
    } else if (rangeStr.toLowerCase().includes("toque") || rangeStr.toLowerCase().includes("touch")) {
        ability.trigger_logic.range = { min: 0, max: 1.5, unit: "m" };
        ability.trigger_logic.target.type = "Entity";
    } else if (rangeStr.toLowerCase().includes("pessoal") || rangeStr.toLowerCase().includes("self")) {
        ability.trigger_logic.range = { min: 0, max: 0, unit: "m" };
        ability.trigger_logic.target.type = "Self";
    }

    ability.meta.created_by = spell.createdByNickname || "";

    return ability;
};

/**
 * Flattens an AbilitySchema back to a legacy item object for backward compat.
 */
export const flattenAbilityToItem = (ability) => {
    if (!ability) return {};
    const eq = ability.equipment_details || {};
    const dmg = (ability.execution_mechanics?.damage || [])[0];

    let damageStr = "";
    if (dmg) {
        damageStr = `${dmg.dice_count || 1}d${dmg.dice_type || 6}`;
        if (dmg.fixed_modifier) damageStr += ` + ${dmg.fixed_modifier}`;
        if (dmg.damage_type) damageStr += ` ${dmg.damage_type}`;
    }

    return {
        name: ability.identity?.name || "",
        type: eq.item_type || "weapon",
        rarity: eq.rarity || "common",
        weight: eq.weight || "",
        cost: eq.cost || "",
        damage: damageStr || "",
        ac: eq.ac_bonus || "",
        properties: eq.properties || [],
        description: ability.description || "",
        quantity: eq.quantity || 1,
        equipped: eq.equipped || false
    };
};

/**
 * Flattens an AbilitySchema back to a legacy spell object for backward compat.
 */
export const flattenAbilityToSpell = (ability) => {
    if (!ability) return {};
    const sp = ability.spell_details || {};

    return {
        name: ability.identity?.name || "",
        level: sp.level || 0,
        school: sp.school || "",
        castingTime: sp.casting_time || "",
        casting_time: sp.casting_time || "",
        range: `${ability.trigger_logic?.range?.max || 0} ${ability.trigger_logic?.range?.unit || "m"}`,
        duration: sp.duration || "",
        components: sp.components || "",
        classes: sp.classes || [],
        description: ability.description || "",
        prepared: sp.prepared || false
    };
};

export const saveEntity = async (entityType, userId, userEmail, entityData) => {
    const collectionName = ENTITY_COLLECTION_MAP[entityType];
    if (!collectionName) throw new Error(`Tipo de entidade desconhecido: ${entityType}`);

    const data = {
        ...entityData,
        entity_type: entityType,
        userId,
        createdByEmail: userEmail,
        updatedAt: new Date().toISOString()
    };

    if (entityData.id) {
        const id = entityData.id;
        const docRef = doc(db, collectionName, id);
        const cleanData = { ...data };
        delete cleanData.id;
        await updateDoc(docRef, cleanData);
        return id;
    } else {
        data.createdAt = new Date().toISOString();
        const cleanData = { ...data };
        delete cleanData.id;
        const docRef = await addDoc(collection(db, collectionName), cleanData);
        return docRef.id;
    }
};

export const getEntities = async (entityType, userId, userEmail) => {
    const collectionName = ENTITY_COLLECTION_MAP[entityType];
    if (!collectionName) return [];

    try {
        const qCreated = query(
            collection(db, collectionName),
            where("userId", "==", userId)
        );

        const qShared = query(
            collection(db, collectionName),
            where("sharedWith", "array-contains", userEmail)
        );

        const [snapCreated, snapShared] = await Promise.all([
            getDocs(qCreated),
            getDocs(qShared)
        ]);

        const created = snapCreated.docs.map(d => ({ ...d.data(), id: d.id, isOwner: true }));
        const shared = snapShared.docs.map(d => ({ ...d.data(), id: d.id, isOwner: false }));

        const all = [...created];
        shared.forEach(item => {
            if (!all.find(x => x.id === item.id)) all.push(item);
        });

        return all.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } catch (error) {
        console.error(`Erro ao buscar entidades (${entityType}):`, error);
        return [];
    }
};

export const getEntityById = async (entityType, id, systemId = null) => {
    const collectionName = ENTITY_COLLECTION_MAP[entityType];
    if (!collectionName) return null;

    try {
        // 1. Try personal collection first
        let docRef = doc(db, collectionName, id);
        let snap = await getDoc(docRef);
        if (snap.exists()) return { id: snap.id, ...snap.data() };

        // 2. Try system collection as fallback
        const sysId = systemId || localStorage.getItem('lyra_current_system') || 'dnd5e';
        let systemCollection = null;
        
        if (entityType === 'monster') systemCollection = COLLECTIONS.GLOBAL_MONSTERS;
        // else if (entityType === 'spell') systemCollection = COLLECTIONS.SPELLS;

        if (systemCollection) {
            docRef = doc(db, 'systems', sysId, systemCollection, id);
            snap = await getDoc(docRef);
            if (snap.exists()) return { id: snap.id, ...snap.data(), systemId: sysId };
        }
    } catch (e) {
        console.error(`Erro ao buscar entidade (${entityType}/${id}):`, e);
    }
    return null;
};

export const deleteEntity = async (entityType, id, userId) => {
    const collectionName = ENTITY_COLLECTION_MAP[entityType];
    if (!collectionName) return false;

    const docRef = doc(db, collectionName, id);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().userId === userId) {
        await deleteDoc(docRef);
        return true;
    }
    return false;
};

// --- ABILITIES CRUD ---
export const saveAbility = async (userId, abilityData) => {
    const data = {
        ...abilityData,
        userId,
        updatedAt: new Date().toISOString()
    };

    if (abilityData.id) {
        const id = abilityData.id;
        const docRef = doc(db, COLLECTIONS.USER_ABILITIES, id);
        const cleanData = { ...data };
        delete cleanData.id;
        await updateDoc(docRef, cleanData);
        return id;
    } else {
        data.createdAt = new Date().toISOString();
        const cleanData = { ...data };
        delete cleanData.id;
        const docRef = await addDoc(collection(db, COLLECTIONS.USER_ABILITIES), cleanData);
        return docRef.id;
    }
};

export const getUserAbilities = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTIONS.USER_ABILITIES),
            where("userId", "==", userId)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } catch (error) {
        console.error("Erro ao buscar habilidades:", error);
        return [];
    }
};

export const deleteAbility = async (id, userId) => {
    const docRef = doc(db, COLLECTIONS.USER_ABILITIES, id);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().userId === userId) {
        await deleteDoc(docRef);
        return true;
    }
    return false;
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


export const getSessions = async (userId, userEmail, systemId, roleFilter = 'all') => {
    // 1. Get owned sessions (fetch all by user to ensure correct deduplication)
    const qOwned = query(
        collection(db, COLLECTIONS.SESSIONS),
        where("userId", "==", userId)
    );

    // 2. Get joined sessions
    const qJoined = query(
        collection(db, "session_invites"),
        where("email", "==", userEmail.toLowerCase()),
        where("status", "in", ["accepted", "online", "offline"])
    );

    const [ownedSnap, joinedSnap] = await Promise.all([getDocs(qOwned), getDocs(qJoined)]);

    // Map owned sessions and tag them
    const allOwned = ownedSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), isOwner: true }));

    // Filter owned by system if requested (but keep full list for deduplication)
    const owned = allOwned.filter(s => !systemId || s.systemId === systemId);

    // For joined sessions, fetch details
    const joinedIds = [...new Set(joinedSnap.docs.map(d => d.data().sessionId))];
    const joinedPromises = joinedIds.map(id => getDoc(doc(db, COLLECTIONS.SESSIONS, id)));
    const joinedSnaps = await Promise.all(joinedPromises);

    // Deduplicate: If owned by this user (any system), don't show in joined list
    const allOwnedIds = new Set(allOwned.map(s => s.id));
    const joined = joinedSnaps
        .filter(s => s.exists() && !allOwnedIds.has(s.id))
        .map(s => ({ id: s.id, ...s.data(), isOwner: false }))
        .filter(s => !systemId || s.systemId === systemId); // Filter joined by systemId too

    let result = [];
    if (roleFilter === 'gm') {
        result = owned;
    } else if (roleFilter === 'player') {
        result = joined;
    } else {
        result = [...owned, ...joined];
    }

    return result.sort((a, b) => {
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

export const shareSpell = async (spellId, targetNickname) => {
    // Validar apelido
    if (!targetNickname || typeof targetNickname !== 'string' || !targetNickname.trim()) {
        throw new Error("Apelido Arcano inválido.");
    }

    const nicknameToSearch = targetNickname.trim();
    let targetEmail = null;

    // Buscar email associado ao apelido arcano
    try {
        const qUsers = query(
            collection(db, COLLECTIONS.USERS),
            where("apelido", "==", nicknameToSearch)
        );
        const usersSnap = await getDocs(qUsers);

        if (usersSnap.empty) {
            throw new Error(`Nenhum mago conhecido como "${nicknameToSearch}" foi encontrado. Verifique se o apelido está correto (maiúsculas e minúsculas).`);
        }

        targetEmail = usersSnap.docs[0].data().email;
        if (!targetEmail) throw new Error("O mago não possui um e-mail válido no grimório.");

    } catch (e) {
        if (e.message.includes('Nenhum mago')) throw e;
        console.error("Erro ao buscar apelido:", e);
        throw new Error("Falha na comunicação arcana ao buscar o apelido.");
    }

    const docRef = doc(db, COLLECTIONS.USER_SPELLS, spellId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Magia não encontrada.");

    const data = docSnap.data();
    const sharedWith = Array.isArray(data.sharedWith) ? data.sharedWith : [];

    if (!sharedWith.includes(targetEmail)) {
        sharedWith.push(targetEmail);
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

export const shareItem = async (itemId, targetNickname) => {
    // Validar apelido
    if (!targetNickname || typeof targetNickname !== 'string' || !targetNickname.trim()) {
        throw new Error("Apelido Arcano inválido.");
    }

    const nicknameToSearch = targetNickname.trim();
    let targetEmail = null;

    // Buscar email associado ao apelido arcano
    try {
        const qUsers = query(
            collection(db, COLLECTIONS.USERS),
            where("apelido", "==", nicknameToSearch)
        );
        const usersSnap = await getDocs(qUsers);

        if (usersSnap.empty) {
            throw new Error(`Nenhum artesão ou aventureiro conhecido como "${nicknameToSearch}" foi encontrado. Verifique se o apelido está correto.`);
        }

        targetEmail = usersSnap.docs[0].data().email;
        if (!targetEmail) throw new Error("O usuário não possui um e-mail válido no registro.");

    } catch (e) {
        if (e.message.includes('Nenhum artesão')) throw e;
        console.error("Erro ao buscar apelido:", e);
        throw new Error("Falha na rede de contatos ao buscar o apelido.");
    }

    const docRef = doc(db, COLLECTIONS.USER_ITEMS, itemId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Item não encontrado.");

    const data = docSnap.data();
    const sharedWith = Array.isArray(data.sharedWith) ? data.sharedWith : [];

    if (!sharedWith.includes(targetEmail)) {
        sharedWith.push(targetEmail);
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

export const deleteUserProfile = async (userId) => {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
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

/**
 * MIGRATION UTILITY
 * Moves items from root 'itens_database' to systems/{systemId}/itens_database
 */
export const migrateItemsToSystem = async (systemId = 'dnd5e') => {
    try {
        console.log(`[Migration] Starting migration from root ${COLLECTIONS.GLOBAL_ITEMS} to systems/${systemId}/${COLLECTIONS.GLOBAL_ITEMS}...`);
        
        const rootRef = collection(db, COLLECTIONS.GLOBAL_ITEMS);
        const q = query(rootRef, where("systemId", "==", systemId));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            console.log("[Migration] No items found in root for system:", systemId);
            return { success: true, count: 0 };
        }
        
        console.log(`[Migration] Found ${snapshot.size} items to migrate.`);
        
        const targetRef = collection(db, 'systems', systemId, COLLECTIONS.GLOBAL_ITEMS);
        
        let successCount = 0;
        for (const d of snapshot.docs) {
            const data = d.data();
            const id = d.id;
            // Write to target (using same ID)
            await setDoc(doc(targetRef, id), data);
            successCount++;
        }
        
        console.log(`[Migration] Successfully migrated ${successCount} items.`);
        return { success: true, count: successCount };
    } catch (error) {
        console.error("[Migration] Error during items migration:", error);
        throw error;
    }
};

