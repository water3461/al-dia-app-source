import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'; // <--- IMPORTANTE

// Importamos pantallas
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { DataService } from './src/services/DataService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. EL NAVIGATOR DE PESTAÑAS (Con ajuste automático de altura)
function MainTabs() {
  const insets = useSafeAreaInsets(); // <--- CALCULAMOS EL ESPACIO DE ANDROID

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1A1A1A',
          // AQUI ESTA EL ARREGLO:
          // Altura base (60) + Lo que mida la barra de Android (insets.bottom)
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10), 
          // Empujamos los iconos hacia arriba para que no los tape la barra
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
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

// 2. LA APP COMPLETA
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    // await DataService.resetOnboarding(); // Descomentar para probar bienvenida
    const isDone = await DataService.hasCompletedOnboarding();
    setShowOnboarding(!isDone);
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
    // SafeAreaProvider es necesario para que funcionen los cálculos de insets
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {showOnboarding ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : null}
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}