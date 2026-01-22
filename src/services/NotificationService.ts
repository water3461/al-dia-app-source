import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración del comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // 👇 AGREGADOS: Requeridos por las nuevas versiones de Expo
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  // Solicitar permisos
  registerForPushNotificationsAsync: async () => {
    let token;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permiso de notificación denegado');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Token:", token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  },

  // Programar recordatorio diario
  scheduleDailyReminder: async () => {
    // Cancelamos previos para no duplicar
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Programamos para las 10:00 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¡Revisa tus beneficios de hoy! 💸",
        body: "No gastes de más. Mira qué tarjetas usar hoy.",
        sound: true,
      },
      // 👇 CORREGIDO: Usamos 'as any' para evitar el conflicto de tipos estricto de TypeScript
      // o definimos el trigger compatible con CalendarTriggerInput
      trigger: {
        hour: 10,
        minute: 0,
        repeats: true,
      } as any, 
    });
  },

  // Enviar notificación inmediata (útil para pruebas)
  sendImmediateNotification: async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { data: 'goes here' },
      },
      trigger: null, // null significa "ahora mismo"
    });
  }
};