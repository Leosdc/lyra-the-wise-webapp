/**
 * Combat Oracle - IA Contextual de Combate
 * Valida ações, narra combate e cria monstros contextuais
 */

import { db } from "../auth.js";
import { getAuth } from "firebase/auth";
import {
    collection,
    query,
    orderBy,
    getDocs,
    limit,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

const CombatOracle = {
    sessionId: null,
    sessionData: null,

    /**
     * Valida ação de um jogador baseada em texto do chat
     */
    async validateChatAction(playerId, chatText, characterData) {
        console.log(`🔮 Oracle: Validando ação do chat: "${chatText}"`);

        const text = chatText.toLowerCase().trim();

        // Detectar intenção
        let actionType = null;
        let feedback = null;

        if (text.includes('atac') || text.includes('golpe') || text.includes('acert')) {
            actionType = 'attack';

            // Verificar se especificou arma
            const hasWeapon = this.detectWeaponInText(text, characterData);
            if (!hasWeapon) {
                feedback = {
                    type: 'incomplete',
                    message: `⚠️ **${characterData.bio?.name || 'Aventureiro'}**, especifique qual arma ou ataque deseja usar!\n\n` +
                        `**Ataques disponíveis:**\n` +
                        (characterData.combat?.attacks || []).map(a => `• ${a.name} (${a.bonus >= 0 ? '+' : ''}${a.bonus})`).join('\n')
                };
            }
        } else if (text.includes('magia') || text.includes('conjur') || text.includes('lança')) {
            actionType = 'spell';

            const hasSpell = this.detectSpellInText(text, characterData);
            if (!hasSpell) {
                const preparedSpells = (characterData.spells?.list || []).filter(s => s.prepared);
                feedback = {
                    type: 'incomplete',
                    message: `⚠️ **${characterData.bio?.name || 'Aventureiro'}**, especifique qual magia deseja conjurar!\n\n` +
                        `**Magias preparadas:**\n` +
                        preparedSpells.map(s => `• ${s.name} (Nível ${s.level})`).join('\n')
                };
            }
        } else if (text.includes('fug') || text.includes('corr') || text.includes('escap')) {
            actionType = 'flee';
            feedback = {
                type: 'complete',
                action: { type: 'flee' }
            };
        } else if (text.includes('defend') || text.includes('proteg') || text.includes('esquiv')) {
            actionType = 'defend';
            feedback = {
                type: 'complete',
                action: { type: 'defend' }
            };
        } else {
            feedback = {
                type: 'unclear',
                message: `❓ **${characterData.bio?.name || 'Aventureiro'}**, não compreendi sua ação. Use o painel lateral para selecionar uma ação clara!`
            };
        }

        return feedback;
    },

    /**
     * Detecta arma no texto
     */
    detectWeaponInText(text, characterData) {
        const attacks = characterData.combat?.attacks || [];
        return attacks.some(attack =>
            text.includes(attack.name.toLowerCase())
        );
    },

    /**
     * Detecta magia no texto
     */
    detectSpellInText(text, characterData) {
        const spells = characterData.spells?.list || [];
        return spells.some(spell =>
            text.includes(spell.name.toLowerCase())
        );
    },

    /**
     * Narra uma rodada de combate
     */
    async narrateRound(combatState, actions) {
        console.log(`🔮 Oracle: Narrando rodada ${combatState.round}...`);

        try {
            // 1. Construir contexto completo
            const context = await this.buildCombatContext(combatState, actions);

            // 2. Construir prompt
            const prompt = this.buildRoundNarrationPrompt(context);

            // 3. Chamar IA
            const { callGeminiAPI } = await import('../ai.js');
            const currentUser = getAuth().currentUser;
            if (!currentUser) throw new Error("Usuário não autenticado no Atrium.");

            const token = await currentUser.getIdToken();
            const response = await callGeminiAPI(prompt, token);

            // 4. Parsear resposta
            const results = this.parseNarrationResponse(response);

            // 5. Enviar narrativa para o chat
            await this.sendNarrativeMessage(results.narrative);

            return results;

        } catch (error) {
            console.error("❌ Erro ao narrar rodada:", error);

            // Fallback: narrativa genérica
            return this.generateFallbackNarration(actions);
        }
    },

    /**
     * Constrói contexto completo do combate
     */
    async buildCombatContext(combatState, actions) {
        // Buscar histórico da sessão
        const sessionHistory = await this.getSessionHistory(combatState.sessionId);

        // Extrair dados dos personagens
        const characters = combatState.turnOrder
            .filter(p => p.type === 'player')
            .map(p => ({
                name: p.name,
                class: p.characterData?.bio?.class,
                level: p.characterData?.bio?.level,
                hp: p.hp,
                maxHp: p.maxHp,
                ac: p.ac
            }));

        // Extrair dados dos monstros
        const monsters = combatState.turnOrder
            .filter(p => p.type === 'monster')
            .map(m => ({
                name: m.name,
                hp: m.hp,
                maxHp: m.maxHp,
                ac: m.ac
            }));

        return {
            sessionHistory,
            round: combatState.round,
            characters,
            monsters,
            actions,
            previousRounds: combatState.roundHistory || []
        };
    },

    /**
     * Busca histórico da sessão
     */
    async getSessionHistory(sessionId) {
        try {
            const q = query(
                collection(db, "sessoes", sessionId, "session_messages"),
                orderBy("timestamp", "desc"),
                limit(20)
            );

            const snapshot = await getDocs(q);
            const messages = snapshot.docs
                .map(doc => doc.data())
                .reverse()
                .map(msg => `${msg.sender}: ${msg.text}`)
                .join('\n');

            return messages;
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
            return "";
        }
    },

    /**
     * Constrói prompt para narração
     */
    buildRoundNarrationPrompt(context) {
        return `Você é o Oráculo de Combate de uma sessão de RPG D&D 5e.

**CONTEXTO DA SESSÃO:**
${context.sessionHistory || 'Início da aventura'}

**RODADA ${context.round} - COMBATENTES:**

**Heróis:**
${context.characters.map(c => `• ${c.name} (${c.class} Nível ${c.level}) - HP: ${c.hp}/${c.maxHp}, CA: ${c.ac}`).join('\n')}

**Adversários:**
${context.monsters.map(m => `• ${m.name} - HP: ${m.hp}/${m.maxHp}, CA: ${m.ac}`).join('\n')}

**AÇÕES DOS JOGADORES:**
${context.actions.map(a => {
            let desc = `• ${a.actorName} `;
            if (a.type === 'attack') {
                desc += `ataca ${a.target} com ${a.weapon?.name || 'ataque desarmado'}`;
            } else if (a.type === 'spell') {
                desc += `conjura ${a.spell?.name} em ${a.target}`;
            } else if (a.type === 'item') {
                desc += `usa ${a.item?.name}`;
            } else if (a.type === 'flee') {
                desc += `tenta fugir`;
            } else if (a.type === 'defend') {
                desc += `assume postura defensiva`;
            }
            return desc;
        }).join('\n')}

**TAREFA:**
1. Narre os resultados de cada ação de forma épica e cinematográfica
2. Para cada ataque, role 1d20 e compare com a CA do alvo
3. Se acertar, role o dano apropriado
4. Descreva as reações dos monstros
5. Mantenha coerência com a história da sessão

**FORMATO DE RESPOSTA (JSON):**
{
  "narrative": "Narrativa épica e detalhada aqui...",
  "results": [
    {
      "actorId": "id_do_atacante",
      "targetId": "id_do_alvo",
      "hit": true/false,
      "damage": número,
      "critical": true/false,
      "description": "Descrição breve do resultado"
    }
  ]
}

**IMPORTANTE:** 
- Seja épico e cinematográfico
- Mantenha o tom da narrativa da sessão
- Descreva sons, movimentos e emoções
- Retorne APENAS o JSON, sem texto adicional`;
    },

    /**
     * Parseia resposta da IA
     */
    parseNarrationResponse(response) {
        try {
            // Tentar extrair JSON da resposta
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error("Erro ao parsear resposta:", error);
        }

        // Fallback: usar resposta como narrativa
        return {
            narrative: response,
            results: []
        };
    },

    /**
     * Gera narrativa de fallback
     */
    generateFallbackNarration(actions) {
        const narrative = actions.map(a => {
            const roll = Math.floor(Math.random() * 20) + 1;
            const damage = Math.floor(Math.random() * 8) + 1;
            const hit = roll >= 12; // CA média

            let desc = `${a.actorName} `;
            if (a.type === 'attack') {
                desc += hit
                    ? `acerta ${a.target} com ${a.weapon?.name}, causando ${damage} de dano!`
                    : `erra o ataque em ${a.target}.`;
            }

            return {
                description: desc,
                actorId: a.actorId,
                targetId: a.target,
                hit,
                damage: hit ? damage : 0
            };
        });

        return {
            narrative: narrative.map(n => n.description).join('\n'),
            results: narrative
        };
    },

    /**
     * Executa turno automático de um monstro
     */
    async executeMonsterTurn(combatState, monster) {
        console.log(`🔮 Oracle: Decidindo ação para ${monster.name}...`);

        try {
            // 1. Construir contexto simplificado para decisão
            const context = await this.buildCombatContext(combatState, []);

            const prompt = `Você é o Mestre Arcano da sessão. É o turno de **${monster.name}**.
            
**CONTEXTO:**
- Heróis: ${context.characters.map(c => `${c.name} (HP: ${c.hp}/${c.maxHp}, CA: ${c.ac})`).join(', ')}
- Sua Ficha (${monster.name}): HP: ${monster.hp}/${monster.maxHp}, CA: ${monster.ac}
- Ataques: ${monster.monsterData?.attacks?.join(', ') || 'Ataque básico'}

**TAREFA:**
1. Decida o alvo mais lógico entre: ${context.characters.map(c => `${c.name} (ID: ${context.turnOrder?.find(p => p.name === c.name)?.id || 'desconhecido'})`).join(', ')}
2. Narre a ação em PRIMEIRA PESSOA como o Mestre (ex: "Eu vejo o goblin avançar contra você...").
3. Role o ataque e dano se necessário.

**FORMATO (JSON):**
{
  "narrative": "Narrativa direta e imersiva aqui...",
  "targetId": "O ID do alvo (ex: created_... ou id do jogador)",
  "damage": número_do_dano,
  "hit": true/false
}

Retorne APENAS o JSON.`;

            const { callGeminiAPI } = await import('../ai.js');
            const { getAuth } = await import('firebase/auth');
            let token = null;

            const currentUser = getAuth().currentUser;
            if (currentUser) {
                token = await currentUser.getIdToken();
            } else {
                console.warn("⚠️ [Oracle] Usuário não autenticado pelo Auth direto.");
            }

            if (!token) throw new Error("Não autorizado: Token ausente.");

            const response = await callGeminiAPI(prompt, token);

            const result = this.parseNarrationResponse(response);

            // Enviar narrativa para o chat (Sem prefixo de sistema)
            await this.sendNarrativeMessage(result.narrative);

            return result;

        } catch (error) {
            console.error("Erro no executeMonsterTurn:", error);
            return { narrative: "O monstro rosna e avança!", damage: 0, hit: false };
        }
    },

    /**
     * Envia mensagem narrativa (Refinada para primeira pessoa)
     */
    async sendNarrativeMessage(narrative) {
        // Obter db do StageModule se disponível ou do import local
        const { db } = await import('../auth.js');
        const { collection, addDoc } = await import(
            "firebase/firestore"
        );

        // Obter sessionId do CombatEngine se this.sessionId estiver null
        const sessionId = this.sessionId || window.CombatEngine?.sessionId;

        if (!sessionId) {
            console.error("❌ [Oracle] sessionId não disponível para enviar mensagem");
            return;
        }

        await addDoc(collection(db, "sessoes", sessionId, "session_messages"), {
            type: 'oracle',
            oracleType: 'combat',
            sender: 'Mestre Arcano', // Alterado de Oráculo Arcano
            text: narrative,
        });
    },

    /**
     * Cria monstros contextuais
     */
    async createContextualMonsters(sessionData, playerCount, avgLevel) {
        console.log(`🔮 Oracle: Criando ${playerCount} monstro(s) para nível ${avgLevel}...`);

        try {
            const sessionHistory = await this.getSessionHistory(sessionData.id);
            const prompt = `Você é o Mestre Arcano da sessão. É o seu papel introduzir os perigos.
            
Crie ${playerCount} monstro(s) apropriado(s) para este momento.

**CONTEXTO DA SESSÃO:**
${sessionHistory || 'Início da aventura'}

**INFORMAÇÕES:**
- Jogadores: ${playerCount} (Nível médio: ${avgLevel})
- Sistema: D&D 5e

**TAREFA:**
Crie monstros que façam sentido narrativamente.

**FORMATO (JSON Array):**
[
  {
    "name": "Nome do Monstro",
    "hp": número,
    "ac": número,
    "dexterity": número (8-20),
    "attacks": ["Ataque 1 +bonus (dano)", "Ataque 2 +bonus (dano)"],
    "description": "Descrição breve e narrativa"
  }
]

Retorne APENAS o JSON array.`;

            // Chamar API
            const { callGeminiAPI } = await import('../ai.js');
            const { getAuth } = await import('firebase/auth');
            const currentUser = getAuth().currentUser;
            if (!currentUser) throw new Error("Usuário não autenticado.");

            const token = await currentUser.getIdToken();
            const response = await callGeminiAPI(prompt, token);

            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

        } catch (error) {
            console.error("❌ Erro ao criar monstros:", error);
        }

        return this.createGenericMonsters(playerCount, avgLevel);
    },

    /**
     * Cria monstros genéricos (Fallback)
     */
    createGenericMonsters(count, avgLevel) {
        const monsters = [];
        const cr = Math.max(1, Math.floor(avgLevel / 2));
        const monsterTypes = ['Goblin', 'Orc', 'Esqueleto', 'Zumbi', 'Bandido'];

        for (let i = 0; i < count; i++) {
            const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
            monsters.push({
                name: `${type} ${i + 1}`,
                hp: 10 + (cr * 5),
                ac: 10 + cr,
                dexterity: 12,
                attacks: [`Ataque Corpo a Corpo +${cr} (1d6+${cr})`],
                description: `Um ${type.toLowerCase()} hostil`
            });
        }
        return monsters;
    },

    /**
     * Narra fim do combate
     */
    async narrateCombatEnd(combatState, winner) {
        console.log(`🔮 Oracle: Narrando fim do combate...`);

        try {
            const context = await this.buildCombatContext(combatState, []);
            const prompt = `Você é o Mestre Arcano. Narre o desfecho épico deste combate em PRIMEIRA PESSOA.
            
**RESULTADO:** ${winner === 'players' ? 'Vitória dos heróis' : 'Derrota dos heróis'}`;

            const { callGeminiAPI } = await import('../ai.js');
            const token = await window.app.user.getIdToken();
            const narrative = await callGeminiAPI(prompt, token);
            await this.sendNarrativeMessage(narrative);
        } catch (error) {
            await this.sendNarrativeMessage(winner === 'players' ? "Os heróis triunfaram!" : "A escuridão prevaleceu...");
        }
    },
};

window.CombatOracle = CombatOracle;
export default CombatOracle;
