import { updateVampirePoints } from './updateVampirePoints.js';

/**
 * Binds event listeners to Vampire attribute priority selects and dot clicks.
 */
export function bindVampireAttrEvents() {
    const selects = document.querySelectorAll('.vamp-priority-select');
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
            updateVampirePoints();
        });
    });

    const dots = document.querySelectorAll('.vamp-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const attrId = dot.dataset.attr;
            const value = parseInt(dot.dataset.value);
            const hiddenInput = document.getElementById(`wiz-${attrId}`);
            if (!hiddenInput) return;

            hiddenInput.value = value;

            const container = dot.parentElement;
            const rowDots = container.querySelectorAll('.vamp-dot');
            rowDots.forEach(d => {
                const val = parseInt(d.dataset.value);
                if (val <= value) {
                    d.className = "fa-solid fa-circle active vamp-dot";
                } else {
                    d.className = "fa-regular fa-circle vamp-dot";
                }
            });

            updateVampirePoints();
        });
    });
}
