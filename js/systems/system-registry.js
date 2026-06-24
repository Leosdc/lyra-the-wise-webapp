/**
 * System Registry — Singleton
 * Ponto central de registro e consulta de sistemas de RPG.
 * Todo módulo que precisa de lógica específica do sistema consulta este registry.
 */

import { validateSystemPlugin } from './system-interface.js';
import { logger } from '../logger.js';

const SystemRegistry = {
    /** @type {Map<string, import('./system-interface.js').SystemPlugin>} */
    _systems: new Map(),

    /** @type {string|null} */
    _currentId: null,

    /**
     * Registra um novo plugin de sistema.
     * Valida o contrato antes de aceitar.
     *
     * @param {import('./system-interface.js').SystemPlugin} plugin
     * @throws {Error} Se o plugin não implementar os métodos obrigatórios
     */
    register(plugin) {
        if (!plugin || !plugin.id) {
            throw new Error('SystemRegistry: plugin inválido — propriedade "id" é obrigatória.');
        }

        const { valid, missing } = validateSystemPlugin(plugin);
        if (!valid) {
            logger.warn(
                `SystemRegistry: plugin "${plugin.id}" registrado com métodos faltantes: ${missing.join(', ')}. ` +
                `O sistema pode não funcionar completamente.`
            );
        }

        this._systems.set(plugin.id, plugin);
        logger.info(`SystemRegistry: sistema "${plugin.id}" (${plugin.name}) registrado com sucesso.`);
    },

    /**
     * Retorna o plugin de um sistema específico.
     *
     * @param {string} systemId
     * @returns {import('./system-interface.js').SystemPlugin|null}
     */
    get(systemId) {
        return this._systems.get(systemId) || null;
    },

    /**
     * Retorna o plugin do sistema atualmente selecionado.
     * Fallback para 'dnd5e' se nenhum estiver definido.
     *
     * @returns {import('./system-interface.js').SystemPlugin|null}
     */
    getCurrent() {
        const id = this._currentId || 'dnd5e';
        return this.get(id);
    },

    /**
     * Define o sistema ativo.
     *
     * @param {string} systemId
     * @returns {boolean} true se o sistema existe e foi selecionado
     */
    setCurrent(systemId) {
        if (!systemId) {
            logger.warn('SystemRegistry: tentativa de setCurrent com id vazio.');
            return false;
        }

        this._currentId = systemId;

        if (!this._systems.has(systemId)) {
            logger.warn(
                `SystemRegistry: sistema "${systemId}" selecionado mas não registrado. ` +
                `Funcionalidades específicas não estarão disponíveis.`
            );
            return false;
        }

        logger.info(`SystemRegistry: sistema ativo alterado para "${systemId}".`);
        return true;
    },

    /**
     * Retorna o ID do sistema atualmente selecionado.
     *
     * @returns {string}
     */
    getCurrentId() {
        return this._currentId || 'dnd5e';
    },

    /**
     * Retorna todos os sistemas registrados.
     *
     * @returns {import('./system-interface.js').SystemPlugin[]}
     */
    getAll() {
        return Array.from(this._systems.values());
    },

    /**
     * Retorna apenas os sistemas com implemented === true.
     *
     * @returns {import('./system-interface.js').SystemPlugin[]}
     */
    getImplemented() {
        return this.getAll().filter(s => s.implemented === true);
    },

    /**
     * Verifica se um sistema está registrado e implementado.
     *
     * @param {string} systemId
     * @returns {boolean}
     */
    isImplemented(systemId) {
        const system = this.get(systemId);
        return system?.implemented === true;
    },

    /**
     * Verifica se um sistema está registrado (independente de estar implementado).
     *
     * @param {string} systemId
     * @returns {boolean}
     */
    isRegistered(systemId) {
        return this._systems.has(systemId);
    },

    /**
     * Executa um método do sistema atual com fallback seguro.
     * Útil para métodos opcionais que podem não existir.
     *
     * @param {string} methodName - Nome do método a executar
     * @param {*} fallback - Valor de retorno caso o método não exista
     * @param  {...any} args - Argumentos a passar ao método
     * @returns {*}
     */
    callCurrent(methodName, fallback, ...args) {
        const system = this.getCurrent();
        if (!system) {
            logger.warn(`SystemRegistry.callCurrent: nenhum sistema ativo.`);
            return fallback;
        }

        if (typeof system[methodName] !== 'function') {
            return fallback;
        }

        try {
            return system[methodName](...args);
        } catch (err) {
            logger.error(`SystemRegistry: erro ao executar "${methodName}" no sistema "${system.id}":`, err);
            return fallback;
        }
    }
};

export default SystemRegistry;
