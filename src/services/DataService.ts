import AsyncStorage from '@react-native-async-storage/async-storage';

// Definimos las estructuras de datos (Types)
export interface Rule {
  id: string;
  commerce_name: string;
  issuer_id: string; 
  benefit_value: string;
  condition: string;
  smart_tip: string;
}

export interface BankCard {
  id: string;
  name: string;
  type: 'bank' | 'retail';
  primary_color: string;
}

// 👇 NUEVO: Estructura de una Boleta guardada
export interface Receipt {
  id: string;
  date: string;
  commerce: string;
  total: number;
  scannedAt: number; // Fecha real de cuando escaneaste (timestamp)
}

// Claves para guardar en la memoria del celular
const STORAGE_KEYS = {
  HIDDEN_BANKS: 'user_hidden_banks',
  ONBOARDING_DONE: 'user_onboarding_complete',
  RECEIPTS_HISTORY: 'user_receipts_history', // 👈 Nueva clave
};

// DATOS FIJOS (Bancos y Reglas - Igual que antes)
const MOCK_BANKS: BankCard[] = [
  { id: 'banco_chile', name: 'Banco de Chile', type: 'bank', primary_color: '#002464' },
  { id: 'santander', name: 'Santander', type: 'bank', primary_color: '#EC0000' },
  { id: 'bci', name: 'Bci', type: 'bank', primary_color: '#00A388' },
  { id: 'scotiabank', name: 'Scotiabank', type: 'bank', primary_color: '#FF0000' },
  { id: 'itau', name: 'Itaú', type: 'bank', primary_color: '#EC7000' },
  { id: 'falabella', name: 'CMR Falabella', type: 'retail', primary_color: '#1A9D48' },
  { id: 'ripley', name: 'Banco Ripley', type: 'retail', primary_color: '#762266' },
  { id: 'cencosud', name: 'Cencosud Scotiabank', type: 'retail', primary_color: '#0078C0' },
  { id: 'mach', name: 'MACH', type: 'bank', primary_color: '#7B00F2' },
  { id: 'tenpo', name: 'Tenpo', type: 'bank', primary_color: '#00D1FF' },
  { id: 'mercadopago', name: 'Mercado Pago', type: 'bank', primary_color: '#009EE3' },
];

const MOCK_RULES: Rule[] = [
  { id: '1', commerce_name: 'Starbucks', issuer_id: 'banco_chile', benefit_value: '30% DCTO', condition: 'Miércoles pagando con TC', smart_tip: 'Pide tu café favorito hoy.' },
  { id: '2', commerce_name: 'Copec', issuer_id: 'santander', benefit_value: '$100/lt DCTO', condition: 'Jueves con tarjeta Silver', smart_tip: 'Llena el estanque hoy.' },
  { id: '3', commerce_name: 'Salcobrand', issuer_id: 'bci', benefit_value: '20% DCTO', condition: 'Lunes y Martes', smart_tip: 'Compra tus medicamentos ahora.' },
  { id: '4', commerce_name: 'Jumbo', issuer_id: 'scotiabank', benefit_value: '15% DCTO', condition: 'Todos los días sobre $30.000', smart_tip: 'Ideal para la compra del mes.' },
  { id: '5', commerce_name: 'McDonald\'s', issuer_id: 'mach', benefit_value: '40% DEVOLUCIÓN', condition: 'Viernes tope $5.000', smart_tip: '¡El bajón te sale casi gratis!' },
  { id: '6', commerce_name: 'Uber Eats', issuer_id: 'itau', benefit_value: '30% DCTO', condition: 'Domingos pidiendo > $15.000', smart_tip: 'No cocines este domingo.' },
  { id: '7', commerce_name: 'Petrobras', issuer_id: 'tenpo', benefit_value: '$200/lt DEVOLUCIÓN', condition: 'Lunes pagando con tarjeta física', smart_tip: 'El mejor descuento en bencina de la semana.' },
  { id: '8', commerce_name: 'Doggis', issuer_id: 'falabella', benefit_value: '2x1', condition: 'Pagando con Fpay', smart_tip: 'Invita a alguien.' },
  { id: '9', commerce_name: 'H&M', issuer_id: 'ripley', benefit_value: '20% Puntos Go', condition: 'Solo tiendas presenciales', smart_tip: 'Renueva tu closet.' },
  { id: '10', commerce_name: 'Santa Isabel', issuer_id: 'cencosud', benefit_value: '20% DCTO', condition: 'Lunes web', smart_tip: 'Haz el pedido online.' },
];

export const DataService = {
  
  // --- FUNCIONES BÁSICAS ---
  getBanks: async (): Promise<BankCard[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_BANKS), 100));
  },

  getDailyRules: async (): Promise<Rule[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_RULES), 100));
  },

  // --- MEMORIA DE BANCOS (Configuración) ---
  saveHiddenBanks: async (hiddenIds: string[]) => {
    try {
      const jsonValue = JSON.stringify(hiddenIds);
      await AsyncStorage.setItem(STORAGE_KEYS.HIDDEN_BANKS, jsonValue);
    } catch (e) { console.error(e); }
  },

  getHiddenBanks: async (): Promise<string[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN_BANKS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) { return []; }
  },

  completeOnboarding: async () => {
    try { await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true'); } catch (e) {}
  },

  isOnboardingComplete: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
      return value === 'true';
    } catch (e) { return false; }
  },

  clearAllData: async () => {
    try { await AsyncStorage.clear(); } catch(e) {}
  },

  // --- 👇 NUEVO: HISTORIAL DE GASTOS ---

  // 1. Guardar una nueva boleta
  addReceipt: async (receipt: Omit<Receipt, 'id' | 'scannedAt'>) => {
    try {
      // Obtenemos las actuales
      const existing = await DataService.getReceipts();
      
      // Creamos la nueva con ID único y fecha actual
      const newReceipt: Receipt = {
        ...receipt,
        id: Date.now().toString(), // Usamos la hora como ID único
        scannedAt: Date.now()
      };

      // Guardamos la lista actualizada (Nueva primero)
      const updatedList = [newReceipt, ...existing];
      await AsyncStorage.setItem(STORAGE_KEYS.RECEIPTS_HISTORY, JSON.stringify(updatedList));
      console.log('Boleta guardada:', newReceipt);
      return true;
    } catch (error) {
      console.error('Error guardando boleta:', error);
      return false;
    }
  },

  // 2. Leer todas las boletas
  getReceipts: async (): Promise<Receipt[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.RECEIPTS_HISTORY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error leyendo boletas:', error);
      return [];
    }
  },

  // 3. Borrar historial (para debug)
  clearReceipts: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RECEIPTS_HISTORY);
    } catch (e) {}
  }
};