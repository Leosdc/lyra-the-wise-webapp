/**
 * D&D 5e System Plugin
 * Implementação completa do contrato SystemPlugin para Dungeons & Dragons 5ª Edição.
 * Inclui: dados de criação, cálculos, renderização de ficha, prompts AI e config de combate.
 */

import { calculateModifier } from '../modules/utils.js';
import { escapeHTML } from '../modules/utils.js';
import SystemRegistry from './system-registry.js';

// ═══════════════════════════════════════════════════════════════
//  DADOS ESTÁTICOS (migrados de constants.js)
// ═══════════════════════════════════════════════════════════════

const RACES = [
    "Aasimar", "Anão", "Aranha-do-Mar", "Bugbear", "Centauro", "Changeling", "Draconato", "Duende", "Elfo", "Fada", "Firbolg", "Forjado Bélico", "Genasi", "Githyanki", "Githzerai", "Gnomo", "Goblin", "Golias", "Hobgoblin", "Humano", "Kenku", "Kobold", "Leonino", "Lizardfolk (Povo Lagarto)", "Loxodonte", "Meio-Elfo", "Meio-Orc", "Minotauro", "Orc", "Pequenino", "Sátiro", "Tabaxi", "Tiferino", "Tortuga", "Tritão", "Yuan-ti"
];

const CLASSES = [
    "Artífice", "Bárbaro", "Bardo", "Bruxo", "Clérigo", "Druida", "Feiticeiro", "Guerreiro", "Ladino", "Lançador de Runas", "Mago", "Monge", "Paladino", "Patrulheiro", "Sangue de Dragão"
];

const ALIGNMENTS = [
    "Leal e Bom", "Neutro e Bom", "Caótico e Bom",
    "Leal e Neutro", "Neutro", "Caótico e Neutro",
    "Leal e Mau", "Neutro e Mau", "Caótico e Mau"
];

const SUBRACES = {
    "Elfo": ["Alto Elfo", "Elfo da Floresta", "Drow", "Eladrin", "Marinho", "Shadar-kai"],
    "Anão": ["Anão da Colina", "Anão da Montanha", "Duergar"],
    "Pequenino": ["Pés-Leves", "Robusto", "Fantasma"],
    "Draconato": ["Cromático (Preto)", "Cromático (Azul)", "Cromático (Verde)", "Cromático (Vermelho)", "Cromático (Branco)", "Metálico (Latão)", "Metálico (Bronze)", "Metálico (Cobre)", "Metálico (Ouro)", "Metálico (Prata)", "Gemado (Ametista)", "Gemado (Cristal)", "Gemado (Esmeralda)", "Gemado (Safira)", "Gemado (Topázio)"],
    "Gnomo": ["Gnomo da Floresta", "Gnomo das Rochas", "Gnomo das Profundezas (Svirfneblin)"],
    "Humano": ["Padrão", "Variante"],
    "Tiferino": ["Linhagem de Asmodeus", "Linhagem de Baalzebul", "Linhagem de Dispater", "Linhagem de Fierna", "Linhagem de Glasya", "Linhagem de Levistus", "Linhagem de Mammon", "Linhagem de Mephistopheles", "Linhagem de Zariel", "Variante Alado"],
    "Aasimar": ["Protetor", "Flagelo", "Caído", "D&D 2024 (Etereal)"],
    "Genasi": ["Ar", "Terra", "Fogo", "Água"],
    "Githyanki": ["Padrão"],
    "Githzerai": ["Padrão"],
    "Golias": ["Padrão"],
    "Orc": ["Padrão"],
    "Changeling": ["Padrão"],
    "Forjado Bélico": ["Integrado", "Batedor", "Titã"],
    "Meio-Elfo": ["Padrão", "Variante (Drow)", "Variante (Aquático)", "Variante (Floresta)", "Variante (Alto Elfo)"]
};

const ARCHETYPES = {
    "Bárbaro": ["Caminho do Berserker", "Caminho do Guerreiro Totêmico", "Caminho do Elo Ancestral", "Caminho do Arauto da Tempestade", "Caminho do Fanático", "Caminho da Magia Selvagem", "Caminho da Besta"],
    "Bardo": ["Colégio do Conhecimento", "Colégio da Bravura", "Colégio do Glamour", "Colégio das Espadas", "Colégio dos Sussurros", "Colégio da Eloquência", "Colégio da Criação"],
    "Bruxo": ["O Corruptor (The Fiend)", "O Arquifada", "O Grande Antigo", "A Lâmina Maldita (Hexblade)", "O Celestial", "O Gênio", "O Morto-Vivo"],
    "Clérigo": ["Domínio do Conhecimento", "Domínio da Vida", "Domínio da Luz", "Domínio da Natureza", "Domínio da Tempestade", "Domínio do Truque", "Domínio da Guerra", "Domínio da Forja", "Domínio da Sepultura", "Domínio da Ordem", "Domínio da Paz", "Domínio do Crepúsculo"],
    "Druida": ["Círculo da Terra", "Círculo da Lua", "Círculo dos Sonhos", "Círculo do Pastor", "Círculo dos Esporos", "Círculo das Estrelas", "Círculo do Incêndio"],
    "Guerreiro": ["Campeão", "Mestre de Batalha", "Cavaleiro Arcano", "Arqueiro Arcano", "Cavaleiro (Cavalier)", "Samurai", "Eco Cavaleiro (Echo Knight)", "Guerreiro Psíquico", "Cavaleiro Rúnico"],
    "Monge": ["Caminho da Mão Aberta", "Caminho da Sombra", "Caminho dos Quatro Elementos", "Caminho do Mestre da Embriaguez", "Caminho do Kensei", "Caminho da Alma Radiante", "Caminho da Misericórdia", "Caminho do Eu Astral"],
    "Paladino": ["Juramento de Devoção", "Juramento dos Anciões", "Juramento de Vingança", "Juramento de Conquista", "Juramento de Redenção", "Juramento de Glória", "Juramento da Vigilância", "Quebrador de Juramento"],
    "Patrulheiro": ["Caçador", "Mestre das Bestas", "Perseguidor Sombrio (Gloom Stalker)", "Caçador de Monstros", "Andarilho do Horizonte", "Guardião das Sombras (Fey Wanderer)", "Guardião do Enxame"],
    "Ladino": ["Ladrão", "Assassino", "Trapaceiro Arcano", "Mestre de Tática (Mastermind)", "Inquisitivo", "Batedor (Scout)", "Estratagema (Swashbuckler)", "Lâmina Psíquica (Soulknife)", "Fantasma"],
    "Feiticeiro": ["Linhagem Dracônica", "Magia Selvagem", "Magia da Tempestade", "Magia Sombria", "Alma Divina", "Mente Aberrante", "Alma do Relógio"],
    "Mago": ["Escola de Abjuração", "Escola de Conjuração", "Escola de Adivinhação", "Escola de Encantamento", "Escola de Evocação", "Escola de Ilusão", "Escola de Necromancia", "Escola de Transmutação", "Canto da Lâmina (Bladesinging)", "Escriba Manifestado", "Cronurgia", "Graviturgia"],
    "Artífice": ["Alquimista", "Armeiro", "Artilheiro", "Ferreiro de Batalha"],
    "Lançador de Runas": ["Caminho da Runa Escarlate", "Caminho da Runa Gélida"],
    "Sangue de Dragão": ["Herança de Fogo", "Herança de Gelo"]
};

const BACKGROUNDS = [
    "Acólito", "Andarilho", "Artesão", "Artista", "Charlatão", "Criminoso", "Eremita", "Escriba", "Fazendeiro", "Guarda", "Guia", "Marinheiro", "Mercador", "Nobre", "Sábio", "Soldado"
];

// ═══════════════════════════════════════════════════════════════
//  PLUGIN
// ═══════════════════════════════════════════════════════════════

export const DND5ePlugin = {
    id: 'dnd5e',
    name: 'D&D 5ª Edição',
    implemented: true,
    version: '1.0.0',
    icon: 'fa-dragon',

    // ── Dados ──────────────────────────────────────────────────

    getTemplate() {
        return {
            bio: {
                name: "", class: "", archetype: "", level: 1,
                race: "", subrace: "", background: "",
                alignment: "", xp: 0, playerName: ""
            },
            attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            stats: {
                hp_current: 0, hp_max: 0, hp_temp: 0,
                ac: 10, initiative: 0, speed: "9m",
                proficiency_bonus: 2, passive_perception: 10,
                hit_dice_total: "1d8", hit_dice_current: 1
            },
            proficiencies_choice: {
                saving_throws: [], skills: [], expertise: []
            },
            death_saves: { successes: 0, failures: 0 },
            attacks: [],
            spells: {
                ability: "int", save_dc: 8, attack_bonus: 0,
                slots: {
                    l1: { total: 0, used: 0 }, l2: { total: 0, used: 0 },
                    l3: { total: 0, used: 0 }, l4: { total: 0, used: 0 },
                    l5: { total: 0, used: 0 }, l6: { total: 0, used: 0 },
                    l7: { total: 0, used: 0 }, l8: { total: 0, used: 0 },
                    l9: { total: 0, used: 0 }
                },
                list: []
            },
            inventory: {
                coins: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
                items: [],
                encumbrance: { current: 0, limit: 150 }
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
            races: RACES,
            classes: CLASSES,
            alignments: ALIGNMENTS,
            backgrounds: BACKGROUNDS,
            subraces: SUBRACES,
            archetypes: ARCHETYPES
        };
    },

    getAttributeConfig() {
        return [
            { id: 'str', label: 'Força',         shortLabel: 'FOR', description: 'Potência física e atletismo' },
            { id: 'dex', label: 'Destreza',       shortLabel: 'DES', description: 'Agilidade, reflexos e equilíbrio' },
            { id: 'con', label: 'Constituição',    shortLabel: 'CON', description: 'Saúde, vigor e força vital' },
            { id: 'int', label: 'Inteligência',    shortLabel: 'INT', description: 'Acuidade mental, memória e raciocínio' },
            { id: 'wis', label: 'Sabedoria',       shortLabel: 'SAB', description: 'Percepção, intuição e força de vontade' },
            { id: 'cha', label: 'Carisma',         shortLabel: 'CAR', description: 'Força de personalidade e liderança' }
        ];
    },

    getSkillConfig() {
        return [
            { id: 'acrobacia',          label: 'Acrobacia (Des)',          attribute: 'dex', description: 'Manter equilíbrio e realizar manobras' },
            { id: 'adestrar_animais',   label: 'Adestrar Animais (Sab)',   attribute: 'wis', description: 'Acalmar ou controlar bestas' },
            { id: 'arcanismo',          label: 'Arcanismo (Int)',          attribute: 'int', description: 'Conhecimento sobre magia e planos' },
            { id: 'atletismo',          label: 'Atletismo (For)',          attribute: 'str', description: 'Escalar, nadar e pular' },
            { id: 'atuacao',            label: 'Atuação (Car)',            attribute: 'cha', description: 'Entreter plateias' },
            { id: 'enganacao',          label: 'Enganação (Car)',          attribute: 'cha', description: 'Mentir e ocultar a verdade' },
            { id: 'furtividade',        label: 'Furtividade (Des)',        attribute: 'dex', description: 'Esconder-se e mover-se em silêncio' },
            { id: 'historia',           label: 'História (Int)',           attribute: 'int', description: 'Conhecimento sobre o passado' },
            { id: 'intimidacao',        label: 'Intimidação (Car)',        attribute: 'cha', description: 'Ameaçar e coagir' },
            { id: 'intuicao',           label: 'Intuição (Sab)',           attribute: 'wis', description: 'Detectar mentiras e emoções' },
            { id: 'investigacao',       label: 'Investigação (Int)',       attribute: 'int', description: 'Procurar pistas e deduzir' },
            { id: 'medicina',           label: 'Medicina (Sab)',           attribute: 'wis', description: 'Estabilizar feridos e diagnosticar' },
            { id: 'natureza',           label: 'Natureza (Int)',           attribute: 'int', description: 'Conhecimento sobre flora e fauna' },
            { id: 'percepcao',          label: 'Percepção (Sab)',          attribute: 'wis', description: 'Notar detalhes ao redor' },
            { id: 'persuasao',          label: 'Persuasão (Car)',          attribute: 'cha', description: 'Convencer diplomaticamente' },
            { id: 'prestidigitacao',    label: 'Prestidigitação (Des)',    attribute: 'dex', description: 'Mãos leves e truques manuais' },
            { id: 'religiao',           label: 'Religião (Int)',           attribute: 'int', description: 'Conhecimento sobre divindades' },
            { id: 'sobrevivencia',      label: 'Sobrevivência (Sab)',      attribute: 'wis', description: 'Rastrear e caçar' }
        ];
    },

    getSaveConfig() {
        return [
            { id: 'str', label: 'Força',         description: 'Resistir a empurrões ou aprisionamentos' },
            { id: 'dex', label: 'Destreza',       description: 'Esquivar de efeitos de área' },
            { id: 'con', label: 'Constituição',    description: 'Suportar venenos e doenças' },
            { id: 'int', label: 'Inteligência',    description: 'Desacreditar ilusões' },
            { id: 'wis', label: 'Sabedoria',       description: 'Resistir a efeitos mentais' },
            { id: 'cha', label: 'Carisma',         description: 'Resistir a possessão' }
        ];
    },

    // ── Cálculos ────────────────────────────────────────────────

    getModifier(score) {
        return calculateModifier(score);
    },

    formatModifier(mod) {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    },

    getProficiencyBonus(level) {
        if (!level || level < 1) return 2;
        return Math.ceil(1 + (level / 4));
    },

    calculateStats(char) {
        const stats = { attributes: {}, skills: {}, saves: {}, general: {} };

        // 1. Atributos e modificadores
        const attrs = this.getAttributeConfig();
        const mods = {};
        attrs.forEach(attr => {
            const score = parseInt(char.attributes?.[attr.id] || 10);
            const mod = this.getModifier(score);
            stats.attributes[attr.id] = { score, mod, formatted: this.formatModifier(mod) };
            mods[`${attr.id}Mod`] = mod;
        });

        // 2. Bônus de proficiência
        const level = parseInt(char.bio?.level || 1);
        const profBonus = this.getProficiencyBonus(level);
        stats.general.profBonus = profBonus;
        stats.general.profBonusFormatted = `+${profBonus}`;

        // 3. Classe de Armadura
        const dexMod = stats.attributes.dex.mod;
        const ac = parseInt(char.stats?.ac) || (10 + dexMod);
        stats.general.ac = ac;

        // 4. Iniciativa
        stats.general.initiative = this.formatModifier(dexMod);

        // 5. Salvamentos
        const attrIds = attrs.map(a => a.id);
        attrIds.forEach(attr => {
            const isProf = char.proficiencies?.saves?.[attr];
            let mod = stats.attributes[attr].mod;
            if (isProf) mod += profBonus;
            stats.saves[attr] = {
                mod, formatted: this.formatModifier(mod), isProf: !!isProf
            };
        });

        // 6. Perícias
        const SKILL_ATTR_MAP = {
            acrobatics: 'dex', animal_handling: 'wis', arcana: 'int', athletics: 'str',
            deception: 'cha', history: 'int', insight: 'wis', intimidation: 'cha',
            investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis',
            performance: 'cha', persuasion: 'cha', religion: 'int', sleight_of_hand: 'dex',
            stealth: 'dex', survival: 'wis'
        };

        Object.entries(SKILL_ATTR_MAP).forEach(([skill, attr]) => {
            const isProf = char.proficiencies?.skills?.[skill];
            let mod = stats.attributes[attr].mod;
            if (isProf) mod += profBonus;
            stats.skills[skill] = {
                mod, formatted: this.formatModifier(mod), isProf: !!isProf, attr
            };
        });

        // 7. Percepção passiva
        stats.general.passivePerception = 10 + (stats.skills.perception?.mod ?? stats.attributes.wis.mod);

        // 8. Defaults derivados
        const hitDie = char.bio?.hitDie ? parseInt(String(char.bio.hitDie).replace('d', '')) : 8;
        const conMod = stats.attributes.con.mod;
        stats.defaults = {
            hp_max: hitDie + conMod + ((level - 1) * (Math.floor(hitDie / 2) + 1 + conMod)),
            ac: 10 + dexMod,
            initiative: dexMod
        };

        return stats;
    },

    // ── UI: Renderização da Ficha ─────────────────────────────

    renderSheetScores(char, systemStats, helpers) {
        const attrs = this.getAttributeConfig();
        return attrs.map(a => {
            const score = char.attributes?.[a.id] || 10;
            const mod = systemStats.attributes[a.id]?.mod ?? 0;
            const formatted = mod >= 0 ? `+${mod}` : `${mod}`;
            return `
                <div class="score-card" title="${escapeHTML(a.description)}">
                    <span class="score-label">${a.shortLabel}</span>
                    ${helpers.mkInput(score, `attributes.${a.id}`, 'number', a.description, 'width: 50px; text-align: center; font-size: 1.4rem; font-weight: bold; background: transparent; border: none; padding: 0;')}
                    <span class="score-mod">${formatted}</span>
                </div>
            `;
        }).join('');
    },

    renderSheetSaves(char, systemStats, helpers) {
        const saves = this.getSaveConfig();
        return saves.map(s => {
            const isProf = (char.proficiencies_choice?.saves || []).includes(s.id);
            const attrMod = systemStats.attributes[s.id]?.mod ?? 0;
            const profBonus = systemStats.general.profBonus || 0;
            const val = attrMod + (isProf ? profBonus : 0);
            const formatted = val >= 0 ? `+${val}` : `${val}`;
            return `
                <div class="save-item ${isProf ? 'proficient' : ''}" title="${helpers.isInspection ? 'Apenas Visualização' : escapeHTML(s.description)}">
                    <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''}" style="font-size: 0.5rem; color: ${isProf ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf ? 1 : 0.3}; cursor: ${helpers.isInspection ? 'default' : 'pointer'};" data-type="saves" data-field="${s.id}" ${helpers.isInspection ? 'disabled' : ''}></i>
                    <span>${escapeHTML(s.label)}</span>
                    <span class="save-value">${formatted}</span>
                </div>
            `;
        }).join('');
    },

    renderSheetSkills(char, systemStats, helpers) {
        const skills = this.getSkillConfig();
        return skills.map(sk => {
            const isProf = (char.proficiencies_choice?.skills || []).includes(sk.id);
            const isExpert = (char.proficiencies_choice?.expertise || []).includes(sk.id);
            const attrMod = systemStats.attributes[sk.attribute]?.mod ?? 0;
            const profBonus = systemStats.general.profBonus || 0;
            const val = attrMod + (isProf ? profBonus : 0) + (isExpert ? profBonus : 0);
            const formatted = val >= 0 ? `+${val}` : `${val}`;
            return `
                <div class="skill-item ${isProf ? 'proficient' : ''}" title="${helpers.isInspection ? 'Apenas Visualização' : escapeHTML(sk.description)}">
                    <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''} ${isExpert ? 'expert' : ''}" style="font-size: 0.5rem; color: ${isProf || isExpert ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf || isExpert ? 1 : 0.3}; cursor: ${helpers.isInspection ? 'default' : 'pointer'};" data-type="skills" data-field="${sk.id}" ${helpers.isInspection ? 'disabled' : ''}></i>
                    <span>${escapeHTML(sk.label)}</span>
                    <span class="skill-value">${formatted}</span>
                </div>
            `;
        }).join('');
    },

    renderSheetCombatTab(char, systemStats, helpers) {
        // D&D 5e tem Death Saves — retorna o bloco de death saves
        return `
            <div class="death-saves-section">
                <h4>Testes contra a Morte</h4>
                <div class="death-row">
                    <span>Sucessos</span>
                    <div class="death-checks">
                        <input type="checkbox" id="death-s1" ${helpers.isInspection ? 'disabled' : ''}>
                        <input type="checkbox" id="death-s2" ${helpers.isInspection ? 'disabled' : ''}>
                        <input type="checkbox" id="death-s3" ${helpers.isInspection ? 'disabled' : ''}>
                    </div>
                </div>
                <div class="death-row">
                    <span>Falhas</span>
                    <div class="death-checks">
                        <input type="checkbox" id="death-f1" ${helpers.isInspection ? 'disabled' : ''}>
                        <input type="checkbox" id="death-f2" ${helpers.isInspection ? 'disabled' : ''}>
                        <input type="checkbox" id="death-f3" ${helpers.isInspection ? 'disabled' : ''}>
                    </div>
                </div>
            </div>
        `;
    },

    renderSheetMagicTab(char, systemStats, helpers) {
        // D&D 5e tem magia — retorna indicação de suporte
        return 'supported';
    },

    getSheetTabs() {
        return [
            { id: 'main',      label: 'Principal',  icon: 'fa-scroll' },
            { id: 'combat',    label: 'Combate',     icon: 'fa-sword' },
            { id: 'magic',     label: 'Magia',       icon: 'fa-hat-wizard' },
            { id: 'inventory', label: 'Inventário',  icon: 'fa-backpack' },
            { id: 'story',     label: 'História',    icon: 'fa-book' }
        ];
    },

    // ── AI Prompts ──────────────────────────────────────────────

    getPromptContext() {
        return 'D&D 5e (Dungeons & Dragons 5ª Edição)';
    },

    getEntityPrompt(entityType, prompt, flavor) {
        const typeLabels = { monster: 'Monstro/Criatura', npc: 'NPC/Personagem Não-Jogável' };
        const label = typeLabels[entityType] || 'Entidade';

        return `
        [ACT AS]: D&D 5e ${label} Generator.
        [TASK]: Generate a complete ${label} for D&D 5e based on the user prompt.
        [OUTPUT]: Valid JSON Object ONLY. No markdown.
        [LANGUAGE]: Portuguese (pt-BR).
        [JSON STRUCTURE]:
        {
            "name": "Nome",
            "entity_type": "${entityType}",
            "bio": {
                "race": "Raça ou tipo", "class": "Classe", "alignment": "Alinhamento",
                "level": 5, "cr": "5", "size": "Medium", "creature_type": "Tipo D&D",
                "background": "Antecedente"
            },
            "attributes": { "str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10 },
            "stats": { "ac": 10, "hp_max": 10, "hp_current": 10, "speed": "9m", "initiative": 0, "hit_dice_total": "1d8" },
            "combat": { "attacks": [{ "name": "Ataque", "bonus": "+3", "damage": "1d6+1", "isCustom": true }] },
            "abilities": [
                { 
                    "uid": "ab1", 
                    "identity": { "name": "Nome do Ataque/Habilidade", "origin": "Custom_Attack" }, 
                    "activation": { "type": "Action" }, 
                    "execution_mechanics": {
                        "has_attack_roll": true,
                        "has_save": false,
                        "save": { "ability": "DEX", "dc_value": 15 },
                        "damage": [{ "dice_count": 2, "dice_type": 6, "damage_type": "corte" }]
                    },
                    "description": "Texto descritivo do efeito" 
                }
            ],
            "story": { "traits": "Personalidade", "ideals": "Motivações", "bonds": "Vínculos", "flaws": "Fraquezas", "appearance": "Visual", "notes": "Lore. End with: '${flavor}'" }
        }

        [USER PROMPT]: ${prompt}
        `;
    },

    getCharacterPrompt() {
        return `Você é a Guardiã do Eco. Sua tarefa é completar a história e detalhes de um personagem de D&D 5e.
        Receba os dados básicos e gere: Traços de Personalidade, Ideais, Vínculos, Defeitos, Aparência e uma História (Backstory) envolvente.
        Retorne APENAS um objeto JSON com esses campos em português.`;
    },

    getItemPrompt(prompt, flavor) {
        return `
        [ACT AS]: D&D 5e Item Generator.
        [TASK]: Generate a D&D 5e item based on the user prompt.
        [OUTPUT]: Valid JSON Object ONLY. No markdown formatting around it.
        [LANGUAGE]: Portuguese (pt-BR).
        [JSON STRUCTURE]:
        {
            "uid": "item_unique_id",
            "identity": {
                "name": "Nome do Item",
                "origin": "Item",
                "tags": ["Leve", "Versátil"],
                "source": { "book": "", "page": "" }
            },
            "activation": {
                "type": "Action",
                "cost": 1,
                "slot": { "resource_id": "item_charges", "level_required": 0, "consume": false }
            },
            "trigger_logic": {
                "range": { "min": 0, "max": 1.5, "unit": "m" },
                "target": { "type": "Entity", "quantity": 1 }
            },
            "execution_mechanics": {
                "has_save": false,
                "save": { "ability": "", "dc_type": "fixed", "dc_value": 0, "on_success": "no_damage" },
                "has_attack_roll": true,
                "damage": [{ "dice_count": 1, "dice_type": 8, "fixed_modifier": 0, "damage_type": "cortante", "is_magical": false, "scaling_type": "none" }],
                "conditions": []
            },
            "description": "Descrição completa em português. MUST end with: '${flavor}'",
            "equipment_details": {
                "rarity": "common|uncommon|rare|very_rare|legendary",
                "cost": "100 po",
                "weight": 2,
                "quantity": 1,
                "item_type": "Weapon|Armor|Potion|Scroll|Wondrous|Ring|Staff|Wand",
                "ac_bonus": null,
                "properties": ["Leve", "Versátil"],
                "equipped": false
            }
        }
        [RULES]:
        - If weapon: set has_attack_roll=true and fill damage array.
        - If armor: set ac_bonus and has_attack_roll=false.
        - If potion/consumable: set activation.slot.resource_id="item_charges" and consume=true.
        - If wondrous: fill description well and add relevant tags.
        
        [USER PROMPT]: ${prompt}
        `;
    },

    getSpellPrompt(prompt, flavor) {
        return `
        [ACT AS]: D&D 5e Spell Generator.
        [TASK]: Generate a D&D 5e spell based on the user prompt.
        [OUTPUT]: Valid JSON Object ONLY. No markdown.
        [LANGUAGE]: Portuguese (pt-BR).
        [JSON STRUCTURE]:
        {
            "uid": "spell_unique_id",
            "identity": {
                "name": "Nome da Magia",
                "origin": "Spell",
                "tags": ["Damage", "Control", "Utility", "Healing"],
                "source": { "book": "", "page": "" }
            },
            "activation": {
                "type": "Action|Bonus|Reaction",
                "cost": 1,
                "slot": { "resource_id": "spell_slots", "level_required": 3, "consume": true }
            },
            "trigger_logic": {
                "range": { "min": 0, "max": 30, "unit": "m" },
                "target": { "type": "Entity|Place|Self", "quantity": 1, "matriz": { "shape": "Sphere|Cone|Line|Point", "value": 6, "unit": "m", "origin": "target_point" } }
            },
            "execution_mechanics": {
                "has_save": true,
                "save": { "ability": "DEX", "dc_type": "scaling", "dc_value": 0, "on_success": "half_damage" },
                "has_attack_roll": false,
                "damage": [{ "dice_count": 8, "dice_type": 6, "fixed_modifier": 0, "damage_type": "fogo", "is_magical": true, "scaling_type": "slot" }],
                "conditions": []
            },
            "description": "Descrição em português. MUST end with: '${flavor}'",
            "spell_details": {
                "level": 3,
                "school": "Evocação|Necromancia|Abjuração|Adivinhação|Conjuração|Encantamento|Ilusão|Transmutação",
                "casting_time": "1 ação",
                "duration": "Instantânea|Concentração, até 1 minuto",
                "components": "V, S, M (enxofre)",
                "classes": ["Mago", "Feiticeiro"],
                "prepared": false,
                "concentration": false
            }
        }
        [RULES]:
        - If spell deals damage: fill damage array and set has_save or has_attack_roll accordingly.
        - If spell applies conditions: fill conditions array (e.g. frightened, prone, poisoned).
        - If cantrip (level 0): set slot.consume=false and slot.level_required=0.
        - activation.type derives from casting_time: "1 ação"->"Action", "1 ação bônus"->"Bonus", "1 reação"->"Reaction".
        
        [USER PROMPT]: ${prompt}
        `;
    },

    getAbilityPrompt(prompt, flavor) {
        return `
        [ACT AS]: D&D 5e Ability/Skill Generator.
        [TASK]: Generate a detailed ability/skill for D&D 5e.
        [OUTPUT]: Valid JSON Object ONLY. No markdown.
        [LANGUAGE]: Portuguese (pt-BR).
        [JSON STRUCTURE]:
        {
            "uid": "lyra_generated_id",
            "identity": { "name": "Nome da Habilidade", "origin": "Custom_Attack|Spell|Class_Skill|Race|Item|Feat", "tags": ["Damage", "Utility", "Control", "Healing"], "source": { "book": "", "page": "" } },
            "activation": { "type": "Action|Bonus|Reaction|Passive|Legendary|Lair", "cost": 1, "slot": { "resource_id": "proficiency_uses|superiority_dice", "level_required": 0, "consume": true } },
            "trigger_logic": {
                "range": { "min": 0, "max": 9, "unit": "m" },
                "target": { "type": "Entity|Place|Self", "quantity": 1, "matriz": { "shape": "Point|Sphere|Cone|Line|Square", "value": 0, "unit": "m", "origin": "self" } }
            },
            "execution_mechanics": {
                "has_save": false,
                "save": { "ability": "DEX|CON|WIS|STR|INT|CHA", "dc_type": "scaling|fixed", "dc_value": 15, "on_success": "half_damage|no_damage|end_condition" },
                "has_attack_roll": false,
                "damage": [{ "dice_count": 2, "dice_type": 6, "fixed_modifier": 0, "damage_type": "fogo", "is_magical": true, "scaling_type": "level|slot|none" }],
                "conditions": [{ "id": "frightened|poisoned|prone|stunned", "duration": "1_round|1_minute", "save_at_end": true }]
            },
            "description": "Descrição completa em português. MUST end with: '${flavor}'"
        }
        [RULES]:
        - Choose origin based on source: Race for racial traits, Class_Skill for class features, Feat for feats, Custom_Attack for unique attacks.
        - If ability deals damage: fill damage array.
        - If ability requires a save: set has_save=true and fill save object.
        - If ability is passive: set activation.type="Passive" and slot.consume=false.

        [USER PROMPT]: ${prompt}
        `;
    },

    getNamesPrompt(race, clazz, gender) {
        return `
        [ACT AS]: D&D 5e Name Generator.
        [TASK]: Generate 10 names/surnames for a character.
        [FILTERS]: Race: ${race || 'Qualquer'}, Class: ${clazz || 'Qualquer'}, Gender: ${gender || 'Qualquer'}
        [OUTPUT]: Valid JSON Array of Strings ONLY. No markdown.
        [EXAMPLE]: ["Nome 1", "Nome 2", ...]
        `;
    },

    getMonsterPrompt(prompt, flavor) {
        return `
        [ACT AS]: D&D 5e Monster Generator.
        [TASK]: Generate a D&D 5e monster based on the user prompt.
        [OUTPUT]: Valid JSON Object ONLY. No markdown formatting around it.
        [LANGUAGE]: Portuguese (pt-BR).
        [CRITICAL]: Return the EXACT JSON structure below. All fields are required.
        [JSON STRUCTURE]:
        {
            "name": "Nome da Criatura",
            "entity_type": "monster",
            "bio": {
                "race": "Tipo da criatura (ex: Morto-Vivo)",
                "class": "Classe se aplicável (ex: Guerreiro) ou vazio",
                "alignment": "Alinhamento (ex: Caótico e Mau)",
                "level": 5,
                "cr": "ND (ex: 5)",
                "size": "Medium|Large|Huge|Gargantuan|Small|Tiny",
                "creature_type": "Tipo D&D (Aberração|Besta|Celestial|Constructo|Dragão|Elemental|Fada|Ínfero|Gigante|Humanoide|Monstruosidade|Gosma|Planta|Morto-Vivo)"
            },
            "attributes": { "str": 16, "dex": 12, "con": 14, "int": 10, "wis": 12, "cha": 8 },
            "stats": {
                "ac": 15,
                "hp_max": 45,
                "hp_current": 45,
                "speed": "9m",
                "initiative": 1,
                "hit_dice_total": "5d10 + 10"
            },
            "combat": {
                "attacks": [
                    { "name": "Nome do Ataque", "bonus": "+6", "damage": "1d8+4 cortante", "isCustom": true }
                ]
            },
            "abilities": [
                {
                    "uid": "ability_1",
                    "identity": { "name": "Nome da Habilidade", "origin": "Custom_Attack", "tags": [] },
                    "activation": { "type": "Action" },
                    "description": "Descrição completa da habilidade em português."
                }
            ],
            "story": {
                "traits": "Traços de comportamento",
                "appearance": "Descrição visual detalhada",
                "notes": "Lore completo da criatura. MUST end with: '${flavor}'"
            }
        }
        
        [USER PROMPT]: ${prompt}
        `;
    },

    // ── Combat ──────────────────────────────────────────────────

    getCombatConfig() {
        return {
            usesInitiative: true,
            initiativeAttribute: 'dex',
            initiativeFormula: 'd20 + DEX modifier',
            usesDeathSaves: true,
            deathSaveSuccesses: 3,
            deathSaveFailures: 3,
            usesHitDice: true,
            usesArmorClass: true,
            healthLabel: 'HP',
            defenseLabel: 'CA',
            speedLabel: 'Deslocamento'
        };
    },

    calculateInitiativeBonus(char) {
        const dex = parseInt(char.attributes?.dex || 10);
        return this.getModifier(dex);
    }
};

// ═══════════════════════════════════════════════════════════════
//  COMPATIBILIDADE: Exportação legada para módulos que importam DND5eSystem
// ═══════════════════════════════════════════════════════════════

export const DND5eSystem = {
    id: DND5ePlugin.id,
    name: DND5ePlugin.name,
    getModifier: (score) => DND5ePlugin.getModifier(score),
    formatModifier: (mod) => DND5ePlugin.formatModifier(mod),
    getProficiencyBonus: (level) => DND5ePlugin.getProficiencyBonus(level),
    calculateStats: (char) => DND5ePlugin.calculateStats(char)
};

// ═══════════════════════════════════════════════════════════════
//  AUTO-REGISTRO no SystemRegistry
// ═══════════════════════════════════════════════════════════════

SystemRegistry.register(DND5ePlugin);
