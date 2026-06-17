import { renderVampAbilityRow } from './renderVampAbilityRow.js';
import { bindVampireAbilityEvents } from './bindVampireAbilityEvents.js';
import { updateVampireAbilityPoints } from './updateVampireAbilityPoints.js';

/**
 * Renders the full Vampire abilities grid layout with three columns.
 * 
 * @param {object} context - Context object containing systems registry/current system.
 */
export function renderVampireAbilitiesGrid(context) {
    const skillsSel = document.getElementById('wiz-skills-selection');
    if (!skillsSel) return;

    skillsSel.className = "attributes-vampire-layout";

    const getVal = (id, def = 0) => {
        const el = document.getElementById(`wiz-${id}`);
        return el ? (parseInt(el.value) || def) : def;
    };

    const talentPriority = document.getElementById('vamp-priority-talents')?.value || "";
    const skillPriority = document.getElementById('vamp-priority-skills')?.value || "";
    const knowledgePriority = document.getElementById('vamp-priority-knowledges')?.value || "";

    const html = `
        <div class="vamp-priorities-info">
            <p class="vamp-info-text">Defina a prioridade de cada categoria. Primário = 13 pts, Secundário = 9 pts, Terciário = 5 pts.</p>
        </div>
        <div class="vamp-attributes-columns">
            <!-- Talentos -->
            <div class="vamp-attr-column parchment-card">
                <div class="column-header">
                    <h4>Talentos</h4>
                    <select id="vamp-priority-talents" class="medieval-select vamp-priority-select-ability">
                        <option value="">Prioridade...</option>
                        <option value="13" ${talentPriority === "13" ? "selected" : ""}>Primário (13 pts)</option>
                        <option value="9" ${talentPriority === "9" ? "selected" : ""}>Secundário (9 pts)</option>
                        <option value="5" ${talentPriority === "5" ? "selected" : ""}>Terciário (5 pts)</option>
                    </select>
                </div>
                <div class="vamp-points-tracker" id="vamp-tracker-talents">Pontos: 0/0</div>
                <div class="vamp-attr-list">
                    ${renderVampAbilityRow('alertness', 'Prontidão', 'Notar o perigo ou mudanças ao redor.', getVal('alertness'))}
                    ${renderVampAbilityRow('athletics', 'Atletismo', 'Correr, saltar, escalada.', getVal('athletics'))}
                    ${renderVampAbilityRow('awareness', 'Percepção Extra-sens.', 'Notar o sobrenatural ou a aura.', getVal('awareness'))}
                    ${renderVampAbilityRow('brawl', 'Briga', 'Combate corpo a corpo desarmado.', getVal('brawl'))}
                    ${renderVampAbilityRow('empathy', 'Empatia', 'Ler intenções e sentimentos.', getVal('empathy'))}
                    ${renderVampAbilityRow('expression', 'Expressão', 'Escrever, discursar ou expressar ideias.', getVal('expression'))}
                    ${renderVampAbilityRow('intimidation', 'Intimidação', 'Coagir ou assustar fisicamente ou mentalmente.', getVal('intimidation'))}
                    ${renderVampAbilityRow('leadership', 'Liderança', 'Inspirar ou comandar outras pessoas.', getVal('leadership'))}
                    ${renderVampAbilityRow('streetwise', 'Manha', 'Conhecimento das ruas, rumores e crime.', getVal('streetwise'))}
                    ${renderVampAbilityRow('subterfuge', 'Subterfúgio', 'Ocultar a verdade, mentir ou seduzir.', getVal('subterfuge'))}
                </div>
            </div>

            <!-- Perícias -->
            <div class="vamp-attr-column parchment-card">
                <div class="column-header">
                    <h4>Perícias</h4>
                    <select id="vamp-priority-skills" class="medieval-select vamp-priority-select-ability">
                        <option value="">Prioridade...</option>
                        <option value="13" ${skillPriority === "13" ? "selected" : ""}>Primário (13 pts)</option>
                        <option value="9" ${skillPriority === "9" ? "selected" : ""}>Secundário (9 pts)</option>
                        <option value="5" ${skillPriority === "5" ? "selected" : ""}>Terciário (5 pts)</option>
                    </select>
                </div>
                <div class="vamp-points-tracker" id="vamp-tracker-skills">Pontos: 0/0</div>
                <div class="vamp-attr-list">
                    ${renderVampAbilityRow('animal_ken', 'Emp. com Animais', 'Entender ou acalmar animais.', getVal('animal_ken'))}
                    ${renderVampAbilityRow('crafts', 'Ofícios', 'Fabricar ou reparar itens físicos.', getVal('crafts'))}
                    ${renderVampAbilityRow('drive', 'Condução', 'Dirigir carros, motos ou pilotar.', getVal('drive'))}
                    ${renderVampAbilityRow('etiquette', 'Etiqueta', 'Maneiras sociais na sociedade mortal ou cainita.', getVal('etiquette'))}
                    ${renderVampAbilityRow('firearms', 'Armas de Fogo', 'Atirar com pistolas, fuzis, etc.', getVal('firearms'))}
                    ${renderVampAbilityRow('larceny', 'Furtos', 'Arrombar fechaduras, bater carteiras.', getVal('larceny'))}
                    ${renderVampAbilityRow('melee', 'Armas Brancas', 'Combate usando espadas, facas, bastões.', getVal('melee'))}
                    ${renderVampAbilityRow('performance', 'Performance', 'Atuar, cantar, dançar ou encenar.', getVal('performance'))}
                    ${renderVampAbilityRow('stealth', 'Furtividade', 'Mover-se silenciosamente ou se esconder.', getVal('stealth'))}
                    ${renderVampAbilityRow('survival', 'Sobrevivência', 'Sobreviver em ambientes hostis/selvagens.', getVal('survival'))}
                </div>
            </div>

            <!-- Conhecimentos -->
            <div class="vamp-attr-column parchment-card">
                <div class="column-header">
                    <h4>Conhecimentos</h4>
                    <select id="vamp-priority-knowledges" class="medieval-select vamp-priority-select-ability">
                        <option value="">Prioridade...</option>
                        <option value="13" ${knowledgePriority === "13" ? "selected" : ""}>Primário (13 pts)</option>
                        <option value="9" ${knowledgePriority === "9" ? "selected" : ""}>Secundário (9 pts)</option>
                        <option value="5" ${knowledgePriority === "5" ? "selected" : ""}>Terciário (5 pts)</option>
                    </select>
                </div>
                <div class="vamp-points-tracker" id="vamp-tracker-knowledges">Pontos: 0/0</div>
                <div class="vamp-attr-list">
                    ${renderVampAbilityRow('academics', 'Acadêmicos', 'Conhecimento geral, artes, história.', getVal('academics'))}
                    ${renderVampAbilityRow('computer', 'Informática', 'Programar, hackear, usar computadores.', getVal('computer'))}
                    ${renderVampAbilityRow('finance', 'Finanças', 'Lidar com mercados, comércio e dinheiro.', getVal('finance'))}
                    ${renderVampAbilityRow('investigation', 'Investigação', 'Procurar pistas, deduzir crimes.', getVal('investigation'))}
                    ${renderVampAbilityRow('law', 'Direito', 'Leis dos mortais e tradições vampíricas.', getVal('law'))}
                    ${renderVampAbilityRow('medicine', 'Medicina', 'Tratar ferimentos, anatomia, doenças.', getVal('medicine'))}
                    ${renderVampAbilityRow('occult', 'Ocultismo', 'Conhecimento de seitas, magia e mitos.', getVal('occult'))}
                    ${renderVampAbilityRow('politics', 'Política', 'Intriga governamental ou de seitas.', getVal('politics'))}
                    ${renderVampAbilityRow('science', 'Ciências', 'Química, física, biologia e pesquisa.', getVal('science'))}
                    ${renderVampAbilityRow('technology', 'Tecnologia', 'Eletrônica básica, fiação, segurança.', getVal('technology'))}
                </div>
            </div>
        </div>
    `;
    skillsSel.innerHTML = html;

    bindVampireAbilityEvents();
    updateVampireAbilityPoints();
}
