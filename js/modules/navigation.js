
import { getMonster, getTrap, getSession } from '../data.js';
import { escapeHTML } from './utils.js';

/**
 * Navigation Module
 * Handles View Switching, Side Menu, Scroll Indicators, and Quick Actions.
 */

export const NavigationModule = {

    // --- View Switching ---
    async switchView(viewId, loaders) {
        localStorage.setItem('lyra_current_view', viewId);
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            void targetView.offsetWidth;
            targetView.classList.add('view-enter');
        }

        if (viewId === 'fichas' && loaders.loadCharacters) await loaders.loadCharacters();
        if (viewId === 'monstros' && loaders.loadMonsters) await loaders.loadMonsters();
        if (viewId === 'armadilhas' && loaders.loadTraps) await loaders.loadTraps();
        if (viewId === 'sessoes' && loaders.loadSessions) await loaders.loadSessions();

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
        });

        document.body.style.overflow = 'auto';
        this.updateScrollIndicators();
    },

    // --- Menu ---
    toggleMenu(show) {
        const menu = document.getElementById('side-menu');
        if (menu) menu.classList.toggle('hidden', !show);
    },

    openMenuAtSection(sectionId) {
        this.toggleMenu(true);
        document.querySelectorAll('.menu-section').forEach(sec => {
            sec.style.display = (sec.dataset.section === sectionId || sectionId === 'all') ? 'block' : 'none';
        });
    },

    handleQuickAction(action, loaders) {
        this.toggleMenu(false);
        if (action === 'monster-gen' && loaders.showMonsterCreator) loaders.showMonsterCreator();
        else if (action === 'trap-gen' && loaders.showTrapCreator) loaders.showTrapCreator();
        else if (action === 'fichas') this.switchView('fichas', loaders);
        else {
            if (loaders.showAlert) loaders.showAlert(`Invocando magia para: ${action}.`, "Magia em Preparo");
        }
    },

    // --- Cards & Lists ---
    renderCard(item, type) {
        let subtitle = "";
        let tokenHtml = "";

        if (type === 'character') {
            const race = item.bio?.race || item.secoes?.basico?.Raça || '-';
            const clazz = item.bio?.class || item.secoes?.basico?.Classe || '-';
            const level = item.bio?.level || item.secoes?.basico?.Nível || 1;
            subtitle = `${race} | ${clazz} (Nív ${level})`;
            if (item.tokenUrl) tokenHtml = `<img src="${item.tokenUrl}" class="card-token" alt="Token">`;
        }
        if (type === 'monster') subtitle = `${item.secoes?.Tipo || ''} (ND ${item.secoes?.ND || '?'})`;
        if (type === 'trap') subtitle = `Perigo: ${item.secoes?.Dificuldade || 'Média'}`;
        if (type === 'session') subtitle = item.date ? new Date(item.date).toLocaleDateString() : 'Data desconhecida';

        return `
            <div class="medieval-card ${tokenHtml ? 'has-token' : ''}" data-id="${item.id}" data-type="${type}">
                <button class="card-delete-btn" title="Excluir"><i class="fas fa-trash-can"></i></button>
                <div class="card-glow"></div>
                ${tokenHtml}
                <div class="card-info">
                    <h3>${escapeHTML(item.name || item.title || 'Sem Nome')}</h3>
                    <span class="card-subtitle">${escapeHTML(subtitle)}</span>
                </div>
            </div>
        `;
    },

    async viewItem(type, id, context) {
        if (type === 'monster') await this.viewMonster(id, context);
        else if (type === 'trap') await this.viewTrap(id, context);
        else if (type === 'session') await this.viewSession(id, context);
    },

    async deleteItem(id, type, context) {
        const itemTypeLabel = {
            'character': 'este personagem',
            'monster': 'este monstro',
            'session': 'esta sessão',
            'trap': 'esta armadilha'
        }[type] || 'este item';

        const confirmed = await context.showConfirm(
            `Tem certeza que deseja apagar ${itemTypeLabel}? Esta ação não poderá ser desfeita.`,
            "Confirmar Exclusão"
        );

        if (!confirmed) return;

        try {
            if (type === 'character') await context.deleteCharacter(id);
            else if (type === 'monster') await context.deleteMonster(id);
            else if (type === 'session') await context.deleteSession(id);
            else if (type === 'trap') await context.deleteTrap(id);

            context.showAlert("Item excluído com sucesso.", "Cripta do Esquecimento");
            if (context.refreshList) context.refreshList(type);
        } catch (error) {
            console.error(error);
            context.showAlert("Erro ao excluir o item.", "Erro Arcano");
        }
    },

    async viewItem(type, id, context) {
        if (type === 'monster') return this.viewMonster(id, context);
        if (type === 'trap') return this.viewTrap(id, context);
        if (type === 'session') return this.viewSession(id, context);
        context.showAlert("Este item não pode ser visualizado desta forma.", "Mistério Arcano");
    },

    updateDropdownScroll(container) {
        if (!container) return;
        const wrapper = container.parentElement;
        const up = wrapper?.querySelector('.dropdown-scroll-arrow.up');
        const down = wrapper?.querySelector('.dropdown-scroll-arrow.down');

        if (!up || !down) return;

        const scrollPos = container.scrollTop;
        const containerHeight = container.clientHeight;
        const totalHeight = container.scrollHeight;
        const threshold = 5;

        const canScrollUp = scrollPos > threshold;
        const canScrollDown = scrollPos + containerHeight < totalHeight - threshold;

        up.classList.toggle('hidden', !canScrollUp);
        down.classList.toggle('hidden', !canScrollDown || totalHeight <= containerHeight);
    },

    async viewMonster(id, context) {
        context.openModal('detail-container');
        const monster = await getMonster(id);
        const container = document.getElementById('detail-container');
        if (container && monster) {
            container.classList.remove('hidden');
            const s = monster.secoes || {};
            container.innerHTML = `
                <div class="details-container">
                    <h2><i class="fas fa-dragon"></i> ${monster.name}</h2>
                    <p><strong>Tipo:</strong> ${s.Tipo || '?'}</p>
                    <p><strong>ND (Nível de Desafio):</strong> ${s.ND || '?'}</p>
                    <div class="vital-stats">
                        <div class="vital-box"><span>CA</span><strong>${s.Status?.CA || 10}</strong></div>
                        <div class="vital-box"><span>PV</span><strong>${s.Status?.PV || 10}</strong></div>
                    </div>
                    <div class="text-block">${s.Descricao || s.Habilidades || 'Sem descrição.'}</div>
                </div>
            `;
        }
    },

    async viewTrap(id, context) {
        context.openModal('detail-container');
        const trap = await getTrap(id);
        const container = document.getElementById('detail-container');
        if (container && trap) {
            container.classList.remove('hidden');
            const s = trap.secoes || {};
            container.innerHTML = `
                <div class="details-container">
                    <h2><i class="fas fa-skull-crossbones"></i> ${trap.name}</h2>
                    <p><strong>Dificuldade:</strong> ${s.Dificuldade || 'Média'}</p>
                    <p><strong>Dano Estimado:</strong> ${s.Dano || '1d6'}</p>
                    <div class="text-block">${s.Descricao || 'Sem descrição.'}</div>
                    <div class="text-block"><strong>Mecanismo:</strong> ${s.Mecanismo || 'Não especificado.'}</div>
                </div>
            `;
        }
    },

    async viewSession(id, context) {
        context.openModal('detail-container');
        const session = await getSession(id);
        const container = document.getElementById('detail-container');
        if (container && session) {
            container.classList.remove('hidden');
            container.innerHTML = `
                <div class="details-container">
                    <h2><i class="fas fa-book-open"></i> ${session.title}</h2>
                    <p><strong>Data:</strong> ${session.date ? new Date(session.date).toLocaleDateString() : 'Desconhecida'}</p>
                    <div class="text-block"><strong>Resumo:</strong> ${session.summary || 'Sem resumo.'}</div>
                    <div class="text-block"><strong>Notas:</strong> ${session.notes || 'Sem notas.'}</div>
                </div>
            `;
        }
    },

    updateHeaderTracker(char, isDamien) {
        const tracker = document.getElementById('header-char-tracker');
        if (!char) {
            tracker?.classList.add('hidden');
            return;
        }

        tracker?.classList.remove('hidden');

        const tokenEl = document.getElementById('header-token');
        if (tokenEl) tokenEl.src = char.tokenUrl || (isDamien ? 'assets/Damien_Token.png' : 'assets/Lyra_Token.png');

        const nameEl = document.getElementById('header-name');
        if (nameEl) nameEl.innerText = char.name || char.bio?.name || 'Sem Nome';

        const level = char.bio?.level || char.secoes?.basico?.Nível || 1;
        const race = char.bio?.race || char.secoes?.basico?.Raça || 'Raça?';
        const clazz = char.bio?.class || char.secoes?.basico?.Classe || 'Classe?';

        const infoEl = document.getElementById('header-info');
        if (infoEl) infoEl.innerText = `${race} ${clazz} (Nív ${level})`;

        const hpCurr = char.stats?.hp_current ?? char.secoes?.combate?.HP ?? 10;
        const hpMax = char.stats?.hp_max ?? char.secoes?.combate?.HP_Max ?? 10;
        const ac = char.stats?.ac ?? char.secoes?.combate?.CA ?? 10;

        const hpBar = document.getElementById('header-hp-bar');
        if (hpBar) hpBar.style.width = `${Math.min((hpCurr / hpMax) * 100, 100)}%`;

        const hpText = document.getElementById('header-hp-text');
        if (hpText) hpText.innerText = `${hpCurr}/${hpMax}`;

        const acVal = document.getElementById('header-ac-val');
        if (acVal) acVal.innerText = ac;

        const ini = char.stats?.initiative ?? 0;
        const iniVal = document.getElementById('header-ini-val');
        if (iniVal) iniVal.innerText = (ini >= 0 ? '+' : '') + ini;

        const prof = char.stats?.proficiency_bonus ?? 2;
        const profVal = document.getElementById('header-prof-val');
        if (profVal) profVal.innerText = (prof >= 0 ? '+' : '') + prof;
    },

    updateScrollIndicators() {
        const up = document.getElementById('scroll-up');
        const down = document.getElementById('scroll-down');
        if (!up || !down) return;

        let scrollPos, windowHeight, totalHeight;
        const modal = document.querySelector('#modal-wrapper.active');
        const parchment = modal ? modal.querySelector('.parchment') : null;

        if (modal && parchment) {
            scrollPos = parchment.scrollTop;
            windowHeight = parchment.clientHeight;
            totalHeight = parchment.scrollHeight;
        } else {
            scrollPos = window.scrollY;
            windowHeight = window.innerHeight;
            totalHeight = document.documentElement.scrollHeight;
        }

        const threshold = 50;
        const canScrollUp = scrollPos > threshold;
        const canScrollDown = scrollPos + windowHeight < totalHeight - threshold;

        up.classList.toggle('hidden', !canScrollUp);
        // Only show down arrow if there is SIGNFICANTLY more content (e.g. > 50px difference)
        down.classList.toggle('hidden', !canScrollDown || (totalHeight - windowHeight) < 50);

        const z = modal ? "10001" : "9000";
        up.style.zIndex = z;
        down.style.zIndex = z;
    }
};
