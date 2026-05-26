/**
 * System Character Migrator
 * Lógica de migração transparente (lazy migration) para fichas de personagem.
 * Garante compatibilidade de fichas legadas D&D 5e com a nova arquitetura agnóstica de sistemas.
 */

import { logger } from '../logger.js';
import SystemRegistry from './system-registry.js';

/**
 * Realiza a migração de uma ficha de personagem se ela for de um formato legado.
 *
 * @param {Object} char - Os dados brutos do personagem vindos do banco de dados
 * @returns {{ migratedChar: Object, wasMigrated: boolean }}
 */
export function migrateCharacter(char) {
    if (!char) {
        return { migratedChar: null, wasMigrated: false };
    }

    let wasMigrated = false;
    const migratedChar = JSON.parse(JSON.stringify(char));

    // 1. Garantir systemId (legados D&D 5e não possuíam este campo)
    if (!migratedChar.systemId) {
        migratedChar.systemId = 'dnd5e';
        wasMigrated = true;
        logger.info(`SystemMigrator: Definindo systemId="dnd5e" para o personagem legado "${migratedChar.bio?.name || char.id}"`);
    }

    // 2. Garantir systemVersion
    if (!migratedChar.systemVersion) {
        migratedChar.systemVersion = '1.0.0';
        wasMigrated = true;
    }

    // 3. Garantir estrutura do template do sistema
    const system = SystemRegistry.get(migratedChar.systemId) || SystemRegistry.getCurrent();
    if (system && typeof system.getTemplate === 'function') {
        const template = system.getTemplate();
        
        // Garante que seções críticas de dados existam (bio, attributes, stats, proficiencies_choice, inventory, spells, story)
        const criticalSections = ['bio', 'attributes', 'stats', 'proficiencies_choice', 'inventory', 'spells', 'story'];
        for (const section of criticalSections) {
            if (!migratedChar[section] || typeof migratedChar[section] !== 'object') {
                migratedChar[section] = template[section] ? JSON.parse(JSON.stringify(template[section])) : {};
                wasMigrated = true;
                logger.info(`SystemMigrator: Seção crítica "${section}" restaurada/inicializada para "${migratedChar.bio?.name || char.id}"`);
            } else if (template[section]) {
                // Garante que campos internos cruciais existam dentro de cada seção
                for (const [key, val] of Object.entries(template[section])) {
                    if (migratedChar[section][key] === undefined || migratedChar[section][key] === null) {
                        migratedChar[section][key] = val;
                        wasMigrated = true;
                    }
                }
            }
        }
    }

    return {
        migratedChar,
        wasMigrated
    };
}
