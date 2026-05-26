/**
 * Loot Module - Item Distribution System
 * Handles item drops and distribution among players
 */

import { db } from "../auth.js";
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion
} from "firebase/firestore";
import { getCharacter, updateCharacter } from "../data.js";
import { escapeHTML } from "./utils.js";
import { logger } from "../logger.js";

const LootModule = {
    sessionId: null,
    currentItem: null,
    players: [],

    async showLootDistribution(sessionId, item, players) {
        this.sessionId = sessionId;
        this.currentItem = item;
        this.players = players;

        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-stage loot-modal';
            modal.id = 'loot-distribution-modal';

            modal.innerHTML = `
                <div class="modal-stage-content parchment-mini">
                    <h2 class="medieval-title"><i class="fas fa-gift" style="color: var(--gold); margin-right: 6px;"></i> Item Encontrado!</h2>
                    <div class="loot-item-display">
                        <h3>${escapeHTML(item.name)}</h3>
                        <p class="item-description">${escapeHTML(item.description || '')}</p>
                        ${item.properties ? `<p class="item-properties"><strong>Propriedades:</strong> ${escapeHTML(item.properties)}</p>` : ''}
                    </div>
                    <p class="loot-question">Como desejam distribuir este item?</p>
                    <div class="modal-actions-centered">
                        <button class="medieval-btn" id="loot-roll-dice">
                            <i class="fas fa-dice-d20"></i> Rolar Dados
                        </button>
                        <button class="medieval-btn secondary" id="loot-manual">
                            <i class="fas fa-comments"></i> Decidir na Conversa
                        </button>
                        <button class="medieval-btn tertiary" id="loot-cancel">
                            Cancelar
                        </button>
                    </div>
                    <div id="loot-roll-results" class="loot-results hidden"></div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('loot-roll-dice').addEventListener('click', async () => {
                await this.rollForLoot();
                resolve('rolled');
            });

            document.getElementById('loot-manual').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve('manual');
            });

            document.getElementById('loot-cancel').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve('cancelled');
            });
        });
    },

    async rollForLoot() {
        const resultsDiv = document.getElementById('loot-roll-results');
        resultsDiv.classList.remove('hidden');
        resultsDiv.innerHTML = '<p class="rolling-text"><i class="fas fa-dice-d20 fa-spin"></i> Rolando dados...</p>';

        const rolls = [];

        for (const player of this.players) {
            const roll = Math.floor(Math.random() * 20) + 1;
            rolls.push({ player, roll });
        }

        // Sort by roll (descending)
        rolls.sort((a, b) => b.roll - a.roll);

        // Display results
        let html = '<div class="roll-results-list">';
        rolls.forEach((r, index) => {
            const isWinner = index === 0;
            html += `
                <div class="roll-result ${isWinner ? 'winner' : ''}">
                    <span class="player-name">${escapeHTML(r.player.name)}</span>
                    <span class="roll-value">${r.roll}</span>
                    ${isWinner ? '<span class="winner-badge"><i class="fas fa-trophy" style="color: var(--gold); margin-right: 4px;"></i> Vencedor!</span>' : ''}
                </div>
            `;
        });
        html += '</div>';

        resultsDiv.innerHTML = html;

        // Winner gets the item
        const winner = rolls[0].player;

        setTimeout(async () => {
            await this.addItemToPlayer(winner.id, this.currentItem);

            // Close modal
            const modal = document.getElementById('loot-distribution-modal');
            if (modal) {
                document.body.removeChild(modal);
            }
        }, 2000);
    },

    async addItemToPlayer(playerId, item) {
        try {
            const character = await getCharacter(playerId);
            if (!character) {
                logger.error("Personagem não encontrado:", playerId);
                return;
            }

            // Add item to inventory with temporary flag
            character.inventory = character.inventory || [];
            character.inventory.push({
                ...item,
                temporary: true,
                sessionId: this.sessionId,
                addedAt: new Date().toISOString()
            });

            await updateCharacter(playerId, character);



            logger.info(`📦 Item "${item.name}" adicionado a ${character.bio?.name}`);
        } catch (error) {
            logger.error("Erro ao adicionar item ao jogador:", error);
        }
    },

    async cloneItemToPersonal(playerId, itemIndex) {
        try {
            const character = await getCharacter(playerId);
            if (!character || !character.inventory[itemIndex]) {
                return;
            }

            const item = character.inventory[itemIndex];

            // Create permanent copy
            const permanentItem = {
                ...item,
                temporary: false,
                sessionId: undefined,
                clonedAt: new Date().toISOString()
            };

            // Replace temporary with permanent
            character.inventory[itemIndex] = permanentItem;

            await updateCharacter(playerId, character);



            logger.info(`✅ Item "${item.name}" clonado para inventário permanente`);
            return true;
        } catch (error) {
            logger.error("Erro ao clonar item:", error);
            return false;
        }
    },

    async removeTemporaryItems(playerId, sessionId) {
        try {
            const character = await getCharacter(playerId);
            if (!character) return;

            // Filter out temporary items from this session
            character.inventory = (character.inventory || []).filter(
                item => !(item.temporary && item.sessionId === sessionId)
            );

            await updateCharacter(playerId, character);



            logger.info(`🗑️ Itens temporários removidos de ${character.bio?.name}`);
        } catch (error) {
            logger.error("Erro ao remover itens temporários:", error);
        }
    }
};

// window.LootModule = LootModule;
export default LootModule;
