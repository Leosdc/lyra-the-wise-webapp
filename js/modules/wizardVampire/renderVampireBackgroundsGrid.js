import { bindVampireBackgroundsEvents } from './bindVampireBackgroundsEvents.js';
import { updateVampireBackgroundsPoints } from './updateVampireBackgroundsPoints.js';

export const BACKGROUNDS_CONFIG = [
    { id: 'aliados', name: 'Aliados', desc: 'Confederações de mortais (amigos, família) que ajudam o personagem de boa vontade.' },
    { id: 'identidade_alternativa', name: 'Identidade Alternativa', desc: 'Uma identidade falsa estabelecida no mundo mortal, completa com documentação oficial.' },
    { id: 'mao_negra', name: 'Mão Negra', desc: 'O número de membros da Mão Negra que o personagem pode convocar ou sua influência na seita.' },
    { id: 'contatos', name: 'Contatos', desc: 'Fontes de informação, informantes e "olhos nas ruas" que o personagem possui.' },
    { id: 'dominio', name: 'Domínio', desc: 'Áreas de caça, alimentação e residência reconhecidas e respeitadas pela sociedade vampírica local.' },
    { id: 'fama', name: 'Fama', desc: 'Quão conhecido, célebre e reconhecido o personagem é no mundo dos mortais (celebridades, políticos).' },
    { id: 'geracao', name: 'Geração', desc: 'Define a pureza do sangue do vampiro.' },
    { id: 'rebanho', name: 'Rebanho', desc: 'Mortais aos quais o vampiro tem acesso livre, seguro e regular para se alimentar sem causar alarde.' },
    { id: 'influencia', name: 'Influência', desc: 'O poder político, burocrático ou social que o personagem exerce ativamente dentro da sociedade mortal.' },
    { id: 'mentor', name: 'Mentor', desc: 'Um vampiro mais velho e experiente que aconselha, protege e apoia o personagem na sociedade cainita.' },
    { id: 'recursos', name: 'Recursos', desc: 'Dinheiro líquido, investimentos, bens, propriedades e a renda mensal estável do personagem.' },
    { id: 'lacaios', name: 'Aliados de Sangue (Lacaios)', desc: 'Seguidores totalmente leais, guarda-costas ou servos.' },
    { id: 'rituais', name: 'Rituais', desc: 'Quantos rituais místicos (ritae) o Cainita conhece, sabe guiar e executar.' },
    { id: 'status', name: 'Status', desc: 'A posição social, reputação, respeito e prestígio do personagem na sociedade dos vampiros de sua seita.' }
];

/**
 * Renders Step 4 Backgrounds panel dynamically.
 * 
 * @param {object} context - Creation wizard context.
 */
export function renderVampireBackgroundsGrid(context) {
    const container = document.getElementById('wiz-vamp-backgrounds-container');
    if (!container) return;

    let html = "";
    BACKGROUNDS_CONFIG.forEach(bg => {
        const inputId = `wiz-background-${bg.id}`;
        let currentVal = parseInt(document.getElementById(inputId)?.value || "0");
        if (currentVal < 0) currentVal = 0;
        if (currentVal > 3) currentVal = 3; // Trava inicial na criação

        let dotsHtml = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= 3) {
                // Clickable dots for values 1, 2, 3
                const isActive = i <= currentVal;
                const iconClass = isActive ? "fa-solid fa-circle active" : "fa-regular fa-circle";
                dotsHtml += `<i class="${iconClass} vamp-dot vamp-background-dot" data-value="${i}" data-background="${bg.id}" style="cursor: pointer;"></i>`;
            } else {
                // Non-clickable dots for values 4, 5 (limit of 3 in creation)
                dotsHtml += `<i class="fa-regular fa-circle vamp-dot" style="opacity: 0.25; cursor: not-allowed;" title="Limite de 3 bolinhas na criação"></i>`;
            }
        }

        html += `
            <div class="vamp-attr-row" title="${bg.desc}" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.3); padding: 0.8rem 1.2rem; border-radius: 6px; border: 1px solid rgba(44, 30, 22, 0.08);">
                <span class="vamp-attr-name font-medieval" style="font-size: 1.1rem; color: var(--ink);">${bg.name}</span>
                <div class="vamp-dots-container" style="display: flex; gap: 6px;">
                    ${dotsHtml}
                </div>
                <input type="hidden" id="${inputId}" value="${currentVal}">
            </div>
        `;
    });

    container.innerHTML = html;

    // Bind event listeners
    if (typeof bindVampireBackgroundsEvents === 'function') {
        bindVampireBackgroundsEvents();
    }
    if (typeof updateVampireBackgroundsPoints === 'function') {
        updateVampireBackgroundsPoints();
    }
}
