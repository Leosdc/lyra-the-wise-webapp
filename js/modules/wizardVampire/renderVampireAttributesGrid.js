import { renderVampAttrRow } from './renderVampAttrRow.js';
import { bindVampireAttrEvents } from './bindVampireAttrEvents.js';
import { updateVampirePoints } from './updateVampirePoints.js';

/**
 * Renders the full Vampire attributes grid layout with three columns.
 * 
 * @param {object} context - Context object containing systems registry/current system.
 */
export function renderVampireAttributesGrid(context) {
    const genStr = document.getElementById('wiz-vamp-generation')?.value || "13ª Geração";
    const genNum = parseInt(genStr.match(/\d+/)?.[0]) || 13;
    let maxAttr = 5;
    if (genNum === 7) maxAttr = 6;
    else if (genNum === 6) maxAttr = 7;
    else if (genNum === 5) maxAttr = 8;
    else if (genNum <= 4) maxAttr = 9;

    const attrGrid = document.getElementById('wiz-attributes-grid');
    if (!attrGrid) return;

    attrGrid.className = "attributes-vampire-layout";

    const getVal = (id, def = 1) => {
        const el = document.getElementById(`wiz-${id}`);
        return el ? (parseInt(el.value) || def) : def;
    };

    const physPriority = document.getElementById('vamp-priority-physical')?.value || "";
    const socPriority = document.getElementById('vamp-priority-social')?.value || "";
    const menPriority = document.getElementById('vamp-priority-mental')?.value || "";

    const html = `
        <div class="vamp-priorities-info">
            <p class="vamp-info-text">Defina a prioridade de cada categoria. Primário = 7 pts, Secundário = 5 pts, Terciário = 3 pts.</p>
        </div>
        <div class="vamp-attributes-columns">
            <!-- Físicos -->
            <div class="vamp-attr-column parchment-card">
                <div class="column-header">
                    <h4>Físicos</h4>
                    <select id="vamp-priority-physical" class="medieval-select vamp-priority-select">
                        <option value="">Prioridade...</option>
                        <option value="7" ${physPriority === "7" ? "selected" : ""}>Primário (7 pts)</option>
                        <option value="5" ${physPriority === "5" ? "selected" : ""}>Secundário (5 pts)</option>
                        <option value="3" ${physPriority === "3" ? "selected" : ""}>Terciário (3 pts)</option>
                    </select>
                </div>
                <div class="vamp-points-tracker" id="vamp-tracker-physical">Pontos: 0/0</div>
                <div class="vamp-attr-list">
                    ${renderVampAttrRow('strength', 'Força', 'Poder muscular e capacidade de causar impacto físico.', getVal('strength'), maxAttr)}
                    ${renderVampAttrRow('dexterity', 'Destreza', 'Agilidade, reflexos e coordenação motora.', getVal('dexterity'), maxAttr)}
                    ${renderVampAttrRow('stamina', 'Vigor', 'Resistência a dano, veneno e fadiga.', getVal('stamina'), maxAttr)}
                </div>
            </div>

            <!-- Sociais -->
            <div class="vamp-attr-column parchment-card">
                <div class="column-header">
                    <h4>Sociais</h4>
                    <select id="vamp-priority-social" class="medieval-select vamp-priority-select">
                        <option value="">Prioridade...</option>
                        <option value="7" ${socPriority === "7" ? "selected" : ""}>Primário (7 pts)</option>
                        <option value="5" ${socPriority === "5" ? "selected" : ""}>Secundário (5 pts)</option>
                        <option value="3" ${socPriority === "3" ? "selected" : ""}>Terciário (3 pts)</option>
                    </select>
                </div>
                <div class="vamp-points-tracker" id="vamp-tracker-social">Pontos: 0/0</div>
                <div class="vamp-attr-list">
                    ${renderVampAttrRow('charisma', 'Carisma', 'Charme natural, magnetismo e habilidade de inspirar.', getVal('charisma'), maxAttr)}
                    ${renderVampAttrRow('manipulation', 'Manipulação', 'Persuasão ativa, blefe e comando indireto.', getVal('manipulation'), maxAttr)}
                    ${renderVampAttrRow('appearance', 'Aparência', 'Atratividade visual e primeira impressão.', getVal('appearance'), maxAttr)}
                </div>
            </div>

            <!-- Mentais -->
            <div class="vamp-attr-column parchment-card">
                <div class="column-header">
                    <h4>Mentais</h4>
                    <select id="vamp-priority-mental" class="medieval-select vamp-priority-select">
                        <option value="">Prioridade...</option>
                        <option value="7" ${menPriority === "7" ? "selected" : ""}>Primário (7 pts)</option>
                        <option value="5" ${menPriority === "5" ? "selected" : ""}>Secundário (5 pts)</option>
                        <option value="3" ${menPriority === "3" ? "selected" : ""}>Terciário (3 pts)</option>
                    </select>
                </div>
                <div class="vamp-points-tracker" id="vamp-tracker-mental">Pontos: 0/0</div>
                <div class="vamp-attr-list">
                    ${renderVampAttrRow('perception', 'Percepção', 'Atenção ao ambiente e intuição de detalhes.', getVal('perception'), maxAttr)}
                    ${renderVampAttrRow('intelligence', 'Inteligência', 'Raciocínio analítico, memória e erudição.', getVal('intelligence'), maxAttr)}
                    ${renderVampAttrRow('wits', 'Raciocínio', 'Velocidade de decisão sob pressão direta.', getVal('wits'), maxAttr)}
                </div>
            </div>
        </div>
    `;
    attrGrid.innerHTML = html;

    bindVampireAttrEvents();
    updateVampirePoints();
}
