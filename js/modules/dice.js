
/**
 * Dice Module
 * Handles dice rolling logic, visual feedback, and history.
 */
export const DiceModule = {
    history: [],

    init() {
        console.log("🎲 Dice Module Loaded");
        this.bindEvents();
    },

    bindEvents() {
        // Bind logic for dice buttons inside the modal
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.dice-btn');
            if (btn) {
                const sides = parseInt(btn.dataset.sides);
                this.roll(sides);
            }
        });
    },

    openModal() {
        const modal = document.getElementById('dice-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Clear previous result animation
            const display = document.getElementById('dice-result-display');
            if (display) display.innerHTML = '<span class="placeholder">Role os dados...</span>';
        }
    },

    closeModal() {
        const modal = document.getElementById('dice-modal');
        if (modal) modal.classList.add('hidden');
    },

    roll(sides) {
        if (!sides) return;

        const display = document.getElementById('dice-result-display');
        const historyContainer = document.getElementById('dice-history-list');

        // Animation State
        if (display) {
            display.innerHTML = '<i class="fas fa-dice-d20 fa-spin"></i>';
            display.className = 'dice-display rolling';
        }

        // Delay for suspense
        setTimeout(() => {
            const result = Math.floor(Math.random() * sides) + 1;
            let criticalClass = '';

            // Critical Logic
            if (sides === 20) {
                if (result === 20) criticalClass = 'crit-success';
                if (result === 1) criticalClass = 'crit-fail';
            }

            // Update Display
            if (display) {
                display.className = `dice-display ${criticalClass}`;
                display.innerHTML = `
                    <div class="roll-val">${result}</div>
                    <div class="roll-label">d${sides}</div>
                `;
            }

            // Update History
            this.history.unshift({ sides, result, time: new Date() });
            if (this.history.length > 10) this.history.pop();

            this.renderHistory();
        }, 600);
    },

    renderHistory() {
        const container = document.getElementById('dice-history-list');
        if (!container) return;

        container.innerHTML = this.history.map(h => `
            <div class="history-item">
                <span class="h-dice">d${h.sides}</span>
                <span class="h-val ${h.sides === 20 && h.result === 20 ? 'crit-green' : (h.sides === 20 && h.result === 1 ? 'crit-red' : '')}">${h.result}</span>
            </div>
        `).join('');
    }
};
