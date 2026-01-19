import axios from 'axios';

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
      const response = await axios.get(CARDS_URL);
      return response.data.institutions;
    } catch (error) {
      console.error("Error bajando bancos:", error);
      return [];
    }
  },

  // 2. Descargar Reglas de HOY
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

  // 3. NUEVO: Descargar TODAS las reglas (Para el Calendario)
  getAllRules: async (): Promise<Rule[]> => {
    try {
      const response = await axios.get(RULES_URL);
      return response.data.rules;
    } catch (error) {
      console.error("Error bajando histórico:", error);
      return [];
    }
  }
};