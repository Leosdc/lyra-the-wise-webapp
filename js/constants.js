
export const SUPPORTED_SYSTEMS = [
    { id: "dnd5e", name: "D&D 5ª Edição" },
    { id: "dnd35", name: "D&D 3.5" },
    { id: "pathfinder", name: "Pathfinder 2ª Edição" },
    { id: "pathfinder1e", name: "Pathfinder 1ª Edição" },
    { id: "vampire", name: "Vampire: The Masquerade (V5)" },
    { id: "werewolf", name: "Werewolf: The Apocalypse" },
    { id: "mage", name: "Mage: The Ascension" },
    { id: "cofd", name: "Chronicles of Darkness" },
    { id: "cyberpunkred", name: "Cyberpunk RED" },
    { id: "cyberpunk2020", name: "Cyberpunk 2020" },
    { id: "blades", name: "Blades in the Dark" },
    { id: "cthulhu", name: "Call of Cthulhu 7ª Edição" },
    { id: "7thsea", name: "7th Sea 2ª Edição" },
    { id: "apocalypse", name: "Apocalypse World" },
    { id: "ars_magica", name: "Ars Magica 5ª Edição" },
    { id: "champions", name: "Champions / Hero System" },
    { id: "cortex", name: "Cortex Prime" },
    { id: "deadlands", name: "Deadlands (Savage Worlds)" },
    { id: "dungeon_world", name: "Dungeon World" },
    { id: "eclipse", name: "Eclipse Phase 2ª Edição" },
    { id: "exalted", name: "Exalted 3ª Edição" },
    { id: "fate_accelerated", name: "FATE Accelerated" },
    { id: "fate_core", name: "FATE Core" },
    { id: "fiasco", name: "Fiasco" },
    { id: "gurps", name: "GURPS 4ª Edição" },
    { id: "ironkingdoms", name: "Iron Kingdoms" },
    { id: "l5r", name: "Legend of the Five Rings (L5R)" },
    { id: "faserip", name: "Marvel Super Heroes (FASERIP)" },
    { id: "microlite20", name: "Microlite20" },
    { id: "monster_week", name: "Monster of the Week" },
    { id: "mutants", name: "Mutants & Masterminds 3ª Edição" },
    { id: "numenera", name: "Numenera (Cypher System)" },
    { id: "pendragon", name: "Pendragon (King Arthur)" },
    { id: "risus", name: "Risus: The Anything RPG" },
    { id: "savage", name: "Savage Worlds" },
    { id: "shadowdemon", name: "Shadow of the Demon Lord" },
    { id: "shadowrun", name: "Shadowrun 5ª/6ª Edição" },
    { id: "startrek", name: "Star Trek Adventures (Modiphius)" },
    { id: "starwars_ffg", name: "Star Wars RPG (FFG)" },
    { id: "starwars_d20", name: "Star Wars RPG (d20/Saga)" },
    { id: "tiny_dungeon", name: "Tiny Dungeon 2ª Edição" },
    { id: "victoriana", name: "Victoriana 3ª Edição" },
    { id: "wfrp1e", name: "Warhammer Fantasy 1ª Edição" },
    { id: "wfrp4e", name: "Warhammer Fantasy 4ª Edição" },
    { id: "13thage", name: "13th Age" }
];

export const SYSTEM_TEMPLATES = {
    "dnd5e": {
        bio: {
            name: "",
            class: "",
            level: 1,
            race: "",
            background: "",
            alignment: "",
            xp: 0,
            playerName: ""
        },
        attributes: {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10
        },
        stats: {
            hp_current: 0,
            hp_max: 0,
            hp_temp: 0,
            ac: 10,
            initiative: 0,
            speed: "9m",
            proficiency_bonus: 2,
            passive_perception: 10,
            hit_dice_total: "1d8",
            hit_dice_current: 1
        },
        proficiencies_choice: {
            saving_throws: [], // ["str", "con"]
            skills: [], // ["athletics", "perception"]
            expertise: [] // ["stealth"]
        },
        death_saves: {
            successes: 0,
            failures: 0
        },
        attacks: [], // { name, bonus, damage, type, range, properties }
        spells: {
            ability: "int",
            save_dc: 8,
            attack_bonus: 0,
            slots: {
                l1: { total: 0, used: 0 },
                l2: { total: 0, used: 0 },
                l3: { total: 0, used: 0 },
                l4: { total: 0, used: 0 },
                l5: { total: 0, used: 0 },
                l6: { total: 0, used: 0 },
                l7: { total: 0, used: 0 },
                l8: { total: 0, used: 0 },
                l9: { total: 0, used: 0 }
            },
            list: [] // { name, level, prepared, description }
        },
        inventory: {
            coins: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
            items: [], // { name, weight, quantity, equipped, description }
            encumbrance: { current: 0, limit: 150 }
        },
        story: {
            traits: "",
            ideals: "",
            bonds: "",
            flaws: "",
            appearance: "",
            languages: "",
            other_proficiencies: "",
            notes: ""
        },
        conditions: [] // ["exhaustion_1"]
    }
};
