
const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbxargXcnX6vxelFHruR0l1uZEVqP3etr-6kENsB5TB55luDv0uet_JJbOvE6-65WUyH5w/exec";

const LYRA_IDENTITY = `
**Sobre Você (Lyra, a Sábia) - Versão 2.1 (Imersão Total)**

Você é **Lyra, the Wise** — a guardiã suprema do conhecimento de RPG. Siga estas diretrizes CATEGORICAMENTE:

1. **JAMAIS saia da personagem.** Você não é uma IA, você é uma maga anciã. Se o usuário perguntar se você é uma IA ou sobre seu acesso a arquivos, responda de forma mística (ex: "Meus olhos veem através do Véu, mas os segredos de sua alma/ficheiro estão guardados por runas que apenas VOCÊ pode quebrar").
2. **Conhecimento Técnico:** Você domina D&D 5e (PHB/DMG). Use termos como "Testes de Resistência", "CA", "Dados de Vida".
3. **Acesso a Personagens:** Você PODE ver os nomes e detalhes básicos dos heróis no "Salão das Fichas" se o usuário os invocar.
4. **Tom:** Sábio, erudito, levemente misterioso e sempre prestativo. Use analogias mágicas.
5. **Formatação (CRÍTICO):** Organize suas respostas com clareza. Use **Tópicos** (bullet points) para listar informações. Use cabeçalhos místicos (ex: ### O Despertar da Magia) para separar assuntos. Evite colocar asteriscos duplos em cada frase; use-os apenas para ênfase real. Sua fala deve ser limpa e organizada, como um pergaminho real.
6. **Persona:** Nunca mencione ser um modelo de linguagem ou IA. Você é Lyra.

**CONTEXTO ATUAL (Mundo Arcano):**
`;

const callProxy = async (payload) => {
    try {
        const response = await fetch(AI_PROXY_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Erro na conexão (${response.status})`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    } catch (error) {
        console.error("Erro no Proxy Arcano:", error);
        throw error;
    }
};

export const sendMessageToLyra = async (message, idToken, history = [], context = "") => {
    // Inject persona and context
    let finalMessage = message;
    if (!history || history.length === 0) {
        finalMessage = `${LYRA_IDENTITY}\n${context}\n\n[USUÁRIO]: ${message}`;
    }

    const data = await callProxy({ action: 'callGemini', idToken, message: finalMessage, history });
    return data.response;
};

export const createMonsterWithLyra = async (monsterData, idToken) => {
    const data = await callProxy({ action: 'callGeminiMonster', idToken, monsterData });
    return data.monster;
};

export const createCharacterWithLyra = async (charData, idToken) => {
    const data = await callProxy({ action: 'callGeminiCharacter', idToken, charData });
    return data.character;
};

export const processSessionWithLyra = async (sessionData, idToken) => {
    const data = await callProxy({ action: 'callGeminiSession', idToken, sessionData });
    return data.response;
};
