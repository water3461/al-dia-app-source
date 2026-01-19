import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // <--- IMPORTANTE
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

// Importamos pantallas
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen'; // <--- NUEVA
import { DataService } from './src/services/DataService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. EL NAVIGATOR DE PESTAÑAS (La App principal)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1A1A1A',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#666666',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Hoy') iconName = focused ? 'flash' : 'flash-outline';
          else if (route.name === 'Semana') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Mi Cuenta') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Hoy" component={HomeScreen} />
      <Tab.Screen name="Semana" component={CalendarScreen} />
      <Tab.Screen name="Mi Cuenta" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// 2. LA APP COMPLETA (Controla si vas al Onboarding o al Main)
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    // Descomenta la siguiente línea si quieres probar la bienvenida forzosamente:
    await DataService.resetOnboarding(); 
    
    const isDone = await DataService.hasCompletedOnboarding();
    setShowOnboarding(!isDone); // Si NO está hecho, mostramos onboarding
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={{flex:1, backgroundColor:'#000', justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          // Si es primera vez, mostramos SOLO Onboarding
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : null}
        
        {/* Siempre cargamos MainTabs, pero si hay onboarding, React Navigation lo manejará */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}