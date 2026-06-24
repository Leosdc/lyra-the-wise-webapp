import { updateVampireVirtuesPoints } from './updateVampireVirtuesPoints.js';

/**
 * Binds event listeners to Vampire Virtues dot clicks.
 */
export function bindVampireVirtuesEvents() {
    const dots = document.querySelectorAll('.vamp-virtue-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const virtue = dot.dataset.virtue;
            const clickedValue = parseInt(dot.dataset.value);
            const hiddenInput = document.getElementById(`wiz-${virtue}`);
            if (!hiddenInput) return;

            let currentValue = parseInt(hiddenInput.value) || 1;
            let newValue = clickedValue;

            // Toggle logic: click on same active dot returns it to one level below (min 1)
            if (currentValue === clickedValue) {
                newValue = Math.max(1, clickedValue - 1);
            }

            hiddenInput.value = newValue;

            // Visual update of dots in this container
            const container = dot.parentElement;
            const rowDots = container.querySelectorAll('.vamp-virtue-dot');
            rowDots.forEach(d => {
                const val = parseInt(d.dataset.value);
                const isActive = val <= newValue;
                const baseClass = "vamp-dot vamp-virtue-dot";
                
                if (isActive) {
                    d.className = `fa-solid fa-circle active ${baseClass}`;
                } else {
                    d.className = `fa-regular fa-circle ${baseClass}`;
                }
            });

            updateVampireVirtuesPoints();
        });
    });
}
