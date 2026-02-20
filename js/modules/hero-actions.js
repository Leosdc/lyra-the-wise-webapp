/**
 * Hero Actions - Modal de Ações do Herói
 * Interface completa integrada com dados da ficha
 */

import { getCharacter } from "../data.js";
import { getAuth } from "firebase/auth";

const HeroActions = {
    characterData: null,
    selectedTarget: null,
    modalElement: null,

    /**
     * Abre modal de ações
     */
    async openActionModal(participant = null) {
        console.log("🦸 HeroActions: Abrindo modal de ações via CombatUI...");

        this.selectedTarget = null; // Target selection is handled by CombatUI

        try {
            // Se o participante for monstro/NPC, as ações já podem estar nele ou no estado do combate
            if (participant && (participant.type === 'monster' || participant.type === 'npc')) {
                console.log(`👹 HeroActions: Preparando ações para monstro/NPC ${participant.name}`);
                if (window.CombatUI) {
                    window.CombatUI.startTargetSelection(participant.id);
                }
                return;
            }

            // Buscar dados COMPLETOS da ficha do jogador
            const characterId = participant?.characterId || await this.getCurrentCharacterId();
            if (!characterId) {
                console.error("ID do personagem não encontrado");
                return;
            }

            this.characterData = await getCharacter(characterId);

            if (!this.characterData) {
                console.error("Dados do personagem não encontrados");
                return;
            }

            // NOVA REGRA: Verificar Turno (Point & Point Turn-based)
            const isMyTurn = this.checkIfMyTurn();
            if (window.StageModule?.activeSession?.combatActive && !isMyTurn) {
                if (window.StageModule.showMysticAlert) {
                    window.StageModule.showMysticAlert("Aguarde seu momento de agir. O destino ainda não clama por você.", "Fora de Turno");
                } else {
                    alert("Não é o seu turno.");
                }
                return;
            }

            // Mapear dados para o formato do CombatUI
            const actions = this.mapCharacterToActions();

            // Delegar para CombatUI
            if (window.CombatUI) {
                // Encontrar o ID do participante correspondente a este herói
                const combatState = window.CombatEngine?.combatState;
                const participantDetails = combatState?.turnOrder.find(p =>
                    p.characterId === characterId || p.id === characterId
                );

                if (participantDetails) {
                    // Temporariamente injetar ações no participante para o renderizador
                    participantDetails.actions = actions;

                    window.CombatUI.startTargetSelection(participantDetails.id);

                    // Se já tivermos um alvo selecionado por clique direto na lista, setar no estado local
                    if (participantDetails && participantDetails.id) {
                        window.CombatUI.localRollState.targetId = participantDetails.id;
                        window.CombatUI.localRollState.targetName = participantDetails.name;
                        window.CombatUI.renderTargetingPanel();
                    }
                } else {
                    console.error("Participante não encontrado no combate");
                }
            }

        } catch (error) {
            console.error("Erro ao abrir modal:", error);
        }
    },

    /**
     * Abre a Mochila do Herói (Inventário)
     */
    async openBackpackModal() {
        console.log("🎒 HeroActions: Abrindo Mochila do Herói...");

        try {
            const characterId = await this.getCurrentCharacterId();
            if (!characterId) {
                if (window.StageModule?.showMysticAlert) {
                    window.StageModule.showMysticAlert("Você ainda não escolheu um personagem para esta jornada.", "Mochila Vazia");
                }
                return;
            }

            this.characterData = await getCharacter(characterId);
            if (!this.characterData) return;

            const items = this.characterData.inventory?.items || [];
            const coins = this.characterData.inventory?.coins || { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 };

            const modalHtml = `
                <div class="modal-stage" id="backpack-modal">
                    <div class="modal-stage-content backpack-content parchment-mini">
                        <button class="close-btn-top" onclick="document.getElementById('backpack-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                        
                        <div class="modal-header">
                            <h2 class="medieval-title"><i class="fas fa-suitcase"></i> Mochila de ${this.characterData.name}</h2>
                        </div>

                        <div class="modal-body scrollable">
                            <div class="backpack-coins">
                                <div class="coin-item po" title="Peças de Ouro">
                                    <i class="fas fa-coins"></i>
                                    <span>${coins.po || 0} PO</span>
                                </div>
                                <div class="coin-item pp" title="Peças de Prata">
                                    <i class="fas fa-circle-dollar-to-slot"></i>
                                    <span>${coins.pp || 0} PP</span>
                                </div>
                                <div class="coin-item pc" title="Peças de Cobre">
                                    <i class="fas fa-sack-dollar"></i>
                                    <span>${coins.pc || 0} PC</span>
                                </div>
                            </div>

                            <div class="backpack-grid sheet-cards-grid">
                                ${items.length > 0 ? items.map((item, i) => this.renderBackpackItem(item, i)).join('') : '<p class="empty-msg">Sua mochila está vazia por enquanto...</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            let container = document.getElementById('modal-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'modal-container';
                document.body.appendChild(container);
            }
            container.innerHTML = modalHtml;

        } catch (error) {
            console.error("Erro ao abrir mochila:", error);
        }
    },

    /**
     * Renderiza um item da mochila no formato da ficha
     */
    renderBackpackItem(it, i) {
        let rarityRaw = (it.rarity || 'common').toLowerCase();
        const rarityMap = {
            'comum': 'common',
            'incomum': 'uncommon',
            'raro': 'rare',
            'muito raro': 'very_rare',
            'muito_raro': 'very_rare',
            'lendário': 'legendary',
            'lendario': 'legendary'
        };
        const rarity = rarityMap[rarityRaw] || rarityRaw.replace(' ', '_');
        const icon = this.getIconForItem(it);

        // Limpar peso para evitar "kgkg"
        let weightVal = it.weight || 0;
        if (typeof weightVal === 'string') {
            weightVal = parseFloat(weightVal.replace(/[^\d.]/g, '')) || 0;
        }

        return `
            <div class="sheet-card-v2 rarity-${rarity}" data-index="${i}">
                <div class="card-v2-header">
                    <div class="card-v2-icon"><i class="fas ${icon}"></i></div>
                    <div class="card-v2-title-section">
                        <span class="card-v2-title">${it.name || 'Item'}</span>
                        <span class="card-v2-subtitle">${it.type || 'Equipamento'} • ${it.rarity || 'Comum'}</span>
                    </div>
                </div>
                <div class="card-v2-content">
                    <div class="card-v2-stats">
                        <div class="card-v2-stat"><strong>Peso</strong> <span>${weightVal} kg</span></div>
                        <div class="card-v2-stat"><strong>Qtd</strong> <span>x${it.quantity || 1}</span></div>
                    </div>
                    ${it.description ? `<div class="card-v2-desc">${it.description}</div>` : ''}
                </div>
                ${it.equipped ? '<span class="equipped-tag">Equipado</span>' : ''}
            </div>
        `;
    },

    getIconForItem(item) {
        const type = item.type?.toLowerCase() || '';
        if (type.includes('arma') || type.includes('weapon')) return 'fa-hammer';
        if (type.includes('armadura') || type.includes('armor')) return 'fa-shield-alt';
        if (type.includes('poção') || type.includes('potion')) return 'fa-flask-vial';
        if (type.includes('pergaminho') || type.includes('scroll')) return 'fa-scroll';
        if (type.includes('ferramenta') || type.includes('tool')) return 'fa-tools';
        return 'fa-bag-shopping';
    },

    /**
     * Obtém ID do personagem atual
     */
    async getCurrentCharacterId() {
        // Tentar obter do StageModule
        if (window.StageModule && window.StageModule.characterData) {
            return window.StageModule.characterData.id;
        }

        // Fallback: buscar do convite da sessão
        const sessionId = window.StageModule?.sessionId;
        const userEmail = window.app?.user?.email;

        if (sessionId && userEmail) {
            const { db } = await import("../auth.js");
            const { collection, query, where, getDocs } = await import(
                "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
            );

            const q = query(
                collection(db, "session_invites"),
                where("sessionId", "==", sessionId),
                where("email", "==", userEmail.toLowerCase())
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs[0].data().characterId;
            }
        }

        return null;
    },

    /**
     * Obtém Player ID (Invite ID)
     */
    async getCurrentPlayerId() {
        const sessionId = window.StageModule?.sessionId;
        const userEmail = window.app?.user?.email;

        if (!sessionId || !userEmail) return null;

        const { db } = await import("../auth.js");
        const { collection, query, where, getDocs } = await import(
            "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
        );

        const q = query(
            collection(db, "session_invites"),
            where("sessionId", "==", sessionId),
            where("email", "==", userEmail.toLowerCase())
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs[0].id;
        }

        return null;
    },

    /**
     * Mapeia dados da ficha para o formato de ações unificado
     */
    mapCharacterToActions() {
        const actions = [];

        // 1. Ataques/Combate
        const rawAttacks = this.characterData.combat?.attacks || [];
        rawAttacks.forEach(atk => {
            actions.push({
                name: atk.name,
                damage: atk.damage || "1d4",
                bonus: parseInt(atk.bonus) || 0,
                range: atk.range || "Corpo a corpo",
                desc: atk.desc || "",
                category: "Combate",
                type: "attack"
            });
        });

        // 2. Magias Preparadas
        const rawSpells = (this.characterData.spells?.list || []).filter(s => s.prepared);
        rawSpells.forEach(spell => {
            actions.push({
                name: spell.name,
                damage: spell.damage || spell.save || "---",
                range: spell.range || "Perto",
                desc: spell.description || "",
                category: "Magias",
                type: "spell",
                level: spell.level
            });
        });

        // 3. Itens Equipados
        const equippedItems = (this.characterData.inventory?.items || []).filter(i => i.equipped);
        equippedItems.forEach(item => {
            actions.push({
                name: item.name,
                damage: item.damage || "",
                desc: item.description || "",
                category: "Itens",
                type: "item",
                quantity: item.quantity || 1
            });
        });

        // 4. Ações Padrão
        actions.push({ name: "Defender", category: "Outros", type: "defend", desc: "Focar na defesa até o próximo turno." });
        actions.push({ name: "Esquivar", category: "Outros", type: "dodge", desc: "Tentar evitar ataques inimigos." });
        actions.push({ name: "Fugir", category: "Outros", type: "flee", desc: "Tentar escapar do campo de batalha." });

        return actions;
    },

    /**
     * Verifica se é o turno do jogador local
     */
    checkIfMyTurn() {
        if (!window.CombatEngine || !window.CombatEngine.combatState) return true;

        const state = window.CombatEngine.combatState;
        const activeParticipant = state.turnOrder[state.activeTurnIndex || 0];

        if (!activeParticipant) return false;

        const currentUser = getAuth().currentUser;
        const currentUserId = currentUser?.uid || window.app?.user?.uid;
        const isMatch = activeParticipant.playerId === currentUserId;

        if (!isMatch) {
            console.warn(`🛡️ [TurnGuard] Rejeitado: Participante=${activeParticipant.playerId}, Você=${currentUserId}`);
            // Fallback para e-mail se disponível (Legacy)
            const userEmail = currentUser?.email?.toLowerCase() || window.app?.user?.email?.toLowerCase();
            if (activeParticipant.playerEmail && userEmail === activeParticipant.playerEmail) {
                console.log("✅ [TurnGuard] Acesso concedido via fallback de e-mail.");
                return true;
            }
        }

        return isMatch;
    },

    /**
     * Rola para uma solicitação específica do mestre
     */
    async rollForRequest(requestId, requestData) {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;

        const myUid = currentUser.uid;
        console.log(`🎲 Realizando teste solicitado: ${requestData.skill}`);

        const roll = Math.floor(Math.random() * 20) + 1;

        // Adicionar modificador do atributo se disponível
        const bonus = 0;
        const total = roll + bonus;

        try {
            const { db } = await import("../auth.js");
            const { doc, updateDoc } = await import(
                "firebase/firestore"
            );

            // Update the request message in Firestore
            const msgRef = doc(db, "sessoes", window.StageModule.sessionId, "session_messages", this.activeRequest.id);
            const results = { ...(this.activeRequest.results || {}) };
            results[myUid] = total;

            await updateDoc(msgRef, { results });

            // Clear restriction
            this.activeRequest = null;
            this.closeModal();

        } catch (error) {
            console.error("Erro ao enviar resultado da rolagem:", error);
        }
    },

    /**
     * Fecha modal
     */
    closeModal() {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
        }
        // Também fechar o targeting panel se estiver aberto
        const targetingPanel = document.getElementById('targeting-panel');
        if (targetingPanel) targetingPanel.remove();
    }
};

window.HeroActions = HeroActions;
export default HeroActions;
