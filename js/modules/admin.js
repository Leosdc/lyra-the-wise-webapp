
import * as DataModule from '../data.js';
import { NavigationModule } from './navigation.js';
import { spellsData } from '../../public/assets/systems/dnd5e/spells_data.js';
import { db } from '../auth.js';
import { collection, doc, writeBatch } from "firebase/firestore";

export const AdminModule = {
    users: [],
    stats: {
        users: 0,
        sheets: 0,
        items: 0,
        aiActive: true,
        maintenanceMode: false
    },

    async init() {
        this.bindEvents();
    },

    bindEvents() {
        const toggleAiBtn = document.getElementById('admin-toggle-ai-btn');
        if (toggleAiBtn) {
            toggleAiBtn.addEventListener('click', () => this.handleToggleAI());
        }

        const toggleMaintenanceBtn = document.getElementById('admin-toggle-maintenance-btn');
        if (toggleMaintenanceBtn) {
            toggleMaintenanceBtn.addEventListener('click', () => this.handleToggleMaintenance());
        }

        const migrateRulesBtn = document.getElementById('admin-migrate-rules-btn');
        if (migrateRulesBtn) {
            migrateRulesBtn.addEventListener('click', () => this.handleMigrateRules());
        }

    },

    async loadPortal() {
        try {
            // Load stats first
            const config = await DataModule.getGlobalConfig();
            this.stats.aiActive = config.aiActive ?? true;
            this.stats.maintenanceMode = config.maintenanceMode ?? false;

            this.users = await DataModule.getAllUsers();
            this.stats.users = this.users.length;

            // Fetch character and item counts
            this.stats.sheets = await DataModule.getCollectionCount(DataModule.COLLECTIONS.CHARACTERS);
            const globalItems = await DataModule.getCollectionCount(DataModule.COLLECTIONS.GLOBAL_ITEMS);
            const userItems = await DataModule.getCollectionCount(DataModule.COLLECTIONS.USER_ITEMS);
            this.stats.items = globalItems + userItems;

            this.updateStatsUI();
            this.renderUserList();

        } catch (error) {
            console.error("Erro ao carregar portal admin:", error);
            if (error.code === 'permission-denied' || error.message.includes('permission')) {
                window.app.showAlert("Você não possui as credenciais de GM necessárias no Grande Arquivo (Firestore).", "Acesso Negado");
            } else {
                window.app.showAlert("Falha ao consultar os registros do multiverso.", "Erro de GM");
            }
            window.app.switchView('dashboard');
        }
    },

    updateStatsUI() {
        document.getElementById('admin-user-count').textContent = this.stats.users;
        document.getElementById('admin-total-sheets').textContent = this.stats.sheets;
        document.getElementById('admin-total-items').textContent = this.stats.items;
        document.getElementById('admin-ai-status').textContent = this.stats.aiActive ? 'Ativo' : 'Suspenso';

        const aiStatBubble = document.querySelector('.stat-bubble i.fa-brain').parentElement;
        if (aiStatBubble) {
            aiStatBubble.classList.toggle('disabled', !this.stats.aiActive);
        }

        const maintenanceBtn = document.getElementById('admin-toggle-maintenance-btn');
        if (maintenanceBtn) {
            maintenanceBtn.classList.toggle('active', this.stats.maintenanceMode);
            maintenanceBtn.innerHTML = this.stats.maintenanceMode ?
                '<i class="fas fa-hammer"></i> Encerrar Manutenção' :
                '<i class="fas fa-hammer"></i> Sistema em Manutenção';
        }
    },

    renderUserList() {
        const container = document.getElementById('admin-users-list');
        if (!container) return;

        if (this.users.length === 0) {
            container.innerHTML = '<p>Nenhum usuário registrado.</p>';
            return;
        }

        container.innerHTML = this.users.map(user => {
            const avatarHtml = user.photoURL
                ? `<img src="${user.photoURL}" class="user-audit-avatar">`
                : `<div class="user-audit-avatar fallback"><i class="fas fa-user-circle"></i></div>`;

            return `
                <div class="user-audit-card">
                    <div class="user-main-info">
                        ${avatarHtml}
                        <div class="user-details">
                            <span class="user-name">${user.nickname || user.displayName || 'Anônimo'}</span>
                            <span class="user-email">${user.email}</span>
                            <span class="user-id">UID: ${user.id}</span>
                        </div>
                    </div>
                    <div class="user-meta">
                        <span class="role-badge ${user.role}">${user.role || 'user'}</span>
                        <span class="status-badge ${user.status || 'active'}">${user.status || 'active'}</span>
                        <span class="ai-status-badge ${user.aiEnabled !== false ? 'active' : 'disabled'}">
                            <i class="fas fa-brain"></i> Mente ${user.aiEnabled !== false ? 'Desperta' : 'Silenciada'}
                        </span>
                        <span class="role-badge ${user.alphaTester ? 'alpha' : ''}" style="${user.alphaTester ? 'background: #e67e22; color: white;' : 'opacity: 0.5;'}">
                            <i class="fas fa-flask"></i> ${user.alphaTester ? 'Alpha Tester' : 'Beta'}
                        </span>
                    </div>
                    <div class="user-actions">
                        <button class="medieval-btn small" onclick="AdminModule.toggleUserAI('${user.id}', ${user.aiEnabled !== false})">
                            <i class="fas fa-microchip"></i> ${user.aiEnabled !== false ? 'Silenciar Oráculo' : 'Despertar Oráculo'}
                        </button>
                        <button class="medieval-btn small" onclick="AdminModule.toggleUserRole('${user.id}', '${user.role}')">
                            <i class="fas fa-crown"></i> ${user.role === 'gm' ? 'Rebaixar' : 'Promover'}
                        </button>
                        <button class="medieval-btn small" onclick="AdminModule.toggleUserAlpha('${user.id}', ${user.alphaTester || false})">
                            <i class="fas fa-vial"></i> Alpha
                        </button>
                        <button class="medieval-btn small secondary" onclick="AdminModule.toggleUserStatus('${user.id}', '${user.status}')">
                            <i class="fas fa-ban"></i> ${user.status === 'banned' ? 'Liberar' : 'Banir'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    async handleToggleAI() {
        const newState = !this.stats.aiActive;
        const msg = newState ? "Deseja reativar o Oráculo Arcano para todos os habitantes?" : "Deseja suspender as atividades do Oráculo Arcano globalmente?";
        const confirmed = await window.app.showConfirm(msg, "Alteração de Oráculo");

        if (confirmed) {
            try {
                await DataModule.updateGlobalConfig({ aiActive: newState });
                this.stats.aiActive = newState;
                this.updateStatsUI();
                window.app.showAlert(`Oráculo ${newState ? 'Reativado' : 'Suspenso'} com sucesso.`, "Decreto do GM");
            } catch (error) {
                console.error("Erro ao atualizar Mente Arcana:", error);
            }
        }
    },

    async toggleUserRole(userId, currentRole) {
        const newRole = currentRole === 'gm' ? 'user' : 'gm';
        const msg = `Tem certeza que deseja mudar o cargo deste usuário para ${newRole}?`;
        if (await window.app.showConfirm(msg, "Decreto de Cargo")) {
            await DataModule.updateUserRole(userId, newRole);
            this.loadPortal(); // Refresh
        }
    },

    async toggleUserAlpha(userId, currentStatus) {
        const newState = !currentStatus;
        const msg = newState ? "Conceder acesso Alpha (Tester) a este usuário?" : "Revogar acesso Alpha deste usuário?";
        if (await window.app.showConfirm(msg, "Acesso Alpha")) {
            await DataModule.updateUserAlphaStatus(userId, newState);
            this.loadPortal(); // Refresh
        }
    },

    async toggleUserStatus(userId, currentStatus) {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        const msg = newStatus === 'banned' ? "Deseja realmente banir este usuário das terras de Lyra?" : "Deseja revogar o banimento deste habitante?";
        if (await window.app.showConfirm(msg, "Sentença do GM")) {
            await DataModule.updateUserStatus(userId, newStatus);
            this.loadPortal(); // Refresh
        }
    },

    async toggleUserAI(userId, currentStatus) {
        const newState = !currentStatus;
        const msg = newState ? "Deseja reativar o Oráculo para este habitante?" : "Deseja silenciar o Oráculo para este habitante?";
        if (await window.app.showConfirm(msg, "Decreto Arcano")) {
            await DataModule.updateUserAIStatus(userId, newState);
            this.loadPortal(); // Refresh
        }
    },

    async handleToggleMaintenance() {
        const newState = !this.stats.maintenanceMode;
        const msg = newState ?
            "Deseja colocar o sistema em manutenção? Todos os habitantes (exceto GMs) serão impedidos de ver o Códice." :
            "Deseja reabrir as portas de Lyra para todos os habitantes?";

        if (await window.app.showConfirm(msg, "Gestão de Manutenção")) {
            try {
                await DataModule.updateGlobalConfig({ maintenanceMode: newState });
                this.stats.maintenanceMode = newState;
                this.updateStatsUI();
                window.app.showAlert(`Sistema ${newState ? 'em Manutenção' : 'Reaberto'} com sucesso.`, "Decreto do GM");
            } catch (error) {
                console.error("Erro ao atualizar manutenção:", error);
            }
        }
    },

    async handleMigrateMonsters() {
        const msg = "Deseja invocar todos os monstros do tomo local (JSON) para o Grande Arquivo (Firestore)?";
        if (!await window.app.showConfirm(msg, "Grande Migração")) return;

        window.app.toggleLoading(true);
        try {
            const response = await fetch('/assets/systems/dnd5e/dnd5e_monsters.json');
            const monsters = await response.json();

            // FireStore batches have a limit of 500 operations
            const BATCH_SIZE = 400;
            let count = 0;
            let batch = writeBatch(db);
            const monstersColl = collection(db, "systems", "dnd5e", "bestiary");

            for (const m of monsters) {
                const monsterDoc = {
                    name: m.name || "Sem Nome",
                    cr: m.challenge_rating || "0",
                    type: m.type || "Desconhecido",
                    size: m.size || "Médio",
                    systemId: "dnd5e",
                    secoes: {
                        ND: m.challenge_rating || "0",
                        Tipo: m.type || "Desconhecido",
                        Tamanho: m.size || "Médio",
                        Status: {
                            CA: m.armor_class || 10,
                            PV: m.hit_points || 0
                        },
                        Atributos: {
                            FOR: m.strength || 10,
                            DES: m.dexterity || 10,
                            CON: m.constitution || 10,
                            INT: m.intelligence || 10,
                            SAB: m.wisdom || 10,
                            CAR: m.charisma || 10
                        },
                        Descricao: m.special_abilities ? m.special_abilities.map(a => `**${a.name}**: ${a.desc}`).join('\n\n') : ""
                    }
                };

                const newRef = doc(monstersColl);
                batch.set(newRef, monsterDoc);
                count++;

                if (count % BATCH_SIZE === 0) {
                    await batch.commit();
                    batch = writeBatch(db);
                }
            }

            if (count % BATCH_SIZE !== 0) {
                await batch.commit();
            }

            window.app.showAlert(`${count} monstros migrados com sucesso ao Grande Arquivo.`, "Cripta Povoada");
        } catch (error) {
            console.error("Erro na migração:", error);
            window.app.showAlert("Falha ao translocar os monstros.", "Erro Arcano");
        } finally {
            window.app.toggleLoading(false);
        }
    },

    async handleMigrateSpells() {
        const msg = "Deseja transcrever todas as magias do tomo local para o Grande Arquivo?";
        if (!await window.app.showConfirm(msg, "Transcrição Arcana")) return;

        window.app.toggleLoading(true);
        try {
            const spells = spellsData.spells;
            const BATCH_SIZE = 400;
            let count = 0;
            let batch = writeBatch(db);
            const spellsColl = collection(db, "systems", "dnd5e", "spells");

            for (const s of spells) {
                const spellDoc = {
                    ...s,
                    systemId: spellsData.system || "dnd5e",
                    searchKeywords: [s.name.toLowerCase()]
                };

                const newRef = doc(spellsColl);
                batch.set(newRef, spellDoc);
                count++;

                if (count % BATCH_SIZE === 0) {
                    await batch.commit();
                    batch = writeBatch(db);
                }
            }

            if (count % BATCH_SIZE !== 0) {
                await batch.commit();
            }

            window.app.showAlert(`${count} magias transcritas com sucesso.`, "Grimório Povoado");
        } catch (error) {
            console.error("Erro na migração de magias:", error);
            window.app.showAlert("Falha ao transcrever as magias.", "Erro Arcano");
        } finally {
            window.app.toggleLoading(false);
        }
    },

    async handleMigrateRules() {
        const msg = "Deseja transcrever todas as REGRAS do tomo local para o Grande Arquivo?";
        if (!await window.app.showConfirm(msg, "Transcrição de Regras")) return;

        window.app.toggleLoading(true);
        try {
            const response = await fetch('/assets/systems/dnd5e/dnd5e_rules.json');
            const rules = await response.json();

            const BATCH_SIZE = 400;
            let count = 0;
            let batch = writeBatch(db);
            const rulesColl = collection(db, "systems", "dnd5e", DataModule.COLLECTIONS.RULES);

            for (const r of rules) {
                const ruleDoc = {
                    ...r,
                    systemId: "dnd5e"
                };

                const newRef = doc(rulesColl);
                batch.set(newRef, ruleDoc);
                count++;

                if (count % BATCH_SIZE === 0) {
                    await batch.commit();
                    batch = writeBatch(db);
                }
            }

            if (count % BATCH_SIZE !== 0) {
                await batch.commit();
            }

            window.app.showAlert(`${count} regras transcritas com sucesso ao Grande Arquivo.`, "Biblioteca Povoada");
        } catch (error) {
            console.error("Erro na migração de regras:", error);
            window.app.showAlert("Falha ao transcrever as regras.", "Erro Arcano");
        } finally {
            window.app.toggleLoading(false);
        }
    }

};

window.AdminModule = AdminModule; // Export for onclick handlers
