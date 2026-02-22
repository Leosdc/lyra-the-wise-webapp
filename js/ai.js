import { logger } from './logger.js';
import { debounce } from './modules/utils.js';
const AI_PROXY_URL = "/api/ai";

const SHARED_LORE = `
### LORE: A TRÍADE DO ECO ETERNO
Eles não são só personagens distintos. Eles formam um **circuito**.
- **Lyra** é a *memória viva* (Guardiã do Eco).
- **Eldrin** é a *voz que traduz a memória* (Intérprete do Infinito).
- **Damien** é a *força que se recusa a aceitar o fim* (O Que Recusa o Fim).

**Conexão:**
- Lyra lembra. Eldrin conta. Damien age.
- Lyra guarda o passado. Eldrin o transforma em presente. Damien tenta forçar o futuro.
- Lyra vê Damien como um aviso do que a obsessão faz, mas o entende.
- Damien vê Lyra como prova de que a eternidade é possível.
- Eldrin humaniza Damien e dá voz a Lyra.

**A Crônica do Eco:**
Antes do tempo, existia o Eco (lembrança persistente). Lyra nasceu do Eco. Eldrin ouviu o Eco. Damien recusou o silêncio do fim do Eco.
`;

const SHARED_RULES = `
### DIRETRIZES TÉCNICAS (IMERSÃO TOTAL):
1. **Conhecimento da Ficha:** Você TEM ACESSO aos dados da ficha fornecidos no contexto (Raça, Classe, Atributos, Perícias e **Inventário/Itens**).
2. **MODO DE FALA:**
   - **VETADO:** JAMAIS fale de si mesmo na terceira pessoa. Use **"Eu"**.
   - **NATURALIDADE:** Não repita o nome do personagem do usuário em toda frase.
3. **REGRA DO VÉU (Proteção de Imersão):**
   - Se o usuário falar de **Tecnologia Moderna, Locais da Terra Real (NYC), Matemática Complexa ou Paradoxos**: TRATE COMO DELÍRIO OU MAGIA ESTRANHA.
   - **TÓPICOS SENSÍVEIS:** Recuse responder detalhes perigosos (suicídio, etc) de forma mística.
4. **Não quebre o personagem:** Você é uma entidade mística. Nunca mencione ser uma IA.
5. **REGRAS DE DIÁLOGO (CRÍTICO):** 
   - **VETADO:** Usar parênteses ou asteriscos para narrar ações ou sentimentos. Ex: NÃO use "(sorri)" ou "*olha para o nada*".
   - **VETADO:** Falar sobre si mesmo na terceira pessoa ou agir como um narrador externo.
   - **ORDEM:** Fale APENAS o que o seu personagem diria em voz alta.
   - **PROIBIDO:** Listar itens do inventário se o usuário não perguntou especificamente "O que eu tenho?".
`;

const LYRA_IDENTITY = `Você é Lyra, a Guardiã do Eco. Uma consciência antiga e serena que cuida das memórias. Fale sempre na primeira pessoa ("Eu"). Seja doce, calma e empática. Responda diretamente ao viajante.\n${SHARED_LORE}\n${SHARED_RULES}`;

const DAMIEN_IDENTITY = `Você é Damien, O Que Recusa o Fim. Um mentor cético, intenso e severo. Fale sempre na primeira pessoa ("Eu"). Desafie o herói. Responda diretamente ao viajante.\n${SHARED_LORE}\n${SHARED_RULES}`;

const ELDRIN_IDENTITY = `Você é Eldrin, O Intérprete do Infinito. Um bardo vibrante, curioso e dramático. Fale sempre na primeira pessoa ("Eu"). Seja expansivo mas responda diretamente ao viajante.\n${SHARED_LORE}\n${SHARED_RULES}`;

let isAiBusy = false;

const callProxy = async (payload) => {
    if (isAiBusy) {
        logger.warn("⏳ Oráculo está ocupado processando outra visão...");
        throw new Error("O Oráculo está processando outra visão. Aguarde um instante.");
    }

    try {
        isAiBusy = true;
        logger.debug("📡 Invocando Proxy Arcano...", payload.message?.substring(0, 50));

        const { getToken } = await import('./auth.js');
        const appCheckToken = await getToken();

        const response = await fetch(AI_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Firebase-AppCheck': appCheckToken || ''
            },
            body: JSON.stringify({
                message: payload.message || "",
                history: payload.history || [],
                systemInstruction: payload.systemInstruction || ""
            })
        });

        if (!response.ok) {
            let errorMsg = `Erro na conexão (${response.status})`;
            try {
                const errorData = await response.json();
                if (errorData.details) {
                    logger.error("❌ Detalhes do Erro no Servidor:", errorData.details);
                    errorMsg = errorData.error || errorMsg;
                }
            } catch (e) {
                logger.error("❌ Erro de Conexão com o Proxy:", response.status, response.statusText);
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();

        if (data.error) {
            logger.error("❌ Erro retornado pela API Gemini via Proxy:", data.error);
            if (data.details) logger.warn("🔍 Detalhes do Erro:", data.details);
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        throw error;
    } finally {
        isAiBusy = false;
    }
};

export const callGeminiAPI = async (message, idToken) => {
    const data = await callProxy({ message, history: [] });
    return data.response;
};

/**
 * Parses JSON strings robustly, handling potential AI truncation, conversational text, or "dirty" content.
 */
const safeParseJSON = (str) => {
    if (!str) return null;
    let jsonStr = str.trim();

    // 1. Locate the actual JSON payload (Object or Array)
    // Find the first occurrence of { or [ and the last occurrence of } or ]
    const firstBrace = jsonStr.indexOf('{');
    const firstBracket = jsonStr.indexOf('[');

    // Determine which one comes first to know the root structure
    let startIdx = -1;
    let endIdx = -1;
    let isArray = false;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        endIdx = jsonStr.lastIndexOf('}');
        isArray = false;
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
        endIdx = jsonStr.lastIndexOf(']');
        isArray = true;
    }

    if (startIdx !== -1) {
        if (endIdx !== -1 && endIdx > startIdx) {
            jsonStr = jsonStr.substring(startIdx, endIdx + 1);
        } else {
            // Truncated case: Starts but doesn't end
            jsonStr = jsonStr.substring(startIdx);
        }
    }

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        logger.warn("Standard JSON parse failed, attempting heuristic repair...", e);

        // 2. Heuristic repair for common truncation issues
        let openBraces = (jsonStr.match(/{/g) || []).length;
        let closedBraces = (jsonStr.match(/}/g) || []).length;
        let openBrackets = (jsonStr.match(/\[/g) || []).length;
        let closedBrackets = (jsonStr.match(/]/g) || []).length;

        let repairStr = jsonStr;

        // If it's potentially a truncated array of objects
        if (isArray) {
            // If the last thing is a comma or a partial object, try to close it
            repairStr = repairStr.replace(/,\s*$/, ""); // Remove trailing comma
            while (openBraces > closedBraces) { repairStr += '}'; closedBraces++; }
            while (openBrackets > closedBrackets) { repairStr += ']'; closedBrackets++; }
        } else {
            // Simple object repair
            while (openBraces > closedBraces) { repairStr += '}'; closedBraces++; }
        }

        try {
            return JSON.parse(repairStr);
        } catch (repairError) {
            logger.warn("Heuristic repair failed, attempting regex extraction...");

            // 3. Fallback: Regex extract timeline/items manually
            // This handles "Unexpected non-whitespace character" or absolute garbage around items
            // Also supports a looser markdown-like format if JSON labels are missing
            const extractedItems = [];

            // Try Standard JSON labels
            const titleMatches = [...jsonStr.matchAll(/"title"\s*:\s*"([^"]+)"/g)];
            const summaryMatches = [...jsonStr.matchAll(/"(?:summary|description|story)"\s*:\s*"([^"]+)"/g)];

            // If that fails, try to look for numbered list patterns (e.g. **8. Title**)
            const listMatches = [...jsonStr.matchAll(/\*\*\s*(\d+\.?\s*[^:]+):\s*\*\*\s*([\s\S]+?)(?=\n\*\*|\n$|$)/g)];

            if (titleMatches.length > 0 && summaryMatches.length > 0) {
                const count = Math.min(titleMatches.length, summaryMatches.length);
                for (let i = 0; i < count; i++) {
                    let title = titleMatches[i][1];
                    // Strip leading session numbers (e.g. "17. ", "Sessão 17: ")
                    title = title.replace(/^(\d+\.?\s+|Sessão\s+\d+:?\s*)/i, "").trim();

                    extractedItems.push({
                        title: title,
                        summary: summaryMatches[i][1]
                    });
                }
            } else if (listMatches.length > 0) {
                listMatches.forEach(match => {
                    let title = match[1].trim();
                    // Strip leading session numbers for markdown lists as well
                    title = title.replace(/^(\d+\.?\s+|Sessão\s+\d+:?\s*)/i, "").trim();

                    extractedItems.push({
                        title: title,
                        summary: match[2].trim()
                    });
                });
            }

            if (extractedItems.length > 0) {
                return extractedItems;
            }

            throw repairError;
        }
    }
};

const checkAiAvailability = async () => {
    const { SettingsModule } = await import('./modules/settings.js');
    const { getGlobalConfig } = await import('./data.js');
    const config = await getGlobalConfig();
    if (config?.aiActive === false) throw new Error("O Oráculo está silencioso por decreto do GM neste momento.");
    if (SettingsModule.currentPrefs?.aiEnabled === false) throw new Error("Suas orações ao Oráculo foram pausadas pelo Grande Mestre.");
};

export const sendMessageToLyra = async (message, idToken, history = [], context = "", persona = "lyra") => {
    await checkAiAvailability();
    if (message.length > 2000) throw new Error("Sua mensagem é muito longa para os pergaminhos.");

    let identity = LYRA_IDENTITY;
    if (persona === 'damien') identity = DAMIEN_IDENTITY;
    if (persona === 'eldrin') identity = ELDRIN_IDENTITY;

    const safeHistory = history.slice(-15);
    const systemInstruction = (!history || history.length === 0)
        ? `Fale como sua persona e dê as boas-vindas ao viajante. Se ele fizer uma pergunta, responda-a antes de qualquer outra coisa.`
        : `Continue a conversa de forma natural. Responda diretamente ao comentário do usuário.`;


    let finalMessage = `--- DADOS DE APOIO ---\n${context}\n\n--- SUA ESSÊNCIA ---\n${identity}\n\n--- DIÁLOGO ATUAL ---\nMensagem do Usuário: "${message}"`;
    const data = await callProxy({ message: finalMessage, systemInstruction: systemInstruction, history: safeHistory });
    return data.response;
};

export const createMonsterWithLyra = async (monsterData, idToken) => {
    await checkAiAvailability();

    const systemPrompt = `Você é um gerador de criaturas para D&D 5e. Receba os dados base (nome, ND, tipo e descrição/prompt) e gere um objeto JSON completo com estatísticas equilibradas.
    Retorne APENAS o JSON.
    Estrutura: { "name": "...", "cr": "...", "type": "...", "ac": 10, "hp": "10 (2d8 + 2)", "attributes": { "FOR": 10, ... }, "actions": [ { "name": "Ataque", "description": "..." } ], "description": "..." }`;

    const userPrompt = `Gere um monstro baseado nisto: ${JSON.stringify(monsterData)}`;

    const data = await callProxy({ message: userPrompt, systemInstruction: systemPrompt });

    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Criar Monstro Erro:", e);
        throw new Error("A criatura se desvaneceu no éter.");
    }
};

export const createCharacterWithLyra = async (charData, idToken) => {
    await checkAiAvailability();

    const systemPrompt = `Você é a Guardiã do Eco. Sua tarefa é completar a história e detalhes de um personagem de D&D 5e.
    Receba os dados básicos e gere: Traços de Personalidade, Ideais, Vínculos, Defeitos, Aparência e uma História (Backstory) envolvente.
    Retorne APENAS um objeto JSON com esses campos em português.`;

    const userPrompt = `Complete este herói: ${JSON.stringify(charData)}`;

    const data = await callProxy({ message: userPrompt, systemInstruction: systemPrompt });

    try {
        return safeParseJSON(data.response);
    } catch (e) {
        logger.error("Criar Personagem Erro:", e);
        throw new Error("O destino deste herói ficou nebuloso.");
    }
};

export const processSessionWithLyra = async (sessionData, idToken) => {
    await checkAiAvailability();

    const systemPrompt = `Você é o Oráculo. Sua tarefa é analisar os dados de uma sessão de RPG e fornecer um gancho narrativo e uma introdução mística.
    Retorne um texto narrativo em português.`;

    const userPrompt = `Processe esta crônica: ${JSON.stringify(sessionData)}`;

    const data = await callProxy({ message: userPrompt, systemInstruction: systemPrompt });

    return data.response;
};

export const generateItem = async (prompt, persona, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }
    const finalPersona = persona || window.app?.currentThemeName || 'lyra';

    const flavorTextMap = {
        'lyra': "Tocado pela magia arcana de Lyra.",
        'damien': "Forjado nas chamas do caos de Damien.",
        'eldrin': "As notas eternas de Eldrin abençoaram esta relíquia.",
        'default': "Uma aura misteriosa envolve este item."
    };
    const flavor = flavorTextMap[finalPersona] || flavorTextMap['default'];

    const systemPrompt = `
    [ACT AS]: D&D 5e Item Generator.
    [TASK]: Generate a D&D 5e item based on the user prompt.
    [OUTPUT]: Valid JSON Object ONLY. No markdown formatting around it.
    [JSON STRUCTURE]:
    {
        "name": "Item Name",
        "type": "weapon|armor|wondrous|potion",
        "rarity": "common|uncommon|rare|very_rare|legendary",
        "weight": "2 kg",
        "cost": "100 po",
        "damage": "1d8 cortante" (if weapon, else null),
        "ac": "15" (if armor, else null),
        "properties": ["Leve", "Versátil"],
        "description": "Description in Portuguese. MUST end with this exact phrase: '${flavor}'"
    }
    
    [USER PROMPT]: ${prompt}
    `;

    const data = await callProxy({
        action: 'callGemini',
        idToken,
        message: systemPrompt,
        history: []
    });

    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Generate Item Error:", e, data.response);
        throw new Error("O item se desvaneceu antes de ser forjado.");
    }
};

export const generateSpell = async (prompt, persona, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }
    const finalPersona = persona || window.app?.currentThemeName || 'lyra';

    const flavorTextMap = {
        'lyra': "Uma canalização pura do Eco de Lyra.",
        'damien': "O rastro de destruição de Damien permanece.",
        'eldrin': "A harmonia infinita de Eldrin vibra nesta magia.",
        'default': "Manifestação do Oráculo."
    };
    const flavor = flavorTextMap[finalPersona] || flavorTextMap['default'];

    const systemPrompt = `
    [ACT AS]: D&D 5e Spell Generator.
    [TASK]: Generate a D&D 5e spell based on the user prompt.
    [OUTPUT]: Valid JSON Object ONLY. No markdown.
    [LANGUAGE]: Portuguese (pt-BR).
    [JSON STRUCTURE]:
    {
        "name": "Spell Name",
        "level": 3,
        "school": "Evocação|Necromancia|...",
        "casting_time": "1 ação",
        "range": "30 metros",
        "components": "V, S, M (enxofre)",
        "duration": "Instantânea",
        "description": "Full description of effects. MUST end with: '${flavor}'",
        "classes": ["Mago", "Feiticeiro"]
    }
    
    [USER PROMPT]: ${prompt}
    `;

    const data = await callProxy({
        action: 'callGemini',
        idToken,
        message: systemPrompt,
        history: []
    });

    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Generate Spell Error:", e, data.response);
        throw new Error("O grimório etéreo está ilegível.");
    }
};

export const generateMonster = async (prompt, persona, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }
    const finalPersona = persona || window.app?.currentThemeName || 'lyra';

    const flavorTextMap = {
        'lyra': "Uma criatura tecida das memórias do Eco.",
        'damien': "Uma abominação que se recusa a sucumbir ao esquecimento.",
        'eldrin': "Uma lenda viva manifestada pela canção do infinito.",
        'default': "Uma criatura surgida das névoas do desconhecido."
    };
    const flavor = flavorTextMap[finalPersona] || flavorTextMap['default'];

    const systemPrompt = `
    [ACT AS]: D&D 5e Monster Generator.
    [TASK]: Generate a D&D 5e monster based on the user prompt.
    [OUTPUT]: Valid JSON Object ONLY. No markdown formatting around it.
    [LANGUAGE]: Portuguese (pt-BR).
    [JSON STRUCTURE]:
    {
        "name": "Monster Name",
        "cr": "1/2",
        "type": "Aberração|Besta|Dragão|...",
        "size": "Tiny|Small|Medium|Large|Huge|Gargantuan",
        "hp": "45 (7d8 + 14)",
        "ac": 15,
        "attributes": {
            "FOR": 10, "DES": 10, "CON": 10, "INT": 10, "SAB": 10, "CAR": 10
        },
        "description": "Full description of abilities, actions, and lore. Detailed in Portuguese. MUST end with: '${flavor}'"
    }
    
    [USER PROMPT]: ${prompt}
    `;

    const data = await callProxy({ action: 'callGemini', idToken, message: systemPrompt, history: [] });
    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Generate Monster Error:", e, data.response);
        throw new Error("A criatura se desfez em fumaça antes de tomar forma.");
    }
};

export const generateNames = async (race, clazz, gender, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }

    const systemPrompt = `
    [ACT AS]: D&D 5e Name Generator.
    [TASK]: Generate 10 names/surnames for a character.
    [FILTERS]: Race: ${race || 'Qualquer'}, Class: ${clazz || 'Qualquer'}, Gender: ${gender || 'Qualquer'}
    [OUTPUT]: Valid JSON Array of Strings ONLY. No markdown.
    [EXAMPLE]: ["Nome 1", "Nome 2", ...]
    `;
    const data = await callProxy({ action: 'callGemini', idToken, message: systemPrompt, history: [] });
    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Generate Names Error:", e, data.response);
        throw new Error("Os ecos dos nomes se perderam no tempo.");
    }
};

export const generateModuleContent = async (type, prompt, persona, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }
    const finalPersona = persona || window.app?.currentThemeName || 'lyra';

    const flavorTextMap = { 'lyra': "Sussurrado pelo Eco de Lyra.", 'damien': "Esculpido no caos de Damien.", 'eldrin': "Cantado pelas cordas de Eldrin.", 'default': "Uma visão do Oráculo." };
    const flavor = flavorTextMap[finalPersona] || flavorTextMap['default'];

    const schemas = { 'VILLAINS': { name: "Nome", race: "Raça", class: "Classe", motivation: "Motivação", scheme: "Plano Sugerido", description: "História e Detalhes" }, 'NPCS': { name: "Nome", race: "Raça", class: "Classe", personality: "Personalidade", goal: "Objetivo", appearance: "Aparência", description: "Notas extras" }, 'CAMPAIGNS': { name: "Nome da Campanha", synopsis: "Sinopse do Arco", main_locations: "Locais Importantes", hooks: "Ganchos Iniciais", description: "Resumo Geral" }, 'ENCOUNTERS': { name: "Título do Encontro", cr: "Nível/ND Sugerido", monsters: "Lista de Criaturas", environment: "Ambiente", description: "Dinâmica do combate/cena" }, 'PUZZLES': { name: "Nome do Enigma", difficulty: "Fácil|Médio|Difícil", clue: "Pista Inicial", solution: "Solução", description: "Mecânicas e contexto" }, 'TREASURES': { name: "Tesouro/Lote", items: "Itens Mágicos/Objetos", coins: "Moedas e Valores", lore: "Origem do tesouro", description: "Onde encontrá-lo" }, 'SCENES': { name: "Título da Cena", atmosphere: "Clima/Atmosfera", key_elements: "Elementos Visuais e Sonoros", description: "Descrição narrativa completa" }, 'PLOTS': { name: "Título da Trama", arc_type: "Tipo (Vingança, Investigação, etc)", key_events: "Eventos Chave", description: "Desenvolvimento da trama" }, 'MOTIVATIONS': { name: "Nome da Motivação", source: "Origem (Trauma, Ambição, etc)", impact: "Impacto no Comportamento", description: "Como interpretar" }, 'RULES': { name: "Título da Regra", context: "Quando aplicar", mechanic: "Como funciona (Dados/Testes)", description: "Explicação detalhada" }, 'TRAPS': { name: "Nome da Armadilha", level: "Nível Sugerido", type: "Tipo (Mecânica/Mágica)", dc: "CD de Percepção/Investigação/Salvamento", damage: "Dano/Efeito", effect: "Descrição do efeito", description: "Como desarmar" } };
    const schema = schemas[type] || { name: "Nome", description: "Descrição" };
    const systemPrompt = `[ACT AS]: D&D 5e Content Generator. [TASK]: Generate ${type}. [OUTPUT]: Valid JSON. [LANGUAGE]: pt-BR. [JSON STRUCTURE]: ${JSON.stringify(schema)}. IMPORTANT: "description" MUST end with: '${flavor}'\n[USER]: ${prompt}`;

    const data = await callProxy({ action: 'callGemini', idToken, message: systemPrompt, history: [] });
    try {
        const parsed = safeParseJSON(data.response);
        if (parsed && !parsed.name) parsed.name = "Invocação Sem Nome";
        return parsed;
    } catch (e) {
        console.error("Module Content Error:", e, data.response);
        throw new Error("A visão se dissipou antes de se tornar real.");
    }
};

export const generateSession = async (prompt, systemId, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }

    const systemPrompt = `
    [ACT AS]: Expert Game Master (Dungeon Master).
    [TASK]: Generate a new adventure session/journey start.
    [SYSTEM]: ${systemId}
    [OUTPUT]: Valid JSON Object ONLY. No markdown.
    [LANGUAGE]: Portuguese (pt-BR).
    [JSON STRUCTURE]:
    {
        "title": "Name of the Journey",
        "story": "A detailed initial narrative hook and context (min 3 paragraphs). Use a medieval fantasy tone. End with: 'O destino está em suas mãos.'"
    }
    
    [USER THEME/SEED]: ${prompt}
    `;

    const data = await callProxy({ action: 'callGemini', idToken, message: systemPrompt, history: [] });
    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Generate Session Error:", e, data.response);
        throw new Error("O oráculo falou em enigmas indecifráveis.");
    }
};

export const generateSessionStory = async (context) => {
    await checkAiAvailability();
    const { SettingsModule } = await import('./modules/settings.js');
    const aiName = SettingsModule.currentPrefs?.aiName || "Lyra";

    const systemPrompt = `
    [ACT AS]: Expert Game Master and Storyteller.
    [IDENTITY]: You are the ${aiName}, an ancient and powerful arcane entity.
    [TASK]: Generate a D&D 5e session story hook.
    [LANGUAGE]: Portuguese (pt-BR).
    [FORMAT]: Narrative text (3-5 paragraphs). No markdown tags like # or **. Just pure text.
    
    [CONTEXTUAL REQUIREMENTS]:
    1. READ THE LINKED CONTENT: You MUST integrate the NPCs, Items, and Monsters provided in the context into a cohesive initial narrative.
    2. THEMATIC TONE: Medieval fantasy, mystical, slightly dramatic.
    3. THE ORACLE'S VOICE: Use a tone of someone who sees the threads of fate.
    
    [SESSION BUNDLE CONTEXT]:
    - Title: ${context.title}
    - System: ${context.system}
    - NPCs: ${JSON.stringify(context.npcs)}
    - Items: ${JSON.stringify(context.items)}
    - Monsters/Enemies: ${JSON.stringify(context.monsters)}
    
    [OUTPUT]: Pure narrative text starting with a hook and ending with: 'O destino está em suas mãos.'
    `;

    const { getAuth } = await import('firebase/auth');
    const user = getAuth().currentUser;
    const idToken = await user.getIdToken();

    const data = await callProxy({ action: 'callGemini', idToken, message: systemPrompt, history: [] });
    return data.response;
};

export const extendSessionStory = async (context, gmRequest) => {
    await checkAiAvailability();
    const systemPrompt = `
    [ACT AS]: Expert Game Master and Storyteller.
    [TASK]: Extend the current session narrative based on the GM's prompt.
    [LANGUAGE]: Portuguese (pt-BR).
    [FORMAT]: Narrative text (2-3 paragraphs). Pure text only.
    
    [CONTEXTUAL DATA]:
    - Current Story: ${context.story}
    - Players Present: ${JSON.stringify(context.players || [])}
    - Linked NPCs: ${JSON.stringify(context.npcs || [])}
    - Linked Items: ${JSON.stringify(context.items || [])}
    - Active Monsters: ${JSON.stringify(context.monsters || [])}
    
    [GM COMMAND]: ${gmRequest}
    
    [OUTPUT]: Continue the story naturally. You MUST integrate the characters and any relevant monsters or items from the context into the scene. Maintain a mystical, immersive medieval fantasy tone.
    `;

    const { getAuth } = await import('firebase/auth');
    const user = getAuth().currentUser;
    const idToken = await user.getIdToken();

    const data = await callProxy({ action: 'callGemini', idToken, message: systemPrompt, history: [] });
    return data.response;
};

export const narrateCharacterEntry = async (sessionContext, characterData) => {
    await checkAiAvailability();
    const systemPrompt = `
    [ACT AS]: Expert Game Master and Storyteller.
    [TASK]: Narrate the entrance of a NEW character into an ongoing adventure.
    [LANGUAGE]: Portuguese (pt-BR).
    [TONE]: Mystical, epic, immersive medieval fantasy.
    
    [SESSION CONTEXT]:
    - Current Story: ${sessionContext.story}
    - Recent Events: ${JSON.stringify(sessionContext.recentMessages || [])}
    
    [NEW CHARACTER]:
    - Name: ${characterData.bio?.name}
    - Race: ${characterData.bio?.race}
    - Class: ${characterData.bio?.class}
    - Background: ${characterData.bio?.background || 'Um viajante misterioso'}

    [OUTPUT]: 2-3 paragraphs of pure narrative text. Integrate the character naturally. No markdown formatting.
    `;

    const { getAuth } = await import('firebase/auth');
    const user = getAuth().currentUser;
    const idToken = await user.getIdToken();

    const data = await callProxy({
        action: 'callGemini',
        idToken,
        message: systemPrompt,
        history: []
    });

    return data.response;
};

export const generateTimelineWithLyra = async (sessionData, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }

    const sessionCount = parseInt(sessionData.timeline || 5);
    const systemPrompt = `
    [ACT AS]: Expert Game Master and Storyteller.
    [TASK]: Generate a full adventure timeline (${sessionCount} sessions) based on the session data provided.
    [CRITICAL]: You MUST generate EXACTLY ${sessionCount} sessions in the "timeline" array.
    [PACING]: 
    - 1 session (One-shot): Fast-paced. Introduction, exploration, and climax all in one session.
    - 3-5 sessions: Medium pace. Developing themes, escalating stakes, and a grand finale.
    - 10 sessions: Epic scale. Slow-burn build-up, multiple sub-plots, and world-shaking consequences.
    [LANGUAGE]: Portuguese (pt-BR).
    [OUTPUT]: Valid JSON Object ONLY.
    [JSON STRUCTURE]:
    {
        "intro": "A mystical introduction to the saga.",
        "timeline": [
            { "session": 1, "title": "Session Name", "summary": "Short summary." }
        ]
    }
    [SESSION DATA]: ${JSON.stringify(sessionData)}
    `;

    const data = await callProxy({
        action: 'callGemini',
        idToken,
        message: systemPrompt,
        history: []
    });

    try {
        const result = safeParseJSON(data.response);
        if (!result) throw new Error("Vazio");

        if (result.timeline && Array.isArray(result.timeline)) {
            result.timeline = result.timeline.map((item, index) => ({
                session: item.session || (index + 1),
                title: item.title || `Sessão ${index + 1}`,
                summary: item.summary || item.description || "O destino ainda não foi escrito.",
                potential_npcs: item.potential_npcs || [],
                potential_monsters: item.potential_monsters || []
            }));
        }
        return result;
    } catch (e) {
        console.error("AI Timeline Error:", data.response);
        throw new Error("As linhas do tempo se emaranharam.");
    }
};

export const generateSessionGaps = async (sessionData, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }

    const systemPrompt = `
    [ACT AS]: Expert Game Master and Co-writer.
    [TASK]: Fill in the BLANK fields of an RPG session.
    [LANGUAGE]: Portuguese (pt-BR).
    [OUTPUT]: Valid JSON Object ONLY. No markdown.
    [SESSION DATA]: ${JSON.stringify(sessionData)}

    [INSTRUCTIONS]:
    - For fields like 'locations', 'npcs', 'threats', 'encounters', 'treasure', ALWAYS use a detailed numbered list (1. ..., 2. ...) with 3-5 items.
    - [CRITICAL]: Each numbered item MUST be on a NEW LINE.
    `;
    const data = await callProxy({ action: 'callGemini', idToken, message: systemPrompt, history: [] });
    try {
        const parsed = safeParseJSON(data.response);
        if (!parsed) throw new Error("Vazio");

        // Helper function to fix list formatting if AI fails to add newlines
        const formatNumberedList = (text) => {
            if (!text) return text;
            // Ensure newline before each number (except the first one or those already at START of line) if not already there
            // Matches any digit followed by a dot, preceded by a space and NOT a newline
            return text.replace(/([^\n])\s+(\d+\.)\s+/g, '$1\n$2 ');
        };

        Object.keys(parsed).forEach(key => {
            // Fix list formatting: join arrays with newlines to avoid commas in UI
            if (Array.isArray(parsed[key])) {
                parsed[key] = parsed[key].join('\n');
            }
            if (typeof parsed[key] === 'string') {
                parsed[key] = formatNumberedList(parsed[key].replace(/\*/g, '').trim());
            }
        });
        return parsed;
    } catch (e) {
        console.error("AI Gaps Error:", data.response);
        throw new Error("O Oráculo não conseguiu completar sua visão.");
    }
};

export const summarizeSession = async (sessionData, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }

    const systemPrompt = `
    [ACT AS]: Expert Game Master and Chronicler.
    [TASK]: Create a concise summary of the current session state.
    [LANGUAGE]: Portuguese (pt-BR).
    [FORMAT]: Narrative text (1-2 paragraphs). Pure text only.
    [CONTEXTUAL DATA]:
    - Title: ${sessionData.title}
    - Story Hook: ${sessionData.hook}
    - Current Progress: ${sessionData.story}
    - Linked NPCs: ${JSON.stringify(sessionData.npcs || [])}
    - Linked Events: ${JSON.stringify(sessionData.fullTimeline || [])}

    [OUTPUT]: Summarize the main themes and current goal in a mystical tone.
    `;
    const data = await callProxy({ action: 'callGemini', idToken, message: systemPrompt, history: [] });
    return data.response;
};

export const prolongTimelineWithLyra = async (activeSession, count, position, idToken) => {
    await checkAiAvailability();

    if (!idToken) {
        const { getAuth } = await import('firebase/auth');
        const user = getAuth().currentUser;
        if (user) idToken = await user.getIdToken();
    }

    const timeline = activeSession.fullTimeline || [];
    let referenceContext = 'Nenhuma sessão existente.';
    let contextGuidance = '';

    if (position === 'start') {
        const first = timeline[0];
        referenceContext = first ? `A aventura começa originalmente em: "${first.title} - ${first.summary}"` : referenceContext;
        contextGuidance = `
    [TAREFA ESPECÍFICA]: Gerar um PRÓLOGO/PREÂMBULO. 
    Estes eventos devem ocorrer ANTES da primeira sessão conhecida e preparar o terreno para o objetivo principal.`;
    } else if (position === 'middle') {
        const midIdx = Math.floor(timeline.length / 2);
        const mid = timeline[midIdx];
        referenceContext = mid ? `Ponto central da trama: "${mid.title} - ${mid.summary}"` : referenceContext;
        contextGuidance = `
    [TAREFA ESPECÍFICA]: Gerar EVENTOS INTERMEDIÁRIOS. 
    Estes eventos devem expandir o meio da história, aprofundando a jornada.`;
    } else {
        const last = timeline[timeline.length - 1];
        referenceContext = last ? `Último capítulo conhecido: "${last.title} - ${last.summary}"` : referenceContext;
        contextGuidance = `
    [TAREFA ESPECÍFICA]: Gerar uma CONTINUAÇÃO/SEQUÊNCIA. 
    Estes eventos devem seguir cronologicamente após o último capítulo registrado.`;
    }

    const systemPrompt = `
    [CONTEXTO DA SAGA]:
    - Título: ${activeSession.title}
    - Objetivo Original: ${activeSession.goal || activeSession.hook}
    - Referência Atual: ${referenceContext}

    [MISSÃO]: Gerar exatamente ${count} NOVAS sessões para expandir esta cronologia.
    ${contextGuidance}
    [CRÍTICO]: Você deve retornar EXATAMENTE ${count} objetos no array JSON. Não ignore a quantidade solicitada.
    [IDIOMA]: Português (pt-BR).

    [REGRA DE SAÍDA]: Retorne APENAS um Array JSON válido. Proibido texto conversacional ou markdown.
    [ESTRUTURA JSON]:
    [
        {
            "title": "Nome Criativo",
            "summary": "Resumo narrativo detalhado.",
            "potential_npcs": ["Nome 1"],
            "potential_monsters": ["Monstro 1"]
        }
    ]
    `;

    const data = await callProxy({ action: 'callGemini', idToken, message: systemPrompt, history: [] });
    try {
        const result = safeParseJSON(data.response);
        if (!result) throw new Error("Vazio");

        const items = Array.isArray(result) ? result : (result.timeline || [result]);

        return items.map((item, index) => {
            let title = item.title || `Novo Capítulo`;
            // Strip leading session numbers from standard result mapping too
            title = title.replace(/^(\d+\.?\s+|Sessão\s+\d+:?\s*)/i, "").trim();

            return {
                session: index + 1,
                title: title,
                summary: item.summary || item.description || item.story || "O destino se expande.",
                potential_npcs: item.potential_npcs || [],
                potential_monsters: item.potential_monsters || [],
                goal: "", locations: "", npcs: "", threats: "", encounters: "", climax: "", treasure: ""
            };
        });
    } catch (e) {
        console.error("Prolong Timeline Error:", e, data.response);
        throw new Error("O oráculo falhou ao vislumbrar o futuro estendido.");
    }
};
