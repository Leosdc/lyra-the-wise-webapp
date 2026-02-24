
import * as DataModule from '../data.js';
import { NavigationModule } from './navigation.js';
import { spellsData } from '../../public/assets/systems/dnd5e/spells_data.js';
import { db } from '../auth.js';
import { collection, doc, writeBatch } from "firebase/firestore";

export const AdminModule = {
    users: [],
    stats: {
        users: 0,
        activeUsers: 0,
        aiActive: true,
        maintenanceMode: false
    },
    unsubscribeOnline: null,

    async init() {
        this.bindEvents();

        // Subscribe to online users globally for stats
        if (this.unsubscribeOnline) this.unsubscribeOnline();
        this.unsubscribeOnline = DataModule.subscribeToOnlineUsers((onlineUsers) => {
            this.stats.activeUsers = onlineUsers.length;
            this.updateStatsUI();
        });
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
    },

    async loadPortal() {
        try {
            // Load stats first
            const config = await DataModule.getGlobalConfig();
            this.stats.aiActive = config.aiActive ?? true;
            this.stats.maintenanceMode = config.maintenanceMode ?? false;

            this.users = await DataModule.getAllUsers();
            this.stats.users = this.users.length;

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
        document.getElementById('admin-active-users').textContent = this.stats.activeUsers;
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
                <div class="user-audit-card theme-aware">
                    <div class="user-card-header">
                        <div class="user-main-info">
                            ${avatarHtml}
                            <div class="user-details">
                                <span class="user-name">${user.nickname || user.displayName || 'Anônimo'}</span>
                                <span class="user-email">${user.email}</span>
                            </div>
                        </div>
                        <div class="user-badges">
                            <span class="badge ${user.role === 'gm' ? 'gold' : 'silver'}">${user.role === 'gm' ? 'Mestre' : 'Viajante'}</span>
                            <span class="badge ${user.status === 'banned' ? 'danger' : 'success'}">${user.status === 'banned' ? 'Banido' : 'Ativo'}</span>
                            <span class="badge ${user.aiEnabled !== false ? 'arcane' : 'muted'}" title="Acesso ao Oráculo">
                                <i class="fas fa-brain"></i> ${user.aiEnabled !== false ? 'Desperta' : 'Silenciada'}
                            </span>
                        </div>
                    </div>

                    <div class="user-card-footer">
                        <div class="user-id-box">UID: ${user.id}</div>
                        <div class="user-actions-beautified">
                            <!-- Feature Toggles -->
                            <button class="action-btn ${user.aiEnabled !== false ? '' : 'active'}" onclick="AdminModule.toggleUserAI('${user.id}', ${user.aiEnabled !== false})" title="Alternar Oráculo">
                                <i class="fas fa-brain"></i>
                            </button>
                            <button class="action-btn ${user.alphaTester ? 'active-alpha' : ''}" onclick="AdminModule.toggleUserAlpha('${user.id}', ${user.alphaTester || false})" title="Acesso Alpha">
                                <i class="fas fa-flask"></i>
                            </button>
                            
                            <!-- Hierarchy -->
                            <button class="action-btn promote ${user.role === 'gm' ? 'demote' : ''}" onclick="AdminModule.toggleUserRole('${user.id}', '${user.role}')" title="${user.role === 'gm' ? 'Rebaixar' : 'Promover'}">
                                <i class="fas ${user.role === 'gm' ? 'fa-angle-down' : 'fa-crown'}"></i>
                                <span>${user.role === 'gm' ? 'Rebaixar' : 'Promover'}</span>
                            </button>

                            <div class="action-divider"></div>

                            <!-- Danger Zone -->
                            <button class="action-btn ban ${user.status === 'banned' ? 'unban' : ''}" onclick="AdminModule.toggleUserStatus('${user.id}', '${user.status}')" title="${user.status === 'banned' ? 'Desbanir' : 'Banir'}">
                                <i class="fas ${user.status === 'banned' ? 'fa-hand-holding-heart' : 'fa-gavel'}"></i>
                            </button>
                            <button class="action-btn delete" onclick="AdminModule.deleteUser('${user.id}')" title="Expurgar">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
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

    async deleteUser(userId) {
        const msg = "TEM CERTEZA? Esta ação apagará permanentemente o perfil do usuário do Grande Arquivo (mas não suas fichas e itens). Esta é uma ação irreversível.";
        if (await window.app.showConfirm(msg, "EXPURGO DEFINITIVO")) {
            try {
                await DataModule.deleteUserProfile(userId);
                window.app.showAlert("Usuário expurgado com sucesso.");
                this.loadPortal(); // Refresh
            } catch (err) {
                window.app.showAlert("Erro ao expurgar: " + err.message);
            }
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
};

window.AdminModule = AdminModule; // Export for onclick handlers
