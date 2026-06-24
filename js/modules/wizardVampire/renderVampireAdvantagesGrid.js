import { bindVampireAdvantagesEvents } from './bindVampireAdvantagesEvents.js';
import { updateVampireAdvantagesPoints } from './updateVampireAdvantagesPoints.js';

const CLAN_DISCIPLINES = {
    "Assamita": ["Celeridade", "Ofuscação", "Quietus"],
    "Assamitas": ["Celeridade", "Ofuscação", "Quietus"],
    "Brujah": ["Celeridade", "Potência", "Presença"],
    "Seguidores de Set": ["Ofuscação", "Presença", "Serpentis"],
    "Gangrel": ["Animalismo", "Fortitude", "Metamorfose"],
    "Giovanni": ["Dominar", "Necromancia", "Potência"],
    "Lasombra": ["Dominar", "Obtenebração", "Potência"],
    "Malkavian": ["Auspício", "Dementação", "Ofuscação"],
    "Malkavianos": ["Auspício", "Dementação", "Ofuscação"],
    "Nosferatu": ["Animalismo", "Ofuscação", "Potência"],
    "Ravnos": ["Animalismo", "Quimerismo", "Fortitude"],
    "Toreador": ["Auspício", "Celeridade", "Presença"],
    "Tremere": ["Auspício", "Dominar", "Taumaturgia"],
    "Tzimisce": ["Animalismo", "Auspício", "Vicissitude"],
    "Ventrue": ["Dominar", "Fortitude", "Presença"]
};

const ALL_DISCIPLINES = [
    "Animalismo", "Auspício", "Celeridade", "Dementação", "Dominar",
    "Fortitude", "Metamorfose", "Necromancia", "Obtenebração", "Ofuscação",
    "Potência", "Presença", "Quietus", "Quimerismo", "Serpentis",
    "Taumaturgia", "Vicissitude"
];

/**
 * Renders Step 4 Advantages/Disciplines panel dynamically based on chosen clan.
 * 
 * @param {object} context - Creation wizard context.
 */
export function renderVampireAdvantagesGrid(context) {
    const container = document.getElementById('wiz-vamp-advantages-container');
    if (!container) return;

    const clan = document.getElementById('wiz-vamp-clan')?.value || "";
    const isCaitiff = clan === "Caitiff";
    const disciplines = CLAN_DISCIPLINES[clan] || ["", "", ""];

    let html = "";
    for (let slot = 1; slot <= 3; slot++) {
        const inputId = `wiz-discipline-${slot}`;
        const nameId = `wiz-discipline-name-${slot}`;
        
        let currentVal = parseInt(document.getElementById(inputId)?.value || "0");
        let currentName = document.getElementById(nameId)?.value || (isCaitiff ? "" : (disciplines[slot - 1] || ""));

        // Generate dot elements (0 to 3 dots)
        let dotsHtml = "";
        for (let i = 1; i <= 3; i++) {
            const isActive = i <= currentVal;
            const iconClass = isActive ? "fa-solid fa-circle active" : "fa-regular fa-circle";
            dotsHtml += `<i class="${iconClass} vamp-dot vamp-discipline-dot" data-value="${i}" data-slot="${slot}"></i>`;
        }

        let nameHtml = "";
        if (isCaitiff) {
            const options = ALL_DISCIPLINES.map(d => `<option value="${d}" ${d === currentName ? 'selected' : ''}>${d}</option>`).join('');
            nameHtml = `
                <select class="medieval-select vamp-discipline-select" data-slot="${slot}" style="width: 180px; padding: 0.3rem 0.5rem; font-size: 0.95rem;">
                    <option value="">Selecione...</option>
                    ${options}
                </select>
            `;
        } else {
            nameHtml = `<span class="vamp-attr-name font-medieval" style="font-size: 1.1rem; color: var(--ink);">${currentName}</span>`;
        }

        html += `
            <div class="vamp-attr-row" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.3); padding: 0.8rem 1.2rem; border-radius: 6px; border: 1px solid rgba(44, 30, 22, 0.08);">
                ${nameHtml}
                <div class="vamp-dots-container" style="display: flex; gap: 6px;">
                    ${dotsHtml}
                </div>
                <input type="hidden" id="${inputId}" value="${currentVal}">
                <input type="hidden" id="${nameId}" value="${currentName}">
            </div>
        `;
    }

    container.innerHTML = html;

    // Bind event listeners stubs
    if (typeof bindVampireAdvantagesEvents === 'function') {
        bindVampireAdvantagesEvents();
    }
    if (typeof updateVampireAdvantagesPoints === 'function') {
        updateVampireAdvantagesPoints();
    }
}
