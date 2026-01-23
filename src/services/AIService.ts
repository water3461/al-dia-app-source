// 🔴 1. PEGA TU API KEY AQUÍ (Asegúrate que empiece con AIza...)
const API_KEY = "AIzaSyAtudJHZT-hZnG0ei_peCR8f3y-WhNkr7Q"; 

const MODELS_TO_TRY = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.5-pro"];

async function tryGoogleAI(prompt: string, imageBase64?: string) {
  let lastError = null;
  console.log("\n--- 🏁 INICIANDO INTENTO DE CONEXIÓN CON IA ---");

  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`📡 Probando con modelo: ${model}...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
      
      const requestBody: any = { contents: [{ parts: [{ text: prompt }] }] };
      if (imageBase64) {
        requestBody.contents[0].parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
      }

      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
      const data = await response.json();

      // Si Google responde un error específico
      if (data.error) {
        console.warn(`⚠️ Error en ${model}:`, data.error.message);
        throw new Error(`Google Error: ${data.error.message}`);
      }

      // Si llegamos aquí, ¡FUNCIONÓ!
      console.log(`✅ ¡ÉXITO! Conectado con ${model}`);
      return data.candidates?.[0]?.content?.parts?.[0]?.text;

    } catch (error: any) {
      // Si falla el fetch (internet) o el modelo
      console.error(`❌ Falló ${model}:`, error.message);
      lastError = error;
    }
  }
  
  console.log("--- 🛑 TODOS LOS INTENTOS FALLARON ---");
  throw lastError;
}

export const AIService = {
  
  analyzeReceipt: async (base64Image: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return null;
      const prompt = "OCR ESTRICTO. SOLO JSON: {\"store\": \"string\", \"date\": \"string\", \"total\": number}. Si falla: null.";
      const text = await tryGoogleAI(prompt, base64Image);
      if (!text) return null;
      return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) { return null; }
  },

  chatWithAI: async (userMessage: string, context: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "⚠️ ERROR: No has pegado tu API KEY en el código.";

      const prompt = `
        ACTÚA COMO: Asesor financiero chileno EJECUTIVO.
        REGLAS: Sin saludos. Títulos en MAYÚSCULAS. Usa emojis (💰). Máximo 40 palabras.
        CONTEXTO: ${context}
        PREGUNTA: "${userMessage}"
      `;

      const response = await tryGoogleAI(prompt);
      return response || "Google respondió vacío.";

    } catch (error: any) {
      // AQUÍ ESTÁ LA CLAVE: Devolvemos el error real al chat para que lo leas
      return `☠️ DIAGNÓSTICO: ${error.message}`;
    }
  }
};