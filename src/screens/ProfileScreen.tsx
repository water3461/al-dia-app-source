import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { DataService, BankCard } from '../services/DataService';
import { NotificationService } from '../services/NotificationService';

export default function ProfileScreen() {
  const [banks, setBanks] = useState<BankCard[]>([]);
  const [hiddenBanks, setHiddenBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const banksData = await DataService.getBanks();
    const hiddenData = await DataService.getHiddenBanks();
    setBanks(banksData);
    setHiddenBanks(hiddenData);
    setLoading(false);
  };

  const toggleBank = async (bankId: string) => {
    let newHiddenList;
    if (hiddenBanks.includes(bankId)) newHiddenList = hiddenBanks.filter(id => id !== bankId);
    else newHiddenList = [...hiddenBanks, bankId];
    setHiddenBanks(newHiddenList);
    await DataService.saveHiddenBanks(newHiddenList);
  };

  const handleNotifications = async () => {
    const hasPermission = await NotificationService.requestPermissions();
    if (hasPermission) {
      await NotificationService.testNotification();
      await NotificationService.scheduleDailyReminder();
      Alert.alert("✅ Activadas", "Te avisaremos todos los días a las 9:00 AM.");
    } else {
      Alert.alert("⚠️ Permiso denegado", "Actívalas en la configuración de tu celular.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>MI PERFIL</Text></View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}><Text style={styles.avatarText}>YO</Text></View>
          <View><Text style={styles.userName}>Configuración</Text><Text style={styles.userLevel}>Personaliza tu app</Text></View>
        </View>

        <Text style={styles.sectionTitle}>MIS TARJETAS Y BANCOS</Text>
        <View style={styles.optionsContainer}>
          {loading ? ( <ActivityIndicator color="#D4AF37" style={{padding: 20}} /> ) : (
            banks.map((bank, index) => {
              const isActive = !hiddenBanks.includes(bank.id);
              return (
                <View key={bank.id} style={[styles.optionRow, index > 0 && styles.separator]}>
                  <View style={[styles.colorDot, { backgroundColor: bank.primary_color }]} />
                  <Text style={styles.optionText}>{bank.name}</Text>
                  <Switch trackColor={{ false: "#333", true: "#D4AF37" }} thumbColor={isActive ? "#FFF" : "#f4f3f4"} onValueChange={() => toggleBank(bank.id)} value={isActive} />
                </View>
              );
            })
          )}
        </View>

        <Text style={styles.sectionTitle}>PREFERENCIAS</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionRow} onPress={handleNotifications}>
            <Text style={styles.optionIcon}>🔔</Text><Text style={styles.optionText}>Notificaciones Diarias</Text><Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionRow, styles.separator]} onPress={() => Alert.alert("Info", "Modo Oscuro activo")}>
            <Text style={styles.optionIcon}>🌙</Text><Text style={styles.optionText}>Modo Oscuro</Text><Text style={[styles.arrow, {color: '#D4AF37'}]}>On</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.versionText}>AL DÍA v1.0.0</Text>
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
  sectionTitle: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold', marginBottom: 5, marginLeft: 10 },
  optionsContainer: { backgroundColor: '#1C1C1E', borderRadius: 15, marginBottom: 20 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  separator: { borderTopWidth: 1, borderTopColor: '#2C2C2E' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 15, borderWidth: 1, borderColor: '#888' }, // FIX BORDE
  optionIcon: { fontSize: 20, marginRight: 15, width: 30, textAlign: 'center' },
  optionText: { color: '#FFF', fontSize: 16, flex: 1 },
  arrow: { color: '#666', fontSize: 20, fontWeight: 'bold' },
  versionText: { color: '#444', textAlign: 'center', fontSize: 12 },
});