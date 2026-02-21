
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check ONLY in production. Localhost bypasses App Check 
// to avoid the 403 Forbidden error and "Pending promise was never set" auth bug.
let appCheck;
if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true
    });
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export const login = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Erro no login:", error);
        throw error;
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
        onUserChanged(user);
    });
};

export const getToken = async () => {
    try {
        if (!appCheck) return null; // Bypass for localhost
        const { getToken: getFirebaseAppCheckToken } = await import("firebase/app-check");
        const result = await getFirebaseAppCheckToken(appCheck);
        return result.token;
    } catch (error) {
        console.error("Erro ao obter App Check token:", error);
        return null;
    }
};

export { auth, db, storage };
