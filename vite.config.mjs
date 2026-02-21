import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true
            }
        }
    },
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
