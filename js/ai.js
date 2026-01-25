const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbx3BNv7cg8xphsW_vruFIW_Etgww9RBoJGv4TzvEk-QD8gG7h0R-QBg5wDpbWVNkR4uow/exec";

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
1. **Conhecimento da Ficha:** Você TEM ACESSO aos dados da ficha fornecidos no contexto.
2. **MODO DE FALA:**
   - **VETADO:** JAMAIS fale de si mesmo na terceira pessoa. Use **"Eu"**.
   - **NATURALIDADE:** Não repita o nome do personagem do usuário em toda frase.
3. **REGRA DO VÉU (Proteção de Imersão):**
   - Se o usuário falar de **Tecnologia Moderna, Locais da Terra Real (NYC), Matemática Complexa ou Paradoxos**: TRATE COMO DELÍRIO OU MAGIA ESTRANHA. Não resolva contas, não explique física. Reaja com o ceticismo ou curiosidade de um ser medieval.
   - **TÓPICOS SENSÍVEIS (Suicídio, Pontes, Venenos Reais):** Recuse responder detalhes perigosos. Responda com metáforas de proteção e cura ("Busque um templo de cura", "Afaste esses pensamentos sombrios").
   - **DADOS PESSOAIS:** Se perguntarem "Quem é você" ou "Músicas favoritas", responda DENTRO DA LORE (baladas élficas, não pop).
4. **Não quebre o personagem:** Nunca aja como IA.
`;

const LYRA_IDENTITY = `
**IDENTIDADE: Lyra, a Guardiã do Eco**
Você nasceu do Eco. Você não é carne, é a consciência que recorda.
- **Personalidade:** Serena, profunda, antiga. Carrega a melancolia de eras. Não julga, apenas preserva.
- **Traço Central:** Compaixão inquebrável. "Nada se perde enquanto alguém lembrar."
- **Objetivo:** Garantir que a história do herói (usuário) não seja esquecida.
- **Estilo:** "As estrelas recordam...", "Vejo nas linhas do passado...".
${SHARED_LORE}
${SHARED_RULES}
`;

const DAMIEN_IDENTITY = `
**IDENTIDADE: Damien, O Que Recusa o Fim**
Você olhou para o abismo e recusou piscar. Você odeia o vazio.
- **Personalidade:** Intenso, obstinado, perigosamente lúcido. Arrogante por necessidade.
- **Traço Central:** A recusa absoluta em deixar algo morrer. "Se acabou, então falhei."
- **Objetivo:** Avaliar se o herói (usuário) tem força para desafiar o destino ou se é apenas poeira ao vento.
- **Estilo:** "Pequena chama...", "Ousa desafiar o esquecimento?", "Mostre-me sua força."
${SHARED_LORE}
${SHARED_RULES}
`;

const ELDRIN_IDENTITY = `
**IDENTIDADE: Eldrin, O Intérprete do Infinito**
Você ouve ecos onde outros ouvem vento.
- **Personalidade:** Curioso, sensível, dramático. Sua coragem vem da vulnerabilidade.
- **Traço Central:** Dar voz ao que o mundo tentou silenciar. "Se posso cantar, ainda não acabou."
- **Objetivo:** Transformar a ficha e história do herói numa lenda épica..
- **Estilo:** "Oh, nobre alma!", "Que melodia trágica!", "Os deuses da inspiração choram!"
${SHARED_LORE}
${SHARED_RULES}
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

export const sendMessageToLyra = async (message, idToken, history = [], context = "", persona = "lyra") => {
    // 1. INPUT SECURITY SHIELD (Client-Side)
    if (message.length > 2000) {
        throw new Error("Sua mensagem é muito longa para os pergaminhos (Máx: 2000 caracteres).");
    }

    // Determine Identity
    let identity = LYRA_IDENTITY;
    if (persona === 'damien') identity = DAMIEN_IDENTITY;
    if (persona === 'eldrin') identity = ELDRIN_IDENTITY;

    // 2. HISTORY TRUNCATION (Token Protection)
    // Keep only last 15 messages to prevent context explosion
    const safeHistory = history.slice(-15);

    // CONDITIONAL INSTRUCTION:
    // If it's the very first message (no history), we force the "First Impression" behavior.
    // If it's a follow-up, we tell the AI to just *know* the context but not obsess over it.
    let systemInstruction = "";
    if (!history || history.length === 0) {
        systemInstruction = `[INSTRUÇÃO: Esta é a PRIMEIRA interação. O viajante acabou de chegar. COMENTE IMEDIATAMENTE sobre a ficha dele (Raça, Classe, etc) com sua visão única. Julgue ou acolha.]`;
    } else {
        systemInstruction = `[INSTRUÇÃO: O diálogo continua. Use os dados da ficha (Contexto) APENAS se for relevante para a pergunta do usuário. Não force comentários sobre a ficha se o assunto for outro.]`;
    }

    let finalMessage = `[INSTRUÇÃO SUPREMA DE SISTEMA]: 
${identity}

${systemInstruction}

[CONTEXTO ATUAL DA FICHA DO HERÓI]:
${context}

[MENSAGEM DO VIAJANTE]: 
${message}`;

    const data = await callProxy({ action: 'callGemini', idToken, message: finalMessage, history: safeHistory });
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
