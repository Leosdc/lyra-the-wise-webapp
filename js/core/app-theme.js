/**
 * App Theme Sub-Module
 * Handles theme switching, music player, and AI persona placeholders.
 */

import LyricsModule from '../modules/lyrics.js';
import { SettingsModule } from '../modules/settings.js';

/**
 * Returns theme-related methods to be mixed into the app object.
 * `ctx` is the app reference (bound at mixin time).
 */
export function createThemeMixin(ctx) {
    return {
        checkMusicAutoPlay() {
            const player = document.getElementById('mystic-player');
            const audio = document.getElementById('lyra-bg-music');
            const playBtn = document.getElementById('btn-play-pause-float') ||
                document.getElementById('btn-play-pause-mini') ||
                document.getElementById('btn-play-pause');

            if (!audio || !playBtn) return;

            // Use SettingsModule preference as source of truth if checkbox is missing
            const autoPlayPref = SettingsModule.currentPrefs.autoPlayMusic ?? true;

            if (autoPlayPref === false) {
                console.log("🔇 Auto-play bloqueado por preferência do usuário.");
                ctx.musicState = { ...ctx.musicState, shouldAutoPlay: false };
                return;
            }

            ctx.musicState = { ...ctx.musicState, shouldAutoPlay: true };

            const startPlayback = () => {
                audio.volume = 0.4;
                audio.play().then(() => {
                    ctx.musicState.isPlaying = true;
                    if (ctx.syncMusicUI) ctx.syncMusicUI();
                    console.log("🎵 Autoplay iniciado com sucesso.");
                    // Cleanup: remove interaction listeners after successful play
                    document.removeEventListener('click', startPlayback);
                    document.removeEventListener('keydown', startPlayback);
                }).catch(() => {
                    console.log("⏳ Autoplay bloqueado pelo navegador. Aguardando interação...");
                    // Register persistent listeners (not { once: true }) so they survive failed retries
                    document.removeEventListener('click', startPlayback);
                    document.removeEventListener('keydown', startPlayback);
                    document.addEventListener('click', startPlayback);
                    document.addEventListener('keydown', startPlayback);
                });
            };

            startPlayback();
        },

        setTheme(themeName) {
            ctx.currentThemeName = themeName || 'lyra';
            localStorage.setItem('lyra_current_theme', ctx.currentThemeName);
            const isDamien = (themeName === 'damien');
            const isEldrin = (themeName === 'eldrin');

            ctx.isDamien = isDamien;
            ctx.chatHistory = [];

            const body = document.body;
            const logo = document.querySelector('.header-logo');
            const lyraImg = document.querySelector('.hero-lyra');
            const scrollTitle = document.querySelector('.scroll-title');
            const sheetToken = document.getElementById('sheet-token');
            const hToken = document.getElementById('header-token');

            const audio = document.getElementById('lyra-bg-music');
            const trackName = document.querySelector('.track-name');

            body.classList.remove('damien-theme', 'eldrin-theme', 'lyra-theme');

            document.documentElement.style.removeProperty('--gold');
            document.documentElement.style.removeProperty('--gold-light');
            document.documentElement.style.setProperty('--parchment', '#fcf5e5');
            document.documentElement.style.removeProperty('--ink');
            document.documentElement.style.removeProperty('--text-dark');

            let targetSrc = 'assets/music/lyra-theme.mp3';
            let targetName = 'The Whisper of the Stars';
            let aiName = 'Lyra';
            let logoSrc = 'assets/Lyra_logo.png';
            let heroSrc = 'assets/Lyra_the_wise.png';
            let titleText = "Conhecimento Arcano";

            if (isDamien) {
                body.classList.add('damien-theme');
                document.documentElement.style.setProperty('--gold', '#9d6eff');
                document.documentElement.style.setProperty('--gold-light', '#bfa6ff');
                document.documentElement.style.setProperty('--parchment', '#1a1025');
                document.documentElement.style.setProperty('--ink', '#e0d5ff');
                document.documentElement.style.setProperty('--text-dark', '#e0d5ff');

                targetSrc = 'assets/music/damien-theme.mp3';
                targetName = 'The Hunger Beyond the Veil';
                aiName = 'Damien';
                logoSrc = 'assets/Damien_logo.png';
                heroSrc = 'assets/Damien_Kael.png';
                titleText = "Sussurros do Abismo";
            } else if (isEldrin) {
                body.classList.add('eldrin-theme');

                targetSrc = 'assets/music/the-bard-theme.mp3';
                targetName = 'The Bard\'s Lament';
                aiName = 'Eldrin';
                logoSrc = 'assets/Eldrin_logo.png';
                heroSrc = 'assets/Eldrin_the_Bard.png';
                titleText = "Canções de Outrora";
            } else {
                body.classList.add('lyra-theme');
            }

            if (logo) logo.src = logoSrc;
            if (lyraImg) lyraImg.src = heroSrc;
            if (scrollTitle) scrollTitle.textContent = titleText;

            const chatBtns = document.querySelectorAll('button[data-view="chat"]');
            chatBtns.forEach(btn => {
                const fontStyle = 'font-family: var(--font-medieval); font-weight: bold; font-size: 0.9rem;';
                const pulseDiv = btn.querySelector('.portal-pulse');
                btn.innerHTML = `<i class="fas fa-comment-dots"></i> <span style='${fontStyle}'>Fale com ${aiName}</span>`;
                if (pulseDiv) btn.appendChild(pulseDiv);
            });

            const chatHeaderTitle = document.querySelector('.chat-header h2');
            if (chatHeaderTitle) chatHeaderTitle.innerHTML = `<i class="fas fa-scroll"></i> Pergunte a ${aiName}`;

            const personaNames = [
                'spell-ai-persona',
                'monster-ai-persona-name',
                'generic-ai-persona-name'
            ];
            personaNames.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerText = aiName;
            });

            ctx.updateAIPlaceholders(aiName);

            LyricsModule.setTheme(themeName);

            if (sheetToken && (sheetToken.src.includes('Lyra') || sheetToken.src.includes('Damien') || sheetToken.src.includes('Eldrin'))) {
                sheetToken.src = `assets/tokens/${aiName.toLowerCase()}.png`;
            }
            if (hToken) {
                hToken.src = `assets/tokens/${aiName.toLowerCase()}.png`;
            }

            const chatAvatars = document.querySelectorAll('.chat-avatar');
            chatAvatars.forEach(img => {
                img.src = `assets/tokens/${aiName.toLowerCase()}.png`;
            });

            if (audio) {
                const currentSrc = audio.getAttribute('src');
                const nowPlaying = document.querySelector('.player-now-playing');

                if (trackName) trackName.textContent = targetName;
                if (nowPlaying) nowPlaying.textContent = targetName;

                if (currentSrc !== targetSrc) {
                    const wasPlaying = !audio.paused;
                    audio.src = targetSrc;
                    if (wasPlaying) audio.play().catch(e => console.log("Audio play blocked", e));
                }
            }
        },

        initMusicPlayer() {
            const audio = document.getElementById('lyra-bg-music');
            if (!audio) return;

            const floatBtn = document.getElementById('btn-play-pause-float');
            const floatVolume = document.getElementById('player-volume-float');
            const floatProgress = document.getElementById('player-progress-bar-float');
            const floatContainer = document.getElementById('mystic-player');
            const floatToggle = document.getElementById('music-player-orb');
            const floatMinimize = document.querySelector('.player-minimize');

            const miniContainer = document.getElementById('gm-mini-music');
            const miniBtn = document.getElementById('btn-play-pause-mini');
            const miniVolume = document.getElementById('player-volume-mini');

            // Initialize music state in context if not present
            if (!ctx.musicState) {
                ctx.musicState = {
                    isPlaying: !audio.paused,
                    shouldAutoPlay: true
                };
            }

            const togglePlay = () => {
                if (audio.paused) {
                    audio.play().then(() => {
                        ctx.musicState.isPlaying = true;
                        updateIcons();
                    }).catch(e => console.error("Audio Play Error:", e));
                } else {
                    audio.pause();
                    ctx.musicState.isPlaying = false;
                    updateIcons();
                }
            };

            const updateIcons = () => {
                const isPlaying = ctx.musicState.isPlaying;
                const iconClass = isPlaying ? 'fa-pause' : 'fa-play';
                if (floatBtn) floatBtn.innerHTML = `<i class="fas ${iconClass}"></i>`;
                if (miniBtn) miniBtn.innerHTML = `<i class="fas ${iconClass}"></i>`;

                if (floatContainer) {
                    if (isPlaying) floatContainer.classList.add('playing');
                    else floatContainer.classList.remove('playing');
                }
            };

            // Export sync function for other modules
            ctx.syncMusicUI = updateIcons;

            const setVolume = (val) => {
                audio.volume = val;
                if (floatVolume) floatVolume.value = val;
                if (miniVolume) miniVolume.value = val;
            };

            if (floatBtn) floatBtn.addEventListener('click', togglePlay);
            if (miniBtn) miniBtn.addEventListener('click', togglePlay);

            if (floatVolume) floatVolume.addEventListener('input', (e) => setVolume(e.target.value));
            if (miniVolume) miniVolume.addEventListener('input', (e) => setVolume(e.target.value));

            if (audio) {
                audio.addEventListener('timeupdate', () => {
                    if (floatProgress) {
                        const percent = (audio.currentTime / audio.duration) * 100;
                        floatProgress.style.width = `${percent}%`;
                    }
                });

                audio.addEventListener('ended', () => {
                    ctx.musicState.isPlaying = false;
                    updateIcons();
                });
            }

            setVolume(0.5);

            if (floatToggle) {
                floatToggle.addEventListener('click', () => {
                    floatContainer.classList.toggle('collapsed');
                });
            }
            if (floatMinimize) {
                floatMinimize.addEventListener('click', () => {
                    floatContainer.classList.add('collapsed');
                });
            }

            ctx.updateMusicPlayerVisibility = () => {
                const currentView = ctx.currentView || 'dashboard';

                const isSessionOrGM = currentView === 'gm-panel' || currentView === 'session-stage' || currentView.startsWith('session-');

                if (isSessionOrGM) {
                    if (floatContainer) floatContainer.classList.add('hidden');
                    if (miniContainer) miniContainer.classList.remove('hidden');
                } else {
                    if (floatContainer) floatContainer.classList.remove('hidden');
                    if (miniContainer) miniContainer.classList.add('hidden');
                }
            };

            ctx.updateMusicPlayerVisibility();
        },

        updateAIPlaceholders(persona) {
            const placeholders = {
                'ai-spell-prompt': `Descreva a magia que deseja que ${persona} materialize...`,
                'ai-monster-prompt': `Descreva a criatura que deseja que ${persona} invoque...`,
                'generic-ai-prompt': `Descreva sua criação e deixe que ${persona} molde a essência...`
            };

            Object.entries(placeholders).forEach(([id, text]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.placeholder = text;
                    el.rows = 8;
                }
            });
        },

        cycleTheme() {
            if (ctx.currentThemeName === 'lyra') ctx.setTheme('damien');
            else if (ctx.currentThemeName === 'damien') ctx.setTheme('eldrin');
            else ctx.setTheme('lyra');
        }
    };
}
