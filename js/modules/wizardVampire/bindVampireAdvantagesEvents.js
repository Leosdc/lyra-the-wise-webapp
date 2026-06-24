import { updateVampireAdvantagesPoints } from './updateVampireAdvantagesPoints.js';

/**
 * Binds event listeners to Vampire Advantages (disciplines) dot clicks and select dropdowns.
 */
export function bindVampireAdvantagesEvents() {
    // 1. Dot clicks for allocation
    const dots = document.querySelectorAll('.vamp-discipline-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slot = dot.dataset.slot;
            const clickedValue = parseInt(dot.dataset.value);
            const hiddenInput = document.getElementById(`wiz-discipline-${slot}`);
            if (!hiddenInput) return;

            let currentValue = parseInt(hiddenInput.value) || 0;
            let newValue = clickedValue;

            // Toggle logic: click on same active dot returns it to 0
            if (currentValue === clickedValue) {
                newValue = 0;
            }

            hiddenInput.value = newValue;

            // Visual update of dots in this container
            const container = dot.parentElement;
            const rowDots = container.querySelectorAll('.vamp-discipline-dot');
            rowDots.forEach(d => {
                const val = parseInt(d.dataset.value);
                const isActive = val <= newValue;
                const baseClass = "vamp-dot vamp-discipline-dot";
                
                if (isActive) {
                    d.className = `fa-solid fa-circle active ${baseClass}`;
                } else {
                    d.className = `fa-regular fa-circle ${baseClass}`;
                }
            });

            updateVampireAdvantagesPoints();
        });
    });

    // 2. Select change for Caitiff discipline choice
    const selects = document.querySelectorAll('.vamp-discipline-select');
    selects.forEach(sel => {
        sel.addEventListener('change', () => {
            const slot = sel.dataset.slot;
            const selectedVal = sel.value;
            const nameInput = document.getElementById(`wiz-discipline-name-${slot}`);
            if (nameInput) {
                nameInput.value = selectedVal;
            }
        });
    });
}
