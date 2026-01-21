import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { DataService, BankCard } from '../services/DataService';

export default function OnboardingScreen({ navigation }: any) {
  const [banks, setBanks] = useState<BankCard[]>([]);
  // Guardamos los IDs de los bancos que el usuario selecciona (TIENE)
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    // Usamos getBanks para obtener la lista (descargará o usará caché)
    const data = await DataService.getBanks();
    setBanks(data);
    setLoading(false);
  };

  const toggleBank = (id: string) => {
    if (selectedBanks.includes(id)) {
      // Si ya estaba, lo sacamos
      setSelectedBanks(selectedBanks.filter(item => item !== id));
    } else {
      // Si no estaba, lo agregamos
      setSelectedBanks([...selectedBanks, id]);
    }
  };

  const handleContinue = async () => {
    // LÓGICA:
    // El usuario selecciona lo que TIENE.
    // La App necesita saber qué OCULTAR (lo que NO tiene).
    
    const allIds = banks.map(b => b.id);
    const hiddenIds = allIds.filter(id => !selectedBanks.includes(id));
    
    // 1. Guardamos la preferencia de ocultos
    await DataService.saveHiddenBanks(hiddenIds);
    
    // 2. Marcamos que ya terminó la bienvenida
    await DataService.completeOnboarding();
    
    // 3. CORREGIDO: Navegamos a 'Main' (que es el nombre correcto en App.tsx)
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>Bienvenido a AL DÍA</Text>
        <Text style={styles.subtitle}>Selecciona los bancos o tarjetas que tienes:</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.list}>
          {banks.map((bank) => {
            const isSelected = selectedBanks.includes(bank.id);
            return (
              <TouchableOpacity 
                key={bank.id} 
                style={[
                  styles.option, 
                  isSelected && styles.optionSelected, 
                  { borderColor: isSelected ? '#D4AF37' : '#333' }
                ]}
                onPress={() => toggleBank(bank.id)}
              >
                {/* Círculo con borde para que se vea el negro */}
                <View style={[styles.dot, { backgroundColor: bank.primary_color }]} />
                
                <Text style={[styles.bankName, isSelected && { color: '#D4AF37', fontWeight: 'bold' }]}>
                  {bank.name}
                </Text>
                
                {/* Checkbox visual */}
                <View style={[styles.checkbox, isSelected && { borderColor: '#D4AF37' }]}>
                  {isSelected && <Text style={styles.check}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{height: 100}} /> 
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, selectedBanks.length === 0 && styles.buttonDisabled]} 
          onPress={handleContinue}
          disabled={selectedBanks.length === 0}
        >
          <Text style={styles.buttonText}>
            {selectedBanks.length === 0 ? 'Selecciona al menos uno' : 'COMENZAR A AHORRAR 🚀'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 30, alignItems: 'center' },
  emoji: { fontSize: 50, marginBottom: 10 },
  title: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: '#888', textAlign: 'center', fontSize: 16, lineHeight: 22 },
  
  list: { paddingHorizontal: 20 },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', padding: 15, marginBottom: 10, borderRadius: 12, borderWidth: 1 },
  optionSelected: { backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  
  // ESTILO CORREGIDO CON BORDE
  dot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    marginRight: 15,
    borderWidth: 1,      // <-- Borde
    borderColor: '#888'  // <-- Gris claro para contraste
  },

  bankName: { color: '#FFF', fontSize: 16, flex: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#666', justifyContent: 'center', alignItems: 'center' },
  check: { color: '#D4AF37', fontWeight: 'bold', fontSize: 14 },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#222', backgroundColor: '#000' },
  button: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 15, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#333' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});