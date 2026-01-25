
/**
 * D&D 5e System Module
 * Encapsulates specific logic for the 5th Edition Rule System.
 */
export const DND5eSystem = {
    id: 'dnd5e',
    name: 'Dungeons & Dragons 5e',

    // Modifiers Table
    getModifier(score) {
        return Math.floor((score - 10) / 2);
    },

    formatModifier(mod) {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    },

    // Prof Bonus Table
    getProficiencyBonus(level) {
        if (!level || level < 1) return 2;
        return Math.ceil(1 + (level / 4));
    },

    // Main Calculation Function (Refactored from SheetModule)
    calculateStats(char) {
        const stats = {
            attributes: {},
            skills: {},
            saves: {},
            general: {}
        };

        // 1. Attributes & Modifiers
        const attrs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        attrs.forEach(attr => {
            const score = parseInt(char.attributes?.[attr] || 10);
            const mod = this.getModifier(score);
            stats.attributes[attr] = { score, mod, formatted: this.formatModifier(mod) };
        });

        // 2. Proficiency Bonus
        const level = parseInt(char.bio?.level || 1);
        const profBonus = this.getProficiencyBonus(level);
        stats.general.profBonus = profBonus;
        stats.general.profBonusFormatted = `+${profBonus}`;

        // 3. Armor Class
        // Logic: Dex + Armor Base. (Simplified, can be expanded for Armor Items)
        const dexMod = stats.attributes.dex.mod;
        const baseAC = parseInt(char.stats?.ac_base || 10); // Or calculate from inventory

        // Simple logic for now matching original: just use the AC field or calc 10+Dex
        // If the user inputs AC manually in the sheet, we use it.
        // But for dynamic calculation without armor:
        let ac = parseInt(char.stats?.ac) || (10 + dexMod);
        stats.general.ac = ac;

        // 4. Initiative
        stats.general.initiative = this.formatModifier(dexMod);

        // 5. Saving Throws
        attrs.forEach(attr => {
            const isProf = char.proficiencies?.saves?.[attr];
            let mod = stats.attributes[attr].mod;
            if (isProf) mod += profBonus;
            stats.saves[attr] = {
                mod,
                formatted: this.formatModifier(mod),
                isProf: !!isProf
            };
        });

        // 6. Skills
        // Base ability for each skill
        const skillMap = {
            acrobatics: 'dex', animal_handling: 'wis', arcana: 'int', athletics: 'str',
            deception: 'cha', history: 'int', insight: 'wis', intimidation: 'cha',
            investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis',
            performance: 'cha', persuasion: 'cha', religion: 'int', sleight_of_hand: 'dex',
            stealth: 'dex', survival: 'wis'
        };

        Object.entries(skillMap).forEach(([skill, attr]) => {
            const isProf = char.proficiencies?.skills?.[skill];
            let mod = stats.attributes[attr].mod;
            if (isProf) mod += profBonus;

            // Expertises (can be added later)

            stats.skills[skill] = {
                mod,
                formatted: this.formatModifier(mod),
                isProf: !!isProf,
                attr: attr
            };
        });

        // 7. Passive Perception
        stats.general.passivePerception = 10 + stats.skills.perception.mod;

        // 8. Derived Defaults (HP, Init, AC Default)
        // Helper to suggest defaults if fields are empty
        const hitDie = char.bio?.hitDie ? parseInt(char.bio.hitDie.replace('d', '')) : 8;
        const conMod = stats.attributes.con.mod;
        stats.defaults = {
            hp_max: hitDie + conMod + ((level - 1) * (Math.floor(hitDie / 2) + 1 + conMod)),
            ac: 10 + dexMod,
            initiative: dexMod
        };

        return stats;
    }
};
