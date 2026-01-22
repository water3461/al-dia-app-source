import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
// 👇 Importante para que no se tapen los botones en tu S25 Ultra
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Importamos las pantallas
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import EditBanksScreen from './src/screens/EditBanksScreen';
import HistoryScreen from './src/screens/HistoryScreen';

// Importamos servicios
import { DataService } from './src/services/DataService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// --- BARRA INFERIOR (TABS) ---
function MainTabs() {
  const insets = useSafeAreaInsets(); // 👈 Detectamos el espacio seguro

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333333',
          // 👇 MEJORA VISUAL: 70px base + espacio del sistema para que se vea amplio y elegante
          height: 70 + insets.bottom, 
          // 👇 Damos 10px extra de aire sobre la barra blanca de Android
          paddingBottom: insets.bottom + 10, 
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#666666',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Escanear') {
            iconName = focused ? 'scan-circle' : 'scan-circle-outline';
            size = 32; 
          } else if (route.name === 'Profile') { // 👈 Busca "Profile" (inglés) internamente
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Escanear" component={ScanScreen} />
      
      {/* 👇 Nombre interno "Profile" para código, Título "Perfil" para el usuario */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }} 
      />
    </Tab.Navigator>
  );
}

// --- NAVEGACIÓN PRINCIPAL ---
export default function App() {
  const [isOnboarding, setIsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const complete = await DataService.isOnboardingComplete();
    setIsOnboarding(!complete);
  };

  if (isOnboarding === null) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isOnboarding && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          
          {/* Aquí definimos que el grupo de pestañas se llama "Main" */}
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="EditBanks" component={EditBanksScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}