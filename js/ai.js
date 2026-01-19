
const AI_PROXY_URL = "http://localhost:8000/chat"; // Update with EC2 IP for production

export const sendMessageToLyra = async (message, history = []) => {
    try {
        const response = await fetch(AI_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, history })
        });

        if (!response.ok) {
            throw new Error(`Erro na conexão com Lyra (${response.status})`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Erro ao falar com a IA:", error);
        throw error;
    }
};
