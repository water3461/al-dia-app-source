import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { DataService, BankCard } from '../services/DataService';

export default function ProfileScreen() {
  const [banks, setBanks] = useState<BankCard[]>([]);
  const [hiddenBanks, setHiddenBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    // Cargar bancos reales y preferencias guardadas
    const banksData = await DataService.getBanks();
    const hiddenData = await DataService.getHiddenBanks();
    
    setBanks(banksData);
    setHiddenBanks(hiddenData);
    setLoading(false);
  };

  const toggleBank = async (bankId: string) => {
    let newHiddenList;
    
    if (hiddenBanks.includes(bankId)) {
      // Si estaba oculto, lo sacamos de la lista (lo activamos)
      newHiddenList = hiddenBanks.filter(id => id !== bankId);
    } else {
      // Si estaba activo, lo metemos a la lista de ocultos
      newHiddenList = [...hiddenBanks, bankId];
    }

    setHiddenBanks(newHiddenList);
    await DataService.saveHiddenBanks(newHiddenList);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MI PERFIL</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* TARJETA DE USUARIO */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>YO</Text>
          </View>
          <View>
            <Text style={styles.userName}>Configuración</Text>
            <Text style={styles.userLevel}>Personaliza tus alertas</Text>
          </View>
        </View>

        {/* LISTA DINÁMICA DE BANCOS */}
        <Text style={styles.sectionTitle}>MIS TARJETAS Y BANCOS</Text>
        <Text style={styles.sectionSubtitle}>Apaga los que no tengas para limpiar tu inicio.</Text>
        
        <View style={styles.optionsContainer}>
          {loading ? (
            <ActivityIndicator color="#D4AF37" style={{padding: 20}} />
          ) : (
            banks.map((bank, index) => {
              const isActive = !hiddenBanks.includes(bank.id);
              
              return (
                <View key={bank.id} style={[styles.optionRow, index > 0 && styles.separator]}>
                  {/* Círculo de color del banco */}
                  <View style={[styles.colorDot, { backgroundColor: bank.primary_color }]} />
                  
                  <Text style={styles.optionText}>{bank.name}</Text>
                  
                  <Switch
                    trackColor={{ false: "#333", true: "#D4AF37" }}
                    thumbColor={isActive ? "#FFF" : "#f4f3f4"}
                    onValueChange={() => toggleBank(bank.id)}
                    value={isActive}
                  />
                </View>
              );
            })
          )}
        </View>

        <Text style={styles.versionText}>Tus cambios se guardan automáticamente.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#222' },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  scroll: { padding: 20 },

  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', padding: 20, borderRadius: 15, marginBottom: 20 },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#D4AF37' },
  avatarText: { color: '#D4AF37', fontWeight: 'bold' },
  userName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  userLevel: { color: '#888', fontSize: 13 },

  sectionTitle: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold', marginBottom: 5, marginLeft: 10, letterSpacing: 1 },
  sectionSubtitle: { color: '#666', fontSize: 12, marginBottom: 15, marginLeft: 10 },
  
  optionsContainer: { backgroundColor: '#1C1C1E', borderRadius: 15, marginBottom: 20, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 15, justifyContent: 'space-between' },
  separator: { borderTopWidth: 1, borderTopColor: '#2C2C2E' },
  
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  optionText: { color: '#FFF', fontSize: 16, flex: 1, fontWeight: '500' },
  
  versionText: { color: '#444', textAlign: 'center', fontSize: 12 },
});