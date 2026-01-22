// 🔴 1. PEGA TU API KEY AQUÍ
const API_KEY = "AIzaSyCBSHrAhlmeuEtp7KyEldwRwCbbexjqG0A"; 

// LISTA BLINDADA DE MODELOS (Probamos del más nuevo al más viejo)
// Usamos versiones específicas (-001, -002) que son menos propensas a fallar que los alias.
const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-002",
  "gemini-1.5-pro",
  "gemini-1.5-pro-001",
  "gemini-pro" // El viejo confiable (si todo lo demás falla)
];

// Función que prueba puerta por puerta
async function tryGoogleAI(prompt: string, imageBase64?: string) {
  let lastError = null;

  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`Intentando conectar con: ${model}...`);
      
      // Probamos con la versión v1beta que es la más compatible hoy
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
      
      const requestBody: any = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };

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

      // Si Google dice "Not Found" o error, pasamos al siguiente modelo
      if (data.error) {
        console.warn(`❌ ${model} falló: ${data.error.message}`);
        throw new Error(data.error.message);
      }

      // ¡ÉXITO!
      console.log(`✅ ¡Conectado con éxito a ${model}!`);
      return data.candidates?.[0]?.content?.parts?.[0]?.text;

    } catch (error: any) {
      lastError = error;
      // El bucle continuará automáticamente con el siguiente modelo de la lista
    }
  }
  
  // Si llegamos aquí, fallaron los 6 modelos
  throw lastError;
}

export const AIService = {
  
  // 1. ANALIZAR BOLETA
  analyzeReceipt: async (base64Image: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return null;

      const prompt = "Analiza esta imagen. Responde SOLAMENTE con un JSON válido y minificado: {\"store\": \"string\", \"date\": \"dd/mm/yyyy\", \"total\": number}. Si no es boleta, null.";
      
      const textResponse = await tryGoogleAI(prompt, base64Image);
      
      if (!textResponse) return null;

      const cleanJson = textResponse.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);

    } catch (error) {
      console.error("☠️ Murió el análisis:", error);
      return null;
    }
  },

  // 2. CHAT ASISTENTE
  chatWithAI: async (userMessage: string, context: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "⚠️ Falta la API Key en el código.";

      const prompt = `
        Actúa como 'Al Día', asesor financiero chileno.
        CONTEXTO: ${context}
        USUARIO: "${userMessage}"
        Responde corto, útil y en chileno.
      `;

      const response = await tryGoogleAI(prompt);
      return response || "Se me fue la señal. Intenta de nuevo.";

    } catch (error) {
      return "No logré conectar con Google. Revisa tu internet o la API Key.";
    }
  }
};