import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Importamos todas tus pantallas
import HomeScreen from './src/screens/HomeScreen';
import WalletSetupScreen from './src/screens/WalletSetupScreen';
import ScanScreen from './src/screens/ScanScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type Tab = 'home' | 'scan' | 'settings';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>('home');

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('@setup_complete');
      setIsSetupComplete(value === 'true');
    } catch (e) {
      setIsSetupComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupFinish = () => {
    setIsSetupComplete(true);
    setCurrentTab('home');
  };

  // --- Renderizadores ---

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 1. Si no ha configurado la billetera, mostramos el Setup
  if (!isSetupComplete) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <WalletSetupScreen onComplete={handleSetupFinish} />
      </View>
    );
  }

  // 2. Si ya configuró, mostramos la App Principal con Tabs
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style={currentTab === 'scan' ? 'light' : 'dark'} />
      
      {/* Área de Contenido */}
      <View className="flex-1">
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'scan' && <ScanScreen />}
        {currentTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row bg-white border-t border-gray-200 pb-5 pt-3 justify-around items-center">
        
        {/* Botón Home */}
        <TouchableOpacity 
          onPress={() => setCurrentTab('home')}
          className="items-center justify-center w-20"
        >
          <Ionicons 
            name={currentTab === 'home' ? "home" : "home-outline"} 
            size={26} 
            color={currentTab === 'home' ? "#007AFF" : "#9CA3AF"} 
          />
          <Text className={`text-xs mt-1 ${currentTab === 'home' ? "text-blue-600 font-bold" : "text-gray-400"}`}>
            Inicio
          </Text>
        </TouchableOpacity>

        {/* Botón Escáner (Destacado) */}
        <TouchableOpacity 
          onPress={() => setCurrentTab('scan')}
          className="items-center justify-center -mt-8"
        >
          <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-lg border-4 border-gray-50">
            <Ionicons name="scan" size={30} color="white" />
          </View>
        </TouchableOpacity>

        {/* Botón Ajustes */}
        <TouchableOpacity 
          onPress={() => setCurrentTab('settings')}
          className="items-center justify-center w-20"
        >
          <Ionicons 
            name={currentTab === 'settings' ? "settings" : "settings-outline"} 
            size={26} 
            color={currentTab === 'settings' ? "#007AFF" : "#9CA3AF"} 
          />
          <Text className={`text-xs mt-1 ${currentTab === 'settings' ? "text-blue-600 font-bold" : "text-gray-400"}`}>
            Ajustes
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}