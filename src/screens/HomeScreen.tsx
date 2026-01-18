import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { DataService, Rule } from '../services/DataService';

export default function HomeScreen() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Aquí llamamos a tu API en GitHub
    const data = await DataService.getDailyRules();
    setRules(data);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.greeting}>AL DÍA</Text>
        <Text style={styles.subGreeting}>Asesor Financiero</Text>
      </View>

      {/* CONTENIDO */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>TU ESTRATEGIA DE HOY</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#D4AF37" style={{marginTop: 50}} />
        ) : rules.length > 0 ? (
          rules.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardBank}>{item.issuer_id.toUpperCase()}</Text>
                <Text style={styles.cardBenefit}>{item.benefit_value}</Text>
              </View>
              <Text style={styles.cardCommerce}>{item.commerce_name}</Text>
              <Text style={styles.cardTip}>"{item.smart_tip}"</Text>
              <Text style={styles.cardCondition}>Condición: {item.condition}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Hoy no hay reglas críticas. Descansa tu billetera.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // FONDO NEGRO ABSOLUTO
  },
  header: {
    padding: 20,
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37', // DORADO PREMIUM
    letterSpacing: 2,
  },
  subGreeting: {
    fontSize: 14,
    color: '#888',
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    fontWeight: '600',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  // ESTILO DE LA TARJETA (CARD)
  card: {
    backgroundColor: '#1C1C1E', // GRIS OSCURO
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardBank: {
    color: '#8E8E93',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardBenefit: {
    color: '#00FF94', // VERDE NEÓN (PROMO)
    fontWeight: 'bold',
    fontSize: 18,
  },
  cardCommerce: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardTip: {
    color: '#D4AF37', // DORADO
    fontStyle: 'italic',
    fontSize: 14,
    marginBottom: 15,
  },
  cardCondition: {
    color: '#666',
    fontSize: 12,
  }
});