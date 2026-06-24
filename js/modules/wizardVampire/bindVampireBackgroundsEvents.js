import { updateVampireBackgroundsPoints } from './updateVampireBackgroundsPoints.js';

/**
 * Binds event listeners to Vampire Backgrounds dot clicks.
 */
export function bindVampireBackgroundsEvents() {
    const dots = document.querySelectorAll('.vamp-background-dot');
    dots.forEach(dot => {
        // Remove existing listener if any (by cloning and replacing or just adding)
        // Since we render from scratch, fresh event listeners are fine.
        dot.addEventListener('click', () => {
            const bgId = dot.dataset.background;
            const clickedValue = parseInt(dot.dataset.value);
            const hiddenInput = document.getElementById(`wiz-background-${bgId}`);
            if (!hiddenInput) return;

            let currentValue = parseInt(hiddenInput.value) || 0;
            let newValue = clickedValue;

            // Toggle logic: click on same active dot returns it to one level below (min 0)
            if (currentValue === clickedValue) {
                newValue = Math.max(0, clickedValue - 1);
            }

            hiddenInput.value = newValue;

            // Visual update of dots in this container
            const container = dot.parentElement;
            const rowDots = container.querySelectorAll('.vamp-background-dot');
            rowDots.forEach(d => {
                const val = parseInt(d.dataset.value);
                const isActive = val <= newValue;
                const baseClass = "vamp-dot vamp-background-dot";
                
                if (isActive) {
                    d.className = `fa-solid fa-circle active ${baseClass}`;
                } else {
                    d.className = `fa-regular fa-circle ${baseClass}`;
                }
            });

            updateVampireBackgroundsPoints();
        });
    });
}
