import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'aldia_history_v1';
const OFFERS_KEY = 'aldia_offers_v1';
const USER_DATA_KEY = 'aldia_userdata_v1';
const ONBOARDING_KEY = 'aldia_onboarding_v1';
const WALLET_KEY = 'aldia_wallet_v1';

const MASTER_OFFERS: any = {
  'Banco de Chile': { color: '#002C5F', icon: 'card', benefit: '40% Restoranes' },
  'Banco Santander': { color: '#EC0000', icon: 'card', benefit: '30% Gasolina' },
  'Banco Falabella': { color: '#137E30', icon: 'cart', benefit: '40% Lunes' },
  'CMR Falabella': { color: '#3A8D28', icon: 'cart', benefit: 'Puntos Extra' },
  'BCI': { color: '#002E6D', icon: 'card', benefit: '20% Super' },
  'Scotiabank': { color: '#EC111A', icon: 'card', benefit: '40% Bares' },
  'Banco Estado': { color: '#E56E00', icon: 'wallet', benefit: 'Sin Costo' },
  'Itaú': { color: '#EC7000', icon: 'card', benefit: 'Rutas Gourmet' },
  'Tenpo': { color: '#0099FF', icon: 'phone-portrait', benefit: 'Devolución $$' },
  'Mach': { color: '#540099', icon: 'phone-portrait', benefit: 'Cashback' },
  'Copec Pay': { color: '#E84E1B', icon: 'car', benefit: 'Dcto por Litro' },
  'Mercado Pago': { color: '#009EE3', icon: 'qr-code', benefit: 'Dcto QR' },
  'Genérico': { color: '#333', icon: 'wallet', benefit: 'Ahorro' }
};

const DEFAULT_OFFERS_CALENDAR = {
  'LU': { dayFull: "Lunes", bank: "Por definir", ...MASTER_OFFERS['Genérico'] },
  'MA': { dayFull: "Martes", bank: "Por definir", ...MASTER_OFFERS['Genérico'] },
  'MI': { dayFull: "Miércoles", bank: "Por definir", ...MASTER_OFFERS['Genérico'] },
  'JU': { dayFull: "Jueves", bank: "Por definir", ...MASTER_OFFERS['Genérico'] },
  'VI': { dayFull: "Viernes", bank: "Por definir", ...MASTER_OFFERS['Genérico'] },
  'SA': { dayFull: "Sábado", bank: "Por definir", ...MASTER_OFFERS['Genérico'] },
  'DO': { dayFull: "Domingo", bank: "Por definir", ...MASTER_OFFERS['Genérico'] }
};

export const DataService = {
  isOnboardingComplete: async () => {
    try { return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true'; } catch (e) { return false; }
  },
  setOnboardingComplete: async () => { await AsyncStorage.setItem(ONBOARDING_KEY, 'true'); },

  saveMyWallet: async (selectedBanks: string[]) => {
    await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(selectedBanks));
    if (selectedBanks.length > 0) {
      const newCalendar: any = { ...DEFAULT_OFFERS_CALENDAR };
      const days = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];
      days.forEach((day, index) => {
        const bankName = selectedBanks[index % selectedBanks.length];
        const bankInfo = MASTER_OFFERS[bankName] || MASTER_OFFERS['Genérico'];
        newCalendar[day] = {
          dayFull: newCalendar[day].dayFull,
          bank: bankName,
          color: bankInfo.color,
          icon: bankInfo.icon,
          benefit: bankInfo.benefit,
          store: "Comercio Asociado"
        };
      });
      await DataService.saveOffers(newCalendar);
    }
  },

  getMyWallet: async () => {
    try { const json = await AsyncStorage.getItem(WALLET_KEY); return json ? JSON.parse(json) : []; } catch (e) { return []; }
  },
  getHistory: async () => {
    try { const json = await AsyncStorage.getItem(HISTORY_KEY); return json ? JSON.parse(json) : []; } catch (e) { return []; }
  },
  saveReceipt: async (receipt: any) => {
    try {
      const current = await DataService.getHistory();
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([receipt, ...current]));
      return true;
    } catch (e) { return false; }
  },
  getOffers: async () => {
    try { const json = await AsyncStorage.getItem(OFFERS_KEY); return json ? JSON.parse(json) : DEFAULT_OFFERS_CALENDAR; } catch (e) { return DEFAULT_OFFERS_CALENDAR; }
  },
  saveOffers: async (newOffers: any) => { await AsyncStorage.setItem(OFFERS_KEY, JSON.stringify(newOffers)); },
  resetOffers: async () => { 
    await AsyncStorage.setItem(OFFERS_KEY, JSON.stringify(DEFAULT_OFFERS_CALENDAR)); 
    return DEFAULT_OFFERS_CALENDAR; 
  },
  getUserData: async () => {
    try { const json = await AsyncStorage.getItem(USER_DATA_KEY); return json ? JSON.parse(json) : {}; } catch (e) { return {}; }
  },
  saveUserData: async (data: any) => { await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data)); }
};