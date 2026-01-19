
const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbxargXcnX6vxelFHruR0l1uZEVqP3etr-6kENsB5TB55luDv0uet_JJbOvE6-65WUyH5w/exec";

export const sendMessageToLyra = async (message, idToken, history = []) => {
    try {
        const response = await fetch(AI_PROXY_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'callGemini',
                idToken,
                message,
                history
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na conexão com Lyra (${response.status})`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.response;
    } catch (error) {
        console.error("Erro ao falar com a IA:", error);
        throw error;
    }
};
