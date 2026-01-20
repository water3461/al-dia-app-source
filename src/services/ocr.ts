import TextRecognition from '@react-native-ml-kit/text-recognition';

export interface ScannedReceipt {
  total: number | null;
  date: string | null;
  commerce: string | null;
  rawText: string;
}

export const OCRService = {

  // AHORA ESTA FUNCIÓN ES ASÍNCRONA PORQUE ESPERA A LA IA
  analyzeReceiptFromImage: async (imageUri: string): Promise<ScannedReceipt> => {
    try {
      // 🤖 AQUÍ OCURRE LA MAGIA DE LA IA (Google ML Kit)
      // Transforma los pixeles de la foto en texto puro
      const result = await TextRecognition.recognize(imageUri);
      const text = result.text;
      
      const cleanText = text.toUpperCase();
      
      // Una vez tenemos el texto, usamos nuestra lógica matemática de antes
      return {
        total: findTotal(cleanText),
        date: findDate(cleanText),
        commerce: findCommerce(cleanText),
        rawText: text
      };
    } catch (error) {
      console.error("Error en el reconocimiento IA:", error);
      throw new Error("No pudimos leer la imagen.");
    }
  }
};

// ---------------------------------------------------------
// 🕵️‍♂️ AGENTES DE BÚSQUEDA (Misma lógica matemática de antes)
// ---------------------------------------------------------

const findTotal = (text: string): number | null => {
  const totalKeywords = ['TOTAL', 'MONTO', 'PAGAR', 'VENTA', 'SUMA'];
  const lines = text.split('\n');
  let bestAmount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (totalKeywords.some(keyword => line.includes(keyword))) {
      const amount = extractNumber(line);
      // Filtramos montos absurdos (ej: códigos de barra que parecen precio)
      if (amount > bestAmount && amount < 5000000) bestAmount = amount;
    }
  }

  // Si no hallamos la palabra TOTAL, buscamos el número más grande coherente
  if (bestAmount === 0) {
    const allNumbers = extractAllNumbers(text);
    if (allNumbers.length > 0) {
      bestAmount = allNumbers.sort((a, b) => b - a)[0];
    }
  }
  return bestAmount > 0 ? bestAmount : null;
};

const findDate = (text: string): string | null => {
  // Mejoramos el Regex para capturar fechas con espacios o puntos (ej: 20.01.26)
  const dateRegex = /\b\d{2}[-/. ]\d{2}[-/. ]\d{2,4}\b/g;
  const matches = text.match(dateRegex);
  if (matches && matches.length > 0) return matches[0];
  return null;
};

const findCommerce = (text: string): string | null => {
  const knownShops = ['LIDER', 'JUMBO', 'TOTTUS', 'UNIMARC', 'COPEC', 'SHELL', 'STARBUCKS', 'MCDONALD', 'FARMACIAS', 'CRUZ VERDE', 'AHUMADA', 'SODIMAC', 'FALABELLA', 'PARIS', 'RIPLEY'];
  
  for (const shop of knownShops) {
    if (text.includes(shop)) return shop;
  }
  
  // Si no conocemos el comercio, intentamos adivinar la primera línea legible
  const lines = text.split('\n').filter(l => l.trim().length > 3 && !l.includes('RUT'));
  if (lines.length > 0) return lines[0].substring(0, 20);
  
  return "Comercio Desconocido";
};

const extractNumber = (line: string): number => {
  // Limpieza agresiva: quitamos letras y dejamos solo números
  const cleanLine = line.replace(/[^0-9]/g, ''); 
  return parseInt(cleanLine) || 0;
};

const extractAllNumbers = (text: string): number[] => {
  const priceRegex = /\$?\s?(\d{1,3}(\.\d{3})*)/g;
  const matches = text.match(priceRegex);
  if (!matches) return [];
  return matches.map(m => {
    const num = parseInt(m.replace(/[^0-9]/g, ''));
    if (num > 100 && num < 5000000) return num;
    return 0;
  });
};