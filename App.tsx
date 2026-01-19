import React from 'react';
import { StatusBar, Platform } from 'react-native'; // <--- IMPORTANTE: Importamos Platform
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { 
              backgroundColor: '#121212', 
              borderTopColor: '#333',
              
              // --- ZONA DE SEGURIDAD ---
              // Si es Android, le damos una altura gigante (120) y mucho relleno abajo (60)
              // Si es iPhone (ios), usamos medidas estándar.
              height: Platform.OS === 'android' ? 120 : 90, 
              paddingBottom: Platform.OS === 'android' ? 60 : 30,
              paddingTop: 10,
              // -------------------------
              
              elevation: 0,
            },
            tabBarActiveTintColor: '#D4AF37',
            tabBarInactiveTintColor: '#666',
            tabBarLabelStyle: { 
              fontSize: 14, 
              fontWeight: 'bold', 
              marginBottom: 5 
            },
            tabBarIconStyle: { display: 'none' }
          }}
        >
          <Tab.Screen 
            name="Inicio" 
            component={HomeScreen} 
            options={{ tabBarLabel: 'HOY' }}
          />
          <Tab.Screen 
            name="Calendario" 
            component={CalendarScreen} 
            options={{ tabBarLabel: 'SEMANA' }}
          />
          <Tab.Screen 
            name="Perfil" 
            component={ProfileScreen} 
            options={{ tabBarLabel: 'MI CUENTA' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}