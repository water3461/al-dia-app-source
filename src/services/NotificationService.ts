import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const NotificationService = {
  
  registerForPushNotificationsAsync: async () => {
    // 🛡️ ESCUDO: Si es Expo Go, abortamos para evitar errores.
    if (Constants.appOwnership === 'expo') {
      console.log("🔕 Expo Go: Notificaciones deshabilitadas (Modo Seguro).");
      return; 
    }

    // --- ZONA SEGURA ---
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true, // <--- AGREGADO PARA CORREGIR ERROR
        shouldShowList: true,   // <--- AGREGADO PARA CORREGIR ERROR
      } as any), // <--- EL TRUCO 'as any' PARA EVITAR QUE LLORE TYPESCRIPT
    });

    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  },

  scheduleDailyReminder: async () => {
    // 🛡️ ESCUDO TAMBIÉN AQUÍ
    if (Constants.appOwnership === 'expo') {
      return; 
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🕗 ¡Hora de cerrar caja!",
          body: "¿Gastaste algo hoy? Regístralo antes de que se te olvide. 💸",
          sound: true,
        },
        trigger: { 
          type: 'calendar', // <--- AGREGADO TIPO EXPLÍCITO
          hour: 20, 
          minute: 0, 
          repeats: true 
        } as any, // <--- TRUCO 'as any' PARA EVITAR ERROR DE TIPOS
      });
    } catch (e) {
      console.log("⚠️ Error agendando notificación.");
    }
  }
};