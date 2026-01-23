import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { searchBestOption, getUserBanks, Benefit } from '../services/DataService';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Benefit[]>([]);
  const [userBanks, setUserBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar bancos del usuario al inicio
  useEffect(() => {
    async function loadData() {
      const banks = await getUserBanks();
      setUserBanks(banks);
      setLoading(false);
    }
    loadData();
  }, []);

  // Efecto para buscar mientras escribe
  useEffect(() => {
    const matches = searchBestOption(query, userBanks);
    setResults(matches);
  }, [query, userBanks]);

  const renderBenefitItem = ({ item }: { item: Benefit }) => (
    <View className="bg-white p-4 mb-3 rounded-2xl border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-lg font-bold text-gray-800">{item.commerceName}</Text>
          <Text className="text-gray-500 text-sm">{item.category}</Text>
        </View>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-700 font-bold">{item.discount}</Text>
        </View>
      </View>

      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="text-gray-600 text-base font-medium">
          Usa tu: <Text className="text-blue-600 font-bold">{item.cardName}</Text>
        </Text>
        <Text className="text-gray-400 text-xs mt-1">{item.conditions}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-10">
      <ExpoStatusBar style="dark" />
      
      <View className="px-5 flex-1">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Al Día</Text>
          <Text className="text-gray-500">¿Dónde vas a pagar ahora?</Text>
        </View>

        {/* Buscador */}
        <View className="flex-row items-center bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
          <Ionicons name="search" size={24} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-lg text-gray-800"
            placeholder="Ej: Starbucks, Copec..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Resultados */}
        <View className="flex-1">
          {results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderBenefitItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <View className="flex-1 justify-center items-center opacity-40">
              {query.length > 1 ? (
                 <>
                   <Ionicons name="alert-circle-outline" size={60} color="#374151" />
                   <Text className="text-center mt-4 text-gray-600">
                     No encontramos beneficios para "{query}" en tus bancos.
                   </Text>
                 </>
              ) : (
                <>
                  <Ionicons name="wallet-outline" size={60} color="#374151" />
                  <Text className="text-center mt-4 text-gray-600">
                    Escribe el nombre de un local para ver cómo pagar.
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}