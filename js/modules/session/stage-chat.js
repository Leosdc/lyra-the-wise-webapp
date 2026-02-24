/**
 * Stage Chat Sub-Module
 * Handles chat sending, message rendering, narrative editor, and inline content clicks.
 */

import { logger } from "../../logger.js";
import { escapeHTML } from "../utils.js";
import { db } from "../../auth.js";
import {
    doc, collection, addDoc, serverTimestamp, updateDoc, getDocs, query, orderBy, limit, where
} from "firebase/firestore";
import { extendSessionStory } from "../../ai.js";
import ContentParser from "../content-parser.js";
import RollRequestModule from "../roll-request.js";

const COLLECTIONS = {
    SESSIONS: "sessoes",
    MESSAGES: "session_messages",
    CHARACTERS: "fichas"
};

/**
 * Returns chat-related methods to be mixed into StageModule.
 * `ctx` is the StageModule reference (bound at mixin time).
 */
export function createChatMixin(ctx) {
    return {
        async sendChat() {
            if (!ctx.isGM && !ctx.characterData) {
                ctx.showCharacterSelection();
                return;
            }

            const input = document.getElementById('chat-input');
            const text = input.value.trim();
            if (!text) return;

            // --- COMMAND INTERCEPTOR ---
            if (text.startsWith('/')) {
                const parts = text.split(' ');
                const cmd = parts[0].toLowerCase();
                const args = text.slice(cmd.length).trim();

                if (cmd === '/r' || cmd === '/roll') {
                    input.value = '';
                    ctx.rollDice(args || '1d20');
                    return;
                }
            }

            try {
                const chatRef = collection(db, COLLECTIONS.SESSIONS, ctx.sessionId, COLLECTIONS.MESSAGES);
                await addDoc(chatRef, {
                    text,
                    senderId: ctx.user.uid,
                    senderNickname: (ctx.characterData?.bio?.name) || ctx.user.displayName || "Viajante",
                    role: ctx.isGM ? "gm" : "player",
                    chapterIndex: Number(ctx.currentChapterIdx || 0),
                    timestamp: serverTimestamp()
                });
                input.value = '';

                // AUTONOMOUS ORACLE: Reactive response if session is in Oracle mode
                if (ctx.activeSession?.mode === 'oracle' && !ctx.activeSession.combatActive) {
                    const canProceed = await ctx.checkIfAllPlayersReadyForOracle();

                    if (canProceed) {
                        ctx.addSystemMessage('<i class="fas fa-wand-magic-sparkles"></i> Todos se manifestaram. O Mestre está tecendo o destino...');
                        const { default: OracleModule } = await import('../oracle.js');
                        OracleModule.sessionId = ctx.sessionId;
                        OracleModule.sessionData = ctx.activeSession;
                        OracleModule.extendNarrative();
                    }
                }
            } catch (err) {
                logger.error("Erro ao enviar mensagem:", err);
            }
        },

        async checkIfAllPlayersReadyForOracle() {
            try {
                const qInvites = query(
                    collection(db, "session_invites"),
                    where("sessionId", "==", ctx.sessionId),
                    where("status", "==", "online")
                );
                const snapshotInvites = await getDocs(qInvites);
                const onlineCount = snapshotInvites.size;
                if (onlineCount <= 0) return false;

                const qMessages = query(
                    collection(db, COLLECTIONS.SESSIONS, ctx.sessionId, COLLECTIONS.MESSAGES),
                    orderBy("timestamp", "desc"),
                    limit(50)
                );
                const msgSnap = await getDocs(qMessages);
                const messages = msgSnap.docs
                    .map(d => d.data())
                    .filter(m => m.chapterIndex === ctx.currentChapterIdx);

                const lastOracleIdx = messages.findIndex(m => m.role === 'gm' || m.type === 'oracle');
                const messagesAfterOracle = lastOracleIdx === -1 ? messages : messages.slice(0, lastOracleIdx);

                const gmId = ctx.activeSession.userId;
                const playersWhoSpoke = new Set(
                    messagesAfterOracle
                        .filter(m => m.senderId !== gmId && m.role !== 'gm')
                        .map(m => m.senderId)
                );

                const realPlayerInvites = snapshotInvites.docs.filter(d => {
                    const data = d.data();
                    return data.uid !== gmId && !data.isGM;
                });
                const requiredCount = realPlayerInvites.length;

                return playersWhoSpoke.size >= requiredCount && requiredCount > 0;
            } catch (err) {
                logger.error("Erro no NarrativeSync:", err);
                return false;
            }
        },

        async renderMessages(messages) {
            if (!ctx.activeSession) {
                logger.debug("[Stage] Ignorando renderMessages: activeSession ainda não carregada.");
                return;
            }
            const chatContainer = document.getElementById('session-messages');
            const narrativeBoard = document.getElementById('narrative-text');
            if (!chatContainer || !narrativeBoard) return;

            const chatMsgs = [];
            const narrativeMsgs = [];

            const chapterIndex = Number(ctx.currentChapterIdx || 0);

            const hasTimeline = ctx.activeSession.fullTimeline && Array.isArray(ctx.activeSession.fullTimeline);
            const chapter = (hasTimeline && ctx.activeSession.fullTimeline[chapterIndex]) ? ctx.activeSession.fullTimeline[chapterIndex] : ctx.activeSession;

            let introText = (chapter.summary || chapter.description || "").trim();

            if (!introText && chapterIndex === 0) {
                introText = (ctx.activeSession.story || "").trim();
            }

            logger.debug(`[Stage:Render] Renderizando Capítulo: ${chapterIndex}, Intro Detectada: ${!!introText}`);

            const hasStoryInHistory = messages.some(m =>
                (m.type === 'oracle' || m.oracleType === 'initialize') &&
                (m.text || '').trim() === introText.trim()
            );

            if (!hasStoryInHistory && introText) {
                narrativeMsgs.push({
                    type: 'oracle',
                    oracleType: 'initialize',
                    sender: 'Oráculo Arcano',
                    text: introText,
                    timestamp: ctx.activeSession.startedAt || { toDate: () => new Date() },
                    chapterTitle: chapter.title || (chapterIndex === 0 ? "Início da Saga" : `Capítulo ${chapterIndex + 1}`)
                });
            }

            messages.forEach(msg => {
                const isOracle = msg.type === 'oracle' || msg.oracleType || msg.sender === 'Oráculo Arcano';
                const isSystem = msg.type === 'system' || msg.role === 'system' || msg.senderId === 'system' || msg.type === 'roll_request' || msg.sender === 'Sistema de Combate' || msg.sender === 'Legado Arcano';
                const isCombat = msg.type === 'combat' || msg.type === 'narrative_action';

                if (isOracle || isSystem || isCombat) {
                    const isRedundantIntro = msg.oracleType === 'initialize' && narrativeMsgs.some(n => n.oracleType === 'initialize' && n.text === msg.text);
                    if (!isRedundantIntro) {
                        narrativeMsgs.push(msg);
                    }
                } else {
                    chatMsgs.push(msg);
                }
            });

            // 1. Render Chat (Sidebar)
            chatContainer.innerHTML = chatMsgs.map(msg => ctx.formatChatMessage(msg)).join('');
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // Collect known names for auto-linking
            const knownNames = [];
            if (ctx.participantsNames) {
                ctx.participantsNames.forEach(name => knownNames.push(name));
            }
            if (ctx.characterData?.bio?.name && !knownNames.includes(ctx.characterData.bio.name)) {
                knownNames.push(ctx.characterData.bio.name);
            }
            if (ctx.activeSession?.linked_npcs) {
                ctx.activeSession.linked_npcs.forEach(n => knownNames.push(n.name || n.title));
            }
            if (ctx.activeSession?.sessionNPCs) {
                ctx.activeSession.sessionNPCs.forEach(n => knownNames.push(n.name));
            }

            // 2. Render Narrative (Center)
            const narrativeHTML = narrativeMsgs.map(msg => {
                const isSummary = msg.oracleType === 'summary';
                const isIntro = msg.oracleType === 'initialize';
                const msgText = (msg.text || msg.message || '').trim();
                const decoratedText = (msg.isRawHTML || !ContentParser.decorateText) ? msgText : ContentParser.decorateText(msgText, knownNames);

                let rollCardHTML = '';
                if (msg.type === 'roll_request' || msg.rollRequest) {
                    rollCardHTML = RollRequestModule.renderRollRequestCard(msg);
                }

                if (isIntro || isSummary) {
                    const title = escapeHTML(msg.chapterTitle || (isSummary ? "Resumo do Oráculo" : "Ecos do Destino"));
                    return `<div class="chat-msg oracle-msg oracle-summary"><div class="narrative-parchment-flow"><div class="parchment-header"><span class="chapter-marker">${isIntro ? 'Manifestação' : 'Recapitulação'}</span><h2 class="chapter-title">${title}</h2></div><div class="parchment-body">${decoratedText}</div></div><div class="narrative-divider-mystic"><i class="fas fa-feather-alt"></i><span>E assim se escreve...</span><i class="fas fa-feather-alt"></i></div></div>`;
                }

                const isRollReq = msg.type === 'roll_request' || msg.rollRequest;
                const content = isRollReq ? rollCardHTML : `${decoratedText}${rollCardHTML}`;

                return `<div class="narrative-bubble narrative-text-animate"><div class="bubble-header"><i class="fas fa-feather-pointed"></i><span>${ctx.formatTime(msg.timestamp)}</span></div><div class="bubble-text">${content}</div></div>`;
            }).join('');

            if (narrativeBoard.innerHTML !== narrativeHTML) {
                narrativeBoard.innerHTML = narrativeHTML;
                narrativeBoard.scrollTop = narrativeBoard.scrollHeight;
            }
        },

        formatChatMessage(msg) {
            const timeStr = ctx.formatTime(msg.timestamp);
            const isGM = msg.role === 'gm';
            const isSystem = msg.role === 'system';

            let sender = msg.senderNickname || msg.sender || 'Desconhecido';
            if (isGM) sender = "Mestre";

            const text = msg.text || msg.message || '';
            const isLocal = msg.senderId === ctx.user.uid;

            return `
                <div class="chat-msg ${isGM ? 'gm-msg' : ''} ${isSystem ? 'system-msg' : ''} ${isLocal ? 'local-msg' : ''}">
                    <span class="msg-sender">${escapeHTML(sender)} ${isLocal ? '(Você)' : ''}</span>
                    <span class="msg-text">${(isSystem || sender === 'Oráculo' || sender === 'Oráculo Arcano' || sender === 'Sistema de Combate') ? text : escapeHTML(text)}</span>
                    <span class="msg-time">${timeStr}</span>
                </div>
            `;
        },

        formatTime(timestamp) {
            if (!timestamp) return "";
            if (timestamp.toDate) return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return "";
        },

        injectManualNarrativeEditor() {
            const mainArea = document.querySelector('.stage-main');
            if (!mainArea || document.getElementById('gm-narrative-editor')) return;

            const chapterIdx = ctx.currentChapterIdx;

            let initialText = '';
            if (ctx.activeSession && ctx.activeSession.fullTimeline && ctx.activeSession.fullTimeline[chapterIdx]) {
                initialText = ctx.activeSession.fullTimeline[chapterIdx].story || '';
            }

            if (!initialText && chapterIdx === 0) {
                initialText = ctx.activeSession?.story || '';
            }

            const editor = document.createElement('div');
            editor.id = 'gm-narrative-editor';
            editor.className = 'gm-narrative-panel';
            editor.innerHTML = `
                <h4 class="medieval-header-sml"><i class="fas fa-feather-pointed"></i> Tecendo o Destino (Notas & IA)</h4>
                <div class="gm-input-group">
                    <textarea id="gm-narrative-input" placeholder="Escreva aqui a continuação da história ou suas anotações...">${initialText}</textarea>
                    <button class="gold-btn-chat" id="btn-gm-send-story" title="Enviar para o Chat">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="gm-narrative-actions">
                    <button class="medieval-btn btn-magic-enhance full-width" onclick="StageModule.enhanceNarrativeNotes()">
                        <i class="fas fa-wand-magic-sparkles"></i> Melhorar com Magia
                    </button>
                </div>
            `;

            mainArea.appendChild(editor);

            const textarea = editor.querySelector('textarea');
            const sendBtn = editor.querySelector('#btn-gm-send-story');

            const sendMessage = async () => {
                const text = textarea.value.trim();
                if (!text) return;

                try {
                    const chatRef = collection(db, COLLECTIONS.SESSIONS, ctx.sessionId, COLLECTIONS.MESSAGES);
                    await addDoc(chatRef, {
                        text: text,
                        sender: "Mestre",
                        senderId: ctx.user.uid,
                        timestamp: serverTimestamp(),
                        role: "system",
                        type: "system",
                        chapterIndex: Number(ctx.currentChapterIdx || 0),
                        photoURL: ctx.user.photoURL || null
                    });

                    textarea.value = '';

                    const originalIcon = sendBtn.innerHTML;
                    sendBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => sendBtn.innerHTML = originalIcon, 1000);
                } catch (error) {
                    logger.error("Error sending GM message:", error);
                    alert("Erro ao enviar mensagem.");
                }
            };

            sendBtn.addEventListener('click', sendMessage);

            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        },

        async enhanceNarrativeNotes() {
            const textarea = document.getElementById('gm-narrative-input');
            if (!textarea) return;

            const text = textarea.value.trim();
            if (!text) {
                ctx.showMysticAlert("Escreva algumas sementes de ideias antes de pedir a benção do Oráculo.", "Vazio de Inspiração");
                return;
            }

            const originalHtml = document.querySelector('.btn-magic-enhance').innerHTML;
            document.querySelector('.btn-magic-enhance').innerHTML = `<i class="fas fa-spinner fa-spin"></i> Tecendo...`;
            document.querySelector('.btn-magic-enhance').disabled = true;

            try {
                const prompt = `Você é o Oráculo Arcano. Melhore e torne mais épico o seguinte parágrafo de narração ou anotação para um RPG de fantasia, mantendo o sentido original, mas usando um vocabulário rico e imersivo.
                
                TEXTOR ORIGINAL:
                "${text}"
                
                RETORNE APENAS O TEXTO MELHORADO, SEM TÍTULOS OU COMENTÁRIOS ADICIONAIS.`;

                const { callGeminiAPI } = await import('../../ai.js');
                const token = await ctx.user.getIdToken();
                const enhanced = await callGeminiAPI(prompt, token);

                if (enhanced) {
                    textarea.value = enhanced.trim();
                    ctx.showMysticAlert("O Oráculo abençoou suas palavras.", "Magia Concluída");
                }
            } catch (err) {
                logger.error("Erro ao melhorar notas:", err);
                ctx.showMysticAlert("A conexão com o plano das ideias falhou.");
            } finally {
                document.querySelector('.btn-magic-enhance').innerHTML = originalHtml;
                document.querySelector('.btn-magic-enhance').disabled = false;
            }
        },

        async updateSessionStory() {
            const input = document.getElementById('gm-narrative-input');
            if (!input) return;
            const text = input.value.trim();
            if (!text) return;

            try {
                const params = new URLSearchParams(window.location.search);
                const chapterIdx = parseInt(params.get('chapter') || '0', 10);

                const sessionRef = doc(db, COLLECTIONS.SESSIONS, ctx.sessionId);

                let updates = {
                    story: text,
                    updatedAt: serverTimestamp()
                };

                if (ctx.activeSession && ctx.activeSession.fullTimeline) {
                    const newTimeline = [...ctx.activeSession.fullTimeline];
                    if (newTimeline[chapterIdx]) {
                        newTimeline[chapterIdx].story = text;
                        updates.fullTimeline = newTimeline;
                    }
                }

                if (chapterIdx !== 0) {
                    delete updates.story;
                }

                await updateDoc(sessionRef, updates);
                logger.info("[Stage] Notas da sessão salvas.");
            } catch (err) {
                logger.error("Erro ao atualizar história:", err);
            }
        },

        async handleInlineItemClick(data) {
            const { name, desc, props } = data;

            const confirm = await ctx.showMysticAlert(`
                <div class="inline-preview">
                    <i class="fas fa-gem fa-2x" style="color:var(--gold); margin-bottom:10px;"></i>
                    <h3>${escapeHTML(name)}</h3>
                    <p><em>${escapeHTML(props)}</em></p>
                    <div class="preview-desc">${escapeHTML(desc)}</div>
                    <div style="margin-top:15px; font-size:0.9rem; opacity:0.8;">Deseja manifestar este item em sua mochila?</div>
                </div>
            `, "Tesouro Encontrado", true);

            if (confirm && ctx.characterData) {
                try {
                    const newItem = {
                        name,
                        description: desc,
                        properties: props,
                        rarity: "Comum",
                        weight: 1,
                        quantity: 1,
                        type: "Item"
                    };

                    const charRef = doc(db, "fichas", ctx.characterData.id);
                    const updatedInventory = { ...(ctx.characterData.inventory || { items: [] }) };
                    updatedInventory.items = [...(updatedInventory.items || []), newItem];

                    await updateDoc(charRef, { inventory: updatedInventory });
                    ctx.showMysticAlert(`${name} foi adicionado à sua mochila.`, "Item Equipado");
                } catch (err) {
                    logger.error("Erro ao equipar item:", err);
                    ctx.showMysticAlert("Falha ao materializar item.");
                }
            }
        },

        async handleInlineNPCClick(data) {
            const { name, race, desc } = data;

            ctx.showMysticAlert(`
                <div class="inline-preview">
                    <i class="fas fa-user-shield fa-2x" style="color:var(--gold); margin-bottom:10px;"></i>
                    <h3>${escapeHTML(name)}</h3>
                    <p><strong>${escapeHTML(race)}</strong></p>
                    <div class="preview-desc">${escapeHTML(desc)}</div>
                </div>
            `, "Registro de Encontro");
        },

        async handleInlineMonsterClick(dataset) {
            const { name, details } = dataset;

            await ctx.showMysticAlert(`
                <div class="inline-preview">
                    <i class="fas fa-dragon fa-2x" style="color:var(--gold); margin-bottom:10px;"></i>
                    <h3>${escapeHTML(name)}</h3>
                    <div class="preview-desc">${escapeHTML(details)}</div>
                </div>
            `, "Conhecimento de Criatura");
        },

        async addSystemMessage(text) {
            try {
                const chatRef = collection(db, COLLECTIONS.SESSIONS, ctx.sessionId, COLLECTIONS.MESSAGES);
                await addDoc(chatRef, {
                    text,
                    senderId: "system",
                    senderNickname: "Legado Arcano",
                    role: "system",
                    chapterIndex: Number(ctx.currentChapterIdx || 0),
                    timestamp: serverTimestamp()
                });
            } catch (err) {
                console.error("Erro ao enviar mensagem de sistema:", err);
            }
        }
    };
}
