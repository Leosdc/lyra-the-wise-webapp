/**
 * Calculates and updates the current spent points against the selected category priorities
 * for Vampire abilities (Talentos, Perícias, Conhecimentos).
 */
export function updateVampireAbilityPoints() {
    const getVal = (id) => parseInt(document.getElementById(`wiz-${id}`)?.value || 0);

    // Talentos
    const talentIds = [
        'alertness', 'athletics', 'awareness', 'brawl', 'empathy',
        'expression', 'intimidation', 'leadership', 'streetwise', 'subterfuge'
    ];
    const talentsSpent = talentIds.reduce((sum, id) => sum + getVal(id), 0);
    const talentsPrioritySelect = document.getElementById('vamp-priority-talents');
    const talentsMax = talentsPrioritySelect ? (parseInt(talentsPrioritySelect.value) || 0) : 0;
    const talentsTracker = document.getElementById('vamp-tracker-talents');
    if (talentsTracker) {
        talentsTracker.textContent = `Pontos: ${talentsSpent} / ${talentsMax}`;
        talentsTracker.classList.toggle('over-limit', talentsSpent > talentsMax);
        talentsTracker.classList.toggle('complete', talentsSpent === talentsMax && talentsMax > 0);
    }

    // Perícias
    const skillIds = [
        'animal_ken', 'crafts', 'drive', 'etiquette', 'firearms',
        'larceny', 'melee', 'performance', 'stealth', 'survival'
    ];
    const skillsSpent = skillIds.reduce((sum, id) => sum + getVal(id), 0);
    const skillsPrioritySelect = document.getElementById('vamp-priority-skills');
    const skillsMax = skillsPrioritySelect ? (parseInt(skillsPrioritySelect.value) || 0) : 0;
    const skillsTracker = document.getElementById('vamp-tracker-skills');
    if (skillsTracker) {
        skillsTracker.textContent = `Pontos: ${skillsSpent} / ${skillsMax}`;
        skillsTracker.classList.toggle('over-limit', skillsSpent > skillsMax);
        skillsTracker.classList.toggle('complete', skillsSpent === skillsMax && skillsMax > 0);
    }

    // Conhecimentos
    const knowledgeIds = [
        'academics', 'computer', 'finance', 'investigation', 'law',
        'medicine', 'occult', 'politics', 'science', 'technology'
    ];
    const knowledgesSpent = knowledgeIds.reduce((sum, id) => sum + getVal(id), 0);
    const knowledgesPrioritySelect = document.getElementById('vamp-priority-knowledges');
    const knowledgesMax = knowledgesPrioritySelect ? (parseInt(knowledgesPrioritySelect.value) || 0) : 0;
    const knowledgesTracker = document.getElementById('vamp-tracker-knowledges');
    if (knowledgesTracker) {
        knowledgesTracker.textContent = `Pontos: ${knowledgesSpent} / ${knowledgesMax}`;
        knowledgesTracker.classList.toggle('over-limit', knowledgesSpent > knowledgesMax);
        knowledgesTracker.classList.toggle('complete', knowledgesSpent === knowledgesMax && knowledgesMax > 0);
    }
}
