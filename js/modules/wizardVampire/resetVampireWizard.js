/**
 * Resets all Vampire-specific inputs in the character wizard.
 */
export function resetVampireWizard() {
    // Reset priority selects for attributes
    const attrPriorities = ['vamp-priority-physical', 'vamp-priority-social', 'vamp-priority-mental'];
    attrPriorities.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    // Reset priority selects for abilities
    const abilityPriorities = ['vamp-priority-talents', 'vamp-priority-skills', 'vamp-priority-knowledges'];
    abilityPriorities.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    // Reset attributes hidden inputs to 1 (Vampire default)
    const attributes = [
        'strength', 'dexterity', 'stamina',
        'charisma', 'manipulation', 'appearance',
        'perception', 'intelligence', 'wits'
    ];
    attributes.forEach(id => {
        const el = document.getElementById(`wiz-${id}`);
        if (el) el.value = 1;
    });

    // Reset abilities hidden inputs to 0 (Vampire default)
    const abilities = [
        // Talentos
        'alertness', 'athletics', 'awareness', 'brawl', 'empathy',
        'expression', 'intimidation', 'leadership', 'streetwise', 'subterfuge',
        // Perícias
        'animal_ken', 'crafts', 'drive', 'etiquette', 'firearms',
        'larceny', 'melee', 'performance', 'stealth', 'survival',
        // Conhecimentos
        'academics', 'computer', 'finance', 'investigation', 'law',
        'medicine', 'occult', 'politics', 'science', 'technology'
    ];
    abilities.forEach(id => {
        const el = document.getElementById(`wiz-${id}`);
        if (el) el.value = 0;
    });

    // Reset advantages/disciplines inputs to 0 / empty string
    for (let slot = 1; slot <= 3; slot++) {
        const valEl = document.getElementById(`wiz-discipline-${slot}`);
        if (valEl) valEl.value = 0;
        const nameEl = document.getElementById(`wiz-discipline-name-${slot}`);
        if (nameEl) nameEl.value = "";
    }

    // Reset virtues to default 1
    const virtues = ['conscience', 'self_control', 'courage'];
    virtues.forEach(v => {
        const el = document.getElementById(`wiz-${v}`);
        if (el) el.value = 1;
    });

    // Reset backgrounds to default 0
    const backgrounds = [
        'aliados', 'identidade_alternativa', 'mao_negra', 'contatos', 'dominio',
        'fama', 'geracao', 'rebanho', 'influencia', 'mentor',
        'recursos', 'lacaios', 'rituais', 'status'
    ];
    backgrounds.forEach(bg => {
        const el = document.getElementById(`wiz-background-${bg}`);
        if (el) el.value = 0;
    });
}
