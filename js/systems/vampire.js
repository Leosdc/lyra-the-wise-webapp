/**
 * Vampire: The Masquerade (V20) System Plugin
 * Implementação do contrato SystemPlugin para a 20ª Edição Clássica (V20) de Vampiro: A Máscara.
 */

import SystemRegistry from './system-registry.js';
import { escapeHTML } from '../modules/utils.js';

// ═══════════════════════════════════════════════════════════════
//  DADOS ESTÁTICOS V20
// ═══════════════════════════════════════════════════════════════

const CLANS = [
    "Brujah", "Gangrel", "Malkavian", "Nosferatu", "Toreador", "Tremere", "Ventrue",
    "Lasombra", "Tzimisce", "Giovanni", "Assamita", "Seguidores de Set", "Ravnos", "Caitiff"
];

const SECTS = [
    "Camarilla", "Sabá", "Anarquistas", "Independentes", "Autarcas"
];

const PATHS = [
    "Humanidade", "Caminho de Caim", "Caminho das Feras", "Caminho dos Reis",
    "Caminho do Acordo", "Caminho dos Sussurros", "Caminho dos Ossos"
];

const ARCHETYPES = [
    "Arquiteto", "Autocrata", "Bon Vivant", "Caçador de Emoções", "Capitalista",
    "Celebrante", "Competidor", "Conformista", "Diretor", "Excêntrico", "Fanático",
    "Filantropo", "Inconformista", "Juiz", "Solitário", "Mártir", "Masoquista",
    "Monstro", "Pedagogo", "Penitente", "Perfeccionista", "Protetor", "Rebelde",
    "Ranzinza", "Sobrevivente", "Trapaceiro", "Visionário"
];

const BACKGROUNDS = [
    "Aliados", "Contatos", "Fama", "Geração", "Influência",
    "Mentores", "Rebanho", "Recursos", "Lacaios", "Status"
];

// ═══════════════════════════════════════════════════════════════
//  PLUGIN VAMPIRE V20
// ═══════════════════════════════════════════════════════════════

export const VampirePlugin = {
    id: 'vampire',
    name: 'Vampire: The Masquerade (V20)',
    implemented: true,
    version: '2.0.0',
    icon: 'fa-bat',

    // ── Dados ──────────────────────────────────────────────────

    getTemplate() {
        return {
            bio: {
                name: "", clan: "", sect: "", level: 1, // 'level' mapeado para nível de poder / Geração internamente
                generation: "13ª Geração", concept: "",
                sire: "", alignment: "Humanidade", xp: 0, playerName: ""
            },
            attributes: {
                // Físicos
                strength: 1, dexterity: 1, stamina: 1,
                // Sociais
                charisma: 1, manipulation: 1, appearance: 1,
                // Mentais
                perception: 1, intelligence: 1, wits: 1,
                // Virtudes
                conscience: 1, self_control: 1, courage: 1
            },
            skills: {
                // Talentos
                alertness: 0, athletics: 0, awareness: 0, brawl: 0, empathy: 0,
                expression: 0, intimidation: 0, leadership: 0, streetwise: 0, subterfuge: 0,
                // Perícias
                animal_ken: 0, crafts: 0, drive: 0, etiquette: 0, firearms: 0,
                larceny: 0, melee: 0, performance: 0, stealth: 0, survival: 0,
                // Conhecimentos
                academics: 0, computer: 0, finance: 0, investigation: 0, law: 0,
                medicine: 0, occult: 0, politics: 0, science: 0, technology: 0
            },
            stats: {
                hp_current: 7, hp_max: 7, hp_temp: 0, // Fixo 7 níveis de Vitalidade
                ac: 1, initiative: 2, speed: "Normal", // AC usado como defesa base (Destreza)
                willpower_max: 5, willpower_current: 5,
                blood_pool_max: 10, blood_pool_current: 10
            },
            proficiencies_choice: {
                saving_throws: [], // Não usado diretamente
                skills: [],        // IDs de Habilidades habilitadas no Wizard
                expertise: []
            },
            death_saves: { successes: 0, failures: 0 },
            attacks: [],
            spells: {
                ability: "perception", save_dc: 0, attack_bonus: 0,
                slots: {},
                list: []   // Disciplinas
            },
            inventory: {
                coins: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
                items: [],
                encumbrance: { current: 0, limit: 100 }
            },
            story: {
                traits: "", ideals: "", bonds: "", flaws: "",
                appearance: "", mannerisms: "", talents: "",
                languages: "", other_proficiencies: "", notes: ""
            },
            conditions: []
        };
    },

    getCreationData() {
        return {
            races: CLANS,             // Mapeado para races na UI
            classes: ARCHETYPES,      // Mapeado para classes (Natureza)
            alignments: PATHS,        // Mapeado para moralidade
            backgrounds: BACKGROUNDS,
            subraces: {},
            archetypes: {}            // Será preenchido na UI com Comportamento (mesmos arquétipos)
        };
    },

    getAttributeConfig() {
        return [
            // Físicos
            { id: 'strength',     label: 'Força (Físico)',        shortLabel: 'FOR', description: 'Poder muscular e capacidade de causar impacto físico.' },
            { id: 'dexterity',    label: 'Destreza (Físico)',     shortLabel: 'DES', description: 'Agilidade, reflexos e coordenação motora.' },
            { id: 'stamina',      label: 'Vigor (Físico)',        shortLabel: 'VIG', description: 'Resistência a dano, veneno e fadiga.' },
            // Sociais
            { id: 'charisma',     label: 'Carisma (Social)',      shortLabel: 'CAR', description: 'Charme natural, magnetismo e habilidade de inspirar.' },
            { id: 'manipulation', label: 'Manipulação (Social)',  shortLabel: 'MAN', description: 'Persuasão ativa, blefe e comando indireto.' },
            { id: 'appearance',   label: 'Aparência (Social)',    shortLabel: 'APA', description: 'Atratividade visual e primeira impressão.' },
            // Mentais
            { id: 'perception',   label: 'Percepção (Mental)',    shortLabel: 'PER', description: 'Atenção ao ambiente e intuição de detalhes.' },
            { id: 'intelligence', label: 'Inteligência (Mental)',  shortLabel: 'INT', description: 'Raciocínio analítico, memória e erudição.' },
            { id: 'wits',         label: 'Raciocínio (Mental)',   shortLabel: 'RAC', description: 'Velocidade de decisão sob pressão direta.' }
        ];
    },

    getSkillConfig() {
        return [
            // Talentos (Talents)
            { id: 'alertness',     label: 'Prontidão (Talento)',        attribute: 'perception',   description: 'Notar o perigo ou mudanças ao redor.' },
            { id: 'athletics',     label: 'Esportes (Talento)',        attribute: 'dexterity',    description: 'Correr, saltar, escalada.' },
            { id: 'awareness',     label: 'Presciência. (Tal)', attribute: 'perception',   description: 'Notar o sobrenatural ou a aura.' },
            { id: 'brawl',         label: 'Briga (Talento)',            attribute: 'dexterity',    description: 'Combate corpo a corpo desarmado.' },
            { id: 'empathy',       label: 'Empatia (Talento)',          attribute: 'perception',   description: 'Ler intenções e sentimentos.' },
            { id: 'expression',    label: 'Expressão (Talento)',        attribute: 'charisma',     description: 'Escrever, discursar ou expressar ideias.' },
            { id: 'intimidation',  label: 'Intimidação (Talento)',      attribute: 'strength',     description: 'Coagir ou assustar fisicamente ou mentalmente.' },
            { id: 'leadership',    label: 'Liderança (Talento)',        attribute: 'charisma',     description: 'Inspirar ou comandar outras pessoas.' },
            { id: 'streetwise',    label: 'Manha (Talento)',            attribute: 'wits',         description: 'Conhecimento das ruas, rumores e crime.' },
            { id: 'subterfuge',    label: 'Lábia (Talento)',      attribute: 'manipulation', description: 'Ocultar a verdade, mentir ou seduzir.' },

            // Perícias (Skills)
            { id: 'animal_ken',    label: 'Empatia c/ Animais (Per)',   attribute: 'charisma',     description: 'Entender ou acalmar animais.' },
            { id: 'crafts',        label: 'Ofícios (Perícia)',          attribute: 'dexterity',    description: 'Fabricar ou reparar itens físicos.' },
            { id: 'drive',         label: 'Condução (Perícia)',         attribute: 'dexterity',    description: 'Dirigir carros, motos ou pilotar.' },
            { id: 'etiquette',     label: 'Etiqueta (Perícia)',         attribute: 'charisma',     description: 'Maneiras sociais na sociedade mortal ou cainita.' },
            { id: 'firearms',      label: 'Armas de Fogo (Perícia)',    attribute: 'dexterity',    description: 'Atirar com pistolas, fuzis, etc.' },
            { id: 'larceny',       label: 'Furto (Perícia)',           attribute: 'dexterity',    description: 'Arrombar fechaduras, bater carteiras.' },
            { id: 'melee',         label: 'Armas Brancas (Perícia)',    attribute: 'dexterity',    description: 'Combate usando espadas, facas, bastões.' },
            { id: 'performance',   label: 'Performance (Perícia)',      attribute: 'charisma',     description: 'Atuar, cantar, dançar ou encenar.' },
            { id: 'stealth',       label: 'Furtividade (Perícia)',      attribute: 'dexterity',    description: 'Mover-se silenciosamente ou se esconder.' },
            { id: 'survival',      label: 'Sobrevivência (Perícia)',    attribute: 'wits',         description: 'Sobreviver em ambientes hostis/selvagens.' },

            // Conhecimentos (Knowledges)
            { id: 'academics',     label: 'Acadêmicos (Conh)',          attribute: 'intelligence', description: 'Conhecimento geral, artes, história.' },
            { id: 'computer',      label: 'Computador (Conh)',         attribute: 'intelligence', description: 'Programar, hackear, usar computadores.' },
            { id: 'finance',       label: 'Finanças (Conh)',            attribute: 'intelligence', description: 'Lidar com mercados, comércio e dinheiro.' },
            { id: 'investigation', label: 'Investigação (Conh)',        attribute: 'perception',   description: 'Procurar pistas, deduzir crimes.' },
            { id: 'law',           label: 'Direito (Conh)',             attribute: 'intelligence', description: 'Leis dos mortais e tradições vampíricas.' },
            { id: 'medicine',      label: 'Medicina (Conh)',            attribute: 'intelligence', description: 'Tratar ferimentos, anatomia, doenças.' },
            { id: 'occult',        label: 'Ocultismo (Conh)',           attribute: 'intelligence', description: 'Conhecimento de seitas, magia e mitos.' },
            { id: 'politics',      label: 'Política (Conh)',            attribute: 'manipulation', description: 'Intriga governamental ou de seitas.' },
            { id: 'science',       label: 'Ciências (Conh)',            attribute: 'intelligence', description: 'Química, física, biologia e pesquisa.' },
            { id: 'technology',    label: 'Tecnologia (Conh)',          attribute: 'intelligence', description: 'Eletrônica básica, fiação, segurança.' }
        ];
    },

    getSaveConfig() {
        return [
            { id: 'conscience',  label: 'Consciência / Convicção', description: 'Adesão moral e remorso ante pecados do Caminho.' },
            { id: 'self_control', label: 'Autocontrole / Instinto',  description: 'Controle de impulsos e do frenesi interno.' },
            { id: 'courage',      label: 'Coragem',                 description: 'Resistência ao pavor da morte (Rötschreck).' }
        ];
    },

    // ── Cálculos ────────────────────────────────────────────────

    calculateStats(char) {
        const stats = { attributes: {}, skills: {}, saves: {}, general: {} };

        // Copia atributos
        const attrs = this.getAttributeConfig();
        attrs.forEach(attr => {
            const val = parseInt(char.attributes?.[attr.id] || 1);
            stats.attributes[attr.id] = { score: val, mod: val, formatted: String(val) };
        });

        // Copia Virtudes (que também estão em atributos)
        const saves = this.getSaveConfig();
        saves.forEach(s => {
            const val = parseInt(char.attributes?.[s.id] || 1);
            stats.attributes[s.id] = { score: val, mod: val, formatted: String(val) };
            stats.saves[s.id] = { mod: val, formatted: String(val), isProf: true };
        });

        // Habilidades
        const skills = this.getSkillConfig();
        skills.forEach(sk => {
            const val = parseInt(char.skills?.[sk.id] ?? ((char.proficiencies_choice?.skills || []).includes(sk.id) ? 1 : 0));
            stats.skills[sk.id] = { mod: val, score: val, formatted: String(val), isProf: val > 0 };
        });

        // Valores Derivados V20
        const dexterity = stats.attributes.dexterity?.score ?? 1;
        const wits = stats.attributes.wits?.score ?? 1;
        const courage = stats.attributes.courage?.score ?? 1;

        // Health Track V20 (Bruised a Incapacitated) é fixado em 7 níveis
        stats.general.hp_max = 7;
        
        // Força de Vontade (Willpower) máxima no V20 começa igual à Coragem
        stats.general.willpower_max = courage;
        stats.general.profBonus = 0;
        stats.general.profBonusFormatted = "—";
        
        // Percepção Passiva redefinida no Storyteller como Percepção + Raciocínio (Perception + Wits)
        const perception = stats.attributes.perception?.score ?? 1;
        stats.general.passivePerception = perception + wits;

        // Limite da Reserva de Sangue com base na Geração
        let bloodMax = 10;
        const genStr = String(char.bio?.generation || "13ª Geração");
        if (genStr.includes("15ª") || genStr.includes("14ª") || genStr.includes("13ª")) bloodMax = 10;
        else if (genStr.includes("12ª")) bloodMax = 11;
        else if (genStr.includes("11ª")) bloodMax = 12;
        else if (genStr.includes("10ª")) bloodMax = 15;
        else if (genStr.includes("9ª")) bloodMax = 15;
        else if (genStr.includes("8ª")) bloodMax = 20;
        else if (genStr.includes("7ª")) bloodMax = 30;
        else if (genStr.includes("6ª")) bloodMax = 50;

        stats.defaults = {
            hp_max: 7,
            ac: dexterity, // Defesa base é Destreza pura
            initiative: dexterity + wits
        };

        return stats;
    },

    // ── UI: Renderização da Ficha ─────────────────────────────

    renderSheetScores(char, systemStats, helpers) {
        const attrs = this.getAttributeConfig();
        return attrs.map(a => {
            const score = char.attributes?.[a.id] || 1;
            return `
                <div class="score-card vt5-score" title="${escapeHTML(a.description)}">
                    <span class="score-label">${a.shortLabel}</span>
                    ${helpers.mkInput(score, `attributes.${a.id}`, 'number', a.description, 'width: 50px; text-align: center; font-size: 1.4rem; font-weight: bold; background: transparent; border: none; padding: 0;')}
                    <span class="score-mod font-stars" style="color: var(--crimson); font-size: 0.85rem;">${"★".repeat(score)}${"☆".repeat(Math.max(0, 5 - score))}</span>
                </div>
            `;
        }).join('');
    },

    renderSheetSaves(char, systemStats, helpers) {
        const saves = this.getSaveConfig();
        return saves.map(s => {
            const val = parseInt(char.attributes?.[s.id] || 1);
            const formatted = "★".repeat(val) + "☆".repeat(Math.max(0, 5 - val));
            return `
                <div class="save-item proficient" title="${helpers.isInspection ? 'Apenas Visualização' : escapeHTML(s.description)}">
                    <span style="margin-left: 10px;">${escapeHTML(s.label)}</span>
                    <span class="save-value" style="color: var(--crimson); font-size: 0.85rem; margin-left: auto;">${formatted}</span>
                    <!-- Hidden input to allow updating virtue value through sheet save -->
                    <input type="hidden" data-field="attributes.${s.id}" value="${val}">
                </div>
            `;
        }).join('');
    },

    renderSheetSkills(char, systemStats, helpers) {
        const skills = this.getSkillConfig();
        return skills.map(sk => {
            const val = parseInt(char.skills?.[sk.id] ?? ((char.proficiencies_choice?.skills || []).includes(sk.id) ? 1 : 0));
            const stars = "★".repeat(val) + "☆".repeat(Math.max(0, 5 - val));
            return `
                <div class="skill-item proficient" title="${helpers.isInspection ? 'Apenas Visualização' : escapeHTML(sk.description)}">
                    <span>${escapeHTML(sk.label)}</span>
                    <span class="skill-value font-stars" style="color: var(--crimson); font-size: 0.85rem; margin-left: auto; margin-right: 0.5rem;">${stars}</span>
                    <!-- Input text/number hidden to enable editing during edit mode -->
                    ${helpers.isInspection ? `<input type="hidden" data-field="skills.${sk.id}" value="${val}">` : `${helpers.mkInput(val, `skills.${sk.id}`, 'number', sk.description, 'width: 45px; text-align: center; font-size: 1rem; font-weight: bold; background: transparent; border: none; padding: 0; color: var(--crimson);')}`}
                </div>
            `;
        }).join('');
    },

    renderSheetCombatTab(char, systemStats, helpers) {
        const bpCurr = char.stats?.blood_pool_current ?? 10;
        const bpMax = systemStats.defaults?.hp_max ?? 10; // Será recalculado dinamicamente
        const willpowerCurr = char.stats?.willpower_current ?? 5;
        const willpowerMax = systemStats.general?.willpower_max ?? 5;

        return `
            <div class="vt5-combat-box" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">
                <div class="hunger-section">
                    <h4><i class="fa-solid fa-droplet" style="color: var(--crimson);"></i> Reserva de Sangue (Blood Pool)</h4>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        ${helpers.mkInput(bpCurr, 'stats.blood_pool_current', 'number', 'Sangue Atual', 'medieval-input', 'style="width: 60px; text-align: center;"')}
                        <span class="hunger-value" style="font-size: 1.8rem; font-weight: bold; color: var(--crimson);">${bpCurr} / ${bpMax}</span>
                    </div>
                </div>

                <div class="willpower-section">
                    <h4><i class="fa-solid fa-brain" style="color: var(--gold);"></i> Força de Vontade (Willpower)</h4>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        ${helpers.mkInput(willpowerCurr, 'stats.willpower_current', 'number', 'Força de Vontade Atual', 'medieval-input', 'style="width: 60px; text-align: center;"')}
                        <span class="willpower-separator">/</span>
                        <span class="willpower-max" style="font-size: 1.4rem; font-weight: bold;">${willpowerMax}</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderSheetMagicTab(char, systemStats, helpers) {
        return `
            <div class="disciplines-section" style="width: 100%;">
                <h4>Disciplinas Vampíricas (V20)</h4>
                <p class="section-subtitle" style="font-style: italic; opacity: 0.7; margin-bottom: 1.5rem;">Poderes de sangue ativos no Membro.</p>
                
                <div class="disciplines-list" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="discipline-card font-antique" style="border: 1px solid rgba(139,0,0,0.3); padding: 1rem; border-radius: 8px; background: rgba(139,0,0,0.05);">
                        <strong style="color: var(--crimson); font-size: 1.2rem;">Reserva de Sangue Vampírico</strong>
                        <p style="font-size: 0.95rem; margin-top: 0.5rem; opacity: 0.9;">Gere disciplinas da Noite pedindo auxílio ao Damien.</p>
                    </div>
                </div>
            </div>
        `;
    },

    getSheetTabs() {
        return [
            { id: 'main',      label: 'Atributos & Ficha', icon: 'fa-user-ninja' },
            { id: 'combat',    label: 'Reserva & Fome',     icon: 'fa-droplet' },
            { id: 'magic',     label: 'Disciplinas',       icon: 'fa-bat' },
            { id: 'inventory', label: 'Mochila',           icon: 'fa-briefcase' },
            { id: 'story',     label: 'Crônicas',          icon: 'fa-book-dead' }
        ];
    },

    // ── AI Prompts V20 ──────────────────────────────────────────

    getPromptContext() {
        return 'Vampire: The Masquerade 20th Anniversary Edition (V20)';
    },

    getEntityPrompt(entityType, prompt, flavor) {
        const typeLabels = { monster: 'Cria da Noite/Lobisomem/Antagonista', npc: 'Vampiro NPC/Membro' };
        const label = typeLabels[entityType] || 'Vampiro';

        return `
        [ACT AS]: Vampire: The Masquerade V20 ${label} Generator.
        [TASK]: Generate a complete ${label} for Vampire V20 based on the user prompt.
        [OUTPUT]: Valid JSON Object ONLY. No markdown formatting around it.
        [LANGUAGE]: Portuguese (pt-BR).
        [JSON STRUCTURE]:
        {
            "name": "Nome",
            "entity_type": "${entityType}",
            "bio": {
                "race": "Clã (ex: Toreador, Brujah)", "class": "Natureza (ex: Arquiteto, Rebelde)", "alignment": "Humanidade",
                "level": 1, "cr": "2", "size": "Medium", "creature_type": "Vampiro",
                "concept": "Conceito do Personagem", "sire": "Senhor", "generation": "13ª Geração"
            },
            "attributes": { 
                "strength": 3, "dexterity": 3, "stamina": 2, 
                "charisma": 2, "manipulation": 3, "appearance": 2, 
                "perception": 2, "intelligence": 2, "wits": 3,
                "conscience": 3, "self_control": 3, "courage": 4
            },
            "stats": { "ac": 3, "hp_max": 7, "hp_current": 7, "speed": "Normal", "initiative": 6, "willpower_max": 4, "willpower_current": 4, "blood_pool_max": 10, "blood_pool_current": 10 },
            "combat": { "attacks": [{ "name": "Garras", "bonus": "+5", "damage": "2 Agravado", "isCustom": true }] },
            "abilities": [
                { 
                    "uid": "ab1", 
                    "identity": { "name": "Rapidez", "origin": "Discipline" }, 
                    "activation": { "type": "Action" }, 
                    "description": "Gasta ponto de sangue para ações extras." 
                }
            ],
            "story": { "traits": "Personalidade", "ideals": "Ideais/Motivos", "bonds": "Laços", "flaws": "Defeitos", "appearance": "Estética Visual", "notes": "Lore do Abraço. MUST end with: '${flavor}'" }
        }

        [USER PROMPT]: ${prompt}
        `;
    },

    getCharacterPrompt() {
        return `Você é Damien, o rígido mentor da Noite no V20. Sua tarefa é completar as motivações góticas e a crônica de Abraço do Vampiro.
        Retorne APENAS um objeto JSON com campos: traits (Traços), ideals (Ideais), bonds (Laços), flaws (Defeitos), appearance (Aparência) e backstory (Histórico do Abraço) em português.`;
    },

    getItemPrompt(prompt, flavor) {
        return `
        [ACT AS]: Vampire V20 Item/Relic Generator.
        [TASK]: Generate an occult item for Vampire: The Masquerade V20.
        [OUTPUT]: Valid JSON Object ONLY.
        [LANGUAGE]: Portuguese (pt-BR).
        {
            "uid": "item_id",
            "identity": { "name": "Nome", "origin": "Item Oculto", "tags": ["Sangue", "Sobrenatural"] },
            "description": "Descrição da relíquia. MUST end with: '${flavor}'",
            "equipment_details": { "rarity": "rare", "cost": "Recursos 3", "weight": 1, "quantity": 1, "equipped": false }
        }
        [USER PROMPT]: ${prompt}
        `;
    },

    getSpellPrompt(prompt, flavor) {
        return `
        [ACT AS]: Vampire V20 Discipline Power Generator.
        [TASK]: Generate a Discipline Power for Vampire V20 based on the prompt.
        [OUTPUT]: Valid JSON Object ONLY.
        [LANGUAGE]: Portuguese (pt-BR).
        {
            "uid": "power_id",
            "identity": { "name": "Nome do Poder", "origin": "Discipline" },
            "description": "Descrição do poder da Disciplina. MUST end with: '${flavor}'",
            "spell_details": { "level": 1, "school": "Disciplina", "casting_time": "1 turno", "duration": "Cena" }
        }
        [USER PROMPT]: ${prompt}
        `;
    },

    getCombatConfig() {
        return {
            usesInitiative: true,
            initiativeAttribute: 'dexterity',
            usesDeathSaves: false,
            deathSaveSuccesses: 0,
            deathSaveFailures: 0,
            usesHitDice: false,
            usesArmorClass: false,
            healthLabel: 'Vitalidade',
            defenseLabel: 'Defesa (Dex)'
        };
    },

    calculateInitiativeBonus(char) {
        const dex = parseInt(char.attributes?.dexterity || 1);
        const wits = parseInt(char.attributes?.wits || 1);
        return dex + wits;
    }
};

SystemRegistry.register(VampirePlugin);
