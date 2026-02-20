import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: 'index.html',
                sessionStage: 'session-stage.html',
            },
            output: {
                manualChunks: {
                    firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
                    vendor: ['markdown-it'],
                },
            },
        },
    },
});
