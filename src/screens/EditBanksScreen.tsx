import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataService, BankCard } from '../services/DataService';

export default function EditBanksScreen({ navigation }: any) {
  const [banks, setBanks] = useState<BankCard[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentSelection();
  }, []);

  const loadCurrentSelection = async () => {
    // 1. Cargamos TODOS los bancos posibles
    const allBanks = await DataService.getBanks();
    
    // 2. Cargamos los que el usuario tiene OCULTOS (los que NO quiere)
    const hiddenIds = await DataService.getHiddenBanks();
    
    // 3. Calculamos los seleccionados (Total - Ocultos = Visibles)
    const visibleIds = allBanks.filter(b => !hiddenIds.includes(b.id)).map(b => b.id);
    
    setBanks(allBanks);
    setSelectedBanks(visibleIds);
    setLoading(false);
  };

  const toggleBank = (id: string) => {
    if (selectedBanks.includes(id)) {
      setSelectedBanks(selectedBanks.filter(item => item !== id));
    } else {
      setSelectedBanks([...selectedBanks, id]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    // Calculamos de nuevo los ocultos para guardar
    const allIds = banks.map(b => b.id);
    const hiddenIds = allIds.filter(id => !selectedBanks.includes(id));
    
    await DataService.saveHiddenBanks(hiddenIds);
    
    // Volvemos atrás
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER CON BOTÓN ATRÁS */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Bancos</Text>
        <View style={{width: 24}} /> 
      </View>

      <Text style={styles.subtitle}>Activa o desactiva tus tarjetas para personalizar tus alertas.</Text>

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
                <View style={[styles.dot, { backgroundColor: bank.primary_color }]} />
                <Text style={[styles.bankName, isSelected && { color: '#D4AF37', fontWeight: 'bold' }]}>
                  {bank.name}
                </Text>
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
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>GUARDAR CAMBIOS 💾</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  backButton: { padding: 5 },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#888', textAlign: 'center', padding: 20, fontSize: 14 },
  
  list: { paddingHorizontal: 20 },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', padding: 15, marginBottom: 10, borderRadius: 12, borderWidth: 1 },
  optionSelected: { backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 15, borderWidth: 1, borderColor: '#888' },
  bankName: { color: '#FFF', fontSize: 16, flex: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#666', justifyContent: 'center', alignItems: 'center' },
  check: { color: '#D4AF37', fontWeight: 'bold', fontSize: 14 },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#222', backgroundColor: '#000' },
  saveButton: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 15, alignItems: 'center' },
  saveText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});