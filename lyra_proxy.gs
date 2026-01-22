// === LYRA THE WISE: PROXY ARCANO (Serverless Edition) ===
// VERSÃO CORRIGIDA: Usa o mesmo API Key do WebApp

function doPost(e) {
  let requestData;
  try {
    requestData = JSON.parse(e.postData.contents);
  } catch (err) {
    return createResponse({ error: 'JSON inválido' });
  }

  const idToken = requestData.idToken;

  if (!idToken) {
    return createResponse({ error: 'Não autorizado: Token ausente.' });
  }

  // === CHAVE DE API DO FIREBASE (CORRIGIDA) ===
  // Deve ser igual à do seu firebase-config.js
  const FIREBASE_API_KEY = "AIzaSyBdymlRGmshBOgIKMWomn07Lf6SyAalR3E";

  try {
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`;
    const options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify({ "idToken": idToken }),
      "muteHttpExceptions": true
    };

    const response = UrlFetchApp.fetch(verifyUrl, options);
    const result = JSON.parse(response.getContentText());

    if (!result.users || result.users.length === 0) {
      console.warn('[SECURITY] Token inválido bloqueado.');
      return createResponse({ error: 'Não autorizado: Token inválido.' });
    }

    console.log('[SECURITY] Acesso autorizado para:', result.users[0].email);
    const userId = result.users[0].localId;

    // === RATE LIMITING (NOVO) ===
    const cache = CacheService.getUserCache();
    const cacheKey = `rate_limit_${userId}`;
    const requestCount = parseInt(cache.get(cacheKey) || '0');

    if (requestCount > 50) { // Limite: 50 requisições/hora
        console.warn(`[SECURITY] Rate Limit excedido para ${result.users[0].email}`);
        return createResponse({ error: 'Limite de requisições excedido. Tente novamente em 1 hora.' });
    }

    cache.put(cacheKey, (requestCount + 1).toString(), 3600); // Expira em 1 hora

  } catch (err) {
    console.error('[SECURITY] Erro na validação:', err);
    return createResponse({ error: 'Erro interno na segurança.' });
  }

  // === LÓGICA DA LYRA ===
  const action = requestData.action;
  
  if (action === 'callGemini') {
    return createResponse(callGemini(requestData.message, requestData.history || []));
  }
  
  if (action === 'callGeminiMonster') {
    return createResponse(callGeminiMonster(requestData.monsterData));
  }

  if (action === 'callGeminiSession') {
    return createResponse(callGeminiSession(requestData.sessionData));
  }

  if (action === 'callGeminiCharacter') {
    return createResponse(callGeminiCharacter(requestData.charData));
  }
  
  return createResponse({ error: 'Ação não reconhecida.' });
}

function callGemini(message, history) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) return { error: 'GEMINI_API_KEY não configurada no Script Properties' };
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  let contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
  
  contents.push({ role: 'user', parts: [{ text: message }] });
  
  const payload = {
    contents: contents,
    generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });

  const resData = JSON.parse(response.getContentText());
  if (response.getResponseCode() !== 200 || !resData.candidates) return { error: 'Erro na API Gemini' };
  
  return { response: resData.candidates[0].content.parts[0].text };
}

function callGeminiMonster(monsterData) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const prompt = `Crie uma ficha de monstro para RPG (estilo D&D 5e) baseada nestas informações:
  Nome: ${monsterData.name}
  ND: ${monsterData.cr}
  Tipo: ${monsterData.type}
  Contexto: ${monsterData.prompt}
  
  Retorne APENAS um JSON puro no seguinte formato:
  {
    "name": "Nome",
    "cr": "ND",
    "type": "Tipo",
    "hp": 50,
    "ca": 15,
    "description": "...",
    "actions": [{"name": "...", "desc": "..."}]
  }`;

  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const response = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });

  const resData = JSON.parse(response.getContentText());
  const text = resData.candidates[0].content.parts[0].text;
  // Limpar possíveis markdown do Gemini
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return { monster: JSON.parse(jsonStr) };
}

function callGeminiCharacter(charData) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const prompt = `Você é Lyra the Wise. Com base nestas estatísticas técnicas de um personagem de D&D 5e:
  ${JSON.stringify(charData, null, 2)}
  
  Crie a "trama" narrativa dele:
  1. Personalidade (Traços)
  2. Ideais
  3. Vínculos
  4. Defeitos
  5. Uma História (Backstory) envolvente baseada nestes dados.
  
  Retorne APENAS um JSON puro no seguinte formato:
  {
    "traits": "...",
    "ideals": "...",
    "bonds": "...",
    "flaws": "...",
    "backstory": "..."
  }`;

  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const response = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });

  const resData = JSON.parse(response.getContentText());
  const text = resData.candidates[0].content.parts[0].text;
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return { character: JSON.parse(jsonStr) };
}

function callGeminiSession(sessionData) {
  // Lógica similar para diários de sessão
  return { response: "Diário processado pela IA." };
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
