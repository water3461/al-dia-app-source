// 🔴 1. PEGA TU API KEY AQUÍ
const API_KEY = "AIzaSyAtudJHZT-hZnG0ei_peCR8f3y-WhNkr7Q"; 

const MODELS_TO_TRY = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro"];

async function tryGoogleAI(prompt: string, imageBase64?: string) {
  let lastError = null;
  for (const model of MODELS_TO_TRY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
      const requestBody: any = { contents: [{ parts: [{ text: prompt }] }] };
      if (imageBase64) {
        requestBody.contents[0].parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
      }

      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error: any) { lastError = error; }
  }
  throw lastError;
}

export const AIService = {
  
  // 1. ANALIZAR BOLETA (Formato estricto JSON)
  analyzeReceipt: async (base64Image: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return null;
      // Instrucción más estricta para limpieza de datos
      const prompt = "ERES UN LECTOR OCR. Tu único trabajo es extraer datos. Responde SOLO JSON: {\"store\": \"Nombre Tienda (Titulo)\", \"date\": \"dd/mm/yyyy\", \"total\": numero_entero}. Si no es boleta: null.";
      
      const textResponse = await tryGoogleAI(prompt, base64Image);
      if (!textResponse) return null;
      const cleanJson = textResponse.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) { return null; }
  },

  // 2. CHAT ASISTENTE (MODO EJECUTIVO)
  chatWithAI: async (userMessage: string, context: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "⚠️ Falta API Key.";

      // 👇 AQUÍ ESTÁ EL CAMBIO CLAVE: "Ingeniería de Prompt" para jerarquía visual
      const prompt = `
        ACTÚA COMO: 'Al Día', un asesor financiero chileno EJECUTIVO y DIRECTO.
        OBJETIVO: Responder con jerarquía visual y cero relleno.
        
        REGLAS DE FORMATO OBLIGATORIAS:
        1. NO saludes ni te despidas. Ve al grano.
        2. Usa MAYÚSCULAS para los títulos importantes.
        3. Usa EMOJIS (💰, 📅, 📉) como viñetas para listar datos.
        4. Máximo 40 palabras por respuesta total.
        
        CONTEXTO ACTUAL:
        ${context}
        
        PREGUNTA DEL USUARIO: "${userMessage}"
      `;

      const response = await tryGoogleAI(prompt);
      return response || "Sin respuesta.";

    } catch (error) { return "Error de conexión."; }
  }
};