
/**
 * Lists Module
 * Handles manipulation of dynamic arrays (attacks, spells, inventory) and proficiencies.
 */

export const ListModule = {

    addItem(rootObj, path, template) {
        if (!rootObj) return false;

        const keys = path.split('.');
        let target = rootObj;

        // Traverse to parent object
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }

        const lastKey = keys[keys.length - 1];
        if (!target[lastKey]) target[lastKey] = [];

        // Add copy of template
        target[lastKey].push(JSON.parse(JSON.stringify(template)));
        return true;
    },

    removeItem(rootObj, path, index) {
        if (!rootObj) return false;

        const keys = path.split('.');
        let target = rootObj;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) return false;
            target = target[keys[i]];
        }

        const lastKey = keys[keys.length - 1];
        if (!target[lastKey] || !Array.isArray(target[lastKey])) return false;

        target[lastKey].splice(index, 1);
        return true;
    },

    toggleProficiency(character, type, field) {
        if (!character) return false;

        if (!character.proficiencies_choice) {
            character.proficiencies_choice = { skills: [], expertise: [], saves: [] };
        }

        const list = character.proficiencies_choice[type] || [];
        const idx = list.indexOf(field);

        if (idx === -1) {
            list.push(field);
        } else {
            list.splice(idx, 1);
        }

        character.proficiencies_choice[type] = list;
        return true;
    }
};
