import React, { useEffect, useState, useCallback } from 'react'; // <--- OJO: Agregamos useCallback
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <--- NUEVO: Para detectar cuando vuelves a la pantalla
import { DataService, Rule, BankCard } from '../services/DataService';

export default function HomeScreen() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [banks, setBanks] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Usamos useFocusEffect para recargar cada vez que entras a la pantalla
  // (Por si cambiaste algo en el Perfil)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    // 1. Bajamos todo
    const rulesData = await DataService.getDailyRules();
    const banksData = await DataService.getBanks();
    const hiddenBanks = await DataService.getHiddenBanks(); // <--- NUEVO: Leemos los ocultos

    // 2. Filtramos: Solo dejamos pasar las reglas de bancos NO ocultos
    const filteredRules = rulesData.filter(r => !hiddenBanks.includes(r.issuer_id));

    setRules(filteredRules);
    setBanks(banksData);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getBankColor = (issuerId: string) => {
    const bank = banks.find(b => b.id === issuerId);
    return bank ? bank.primary_color : '#1C1C1E';
  };

  const getBankName = (issuerId: string) => {
    const bank = banks.find(b => b.id === issuerId);
    return bank ? bank.name : issuerId.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>AL DÍA</Text>
        <Text style={styles.subGreeting}>Tu Estrategia de Hoy</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        <Text style={styles.sectionTitle}>OPORTUNIDADES DE HOY</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#D4AF37" style={{marginTop: 50}} />
        ) : rules.length > 0 ? (
          rules.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: getBankColor(item.issuer_id) }]}>
              
              <View style={styles.cardHeader}>
                <Text style={styles.cardBankName}>{getBankName(item.issuer_id)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.benefit_value}</Text>
                </View>
              </View>

              <Text style={styles.cardCommerce}>{item.commerce_name}</Text>
              <Text style={styles.cardCondition}>{item.condition}</Text>
              
              <View style={styles.tipContainer}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.cardTip}>{item.smart_tip}</Text>
              </View>
            </View>
          ))
        ) : (
          // Mensaje especial si filtraste todo
          <View style={{alignItems: 'center', marginTop: 50}}>
            <Text style={{fontSize: 40}}>💤</Text>
            <Text style={styles.emptyText}>No hay alertas activas.</Text>
            <Text style={{color: '#444', marginTop: 10}}>Revisa tu Perfil para activar más bancos.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  greeting: { fontSize: 28, fontWeight: '800', color: '#D4AF37', letterSpacing: 1 },
  subGreeting: { fontSize: 14, color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 },
  scrollContent: { padding: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, marginBottom: 15, fontWeight: '700', opacity: 0.5, letterSpacing: 1 },
  emptyText: { color: '#666', fontSize: 16, marginTop: 10, textAlign: 'center' },
  
  card: { borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardBankName: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 14, textTransform: 'uppercase' },
  discountBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cardCommerce: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  cardCondition: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },
  tipContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12, alignItems: 'center' },
  tipIcon: { fontSize: 16, marginRight: 10 },
  cardTip: { color: '#FFF', fontStyle: 'italic', fontSize: 13, flex: 1 }
});