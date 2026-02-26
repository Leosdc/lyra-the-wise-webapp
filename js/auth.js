
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// App Check is initialized LAZILY (after first auth) to prevent the
// reCAPTCHA v3 invisible iframe from conflicting with signInWithPopup.
let appCheck = null;
let _appCheckInitialized = false;

function ensureAppCheck() {
    if (_appCheckInitialized) return;
    _appCheckInitialized = true;
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        try {
            appCheck = initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
                isTokenAutoRefreshEnabled: true
            });
            console.log("✅ App Check inicializado.");
        } catch (error) {
            console.warn("⚠️ App Check falhou:", error.message);
        }
    }
}

let _loginInProgress = false;

export const login = async () => {
    // Guard: prevent multiple concurrent popup requests
    if (_loginInProgress) {
        console.warn("Login já em andamento, ignorando chamada duplicada.");
        return null;
    }
    _loginInProgress = true;
    try {
        const result = await signInWithPopup(auth, provider);
        // Initialize App Check AFTER successful login
        ensureAppCheck();
        return result.user;
    } catch (error) {
        // Silently handle non-fatal popup errors (user closed, duplicate request)
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
            console.warn("Login popup cancelado:", error.code);
            return null;
        }
        console.error("Erro no login:", error);
        throw error;
    } finally {
        _loginInProgress = false;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro no logout:", error);
    }
};

export const initAuth = (onUserChanged) => {
    onAuthStateChanged(auth, (user) => {
        // If user is already authenticated (e.g. returning session), init App Check
        if (user) ensureAppCheck();
        onUserChanged(user);
    });
};

export const getToken = async () => {
    try {
        if (!appCheck) return null; // Bypass for localhost or not yet initialized
        const { getToken: getFirebaseAppCheckToken } = await import("firebase/app-check");
        const result = await getFirebaseAppCheckToken(appCheck);
        return result.token;
    } catch (error) {
        console.error("Erro ao obter App Check token:", error);
        return null;
    }
};

export { auth, db, storage };
