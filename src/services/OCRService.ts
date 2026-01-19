// ESTE ES EL CEREBRO QUE ANALIZA EL TEXTO DE LAS FOTOS
// No necesita internet, todo es lógica matemática local.

export interface ScannedReceipt {
  total: number | null;
  date: string | null;
  commerce: string | null;
  rawText: string;
}

export const OCRService = {

  // FUNCIÓN PRINCIPAL: Recibe texto sucio -> Devuelve datos limpios
  analyzeReceipt: (text: string): ScannedReceipt => {
    const cleanText = text.toUpperCase(); // Trabajamos todo en mayúsculas para facilitar
    
    return {
      total: findTotal(cleanText),
      date: findDate(cleanText),
      commerce: findCommerce(cleanText),
      rawText: text
    };
  }
};

// ---------------------------------------------------------
// 🕵️‍♂️ AGENTES DE BÚSQUEDA (Funciones privadas)
// ---------------------------------------------------------

// 1. BUSCADOR DE DINERO (Pesos Chilenos)
const findTotal = (text: string): number | null => {
  // Buscamos palabras clave que suelen estar cerca del total
  const totalKeywords = ['TOTAL', 'MONTO', 'PAGAR', 'VENTA'];
  const lines = text.split('\n');
  
  let bestAmount = 0;

  // Estrategia 1: Buscar en líneas que digan "TOTAL"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Si la línea tiene la palabra TOTAL
    if (totalKeywords.some(keyword => line.includes(keyword))) {
      // Extraemos los números de esa línea (ej: "TOTAL $12.990" -> 12990)
      const amount = extractNumber(line);
      if (amount > bestAmount) bestAmount = amount;
    }
  }

  // Estrategia 2: Si falló lo anterior, buscar el número más grande del texto (suele ser el total)
  if (bestAmount === 0) {
    const allNumbers = extractAllNumbers(text);
    if (allNumbers.length > 0) {
      // Ordenamos de mayor a menor y tomamos el primero
      bestAmount = allNumbers.sort((a, b) => b - a)[0];
    }
  }

  return bestAmount > 0 ? bestAmount : null;
};

// 2. BUSCADOR DE FECHAS (Formato Chile DD-MM-AAAA)
const findDate = (text: string): string | null => {
  // Regex para buscar DD/MM/AAAA o DD-MM-AAAA
  // Explico el regex: \d{2} son 2 dígitos, [-/] es guión o slash
  const dateRegex = /\b\d{2}[-/]\d{2}[-/]\d{4}\b/g;
  const matches = text.match(dateRegex);

  if (matches && matches.length > 0) {
    return matches[0]; // Devolvemos la primera fecha que encontramos
  }
  return null;
};

// 3. BUSCADOR DE COMERCIO (Adivinanza inteligente)
const findCommerce = (text: string): string | null => {
  // Lista de comercios conocidos para buscar rápido
  const knownShops = ['LIDER', 'JUMBO', 'TOTTUS', 'UNIMARC', 'COPEC', 'SHELL', 'STARBUCKS', 'MCDONALD', 'FARMACIAS', 'CRUZ VERDE', 'AHUMADA'];
  
  for (const shop of knownShops) {
    if (text.includes(shop)) return shop;
  }

  // Si no conocemos el comercio, intentamos leer la primera línea (a veces es el nombre)
  const lines = text.split('\n').filter(l => l.trim().length > 3); // Ignoramos líneas muy cortas
  if (lines.length > 0) {
    return lines[0].substring(0, 20); // Retornamos la primera línea recortada
  }

  return "Comercio Desconocido";
};

// --- UTILIDADES MATEMÁTICAS ---

// Saca el número limpio de un texto (ej: "$ 12.990" -> 12990)
const extractNumber = (line: string): number => {
  // Quitamos todo lo que NO sea número (pero dejamos fuera el punto mil por ahora)
  const cleanLine = line.replace(/[^0-9]/g, ''); 
  return parseInt(cleanLine) || 0;
};

// Encuentra todos los precios posibles en todo el texto
const extractAllNumbers = (text: string): number[] => {
  // Buscamos patrones de precio chilenos: $1.000, 10.000, etc.
  const priceRegex = /\$?\s?(\d{1,3}(\.\d{3})*)/g;
  const matches = text.match(priceRegex);
  
  if (!matches) return [];

  return matches.map(m => {
    const num = parseInt(m.replace(/[^0-9]/g, ''));
    // Filtramos ruidos: Ni muy chicos (fecha) ni absurdamente grandes
    if (num > 100 && num < 5000000) return num;
    return 0;
  });
};