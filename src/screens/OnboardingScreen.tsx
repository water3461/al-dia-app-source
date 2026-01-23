import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const navigation = useNavigation();

  const handleStart = () => {
    // CAMBIO CLAVE: Vamos a la configuración de billetera primero
    navigation.navigate('WalletSetup' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.iconContainer}>
          <Ionicons name="wallet" size={80} color="#D4AF37" />
        </View>

        <Text style={styles.title}>AL DÍA</Text>
        <Text style={styles.subtitle}>Tus finanzas, a lo chileno. 🇨🇱</Text>

        <View style={styles.features}>
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={20} color="#D4AF37"/>
            <Text style={styles.featText}>Ordena tus tarjetas fácil</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={20} color="#D4AF37"/>
            <Text style={styles.featText}>IA que te dice con cuál pagar</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={20} color="#D4AF37"/>
            <Text style={styles.featText}>Escanea boletas al toque</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleStart}>
          <Text style={styles.btnText}>COMENZAR</Text>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconContainer: { marginBottom: 30, shadowColor: '#D4AF37', shadowOpacity: 0.5, shadowRadius: 20 },
  title: { fontSize: 40, fontWeight: 'bold', color: '#FFF', letterSpacing: 5, marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#888', marginBottom: 50 },
  
  features: { alignSelf: 'flex-start', marginBottom: 60, marginLeft: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  featText: { color: '#CCC', fontSize: 16 },

  btn: { backgroundColor: '#D4AF37', width: '100%', padding: 20, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }
});