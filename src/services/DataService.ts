import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TUS URLS OFICIALES (Confirmadas):
const CARDS_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_cards.json';
const RULES_URL = 'https://water3461.github.io/al-dia-mvp/docs/master_data_rules.json';

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
  // 1. Descargar Lista de Bancos
  getBanks: async (): Promise<BankCard[]> => {
    try {
      console.log("Descargando bancos...");
      const response = await axios.get(CARDS_URL);
      return response.data.institutions;
    } catch (error) {
      console.error("Error bajando bancos:", error);
      return [];
    }
  },

  // 2. Descargar Reglas y Filtrar por Día
  getDailyRules: async (): Promise<Rule[]> => {
    try {
      console.log("Descargando reglas...");
      const response = await axios.get(RULES_URL);
      const allRules = response.data.rules;
      
      // Detectar día actual (0=Domingo, 1=Lunes...)
      const today = new Date().getDay(); 
      // Ajuste: Si es Domingo (0), lo pasamos a 7 para que calce con tu JSON
      const todayAdjusted = today === 0 ? 7 : today;

      // Filtrar solo las reglas de HOY
      const todayRules = allRules.filter((r: Rule) => r.days.includes(todayAdjusted));
      return todayRules;
    } catch (error) {
      console.error("Error bajando reglas:", error);
      return [];
    }
  }
};