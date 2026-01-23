// 🔴 1. PEGA TU API KEY AQUÍ (¡No la olvides!)
const API_KEY = "AIzaSyDdK63kTWCbgC2XiuNHChZN5OSLnLlDKEA"; 

// --- FRASES DE RESPALDO (Por si se corta el internet o la IA falla) ---
const FRASES_CHILENAS = {
  BAJO: [ // Gasto bajo (Ahorrador)
    "Estás más apretado que traje de torero. ¡Bien! 🐂",
    "El Tío Rico estaría orgulloso de ti. 🦆",
    "Tu billetera está respirando tranquila hoy. 🧘‍♂️",
    "Sigue así y nos compramos el sur. 🌲",
    "Modo monje tibetano activado. 🏯",
    "Cuidando las lucas como hueso santo. 🦴"
  ],
  MEDIO: [ // Gasto medio (Ojo)
    "Vas bien, pero no te confíes... te estoy mirando. 👀",
    "Ni mucho ni poco. Mantén el equilibrio, saltamontes. 🦗",
    "Ojo con el fin de semana, que ahí se va todo. 🍻",
    "No te calientes con compras innecesarias. 🧊",
    "El bolsillo aguanta, pero no abuses. 🤨"
  ],
  ALTO: [ // Gasto alto (Peligro)
    "¡Corta la tarjeta! Te crees Farkas y no eres. 🛑",
    "Alerta Roja: Vamos a comer arroz todo el mes. 🍚",
    "Tu cuenta bancaria está llorando sangre. 🩸",
    "¡Para la mano! Se nos va el sueldo. 💸",
    "Llama a los bomberos, tu tarjeta está en llamas. 🔥",
    "¿Te ganaste el Loto y no me contaste? Bájale al gasto. 📉"
  ]
};

export const AIService = {

  // 🧠 CEREBRO: Busca el mejor modelo disponible en tu cuenta
  findActiveModel: async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      const data = await response.json();
      const models = data.models || [];
      // Priorizamos modelos rápidos
      const best = models.find((m: any) => m.name.includes('flash')) || models.find((m: any) => m.name.includes('pro'));
      return best ? best.name.replace('models/', '') : "gemini-pro";
    } catch (e) { return "gemini-pro"; }
  },

  // 📸 VISIÓN: Analiza la boleta (OCR)
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
              { text: "OCR ESTRICTO. SOLO JSON: {\"store\": \"Nombre Tienda\", \"date\": \"dd/mm/yyyy\", \"total\": numero_entero}. Si falla: null." },
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

  // 💬 CHAT: Asistente con Memoria
  chatWithAI: async (currentMessage: string, history: any[], context: string) => {
    try {
      if (API_KEY.includes("TU_API_KEY")) return "⚠️ Falta API Key.";
      const modelName = await AIService.findActiveModel();

      const systemInstruction = `
        ERES: 'Al Día', un partner financiero chileno con carácter.
        CONTEXTO: ${context}
        REGLAS:
        - Recuerda el historial.
        - Usa modismos (cachái, lucas, al tiro).
        - Sé breve y directo.
        - Usa EMOJIS para enfatizar.
      `;

      const chatHistory = history.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const finalContents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...chatHistory,
        { role: 'user', parts: [{ text: currentMessage }] }
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: finalContents })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Me quedé en blanco. ¿Repites?";

    } catch (error) { return "Sin conexión. Revisa tu internet."; }
  },

  // 🌶️ EL JUEZ: Frase del Día (Con respaldo local)
  generateDailyQuote: async (totalSpent: number) => {
    // Definimos el estado actual para usarlo en el fallback si falla la IA
    const meta = 500000;
    const porcentaje = totalSpent / meta;
    let estado: 'BAJO' | 'MEDIO' | 'ALTO' = 'MEDIO';
    if (porcentaje < 0.3) estado = 'BAJO';
    else if (porcentaje > 0.8) estado = 'ALTO';

    try {
      if (API_KEY.includes("TU_API_KEY")) throw new Error("No Key");
      
      const modelName = await AIService.findActiveModel();
      const prompt = `
        ACTÚA COMO: Un comediante chileno ácido que juzga mis finanzas.
        SITUACIÓN: He gastado $${totalSpent} (Meta: $${meta}). Llevo el ${(porcentaje*100).toFixed(0)}%.
        
        INSTRUCCIÓN:
        - Si es poco (<30%): Felicítame irónicamente o motívame.
        - Si es medio (30-80%): Haz una advertencia graciosa.
        - Si es mucho (>80%): Rétame, sé dramático o exagerado (estilo "vamos a quebrar").
        
        FORMATO:
        - Máximo 12 palabras.
        - 1 Emoji obligatorio.
        - Usa jerga chilena (fome, bacán, pato, lucas).
        - ¡SÉ ORIGINAL, NO REPITAS FRASES TÍPICAS!
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) return text.replace(/"/g, ''); // Quitamos comillas si las trae
      throw new Error("Respuesta vacía");

    } catch (error) {
      // 🛡️ FALLBACK: Si la IA falla, usamos una frase aleatoria de la lista local
      console.log("Usando frase de respaldo local...");
      const lista = FRASES_CHILENAS[estado];
      const azar = Math.floor(Math.random() * lista.length);
      return lista[azar];
    }
  }
};