import { BACKGROUNDS_CONFIG } from './renderVampireBackgroundsGrid.js';

/**
 * Calculates and updates the current spent points for Vampire backgrounds.
 */
export function updateVampireBackgroundsPoints() {
    let spent = 0;
    BACKGROUNDS_CONFIG.forEach(bg => {
        const val = parseInt(document.getElementById(`wiz-background-${bg.id}`)?.value || 0);
        spent += val;
    });

    const span = document.getElementById('vamp-backgrounds-spent');
    if (span) {
        span.textContent = spent;
    }

    // Toggle over-limit/complete styling on the parent tracker element
    const tracker = span ? span.closest('.vamp-points-tracker') : null;
    if (tracker) {
        tracker.classList.toggle('over-limit', spent > 5);
        tracker.classList.toggle('complete', spent === 5);
    }
}
