import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Este componente simula el reconocimiento visual sin necesitar la cámara física aún
// para evitar errores de compilación si no has instalado 'expo-camera'.

export default function ScanScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScannedData(null);

    // Simulamos un retraso de "procesamiento de imagen"
    setTimeout(() => {
      setIsScanning(false);
      setScannedData('Starbucks'); // Simulamos que detectó "Starbucks"
      
      Alert.alert(
        "¡Local Detectado!", 
        "Hemos identificado 'Starbucks' en la imagen. Buscando descuentos...",
        [
          { text: "Ver Beneficios", onPress: () => console.log("Navegar a resultados...") }
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-black pt-10">
      <StatusBar style="light" />
      
      {/* Header Overlay */}
      <View className="absolute top-12 left-0 right-0 z-10 flex-row justify-between px-5">
        <TouchableOpacity className="p-2 bg-black/50 rounded-full">
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 bg-black/50 rounded-full">
          <Ionicons name="flash-off" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Viewfinder Area (Simulada) */}
      <View className="flex-1 justify-center items-center relative">
        <View className="w-full h-full absolute bg-gray-900 opacity-50" />
        
        {/* Marco de enfoque */}
        <View className="w-72 h-72 border-2 border-white/80 rounded-3xl items-center justify-center relative">
          <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-xl" />
          <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-xl" />
          <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-xl" />
          <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-xl" />

          {isScanning && (
            <ActivityIndicator size="large" color="#3B82F6" />
          )}
        </View>

        <Text className="text-white text-center mt-8 font-medium bg-black/40 px-4 py-2 rounded-lg overflow-hidden">
          {isScanning ? "Analizando comercio..." : "Apunta al logo del comercio"}
        </Text>
      </View>

      {/* Controls Overlay */}
      <View className="bg-black pb-10 pt-5 px-10 flex-row justify-around items-center">
        <TouchableOpacity className="items-center">
            <Ionicons name="images-outline" size={28} color="white" />
        </TouchableOpacity>

        {/* Botón de Captura */}
        <TouchableOpacity 
          onPress={handleSimulateScan}
          className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-gray-300"
        >
          <View className="w-16 h-16 bg-white rounded-full border-2 border-black" />
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
            <Ionicons name="refresh-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}