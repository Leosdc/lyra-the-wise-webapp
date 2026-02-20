/**
 * Oracle Module - Arcane Session Narrator
 * Handles all mystical interactions for Oracle mode sessions
 */

import { db } from "../auth.js";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
    orderBy,
    limit
} from "firebase/firestore";
import { getCharacter } from "../data.js";
import { escapeHTML } from "./utils.js";

// Arcane Proxy Configuration
const AI_PROXY_URL = "/api/ai";

const callProxy = async (payload) => {
    // Note: Local backend uses application/json and simplified payload
    try {
        const { getToken } = await import('../auth.js');
        const appCheckToken = await getToken();

        const response = await fetch(AI_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Firebase-AppCheck': appCheckToken || ''
            },
            body: JSON.stringify({
                message: payload.message || "",
                history: payload.history || [],
                systemInstruction: payload.systemInstruction || ""
            })
        });

        if (!response.ok) throw new Error(`Oracle Error: ${response.statusText}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);
        return data;
    } catch (error) {
        throw error;
    }
};

const OracleModule = {
    sessionId: null,
    sessionData: null,

    async initializeOracle(sessionId, sessionData) {
        this.sessionId = sessionId;
        this.sessionData = sessionData;

        console.log("🔮 Oracle: Inicializando modo Oráculo...");

        try {
            // 1. Build comprehensive session context
            const context = await this.buildSessionContext();

            // 2. Call Oracle for initial scene setting
            const response = await this.callAI({
                type: 'initialize',
                context: context
            });

            // 3. Display in narrative area
            await this.displayOracleMessage(response, 'narrative');

            console.log("✅ Oracle: Inicialização completa");
        } catch (error) {
            console.error("❌ Erro na inicialização do Oráculo:", error);

            // Display user-friendly error message
            const errorMsg = error.message || "Erro desconhecido ao conectar com o Oráculo";
            await this.displayOracleMessage(
                `**O Oráculo falhou em conectar os pontos:** ${errorMsg}\n\nPor favor, verifique sua conexão e tente novamente.`,
                'error'
            );

            throw error; // Re-throw so caller knows it failed
        }
    },

    async buildSessionContext() {
        console.log("📚 Oracle: Coletando contexto da sessão...");

        // Get all player characters
        const players = await this.getPlayerCharacters();

        // Get linked content
        const npcs = this.sessionData.linked_npcs || [];
        const items = this.sessionData.linked_items || [];
        const monsters = this.sessionData.linked_monsters || [];
        const encounters = this.sessionData.linked_encounters || [];
        const campaigns = this.sessionData.linked_campaigns || [];
        const plots = this.sessionData.linked_plots || [];
        const scenes = this.sessionData.linked_scenes || [];

        // Enhanced Context from Session Data (Timeline, Atmosphere, etc.)
        const currentSessionIdx = (this.sessionData.session || 1) - 1;
        const timeline = this.sessionData.fullTimeline || [];
        const currentChapter = timeline[currentSessionIdx] || {};

        return {
            story: this.sessionData.story || '',
            title: this.sessionData.title || 'Aventura sem nome',
            // New Rich Context
            atmosphere: this.sessionData.atmosphere || "Normal",
            climax: this.sessionData.climax || "",
            encounters: this.sessionData.encounters || currentChapter.encounters || "",
            current_chapter_summary: currentChapter.summary || this.sessionData.summary || "",
            current_chapter_title: currentChapter.title || "",

            system: this.sessionData.systemId || 'dnd5e',
            players: players,
            npcs: npcs,
            items: items,
            monsters: monsters,
            // ... keep existing
            campaigns: campaigns,
            plots: plots,
            scenes: scenes
        };
    },

    async getPlayerCharacters() {
        const players = [];

        try {
            const q = query(
                collection(db, "session_invites"),
                where("sessionId", "==", this.sessionId)
            );

            const snapshot = await getDocs(q);

            for (const inviteDoc of snapshot.docs) {
                const invite = inviteDoc.data();

                if (invite.characterId) {
                    const char = await getCharacter(invite.characterId);
                    if (char) {
                        players.push({
                            name: char.bio?.name || 'Desconhecido',
                            race: char.bio?.race || 'Desconhecida',
                            class: char.bio?.class || 'Desconhecida',
                            level: char.bio?.level || 1,
                            background: char.bio?.background || '',
                            stats: char.stats || {},
                            skills: char.skills || {},
                            inventory: char.inventory || [],
                            spells: char.spellbook || []
                        });
                    }
                } else {
                    // Include players who are still manifesting
                    players.push({
                        name: invite.nickname || invite.displayName || (invite.email ? invite.email.split('@')[0] : 'Explorador'),
                        status: "Manifestando sua alma (escolhendo ficha)",
                        isManifesting: true
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao coletar personagens:", error);
        }

        return players;
    },

    async getSessionHistory() {
        const allMessages = [];

        try {
            // 1. Pegar narrativas do painel central (session_messages subcollection)
            const narrativeQuery = query(
                collection(db, "sessoes", this.sessionId, "session_messages"),
                orderBy("timestamp", "asc")
            );
            const narrativeSnap = await getDocs(narrativeQuery);
            narrativeSnap.forEach(doc => {
                const msg = doc.data();
                allMessages.push({
                    type: msg.type || 'oracle',
                    sender: msg.sender || 'Oráculo',
                    text: msg.text || '',
                    timestamp: msg.timestamp
                });
            });

            // 2. Pegar mensagens do chat (session_messages subcollection)
            const chatQuery = query(
                collection(db, "sessoes", this.sessionId, "session_messages"),
                orderBy("timestamp", "asc")
            );
            const chatSnap = await getDocs(chatQuery);
            chatSnap.forEach(doc => {
                const msg = doc.data();
                // Avoid duplicating oracle messages already fetched in step 1
                if (msg.type !== 'oracle' && msg.role !== 'gm') {
                    allMessages.push({
                        type: msg.role || 'player',
                        sender: msg.senderNickname || msg.sender || 'Jogador',
                        text: msg.text || '',
                        timestamp: msg.timestamp
                    });
                }
            });

            // 3. Ordenar tudo por timestamp
            allMessages.sort((a, b) => {
                const timeA = a.timestamp?.seconds || 0;
                const timeB = b.timestamp?.seconds || 0;
                return timeA - timeB;
            });

            console.log(`📚 Oracle: Histórico completo: ${allMessages.length} mensagens (${narrativeSnap.size} narrativas + ${chatSnap.size} chat)`);
        } catch (error) {
            console.error("Erro ao coletar histórico:", error);
        }

        return allMessages;
    },

    async callAI({ type, context, additionalPrompt = '' }) {
        const history = await this.getSessionHistory();

        let systemPrompt = this.buildSystemPrompt(context, history);
        let userPrompt = '';

        switch (type) {
            case 'initialize':
                userPrompt = `Inicie a aventura "${context.title}". ${context.story ? `História base: ${context.story}` : 'Crie uma introdução envolvente.'}\n\nNão force ações imediatas. Estabeleça a cena e permita que os jogadores decidam o que fazer.`;
                break;

            case 'extend':
                // Emphasize the trigger event
                userPrompt = `ACONTECIMENTO RECENTE: ${additionalPrompt}\n\nCom base nisso e no histórico, continue a narrativa. Se for uma fala de personagem, responda diretamente a ele.`;
                break;

            case 'summary':
                userPrompt = `Crie um resumo conciso de tudo que aconteceu nesta sessão até agora. Destaque eventos importantes, decisões dos jogadores e consequências.`;
                break;

            case 'combat':
                userPrompt = `Inicie uma cena de combate apropriada para o momento atual da história. Descreva os inimigos e o ambiente de forma vívida. ${additionalPrompt}`;
                break;

            default:
                userPrompt = additionalPrompt;
        }

        try {
            // Get user token for authentication
            const { getAuth } = await import('firebase/auth');
            const user = getAuth().currentUser;
            if (!user) throw new Error("Usuário não autenticado");

            const idToken = await user.getIdToken();

            const data = await callProxy({
                message: userPrompt,
                systemInstruction: systemPrompt,
                history: []
            });

            return data.response;
        } catch (error) {
            console.error("Erro ao chamar essência:", error);
            throw new Error("O Oráculo está temporariamente indisponível: " + error.message);
        }
    },

    buildSystemPrompt(context, history) {
        const formatPlayers = (players) => {
            return players.map(p =>
                `- ${p.name} (${p.race} ${p.class}, Nível ${p.level})`
            ).join('\n');
        };

        const formatHistory = (messages) => {
            // Limit history to last 20 messages to keep context fresh and avoid token limits
            const recent = messages.slice(-20);
            return recent.map(m =>
                `[${m.type}] ${m.sender}: ${m.text}`
            ).join('\n');
        };

        const pacing = context.pacing || 'balanced';

        let pacingInstructions = '';
        switch (pacing) {
            case 'short':
                pacingInstructions = `   - RITMO RÁPIDO (ONE-SHOT): Mantenha a narrativa ágil. Avance a trama rapidamente. Corte cenas de transição longas. Leve os jogadores ao clímax.`;
                break;
            case 'long':
                pacingInstructions = `   - RITMO LENTO (IMERSIVO): Detalhe profundamente cada cena. Explore o ambiente, cheiros e sensações. Permita conversas longas entre NPCs e jogadores. Construa a tensão lentamente.`;
                break;
            default: // balanced
                pacingInstructions = `   - RITMO EQUILIBRADO: Alterne entre momentos de roleplay detalhado e ação direta. Mantenha a história fluindo, mas dê espaço para respiro.`;
        }

        return `Você é o Oráculo Arcano, mestre narrador de RPG D&D 5ª Edição.

CONTEXTO DA SESSÃO:
Título: ${context.title}
Capítulo Atual: ${context.current_chapter_title || "Não iniciado"}
Sistema: ${context.system}
Atmosfera: ${context.atmosphere || "Padrão"}
Clímax do Capítulo: ${context.climax || "Não definido"}

RESUMO DO CAPÍTULO ATUAL:
${context.current_chapter_summary || "Sem resumo disponível."}

PROVÁVEIS ENCONTROS / MONSTROS (Reference apenas se fizer sentido):
${Array.isArray(context.encounters) ? context.encounters.map(e => `- ${e.title || e.name}`).join('\n') : context.encounters || "Nenhum específico."}

JOGADORES:
${context.players.length > 0 ? formatPlayers(context.players) : 'Nenhum jogador ainda'}

NPCS VINCULADOS:
${context.npcs.length > 0 ? context.npcs.map(n => `- ${n.name || n.title}: ${n.description || ''}`).join('\n') : 'Nenhum'}

ITENS DISPONÍVEIS:
${context.items.length > 0 ? context.items.map(i => `- ${i.name || i.title}: ${i.description || ''}`).join('\n') : 'Nenhum'}

MONSTROS VINCULADOS:
${context.monsters.length > 0 ? context.monsters.map(m => `- ${m.name}: ${m.description || ''}`).join('\n') : 'Nenhum'}

ENCONTROS VINCULADOS:
${context.encounters.length > 0 ? context.encounters.map(e => `- ${e.title || e.name}: ${e.description || ''}`).join('\n') : 'Nenhum'}


REGRAS FUNDAMENTAIS DE MESTRIA:

1. PACING & INTERAÇÃO (CRÍTICO):
   - NÃO force combate imediatamente no início da aventura
   - Crie tensão gradual: apresente NPCs, faça perguntas, ofereça escolhas
${pacingInstructions}
   - Sempre que possível, TERMINE com uma pergunta ou dilema para os jogadores
   - Exemplo: "O que vocês fazem?" / "Como respondem ao pedido do ancião?"
   - Dê espaço para roleplay antes de ação

2. ROLEPLAY & NARRATIVA:
   - Crie NPCs memoráveis com personalidades distintas
   - Use diálogos diretos (não apenas descrição)
   - Apresente dilemas morais e escolhas difíceis
   - Seja descritivo e imersivo, mas NÃO force ações dos jogadores
   - Responda DIRETAMENTE às falas e ações recentes dos jogadores

3. ROLAGENS DE DADOS:
   - Quando apropriado, solicite rolagens usando: [ROLL: Percepção, todos, DC 15]
   - Formato: [ROLL: habilidade/perícia, jogadores (todos/nomes), DC número]
   - Exemplos:
     * [ROLL: Percepção, todos, DC 12]
     * [ROLL: Persuasão, Argentius, DC 15]
     * [ROLL: Destreza (Furtividade), Alincieni|Theresia, DC 18]

4. COMBATE AUTÔNOMO:
   - Use tag [COMBAT: ...] APENAS quando combate fizer sentido narrativo
   - NÃO inicie combate logo de cara - crie buildup primeiro
   - Quando inimigos atacam, use: [COMBAT: Nome Monstro1, Nome Monstro2]
   - Exemplo: "Os goblins saltam das sombras! [COMBAT: Goblin Guerreiro, Goblin Arqueiro]"
   - Use monstros vinculados quando possível
   - O sistema detectará a tag e iniciará combate automaticamente

5. FIDELIDADE D&D 5e:
   - Mantenha fidelidade total às regras de D&D 5e
   - Use dados e mecânicas quando apropriado
   - Use NPCs, itens e monstros vinculados quando apropriado
   - Você PODE criar novos NPCs, itens e monstros se necessário

6. CRIAÇÃO DE CONTEÚDO (MUITO IMPORTANTE):
   - SEMPRE que citar um item novo ou importante: [ITEM: Nome | Descrição | Propriedades]
   - SEMPRE que citar um NPC novo ou importante: [NPC: Nome | Raça/Tipo | Descrição]
   - Ao descrever monstros (fora de combate): [MONSTER: Nome | Detalhes]
   - Use as tags acima mesmo para personagens jogadores se quiser dar destaque místico.
   - O Atrium Arcano transformará essas tags em botões interativos clicáveis.
   - INTEGRE OS JOGADORES NA NARRATIVA: Use os nomes dos personagens presentes para tornar a cena viva. Se um jogador disse algo, responda ou reaja a essa fala.

7. ESTILO VISUAL:
   - Use negrito (**texto**) para nomes de personagens e locais importantes.
   - Use itálico (*texto*) para pensamentos ou descrições sensoriais sutis.
   - Mantenha parágrafos curtos para facilitar a leitura no Atrium.
   - NÃO use cabeçalhos (#) ou listas complexas em excesso. Atente-se ao espaçamento.

8. FOCO NARRATIVO:
   - IGNORE conversas casuais (chatter) no histórico que não contribuam para a história.
   - FOQUE em AÇÕES e DIÁLOGOS de personagens que mudam a cena ou buscam informações.
   - PRIORIZE "Ações do Herói" e rolagens de dados como motores da trama.

9. REGRA DO VÉU (IMERSÃO ABSOLUTA):
   - PROIBIDO: Citar locais, cidades (Porto Alegre, NYC, Londres), pessoas ou tecnologias do Mundo Real.
   - Sua única realidade é a Fantasia Medieval Épica. Se forçar modernidade, trate como um delírio arcano do personagem.

Responda sempre em português brasileiro, com narrativa rica e envolvente. LEMBRE-SE: Priorize interação e roleplay sobre combate imediato.`;
    },

    async displayOracleMessage(text, oracleType = 'narrative') {
        // CRITICAL: Process special tags BEFORE displaying
        let processedText = text;

        // 1. Process [COMBAT: ...] tag
        const combatMatch = text.match(/\[COMBAT:\s*([^\]]+)\]/i);
        if (combatMatch) {
            const monsterNames = combatMatch[1].split(',').map(n => n.trim());
            console.log(`⚔️ Oracle: Detectou tag de combate com: ${monsterNames.join(', ')}`);

            // Remove tag from text
            processedText = processedText.replace(combatMatch[0], '').trim();

            // Initiate combat asynchronously (don't await to avoid blocking message display)
            this.initiateCombat(monsterNames).catch(err => {
                console.error("Erro ao iniciar combate:", err);
            });
        }

        // 2. Process [ROLL: ...] tag
        const rollMatch = text.match(/\[ROLL:\s*([^,]+),\s*([^,]+),\s*DC\s*(\d+)\]/i);
        if (rollMatch) {
            const [_, skillName, targets, dc] = rollMatch;
            console.log(`🎲 Oracle: Detectou solicitação de rolagem: ${skillName} (DC ${dc}) para ${targets}`);

            // Remove tag from text
            processedText = processedText.replace(rollMatch[0], '').trim();

            // Request roll asynchronously
            this.requestRoll(skillName.trim(), targets.trim(), parseInt(dc)).catch(err => {
                console.error("Erro ao solicitar rolagem:", err);
            });
        }

        // Parse for items and NPCs
        const { default: ContentParser } = await import('./content-parser.js');
        const { items, npcs } = ContentParser.parseOracleResponse(processedText, this.sessionId);

        // Save to database (Correct subcollection path)
        const messagesRef = collection(db, "sessoes", this.sessionId, "session_messages");
        await addDoc(messagesRef, {
            sessionId: this.sessionId,
            type: 'oracle',
            oracleType: oracleType,
            sender: 'Oráculo Arcano',
            text: processedText, // Use processed text without tags
            timestamp: serverTimestamp(),
            containsItems: items.length > 0,
            containsNPCs: npcs.length > 0
        });

        // Sync to Narrative Board Logic
        // We ONLY update the root 'story' field if this is the INITIALIZATION msg
        // This preserves the Intro Bubble constant, while new messages flow into the history
        if (oracleType === 'initialize') {
            try {
                const sessionRef = doc(db, "sessoes", this.sessionId);
                await updateDoc(sessionRef, {
                    story: text,
                    lastUpdated: serverTimestamp()
                });
                console.log("🔮 Oracle: História base definida.");
            } catch (err) {
                console.error("Erro ao definir história base:", err);
            }
        }

        // Log what was found
        if (items.length > 0) {
            console.log(`📦 Oracle criou ${items.length} itens:`, items.map(i => i.name));
        }
        if (npcs.length > 0) {
            console.log(`👥 Oracle criou ${npcs.length} NPCs:`, npcs.map(n => n.name));
        }

        console.log(`🔮 Oracle (${oracleType}):`, text);
    },

    async extendNarrative(additionalContext = '') {
        // Ensure we have session context
        if (!this.sessionId) {
            throw new Error("Oracle não foi inicializado com sessionId");
        }

        // Refresh session data
        const sessionRef = doc(db, "sessoes", this.sessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (sessionSnap.exists()) {
            this.sessionData = sessionSnap.data();
        }

        const context = await this.buildSessionContext();
        const response = await this.callAI({
            type: 'extend',
            context: context,
            additionalPrompt: additionalContext
        });

        await this.displayOracleMessage(response, 'narrative');
        return response;
    },

    async generateSummary() {
        // Ensure we have session context
        if (!this.sessionId) {
            throw new Error("Oracle não foi inicializado com sessionId");
        }

        // Refresh session data
        const sessionRef = doc(db, "sessoes", this.sessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (sessionSnap.exists()) {
            this.sessionData = sessionSnap.data();
        }

        const context = await this.buildSessionContext();
        const response = await this.callAI({
            type: 'summary',
            context: context
        });

        await this.displayOracleMessage(response, 'summary');
        return response;
    },

    async createCombatNarrative() {
        const context = await this.buildSessionContext();
        const response = await this.callAI({
            type: 'combat',
            context: context
        });

        await this.displayOracleMessage(response, 'combat');
        return response;
    },

    async initiateCombat(monsterNames) {
        console.log(`⚔️ Oracle: Iniciando combate com: ${monsterNames.join(', ')}`);

        try {
            // 1. Fetch monsters from Firestore
            const monsters = await this.fetchMonsters(monsterNames);

            if (monsters.length === 0) {
                console.warn("⚠️ Nenhum monstro encontrado no bestiário");
                return;
            }

            // 2. Start combat via CombatOracleModule
            const { default: CombatOracleModule } = await import('./combat-oracle.js');
            await CombatOracleModule.startCombat(this.sessionId, monsters);

            console.log(`✅ Combate iniciado com ${monsters.length} monstros`);
        } catch (error) {
            console.error("❌ Erro ao iniciar combate:", error);
        }
    },

    async fetchMonsters(monsterNames) {
        const monsters = [];
        const { generateMonster } = await import('../ai.js');

        for (const name of monsterNames) {
            try {
                // Search in monsters collection
                const q = query(
                    collection(db, "monstros"),
                    where("nome", "==", name),
                    limit(1)
                );

                const snap = await getDocs(q);

                if (!snap.empty) {
                    const monsterData = { id: snap.docs[0].id, ...snap.docs[0].data() };
                    monsters.push(monsterData);
                    console.log(`✅ Monstro encontrado: ${name}`);
                } else {
                    console.warn(`⚠️ Monstro não encontrado no bestiário: ${name}. Gerando via Oráculo...`);

                    // FALLBACK: Generate monster dynamically if missing
                    const newMonster = await generateMonster(name, this.sessionData.systemId || 'dnd5e');
                    if (newMonster) {
                        // Save to "Meus Monstros" (monstros collection) for future use
                        const user = window.app?.user;
                        if (user) {
                            const newDoc = await addDoc(collection(db, "monstros"), {
                                ...newMonster,
                                userId: user.uid,
                                isAI: true,
                                createdAt: serverTimestamp()
                            });
                            monsters.push({ id: newDoc.id, ...newMonster });
                            console.log(`✨ Monstro gerado e salvo: ${name}`);
                        } else {
                            // Temporary monster for combat if not logged in (unlikely)
                            monsters.push({ id: 'temp-' + Date.now(), ...newMonster });
                        }
                    }
                }
            } catch (error) {
                console.error(`Erro ao buscar/gerar monstro ${name}:`, error);
            }
        }

        return monsters;
    },

    async requestRoll(skillName, targets, dc) {
        console.log(`🎲 Oracle: Solicitando rolagem de ${skillName} (DC ${dc}) para ${targets}`);

        try {
            // Add system message to chat
            const messagesRef = collection(db, "sessoes", this.sessionId, "session_messages");
            await addDoc(messagesRef, {
                sessionId: this.sessionId,
                type: 'system',
                sender: 'Sistema',
                text: `<i class="fas fa-dice-d20"></i> **Rolagem Solicitada:** ${escapeHTML(skillName)} (DC ${escapeHTML(String(dc))}) - Jogadores: ${escapeHTML(targets)}`,
                timestamp: serverTimestamp(),
                rollRequest: {
                    skill: skillName,
                    targets: targets,
                    dc: dc
                }
            });

            console.log("✅ Solicitação de rolagem enviada ao chat");

            // TODO: Implement roll request modal/panel
            // This will be implemented in a future update
        } catch (error) {
            console.error("❌ Erro ao solicitar rolagem:", error);
        }
    }
};

window.OracleModule = OracleModule;
export default OracleModule;
