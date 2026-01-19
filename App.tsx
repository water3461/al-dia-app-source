import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { DataService } from './src/services/DataService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets(); 
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1A1A1A',
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10), 
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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => { checkFirstLaunch(); }, []);

  const checkFirstLaunch = async () => {
    // Si quieres probar la bienvenida otra vez, descomenta la linea de abajo:
    // await DataService.resetOnboarding(); 
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
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {showOnboarding ? ( <Stack.Screen name="Onboarding" component={OnboardingScreen} /> ) : null}
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}