import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ Erro: GEMINI_API_KEY não encontrada no arquivo .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-3.1-pro-preview",
  systemInstruction: "Você é o Auditor de Segurança e Qualidade da Lyra (Uma plataforma de RPG com estética medieval). Sua missão é realizar revisões rigorosas de código. Procure por vulnerabilidades, violações de SOLID/DRY e erros lógicos. Mantenha um tom profissional e atento aos detalhes."
});

async function auditFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${filePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(absolutePath, "utf-8");
    const prompt = `Analise o seguinte arquivo da Lyra e realize a auditoria:\n\nArquivo: ${filePath}\nConteúdo:\n\n${content}`;

    console.log(`🔍 Auditor (Gemini 3.1 Pro) analisando: ${filePath}...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n--- RESULTADO DA AUDITORIA ---");
    console.log(text);
    console.log("------------------------------\n");

  } catch (error) {
    console.error("❌ Erro durante a auditoria:", error.message);
  }
}

const targetFile = process.argv[2];
if (!targetFile) {
  console.error("Uso: node auditor.mjs <caminho_do_arquivo>");
  process.exit(1);
}

auditFile(targetFile);
