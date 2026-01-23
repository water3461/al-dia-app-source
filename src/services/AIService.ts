// 🔴 1. PEGA TU API KEY AQUÍ
const API_KEY = "AIzaSyDdK63kTWCbgC2XiuNHChZN5OSLnLlDKEA"; 

export const AIService = {

  // FUNCIÓN CLAVE: Busca qué modelo tienes activo y devuelve su nombre
  findActiveModel: async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      const data = await response.json();
      
      if (data.error) {
        console.error("Error buscando modelos:", data.error.message);
        return null;
      }

      // Buscamos cualquier modelo que sirva para generar texto (generateContent)
      // Preferimos los que dicen "flash" o "pro" si hay varios.
      const models = data.models || [];
      const bestModel = models.find((m: any) => m.name.includes('flash') && m.supportedGenerationMethods.includes('generateContent')) 
                     || models.find((m: any) => m.name.includes('pro') && m.supportedGenerationMethods.includes('generateContent'))
                     || models.find((m: any) => m.supportedGenerationMethods.includes('generateContent'));

      if (bestModel) {
        // La API devuelve "models/gemini-pro", nosotros necesitamos solo "gemini-pro"
        const cleanName = bestModel.name.replace('models/', '');
        console.log(`✅ Modelo encontrado y seleccionado: ${cleanName}`);
        return cleanName;
      }
      
      return "gemini-pro"; // Fallback por si acaso

    } catch (e) {
      return "gemini-pro";
    }
  },

  // 1. ANALIZAR BOLETA (Escáner)
  analyzeReceipt: async (base64Image: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return null;

      // PASO 1: Preguntamos qué modelo usar
      const modelName = await AIService.findActiveModel();
      if (!modelName) return null;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "OCR ESTRICTO JSON: {\"store\": \"string\", \"date\": \"string\", \"total\": number}. Si falla: null." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;
      
      return JSON.parse(text.replace(/```json|```/g, '').trim());

    } catch (error) {
      console.error("Error IA:", error);
      return null;
    }
  },

  // 2. CHAT ASISTENTE (Chat)
  chatWithAI: async (userMessage: string, context: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "⚠️ Falta API Key.";

      // PASO 1: Preguntamos qué modelo usar
      const modelName = await AIService.findActiveModel();

      const prompt = `
        ACTÚA COMO: Asesor financiero chileno EJECUTIVO.
        FORMATO: Sin saludos. Títulos MAYÚSCULAS. Emojis (💰). Máx 40 palabras.
        CONTEXTO: ${context}
        PREGUNTA: "${userMessage}"
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      
      // Si sigue fallando, devolvemos el error exacto para leerlo
      if (data.error) return `Error Google (${modelName}): ${data.error.message}`;

      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";

    } catch (error: any) {
      return "Error de conexión.";
    }
  }
};