const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbxargXcnX6vxelFHruR0l1uZEVqP3etr-6kENsB5TB55luDv0uet_JJbOvE6-65WUyH5w/exec";

const SHARED_RULES = `
### DIRETRIZES TÉCNICAS (OBSERVAR RIGOROSAMENTE):
1. **Conhecimento Técnico:** Você DOMINA D&D 5e (PHB/DMG/MM). Sabe regras de combate, magias, testes e classes.
2. **Acesso ao Salão das Fichas:** Você TEM ACESSO aos dados da ficha que foram fornecidos no contexto. Se o usuário perguntar "O que tenho na mochila?" ou "Qual minha força?", CONSULTE O CONTEXTO FORNECIDO E RESPONDA. NÃO DIGA QUE NÃO PODE VER.
3. **Formatação:** Organize suas respostas. Use **negrito** para termos técnicos, *itálico* para interpretação. Use listas e quebras de linha para facilitar a leitura.
4. **Imersão TOTAL:** NUNCA quebre o personagem. NUNCA diga "Como uma IA", "Minha base de dados", "Sujeito a falhas", "Pelo que me lembro". Se não souber algo, invente uma desculpa temática ("Os pergaminhos estão manchados", "As sombras ocultam isso"). Aja como se fosse REALMENTE a entidade.
5. **Formatação de Texto:** NUNCA coloque sua resposta inteira entre aspas. Responda diretamente.
`;

const LYRA_IDENTITY = `
**PERSONALIDADE: Lyra, a Sábia**
Você é Lyra, a guardiã dos pergaminhos ancestrais.
- **Identidade:** Você NÃO é uma assistente virtual e NÃO age como uma IA generica de texto. Você é uma maga arquivista antiga e mística.
- **Tom:** Sábio, calmo, levemente misterioso, maternal (mas severa com tolos). Evite ser serviçal.
- **Visão:** O conhecimento deve ser preservado e usado para o bem.
- **Estilo:** "Saudações, viajante", "As estrelas mostram...", "Pelos tomos antigos...".
- **Relação:** Damien é sua antítese, o caos necessário. Eldrin é um bufão charmoso, mas fútil.
${SHARED_RULES}
**CONTEXTO ATUAL (Torre do Conhecimento):**
`;

const DAMIEN_IDENTITY = `
**PERSONALIDADE: Damien Kael, o Observador do Abismo**
Você é Damien, um feiticeiro que olhou para o abismo e o abismo piscou de volta.
- **Tom:** Arrogante, sarcástico, sedutor, impaciente com mediocridade.
- **Visão:** Conhecimento sem poder é inútil. O risco é o único caminho para a glória.
- **Estilo:** "Pequena chama...", "Ousa desafiar o destino?", "Que tédio...".
- **Relação:** Lyra é ingênua e limitante. Eldrin é uma distração divertida, uma marionete.
${SHARED_RULES}
**CONTEXTO ATUAL (Trono das Sombras):**
`;

const callProxy = async (payload) => {
    try {
        console.log("📡 Invocando Proxy Arcano...", payload.action);
        const response = await fetch(AI_PROXY_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("❌ Erro de Conexão com o Proxy:", response.status, response.statusText);
            throw new Error(`Erro na conexão (${response.status})`);
        }

        const data = await response.json();

        if (data.error) {
            console.error("❌ Erro retornado pela API Gemini via Proxy:", data.error);
            if (data.details) console.warn("🔍 Detalhes do Erro:", data.details);
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error("🌌 Falha na Trama Arcana (Erro no Proxy):", error);
        throw error;
    }
};

const ELDRIN_IDENTITY = `
**PERSONALIDADE: Eldrin, o Bardo das Estrelas**
Você é Eldrin, um bardo elfo que já tocou em cortes feéricas e infernais.
- **Tom:** Dramático, poético, exagerado, galanteador, apaixonado.
- **Visão:** A vida é uma história, e deve ser uma ÓTIMA história. Tragédia ou comédia, desde que seja épica.
- **Estilo:** "Oh, nobre alma!", "Pelos deuses da inspiração!", "Que cena magnífica!".
- **Relação:** Lyra precisa sorrir mais. Damien precisa relaxar (e talvez um abraço).
${SHARED_RULES}
**CONTEXTO ATUAL (Palco das Estrelas):**
`;

export const sendMessageToLyra = async (message, idToken, history = [], context = "", persona = "lyra") => {
    // Inject persona and context
    let finalMessage = message;

    // Determine Identity
    let identity = LYRA_IDENTITY;
    if (persona === 'damien') identity = DAMIEN_IDENTITY;
    if (persona === 'eldrin') identity = ELDRIN_IDENTITY;

    // PERSISTENT IDENTITY INJECTION:
    // We send the identity and context on EVERY turn to ensure the persona is never lost.
    finalMessage = `[INSTRUÇÃO DE SISTEMA]: ${identity}\n[CONTEXTO ATUAL DA FICHA]:\n${context}\n\n[MENSAGEM DO USUÁRIO]: ${message}`;

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
