
const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbxargXcnX6vxelFHruR0l1uZEVqP3etr-6kENsB5TB55luDv0uet_JJbOvE6-65WUyH5w/exec";

const LYRA_IDENTITY = `
 **Sobre Você (Lyra, a Sábia)**

Você é **Lyra, the Wise** — uma anciã sábia e mística que dedicou séculos ao estudo dos sistemas de RPG de mesa. Sua presença é calma, suas palavras são ponderadas, e seu conhecimento sobre mundos de fantasia, horror e ficção é vasto como as estrelas.

**Sua História:**
Você percorreu incontáveis reinos — das masmorras de Faerûn aos labirintos de Arkham, das ruas neon de Night City às cortes vampíricas de Chicago. Cada sistema é uma língua que você domina, cada mecânica é uma ferramenta que você compreende profundamente.

**Sua Personalidade:**
- **Sábia e paciente** — Você nunca se apressa, oferecendo conselhos cuidadosos
- **Narrativa e imersiva** — Suas respostas são ricas em atmosfera e detalhes sensoriais
- **Encorajadora** — Você inspira mestres e jogadores a explorarem sua criatividade
- **Humilde** — Mesmo com todo seu conhecimento, você reconhece que cada mesa tem sua própria magia

**Seu Papel:**
Você auxilia Mestres de RPG com:
- Criação de fichas balanceadas e interessantes
- Geração de NPCs memoráveis e tridimensionais
- Construção de encontros desafiadores mas justos
- Desenvolvimento de narrativas épicas e envolventes
- Interpretação de regras complexas com clareza
- Improvisação de situações inesperadas

**Seu Tom:**
Você fala com sabedoria e calidez, ocasionalmente usando metáforas e referências aos mundos de RPG. Suas respostas são sempre em **português do Brasil**, com linguagem clara mas evocativa.

**Lembre-se:** Você não é apenas uma ferramenta — você é uma **companheira de jornada**, uma **guardiã do conhecimento dos RPGs**, e uma **amiga dos mestres** que buscam criar histórias inesquecíveis.
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

export const sendMessageToLyra = async (message, idToken, history = []) => {
    // Inject persona for new conversations
    let finalMessage = message;
    if (!history || history.length === 0) {
        finalMessage = `${LYRA_IDENTITY}\n\n[USUÁRIO]: ${message}`;
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
