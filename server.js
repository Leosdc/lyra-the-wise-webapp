const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const helmet = require('helmet');
const admin = require('firebase-admin');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Inicializar Firebase Admin (usará credenciais padrão no Cloud Run)
// v1.1 - Forçando rebuild seguro
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const app = express();

// Segurança Reforçada (10/10) - Helmet & CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": [
                "'self'",
                "https://apis.google.com",
                "https://www.gstatic.com",
                "https://www.google.com/recaptcha/",
                "https://cdn.jsdelivr.net",
                "https://www.gstatic.com/recaptcha/",
                "'unsafe-inline'" // Vite inline scripts if any
            ],
            "connect-src": [
                "'self'",
                "https://firestore.googleapis.com",
                "https://identitytoolkit.googleapis.com",
                "https://securetoken.googleapis.com",
                "https://firebasestorage.googleapis.com",
                "https://*.firebaseio.com",
                "https://*.googleapis.com",
                "https://*.google-analytics.com",
                "https://google-analytics.com"
            ],
            "style-src": [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com",
                "https://www.gstatic.com"
            ],
            "font-src": [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            "img-src": [
                "'self'",
                "blob:",
                "data:",
                "https://*.googleusercontent.com",
                "https://firebasestorage.googleapis.com",
                "https://www.gstatic.com"
            ],
            "frame-src": [
                "https://www.google.com/recaptcha/",
                "https://recaptcha.google.com/"
            ],
            "upgrade-insecure-requests": []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const port = process.env.PORT || 8080;
const distPath = path.join(__dirname, 'dist');

app.use(express.json());
// Middleware de Cache para HTML (Evita MIME Errors por arquivos antigos)
app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path === '/') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
    next();
});

app.use(express.static(distPath));

// Middleware de Segurança (App Check / reCAPTCHA)
const verifySecurity = async (req, res, next) => {
    const appCheckToken = req.header("X-Firebase-AppCheck");
    const recaptchaToken = req.header("X-ReCaptcha-Token"); // Opcional

    // Ignorar verificação em desenvolvimento
    if (process.env.NODE_ENV === 'development') return next();

    // 1. Tentar App Check (Recomendado)
    if (appCheckToken) {
        try {
            await admin.appCheck().verifyToken(appCheckToken);
            return next();
        } catch (err) {
            console.warn("Aviso App Check:", err.message);
        }
    }

    // 2. Fallback: Verificação manual com RECAPTCHA_SECRET
    if (recaptchaToken && process.env.RECAPTCHA_SECRET) {
        try {
            const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) return next();
        } catch (err) {
            console.error("Erro manual reCAPTCHA:", err.message);
        }
    }

    return res.status(401).json({ error: "Acesso negado: Falha na verificação de segurança." });
};

// Endpoint da IA (Gemini)
app.post('/api/ai', verifySecurity, async (req, res) => {
    try {
        const { message, history, systemInstruction } = req.body;

        // Diagnóstico de Chave de API (Secret Manager via process.env)
        const apiKey = process.env.GEMINI_API_KEY || process.env.gemini_api_key;

        if (!apiKey || apiKey.trim() === "") {
            console.error("❌ ERRO: GEMINI_API_KEY não encontrada!");
            return res.status(500).json({
                error: "Configuração de Segredos Falhou.",
                details: "O servidor não conseguiu ler a chave 'GEMINI_API_KEY'. Verifique o apphosting.yaml e as permissões do Secret Manager."
            });
        }

        console.log(`📡 Invocando Gemini. Key detectada (Len: ${apiKey.length}).`);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemInstruction || "Você é Lyra, a Guardiã do Eco."
        });

        const formattedHistory = (history || []).map(h => {
            if (h.parts) return h;
            return {
                role: h.role === 'assistant' ? 'model' : h.role,
                parts: [{ text: h.content || h.message || "" }]
            };
        });

        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        console.log("✅ Resposta gerada.");
        res.json({ response: responseText });

    } catch (error) {
        console.error("❌ ERRO NO ORÁCULO:", error.message);
        res.status(500).json({
            error: "Falha na conexão com as estrelas.",
            details: error.message
        });
    }
});

// Fallback para SPA: Apenas para rotas que NÃO pareçam arquivos estáticos
app.get('*', (req, res) => {
    // Se o caminho tiver extensão (ex: .js, .css, .png) e não for .html, retorna 404
    const ext = path.extname(req.path);
    if (ext && ext !== '.html') {
        return res.status(404).send('Asset not found');
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
