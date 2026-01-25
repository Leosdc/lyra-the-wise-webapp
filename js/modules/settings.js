
import { db } from '../auth.js';
import { doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Settings Module
 * Handles user preferences, profile updates, and theming (cursors).
 */

export const SettingsModule = {

    async loadUserPreferences(user) {
        if (!user) return;

        const userRef = doc(db, 'user_preferences', user.uid);
        let prefs = {};

        try {
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                prefs = docSnap.data();
            } else {
                // Migration: Check localStorage one last time
                const localData = localStorage.getItem(`lyra_prefs_${user.uid}`);
                if (localData) {
                    console.log("🔄 Migrando preferências para a nuvem...");
                    prefs = JSON.parse(localData);
                    // Save to Firestore
                    await setDoc(userRef, prefs);
                    // Remove from insecure storage
                    localStorage.removeItem(`lyra_prefs_${user.uid}`);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar preferências:", error);
        }

        this.applyPreferences(prefs);
    },

    applyPreferences(prefs) {
        if (!prefs) return;

        // Apply cursor globally
        document.body.className = document.body.className.replace(/cursor-\S+/g, '');
        if (prefs.cursor) {
            document.body.classList.add(`cursor-${prefs.cursor}`);
        }

        // Apply Audio Prefs
        const autoPlay = document.getElementById('setting-autoplay');
        if (autoPlay) {
            // Default to true if undefined
            autoPlay.checked = prefs.autoPlayMusic !== false;
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

    async saveSettings(user, { showAlert, closeModal }) {
        if (!user) return;

        const nickname = document.getElementById('setting-nickname').value;
        const whatsapp = document.getElementById('setting-whatsapp').value;
        const bio = document.getElementById('setting-bio').value;
        const autoPlayMusic = document.getElementById('setting-autoplay').checked;
        const selectedCursor = document.querySelector('.cursor-option.active')?.dataset.cursor;

        const prefs = {
            nickname,
            whatsapp,
            bio,
            autoPlayMusic, // Save audio pref
            cursor: selectedCursor
        };

        try {
            await setDoc(doc(db, 'user_preferences', user.uid), prefs);

            // Clean legacy data if exists (just in case)
            localStorage.removeItem(`lyra_prefs_${user.uid}`);

            this.applyPreferences(prefs);

            if (closeModal) closeModal('settings-modal');
            if (showAlert) showAlert("Preferências consagradas na nuvem!", "Selo Real");
        } catch (error) {
            console.error("Erro ao salvar preferências:", error);
            if (showAlert) showAlert("Erro ao salvar preferências: " + error.message, "Falha na Escrita");
        }
    }
};
