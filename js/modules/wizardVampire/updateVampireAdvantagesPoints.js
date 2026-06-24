/**
 * Calculates and updates the current spent points for Vampire advantages/disciplines.
 */
export function updateVampireAdvantagesPoints() {
    const val1 = parseInt(document.getElementById('wiz-discipline-1')?.value || 0);
    const val2 = parseInt(document.getElementById('wiz-discipline-2')?.value || 0);
    const val3 = parseInt(document.getElementById('wiz-discipline-3')?.value || 0);
    const total = val1 + val2 + val3;

    const span = document.getElementById('vamp-advantages-spent');
    if (span) {
        span.textContent = total;
    }

    // Toggle over-limit/complete styling on the parent tracker element
    const tracker = span ? span.closest('.vamp-points-tracker') : null;
    if (tracker) {
        tracker.classList.toggle('over-limit', total > 3);
        tracker.classList.toggle('complete', total === 3);
    }
}
