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

// Claves para guardar en la memoria del celular
const STORAGE_KEYS = {
  HIDDEN_BANKS: 'user_hidden_banks',
  ONBOARDING_DONE: 'user_onboarding_complete',
};

// DATOS FIJOS (Simulamos una base de datos real)
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
  
  // Obtener lista de bancos disponibles
  getBanks: async (): Promise<BankCard[]> => {
    // Simulamos un pequeño retardo de red
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_BANKS), 500);
    });
  },

  // Obtener reglas del día
  getDailyRules: async (): Promise<Rule[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_RULES), 500);
    });
  },

  // --- NUEVAS FUNCIONES CON MEMORIA REAL (AsyncStorage) ---

  // 1. Guardar qué bancos NO tiene el usuario
  saveHiddenBanks: async (hiddenIds: string[]) => {
    try {
      const jsonValue = JSON.stringify(hiddenIds);
      await AsyncStorage.setItem(STORAGE_KEYS.HIDDEN_BANKS, jsonValue);
      console.log('Guardado en memoria:', hiddenIds);
    } catch (e) {
      console.error('Error guardando bancos', e);
    }
  },

  // 2. Leer qué bancos NO tiene el usuario
  getHiddenBanks: async (): Promise<string[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN_BANKS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error leyendo bancos', e);
      return [];
    }
  },

  // 3. Marcar que ya vimos la bienvenida
  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
    } catch (e) {
      console.error('Error guardando onboarding', e);
    }
  },

  // 4. Preguntar si ya vimos la bienvenida
  isOnboardingComplete: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
      return value === 'true';
    } catch (e) {
      return false;
    }
  },

  // 5. Borrar todo (útil para cerrar sesión o reiniciar)
  clearAllData: async () => {
    try {
      await AsyncStorage.clear();
    } catch(e) {
      console.error(e);
    }
  }
};