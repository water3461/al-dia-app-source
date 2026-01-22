import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 1. DEFINICIÓN DE TIPOS (ESTO ARREGLA LOS ERRORES ROJOS) ---
export interface Rule {
  id: string;
  store: string;
  discount: string;
  bank: string;
  cardType: string;
  day: string;
  days?: string[];
}

export interface BankCard {
  id: string;
  name: string;
  primary_color: string;
  rules: Rule[];
}

export interface Receipt {
  id: string;
  store: string;
  total: number;
  date: string;
  items?: string[];
  scannedAt: number;
}

// --- 2. DATOS MOCK (CHILE) ---
const MOCK_BANKS: BankCard[] = [
  {
    id: 'tenpo', name: 'Tenpo', primary_color: '#00D6FF', 
    rules: [
      { id: 'tp1', store: 'Bencina', discount: '$100/lt', bank: 'Tenpo', cardType: 'Prepago', day: 'Viernes', days: ['Viernes'] },
      { id: 'tp2', store: 'Supermercado', discount: '20% Cashback', bank: 'Tenpo', cardType: 'Prepago', day: 'Lunes', days: ['Lunes'] }
    ]
  },
  {
    id: 'mach', name: 'Mach', primary_color: '#6B28D6', 
    rules: [
      { id: 'ma1', store: 'PedidosYa', discount: '30%', bank: 'Mach', cardType: 'Virtual', day: 'Jueves', days: ['Jueves'] },
      { id: 'ma2', store: 'Unimarc', discount: '$3.000 off', bank: 'Mach', cardType: 'QR', day: 'Martes', days: ['Martes'] }
    ]
  },
  {
    id: 'mercadopago', name: 'Mercado Pago', primary_color: '#009EE3', 
    rules: [
      { id: 'mp1', store: 'McDonalds', discount: '30% QR', bank: 'MercadoPago', cardType: 'QR', day: 'Todos', days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
      { id: 'mp2', store: 'Cineplanet', discount: '2x1', bank: 'MercadoPago', cardType: 'Tarjeta', day: 'Miércoles', days: ['Miércoles'] }
    ]
  },
  {
    id: 'falabella', name: 'CMR Falabella', primary_color: '#128C41',
    rules: [
      { id: 'fa1', store: 'Tottus', discount: 'Precios Bajos', bank: 'CMR', cardType: 'Elite', day: 'Lunes', days: ['Lunes'] },
      { id: 'fa2', store: 'Sodimac', discount: 'Oportunidades', bank: 'CMR', cardType: 'Todas', day: 'Fines de Semana', days: ['Sábado', 'Domingo'] }
    ]
  },
  {
    id: 'lider', name: 'Lider BCI', primary_color: '#005CB9',
    rules: [
      { id: 'li1', store: 'Lider', discount: '6% Ahorro', bank: 'Lider BCI', cardType: 'TC', day: 'Lunes', days: ['Lunes'] },
      { id: 'li2', store: 'Lider.cl', discount: 'Despacho Gratis', bank: 'Lider BCI', cardType: 'TC', day: 'Martes', days: ['Martes'] }
    ]
  },
  {
    id: 'cencosud', name: 'Cencosud Scotiabank', primary_color: '#E30613',
    rules: [
      { id: 'cen1', store: 'Jumbo', discount: '20%', bank: 'Cencosud', cardType: 'TC', day: 'Lunes', days: ['Lunes'] },
      { id: 'cen2', store: 'Santa Isabel', discount: '15%', bank: 'Cencosud', cardType: 'TC', day: 'Miércoles', days: ['Miércoles'] }
    ]
  },
  {
    id: 'banco_chile', name: 'Banco de Chile', primary_color: '#002C77',
    rules: [
      { id: 'ch1', store: 'Starbucks', discount: '30%', bank: 'B. Chile', cardType: 'Todas', day: 'Miércoles', days: ['Miércoles'] },
      { id: 'ch2', store: 'Sky Airline', discount: '10% + Cuotas', bank: 'B. Chile', cardType: 'TC', day: 'Todos', days: ['Viernes'] }
    ]
  },
  {
    id: 'santander', name: 'Santander', primary_color: '#EC0000',
    rules: [
      { id: 'sa1', store: 'Copec', discount: '$100/lt', bank: 'Santander', cardType: 'Silver', day: 'Viernes', days: ['Viernes'] },
      { id: 'sa2', store: 'Burger King', discount: '40%', bank: 'Santander', cardType: 'Todas', day: 'Lunes', days: ['Lunes'] }
    ]
  },
  {
    id: 'estado', name: 'Banco Estado', primary_color: '#FF6F00',
    rules: [
      { id: 'be1', store: 'Dr. Simi', discount: '40%', bank: 'Estado', cardType: 'Todo', day: 'Lunes', days: ['Lunes'] },
      { id: 'be2', store: 'JetSmart', discount: 'Sin Interés', bank: 'Estado', cardType: 'TC', day: 'Todos', days: ['Viernes', 'Sábado'] }
    ]
  },
  {
    id: 'bci', name: 'BCI', primary_color: '#00A69C',
    rules: [
      { id: 'bc1', store: 'Salcobrand', discount: '20%', bank: 'BCI', cardType: 'Todas', day: 'Lunes y Martes', days: ['Lunes', 'Martes'] },
      { id: 'bc2', store: 'Cabify', discount: '30%', bank: 'BCI', cardType: 'TC', day: 'Viernes', days: ['Viernes'] }
    ]
  }
];

// --- 3. EL SERVICIO (LÓGICA) ---
export const DataService = {
  
  // Obtener lista completa de bancos
  getBanks: async (): Promise<BankCard[]> => {
    return MOCK_BANKS;
  },

  // Obtener bancos ocultos (preferencia de usuario)
  getHiddenBanks: async (): Promise<string[]> => {
    try {
      const data = await AsyncStorage.getItem('HIDDEN_BANKS');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveHiddenBanks: async (ids: string[]) => {
    await AsyncStorage.setItem('HIDDEN_BANKS', JSON.stringify(ids));
  },

  // 👇 ESTO FALTABA: Obtener reglas filtradas por el día de hoy
  getDailyRules: async (): Promise<Rule[]> => {
    const today = new Date().toLocaleDateString('es-CL', { weekday: 'long' });
    const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1); // ej: "Viernes"
    
    const hiddenIds = await DataService.getHiddenBanks();

    let validRules: Rule[] = [];
    
    MOCK_BANKS.forEach(bank => {
      // Solo si el banco NO está oculto
      if (!hiddenIds.includes(bank.id)) {
        // Filtramos reglas que coincidan con hoy
        const rulesForToday = bank.rules.filter(r => 
          r.day === capitalizedToday || 
          r.day === 'Todos' || 
          (r.days && r.days.includes(capitalizedToday))
        );
        validRules = [...validRules, ...rulesForToday];
      }
    });
    
    return validRules;
  },

  // 👇 ESTO ARREGLA EL ERROR 'Property total does not exist on type never'
  getHistory: async (): Promise<Receipt[]> => {
    try {
      const data = await AsyncStorage.getItem('HISTORY');
      return data ? JSON.parse(data) : [];
    } catch {
      return []; // Devuelve array vacío, pero TIPADO como Receipt[]
    }
  },

  saveReceipt: async (receiptData: Omit<Receipt, 'id' | 'scannedAt'>) => {
    const newReceipt: Receipt = {
      ...receiptData,
      id: Date.now().toString(),
      scannedAt: Date.now()
    };
    
    const currentHistory = await DataService.getHistory();
    const updatedHistory = [newReceipt, ...currentHistory];
    
    await AsyncStorage.setItem('HISTORY', JSON.stringify(updatedHistory));
    return newReceipt;
  },

  clearReceipts: async () => {
    await AsyncStorage.removeItem('HISTORY');
  },

  // Onboarding
  completeOnboarding: async () => AsyncStorage.setItem('ONBOARDING_COMPLETE', 'true'),
  isOnboardingComplete: async () => (await AsyncStorage.getItem('ONBOARDING_COMPLETE')) === 'true',
  
  // Reset
  resetAll: async () => AsyncStorage.clear()
};