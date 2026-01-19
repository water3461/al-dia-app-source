import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 1. Configuración: Cómo se comportan las alertas cuando la App está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  
  // A. Pedir Permiso (Fundamental en iOS/Android)
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  },

  // B. Programar la Alarma Diaria
  scheduleDailyReminder: async () => {
    // Primero borramos alarmas viejas para no duplicar
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Programamos para las 9:00 AM todos los días
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "☀️ ¡Buenos días, Ahorrador!",
        body: "Revisa las oportunidades de hoy en AL DÍA.",
        sound: true,
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    console.log("🔔 Alarma programada para las 09:00 AM");
  },

  // C. (Opcional) Enviar una alerta de prueba AHORA MISMO
  testNotification: async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 ¡Funciona!",
        body: "Así se verán tus recordatorios diarios.",
      },
      trigger: null, // null significa "ahora mismo"
    });
  }
};