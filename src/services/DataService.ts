import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CARDS_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_cards.json';
const RULES_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_rules.json';

// CLAVES PARA GUARDAR EN EL CELULAR
const STORAGE_KEY_BANKS = 'offline_banks_data';
const STORAGE_KEY_RULES = 'offline_rules_data';
const STORAGE_KEY_HIDDEN = 'hidden_banks';

// CONFIGURACIÓN: Tiempo máximo de espera (2 segundos)
const TIMEOUT_MS = 2000;

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

  // --- 1. OBTENER BANCOS (RÁPIDO) ---
  getBanks: async (): Promise<BankCard[]> => {
    try {
      console.log("📡 Buscando bancos (Timeout 2s)...");
      // AGREGAMOS TIMEOUT AQUÍ
      const response = await axios.get(CARDS_URL, { timeout: TIMEOUT_MS });
      const data = response.data.institutions;
      
      await AsyncStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify(data));
      return data;

    } catch (error) {
      console.log("⚠️ Sin internet o muy lento. Usando copia guardada de Bancos.");
      const cached = await AsyncStorage.getItem(STORAGE_KEY_BANKS);
      return cached ? JSON.parse(cached) : [];
    }
  },

  // --- 2. OBTENER REGLAS (RÁPIDO) ---
  getAllRules: async (): Promise<Rule[]> => {
    try {
      console.log("📡 Buscando reglas (Timeout 2s)...");
      // AGREGAMOS TIMEOUT AQUÍ
      const response = await axios.get(RULES_URL, { timeout: TIMEOUT_MS });
      const data = response.data.rules;

      await AsyncStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(data));
      return data;

    } catch (error) {
      console.log("⚠️ Sin internet o muy lento. Usando copia guardada de Reglas.");
      const cached = await AsyncStorage.getItem(STORAGE_KEY_RULES);
      return cached ? JSON.parse(cached) : [];
    }
  },

  // --- 3. REGLAS DEL DÍA ---
  getDailyRules: async (): Promise<Rule[]> => {
    const allRules = await DataService.getAllRules();
    
    const today = new Date().getDay(); 
    const todayAdjusted = today === 0 ? 7 : today;
    return allRules.filter((r: Rule) => r.days.includes(todayAdjusted));
  },

  // --- 4. PREFERENCIAS ---
  saveHiddenBanks: async (hiddenIds: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_HIDDEN, JSON.stringify(hiddenIds));
    } catch (e) { console.error(e); }
  },

  getHiddenBanks: async (): Promise<string[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_HIDDEN);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) { return []; }
  }
};