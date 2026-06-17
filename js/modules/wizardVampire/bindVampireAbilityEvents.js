import { updateVampireAbilityPoints } from './updateVampireAbilityPoints.js';

/**
 * Binds event listeners to Vampire ability priority selects and dot clicks.
 */
export function bindVampireAbilityEvents() {
    const selects = document.querySelectorAll('.vamp-priority-select-ability');
    selects.forEach(sel => {
        sel.addEventListener('change', () => {
            const val = sel.value;
            if (val) {
                selects.forEach(otherSel => {
                    if (otherSel !== sel && otherSel.value === val) {
                        otherSel.value = "";
                    }
                });
            }
            updateVampireAbilityPoints();
        });
    });

    const dots = document.querySelectorAll('.vamp-ability-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            // Capped at 3. Do nothing if clicked dot index is > 3.
            if (dot.classList.contains('locked')) return;

            const abilityId = dot.dataset.ability;
            const clickedValue = parseInt(dot.dataset.value);
            const hiddenInput = document.getElementById(`wiz-${abilityId}`);
            if (!hiddenInput) return;

            let currentValue = parseInt(hiddenInput.value) || 0;
            let newValue = clickedValue;

            // If clicked dot is exactly the current value, toggle back to 0
            if (currentValue === clickedValue) {
                newValue = 0;
            }

            hiddenInput.value = newValue;

            const container = dot.parentElement;
            const rowDots = container.querySelectorAll('.vamp-ability-dot');
            rowDots.forEach(d => {
                const val = parseInt(d.dataset.value);
                const isActive = val <= newValue;
                const isLocked = val > 3;
                const baseClass = isLocked ? "vamp-dot vamp-ability-dot locked" : "vamp-dot vamp-ability-dot";
                
                if (isActive) {
                    d.className = `fa-solid fa-circle active ${baseClass}`;
                } else {
                    d.className = `fa-regular fa-circle ${baseClass}`;
                }
            });

            updateVampireAbilityPoints();
        });
    });
}
