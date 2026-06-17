/**
 * Validates the attribute selection for Step 2 under the Vampire system.
 * Checks that all priorities are unique and that the spent points match selected priorities.
 * 
 * @param {number} step - Current step of the wizard.
 * @param {object} context - Context object containing alert helper methods.
 * @returns {boolean} True if validation succeeds, false otherwise.
 */
export function validateVampireStep(step, context) {
    if (step === 2) {
        const getVal = (id) => parseInt(document.getElementById(`wiz-${id}`)?.value || 1);

        const physSelect = document.getElementById('vamp-priority-physical');
        const socSelect = document.getElementById('vamp-priority-social');
        const menSelect = document.getElementById('vamp-priority-mental');

        const physMax = physSelect ? (parseInt(physSelect.value) || 0) : 0;
        const socMax = socSelect ? (parseInt(socSelect.value) || 0) : 0;
        const menMax = menSelect ? (parseInt(menSelect.value) || 0) : 0;

        if (!physMax || !socMax || !menMax) {
            context.showAlert("Você deve definir a prioridade de todas as três colunas de atributos!", "Prioridade Necessária");
            return false;
        }

        const uniquePriorities = new Set([physMax, socMax, menMax]);
        if (uniquePriorities.size !== 3) {
            context.showAlert("As prioridades de atributos devem ser únicas para cada coluna!", "Prioridades Duplicadas");
            return false;
        }

        const physSpent = (getVal('strength') - 1) + (getVal('dexterity') - 1) + (getVal('stamina') - 1);
        const socSpent = (getVal('charisma') - 1) + (getVal('manipulation') - 1) + (getVal('appearance') - 1);
        const menSpent = (getVal('perception') - 1) + (getVal('intelligence') - 1) + (getVal('wits') - 1);

        if (physSpent !== physMax) {
            context.showAlert(`Você distribuiu ${physSpent} pontos em atributos Físicos, mas escolheu a prioridade que exige exatamente ${physMax} pontos!`, "Distribuição Incorreta");
            return false;
        }

        if (socSpent !== socMax) {
            context.showAlert(`Você distribuiu ${socSpent} pontos em atributos Sociais, mas escolheu a prioridade que exige exatamente ${socMax} pontos!`, "Distribuição Incorreta");
            return false;
        }

        if (menSpent !== menMax) {
            context.showAlert(`Você distribuiu ${menSpent} pontos em atributos Mentais, mas escolheu a prioridade que exige exatamente ${menMax} pontos!`, "Distribuição Incorreta");
            return false;
        }
    }

    if (step === 3) {
        const getVal = (id) => parseInt(document.getElementById(`wiz-${id}`)?.value || 0);

        const talentsSelect = document.getElementById('vamp-priority-talents');
        const skillsSelect = document.getElementById('vamp-priority-skills');
        const knowledgesSelect = document.getElementById('vamp-priority-knowledges');

        const talentsMax = talentsSelect ? (parseInt(talentsSelect.value) || 0) : 0;
        const skillsMax = skillsSelect ? (parseInt(skillsSelect.value) || 0) : 0;
        const knowledgesMax = knowledgesSelect ? (parseInt(knowledgesSelect.value) || 0) : 0;

        if (!talentsMax || !skillsMax || !knowledgesMax) {
            context.showAlert("Você deve definir a prioridade de todas as três colunas de habilidades!", "Prioridade Necessária");
            return false;
        }

        const uniquePriorities = new Set([talentsMax, skillsMax, knowledgesMax]);
        if (uniquePriorities.size !== 3) {
            context.showAlert("As prioridades de habilidades devem ser únicas para cada coluna!", "Prioridades Duplicadas");
            return false;
        }

        // Talentos
        const talentIds = [
            'alertness', 'athletics', 'awareness', 'brawl', 'empathy',
            'expression', 'intimidation', 'leadership', 'streetwise', 'subterfuge'
        ];
        const talentsSpent = talentIds.reduce((sum, id) => sum + getVal(id), 0);

        // Perícias
        const skillIds = [
            'animal_ken', 'crafts', 'drive', 'etiquette', 'firearms',
            'larceny', 'melee', 'performance', 'stealth', 'survival'
        ];
        const skillsSpent = skillIds.reduce((sum, id) => sum + getVal(id), 0);

        // Conhecimentos
        const knowledgeIds = [
            'academics', 'computer', 'finance', 'investigation', 'law',
            'medicine', 'occult', 'politics', 'science', 'technology'
        ];
        const knowledgesSpent = knowledgeIds.reduce((sum, id) => sum + getVal(id), 0);

        if (talentsSpent !== talentsMax) {
            context.showAlert(`Você distribuiu ${talentsSpent} pontos em Talentos, mas escolheu a prioridade que exige exatamente ${talentsMax} pontos!`, "Distribuição Incorreta");
            return false;
        }

        if (skillsSpent !== skillsMax) {
            context.showAlert(`Você distribuiu ${skillsSpent} pontos em Perícias, mas escolheu a prioridade que exige exatamente ${skillsMax} pontos!`, "Distribuição Incorreta");
            return false;
        }

        if (knowledgesSpent !== knowledgesMax) {
            context.showAlert(`Você distribuiu ${knowledgesSpent} pontos em Conhecimentos, mas escolheu a prioridade que exige exatamente ${knowledgesMax} pontos!`, "Distribuição Incorreta");
            return false;
        }
    }
    return true;
}

