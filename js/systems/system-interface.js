/**
 * System Plugin Interface
 * Define o contrato que todo sistema de RPG (D&D 5e, Vampire, etc.)
 * DEVE implementar para funcionar com o Lyra the Wise.
 *
 * Contribuidores: implemente todos os métodos marcados como @required.
 * Métodos @optional podem retornar null se o sistema não suportar o recurso.
 */

/**
 * Valida se um plugin implementa todos os métodos obrigatórios da interface.
 * Usado pelo SystemRegistry ao registrar um novo sistema.
 *
 * @param {Object} plugin - O plugin a ser validado
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateSystemPlugin(plugin) {
    const REQUIRED_PROPERTIES = [
        'id',
        'name',
        'implemented'
    ];

    const REQUIRED_METHODS = [
        // Dados
        'getTemplate',
        'getCreationData',
        'getAttributeConfig',
        'getSkillConfig',
        'getSaveConfig',

        // Cálculos
        'calculateStats',

        // UI
        'renderSheetScores',
        'renderSheetSaves',
        'renderSheetSkills',
        'renderSheetCombatTab',

        // Prompts AI
        'getPromptContext',
        'getEntityPrompt',
        'getCharacterPrompt',

        // Combat
        'getCombatConfig',
        'calculateInitiativeBonus'
    ];

    const missing = [];

    for (const prop of REQUIRED_PROPERTIES) {
        if (plugin[prop] === undefined || plugin[prop] === null) {
            missing.push(`property: ${prop}`);
        }
    }

    for (const method of REQUIRED_METHODS) {
        if (typeof plugin[method] !== 'function') {
            missing.push(`method: ${method}`);
        }
    }

    return {
        valid: missing.length === 0,
        missing
    };
}

/**
 * @typedef {Object} AttributeConfig
 * @property {string} id - Identificador interno (ex: 'str', 'dex')
 * @property {string} label - Nome legível (ex: 'Força')
 * @property {string} shortLabel - Abreviação (ex: 'FOR')
 * @property {string} description - Tooltip descritivo
 */

/**
 * @typedef {Object} SkillConfig
 * @property {string} id - Identificador interno (ex: 'acrobacia')
 * @property {string} label - Nome para exibição (ex: 'Acrobacia (Des)')
 * @property {string} attribute - Atributo base (ex: 'dex')
 * @property {string} description - Tooltip descritivo
 */

/**
 * @typedef {Object} SaveConfig
 * @property {string} id - Identificador do save (ex: 'str')
 * @property {string} label - Nome para exibição (ex: 'Força')
 * @property {string} description - Tooltip descritivo
 */

/**
 * @typedef {Object} CombatConfig
 * @property {boolean} usesInitiative - Se o sistema usa rolagem de iniciativa
 * @property {string}  initiativeAttribute - Atributo base para iniciativa (ex: 'dex')
 * @property {boolean} usesDeathSaves - Se o sistema tem death saves
 * @property {number}  deathSaveSuccesses - Quantidade de sucessos necessários
 * @property {number}  deathSaveFailures - Quantidade de falhas para morrer
 * @property {boolean} usesHitDice - Se o sistema tem hit dice
 * @property {boolean} usesArmorClass - Se o sistema usa CA/AC
 * @property {string}  healthLabel - Nome do recurso de vida (ex: 'HP', 'Vitalidade')
 * @property {string}  defenseLabel - Nome da defesa (ex: 'CA', 'Defesa')
 */

/**
 * @typedef {Object} CreationData
 * @property {Array} races - Raças/origens disponíveis
 * @property {Array} classes - Classes/clãs/arquetipos disponíveis
 * @property {Array} backgrounds - Antecedentes disponíveis
 * @property {Array} alignments - Alinhamentos disponíveis
 * @property {Object} subraces - Sub-raças por raça
 * @property {Object} archetypes - Arquétipos por classe
 */

/**
 * Interface completa de um SystemPlugin.
 * Cada sistema deve exportar um objeto que satisfaça este contrato.
 *
 * @typedef {Object} SystemPlugin
 *
 * === METADADOS ===
 * @property {string}  id          - Identificador único (ex: 'dnd5e', 'vampire')
 * @property {string}  name        - Nome de exibição (ex: 'D&D 5ª Edição')
 * @property {boolean} implemented - Se o sistema está funcional e pronto para uso
 * @property {string}  [version]   - Versão do plugin (ex: '1.0.0')
 * @property {string}  [icon]      - Classe de ícone FontAwesome (ex: 'fa-dragon')
 *
 * === DADOS (@required) ===
 * @property {function(): Object}         getTemplate       - Template vazio de personagem
 * @property {function(): CreationData}   getCreationData   - Dados para dropdowns de criação
 * @property {function(): AttributeConfig[]} getAttributeConfig - Definição dos atributos
 * @property {function(): SkillConfig[]}     getSkillConfig     - Definição das perícias
 * @property {function(): SaveConfig[]}      getSaveConfig      - Definição dos salvamentos
 *
 * === CÁLCULOS (@required) ===
 * @property {function(Object): Object}  calculateStats - Calcula stats derivados do personagem
 *
 * === CÁLCULOS (@optional) ===
 * @property {function(number): number}  [getModifier]     - Modificador de atributo
 * @property {function(number): string}  [formatModifier]  - Formata modificador para display
 *
 * === UI (@required) ===
 * @property {function(Object, Object, Object): string} renderSheetScores    - HTML dos atributos
 * @property {function(Object, Object, Object): string} renderSheetSaves     - HTML dos salvamentos
 * @property {function(Object, Object, Object): string} renderSheetSkills    - HTML das perícias
 * @property {function(Object, Object, Object): string} renderSheetCombatTab - HTML da aba combate
 *
 * === UI (@optional) ===
 * @property {function(Object, Object, Object): string|null} [renderSheetMagicTab]  - HTML da aba de magia
 * @property {function(): Array}                             [getSheetTabs]         - Definição das abas
 * @property {function(Object): string}                      [renderSheetHeader]    - HTML extra no header
 *
 * === AI PROMPTS (@required) ===
 * @property {function(): string}                    getPromptContext    - Contexto do sistema para prompts
 * @property {function(string, string, string): string} getEntityPrompt - Prompt de entidade (monster/npc)
 * @property {function(): string}                    getCharacterPrompt  - Prompt de criação de personagem
 *
 * === AI PROMPTS (@optional) ===
 * @property {function(string, string): string|null} [getItemPrompt]   - Prompt de geração de itens
 * @property {function(string, string): string|null} [getSpellPrompt]  - Prompt de geração de magias
 * @property {function(string, string): string|null} [getAbilityPrompt]- Prompt de geração de habilidades
 * @property {function(string, string, string): string|null} [getNamesPrompt] - Prompt de nomes
 *
 * === COMBAT (@required) ===
 * @property {function(): CombatConfig}        getCombatConfig         - Config de combate do sistema
 * @property {function(Object): number}        calculateInitiativeBonus - Bônus de iniciativa
 *
 * === WIZARD (@optional) ===
 * @property {function(): Array}               [getWizardSteps]   - Steps do wizard de criação
 * @property {function(string, Object): string}[renderWizardStep] - HTML de cada step
 * @property {function(): Object}              [gatherWizardData] - Coleta dados do wizard
 */
