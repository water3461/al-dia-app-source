import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CARDS_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_cards.json';
const RULES_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_rules.json';

// CLAVES PARA GUARDAR EN EL CELULAR
const STORAGE_KEY_BANKS = 'offline_banks_data';
const STORAGE_KEY_RULES = 'offline_rules_data';
const STORAGE_KEY_HIDDEN = 'hidden_banks';

export interface BankCard {
  id: string;
  name: string;
  primary_color: string;
  logo_url: string;
}

export interface Rule {
  id: string;
  days: number[];
  commerce_name: string;
  benefit_value: string;
  smart_tip: string;
  issuer_id: string;
  condition: string;
}

export const DataService = {

  // --- 1. OBTENER BANCOS (HÍBRIDO) ---
  getBanks: async (): Promise<BankCard[]> => {
    try {
      // INTENTO ONLINE
      console.log("📡 Buscando bancos en internet...");
      const response = await axios.get(CARDS_URL);
      const data = response.data.institutions;
      
      // SI FUNCIONÓ, GUARDAMOS LA COPIA (CACHE)
      await AsyncStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify(data));
      return data;

    } catch (error) {
      // SI FALLA INTERNET, USAMOS LA COPIA GUARDADA
      console.log("⚠️ Sin internet. Usando copia guardada de Bancos.");
      const cached = await AsyncStorage.getItem(STORAGE_KEY_BANKS);
      return cached ? JSON.parse(cached) : [];
    }
  },

  // --- 2. OBTENER REGLAS (HÍBRIDO) ---
  getAllRules: async (): Promise<Rule[]> => {
    try {
      // INTENTO ONLINE
      console.log("📡 Buscando reglas en internet...");
      const response = await axios.get(RULES_URL);
      const data = response.data.rules;

      // SI FUNCIONÓ, GUARDAMOS COPIA
      await AsyncStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(data));
      return data;

    } catch (error) {
      // SI FALLA, USAMOS COPIA
      console.log("⚠️ Sin internet. Usando copia guardada de Reglas.");
      const cached = await AsyncStorage.getItem(STORAGE_KEY_RULES);
      return cached ? JSON.parse(cached) : [];
    }
  },

  // --- 3. REGLAS DEL DÍA (USANDO LA LÓGICA ANTERIOR) ---
  getDailyRules: async (): Promise<Rule[]> => {
    // Reutilizamos la función inteligente de arriba
    const allRules = await DataService.getAllRules();
    
    // Filtramos por día
    const today = new Date().getDay(); 
    const todayAdjusted = today === 0 ? 7 : today;
    return allRules.filter((r: Rule) => r.days.includes(todayAdjusted));
  },

  // --- 4. PREFERENCIAS DE USUARIO (SIEMPRE LOCAL) ---
  saveHiddenBanks: async (hiddenIds: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_HIDDEN, JSON.stringify(hiddenIds));
    } catch (e) {
      console.error("Error guardando:", e);
    }
  },

  getHiddenBanks: async (): Promise<string[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_HIDDEN);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      return [];
    }
  }
};