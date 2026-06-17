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
    return true;
}
