import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { DataService, Rule, BankCard } from '../services/DataService';

export default function HomeScreen() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [banks, setBanks] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 1. Bajamos las reglas de hoy
    const rulesData = await DataService.getDailyRules();
    // 2. Bajamos la info de los bancos (para saber los colores)
    const banksData = await DataService.getBanks();
    
    setRules(rulesData);
    setBanks(banksData);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Función para encontrar el color del banco
  const getBankColor = (issuerId: string) => {
    const bank = banks.find(b => b.id === issuerId);
    return bank ? bank.primary_color : '#1C1C1E'; // Si no encuentra, usa gris
  };

  // Función para encontrar el logo/nombre bonito
  const getBankName = (issuerId: string) => {
    const bank = banks.find(b => b.id === issuerId);
    return bank ? bank.name : issuerId.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>AL DÍA</Text>
        <Text style={styles.subGreeting}>Tu Estrategia de Domingo</Text>
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
              
              {/* CABECERA DE LA TARJETA */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardBankName}>{getBankName(item.issuer_id)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.benefit_value}</Text>
                </View>
              </View>

              {/* CUERPO */}
              <Text style={styles.cardCommerce}>{item.commerce_name}</Text>
              <Text style={styles.cardCondition}>{item.condition}</Text>
              
              {/* TIP INTELEGENTE */}
              <View style={styles.tipContainer}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.cardTip}>{item.smart_tip}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Hoy no hay reglas críticas. Ahorra batería.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800', // Más grueso
    color: '#D4AF37',
    letterSpacing: 1,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 15,
    fontWeight: '700',
    opacity: 0.5,
    letterSpacing: 1,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  // TARJETA MEJORADA
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardBankName: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  discountBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardCommerce: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardCondition: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)', // Fondo oscurito para el tip
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  cardTip: {
    color: '#FFF',
    fontStyle: 'italic',
    fontSize: 13,
    flex: 1, // Para que el texto ocupe el resto del espacio
  }
});