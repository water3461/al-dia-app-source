// 🔴 1. ¡¡PEGA TU API KEY AQUÍ O NO FUNCIONARÁ!!
const API_KEY = "AIzaSyAolZWUAuqUYGDwYsqh_F-a0mEpNa6I0yo"; 

export const AIService = {

  // Detecta modelo activo
  findActiveModel: async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message); // Si falla aquí, es la Key
      const models = data.models || [];
      const best = models.find((m: any) => m.name.includes('flash')) || models.find((m: any) => m.name.includes('pro'));
      return best ? best.name.replace('models/', '') : "gemini-pro";
    } catch (e) { return null; }
  },

  // 1. CHAT (CON DIAGNÓSTICO DE ERROR)
  chatWithAI: async (currentMessage: string, history: any[], context: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "🚫 ERROR: No pegaste la API KEY en el código.";
      
      const modelName = await AIService.findActiveModel();
      if (!modelName) return "🚫 ERROR: Tu API Key no es válida o no tiene saldo gratuito.";

      const systemInstruction = `ERES: 'Al Día', partner financiero chileno. Tutea, sé lúdico y experto. CONTEXTO: ${context}`;
      
      const chatHistory = history.map((msg) => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemInstruction }] }, ...chatHistory, { role: 'user', parts: [{ text: currentMessage }] }] })
      });

      const data = await response.json();
      
      if (data.error) return `⚠️ Google dice: ${data.error.message}`; // <--- AQUÍ VERÁS EL ERROR REAL

      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Me quedé mudo.";

    } catch (error: any) { return `❌ Error de Red: ${error.message}`; }
  },

  // 2. CAZADOR DE DESCUENTOS (TARJETAS)
  recommendCard: async (storeName: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "Configura la Key 🔑";
      const modelName = await AIService.findActiveModel();
      if (!modelName) return "Revisa tu API Key";

      const prompt = `ACTÚA COMO: Experto en descuentos Chile. COMERCIO: ${storeName}. DIME: Qué tarjeta usar hoy y por qué (inventa una promo realista). MÁX 15 PALABRAS.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Usa efectivo.";
    } catch (error) { return "Sin señal."; }
  },

  // 3. FRASE DEL DÍA
  generateDailyQuote: async (totalSpent: number) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "¡Falta la API Key!";
      const modelName = await AIService.findActiveModel();
      if (!modelName) return "Tu llave no funciona.";

      const prompt = `ACTÚA COMO: Amigo chileno sarcástico. GASTO: $${totalSpent}. SI ES POCO: Felicita. SI ES MUCHO: Trollea. MÁX 10 PALABRAS.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/"/g, '') || "Cuidando tus lucas 💰";
    } catch (error) { return "Ahorrar es progreso 🚀"; }
  },

  analyzeReceipt: async (base64Image: string) => {
      // (Mantenemos la lógica simple de OCR)
      try {
        const modelName = await AIService.findActiveModel();
        if(!modelName) return null;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "OCR ESTRICTO JSON: {\"store\": \"string\", \"date\": \"string\", \"total\": number}. Si falla: null." }, { inline_data: { mime_type: "image/jpeg", data: base64Image } }] }]
          })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text ? JSON.parse(text.replace(/```json|```/g, '').trim()) : null;
      } catch (e) { return null; }
  }
};