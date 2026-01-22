import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import ScanScreen from './src/screens/ScanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import EditBanksScreen from './src/screens/EditBanksScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { DataService } from './src/services/DataService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333333',
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom + 5,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#666666',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Asistente') iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
          else if (route.name === 'Escanear') { iconName = focused ? 'scan-circle' : 'scan-circle-outline'; size = 32; }
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Asistente" component={AssistantScreen} />
      <Tab.Screen name="Escanear" component={ScanScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Onboarding');

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const complete = await DataService.isOnboardingComplete();
    setInitialRoute(complete ? 'Main' : 'Onboarding');
    setLoading(false);
  };

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
          
          {/* 👇 ESTO ARREGLA EL ERROR DE LAS FOTOS 22, 33, 88 */}
          {/* Dejamos Onboarding siempre disponible, aunque ya te hayas logueado */}
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditBanks" component={EditBanksScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}