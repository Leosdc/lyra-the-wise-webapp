/**
 * Calculates and updates the current spent points for Vampire virtues.
 */
export function updateVampireVirtuesPoints() {
    const conscience = parseInt(document.getElementById('wiz-conscience')?.value || 1);
    const selfControl = parseInt(document.getElementById('wiz-self_control')?.value || 1);
    const courage = parseInt(document.getElementById('wiz-courage')?.value || 1);

    // Virtues start at 1, so points spent is the value minus the base 1
    const spent = (conscience - 1) + (selfControl - 1) + (courage - 1);

    const span = document.getElementById('vamp-virtues-spent');
    if (span) {
        span.textContent = spent;
    }

    // Toggle over-limit/complete styling on the parent tracker element
    const tracker = span ? span.closest('.vamp-points-tracker') : null;
    if (tracker) {
        tracker.classList.toggle('over-limit', spent > 7);
        tracker.classList.toggle('complete', spent === 7);
    }
}
