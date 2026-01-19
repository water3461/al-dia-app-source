import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CARDS_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_cards.json';
const RULES_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_rules.json';

// CLAVES DE MEMORIA
const STORAGE_KEY_BANKS = 'offline_banks_data';
const STORAGE_KEY_RULES = 'offline_rules_data';
const STORAGE_KEY_HIDDEN = 'hidden_banks';
const STORAGE_KEY_ONBOARDING = 'onboarding_complete';

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

  // 1. OBTENER BANCOS (Con caché)
  getBanks: async (): Promise<BankCard[]> => {
    try {
      const response = await axios.get(CARDS_URL, { timeout: TIMEOUT_MS });
      const data = response.data.institutions;
      await AsyncStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem(STORAGE_KEY_BANKS);
      return cached ? JSON.parse(cached) : [];
    }
  },

  // 2. OBTENER REGLAS (Con caché)
  getAllRules: async (): Promise<Rule[]> => {
    try {
      const response = await axios.get(RULES_URL, { timeout: TIMEOUT_MS });
      const data = response.data.rules;
      await AsyncStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem(STORAGE_KEY_RULES);
      return cached ? JSON.parse(cached) : [];
    }
  },

  // 3. REGLAS DEL DÍA
  getDailyRules: async (): Promise<Rule[]> => {
    const allRules = await DataService.getAllRules();
    const today = new Date().getDay(); 
    const todayAdjusted = today === 0 ? 7 : today;
    return allRules.filter((r: Rule) => r.days.includes(todayAdjusted));
  },

  // 4. PREFERENCIAS (OCULTAR BANCOS)
  saveHiddenBanks: async (hiddenIds: string[]) => {
    try { await AsyncStorage.setItem(STORAGE_KEY_HIDDEN, JSON.stringify(hiddenIds)); } catch (e) { console.error(e); }
  },

  getHiddenBanks: async (): Promise<string[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_HIDDEN);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) { return []; }
  },

  // 5. BIENVENIDA (ONBOARDING)
  hasCompletedOnboarding: async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(STORAGE_KEY_ONBOARDING);
    return value === 'true';
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
  },
  
  resetOnboarding: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY_ONBOARDING);
  }
};