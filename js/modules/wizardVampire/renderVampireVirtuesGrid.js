import { bindVampireVirtuesEvents } from './bindVampireVirtuesEvents.js';
import { updateVampireVirtuesPoints } from './updateVampireVirtuesPoints.js';

const VIRTUES = [
    { id: 'conscience', name: 'Consciência / Convicção', desc: 'Adesão moral e remorso ante pecados do Caminho.' },
    { id: 'self_control', name: 'Autocontrole / Instinto', desc: 'Controle de impulsos e do frenesi interno.' },
    { id: 'courage', name: 'Coragem', desc: 'Resistência ao pavor da morte (Rötschreck).' }
];

/**
 * Renders Step 4 Virtues panel dynamically.
 * 
 * @param {object} context - Creation wizard context.
 */
export function renderVampireVirtuesGrid(context) {
    const container = document.getElementById('wiz-vamp-virtues-container');
    if (!container) return;

    let html = "";
    VIRTUES.forEach(v => {
        const inputId = `wiz-${v.id}`;
        let currentVal = parseInt(document.getElementById(inputId)?.value || "1");
        if (currentVal < 1) currentVal = 1;
        if (currentVal > 5) currentVal = 5;

        // Generate dot elements (1 to 5 dots)
        // Dot 1 is always active and disabled (fixed base point)
        let dotsHtml = `<i class="fa-solid fa-circle active vamp-dot" style="opacity: 0.8; cursor: default;"></i>`;
        for (let i = 2; i <= 5; i++) {
            const isActive = i <= currentVal;
            const iconClass = isActive ? "fa-solid fa-circle active" : "fa-regular fa-circle";
            dotsHtml += `<i class="${iconClass} vamp-dot vamp-virtue-dot" data-value="${i}" data-virtue="${v.id}"></i>`;
        }

        html += `
            <div class="vamp-attr-row" title="${v.desc}" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.3); padding: 0.8rem 1.2rem; border-radius: 6px; border: 1px solid rgba(44, 30, 22, 0.08);">
                <span class="vamp-attr-name font-medieval" style="font-size: 1.1rem; color: var(--ink);">${v.name}</span>
                <div class="vamp-dots-container" style="display: flex; gap: 6px;">
                    ${dotsHtml}
                </div>
                <input type="hidden" id="${inputId}" value="${currentVal}">
            </div>
        `;
    });

    container.innerHTML = html;

    // Bind event listeners stubs (to be defined in Phase 2)
    if (typeof bindVampireVirtuesEvents === 'function') {
        bindVampireVirtuesEvents();
    }
    if (typeof updateVampireVirtuesPoints === 'function') {
        updateVampireVirtuesPoints();
    }
}
