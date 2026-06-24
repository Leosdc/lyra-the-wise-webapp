/**
 * VTTIntegration — Módulo de Integração com o Lyra VTT (GDevelop)
 * Gerencia a inicialização, a comunicação por JSON e a sincronização do mapa tático.
 */

import { db } from '../auth.js';
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export const VTTIntegration = {
    iframeEl: null,
    gameInstance: null,
    sessionUnsubscribe: null,

    /**
     * Inicializa a integração e vincula o elemento do iframe
     */
    init(iframeElement) {
        if (!iframeElement) return;
        this.iframeEl = iframeElement;
        this.gameInstance = null;
    },

    /**
     * Aguarda o GDevelop e a cena ativa estarem prontos antes de injetar comandos
     */
    waitForGame(callback) {
        if (!this.iframeEl) return;

        const check = () => {
            try {
                const game = this.iframeEl.contentWindow?.gdjsGame;
                const scene = game?.getSceneStack()?.getCurrentScene();
                
                if (game && scene) {
                    this.gameInstance = game;
                    
                    // Oculta textos de depuração visual ("Deu errado", logs de mapa, etc.) para um visual Premium
                    const debugObjects = ["LoadIDTx", "LoadPlayerTx", "LoadMapTx", "TimeTxt", "TesteConsole"];
                    debugObjects.forEach(objName => {
                        try {
                            const instances = scene.getObjects(objName);
                            if (instances) {
                                instances.forEach(inst => inst.hide(true));
                            }
                        } catch (e) {
                            console.warn(`[Lyra VTT] Não foi possível ocultar o objeto de depuração ${objName}:`, e);
                        }
                    });

                    callback(game, scene);
                    return;
                }
            } catch (err) {
                console.warn("Aguardando inicialização do portal do VTT...", err);
            }
            setTimeout(check, 150);
        };
        check();
    },

    /**
     * Injeta um comando estruturado JSON no motor do GDevelop VTT
     */
    sendToVTT(payload) {
        this.waitForGame((game, scene) => {
            try {
                const jsonStr = JSON.stringify(payload);
                
                // Variável index 29: Armazena a string JSON do payload
                scene.getVariables().getFromIndex(29).setString(jsonStr);
                
                // Variável index 30: Flag que dispara o parsing interno do JSON
                scene.getVariables().getFromIndex(30).setBoolean(true);
                
                console.log(`[Lyra VTT] Comando injetado com sucesso: ${payload.type}`);
            } catch (err) {
                console.error("Erro ao transmitir comando para o VTT:", err);
            }
        });
    },

    /**
     * Envia a identidade do jogador (Mestre ou Viajante) para inicializar o motor VTT e avançar o estado da cena
     */
    sendPlayerID(playerId, isMaster = false) {
        const payload = {
            type: "PlayerID",
            content: {
                PlayerID: playerId,
                IsMaster: isMaster ? "true" : "false"
            }
        };
        this.sendToVTT(payload);
    },

    /**
     * Envia o mapa (URL e tamanho da grade) para o VTT
     */
    loadMap(urlMap, cellSize = 50) {
        const payload = {
            type: "LoadMap",
            content: {
                urlMap: urlMap,
                CellSize: cellSize
            }
        };
        this.sendToVTT(payload);
    },

    /**
     * Envia os tokens dos jogadores (viajantes) para o VTT
     */
    loadPlayers(players) {
        const payload = {
            type: "LoadPlayer",
            content: {
                players: players.map(p => ({
                    fichaId: p.characterId || p.id,
                    position: {
                        x: p.x !== undefined ? p.x : 2,
                        y: p.y !== undefined ? p.y : 2
                    }
                }))
            }
        };
        this.sendToVTT(payload);
    },

    /**
     * Envia os monstros/NPCs para o VTT
     */
    loadNPCs(npcs) {
        const payload = {
            type: "LoadNPC",
            content: {
                NPCs: npcs.map(n => ({
                    name: n.name || "Ameaça",
                    hp_current: n.hp_current || 10,
                    hp_max: n.hp_max || 10,
                    ac: n.ac || 10,
                    tokenUrl: n.tokenUrl || "",
                    position: {
                        x: n.x !== undefined ? n.x : 5,
                        y: n.y !== undefined ? n.y : 5
                    }
                }))
            }
        };
        this.sendToVTT(payload);
    },

    /**
     * Limpa o estado da integração
     */
    destroy() {
        if (this.sessionUnsubscribe) {
            this.sessionUnsubscribe();
            this.sessionUnsubscribe = null;
        }
        this.gameInstance = null;
        this.iframeEl = null;
    }
};

window.VTTIntegration = VTTIntegration;
