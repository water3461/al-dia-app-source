import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces ---
export interface Bank {
  id: string;
  name: string;
  type: 'bank' | 'retail' | 'digital'; // Para futuros filtros
}

export interface Benefit {
  id: string;
  commerceName: string; // Nombre del comercio (ej: Starbucks)
  bankId: string;       // Banco que ofrece el beneficio
  cardName: string;     // Tarjeta específica
  discount: string;     // El beneficio (ej: 40% dcto)
  conditions: string;   // Días o condiciones (ej: Lunes, Tope $5.000)
  category: string;     // Comida, Farmacia, Combustible
}

// --- Mock Data: Bancos Disponibles ---
export const BANKS: Bank[] = [
  { id: 'banco_falabella', name: 'Banco Falabella', type: 'bank' },
  { id: 'banco_chile', name: 'Banco de Chile', type: 'bank' },
  { id: 'santander', name: 'Santander', type: 'bank' },
  { id: 'scotiabank', name: 'Scotiabank', type: 'bank' },
  { id: 'bci', name: 'BCI', type: 'bank' },
  { id: 'itau', name: 'Itaú', type: 'bank' },
  { id: 'tenpo', name: 'Tenpo', type: 'digital' },
  { id: 'mercadopago', name: 'Mercado Pago', type: 'digital' },
  { id: 'cencosud', name: 'Cencosud Scotiabank', type: 'retail' },
];

// --- Mock Data: Beneficios (Ejemplos extendidos) ---
export const BENEFITS: Benefit[] = [
  // Falabella
  {
    id: 'f1',
    commerceName: 'Starbucks',
    bankId: 'banco_falabella',
    cardName: 'CMR Elite',
    discount: '40% Dcto',
    conditions: 'Lunes a Jueves. Tope $4.000',
    category: 'Comida',
  },
  {
    id: 'f2',
    commerceName: 'Doggis',
    bankId: 'banco_falabella',
    cardName: 'CMR',
    discount: '30% Dcto',
    conditions: 'Viernes. Sin tope',
    category: 'Comida',
  },
  
  // Banco de Chile
  {
    id: 'ch1',
    commerceName: 'Starbucks',
    bankId: 'banco_chile',
    cardName: 'Visa Signature',
    discount: '25% Dcto',
    conditions: 'Viernes',
    category: 'Comida',
  },
  {
    id: 'ch2',
    commerceName: 'Salcobrand',
    bankId: 'banco_chile',
    cardName: 'Todas las tarjetas',
    discount: '20% Dcto',
    conditions: 'Lunes y Martes',
    category: 'Farmacia',
  },

  // Santander
  {
    id: 's1',
    commerceName: 'Copec',
    bankId: 'santander',
    cardName: 'Crédito World Member',
    discount: '$100/litro',
    conditions: 'Jueves. Muevo App',
    category: 'Combustible',
  },
  {
    id: 's2',
    commerceName: 'Burger King',
    bankId: 'santander',
    cardName: 'Débito',
    discount: '40% Dcto',
    conditions: 'Martes',
    category: 'Comida',
  },

  // Scotiabank
  {
    id: 'sc1',
    commerceName: 'McDonalds',
    bankId: 'scotiabank',
    cardName: 'Débito',
    discount: '30% Dcto',
    conditions: 'Miércoles',
    category: 'Comida',
  },
  
  // Tenpo
  {
    id: 't1',
    commerceName: 'Petrobras',
    bankId: 'tenpo',
    cardName: 'Tarjeta Prepago',
    discount: '$200/litro',
    conditions: 'Lunes y Martes. Tope $8.000',
    category: 'Combustible',
  },
  {
    id: 't2',
    commerceName: 'Unimarc',
    bankId: 'tenpo',
    cardName: 'Tarjeta Prepago',
    discount: '20% Dcto',
    conditions: 'Lunes',
    category: 'Supermercado',
  }
];

// --- Lógica de Servicio ---

/**
 * Obtiene los IDs de los bancos seleccionados por el usuario desde AsyncStorage.
 * Retorna un array vacío si no hay nada guardado.
 */
export const getUserBanks = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem('@user_banks');
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    } else {
      // Si es null (primera vez), retornamos vacío
      return [];
    }
  } catch (e) {
    console.error("Error leyendo bancos del usuario:", e);
    return [];
  }
};

/**
 * Busca la mejor opción de pago para un comercio dado,
 * filtrando SOLO por los bancos que el usuario tiene activos.
 */
export const searchBestOption = (query: string, userBanks: string[]): Benefit[] => {
  // Validación básica
  if (!query || query.trim().length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();

  // 1. Filtramos los beneficios
  const matches = BENEFITS.filter((benefit) => {
    // A. ¿Coincide el nombre del comercio?
    const matchCommerce = benefit.commerceName.toLowerCase().includes(normalizedQuery);
    
    // B. ¿Tiene el usuario este banco activado?
    const userHasBank = userBanks.includes(benefit.bankId);

    return matchCommerce && userHasBank;
  });

  // 2. Ordenamos los resultados
  // Prioridad: Mayor porcentaje de descuento primero (lógica simple basada en strings)
  return matches.sort((a, b) => {
    // Extraemos números de los strings "40% Dcto" -> 40
    const discountA = parseInt(a.discount.replace(/\D/g, '')) || 0;
    const discountB = parseInt(b.discount.replace(/\D/g, '')) || 0;
    
    return discountB - discountA; // Orden descendente (Mayor descuento primero)
  });
};