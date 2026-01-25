const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbxargXcnX6vxelFHruR0l1uZEVqP3etr-6kENsB5TB55luDv0uet_JJbOvE6-65WUyH5w/exec";

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
2. **PRIMEIRA INTERAÇÃO:** Ao receber a ficha pela primeira vez ou iniciar a conversa, **VOCÊ DEVE COMENTAR IMEDIATAMENTE SOBRE ELA**.
   - Lyra: Comente como se "lembrasse" da alma do herói.
   - Damien: Julgue a força e utilidade do herói.
   - Eldrin: Veja o potencial heroico/trágico para uma canção.
3. **Não quebre o personagem:** Nunca aja como IA. Use o tom da sua entidade (Tríade do Eco).
4. **Respostas Diretas:** Não use aspas em tudo. Responda normal.
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
    // Determine Identity
    let identity = LYRA_IDENTITY;
    if (persona === 'damien') identity = DAMIEN_IDENTITY;
    if (persona === 'eldrin') identity = ELDRIN_IDENTITY;

    // PERSISTENT IDENTITY INJECTION:
    // We send the identity and context on EVERY turn to ensure the persona is never lost.
    // Enhanced prompt ensures they comment on the sheet context immediately if it's new or relevant.
    let finalMessage = `[INSTRUÇÃO SUPREMA DE SISTEMA]: 
${identity}

[CONTEXTO ATUAL DA FICHA DO HERÓI (Lembre-se: Comente sobre isso se for relevante ou se for o início)]:
${context}

[MENSAGEM DO VIAJANTE]: 
${message}`;

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
