// 🔴 1. PEGA TU API KEY AQUÍ
const API_KEY = "AIzaSyDdK63kTWCbgC2XiuNHChZN5OSLnLlDKEA"; 

export const AIService = {

  findActiveModel: async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      const data = await response.json();
      const models = data.models || [];
      const best = models.find((m: any) => m.name.includes('flash')) || models.find((m: any) => m.name.includes('pro'));
      return best ? best.name.replace('models/', '') : "gemini-pro";
    } catch (e) { return "gemini-pro"; }
  },

  analyzeReceipt: async (base64Image: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return null;
      const modelName = await AIService.findActiveModel();
      
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
      return text ? JSON.parse(text.replace(/```json|```/g, '').trim()) : null;
    } catch (error) { return null; }
  },

  // 👇 AQUÍ ESTÁ LA MAGIA DE LA MEMORIA
  chatWithAI: async (currentMessage: string, history: any[], context: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "⚠️ Falta API Key.";
      const modelName = await AIService.findActiveModel();

      // 1. DEFINIMOS LA PERSONALIDAD (SYSTEM PROMPT)
      const systemInstruction = `
        ERES: 'Al Día', un partner financiero chileno.
        CONTEXTO ACTUAL DEL USUARIO (Datos Reales): ${context}
        
        REGLAS:
        - Recuerda lo que hemos hablado antes en este chat.
        - Usa modismos chilenos naturales (cachái, al tiro, lucas).
        - Si el usuario pregunta por un dato anterior, búscalo en el historial.
        - Opina sobre los gastos con emojis y carácter.
      `;

      // 2. CONSTRUIMOS EL HILO DE LA CONVERSACIÓN (MEMORIA)
      // Google necesita que le enviemos: [Usuario, Modelo, Usuario, Modelo...]
      const chatHistory = history.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // 3. EMPAQUETAMOS TODO
      // Primero va la instrucción del sistema + el historial previo + el mensaje nuevo
      const finalContents = [
        { role: 'user', parts: [{ text: systemInstruction }] }, // Inyección de contexto como primer mensaje
        ...chatHistory, // Memoria de lo que ya hablaron
        { role: 'user', parts: [{ text: currentMessage }] } // Lo que pregunta ahora
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: finalContents })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Me perdí en la conversación. ¿Qué decías?";

    } catch (error) { return "Error de conexión."; }
  }
};