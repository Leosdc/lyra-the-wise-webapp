
import { db } from '../auth.js';
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { logger } from '../logger.js';

/**
 * Settings Module
 * Handles user preferences, profile updates, and theming (cursors).
 */

export const SettingsModule = {
    currentPrefs: {},
    isNicknameRequired: false,


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
                    logger.info("🔄 Migrando preferências para a nuvem...");
                    prefs = JSON.parse(localData);
                    await setDoc(userRef, prefs);
                    // Remove from insecure storage
                    localStorage.removeItem(`lyra_prefs_${user.uid}`);
                }
            }
        } catch (error) {
            logger.error("Erro ao carregar preferências:", error);
        }

        this.currentPrefs = prefs;
        this.isNicknameRequired = !prefs.nickname;
        this.applyPreferences(prefs);
    },

    applyPreferences(prefs) {
        if (!prefs) return;

        document.body.className = document.body.className.replace(/cursor-\S+/g, '');
        if (prefs.cursor) {
            document.body.classList.add(`cursor-${prefs.cursor}`);
        }

        const autoPlay = document.getElementById('setting-autoplay');
        if (autoPlay) {
            autoPlay.checked = prefs.autoPlayMusic !== false;
        }

        // Fill settings form fields if they exist in DOM
        const nick = document.getElementById('setting-nickname');
        const wa = document.getElementById('setting-whatsapp');
        const bio = document.getElementById('setting-bio');

        if (nick) nick.value = prefs.nickname || '';
        if (wa) wa.value = prefs.whatsapp || '';
        if (bio) bio.value = prefs.bio || '';

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

        const nickname = document.getElementById('setting-nickname').value.trim();
        const whatsapp = document.getElementById('setting-whatsapp').value;
        const bio = document.getElementById('setting-bio').value;
        const autoPlayMusic = document.getElementById('setting-autoplay').checked;
        const selectedCursor = document.querySelector('.cursor-option.active')?.dataset.cursor;

        if (!nickname) {
            if (showAlert) showAlert("Seu Apelido Arcano é obrigatório para as crônicas da comunidade!", "Nome Indispensável");
            return;
        }

        const prefs = {
            nickname,
            nickname_lower: nickname.toLowerCase(),
            whatsapp,
            bio,
            autoPlayMusic,
            cursor: selectedCursor
        };

        try {
            await setDoc(doc(db, 'user_preferences', user.uid), prefs, { merge: true });

            localStorage.removeItem(`lyra_prefs_${user.uid}`);

            this.currentPrefs = prefs;
            this.isNicknameRequired = false;
            this.applyPreferences(prefs);

            if (closeModal) closeModal('settings-modal');
            if (showAlert) showAlert("Preferências consagradas na nuvem!", "Selo Real");
        } catch (error) {
            logger.error("Erro ao salvar preferências:", error);
            if (showAlert) showAlert("Erro ao salvar preferências: " + error.message, "Falha na Escrita");
        }
    }
};
