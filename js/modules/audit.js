import { db } from '../auth.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    collection, getDocs, query, where, doc, deleteDoc, orderBy
} from "firebase/firestore";
import { COLLECTIONS } from '../data.js';

const AuditModule = {
    users: [],
    selectedUser: null,
    selectedCategory: 'CHARACTERS',

    async init() {
        console.log("📜 Iniciando Auditor Arcano...");
        this.bindEvents();
        this.checkAuth();
    },

    bindEvents() {
        document.getElementById('audit-user-select').addEventListener('change', (e) => {
            this.selectedUser = e.target.value;
            this.fetchData();
        });

        document.getElementById('audit-category-select').addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.fetchData();
        });
    },

    checkAuth() {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if user is GM
                const userDoc = await getDocs(query(collection(db, COLLECTIONS.USERS), where("email", "==", user.email)));
                if (!userDoc.empty && userDoc.docs[0].data().role === 'gm') {
                    this.loadUsers();
                } else {
                    alert("Acesso Negado: Apenas GMs podem consultar o Grande Arquivo.");
                    window.location.href = 'index.html';
                }
            } else {
                window.location.href = 'index.html';
            }
        });
    },

    async loadUsers() {
        this.toggleLoading(true, "Convocando todos os habitantes...");
        try {
            const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
            this.users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (a.displayName || a.nickname || "").localeCompare(b.displayName || b.nickname || ""));

            const select = document.getElementById('audit-user-select');
            this.users.forEach(user => {
                const opt = document.createElement('option');
                opt.value = user.id;
                opt.textContent = `${user.nickname || user.displayName || 'Anônimo'} (${user.email})`;
                select.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
        } finally {
            this.toggleLoading(false);
        }
    },

    async fetchData() {
        if (!this.selectedUser) {
            this.renderEmpty();
            return;
        }

        this.toggleLoading(true, "Consultando registros...");
        const container = document.getElementById('audit-results');
        const countSpan = document.getElementById('record-count');
        const statsDiv = document.getElementById('result-stats');

        try {
            const collName = COLLECTIONS[this.selectedCategory];
            const q = query(
                collection(db, collName),
                where("userId", "==", this.selectedUser)
            );

            const snap = await getDocs(q);
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            countSpan.textContent = items.length;
            statsDiv.classList.remove('hidden');

            if (items.length === 0) {
                this.renderEmpty("Nenhum registro encontrado para este viajante nesta categoria.");
                return;
            }

            container.innerHTML = items.map(item => {
                const title = item.name || item.title || "Sem Nome";
                const subtext = item.systemId ? `Sistema: ${item.systemId.toUpperCase()}` : (item.type || item.category || "Registro Geral");
                const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Data Antiga");

                return `
                    <div class="audit-card" id="card-${item.id}">
                        <div class="card-info">
                            <span class="card-title">${title}</span>
                            <span class="card-subtext">${subtext} | Criado em: ${date}</span>
                            <span class="card-subtext" style="font-size: 0.7rem; opacity: 0.5;">ID: ${item.id}</span>
                            
                            <div class="card-actions-inline" style="margin-top: 15px;">
                                <button class="medieval-btn small delete-btn" style="width: fit-content;" onclick="AuditModule.handleDelete('${this.selectedCategory}', '${item.id}')">
                                    <i class="fas fa-trash"></i> Excluir Registro Definitivamente
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (err) {
            console.error(err);
            container.innerHTML = `<p style="color:red">Erro ao buscar dados: ${err.message}</p>`;
        } finally {
            this.toggleLoading(false);
        }
    },

    async handleDelete(category, id) {
        const msg = "Tem certeza que deseja apagar este registro permanentemente do multiverso? Esta ação não pode ser desfeita.";
        const confirmed = window.app?.showConfirm ? await window.app.showConfirm(msg, "Expurgar Registro") : confirm(msg);
        if (!confirmed) return;

        this.toggleLoading(true, "Expurgando registro...");
        try {
            const collName = COLLECTIONS[category] || category; // Fallback to category string
            await deleteDoc(doc(db, collName, id));

            const card = document.getElementById(`card-${id}`);
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => card.remove(), 300);
            }

            // Update count
            const countSpan = document.getElementById('record-count');
            if (countSpan) countSpan.textContent = Math.max(0, parseInt(countSpan.textContent) - 1);

            if (window.app?.showAlert) window.app.showAlert("Registro removido com sucesso.");

        } catch (err) {
            console.error("Erro ao deletar:", err);
            if (window.app?.showAlert) window.app.showAlert("Erro ao expurgar: " + err.message);
            else alert("Erro ao expurgar: " + err.message);
        } finally {
            this.toggleLoading(false);
        }
    },

    renderEmpty(msg = "Selecione um usuário para iniciar a auditoria.") {
        document.getElementById('audit-results').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>${msg}</p>
            </div>
        `;
        document.getElementById('result-stats').classList.add('hidden');
    },

    toggleLoading(show, text = "") {
        const overlay = document.getElementById('loading-overlay');
        const textSpan = document.getElementById('loading-text');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
            if (text) textSpan.textContent = text;
        }
    }
};

window.AuditModule = AuditModule;
window.addEventListener('DOMContentLoaded', () => AuditModule.init());
