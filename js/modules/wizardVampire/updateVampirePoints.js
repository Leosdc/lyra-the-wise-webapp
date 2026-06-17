/**
 * Calculates and updates the current spent points against the selected category priorities
 * for Vampire attributes.
 */
export function updateVampirePoints() {
    const getVal = (id) => parseInt(document.getElementById(`wiz-${id}`)?.value || 1);

    const physSpent = (getVal('strength') - 1) + (getVal('dexterity') - 1) + (getVal('stamina') - 1);
    const physPrioritySelect = document.getElementById('vamp-priority-physical');
    const physMax = physPrioritySelect ? (parseInt(physPrioritySelect.value) || 0) : 0;
    const physTracker = document.getElementById('vamp-tracker-physical');
    if (physTracker) {
        physTracker.textContent = `Pontos: ${physSpent} / ${physMax}`;
        physTracker.classList.toggle('over-limit', physSpent > physMax);
        physTracker.classList.toggle('complete', physSpent === physMax && physMax > 0);
    }

    const socSpent = (getVal('charisma') - 1) + (getVal('manipulation') - 1) + (getVal('appearance') - 1);
    const socPrioritySelect = document.getElementById('vamp-priority-social');
    const socMax = socPrioritySelect ? (parseInt(socPrioritySelect.value) || 0) : 0;
    const socTracker = document.getElementById('vamp-tracker-social');
    if (socTracker) {
        socTracker.textContent = `Pontos: ${socSpent} / ${socMax}`;
        socTracker.classList.toggle('over-limit', socSpent > socMax);
        socTracker.classList.toggle('complete', socSpent === socMax && socMax > 0);
    }

    const menSpent = (getVal('perception') - 1) + (getVal('intelligence') - 1) + (getVal('wits') - 1);
    const menPrioritySelect = document.getElementById('vamp-priority-mental');
    const menMax = menPrioritySelect ? (parseInt(menPrioritySelect.value) || 0) : 0;
    const menTracker = document.getElementById('vamp-tracker-mental');
    if (menTracker) {
        menTracker.textContent = `Pontos: ${menSpent} / ${menMax}`;
        menTracker.classList.toggle('over-limit', menSpent > menMax);
        menTracker.classList.toggle('complete', menSpent === menMax && menMax > 0);
    }
}
