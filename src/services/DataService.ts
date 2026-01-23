import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'aldia_history_v1';
const OFFERS_KEY = 'aldia_offers_v1';
const USER_DATA_KEY = 'aldia_userdata_v1';

// OFERTAS POR DEFECTO (Si no has editado nada)
const DEFAULT_OFFERS = {
  'LU': { dayFull: "Lunes", bank: "Banco de Chile", benefit: "40% DCTO", store: "Sushi & Wok", color: '#002C5F', icon: 'fish' },
  'MA': { dayFull: "Martes", bank: "Banco Falabella", benefit: "2x1 PIZZAS", store: "Papa John's", color: '#137E30', icon: 'pizza' },
  'MI': { dayFull: "Miércoles", bank: "BCI / Lider BCI", benefit: "20% TOTAL", store: "Lider", color: '#002E6D', icon: 'cart' },
  'JU': { dayFull: "Jueves", bank: "Tenpo", benefit: "30% OFF", store: "Burger King", color: '#0099FF', icon: 'fast-food' },
  'VI': { dayFull: "Viernes", bank: "Scotiabank", benefit: "40% BARES", store: "Ruta Gastronómica", color: '#EC111A', icon: 'beer' },
  'SA': { dayFull: "Sábado", bank: "Copec App", benefit: "$25/lt DCTO", store: "Combustible", color: '#E84E1B', icon: 'car' },
  'DO': { dayFull: "Domingo", bank: "CMR Falabella", benefit: "GRANDES OFERTAS", store: "Homecenter", color: '#3A8D28', icon: 'hammer' }
};

const DEFAULT_USER = { 
  name: "Tu Nombre", bank: "Tu Banco", account: "00-00000-00", rut: "11.111.111-1", email: "contacto@email.com"
};

export const DataService = {
  // --- HISTORIAL DE GASTOS ---
  getHistory: async () => {
    try {
      const json = await AsyncStorage.getItem(HISTORY_KEY);
      return json ? JSON.parse(json) : [];
    } catch (e) { return []; }
  },

  saveReceipt: async (receipt: any) => {
    try {
      const current = await DataService.getHistory();
      const newHistory = [receipt, ...current];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return true;
    } catch (e) { return false; }
  },

  clearHistory: async () => {
    await AsyncStorage.removeItem(HISTORY_KEY);
  },

  // --- OFERTAS PERSONALIZABLES ---
  getOffers: async () => {
    try {
      const json = await AsyncStorage.getItem(OFFERS_KEY);
      return json ? JSON.parse(json) : DEFAULT_OFFERS;
    } catch (e) { return DEFAULT_OFFERS; }
  },

  saveOffers: async (newOffers: any) => {
    await AsyncStorage.setItem(OFFERS_KEY, JSON.stringify(newOffers));
  },

  resetOffers: async () => {
    await AsyncStorage.setItem(OFFERS_KEY, JSON.stringify(DEFAULT_OFFERS));
    return DEFAULT_OFFERS;
  },

  // --- MIS DATOS BANCARIOS ---
  getUserData: async () => {
    try {
      const json = await AsyncStorage.getItem(USER_DATA_KEY);
      return json ? JSON.parse(json) : DEFAULT_USER;
    } catch (e) { return DEFAULT_USER; }
  },

  saveUserData: async (data: any) => {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  }
};