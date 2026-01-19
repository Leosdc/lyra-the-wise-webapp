// === LYRA THE WISE: PROXY ARCANO (Serverless Edition) ===

function doPost(e) {
  let requestData;
  try {
    requestData = JSON.parse(e.postData.contents);
  } catch (err) {
    return createResponse({ error: 'JSON inválido' });
  }

  const idToken = requestData.idToken;

  // 1. Validar se o Token existe
  if (!idToken) {
    return createResponse({ error: 'Não autorizado: Token ausente.' });
  }

  // Chave de API do Firebase (para validar o token)
  // Nota: Deixando a mesma que você forneceu do "Mundo da Alice"
  const FIREBASE_API_KEY = "AIzaSyA177h7yrtUUeM0T1jaCx0ElaXlfTBbScA";

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

  } catch (err) {
    console.error('[SECURITY] Erro na validação:', err);
    return createResponse({ error: 'Erro interno na segurança.' });
  }

  // === LÓGICA DA LYRA ===
  const action = requestData.action;
  const message = requestData.message;
  const history = requestData.history || [];

  if (action === 'callGemini') {
    return createResponse(callGemini(message, history));
  }
  
  return createResponse({ error: 'Ação não reconhecida.' });
}

function callGemini(message, history) {
  // Pegar a chave GEMINI_API_KEY das propriedades do script
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) return { error: 'GEMINI_API_KEY não configurada no Script Properties' };
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  // Formatando o histórico para o Gemini
  let contents = [];
  history.forEach(msg => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  });
  
  // Adicionando a última mensagem
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });
  
  const payload = {
    contents: contents,
    generationConfig: { 
      temperature: 0.8, 
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 40
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post', 
    contentType: 'application/json',
    payload: JSON.stringify(payload), 
    muteHttpExceptions: true
  });

  const resData = JSON.parse(response.getContentText());

  if (response.getResponseCode() !== 200 || !resData.candidates) {
    return { error: 'Erro na API Gemini: ' + response.getContentText() };
  }
  
  // Retornando no formato simplificado esperado pelo app.js
  return { 
    response: resData.candidates[0].content.parts[0].text 
  };
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
