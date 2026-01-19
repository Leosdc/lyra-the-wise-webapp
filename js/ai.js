
const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbxargXcnX6vxelFHruR0l1uZEVqP3etr-6kENsB5TB55luDv0uet_JJbOvE6-65WUyH5w/exec";

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
    const data = await callProxy({ action: 'callGemini', idToken, message, history });
    return data.response;
};

export const createMonsterWithLyra = async (monsterData, idToken) => {
    const data = await callProxy({ action: 'callGeminiMonster', idToken, monsterData });
    return data.monster;
};

export const processSessionWithLyra = async (sessionData, idToken) => {
    const data = await callProxy({ action: 'callGeminiSession', idToken, sessionData });
    return data.response;
};
