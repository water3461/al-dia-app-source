import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CARDS_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_cards.json';
const RULES_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_rules.json';
const STORAGE_KEY = 'hidden_banks';

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
  // --- 1. DATOS DE INTERNET ---
  getBanks: async (): Promise<BankCard[]> => {
    try {
      const response = await axios.get(CARDS_URL);
      return response.data.institutions;
    } catch (error) {
      console.error("Error bancos:", error);
      return [];
    }
  },

  getAllRules: async (): Promise<Rule[]> => {
    try {
      const response = await axios.get(RULES_URL);
      return response.data.rules;
    } catch (error) {
      return [];
    }
  },

  getDailyRules: async (): Promise<Rule[]> => {
    try {
      const response = await axios.get(RULES_URL);
      const allRules = response.data.rules;
      const today = new Date().getDay(); 
      const todayAdjusted = today === 0 ? 7 : today;
      return allRules.filter((r: Rule) => r.days.includes(todayAdjusted));
    } catch (error) {
      return [];
    }
  },

  // --- 2. MEMORIA DEL TELÉFONO (NUEVO) ---
  
  // Guardar lista de bancos ocultos (Ids)
  saveHiddenBanks: async (hiddenIds: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(hiddenIds));
    } catch (e) {
      console.error("Error guardando:", e);
    }
  },

  // Leer lista de bancos ocultos
  getHiddenBanks: async (): Promise<string[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      return [];
    }
  }
};