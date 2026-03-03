
/**
 * Dice Module
 * Handles dice rolling logic, visual feedback, and history.
 */
export const DiceModule = {
    history: [],

    init() {
        this.injectHTML();
        this.bindEvents();
    },

    injectHTML() {
        if (document.getElementById('dice-modal')) return;

        const modalHtml = `
            <!-- Dice Modal -->
            <div id="dice-modal" class="modal-overlay hidden">
                <div class="dice-modal-content">
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                    <h2 class="medieval-font" style="color: var(--gold); margin-bottom: 1.5rem;"><i class="fas fa-dice"></i> Torre de Dados</h2>
                    
                    <div class="dice-controls-header">
                        <label for="dice-quantity">Quantidade:</label>
                        <input type="number" id="dice-quantity" class="medieval-input small-input" value="1" min="1" max="50">
                    </div>

                    <div class="dice-controls">
                        <button class="dice-btn" data-sides="4"><i class="fas fa-dice-d6" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></i> d4</button>
                        <button class="dice-btn" data-sides="6"><i class="fas fa-dice-d6"></i> d6</button>
                        <button class="dice-btn" data-sides="8"><i class="fas fa-dice-d20" style="transform: scaleY(1.2);"></i> d8</button>
                        <button class="dice-btn" data-sides="10"><i class="fas fa-dice-d20" style="transform: rotate(45deg);"></i> d10</button>
                        <button class="dice-btn" data-sides="12"><i class="fas fa-dice-d20"></i> d12</button>
                        <button class="dice-btn" data-sides="20"><i class="fas fa-dice-d20" style="color: var(--crimson);"></i> d20</button>
                        <button class="dice-btn" data-sides="100"><img src="/assets/icons/dices/d100.png" class="dice-icon-img" alt="d100"> d100</button>
                    </div>

                    <div class="dice-result-area">
                        <div id="dice-result-display" class="dice-display">
                            <span class="placeholder" style="font-size: 1.2rem; opacity: 0.7;">Role os dados...</span>
                        </div>
                        <div id="dice-history-list" class="dice-history"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    bindEvents() {
        // Global delegate for dice buttons and close button
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.dice-btn');
            if (btn) {
                const sides = parseInt(btn.dataset.sides);
                this.roll(sides);
                return;
            }

            const closeBtn = e.target.closest('#dice-modal .close-modal');
            if (closeBtn) {
                this.closeModal();
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

        const quantityInput = document.getElementById('dice-quantity');
        const quantity = quantityInput ? Math.max(1, parseInt(quantityInput.value) || 1) : 1;

        const display = document.getElementById('dice-result-display');

        // Animation State
        if (display) {
            display.innerHTML = '<i class="fas fa-dice-d20 fa-spin"></i>';
            display.className = 'dice-display rolling';
        }

        // Delay for suspense
        setTimeout(() => {
            const rolls = [];
            let total = 0;
            let criticalClass = '';

            // Roll N times
            for (let i = 0; i < quantity; i++) {
                const result = Math.floor(Math.random() * sides) + 1;
                rolls.push(result);
                total += result;
            }

            // Critical Logic (Only for single d20 roll for now, or highlight individual 20s?)
            // If rolling 1d20, keep legacy crit logic
            if (sides === 20 && quantity === 1) {
                if (rolls[0] === 20) criticalClass = 'crit-success';
                if (rolls[0] === 1) criticalClass = 'crit-fail';
            }

            // Update Display
            if (display) {
                display.className = `dice-display ${criticalClass}`;

                if (quantity > 1) {
                    display.innerHTML = `
                        <div class="roll-breakdown" style="font-size: 1.2rem; opacity: 0.8; margin-bottom: 0.5rem;">
                            [ ${rolls.join(', ')} ]
                        </div>
                        <div class="roll-total-label" style="font-size: 1rem; text-transform: uppercase; color: var(--gold);">Total</div>
                        <div class="roll-val">${total}</div>
                        <div class="roll-label">${quantity}d${sides}</div>
                    `;
                } else {
                    display.innerHTML = `
                        <div class="roll-val">${total}</div>
                        <div class="roll-label">d${sides}</div>
                    `;
                }
            }

            // Update History
            // Fix: Remove verbose summation (1+2+3...)
            const historyText = total;
            this.history.unshift({ sides, result: historyText, isMulti: quantity > 1 });
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
                <span class="h-val ${!h.isMulti && h.sides === 20 && h.result === 20 ? 'crit-green' : (!h.isMulti && h.sides === 20 && h.result === 1 ? 'crit-red' : '')}">${h.result}</span>
            </div>
        `).join('');
    }
};
