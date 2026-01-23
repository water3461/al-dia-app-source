import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center">
      <Text className="text-xl font-bold text-gray-800">Mi Perfil</Text>
      <Text className="text-gray-500 mt-2">Próximamente...</Text>
    </SafeAreaView>
  );
}