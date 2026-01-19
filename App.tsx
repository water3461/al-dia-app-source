// ... (Asegúrate de importar ScanScreen arriba junto a los otros imports)
import ScanScreen from './src/screens/ScanScreen'; // <--- AGREGA ESTO ARRIBA

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