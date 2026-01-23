// 🔴 PEGA TU API KEY AQUÍ
const API_KEY = "AIzaSyCBSHrAhlmeuEtp7KyEldwRwCbbexjqG0A"

export const AIService = {

  // HERRAMIENTA DE DIAGNÓSTICO (Se ejecutará al intentar usar la IA)
  checkPermissions: async () => {
    try {
      console.log("🔍 Diagnostico: Consultando modelos permitidos para tu API Key...");
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      const data = await response.json();
      
      if (data.error) {
        console.error("❌ ERROR CRÍTICO DE PERMISOS:", data.error.message);
        return null;
      }

      if (data.models) {
        console.log("✅ TU LLAVE TIENE ACCESO A ESTOS MODELOS:");
        // Filtramos solo los que sirven para generar contenido
        const available = data.models
          .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => m.name.replace('models/', ''));
        
        console.log(available.join(", "));
        return available; // Devolvemos la lista real que tienes permitida
      }
      return [];
    } catch (e) {
      console.error("❌ Error de conexión al diagnosticar:", e);
      return null;
    }
  },

  // 1. ANALIZAR BOLETA
  analyzeReceipt: async (base64Image: string) => {
    // Primero revisamos qué modelo tienes disponible
    const availableModels = await AIService.checkPermissions();
    
    // Buscamos si tienes alguno de visión (flash es el mejor)
    const visionModel = availableModels?.find((m: string) => m.includes('flash')) || "gemini-1.5-flash";

    console.log(`🚀 Usando modelo: ${visionModel}`);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${visionModel}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Analiza imagen. JSON puro: {\"store\": \"string\", \"date\": \"dd/mm/yyyy\", \"total\": number}. Si falla, null." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const cleanJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);

    } catch (error) {
      console.error("Error Análisis:", error);
      return null;
    }
  },

  // 2. CHAT
  chatWithAI: async (userMessage: string, context: string) => {
    // Primero revisamos qué modelo tienes disponible
    const availableModels = await AIService.checkPermissions();
    
    // Usamos el primero que encontremos o 'gemini-pro' por defecto
    const chatModel = availableModels?.[0] || "gemini-pro";

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${chatModel}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Actúa como asesor financiero 'Al Día'. Contexto: ${context}. Pregunta: "${userMessage}".` }] }]
        })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error de IA.";

    } catch (error) {
      return "Error de conexión.";
    }
  }
};