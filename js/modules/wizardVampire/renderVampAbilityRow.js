/**
 * Renders a single Vampire ability row with interactive dots (capped at 3).
 * 
 * @param {string} id - The ability identifier.
 * @param {string} name - The display name of the ability.
 * @param {string} desc - Description for the tooltip.
 * @param {number} currentVal - Currently set value (0 to 3).
 * @param {number} maxVal - Maximum possible value (usually 5).
 * @returns {string} HTML string representing the row.
 */
export function renderVampAbilityRow(id, name, desc, currentVal, maxVal = 5) {
    let dotsHtml = '';
    for (let i = 1; i <= maxVal; i++) {
        const isActive = i <= currentVal;
        const iconClass = isActive ? "fa-solid fa-circle active" : "fa-regular fa-circle";
        const isLocked = i > 3;
        const extraClass = isLocked ? "locked" : "";
        dotsHtml += `<i class="${iconClass} vamp-dot vamp-ability-dot ${extraClass}" data-value="${i}" data-ability="${id}"></i>`;
    }
    return `
        <div class="vamp-attr-row" title="${desc || ''}">
            <span class="vamp-attr-name">${name}</span>
            <div class="vamp-dots-container">
                ${dotsHtml}
            </div>
            <input type="hidden" id="wiz-${id}" value="${currentVal}">
        </div>
    `;
}
