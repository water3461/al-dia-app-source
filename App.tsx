import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// SERVICIOS
import { DataService } from './src/services/DataService';
import { NotificationService } from './src/services/NotificationService';

// PANTALLAS
import HomeScreen from './src/screens/HomeScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import ScanScreen from './src/screens/ScanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import EditBanksScreen from './src/screens/EditBanksScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import WalletSetupScreen from './src/screens/WalletSetupScreen'; // <--- NUEVA IMPORTACIÓN

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#111', 
          borderTopColor: '#333',
          height: 60,
          paddingBottom: 8
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#666',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Asistente') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          else if (route.name === 'Escanear') iconName = focused ? 'scan-circle' : 'scan-circle-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Asistente" component={AssistantScreen} />
      <Tab.Screen name="Escanear" component={ScanScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    checkOnboarding();
    NotificationService.registerForPushNotificationsAsync();
    NotificationService.scheduleDailyReminder();
  }, []);

  const checkOnboarding = async () => {
    // Verificamos si ya pasó el onboarding
    const complete = await DataService.isOnboardingComplete();
    setInitialRoute(complete ? 'Main' : 'Onboarding');
  };

  if (!initialRoute) return null; // Pantalla negra mientras carga

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
          
          {/* FLUJO DE BIENVENIDA */}
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="WalletSetup" component={WalletSetupScreen} />
          
          {/* APP PRINCIPAL */}
          <Stack.Screen name="Main" component={MainTabs} />
          
          {/* PANTALLAS SECUNDARIAS */}
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditBanks" component={EditBanksScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}