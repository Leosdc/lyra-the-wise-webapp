/**
 * VTTIntegration — Módulo de Integração com o Lyra VTT (GDevelop)
 * Gerencia a inicialização, a comunicação por JSON e a sincronização do mapa tático em produção.
 */

import { db } from '../auth.js';
import { doc, getDoc, onSnapshot, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const VTTIntegration = {
    iframeEl: null,
    gameInstance: null,
    sessionUnsubscribe: null,
    sessionId: null,
    isMaster: false,
    _messageListener: null,
    _lastRemoteTime: 0,
    _lastLocalTime: 0,
    _isDestroyed: false,

    /**
     * Inicializa a integração e vincula o elemento do iframe
     */
    init(iframeElement, sessionId = null, options = {}) {
        if (!iframeElement) return;
        this._isDestroyed = false;
        this.iframeEl = iframeElement;
        this.gameInstance = null;
        this.sessionId = sessionId;
        this.isMaster = !!options.isMaster;
        this._lastRemoteTime = 0;
        this._lastLocalTime = 0;

        // Limpa event listener anterior para evitar duplicidade
        if (this._messageListener) {
            window.removeEventListener('message', this._messageListener);
        }

        // Registra o listener para escutar mensagens postadas pelo GDevelop
        this._messageListener = this.handleVTTMessage.bind(this);
        window.addEventListener('message', this._messageListener);

        // Inicia escuta em tempo real do Firestore para a sessão
        if (this.sessionId) {
            this.startFirestoreSync(this.sessionId);
        }

        console.log(`[Lyra VTT] Integração inicializada para a sessão: ${this.sessionId} (isMaster: ${this.isMaster})`);
    },

    /**
     * Inicia escuta de sincronização em tempo real via documento da sessão no Firestore
     */
    startFirestoreSync(sessionId) {
        if (this.sessionUnsubscribe) {
            this.sessionUnsubscribe();
            this.sessionUnsubscribe = null;
        }

        try {
            const sessionDocRef = doc(db, "sessoes", sessionId);
            this.sessionUnsubscribe = onSnapshot(sessionDocRef, (snap) => {
                if (!snap.exists()) return;
                const data = snap.data();
                
                // Extrai os dados do AttSession de AttSession, vttVariables ou campos raiz
                let rawSessionContent = data.AttSession || data.vttVariables || null;
                if (!rawSessionContent && (data.Tile_Matriz || data.Players)) {
                    rawSessionContent = {
                        Act_Scene_State: data.Act_Scene_State || "LOAD",
                        Att: data.Att !== undefined ? data.Att : true,
                        Iniciative: data.Iniciative || {},
                        Itens: data.Itens || {},
                        Objects: data.Objects || {},
                        Players: data.Players || {},
                        SCENE_STATES: data.SCENE_STATES || {},
                        Tile_Matriz: data.Tile_Matriz || [],
                        Time: data.Time || Date.now()
                    };
                }

                if (!rawSessionContent) return;

                // Converte mapas de objetos numéricos de volta para matrizes para o GDevelop
                const sessionContent = this.restoreArraysFromFirestore(rawSessionContent);
                const remoteTime = Number(sessionContent.Time || data.Time || 0);

                // Evita eco de mensagens que acabamos de enviar
                if (remoteTime && remoteTime <= this._lastLocalTime) {
                    return;
                }

                if (remoteTime > this._lastRemoteTime) {
                    this._lastRemoteTime = remoteTime;
                    console.log(`[Lyra VTT] Sincronização remota recebida da sessão (Time: ${remoteTime})`);
                    
                    // Injeta AttSession no motor GDevelop
                    this.sendToVTT({
                        type: "AttSession",
                        content: sessionContent
                    });
                }
            }, (err) => {
                console.warn("[Lyra VTT] Erro no listener da sessão no Firestore:", err);
            });
        } catch (err) {
            console.error("[Lyra VTT] Falha ao iniciar sincronização da sessão no Firestore:", err);
        }
    },

    /**
     * Aguarda o GDevelop e a cena ativa estarem prontos antes de injetar comandos
     */
    waitForGame(callback) {
        if (!this.iframeEl || this._isDestroyed) return;

        let attempts = 0;
        const maxAttempts = 150; // ~22.5s limite seguro

        const check = () => {
            if (this._isDestroyed || !this.iframeEl) return;
            attempts++;

            try {
                const win = this.iframeEl.contentWindow;
                const game = win?.gdjsGame || win?.game;
                const scene = game?.getSceneStack()?.getCurrentScene();
                
                if (game && scene) {
                    this.gameInstance = game;
                    
                    // Oculta textos de depuração visual ("Deu errado", logs de mapa, etc.) para visual limpo e imersivo
                    const debugObjects = [
                        "LoadIDTx", "LoadPlayerTx", "LoadMapTx", "TimeTxt", 
                        "TesteConsole", "LoadToFire", "LoadSessionTx", "LoadNPCTx",
                        "NewBBText2"
                    ];
                    debugObjects.forEach(objName => {
                        try {
                            const instances = scene.getObjects(objName);
                            if (instances) {
                                instances.forEach(inst => inst.hide(true));
                            }
                        } catch (e) {
                            // Ignora objetos inexistentes
                        }
                    });

                    callback(game, scene);
                    return;
                }
            } catch (err) {
                // Cross-origin ou carregamento em andamento
            }

            if (attempts < maxAttempts && !this._isDestroyed) {
                setTimeout(check, 150);
            }
        };
        check();
    },

    _queue: [],
    _isProcessingQueue: false,

    /**
     * Injeta um comando estruturado JSON no motor do GDevelop VTT usando fila sequencial
     * Garante que cada comando seja processado por um ciclo de frames antes do próximo ser injetado
     */
    sendToVTT(payload) {
        if (!payload || !payload.type) return;
        this._queue.push(payload);
        this._processQueue();
    },

    _processQueue() {
        if (this._isProcessingQueue || this._queue.length === 0) return;
        this._isProcessingQueue = true;

        const nextPayload = this._queue.shift();

        this.waitForGame((game, scene) => {
            try {
                // 1. Canal Primário: postMessage para o iframe
                if (this.iframeEl?.contentWindow) {
                    this.iframeEl.contentWindow.postMessage(nextPayload, "*");
                }

                // 2. Canal Direto: Variáveis do RuntimeScene (IncomingMessage e HasNewMessage)
                const jsonStr = JSON.stringify(nextPayload);
                const varIncoming = scene.getVariables().get("IncomingMessage") || scene.getVariables().getFromIndex(29);
                const varHasNew = scene.getVariables().get("HasNewMessage") || scene.getVariables().getFromIndex(30);

                if (varIncoming) varIncoming.setString(jsonStr);
                if (varHasNew) varHasNew.setBoolean(true);

                console.log(`[Lyra VTT] Comando processado da fila: ${nextPayload.type}`);
            } catch (err) {
                console.warn("[Lyra VTT] Falha ao despachar comando da fila:", err);
            }

            // Aguarda 160ms para dar tempo do frame do GDevelop consumir a mensagem
            setTimeout(() => {
                this._isProcessingQueue = false;
                this._processQueue();
            }, 160);
        });
    },

    /**
     * Envia a identidade do jogador (Mestre ou Viajante) e instancia controles
     */
    sendPlayerID(playerId, isMaster = false) {
        const payload = {
            type: "PlayerID",
            content: {
                PlayerID: String(playerId),
                IsMaster: isMaster ? "true" : "false"
            }
        };

        // Força imediatamente variáveis globais do motor do jogo
        this.waitForGame((game, scene) => {
            try {
                const gPlayer = game.getVariables().get("PlayerID") || game.getVariables().getFromIndex(3);
                const gMaster = game.getVariables().get("IsMaster") || game.getVariables().getFromIndex(4);
                if (gPlayer) gPlayer.setString(String(playerId));
                if (gMaster) gMaster.setBoolean(isMaster);

                const sPlayer = scene.getVariables().get("PlayerID");
                const sMaster = scene.getVariables().get("IsMaster");
                if (sPlayer) sPlayer.setString(String(playerId));
                if (sMaster) sMaster.setBoolean(isMaster);

                // Se for Mestre, garante a instanciação dos botões do Mestre e Dados
                if (isMaster) {
                    const win = this.iframeEl?.contentWindow;
                    if (win && win.gdjs?.evtTools?.runtimeScene) {
                        try {
                            const existingHud = scene.getObjects("Master_Head");
                            if (!existingHud || existingHud.length === 0) {
                                win.gdjs.evtTools.runtimeScene.createObjectsFromExternalLayout(scene, "Master_HUD", 0, 0, 0);
                                win.gdjs.evtTools.runtimeScene.createObjectsFromExternalLayout(scene, "RollDice", 0, 0, 0);
                                console.log("[Lyra VTT] Master_HUD e RollDice instanciados para o Mestre!");
                            }
                        } catch (hudErr) {
                            console.warn("[Lyra VTT] Falha ao instanciar Master_HUD:", hudErr);
                        }
                    }
                }
            } catch (e) {}
        });

        this.sendToVTT(payload);
    },

    /**
     * Envia o ID da sessão e ativa o carregamento
     */
    sendSessionID(sessionId, loadSession = "on") {
        const payload = {
            type: "SessionID",
            content: {
                SessionID: String(sessionId),
                LoadSession: loadSession
            }
        };
        this.sendToVTT(payload);
    },

    /**
     * Envia o mapa (URL, tamanho da grade e dimensões) para o VTT
     */
    loadMap(urlMap, cellSize = 64, customSize = { on: "true", x: "1280", y: "720" }) {
        let safeUrl = (typeof urlMap === 'string' && urlMap.trim()) ? urlMap.trim() : "/assets/maps/default.jpg";
        
        this._currentMapData = {
            Img: safeUrl,
            CellSize: Number(cellSize) || 64,
            x: Number(customSize?.x) || 1280,
            y: Number(customSize?.y) || 720
        };

        const payload = {
            type: "LoadMap",
            content: {
                urlMap: safeUrl,
                CellSize: Number(cellSize) || 64,
                CustonSize: {
                    on: String(customSize?.on || "true"),
                    x: String(customSize?.x || "1280"),
                    y: String(customSize?.y || "720")
                }
            }
        };
        this.sendToVTT(payload);

        // Injeta e aplica a imagem diretamente no objeto Map para troca instantânea do cenário
        this.waitForGame((game, scene) => {
            try {
                const win = this.iframeEl?.contentWindow;
                const mapObjects = scene.getObjects("Map");
                if (win && mapObjects && mapObjects.length > 0 && win.gdjs?.evtsExt__LoadImageFromURL__LoadURLIntoSprite) {
                    win.gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSprite.func(scene, safeUrl, mapObjects, true, null);
                    console.log("[Lyra VTT] Cenário do mapa carregado diretamente no objeto Map!");
                }

                const varUrl = scene.getVariables().get("Map_URL") || scene.getVariables().getFromIndex(4);
                const varCell = scene.getVariables().get("CellSize") || scene.getVariables().getFromIndex(13);
                if (varUrl) varUrl.setString(safeUrl);
                if (varCell) {
                    varCell.getChild("X").setNumber(Number(cellSize) || 64);
                    varCell.getChild("Y").setNumber(Number(cellSize) || 64);
                }
            } catch (e) {}
        });
    },

    /**
     * Envia os tokens dos jogadores (viajantes) para o VTT com resolução de dados completa (ataques, magias, PV, CA, atributos e token)
     */
    async loadPlayers(players = []) {
        const validPlayers = Array.isArray(players) ? players : [players];
        const payload = {
            type: "LoadPlayer",
            content: {
                nPlayers: validPlayers.length,
                players: validPlayers.map(p => ({
                    fichaId: String(p.fichaId || p.characterId || p.id || ""),
                    position: {
                        x: Number(p.x !== undefined ? p.x : (p.position?.x ?? 6)),
                        y: Number(p.y !== undefined ? p.y : (p.position?.y ?? 5))
                    }
                }))
            }
        };

        // 1. Envia via canal de mensagens JSON estruturado
        this.sendToVTT(payload);

        // 2. Injeção direta de ficha e cartas no runtime da cena para confiabilidade máxima
        for (const p of validPlayers) {
            const fichaId = String(p.fichaId || p.characterId || p.id || "");
            if (!fichaId) continue;

            try {
                const fichaRef = doc(db, "fichas", fichaId);
                const snap = await getDoc(fichaRef);
                let fichaData = snap.exists() ? snap.data() : null;

                if (!fichaData) {
                    fichaData = {
                        name: p.characterName || p.name || "Aventureiro",
                        tokenUrl: p.tokenUrl || "https://raw.githubusercontent.com/Leosdc/lyra-the-wise-webapp/dev/public/assets/tokens/default_char.png",
                        stats: { ac: 12, hp: 20, speed: 9 },
                        attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                        combat: { attacks: [] },
                        spells: { list: [] },
                        proficiencies_choice: { skills: [] }
                    };
                }

                // Normalizações cruciais exigidas pelo motor do GDevelop:
                // a. Imagem de token com URL 'http' válida (para checagem startsWith 'ht' do GDevelop)
                if (!fichaData.tokenUrl || !fichaData.tokenUrl.startsWith("http")) {
                    fichaData.tokenUrl = fichaData.avatar || fichaData.portraitUrl || "https://raw.githubusercontent.com/Leosdc/lyra-the-wise-webapp/dev/public/assets/tokens/default_char.png";
                }

                // b. Nome do herói
                fichaData.name = fichaData.name || fichaData.bio?.name || p.characterName || "Herói";

                // c. stats.speed como número para divisão matemática no grid
                if (!fichaData.stats) fichaData.stats = {};
                if (typeof fichaData.stats.speed === 'string') {
                    fichaData.stats.speed = parseFloat(fichaData.stats.speed) || 9;
                } else if (!fichaData.stats.speed) {
                    fichaData.stats.speed = 9;
                }

                // d. CA e HP
                fichaData.stats.ac = Number(fichaData.stats.ac || fichaData.combat?.ac || 10);
                if (!fichaData.stats.hp && fichaData.combat?.hp) {
                    fichaData.stats.hp = fichaData.combat.hp.current || 20;
                }

                // e. Atributos
                if (!fichaData.attributes) {
                    fichaData.attributes = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
                }

                // f. Magias, ataques e perícias para geração de Action Cards
                if (!fichaData.combat) fichaData.combat = { attacks: [] };
                if (!fichaData.combat.attacks) fichaData.combat.attacks = [];
                if (!fichaData.spells) fichaData.spells = { list: [] };
                if (!fichaData.spells.list) fichaData.spells.list = [];
                if (!fichaData.proficiencies_choice) fichaData.proficiencies_choice = { skills: [] };

                // Injeta diretamente na cena em runtime
                this.waitForGame((game, scene) => {
                    try {
                        const varNewChar = scene.getVariables().get("NewChar_FireBase") || scene.getVariables().getFromIndex(24);
                        const varError = scene.getVariables().get("NewChar_FireBase_Error") || scene.getVariables().getFromIndex(25);
                        const varList = scene.getVariables().get("LoadPlayer_List") || scene.getVariables().getFromIndex(38);
                        const varLoadOn = scene.getVariables().get("PlayerLoadOn") || scene.getVariables().getFromIndex(41);

                        if (varNewChar && varError) {
                            varNewChar.fromJSObject(fichaData);
                            varError.setString("ok");

                            const listData = [{
                                fichaId: fichaId,
                                position: {
                                    x: Number(p.x !== undefined ? p.x : (p.position?.x ?? 6)),
                                    y: Number(p.y !== undefined ? p.y : (p.position?.y ?? 5))
                                }
                            }];
                            if (varList) varList.fromJSObject(listData);
                            if (varLoadOn) varLoadOn.setBoolean(true);

                            const win = this.iframeEl?.contentWindow;
                            if (win && win.gdjs?.MapaCode?.eventsList149) {
                                win.gdjs.MapaCode.eventsList149(scene);
                            }
                            console.log(`[Lyra VTT] Ficha ${fichaId} (${fichaData.name}) instanciada com sucesso no runtime da cena!`);
                        }
                    } catch (injErr) {
                        console.warn("[Lyra VTT] Falha na injeção direta de ficha:", injErr);
                    }
                });

            } catch (err) {
                console.warn(`[Lyra VTT] Erro ao carregar ficha ${fichaId} do Firestore:`, err);
            }
        }
    },

    /**
     * Envia os monstros/NPCs para o VTT
     */
    loadNPCs(npcs = []) {
        const validNPCs = Array.isArray(npcs) ? npcs : [npcs];
        const payload = {
            type: "LoadNPC",
            content: {
                nNPC: validNPCs.length,
                NPCs: validNPCs.map(n => ({
                    fichaId: String(n.fichaId || n.id || ""),
                    collection: n.collection || "user_monsters",
                    position: {
                        x: Number(n.x !== undefined ? n.x : (n.position?.x ?? 5)),
                        y: Number(n.y !== undefined ? n.y : (n.position?.y ?? 5))
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
        this._isDestroyed = true;
        if (this.sessionUnsubscribe) {
            this.sessionUnsubscribe();
            this.sessionUnsubscribe = null;
        }
        if (this._messageListener) {
            window.removeEventListener('message', this._messageListener);
            this._messageListener = null;
        }
        this.gameInstance = null;
        this.iframeEl = null;
        this.sessionId = null;
        this._lastRemoteTime = 0;
        this._lastLocalTime = 0;
        console.log("[Lyra VTT] Integração desfeita.");
    },

    /**
     * Manipula as mensagens postMessage vindas do GDevelop VTT
     */
    async handleVTTMessage(event) {
        if (!event.data) return;

        let data = event.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                return;
            }
        }

        if (!data || typeof data !== 'object') return;
        const { type, content } = data;
        if (!type) return;

        // Trata mensagens de estado de sessão vindas do GDevelop
        const isSessionBroadcast = /AttSession|UpDateSession|Iniciative|LogSend/i.test(type);
        if (isSessionBroadcast) {
            if (!this.sessionId) {
                console.warn("[Lyra VTT] Mensagem recebida do VTT, mas nenhum sessionId ativo foi configurado.");
                return;
            }

            const now = Date.now();
            this._lastLocalTime = now;

            try {
                const rawSanitized = this.sanitizeForFirestore(content || {});
                if (typeof rawSanitized === 'object' && rawSanitized !== null) {
                    rawSanitized.Time = now;
                }
                const sanitizedContent = this.convertNestedArraysForFirestore(rawSanitized);

                // 1. Atualiza diretamente o documento da sessão em 'sessoes' com merge: true
                const sessionRef = doc(db, "sessoes", this.sessionId);
                
                // Incorpora dados do mapa em data.Map para atender à checagem do GDevelop
                if (this._currentMapData && sanitizedContent && !sanitizedContent.Map) {
                    sanitizedContent.Map = this._currentMapData;
                }

                const sessionPayload = {
                    data: sanitizedContent, // Campo aninhado 'data' exigido pelo LoadSessionFirebase do GDevelop
                    AttSession: sanitizedContent,
                    vttVariables: sanitizedContent,
                    updatedAt: serverTimestamp()
                };

                // Espelha propriedades táticas raiz para leitura direta
                if (sanitizedContent && typeof sanitizedContent === 'object') {
                    if (sanitizedContent.Tile_Matriz !== undefined) sessionPayload.Tile_Matriz = sanitizedContent.Tile_Matriz;
                    if (sanitizedContent.Players !== undefined) sessionPayload.Players = sanitizedContent.Players;
                    if (sanitizedContent.Iniciative !== undefined) sessionPayload.Iniciative = sanitizedContent.Iniciative;
                    if (sanitizedContent.Objects !== undefined) sessionPayload.Objects = sanitizedContent.Objects;
                    if (sanitizedContent.Itens !== undefined) sessionPayload.Itens = sanitizedContent.Itens;
                    if (sanitizedContent.Act_Scene_State !== undefined) sessionPayload.Act_Scene_State = sanitizedContent.Act_Scene_State;
                    if (sanitizedContent.Time !== undefined) sessionPayload.Time = sanitizedContent.Time;
                    if (sanitizedContent.Att !== undefined) sessionPayload.Att = sanitizedContent.Att;
                }

                await setDoc(sessionRef, sessionPayload, { merge: true });

                // 2. Mantém espelho na coleção 'vtt' para contingência
                const vttRef = doc(db, "vtt", this.sessionId);
                await setDoc(vttRef, {
                    Data: sanitizedContent,
                    Time: now,
                    updatedAt: serverTimestamp()
                }, { merge: true }).catch(() => {});

                console.log(`[Lyra VTT] Estado da sessão sincronizado no Firestore (Tipo: ${type}, Time: ${now})`);
            } catch (err) {
                console.error("[Lyra VTT] Falha ao persistir estado do VTT no Firestore:", err);
            }
        }
    },

    /**
     * Valida e sanitiza objetos recursivamente para conformidade com o Firestore
     */
    sanitizeForFirestore(obj) {
        if (obj === null || obj === undefined) return null;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeForFirestore(item));
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            const cleanKey = key.replace(/[\.\*\[\]\/]/g, '_');
            if (cleanKey && value !== undefined) {
                sanitized[cleanKey] = this.sanitizeForFirestore(value);
            }
        }
        return sanitized;
    },

    /**
     * Converte matrizes/arrays aninhados recursivamente para objetos numéricos para atender à restrição do Firestore
     */
    convertNestedArraysForFirestore(obj) {
        if (Array.isArray(obj)) {
            const hasNestedArray = obj.some(item => Array.isArray(item));
            if (hasNestedArray) {
                const mapObj = {};
                obj.forEach((item, idx) => {
                    mapObj[String(idx)] = this.convertNestedArraysForFirestore(item);
                });
                return mapObj;
            } else {
                return obj.map(item => this.convertNestedArraysForFirestore(item));
            }
        } else if (obj !== null && typeof obj === 'object') {
            const res = {};
            for (const [k, v] of Object.entries(obj)) {
                const cleanKey = k.replace(/[\.\*\[\]\/]/g, '_');
                res[cleanKey] = this.convertNestedArraysForFirestore(v);
            }
            return res;
        }
        return obj;
    },

    /**
     * Converte objetos numéricos do Firestore ({ "0": { "0": [...] } }) de volta para matrizes nativas do GDevelop
     */
    restoreArraysFromFirestore(obj) {
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.restoreArraysFromFirestore(item));
        }

        const keys = Object.keys(obj);
        const isNumericIndexMap = keys.length > 0 && keys.every(k => /^\d+$/.test(k));

        if (isNumericIndexMap) {
            const arr = [];
            const sortedIndices = keys.map(Number).sort((a, b) => a - b);
            for (const idx of sortedIndices) {
                arr.push(this.restoreArraysFromFirestore(obj[String(idx)]));
            }
            return arr;
        }

        const restored = {};
        for (const [k, v] of Object.entries(obj)) {
            restored[k] = this.restoreArraysFromFirestore(v);
        }
        return restored;
    }
};

window.VTTIntegration = VTTIntegration;

