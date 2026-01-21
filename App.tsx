import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
// 👇 IMPORTANTE: Importamos esto para evitar que la barra blanca tape los botones
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
  // 👇 Calculamos el espacio seguro para tu S25 Ultra
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333333',
          // 👇 Altura dinámica: 60px + el espacio que necesite el sistema
          height: 60 + insets.bottom, 
          // 👇 Empujamos los botones hacia arriba para que no los tape la barra blanca
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8, 
          paddingTop: 8,
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
          // 👇 CORRECCIÓN: Ahora buscamos "Profile" en inglés
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Escanear" component={ScanScreen} />
      
      {/* 👇 CORRECCIÓN CLAVE: Nombre interno "Profile", Título visible "Perfil" */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }} 
      />
      
    </Tab.Navigator>
  );
}

// --- NAVEGACIÓN PRINCIPAL (APP) ---
export default function App() {
  const [isOnboarding, setIsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const complete = await DataService.isOnboardingComplete();
    setIsOnboarding(!complete);
  };

  if (isOnboarding === null) return null; // Cargando...

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {isOnboarding && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="EditBanks" component={EditBanksScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}