
import { login, logout } from '../auth.js';
import { SettingsModule } from './settings.js';

/**
 * Auth UI Module
 * Handles the login/logout button and visibility of user-restricted elements.
 */

export const AuthUI = {
    update(user, { selectCharacter, clearAllViews, currentCharacter }) {
        const loginBtn = document.getElementById('login-btn');
        const tracker = document.getElementById('header-char-tracker');
        const userActions = document.getElementById('user-profile-actions');

        if (user) {
            userActions?.classList.remove('hidden');
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <img src="${user.photoURL || 'assets/Lyra_Token.png'}" class="user-avatar" alt="Avatar">
                    <span>Sair</span>
                `;
                loginBtn.onclick = () => logout();
            }
            tracker?.classList.remove('hidden');

            // Restore character if available
            if (selectCharacter) {
                selectCharacter(currentCharacter);
            }

            // Load user settings (Theme, Profile)
            SettingsModule.loadUserPreferences(user);
        } else {
            userActions?.classList.add('hidden');
            if (loginBtn) {
                loginBtn.innerHTML = `<i class="fas fa-key"></i> Entrar`;
                loginBtn.onclick = () => login();
            }
            tracker?.classList.add('hidden');

            if (clearAllViews) {
                clearAllViews();
            }
        }
    }
};
