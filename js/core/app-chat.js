/**
 * App Chat Sub-Module
 * Handles Lyra/Damien/Eldrin AI chat functionality.
 */

import { getCharacters } from '../data.js';
import { sendMessageToLyra } from '../ai.js';
import { parseMarkdown } from '../modules/utils.js';

/**
 * Returns chat-related methods to be mixed into the app object.
 */
export function createChatMixin(ctx) {
    return {
        async handleSendMessage() {
            const input = document.getElementById('chat-input');
            const message = input.value.trim();

            const now = Date.now();
            if (now - (ctx.lastMessageTime || 0) < 2000) {
                ctx.showAlert("Aguarde um pouco antes de enviar outra mensagem.", "Calma, viajante!");
                return;
            }

            if (!message || ctx.isWaitingForAI) return;
            if (!ctx.user) {
                ctx.addChatMsg('bot', "⚠️ Voce precisa fazer login.");
                return;
            }

            ctx.lastMessageTime = now;
            ctx.addChatMsg('user', message);
            input.value = '';
            ctx.isWaitingForAI = true;

            try {
                const idToken = await ctx.user.getIdToken();
                const aiContext = await ctx.getAIContext();
                const response = await sendMessageToLyra(message, idToken, ctx.chatHistory, aiContext, ctx.currentThemeName);
                ctx.addChatMsg('bot', response);
                ctx.chatHistory.push(
                    { role: 'user', parts: [{ text: message }] },
                    { role: 'model', parts: [{ text: response }] }
                );
            } catch (error) {
                console.error(error);
                ctx.addChatMsg('bot', "Falha mística...");
            } finally { ctx.isWaitingForAI = false; }
        },

        async getAIContext() {
            if (!ctx.user) return "";
            try {
                const characters = await getCharacters(ctx.user.uid, ctx.currentSystem);
                if (!characters || characters.length === 0) return "[Nenhum personagem encontrado no Salão das Fichas]";

                let context = "Você tem acesso ao Salão das Fichas atual:\n";
                characters.forEach(c => {
                    context += `- ${c.name || c.bio?.name || 'Sem Nome'} (${c.bio?.race || '?'} ${c.bio?.class || '?'}, Nível ${c.bio?.level || 1})\n`;
                });

                if (ctx.currentCharacter) {
                    const c = ctx.currentCharacter;
                    context += `\n=== PERSONAGEM EM FOCO ===\n`;
                    context += `Nome: ${c.name || 'Sem Nome'}\n`;
                    context += `Raça/Classe: ${c.bio?.race || '?'} ${c.bio?.class || '?'}, Nível ${c.bio?.level || 1}\n`;
                    context += `Vida: ${c.stats?.hp_current}/${c.stats?.hp_max} | CA: ${c.stats?.ac} | Ini: ${c.stats?.initiative > 0 ? '+' : ''}${c.stats?.initiative || 0}\n`;

                    const attrs = c.attributes || {};
                    context += `Atributos: FOR ${attrs.str || 10}, DES ${attrs.dex || 10}, CON ${attrs.con || 10}, INT ${attrs.int || 10}, SAB ${attrs.wis || 10}, CAR ${attrs.cha || 10}\n`;

                    const skills = c.stats?.skills || {};
                    const profSkills = Object.entries(skills).filter(([_, val]) => val.prof).map(([key, _]) => key).join(', ');
                    if (profSkills) context += `Perícias: ${profSkills}\n`;

                    if (c.inventory?.items && c.inventory.items.length > 0) {
                        const items = c.inventory.items.map(i => i.name).join(', ');
                        context += `Posses e Inventário: ${items}\n`;
                    }

                    if (c.story?.appearance) context += `Aparência: ${c.story.appearance}\n`;
                    if (c.story?.backstory) context += `História (Resumo): ${c.story.backstory.substring(0, 300)}...\n`;
                }
                return context;
            } catch (e) {
                return "[Erro ao consultar o Salão das Fichas]";
            }
        },

        addChatMsg(sender, text) {
            const container = document.getElementById('chat-messages');
            const div = document.createElement('div');
            div.className = `msg ${sender}`;
            if (sender === 'bot') {
                let avatar = 'assets/tokens/lyra.png';
                if (ctx.currentThemeName === 'damien') avatar = 'assets/tokens/damien.png';
                if (ctx.currentThemeName === 'eldrin') avatar = 'assets/tokens/eldrin.png';

                div.innerHTML = `<img src="${avatar}" class="chat-avatar"><span class="msg-content">${parseMarkdown(text)}</span>`;
            } else {
                div.innerHTML = `<span class="msg-content">${parseMarkdown(text)}</span>`;
            }
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
    };
}
