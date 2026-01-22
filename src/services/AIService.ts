// 🔴 1. PEGA TU API KEY AQUÍ (Asegúrate de no dejar espacios extra al final)
const API_KEY = "AIzaSyCBSHrAhlmeuEtp7KyEldwRwCbbexjqG0A"; 

// Lista de modelos que intentaremos usar (si falla uno, usa el siguiente)
const VISION_MODELS = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"];
const CHAT_MODELS = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-flash-8b"];

// Función auxiliar para probar varios modelos hasta que uno funcione
async function tryGoogleAI(models: string[], prompt: string, imageBase64?: string) {
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Intentando conectar con cerebro: ${model}...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
      
      const requestBody: any = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };

      // Si hay imagen, la agregamos al cuerpo del mensaje
      if (imageBase64) {
        requestBody.contents[0].parts.push({
          inline_data: { mime_type: "image/jpeg", data: imageBase64 }
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      // Si Google devuelve error explícito, lanzamos excepción para probar el siguiente modelo
      if (data.error) throw new Error(data.error.message);

      // Si llegamos aquí, ¡ÉXITO! Devolvemos el texto
      return data.candidates?.[0]?.content?.parts?.[0]?.text;

    } catch (error: any) {
      console.log(`Fallo el modelo ${model}: ${error.message}`);
      lastError = error;
      // Continuamos al siguiente modelo del bucle...
    }
  }
  
  // Si fallaron todos
  throw lastError;
}

export const AIService = {
  
  // 1. ANALIZAR BOLETA (CÁMARA)
  analyzeReceipt: async (base64Image: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return null;

      const prompt = "Analiza esta imagen. Responde SOLAMENTE con un JSON puro (sin markdown, sin comillas extra) con este formato: { \"store\": \"nombre tienda\", \"date\": \"dd/mm/yyyy\", \"total\": numero }. Si no es una boleta, devuelve null.";
      
      // Intentamos con la lista de modelos de visión
      const textResponse = await tryGoogleAI(VISION_MODELS, prompt, base64Image);
      
      if (!textResponse) return null;

      // Limpieza agresiva del JSON
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);

    } catch (error) {
      console.error("Error definitivo IA Vision:", error);
      return null;
    }
  },

  // 2. CHAT CON EL ASISTENTE
  chatWithAI: async (userMessage: string, context: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "⚠️ Error: Falta la API Key en AIService.ts";

      const prompt = `
        Eres 'Al Día', un asesor financiero chileno.
        CONTEXTO DEL USUARIO: ${context}
        PREGUNTA: "${userMessage}"
        Responde breve, usa modismos chilenos (cachái, lucas) y sé útil.
      `;

      // Intentamos con la lista de modelos de chat
      const response = await tryGoogleAI(CHAT_MODELS, prompt);
      
      return response || "Se me fue la onda. Intenta de nuevo.";

    } catch (error) {
      return "No logré conectar con ningún cerebro de Google. Revisa tu API Key o Internet. 🔌";
    }
  }
};