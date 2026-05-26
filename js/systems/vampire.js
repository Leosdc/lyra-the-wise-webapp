/**
 * Vampire: The Masquerade (V5) System Plugin
 * Plugin de exemplo e scaffold para o sistema de RPG Vampiro: A Máscara (5ª Edição).
 * Serve como base e guia para novos desenvolvedores expandirem a "engrenagem" de seus sistemas.
 */

import SystemRegistry from './system-registry.js';
import { escapeHTML } from '../modules/utils.js';

// ═══════════════════════════════════════════════════════════════
//  DADOS ESTÁTICOS
// ═══════════════════════════════════════════════════════════════

const CLANS = [
    "Brujah", "Gangrel", "Malkavian", "Nosferatu", "Toreador", "Tremere", "Ventrue", "Caitiff", "Thin-Blood (Sangue-Fraco)", "Lasombra", "Hecata", "Banu Haqim", "Ravnos", "Tzimisce", "Salubri"
];

const SECTS = [
    "Camarilla", "Movimento Anarquista", "Autarcas", "Sabbat", "Segunda Inquisição"
];

const PATHS = [
    "Humanidade", "Caminho dos Reis", "Caminho do Acordo", "Caminho dos Sussurros", "Caminho dos Ossos"
];

// ═══════════════════════════════════════════════════════════════
//  PLUGIN MTG V5
// ═══════════════════════════════════════════════════════════════

export const VampirePlugin = {
    id: 'vampire',
    name: 'Vampire: The Masquerade (V5)',
    implemented: true,
    version: '1.0.0',
    icon: 'fa-bat',

    // ── Dados ──────────────────────────────────────────────────

    getTemplate() {
        return {
            bio: {
                name: "", clan: "", sect: "", level: 1, // 'level' representará Geração/Blood Potency
                generation: "13ª Geração", concept: "",
                sire: "", alignment: "Humanidade", xp: 0, playerName: ""
            },
            attributes: {
                strength: 2, dexterity: 2, stamina: 2,       // Físicos
                charisma: 2, manipulation: 2, composure: 2,   // Sociais
                intelligence: 2, wits: 2, resolve: 2         // Mentais
            },
            stats: {
                hp_current: 5, hp_max: 5, hp_temp: 0, // No Storyteller, Vitality/Health = Stamina + 3
                ac: 2, initiative: 4, speed: "Normal", // AC representará defesa base (Dexterity + Athletics)
                willpower_max: 5, willpower_current: 5,
                hunger: 1, blood_potency: 1
            },
            proficiencies_choice: {
                saving_throws: [], // Não usado
                skills: [],        // Habilidades (Athletics, Stealth, etc.)
                expertise: []
            },
            death_saves: { successes: 0, failures: 0 },
            attacks: [],
            spells: {
                ability: "resolve", save_dc: 0, attack_bonus: 0,
                slots: {}, // Não usa spell slots convencionais
                list: []   // Listará "Disciplinas" ativas do Vampiro
            },
            inventory: {
                coins: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 }, // Não usa sistema D&D de moedas
                items: [],
                encumbrance: { current: 0, limit: 100 }
            },
            story: {
                traits: "", ideals: "", bonds: "", flaws: "",
                appearance: "", mannerisms: "", talents: "",
                languages: "", other_proficiencies: "", notes: ""
            },
            conditions: [] // Fomes, Máculas, Frenesi
        };
    },

    getCreationData() {
        return {
            races: CLANS,             // Mapeado para races para reaproveitar a UI
            classes: SECTS,           // Mapeado para classes
            alignments: PATHS,        // Mapeado para moralidade (Humanidade)
            backgrounds: ["Cientista", "Artista", "Criminoso", "Aristocrata", "Detetive", "Soldado", "Sobrevivente Urbano", "Líder de Gangue"],
            subraces: {},
            archetypes: {}
        };
    },

    getAttributeConfig() {
        return [
            // Físicos
            { id: 'strength',     label: 'Força (Físico)',        shortLabel: 'FOR', description: 'Capacidade de levantar peso, causar impacto físico direto.' },
            { id: 'dexterity',    label: 'Destreza (Físico)',     shortLabel: 'DES', description: 'Agilidade, reflexos manuais e velocidade de reação.' },
            { id: 'stamina',      label: 'Vigor (Físico)',        shortLabel: 'VIG', description: 'Resistência a lesões, cansaço e venenos.' },
            // Sociais
            { id: 'charisma',     label: 'Carisma (Social)',      shortLabel: 'CAR', description: 'Atração natural, charme pessoal e capacidade de encantar.' },
            { id: 'manipulation', label: 'Manipulação (Social)',  shortLabel: 'MAN', description: 'Persuasão ativa, blefe e controle sobre os outros.' },
            { id: 'composure',    label: 'Autocontrole (Social)', shortLabel: 'AUT', description: 'Resistência a insultos, blefes e controle emocional.' },
            // Mentais
            { id: 'intelligence', label: 'Inteligência (Mental)',  shortLabel: 'INT', description: 'Capacidade analítica, memória e retenção de fatos.' },
            { id: 'wits',         label: 'Raciocínio (Mental)',   shortLabel: 'RAC', description: 'Velocidade de raciocínio lógico sob pressão direta.' },
            { id: 'resolve',      label: 'Determinação (Mental)', shortLabel: 'DET', description: 'Força de vontade de focar na resolução de tarefas exaustivas.' }
        ];
    },

    getSkillConfig() {
        return [
            { id: 'atletismo',    label: 'Atletismo (Fís)',    attribute: 'dexterity', description: 'Correr, saltar e esquivar.' },
            { id: 'briga',        label: 'Briga (Fís)',        attribute: 'strength',  description: 'Combate desarmado.' },
            { id: 'furtividade',  label: 'Furtividade (Fís)',  attribute: 'dexterity', description: 'Mover-se sem ser visto ou ouvido.' },
            { id: 'armas_brancas',label: 'Armas Brancas (Fís)',attribute: 'dexterity', description: 'Combate usando espadas, facas ou bastões.' },
            { id: 'oficios',      label: 'Ofícios (Fís)',      attribute: 'dexterity', description: 'Consertos ou criação de itens físicos.' },
            
            { id: 'empatia',      label: 'Empatia (Soc)',      attribute: 'charisma',  description: 'Compreender emoções e mentiras alheias.' },
            { id: 'intimidacao',  label: 'Intimidação (Soc)',  attribute: 'strength',  description: 'Coagir ou assustar os outros.' },
            { id: 'persuasao',    label: 'Persuasão (Soc)',    attribute: 'charisma',  description: 'Diplomacia ativa e charme.' },
            { id: 'manha',        label: 'Manha (Soc)',        attribute: 'manipulation', description: 'Conhecimento das ruas, gangues e crime.' },
            { id: 'subterfugio',  label: 'Subterfúgio (Soc)',  attribute: 'manipulation', description: 'Blefe, intriga política ou mentiras convincentes.' },

            { id: 'academicos',   label: 'Acadêmicos (Men)',   attribute: 'intelligence', description: 'Humanidades, história e artes.' },
            { id: 'investigacao', label: 'Investigação (Men)', attribute: 'wits',         description: 'Análise dedutiva e buscas por pistas.' },
            { id: 'medicina',     label: 'Medicina (Men)',     attribute: 'intelligence', description: 'Tratamentos de saúde e primeiros socorros.' },
            { id: 'ocultismo',    label: 'Ocultismo (Men)',    attribute: 'intelligence', description: 'Conhecimento de lendas e mitos sobrenaturais.' },
            { id: 'tecnologia',   label: 'Tecnologia (Men)',   attribute: 'intelligence', description: 'Hacking, computadores e eletrônicos.' }
        ];
    },

    getSaveConfig() {
        return [
            { id: 'stamina',      label: 'Resistência Física',  description: 'Resistir a venenos e exaustão.' },
            { id: 'composure',    label: 'Autocontrole',        description: 'Resistir a tentações e humilhações públicas.' },
            { id: 'resolve',      label: 'Força Mental',        description: 'Foco inquebrável.' }
        ];
    },

    // ── Cálculos ────────────────────────────────────────────────

    calculateStats(char) {
        const stats = { attributes: {}, skills: {}, saves: {}, general: {} };

        // Copia atributos
        const attrs = this.getAttributeConfig();
        attrs.forEach(attr => {
            const val = parseInt(char.attributes?.[attr.id] || 2);
            stats.attributes[attr.id] = { score: val, mod: val, formatted: String(val) };
        });

        // Habilidades
        const skills = this.getSkillConfig();
        skills.forEach(sk => {
            const hasSkill = (char.proficiencies_choice?.skills || []).includes(sk.id);
            const val = hasSkill ? 1 : 0; // Habilidades têm nível simples ou pontuação
            stats.skills[sk.id] = { mod: val, formatted: String(val), isProf: hasSkill };
        });

        // Resistências (Saves)
        const saves = this.getSaveConfig();
        saves.forEach(s => {
            const isProf = (char.proficiencies_choice?.saves || []).includes(s.id);
            const val = isProf ? 1 : 0;
            stats.saves[s.id] = { mod: val, formatted: String(val), isProf };
        });

        // Estatísticas do Storyteller
        const stamina = stats.attributes.stamina?.score ?? 2;
        const wits = stats.attributes.wits?.score ?? 2;
        const resolve = stats.attributes.resolve?.score ?? 2;
        const composure = stats.attributes.composure?.score ?? 2;

        stats.general.hp_max = stamina + 3;
        stats.general.willpower_max = resolve + composure;
        stats.general.profBonus = 0; // Vampire não usa Bônus de Proficiência clássico
        stats.general.profBonusFormatted = "—";
        stats.general.passivePerception = wits + resolve;

        stats.defaults = {
            hp_max: stamina + 3,
            ac: (stats.attributes.dexterity?.score ?? 2),
            initiative: wits + resolve
        };

        return stats;
    },

    // ── UI: Renderização da Ficha ─────────────────────────────

    renderSheetScores(char, systemStats, helpers) {
        const attrs = this.getAttributeConfig();
        return attrs.map(a => {
            const score = char.attributes?.[a.id] || 2;
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
            const isProf = (char.proficiencies_choice?.saves || []).includes(s.id);
            const attrVal = systemStats.attributes[s.id]?.score ?? 2;
            const formatted = "★".repeat(attrVal) + "☆".repeat(Math.max(0, 5 - attrVal));
            return `
                <div class="save-item ${isProf ? 'proficient' : ''}" title="${helpers.isInspection ? 'Apenas Visualização' : escapeHTML(s.description)}">
                    <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''}" style="font-size: 0.5rem; color: ${isProf ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf ? 1 : 0.3}; cursor: ${helpers.isInspection ? 'default' : 'pointer'};" data-type="saves" data-field="${s.id}" ${helpers.isInspection ? 'disabled' : ''}></i>
                    <span>${escapeHTML(s.label)}</span>
                    <span class="save-value" style="color: var(--crimson);">${formatted}</span>
                </div>
            `;
        }).join('');
    },

    renderSheetSkills(char, systemStats, helpers) {
        const skills = this.getSkillConfig();
        return skills.map(sk => {
            const isProf = (char.proficiencies_choice?.skills || []).includes(sk.id);
            return `
                <div class="skill-item ${isProf ? 'proficient' : ''}" title="${helpers.isInspection ? 'Apenas Visualização' : escapeHTML(sk.description)}">
                    <i class="fa-solid fa-circle prof-toggle ${isProf ? 'active' : ''}" style="font-size: 0.5rem; color: ${isProf ? 'var(--crimson)' : 'inherit'}; opacity: ${isProf ? 1 : 0.3}; cursor: ${helpers.isInspection ? 'default' : 'pointer'};" data-type="skills" data-field="${sk.id}" ${helpers.isInspection ? 'disabled' : ''}></i>
                    <span>${escapeHTML(sk.label)}</span>
                    <span class="skill-value" style="color: var(--crimson);">${isProf ? 'Habilitada' : '—'}</span>
                </div>
            `;
        }).join('');
    },

    renderSheetCombatTab(char, systemStats, helpers) {
        const hunger = char.stats?.hunger ?? 1;
        const bloodPotency = char.stats?.blood_potency ?? 1;
        const willpowerCurr = char.stats?.willpower_current ?? 5;
        const willpowerMax = systemStats.general.willpower_max ?? 5;

        return `
            <div class="vt5-combat-box" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">
                <div class="hunger-section">
                    <h4><i class="fa-solid fa-droplet" style="color: var(--crimson);"></i> Fome (Hunger)</h4>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        ${helpers.mkInput(hunger, 'stats.hunger', 'range', 'Fome de Sangue', 'medieval-range', 'min="0" max="5" style="accent-color: var(--crimson); flex: 1;"')}
                        <span class="hunger-value" style="font-size: 1.8rem; font-weight: bold; color: var(--crimson);">${hunger} / 5</span>
                    </div>
                </div>

                <div class="willpower-section">
                    <h4><i class="fa-solid fa-brain" style="color: var(--gold);"></i> Força de Vontade (Willpower)</h4>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        ${helpers.mkInput(willpowerCurr, 'stats.willpower_current', 'number', 'Autocontrole Atual', 'medieval-input', 'style="width: 60px; text-align: center;"')}
                        <span class="willpower-separator">/</span>
                        <span class="willpower-max" style="font-size: 1.4rem; font-weight: bold;">${willpowerMax}</span>
                    </div>
                </div>

                <div class="blood-potency-section">
                    <h4>Potência do Sangue</h4>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        ${helpers.mkInput(bloodPotency, 'stats.blood_potency', 'number', 'Poder do Sangue', 'medieval-input', 'style="width: 60px; text-align: center;" min="1" max="10"')}
                    </div>
                </div>
            </div>
        `;
    },

    renderSheetMagicTab(char, systemStats, helpers) {
        // Vampire usa Disciplinas (Disciplines) em vez de Magias normais
        return `
            <div class="disciplines-section" style="width: 100%;">
                <h4>Disciplinas Vampíricas</h4>
                <p class="section-subtitle" style="font-style: italic; opacity: 0.7; margin-bottom: 1.5rem;">Sua herança sanguínea e poderes sobrenaturais ativos.</p>
                
                <div class="disciplines-list" style="display: flex; flex-direction: column; gap: 1rem;">
                    <!-- Espaço reservado para Disciplinas criadas dinamicamente -->
                    <div class="discipline-card font-antique" style="border: 1px solid rgba(139,0,0,0.3); padding: 1rem; border-radius: 8px; background: rgba(139,0,0,0.05);">
                        <strong style="color: var(--crimson); font-size: 1.2rem;">Potência Sanguínea (Sangue Ativo)</strong>
                        <p style="font-size: 0.95rem; margin-top: 0.5rem; opacity: 0.9;">Gere poderes de clã usando a IA Lyira solicitando poderes temáticos de Vampiro.</p>
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
            { id: 'inventory', label: 'Posses',            icon: 'fa-briefcase' },
            { id: 'story',     label: 'Histórico & Pacto', icon: 'fa-book-dead' }
        ];
    },

    // ── AI Prompts ──────────────────────────────────────────────

    getPromptContext() {
        return 'Vampire: The Masquerade 5th Edition (World of Darkness)';
    },

    getEntityPrompt(entityType, prompt, flavor) {
        const typeLabels = { monster: 'Cria da Noite/Lobisomem/Antagonista', npc: 'Vampiro NPC/Membro' };
        const label = typeLabels[entityType] || 'Vampiro';

        return `
        [ACT AS]: Vampire: The Masquerade V5 ${label} Generator.
        [TASK]: Generate a complete ${label} for Vampire V5 based on the user prompt.
        [OUTPUT]: Valid JSON Object ONLY. No markdown formatting around it.
        [LANGUAGE]: Portuguese (pt-BR).
        [JSON STRUCTURE]:
        {
            "name": "Nome",
            "entity_type": "${entityType}",
            "bio": {
                "race": "Clã (ex: Toreador, Brujah)", "class": "Seita (Camarilla|Anarquista)", "alignment": "Humanidade",
                "level": 1, "cr": "2", "size": "Medium", "creature_type": "Vampiro",
                "background": "Conceito do Personagem"
            },
            "attributes": { "strength": 3, "dexterity": 3, "stamina: 2, "charisma": 2, "manipulation": 3, "composure": 2, "intelligence": 2, "wits": 3, "resolve": 2 },
            "stats": { "ac": 3, "hp_max": 5, "hp_current": 5, "speed": "Normal", "initiative": 5, "hit_dice_total": "—" },
            "combat": { "attacks": [{ "name": "Mordida Vampírica", "bonus": "+5", "damage": "2 Agravado", "isCustom": true }] },
            "abilities": [
                { 
                    "uid": "ab1", 
                    "identity": { "name": "Presença: Olhar Aterrorizante", "origin": "Discipline" }, 
                    "activation": { "type": "Action" }, 
                    "execution_mechanics": {
                        "has_attack_roll": false,
                        "has_save": true,
                        "save": { "ability": "composure", "dc_value": 3 },
                        "damage": []
                    },
                    "description": "Causa pavor no alvo que cruza o olhar com o vampiro." 
                }
            ],
            "story": { "traits": "Personalidade da Noite", "ideals": "Ambição/Desejo", "bonds": "Côncavo/Vínculos de Sangue", "flaws": "Defeito/Fraqueza", "appearance": "Estética Visual e Roupas", "notes": "Lore do Personagem na Cidade. MUST end with: '${flavor}'" }
        }

        [USER PROMPT]: ${prompt}
        `;
    },

    getCharacterPrompt() {
        return `Você é Damien, o intemperante mentor da Noite. Sua tarefa é completar os detalhes, as motivações sombrias e o histórico de um Vampiro em Vampire V5.
        Receba as escolhas e gere: Traços de Personalidade, Ambição & Desejos, Vínculos de Sangue, Defeitos de Clã, Aparência Gótica/Urbana e uma Crônica de Abraço (História) fascinante.
        Retorne APENAS um objeto JSON com esses campos em português.`;
    },

    getItemPrompt(prompt, flavor) {
        return `
        [ACT AS]: Vampire V5 Relic/Item Generator.
        [TASK]: Generate a dark/occult item for Vampire: The Masquerade based on the prompt.
        [OUTPUT]: Valid JSON Object ONLY. No markdown formatting around it.
        [LANGUAGE]: Portuguese (pt-BR).
        [JSON STRUCTURE]:
        {
            "uid": "item_unique_id",
            "identity": {
                "name": "Nome da Relíquia",
                "origin": "Item Oculto",
                "tags": ["Sangue", "Sobrenatural", "Gótico"],
                "source": { "book": "", "page": "" }
            },
            "activation": {
                "type": "Action",
                "cost": 1,
                "slot": { "resource_id": "blood_rouse", "level_required": 0, "consume": false }
            },
            "trigger_logic": {
                "range": { "min": 0, "max": 1.5, "unit": "m" },
                "target": { "type": "Entity", "quantity": 1 }
            },
            "execution_mechanics": {
                "has_save": false,
                "save": { "ability": "", "dc_type": "fixed", "dc_value": 0, "on_success": "no_damage" },
                "has_attack_roll": false,
                "damage": [],
                "conditions": []
            },
            "description": "Descrição envolvente em português detalhando a história da relíquia e seus efeitos sobrenaturais góticos. MUST end with: '${flavor}'",
            "equipment_details": {
                "rarity": "rare|very_rare|legendary",
                "cost": "Recurso 2",
                "weight": 1,
                "quantity": 1,
                "item_type": "Relic",
                "ac_bonus": null,
                "properties": ["Oculto", "Místico"],
                "equipped": false
            }
        }
        
        [USER PROMPT]: ${prompt}
        `;
    },

    getSpellPrompt(prompt, flavor) {
        return `
        [ACT AS]: Vampire V5 Discipline/Power Generator.
        [TASK]: Generate a Discipline Power for Vampire: The Masquerade V5 based on the user prompt.
        [OUTPUT]: Valid JSON Object ONLY. No markdown.
        [LANGUAGE]: Portuguese (pt-BR).
        [JSON STRUCTURE]:
        {
            "uid": "discipline_power_id",
            "identity": {
                "name": "Nome do Poder da Disciplina",
                "origin": "Discipline",
                "tags": ["Discipline", "Power", "Blood"],
                "source": { "book": "", "page": "" }
            },
            "activation": {
                "type": "Action|Bonus|Reaction|Passive",
                "cost": 1,
                "slot": { "resource_id": "hunger", "level_required": 1, "consume": true }
            },
            "trigger_logic": {
                "range": { "min": 0, "max": 10, "unit": "m" },
                "target": { "type": "Entity|Self", "quantity": 1 }
            },
            "execution_mechanics": {
                "has_save": true,
                "save": { "ability": "composure", "dc_type": "scaling", "dc_value": 3, "on_success": "no_effect" },
                "has_attack_roll": false,
                "damage": [],
                "conditions": []
            },
            "description": "Descrição detalhada do efeito do poder da disciplina na noite. MUST end with: '${flavor}'",
            "spell_details": {
                "level": 1,
                "school": "Diciplina Vampírica",
                "casting_time": "1 turno",
                "duration": "Cena",
                "components": "Nenhum",
                "classes": ["Qualquer"],
                "prepared": true,
                "concentration": false
            }
        }
        
        [USER PROMPT]: ${prompt}
        `;
    },

    // ── Combat ─────────────────────────────────────────────────

    getCombatConfig() {
        return {
            usesInitiative: true,
            initiativeAttribute: 'wits',
            usesDeathSaves: false,
            deathSaveSuccesses: 0,
            deathSaveFailures: 0,
            usesHitDice: false,
            usesArmorClass: false,
            healthLabel: 'Vitalidade',
            defenseLabel: 'Esquiva (Dex+Ath)'
        };
    },

    calculateInitiativeBonus(char) {
        const stats = this.calculateStats(char);
        // Em V5, iniciativa mística = Wits + Resolve (determinação)
        return (stats.attributes.wits?.score ?? 2) + (stats.attributes.resolve?.score ?? 2);
    }
};

//  AUTO-REGISTRO no SystemRegistry
SystemRegistry.register(VampirePlugin);
