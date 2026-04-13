/**
 * AspectRatioWarning.js
 * Detects if the screen is NOT 16:9 and displays a thematic warning.
 * Audited and enhanced by Gemini 3.1 Pro.
 */

export const AspectRatioWarning = {
    CONFIG: {
        TARGET_RATIO: 16 / 9,
        RATIO_TOLERANCE: 0.1,
        WARNING_ID: 'aspect-ratio-warning'
    },

    init() {
        this.checkRatio();
        // Listener passivo para melhor performance no scroll/resize
        window.addEventListener('resize', () => this.checkRatio(), { passive: true });
    },

    checkRatio() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const currentRatio = width / height;
        
        // Verifica se a tela é "larga o suficiente" (pelo menos 16:9)
        const isWideEnough = currentRatio >= (this.CONFIG.TARGET_RATIO - this.CONFIG.RATIO_TOLERANCE);

        const existingWarning = document.getElementById(this.CONFIG.WARNING_ID);

        if (!isWideEnough) {
            if (!existingWarning) {
                this.render();
            }
        } else {
            if (existingWarning) {
                existingWarning.remove();
            }
        }
    },

    render() {
        const warning = document.createElement('div');
        warning.id = this.CONFIG.WARNING_ID;
        warning.className = 'lyra-thematic-warning fade-in';
        
        // Estrutura sem event listeners inline (Compliance com CSP)
        warning.innerHTML = `
            <div class="warning-content">
                <i class="fas fa-scroll-old"></i>
                <p><span class="warning-title">Atenção, Viajante:</span> Este pergaminho mágico brilha mais intensamente em telas 16:9 (FHD). Ajuste sua visão para a melhor experiência!</p>
                <button class="close-warning" aria-label="Fechar aviso">✕</button>
            </div>
        `;

        // Event listener programático para o botão de fechar
        const closeBtn = warning.querySelector('.close-warning');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                warning.remove();
            });
        }

        document.body.appendChild(warning);
    }
};
