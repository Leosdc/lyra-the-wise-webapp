
import { getMonster, getTrap, getSession } from '../data.js';
import { auth } from '../auth.js';
import { escapeHTML } from './utils.js';

/**
 * Navigation Module
 * Handles View Switching, Side Menu, Scroll Indicators, and Quick Actions.
 */

export const NavigationModule = {


    init() {
        // Scroll indicators disabled per user request
        // window.addEventListener('scroll', () => this.updateScrollIndicators());
        // Initial check
        // this.updateScrollIndicators();
    },

    injectHTML() {
        // No-op for now to fix UI breakage. 
        // If we want a sidebar later, we need matching CSS.
    },

    async switchView(viewId, loaders) {
        if (viewId !== 'gm-panel') {
            document.body.classList.remove('gm-panel-active');
        }
        sessionStorage.setItem('lyra_current_view', viewId);
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            void targetView.offsetWidth;
            targetView.classList.add('view-enter');
        }

        if (viewId === 'fichas' && loaders.loadCharacters) await loaders.loadCharacters();
        if (viewId === 'monstros' && loaders.loadMonsters) await loaders.loadMonsters();

        // Generic logic for ContentModules (Villains, NPCs, etc)
        const loadKey = `load${viewId.charAt(0).toUpperCase()}${viewId.slice(1)}`;
        if (loaders[loadKey]) await loaders[loadKey]();

        if (viewId.includes('-selection')) { /* No loader needed */ }
        if (viewId === 'sessoes' && loaders.loadSessions) await loaders.loadSessions();
        if (viewId === 'gm-panel' && loaders.loadGMPanel) await loaders.loadGMPanel();
        if (viewId === 'gm-selection') { /* No loader needed */ }
        if (viewId === 'itens' && loaders.loadItems) await loaders.loadItems();
        if (viewId === 'grimorio' && loaders.loadGrimoire) await loaders.loadGrimoire();
        if (viewId === 'community' && loaders.loadCommunity) {
            await loaders.loadCommunity();
            if (window.CommunityModule) {
                window.CommunityModule.clearNotifications();
                window.CommunityModule.scrollToBottom();
            }
        }
        if (viewId === 'names' && loaders.loadNames) await loaders.loadNames();

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
        });

        document.body.style.overflow = 'auto';
        this.updateScrollIndicators();
    },


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


    renderCard(item, type) {
        let subtitle = "";
        let tokenHtml = "";

        if (type === 'character') {
            const race = item.bio?.race || item.secoes?.basico?.Raça || '-';
            const clazz = item.bio?.class || item.secoes?.basico?.Classe || '-';
            const level = item.bio?.level || item.secoes?.basico?.Nível || 1;
            subtitle = `${race} | ${clazz} (Nív ${level})`;
            if (item.tokenUrl) {
                // Fallback to theme-appropriate default token if image fails to load
                const theme = document.body.className.match(/(\w+)-theme/)?.[1] || 'lyra';
                const fallbackTokens = {
                    'lyra': 'assets/tokens/lyra.png',
                    'damien': 'assets/tokens/damien.png',
                    'eldrin': 'assets/tokens/eldrin.png'
                };
                const fallback = fallbackTokens[theme] || fallbackTokens['lyra'];
                tokenHtml = `<img src="${item.tokenUrl}" class="card-token" alt="Token" onerror="this.src='${fallback}'">`;
            }
        }
        if (type === 'monster') subtitle = `${item.secoes?.Tipo || ''} (ND ${item.secoes?.ND || '?'})`;
        if (type === 'trap') subtitle = `Perigo: ${item.secoes?.Dificuldade || 'Média'}`;
        // Determine subtitle based on type
        if (type === 'session') {
            subtitle = item.masterNickname ? `Mestre: ${item.masterNickname}` : 'Mestre Desconhecido';
        }

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
        if (type === 'monster') return this.viewMonster(id, context);
        if (type === 'trap') return this.viewTrap(id, context);
        if (type === 'session') return this.viewSession(id, context);
        if (type === 'spell' && window.SpellModule) return window.SpellModule.viewSpell(id);

        // Handle generic content module types
        const genericTypes = ['villain', 'npc', 'campaign', 'encounter', 'puzzle', 'treasure', 'scene', 'plot', 'motivation', 'rule', 'armadilha'];
        if (genericTypes.includes(type) && window.ContentModule) {
            return window.ContentModule.viewDetailById(type, id);
        }

        context.showAlert("Este item não pode ser visualizado desta forma.", "Mistério Arcano");
    },


    async viewMonster(id, context) {
        context.openModal('detail-container');
        const monster = await getMonster(id);
        const container = document.getElementById('detail-container');
        if (container && monster) {
            container.classList.remove('hidden');
            const s = monster.secoes || {};

            // Fallbacks for flat data (User/AI Created)
            const nd = monster.cr || s.ND || '0';
            const ac = monster.ac || s.Status?.CA || '10';
            const hp = monster.hp || s.Status?.PV || '0';
            const type = monster.type || s.Tipo || 'Desconhecido';
            const size = monster.size || s.Tamanho || 'Médio';
            const desc = monster.description || s.Descricao || 'Sem descrição disponível.';

            const abilitiesHtml = (desc || '')
                .split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0)
                .map(line => `<p class="chronicle-line">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
                .join('');

            container.innerHTML = `
                <div class="item-detail-view monster-detail-redesign">
                    <div class="detail-header">
                        <div class="detail-icon-large">
                            <i class="fas fa-dragon"></i>
                        </div>
                        <div class="detail-title-block">
                            <h2>${monster.name}</h2>
                            <div class="detail-subtitle">${size} ${type}</div>
                        </div>
                    </div>

                    <div class="detail-stats-grid">
                        <div class="detail-stat">
                            <strong>ND</strong>
                            <span>${nd}</span>
                        </div>
                        <div class="detail-stat">
                            <strong>CA</strong>
                            <span>${ac}</span>
                        </div>
                        <div class="detail-stat">
                            <strong>PV</strong>
                            <span>${hp}</span>
                        </div>
                        <div class="detail-stat">
                            <strong>SISTEMA</strong>
                            <span>${monster.systemId?.toUpperCase() || 'D&D 5E'}</span>
                        </div>
                    </div>

                    <div class="detail-description">
                        <h3>Habilidades e Características</h3>
                        <div class="text-block">
                            ${abilitiesHtml}
                        </div>
                    </div>

                    ${s.Atributos ? `
                    <div class="detail-stats-grid" style="margin-top: 1rem;">
                        <div class="detail-stat"><strong>FOR</strong><span>${s.Atributos.FOR || 10}</span></div>
                        <div class="detail-stat"><strong>DES</strong><span>${s.Atributos.DES || 10}</span></div>
                        <div class="detail-stat"><strong>CON</strong><span>${s.Atributos.CON || 10}</span></div>
                        <div class="detail-stat"><strong>INT</strong><span>${s.Atributos.INT || 10}</span></div>
                        <div class="detail-stat"><strong>SAB</strong><span>${s.Atributos.SAB || 10}</span></div>
                        <div class="detail-stat"><strong>CAR</strong><span>${s.Atributos.CAR || 10}</span></div>
                    </div>
                    ` : ''}
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
        const session = await getSession(id);
        if (!session) return;

        // If the current user is the owner of the session, we should probably open it in the GM Panel
        if (context.user && session.userId === context.user.uid) {
            const { GMPanelModule } = await import('./gm-panel.js');
            GMPanelModule.activeSession = { id, ...session };

            // Switch to GM Panel view
            const app = window.app;
            app.switchView('gm-panel');

            // Render the session content
            GMPanelModule.displayActiveSession(GMPanelModule.activeSession);
            return;
        }

        // Otherwise (or if viewing as a player/guest), show the summary modal
        context.openModal('detail-container');
        const container = document.getElementById('detail-container');
        if (container) {
            container.classList.remove('hidden');

            // Format story content (markdown/newlines)
            const storyRaw = (session.story || session.summary || 'Sem registros nesta crônica.');
            const storyHtml = storyRaw
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => `<p class="chronicle-line">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
                .join('');

            container.innerHTML = `
                <div class="item-detail-view">
                    <div class="detail-header">
                        <div class="detail-icon-large">
                            <i class="fas fa-book-journal-whills"></i>
                        </div>
                        <div class="detail-title-block">
                            <h2>${session.title}</h2>
                            <div class="detail-subtitle">Sessão de ${session.systemId?.toUpperCase() || 'SISTEMA'}</div>
                        </div>
                    </div>

                    <div class="detail-stats-grid">
                        <div class="detail-stat">
                            <strong>Data</strong>
                            <span>${session.createdAt ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : 'Imemorial'}</span>
                        </div>
                        <div class="detail-stat">
                            <strong>Visibilidade</strong>
                            <span>${session.visibility === 'public' ? 'Público' : 'Privado'}</span>
                        </div>
                    </div>

                    <div class="detail-description">
                        <h3>As Crônicas</h3>
                        <div class="text-block">
                            ${storyHtml}
                        </div>
                    </div>

                    <!-- ADENTRAR ATRIUM e ADENTRAR VTT buttons for invited players/guests
                         (Session owners are redirected to GM Panel at line 244-254) -->
                    <div class="detail-actions" style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <button class="medieval-btn gold-pulse" onclick="NavigationModule.enterSession('${session.id}')">
                            <i class="fas fa-door-open"></i> ADENTRAR ATRIUM
                        </button>
                        <button class="medieval-btn primary" style="background: linear-gradient(135deg, #2d5a27, #4a8c3f); border-color: #5dba50;" onclick="NavigationModule.enterVTT('${session.id}')">
                            <i class="fas fa-map-location-dot"></i> ADENTRAR VTT
                        </button>
                    </div>
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
        if (tokenEl) tokenEl.src = char.tokenUrl || (isDamien ? 'assets/tokens/damien.png' : 'assets/tokens/lyra.png');

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

        // Find the active scrollable container
        // 1. Check for open modals
        // Check for open modals
        const itemCreator = document.getElementById('item-creator-modal');
        const spellCreator = document.getElementById('spell-creator-modal');
        const monsterCreator = document.getElementById('monster-creator-modal');
        const itemChoice = document.getElementById('item-creation-choice-modal');
        const spellChoice = document.getElementById('spell-creation-choice-modal');
        const monsterChoice = document.getElementById('monster-creation-choice-modal');
        const genericCreator = document.getElementById('generic-creator-modal');
        const genericAi = document.getElementById('generic-ai-prompt-modal');
        const genericChoice = document.getElementById('generic-choice-modal');

        const sessionSelect = document.getElementById('gm-session-select-modal');
        const prolongModal = document.getElementById('gm-prolong-session-modal');

        const activeView = document.querySelector('.view:not(.hidden)');
        const isCommunityOpen = activeView && activeView.id === 'community';

        const isCreatorOpen = (itemCreator && !itemCreator.classList.contains('hidden')) ||
            (spellCreator && !spellCreator.classList.contains('hidden')) ||
            (monsterCreator && !monsterCreator.classList.contains('hidden')) ||
            (itemChoice && !itemChoice.classList.contains('hidden')) ||
            (spellChoice && !spellChoice.classList.contains('hidden')) ||
            (monsterChoice && !monsterChoice.classList.contains('hidden')) ||
            (genericCreator && !genericCreator.classList.contains('hidden')) ||
            (genericAi && !genericAi.classList.contains('hidden')) ||
            (genericChoice && !genericChoice.classList.contains('hidden')) ||
            (sessionSelect && !sessionSelect.classList.contains('hidden')) ||
            (prolongModal && !prolongModal.classList.contains('hidden')) ||
            isCommunityOpen;

        if (isCreatorOpen) {
            up.classList.add('hidden');
            down.classList.add('hidden');
            return;
        }

        const shareModal = document.getElementById('share-item-modal');
        const isShareModalOpen = shareModal && !shareModal.classList.contains('hidden');

        const changelogModal = document.getElementById('changelog-modal');
        const isChangelogOpen = changelogModal && !changelogModal.classList.contains('hidden');

        const modalWrapper = document.getElementById('modal-wrapper');
        const isModalOpen = modalWrapper && !modalWrapper.classList.contains('hidden');

        let container = null;
        let priorityZ = "9000";

        if (isShareModalOpen) {
            container = shareModal.querySelector('.parchment-content, .modal-content');
            priorityZ = "10010";
        } else if (isChangelogOpen) {
            container = changelogModal.querySelector('.parchment-content, .modal-content');
            priorityZ = "10010";
        } else if (isModalOpen) {
            container = modalWrapper.querySelector('.parchment-content, .settings-content, .wizard-step:not(.hidden)');
            if (!container) container = modalWrapper.querySelector('.modal-content');
            priorityZ = "10002";
        } else {
            const activeView = document.querySelector('.view:not(.hidden)');
            if (activeView) {
                if (activeView.id === 'chat') {
                    container = activeView.querySelector('.chat-messages');
                } else if (activeView.id === 'community') {
                    container = activeView.querySelector('.chat-messages');
                } else {
                    // Standard parchment views or gallery
                    scrollPos = window.scrollY;
                    windowHeight = window.innerHeight;
                    totalHeight = document.documentElement.scrollHeight;
                }
            }
        }

        if (container) {
            scrollPos = container.scrollTop;
            windowHeight = container.clientHeight;
            totalHeight = container.scrollHeight;
        } else if (scrollPos === undefined) {
            scrollPos = window.scrollY;
            windowHeight = window.innerHeight;
            totalHeight = document.documentElement.scrollHeight;
        }

        const threshold = 20;
        const canScrollUp = scrollPos > threshold;
        const canScrollDown = scrollPos + windowHeight < totalHeight - threshold;

        const isTrulyScrollable = totalHeight > windowHeight + 5;

        up.classList.toggle('hidden', !canScrollUp || !isTrulyScrollable);
        down.classList.toggle('hidden', !canScrollDown || !isTrulyScrollable);

        up.style.zIndex = priorityZ;
        down.style.zIndex = priorityZ;
    },



    updateDropdownScroll(container) {
        const wrapper = container.parentElement;
        const up = wrapper?.querySelector('.dropdown-scroll-arrow.up');
        const down = wrapper?.querySelector('.dropdown-scroll-arrow.down');

        if (!up || !down) return;

        const threshold = 10;
        const canScrollUp = container.scrollTop > threshold;
        const canScrollDown = container.scrollTop + container.clientHeight < container.scrollHeight - threshold;
        const isTrulyScrollable = container.scrollHeight > container.clientHeight + 5;

        up.classList.toggle('hidden', !canScrollUp || !isTrulyScrollable);
        down.classList.toggle('hidden', !canScrollDown || !isTrulyScrollable);
    },

    async deleteItem(id, type, loaders) {
        let label = "Este item";
        if (type === 'character') label = "Este personagem";
        if (type === 'monster') label = "Esta criatura";
        if (type === 'trap') label = "Esta armadilha";
        if (type === 'session') label = "Este relato de sessão";

        const confirmed = await loaders.showConfirm(
            `${label} desaparecerá nos anais do tempo para sempre. Confirmar exclusão?`,
            "Destino Irreversível"
        );

        if (confirmed) {
            try {
                let success = false;
                if (type === 'character') {
                    await loaders.deleteCharacter(id);
                    success = true;
                } else if (type === 'monster') {
                    success = await loaders.deleteMonster(id);
                } else if (type === 'trap') {
                    await loaders.deleteTrap(id);
                    success = true;
                } else if (type === 'session') {
                    await loaders.deleteSession(id);
                    success = true;
                }

                if (success || success === undefined) {
                    loaders.showAlert(`${label} foi apagado com sucesso.`, "Registro Removido");
                    loaders.refreshList(type);
                }
            } catch (error) {
                console.error("Erro ao deletar:", error);
                loaders.showAlert("Falha ao apelar para os deuses da exclusão: " + error.message, "Poder Insuficiente");
            }
        }
    },

    async enterSession(sessionId) {
        if (!sessionId) {
            console.error("NavigationModule: Session ID missing.");
            return;
        }

        try {
            const { getSession } = await import('../data.js');
            const session = await getSession(sessionId);

            // If session has multiple chapters AND user is the GM, open selection modal
            const currentUser = auth.currentUser;
            const isGM = currentUser && session.userId === currentUser.uid;

            if (isGM && session.fullTimeline && session.fullTimeline.length > 1) {
                const { GMPanelModule } = await import('./gm-panel.js');
                GMPanelModule.activeSession = { id: sessionId, ...session };
                GMPanelModule.openSessionSelectModal('enter');
                return;
            }

            // Fallback to auto-detection for single/no chapters
            let chapterIdx = 0;
            if (session.activeChapterIndex !== undefined && session.activeChapterIndex !== null) {
                chapterIdx = Number(session.activeChapterIndex);
            } else if (session && session.fullTimeline) {
                const uncompleted = session.fullTimeline.findIndex(ch => ch.status !== 'completed');
                if (uncompleted !== -1) chapterIdx = uncompleted;
            }

            // Save ID to localStorage as a robust fallback for Vite/Redirection issues
            localStorage.setItem('lyra_active_session', sessionId);
            localStorage.setItem('lyra_active_chapter', chapterIdx);
            window.open(`session-stage.html?id=${sessionId}&chapter=${chapterIdx}`, '_blank');
        } catch (e) {
            console.warn("Could not pre-detect chapter, defaulting to 0", e);
            localStorage.setItem('lyra_active_session', sessionId);
            localStorage.setItem('lyra_active_chapter', 0);
            window.open(`session-stage.html?id=${sessionId}&chapter=0`, '_blank');
        }
    },

    enterVTT(sessionId) {
        if (!sessionId) {
            console.error("NavigationModule: Session ID missing for VTT.");
            return;
        }
        window.open(`vtt.html?id=${sessionId}&role=player`, '_blank');
    }
};

// Expose to window for inline onclick handlers in templates
window.NavigationModule = NavigationModule;
