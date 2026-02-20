/**
 * Content Parser Module
 * Parses AI responses for items and NPCs, saves them to session
 */

import { db } from "../auth.js";
import {
    doc,
    updateDoc,
    arrayUnion
} from "firebase/firestore";
import { escapeHTML } from "./utils.js";

const ContentParser = {

    parseOracleResponse(text, sessionId) {
        const items = this.extractItems(text);
        const npcs = this.extractNPCs(text);

        // REMOVED: Combat extraction now handled by OracleModule.displayOracleMessage()
        // This avoids duplicate combat initiation
        // const combat = this.extractCombat(text);

        // Save to session if found
        if (items.length > 0) {
            this.saveSessionItems(sessionId, items);
        }

        if (npcs.length > 0) {
            this.saveSessionNPCs(sessionId, npcs);
        }

        // REMOVED: Combat triggering (now in Oracle)
        // if (combat.monsters.length > 0) {
        //     console.log(`⚔️ Content Parser: Combate detectado! Monstros: ${combat.monsters.join(', ')}`);
        //     this.triggerCombat(sessionId, combat.monsters);
        // }

        return { items, npcs };
    },

    extractItems(text) {
        // Regex: [ITEM: Nome | Descrição | Propriedades]
        const regex = /\[ITEM:\s*([^|]+)\|([^|]+)\|([^\]]+)\]/g;
        const items = [];

        let match;
        while ((match = regex.exec(text)) !== null) {
            items.push({
                name: match[1].trim(),
                description: match[2].trim(),
                properties: match[3].trim(),
                source: 'oracle',
                temporary: true,
                createdAt: new Date().toISOString()
            });
        }

        return items;
    },

    extractNPCs(text) {
        // Regex: [NPC: Nome | Raça/Tipo | Descrição]
        const regex = /\[NPC:\s*([^|]+)\|([^|]+)\|([^\]]+)\]/g;
        const npcs = [];

        let match;
        while ((match = regex.exec(text)) !== null) {
            npcs.push({
                name: match[1].trim(),
                race: match[2].trim(),
                description: match[3].trim(),
                source: 'oracle',
                createdAt: new Date().toISOString()
            });
        }

        return npcs;
    },

    extractCombat(text) {
        // Regex: [COMBAT: Monster1, Monster2, Monster3]
        const regex = /\[COMBAT:\s*([^\]]+)\]/g;
        const monsters = [];

        let match;
        while ((match = regex.exec(text)) !== null) {
            // Split by comma and trim each monster name
            const monsterNames = match[1].split(',').map(m => m.trim());
            monsters.push(...monsterNames);
        }

        return { monsters };
    },

    async triggerCombat(sessionId, monsters) {
        try {
            console.log(`⚔️ Iniciando combate automático com: ${monsters.join(', ')}`);

            // Import CombatEngine dynamically
            const { default: CombatEngine } = await import('./combat-engine.js');

            // Initialize combat with detected monsters
            await CombatEngine.initCombat(sessionId, monsters);

            console.log(`✅ Combate iniciado automaticamente pela IA`);
        } catch (error) {
            console.error("❌ Erro ao iniciar combate automático:", error);
        }
    },

    async saveSessionItems(sessionId, items) {
        try {
            const sessionRef = doc(db, "sessoes", sessionId);

            for (const item of items) {
                await updateDoc(sessionRef, {
                    sessionItems: arrayUnion(item)
                });
            }

            console.log(`📦 Content Parser: ${items.length} itens salvos na sessão`);
        } catch (error) {
            console.error("Erro ao salvar itens da sessão:", error);
        }
    },

    async saveSessionNPCs(sessionId, npcs) {
        try {
            const sessionRef = doc(db, "sessoes", sessionId);

            for (const npc of npcs) {
                await updateDoc(sessionRef, {
                    sessionNPCs: arrayUnion(npc)
                });
            }

            console.log(`👥 Content Parser: ${npcs.length} NPCs salvos na sessão`);
        } catch (error) {
            console.error("Erro ao salvar NPCs da sessão:", error);
        }
    },

    decorateText(text, knownNames = []) {
        if (!text) return "";

        let decorated = escapeHTML(text);

        // 1. First, protect ANY existing tags [TAG: ...] to avoid double-processing or mangling commands
        const placeholders = [];
        decorated = decorated.replace(/\[[A-Z]+:[^\]]+\]/g, (match) => {
            placeholders.push(match);
            return `__TAG_PLACEHOLDER_${placeholders.length - 1}__`;
        });

        // 2. Auto-Link names from knownNames list
        if (knownNames.length > 0) {
            // Sort names by length descending to catch longer names first (e.g., "Leonardo da Cruz" before "Leonardo")
            const sortedNames = [...knownNames].sort((a, b) => b.length - a.length);

            sortedNames.forEach(name => {
                if (!name || name.length < 3) return;

                // Escape regex special chars
                const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Escape for search in already escaped decorated text
                const htmlEscapedName = escapeHTML(name);

                // Word boundary regex to match exact name
                const regex = new RegExp(`(?<![\\w])(${htmlEscapedName})(?![\\w])`, 'g');

                decorated = decorated.replace(regex, (match) => {
                    return `<span class="inline-npc auto-link" data-name="${escapeHTML(name.trim())}" data-race="Manifestação" data-desc="Um aventureiro presente nesta jornada."><i class="fas fa-user-sparkles"></i> ${match}</span>`;
                });
            });
        }

        // 3. Restore and process tags
        placeholders.forEach((tag, i) => {
            let processedTag = tag;

            // Replace [ITEM: Nome | Descrição | Propriedades]
            // Note: tag parts are already escaped because 'decorated' was escaped at start
            processedTag = processedTag.replace(/\[ITEM:\s*([^|]+)\|([^|]+)\|([^\]]+)\]/g, (match, name, desc, props) => {
                return `<span class="inline-item" data-name="${name.trim()}" data-desc="${desc.trim()}" data-props="${props.trim()}"><i class="fas fa-gem"></i> ${name.trim()}</span>`;
            });

            // Replace [NPC: Nome | Raça/Tipo | Descrição]
            processedTag = processedTag.replace(/\[NPC:\s*([^|]+)\|([^|]+)\|([^\]]+)\]/g, (match, name, race, desc) => {
                return `<span class="inline-npc" data-name="${name.trim()}" data-race="${race.trim()}" data-desc="${desc.trim()}"><i class="fas fa-user-shield"></i> ${name.trim()}</span>`;
            });

            // Replace [MONSTER: Nome | Detalhes]
            processedTag = processedTag.replace(/\[MONSTER:\s*([^|]+)\|([^\]]+)\]/g, (match, name, details) => {
                return `<span class="inline-monster" data-name="${name.trim()}" data-details="${details.trim()}"><i class="fas fa-dragon"></i> ${name.trim()}</span>`;
            });

            decorated = decorated.replace(`__TAG_PLACEHOLDER_${i}__`, processedTag);
        });

        // 4. Convert markdown to HTML
        // Bold: **text** -> <strong>text</strong>
        decorated = decorated.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Italic: *text* -> <em>text</em> (single asterisks, not part of **)
        decorated = decorated.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        return decorated;
    }
};

window.ContentParser = ContentParser;
export default ContentParser;
