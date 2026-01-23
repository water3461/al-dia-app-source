import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  registerForPushNotificationsAsync: async () => {
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
    // Primero cancelamos para no duplicar
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Programamos para las 20:00 (8 PM)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🕗 ¡Hora de cerrar caja!",
        body: "¿Gastaste algo hoy? Regístralo antes de que se te olvide. 💸",
        sound: true,
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
    console.log("🔔 Notificación programada a las 20:00");
  }
};