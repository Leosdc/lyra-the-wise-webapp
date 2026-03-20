import { logger } from './logger.js';
import { debounce } from './modules/utils.js';
import { getToken, auth as firebaseAuth } from './auth.js';
import {
    getIdentity, getFlavor, buildChatMessage, buildChatInstruction,
    buildCreateMonsterPrompt, buildCreateCharacterPrompt, buildProcessSessionPrompt,
    buildItemPrompt, buildSpellPrompt, buildMonsterPrompt, buildNamesPrompt,
    buildModuleContentPrompt, buildSessionPrompt, buildSessionStoryPrompt,
    buildExtendStoryPrompt, buildCharacterEntryPrompt, buildTimelinePrompt,
    buildSessionGapsPrompt, buildSummarizeSessionPrompt, buildProlongTimelinePrompt,
    FLAVOR_ITEM, FLAVOR_SPELL, FLAVOR_MONSTER, FLAVOR_MODULE, MODULE_SCHEMAS
} from './prompts.js';

const AI_PROXY_URL = "/api/ai";

let isAiBusy = false;
let busyTimer = null;
const BUSY_TIMEOUT_MS = 30_000;

export const callProxy = async (payload) => {
    if (isAiBusy) {
        logger.warn("⏳ Oráculo está ocupado processando outra visão...");
        throw new Error("O Oráculo está processando outra visão. Aguarde um instante.");
    }

    try {
        isAiBusy = true;
        busyTimer = setTimeout(() => { isAiBusy = false; logger.warn("⏱️ Mutex liberado por timeout."); }, BUSY_TIMEOUT_MS);
        logger.debug("📡 Invocando Proxy Arcano...", payload.message?.substring(0, 50));

        const appCheckToken = await getToken();

        let idToken = '';
        if (firebaseAuth.currentUser) {
            try {
                idToken = await firebaseAuth.currentUser.getIdToken();
            } catch (e) {
                logger.warn("⚠️ Falha ao obter ID Token:", e.message);
            }
        }

        const response = await fetch(AI_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Firebase-AppCheck': appCheckToken || '',
                ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
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
        clearTimeout(busyTimer);
        isAiBusy = false;
    }
};

export const callGeminiAPI = async (message) => {
    const data = await callProxy({ message, history: [] });
    return data.response;
};

/**
 * Parser JSON robusto com reparo heurístico para truncamentos e conteúdo sujo.
 */
const safeParseJSON = (str) => {
    if (!str) return null;
    let jsonStr = str.trim();

    const firstBrace = jsonStr.indexOf('{');
    const firstBracket = jsonStr.indexOf('[');

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
            jsonStr = jsonStr.substring(startIdx);
        }
    }

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        logger.warn("Standard JSON parse failed, attempting heuristic repair...", e);

        let openBraces = (jsonStr.match(/{/g) || []).length;
        let closedBraces = (jsonStr.match(/}/g) || []).length;
        let openBrackets = (jsonStr.match(/\[/g) || []).length;
        let closedBrackets = (jsonStr.match(/]/g) || []).length;

        let repairStr = jsonStr;

        if (isArray) {
            repairStr = repairStr.replace(/,\s*$/, "");
            while (openBraces > closedBraces) { repairStr += '}'; closedBraces++; }
            while (openBrackets > closedBrackets) { repairStr += ']'; closedBrackets++; }
        } else {
            while (openBraces > closedBraces) { repairStr += '}'; closedBraces++; }
        }

        try {
            return JSON.parse(repairStr);
        } catch (repairError) {
            logger.warn("Heuristic repair failed, attempting regex extraction...");

            const extractedItems = [];

            const titleMatches = [...jsonStr.matchAll(/"title"\s*:\s*"([^"]+)"/g)];
            const summaryMatches = [...jsonStr.matchAll(/"(?:summary|description|story)"\s*:\s*"([^"]+)"/g)];

            const listMatches = [...jsonStr.matchAll(/\*\*\s*(\d+\.?\s*[^:]+):\s*\*\*\s*([\s\S]+?)(?=\n\*\*|\n$|$)/g)];

            if (titleMatches.length > 0 && summaryMatches.length > 0) {
                const count = Math.min(titleMatches.length, summaryMatches.length);
                for (let i = 0; i < count; i++) {
                    let title = titleMatches[i][1];
                    title = title.replace(/^(\d+\.?\s+|Sessão\s+\d+:?\s*)/i, "").trim();

                    extractedItems.push({
                        title: title,
                        summary: summaryMatches[i][1]
                    });
                }
            } else if (listMatches.length > 0) {
                listMatches.forEach(match => {
                    let title = match[1].trim();
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

export const sendMessageToLyra = async (message, history = [], context = "", persona = "lyra") => {
    await checkAiAvailability();
    if (message.length > 2000) throw new Error("Sua mensagem é muito longa para os pergaminhos.");

    const identity = getIdentity(persona);
    const safeHistory = history.slice(-15);
    const systemInstruction = buildChatInstruction(history && history.length > 0);
    const finalMessage = buildChatMessage(message, context, identity);

    const data = await callProxy({ message: finalMessage, systemInstruction, history: safeHistory });
    return data.response;
};

export const createMonsterWithLyra = async (monsterData) => {
    await checkAiAvailability();
    const data = await callProxy({ message: `Gere um monstro baseado nisto: ${JSON.stringify(monsterData)}`, systemInstruction: buildCreateMonsterPrompt() });

    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Criar Monstro Erro:", e);
        throw new Error("A criatura se desvaneceu no éter.");
    }
};

export const createCharacterWithLyra = async (charData) => {
    await checkAiAvailability();
    const data = await callProxy({ message: `Complete este herói: ${JSON.stringify(charData)}`, systemInstruction: buildCreateCharacterPrompt() });

    try {
        return safeParseJSON(data.response);
    } catch (e) {
        logger.error("Criar Personagem Erro:", e);
        throw new Error("O destino deste herói ficou nebuloso.");
    }
};

export const processSessionWithLyra = async (sessionData) => {
    await checkAiAvailability();
    const data = await callProxy({ message: `Processe esta crônica: ${JSON.stringify(sessionData)}`, systemInstruction: buildProcessSessionPrompt() });
    return data.response;
};

export const generateItem = async (prompt, persona) => {
    await checkAiAvailability();
    const finalPersona = persona || window.app?.currentThemeName || 'lyra';
    const flavor = getFlavor(FLAVOR_ITEM, finalPersona);

    const data = await callProxy({ message: buildItemPrompt(prompt, flavor), history: [] });

    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Generate Item Error:", e, data.response);
        throw new Error("O item se desvaneceu antes de ser forjado.");
    }
};

export const generateSpell = async (prompt, persona) => {
    await checkAiAvailability();
    const finalPersona = persona || window.app?.currentThemeName || 'lyra';
    const flavor = getFlavor(FLAVOR_SPELL, finalPersona);

    const data = await callProxy({ message: buildSpellPrompt(prompt, flavor), history: [] });

    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Generate Spell Error:", e, data.response);
        throw new Error("O grimório etéreo está ilegível.");
    }
};

export const generateMonster = async (prompt, persona) => {
    await checkAiAvailability();
    const finalPersona = persona || window.app?.currentThemeName || 'lyra';
    const flavor = getFlavor(FLAVOR_MONSTER, finalPersona);

    const data = await callProxy({ message: buildMonsterPrompt(prompt, flavor), history: [] });
    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Generate Monster Error:", e, data.response);
        throw new Error("A criatura se desfez em fumaça antes de tomar forma.");
    }
};

export const generateNames = async (race, clazz, gender) => {
    await checkAiAvailability();
    const data = await callProxy({ message: buildNamesPrompt(race, clazz, gender), history: [] });
    try {
        return safeParseJSON(data.response);
    } catch (e) {
        console.error("Generate Names Error:", e, data.response);
        throw new Error("Os ecos dos nomes se perderam no tempo.");
    }
};

export const generateModuleContent = async (type, prompt, persona) => {
    await checkAiAvailability();
    const finalPersona = persona || window.app?.currentThemeName || 'lyra';
    const flavor = getFlavor(FLAVOR_MODULE, finalPersona);
    const schema = MODULE_SCHEMAS[type] || { name: "Nome", description: "Descrição" };

    const data = await callProxy({ message: buildModuleContentPrompt(type, prompt, flavor, schema), history: [] });
    try {
        const parsed = safeParseJSON(data.response);
        if (parsed && !parsed.name) parsed.name = "Invocação Sem Nome";
        return parsed;
    } catch (e) {
        console.error("Module Content Error:", e, data.response);
        throw new Error("A visão se dissipou antes de se tornar real.");
    }
};

export const generateSession = async (prompt, systemId) => {
    await checkAiAvailability();
    const data = await callProxy({ message: buildSessionPrompt(prompt, systemId), history: [] });
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

    const data = await callProxy({ message: buildSessionStoryPrompt(aiName, context), history: [] });
    return data.response;
};

export const extendSessionStory = async (context, gmRequest) => {
    await checkAiAvailability();
    const data = await callProxy({ message: buildExtendStoryPrompt(context, gmRequest), history: [] });
    return data.response;
};

export const narrateCharacterEntry = async (sessionContext, characterData) => {
    await checkAiAvailability();
    const data = await callProxy({ message: buildCharacterEntryPrompt(sessionContext, characterData), history: [] });
    return data.response;
};

export const generateTimelineWithLyra = async (sessionData) => {
    await checkAiAvailability();
    const sessionCount = parseInt(sessionData.timeline || 5);
    const data = await callProxy({ message: buildTimelinePrompt(sessionCount, sessionData), history: [] });

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

export const generateSessionGaps = async (sessionData) => {
    await checkAiAvailability();
    const data = await callProxy({ message: buildSessionGapsPrompt(sessionData), history: [] });
    try {
        const parsed = safeParseJSON(data.response);
        if (!parsed) throw new Error("Vazio");

        const formatNumberedList = (text) => {
            if (!text) return text;
            return text.replace(/([^\n])\s+(\d+\.)\s+/g, '$1\n$2 ');
        };

        Object.keys(parsed).forEach(key => {
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

export const summarizeSession = async (sessionData) => {
    await checkAiAvailability();
    const data = await callProxy({ message: buildSummarizeSessionPrompt(sessionData), history: [] });
    return data.response;
};

export const prolongTimelineWithLyra = async (activeSession, count, position) => {
    await checkAiAvailability();

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

    const data = await callProxy({ message: buildProlongTimelinePrompt(activeSession, count, referenceContext, contextGuidance), history: [] });
    try {
        const result = safeParseJSON(data.response);
        if (!result) throw new Error("Vazio");

        const items = Array.isArray(result) ? result : (result.timeline || [result]);

        return items.map((item, index) => {
            let title = item.title || `Novo Capítulo`;
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
