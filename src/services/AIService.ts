// 🔴 PEGA TU API KEY AQUÍ ABAJO ENTRE LAS COMILLAS
const API_KEY = "AIzaSyBhAPA63_7J-sb6nqremZazxKJ7_S6SBw0"; 

export const AIService = {
  
  // ANALIZAR BOLETA
  analyzeReceipt: async (base64Image: string) => {
    try {
      if (API_KEY.includes("PEGA_TU")) return null; // Protección si no cambiaste la key

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Eres un experto OCR. Extrae JSON puro: { \"store\": string, \"date\": string, \"total\": number }. Si no ves boleta devuelve null." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);

    } catch (error) {
      console.error("Error IA:", error);
      return null;
    }
  },

  // CHAT SIN FILTROS (CEREBRO REAL)
  chatWithAI: async (userMessage: string, context: string) => {
    try {
      // 1. Verificamos que tengas la Key
      if (API_KEY.includes("PEGA_TU")) {
        return "⚠️ Error: Falta la API Key en el código. Dile al desarrollador que la ponga en AIService.ts.";
      }

      // 2. Prompt con Personalidad
      const systemPrompt = `
        Actúa como 'Al Día', un asesor financiero chileno personal, empático y astuto.
        
        TUS DATOS ACTUALES (CONTEXTO REAL DEL USUARIO):
        ${context}
        
        INSTRUCCIONES:
        - Responde a la pregunta del usuario: "${userMessage}"
        - Usa modismos chilenos suaves (cachái, bacán, lucas, al tiro) pero sé profesional.
        - Sé breve (máximo 3 frases).
        - Si el usuario pregunta algo que no está en los datos, di que no sabes pero dales un consejo general.
        - NO inventes datos que no están en el contexto.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        return `Error de Google: ${data.error.message}`;
      }

      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Me quedé en blanco. ¿Qué decías?";

    } catch (error) {
      return "Sin conexión. Revisa tu internet o la API Key. 🔌";
    }
  }
};