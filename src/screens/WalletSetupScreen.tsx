import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Switch, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
// Asegúrate de que esta ruta coincida con tu estructura de carpetas:
import { BANKS, Bank } from '../services/DataService'; 

interface WalletSetupScreenProps {
  onComplete: () => void;
}

export default function WalletSetupScreen({ onComplete }: WalletSetupScreenProps) {
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadExistingSelection();
  }, []);

  const loadExistingSelection = async () => {
    try {
      const stored = await AsyncStorage.getItem('@user_banks');
      if (stored) {
        setSelectedBankIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error cargando bancos", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleBank = (bankId: string) => {
    if (selectedBankIds.includes(bankId)) {
      setSelectedBankIds(selectedBankIds.filter(id => id !== bankId));
    } else {
      setSelectedBankIds([...selectedBankIds, bankId]);
    }
  };

  const handleSave = async () => {
    if (selectedBankIds.length === 0) {
      Alert.alert("Espera", "Selecciona al menos un medio de pago para que la app funcione.");
      return;
    }

    setIsSaving(true);
    try {
      await AsyncStorage.setItem('@user_banks', JSON.stringify(selectedBankIds));
      await AsyncStorage.setItem('@setup_complete', 'true');
      onComplete(); // Avisa a App.tsx que terminamos
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la configuración.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderBankItem = ({ item }: { item: Bank }) => {
    const isSelected = selectedBankIds.includes(item.id);
    return (
      <View className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
        <View className="flex-row items-center">
          <View className={`w-10 h-10 rounded-full mr-3 items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-gray-200'}`}>
             <Ionicons name="card-outline" size={20} color={isSelected ? 'white' : '#6B7280'} />
          </View>
          <Text className={`text-base font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-500'}`}>
            {item.name}
          </Text>
        </View>
        <Switch
          trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
          thumbColor={'#FFFFFF'}
          onValueChange={() => toggleBank(item.id)}
          value={isSelected}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-10">
      <StatusBar style="dark" />
      <View className="flex-1 px-6">
        
        <View className="mt-4 mb-6">
          <Text className="text-3xl font-bold text-gray-900">Mis Tarjetas</Text>
          <Text className="text-gray-500 mt-2 text-base">
            Activa los bancos o apps que usas. AL DÍA filtrará los descuentos según lo que tengas activado aquí.
          </Text>
        </View>

        <FlatList
          data={BANKS}
          renderItem={renderBankItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <View className="absolute bottom-8 left-6 right-6">
          <TouchableOpacity 
            className={`w-full py-4 rounded-xl items-center shadow-sm ${selectedBankIds.length > 0 ? 'bg-blue-600' : 'bg-gray-300'}`}
            onPress={handleSave}
            disabled={isSaving || selectedBankIds.length === 0}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Guardar y Continuar</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}