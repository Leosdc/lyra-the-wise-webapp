import { LYRA_LYRICS, DAMIEN_LYRICS, ELDRIN_LYRICS } from '../lyrics-data.js';

const LyricsModule = {
    currentLyrics: [],
    currentIndex: -1,
    audioElement: null,
    container: null,
    activeLine: null,
    prevLine: null,
    nextLine: null,
    animationFrame: null,

    init() {
        this.container = document.getElementById('hero-lyrics');
        this.activeLine = this.container?.querySelector('.lyric-line.active');
        this.prevLine = this.container?.querySelector('.lyric-line.prev');
        this.nextLine = this.container?.querySelector('.lyric-line.next');
        this.audioElement = document.getElementById('lyra-bg-music');

        if (!this.container || !this.audioElement) return;

        // Start Loop
        this.startSyncLoop();
    },

    setTheme(themeName) {
        if (themeName === 'damien' || themeName === true) this.currentLyrics = DAMIEN_LYRICS;
        else if (themeName === 'eldrin') this.currentLyrics = ELDRIN_LYRICS;
        else this.currentLyrics = LYRA_LYRICS;

        this.currentIndex = -1;
        this.clearLyrics();
    },

    clearLyrics() {
        if (this.activeLine) this.activeLine.innerText = "...";
        if (this.prevLine) this.prevLine.innerText = "";
        if (this.nextLine) this.nextLine.innerText = "";
    },

    startSyncLoop() {
        const checkTime = () => {
            if (!this.audioElement.paused && this.currentLyrics.length > 0) {
                const currentTime = this.audioElement.currentTime;
                this.updateDisplay(currentTime);
            }
            this.animationFrame = requestAnimationFrame(checkTime);
        };
        this.animationFrame = requestAnimationFrame(checkTime);
    },

    updateDisplay(time) {
        // Find the active lyric based on time
        // We want the LAST lyric that has a time <= current time
        let activeIdx = -1;

        for (let i = 0; i < this.currentLyrics.length; i++) {
            if (time >= this.currentLyrics[i].time) {
                activeIdx = i;
            } else {
                break; // Optimization: sorted array
            }
        }

        // If the index changed, update the UI
        if (activeIdx !== this.currentIndex) {
            this.currentIndex = activeIdx;
            this.renderLyrics(activeIdx);
        }
    },

    renderLyrics(index) {
        // Safe check
        const currentText = (index >= 0 && index < this.currentLyrics.length)
            ? this.currentLyrics[index].text
            : "";

        // Logic to clear text if too much time has passed since last lyric? 
        // For now, let's keep it until the next one or until a "silence" threshold.
        // But the user asked for fading in/out. CSS handles opacity transition.

        // Determine Next and Prev text for context (optional, or just use fading)
        // Implementation: Just show current active line in the center.
        // Or if we want a scrolling effect ?
        // The user said: "As frases podem ir aparecendo ali e desaparecendo".
        // Let's use the 'active' line for the current text.

        if (this.activeLine) {
            // Fade out old, update text, fade in new (handled by CSS transition if we change content?)
            // Actually, textContent change is instant. CSS transition works on properties.
            // To animate text change smoothly:
            // 1. Fade out current.
            // 2. Change text.
            // 3. Fade in.
            // BUT, `updateDisplay` is called frequently. We only enter here on index change.

            this.activeLine.style.opacity = 0; // Fade out momentarily

            setTimeout(() => {
                this.activeLine.innerText = currentText;
                this.activeLine.style.opacity = 1; // Fade in
            }, 300); // 300ms matches half of CSS transition roughly or gives a blink effect
        }
    }
};

export default LyricsModule;
