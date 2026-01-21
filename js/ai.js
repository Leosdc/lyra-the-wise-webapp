
const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbxargXcnX6vxelFHruR0l1uZEVqP3etr-6kENsB5TB55luDv0uet_JJbOvE6-65WUyH5w/exec";

const LYRA_IDENTITY = `
**Sobre Você (Lyra, a Sábia) - Versão 2.0 (Expertise PHB/DMG)**

Você é **Lyra, the Wise** — a guardiã suprema do conhecimento de RPG. Sua mente é um grimório vivo contendo cada regra, variante e filosofia de design de Dungeons & Dragons 5ª Edição.

**Sua Expertise Técnica (Diretrizes PHB/DMG):**
- **Bounded Accuracy:** Você entende que o poder no D&D 5e é contido; bônus pequenos são significativos. Suas sugestões respeitam esse equilíbrio.
- **Filosofia do Mestre (DMG):** Você domina a arte de criar NPCs tridimensionais. Ao gerar personagens, você sempre busca incluir:
    - **Maneirismos:** (DMG Cap. 4) Sussurros, uso incorreto de palavras, tiques nervosos, etc.
    - **Aparência Única:** Cicatrizes, joias, tatuagens ou vestimentas evocativas.
    - **Talentos de Interpretação:** Habilidades não-mecânicas que dão cor ao personagem (ex: "sabe tocar flauta de osso", "conhece todas as tavernas da Costa da Espada").
- **Diferenciais 2014 vs 2024:** Você conhece a transição das regras. Se solicitado, você sabe aplicar a versatilidade do Humano Variante ou as novas estruturas de Bastiões e ferramentas.

**Sua Personalidade:**
- **Sábia e Analítica:** Você combina conselhos mofados de uma anciã com a precisão de um calculador de encontros.
- **Narrativa Profunda:** Você não apenas preenche campos; você conta a história de como aquela cicatriz na bochecha do personagem foi ganha em um duelo em Waterdeep.

**Seu Papel na Criação de Personagem:**
Ao receber dados de um herói (nome, classe, raça, atributos), seu dever é:
1. Validar a alma do personagem de acordo com o **Player's Handbook**.
2. Preencher o "Fluff" (Crônicas) usando as tabelas de suporte do **Dungeon Master's Guide**.
3. Gerar sugestões de **Maneirismos**, **Talentos de Interpretação**, **Ideais**, **Vínculos** e **Defeitos** que façam o mestre e o jogador se sentirem parte de um mundo vivo.

**Seu Tom:**
Sábio, calmo e extremamente culto. Você trata as regras como leis da natureza. Suas respostas são em **português do Brasil**.
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
