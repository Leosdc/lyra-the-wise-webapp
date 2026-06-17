/**
 * Renders a single Vampire attribute row with interactive dots.
 * 
 * @param {string} id - The attribute identifier.
 * @param {string} name - The display name of the attribute.
 * @param {string} desc - Description for the tooltip.
 * @param {number} currentVal - Currently set value.
 * @param {number} maxVal - Maximum possible value for this attribute.
 * @returns {string} HTML string representing the row.
 */
export function renderVampAttrRow(id, name, desc, currentVal, maxVal) {
    let dotsHtml = '';
    for (let i = 1; i <= maxVal; i++) {
        const isActive = i <= currentVal;
        const iconClass = isActive ? "fa-solid fa-circle active" : "fa-regular fa-circle";
        dotsHtml += `<i class="${iconClass} vamp-dot" data-value="${i}" data-attr="${id}"></i>`;
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
