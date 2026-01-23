// Servicio de notificaciones simplificado (Mock)
export const scheduleNotification = async (title: string, body: string) => {
  console.log("Simulando notificación:", title, body);
  return true;
};

export const registerForPushNotificationsAsync = async () => {
  console.log("Simulando registro de push tokens...");
  return "token-simulado-123";
};