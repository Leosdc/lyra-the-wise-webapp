/**
 * Combat Module - D&D 5e Combat System
 * Handles initiative, turn order, and combat actions
 */

import { db } from "../auth.js";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs
} from "firebase/firestore";
import { getCharacter } from "../data.js";
import { logger } from "../logger.js";

/**
 * @typedef {Object} CombatParticipant
 * @property {string} id
 * @property {string} name
 * @property {'player'|'monster'} type
 * @property {number} hp
 * @property {number} maxHp
 * @property {number} ac
 * @property {number} dexterity
 * @property {number} initiative - valor final (roll + mod)
 * @property {number} initiativeRoll - valor do dado
 * @property {number} dexMod - modificador de destreza
 */

const CombatModule = {
    sessionId: null,
    combatActive: false,
    turnOrder: [],
    currentTurnIndex: 0,
    round: 1,

    async startCombat(sessionId, sessionData) {
        this.sessionId = sessionId;
        logger.info("⚔️ Combat: Iniciando combate...");

        // 1. Get AI combat narrative if in oracle mode
        if (sessionData.mode === 'oracle') {
            const { default: OracleModule } = await import('./oracle.js');
            OracleModule.sessionId = sessionId;
            OracleModule.sessionData = sessionData;
            await OracleModule.createCombatNarrative();
        }

        // 2. Get monsters
        let monsters = sessionData.linked_monsters || [];

        // If no monsters and oracle mode, offer to create
        if (monsters.length === 0 && sessionData.mode === 'oracle') {
            const shouldCreate = await this.offerMonsterCreation();
            if (shouldCreate) {
                monsters = await this.generateMonstersWithAI(sessionData);
            } else {
                throw new Error("Combate cancelado - sem monstros");
            }
        }

        // 3. Get players
        const players = await this.getPlayers();

        // 4. Calculate initiative
        const participants = await this.calculateInitiative(players, monsters);

        // 5. Save combat state
        const sessionRef = doc(db, "sessoes", sessionId);
        await updateDoc(sessionRef, {
            combatActive: true,
            combatTurnOrder: participants,
            currentTurnIndex: 0,
            combatRound: 1
        });

        this.combatActive = true;
        this.turnOrder = participants;
        this.currentTurnIndex = 0;
        this.round = 1;

        // 6. Start first turn
        await this.startTurn(0);

        logger.info("✅ Combat: Combate iniciado", participants);
        return participants;
    },

    async getPlayers() {
        try {
            const q = query(
                collection(db, "session_invites"),
                where("sessionId", "==", this.sessionId)
            );

            const snapshot = await getDocs(q);

            const promises = snapshot.docs
                .map(doc => doc.data())
                .filter(invite => invite.characterId)
                .map(async (invite) => {
                    const char = await getCharacter(invite.characterId);
                    if (!char) return null;
                    return {
                        id: invite.characterId,
                        name: char.bio?.name || 'Desconhecido',
                        type: 'player',
                        hp: char.stats?.hp || 10,
                        maxHp: char.stats?.maxHp || 10,
                        ac: char.stats?.ac || 10,
                        dexterity: char.stats?.dexterity || 10,
                        characterData: char
                    };
                });

            const results = await Promise.all(promises);
            return results.filter(p => p !== null);

        } catch (error) {
            logger.error("Erro ao coletar jogadores:", error);
            return [];
        }
    },

    calculateInitiative(players, monsters) {
        const all = [];

        // Players: DEX modifier + d20
        for (const player of players) {
            const dexMod = Math.floor((player.dexterity - 10) / 2);
            const roll = Math.floor(Math.random() * 20) + 1;
            all.push({
                ...player,
                initiative: dexMod + roll,
                initiativeRoll: roll,
                dexMod: dexMod
            });
        }

        // Monsters: same logic
        for (const monster of monsters) {
            const dex = monster.stats?.dexterity || monster.secoes?.Atributos?.Destreza || 10;
            const hp = monster.stats?.hp || monster.stats?.maxHp || 10;
            const ac = monster.stats?.ac || monster.secoes?.CA || 10;

            const dexMod = Math.floor((dex - 10) / 2);
            const roll = Math.floor(Math.random() * 20) + 1;
            all.push({
                id: monster.id || `monster_${Date.now()}_${Math.random()}`,
                name: monster.name || 'Monstro',
                type: 'monster',
                hp: hp,
                maxHp: hp,
                ac: ac,
                dexterity: dex,
                initiative: dexMod + roll,
                initiativeRoll: roll,
                dexMod: dexMod,
                monsterData: monster
            });
        }

        // Sort descending by initiative
        all.sort((a, b) => {
            if (b.initiative !== a.initiative) {
                return b.initiative - a.initiative;
            }
            // Tiebreaker: higher DEX wins
            return b.dexterity - a.dexterity;
        });

        return all;
    },

    async startTurn(index) {
        this.currentTurnIndex = index;
        const current = this.turnOrder[index];

        if (!current) {
            logger.error("Turno inválido:", index);
            return;
        }

        // Save current turn to database
        const sessionRef = doc(db, "sessoes", this.sessionId);
        await updateDoc(sessionRef, {
            currentTurnIndex: index
        });

        // Notify in chat
        await this.sendCombatMessage(
            `<i class="fas fa-dice-d20" style="color: var(--gold); margin-right: 6px;"></i> **Rodada ${this.round} - Turno de ${current.name}**\n` +
            `Iniciativa: ${current.initiative} (${current.initiativeRoll} + ${current.dexMod})\n` +
            `HP: ${current.hp}/${current.maxHp} | CA: ${current.ac}`
        );

        logger.info(`⚔️ Turno ${index}: ${current.name}`);
    },

    async nextTurn() {
        const nextIndex = this.currentTurnIndex + 1;

        if (nextIndex >= this.turnOrder.length) {
            // New round
            this.round++;
            const sessionRef = doc(db, "sessoes", this.sessionId);
            await updateDoc(sessionRef, {
                combatRound: this.round
            });
            await this.sendCombatMessage(`\n<i class="fas fa-sync" style="color: var(--gold); margin-right: 6px;"></i> **Rodada ${this.round}**\n`);
            await this.startTurn(0);
        } else {
            await this.startTurn(nextIndex);
        }
    },

    async endCombat() {
        const sessionRef = doc(db, "sessoes", this.sessionId);
        await updateDoc(sessionRef, {
            combatActive: false,
            combatTurnOrder: [],
            currentTurnIndex: 0,
            combatRound: 0
        });

        this.combatActive = false;
        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.round = 1;

        await this.sendCombatMessage('<i class="fas fa-swords" style="color: var(--gold); margin-right: 6px;"></i> **Combate Encerrado!**');
        logger.info("✅ Combat: Combate encerrado");
    },

    async sendCombatMessage(text) {
        await addDoc(collection(db, "session_messages"), {
            sessionId: this.sessionId,
            type: 'combat',
            sender: 'Sistema de Combate',
            text: text,
            timestamp: serverTimestamp()
        });
    },

    async offerMonsterCreation() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-stage';
            modal.innerHTML = `
                <div class="modal-stage-content mini parchment-mini">
                    <h2 class="medieval-title">Nenhum Monstro Vinculado</h2>
                    <p class="mystic-msg">Deseja que o Oráculo crie monstros apropriados para este combate?</p>
                    <div class="modal-actions-centered">
                        <button class="medieval-btn" id="create-monsters-yes">Sim</button>
                        <button class="medieval-btn secondary" id="create-monsters-no">Não</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('create-monsters-yes').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(true);
            });

            document.getElementById('create-monsters-no').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
        });
    },

    async generateMonstersWithAI(sessionData) {
        // Get player levels to determine appropriate challenge
        const players = await this.getPlayers();
        const avgLevel = players.reduce((sum, p) => sum + (p.characterData?.bio?.level || 1), 0) / players.length;

        const { default: OracleModule } = await import('./oracle.js');
        OracleModule.sessionId = this.sessionId;
        OracleModule.sessionData = sessionData;

        const context = await OracleModule.buildSessionContext();

        const prompt = `Crie ${players.length} monstros apropriados para um combate balanceado contra ${players.length} jogadores de nível médio ${Math.round(avgLevel)}.

Para cada monstro, forneça no formato JSON:
{
  "name": "Nome do Monstro",
  "hp": número,
  "ac": número,
  "dexterity": número (8-20),
  "attacks": ["Ataque 1", "Ataque 2"],
  "description": "Descrição breve"
}

Retorne um array JSON com os monstros.`;

        const response = await OracleModule.callAI({
            type: 'custom',
            context: context,
            additionalPrompt: prompt
        });

        // Parse AI response to extract monsters
        try {
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const monsters = JSON.parse(jsonMatch[0]);

                // Validar que é array e que cada monstro tem os campos mínimos
                if (!Array.isArray(monsters)) throw new Error('Schema inválido: esperado array');
                const validMonsters = monsters.filter(m =>
                    m && typeof m.name === 'string' && typeof m.hp === 'number' && typeof m.ac === 'number'
                );

                if (validMonsters.length === 0) throw new Error('Nenhum monstro válido no retorno da IA');

                // Save monsters to session
                const sessionRef = doc(db, "sessoes", this.sessionId);
                await updateDoc(sessionRef, {
                    linked_monsters: validMonsters,
                    ai_generated_monsters: validMonsters
                });

                await this.sendCombatMessage(`<i class="fas fa-wand-sparkles" style="color: var(--gold); margin-right: 6px;"></i> O Oráculo invocou ${validMonsters.length} adversários!`);
                return validMonsters;
            }
        } catch (error) {
            logger.error("Erro ao parsear monstros da IA:", error);
        }

        // Fallback: create generic monsters
        return this.createGenericMonsters(players.length, avgLevel);
    },

    createGenericMonsters(count, avgLevel) {
        const monsters = [];
        const cr = Math.max(1, Math.floor(avgLevel / 2));

        for (let i = 0; i < count; i++) {
            monsters.push({
                name: `Adversário ${i + 1}`,
                hp: 10 + (cr * 5),
                ac: 10 + cr,
                dexterity: 12,
                attacks: ["Ataque Corpo a Corpo"],
                description: "Um oponente misterioso"
            });
        }

        return monsters;
    }
};


export default CombatModule;
