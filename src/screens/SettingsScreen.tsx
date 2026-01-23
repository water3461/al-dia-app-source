import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert, 
  ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  
  // Función para borrar datos y volver a la pantalla de "WalletSetup"
  const handleReset = async () => {
    Alert.alert(
      "¿Reiniciar App?",
      "Esto borrará tus bancos guardados y volverás a la pantalla de bienvenida.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, Borrar", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            // Para que surta efecto total, pedimos al usuario reiniciar
            // En una app real usaríamos un Context para recargar automáticamente
            Alert.alert("Listo", "Cierra completamente la app y vuelve a abrirla para configurar de nuevo.");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-10">
      <View className="px-6 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Ajustes</Text>
      </View>
      
      <ScrollView className="flex-1 px-5 pt-6">
        
        {/* Sección General */}
        <Text className="text-gray-500 text-xs font-bold mb-3 ml-2 uppercase">General</Text>
        <View className="bg-white rounded-xl overflow-hidden mb-6 shadow-sm border border-gray-100">
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="person-outline" size={18} color="#007AFF" />
              </View>
              <Text className="text-gray-700 font-medium">Mi Perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={18} color="#34C759" />
              </View>
              <Text className="text-gray-700 font-medium">Notificaciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* Sección Desarrollo / Debug */}
        <Text className="text-gray-500 text-xs font-bold mb-3 ml-2 uppercase">Zona de Pruebas</Text>
        <View className="bg-white rounded-xl overflow-hidden mb-6 shadow-sm border border-gray-100">
          <TouchableOpacity 
            onPress={handleReset}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </View>
              <Text className="text-red-600 font-medium">Reiniciar Billetera</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-gray-400 text-sm mt-4">
          AL DÍA v1.0.0 (Beta)
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}