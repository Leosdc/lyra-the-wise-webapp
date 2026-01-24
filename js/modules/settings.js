
/**
 * Settings Module
 * Handles user preferences, profile updates, and theming (cursors).
 */

export const SettingsModule = {

    loadUserPreferences(user) {
        if (!user) return;
        const prefs = JSON.parse(localStorage.getItem(`lyra_prefs_${user.uid}`) || '{}');
        this.applyPreferences(prefs);
    },

    applyPreferences(prefs) {
        if (!prefs) return;

        // Apply cursor globally
        document.body.className = document.body.className.replace(/cursor-\S+/g, '');
        if (prefs.cursor) {
            document.body.classList.add(`cursor-${prefs.cursor}`);
        }

        // Fill settings form fields if they exist in DOM
        const nick = document.getElementById('setting-nickname');
        const wa = document.getElementById('setting-whatsapp');
        const bio = document.getElementById('setting-bio');

        if (nick) nick.value = prefs.nickname || '';
        if (wa) wa.value = prefs.whatsapp || '';
        if (bio) bio.value = prefs.bio || '';

        // Update selected state in cursor grid
        if (prefs.cursor) {
            const opt = document.querySelector(`.cursor-option[data-cursor="${prefs.cursor}"]`);
            if (opt) {
                document.querySelectorAll('.cursor-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            }
        }
    },

    saveSettings(user, { showAlert, closeModal }) {
        if (!user) return;

        const nickname = document.getElementById('setting-nickname').value;
        const whatsapp = document.getElementById('setting-whatsapp').value;
        const bio = document.getElementById('setting-bio').value;
        const selectedCursor = document.querySelector('.cursor-option.active')?.dataset.cursor;

        const prefs = {
            nickname,
            whatsapp,
            bio,
            cursor: selectedCursor
        };

        localStorage.setItem(`lyra_prefs_${user.uid}`, JSON.stringify(prefs));
        // SECURITY NOTE: Never store sensitive data (tokens, passwords) in localStorage.
        // Use sessionStorage for temporary sensitive state or Firestore for permanent secure storage.

        this.applyPreferences(prefs);

        if (closeModal) closeModal('settings-modal');
        if (showAlert) showAlert("Preferências consagradas com sucesso!", "Selo Real");
    }
};
