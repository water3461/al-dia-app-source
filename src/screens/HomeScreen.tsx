import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // 👈 Vital para actualizar al volver

// Importamos el servicio de datos
import { DataService, Rule, Receipt } from '../services/DataService';

export default function HomeScreen({ navigation }: any) {
  const [dailyRules, setDailyRules] = useState<Rule[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [greeting, setGreeting] = useState('');

  // Se ejecuta cada vez que la pantalla se enfoca (entra en vista)
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
      determineGreeting();
    }, [])
  );

  const determineGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  };

  const loadDashboardData = async () => {
    // 1. Cargar Reglas/Beneficios (Esto sigue igual)
    const rules = await DataService.getDailyRules();
    setDailyRules(rules);

    // 2. 👇 CARGAR GASTOS REALES
    const allReceipts = await DataService.getReceipts();
    
    // A. Calcular Total
    const total = allReceipts.reduce((sum, item) => sum + item.total, 0);
    setTotalSpent(total);

    // B. Obtener solo las últimas 5 boletas
    // (Asumiendo que las guardamos nuevas primero, si no, habría que ordenar)
    setRecentReceipts(allReceipts.slice(0, 5));
  };

  // Renderizar tarjeta de Beneficio
  const renderRuleCard = ({ item }: { item: Rule }) => (
    <View style={styles.ruleCard}>
      <View style={styles.ruleHeader}>
        <Ionicons name="pricetag" size={16} color="#D4AF37" />
        <Text style={styles.commerceName}>{item.commerce_name}</Text>
      </View>
      <Text style={styles.benefitValue}>{item.benefit_value}</Text>
      <Text style={styles.conditionText}>{item.condition}</Text>
      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>💡 {item.smart_tip}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>Usuario Al Día</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
            <Ionicons name="person-circle-outline" size={40} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* RESUMEN DE GASTOS (REAL) */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>GASTO TOTAL REGISTRADO</Text>
          <Text style={styles.summaryAmount}>${totalSpent.toLocaleString('es-CL')}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Boletas</Text>
              <Text style={styles.statValue}>{recentReceipts.length > 0 ? 'Activo' : '0'}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Ahorro Est.</Text>
              <Text style={styles.statValue}>$0</Text> 
            </View>
          </View>
        </View>

        {/* BENEFICIOS DE HOY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficios de Hoy ⚡</Text>
          <FlatList
            data={dailyRules}
            renderItem={renderRuleCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rulesList}
          />
        </View>

        {/* ÚLTIMOS MOVIMIENTOS (REAL) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos Escaneos 🧾</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.linkText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {/* Lista Dinámica */}
          {recentReceipts.length > 0 ? (
            recentReceipts.map((receipt) => (
              <View key={receipt.id} style={styles.transactionRow}>
                <View style={styles.transIcon}>
                  <Ionicons name="receipt" size={20} color="#000" />
                </View>
                <View style={styles.transInfo}>
                  <Text style={styles.transCommerce}>{receipt.commerce}</Text>
                  <Text style={styles.transDate}>{receipt.date}</Text>
                </View>
                <Text style={styles.transAmount}>${receipt.total.toLocaleString('es-CL')}</Text>
              </View>
            ))
          ) : (
            // Estado Vacío
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay movimientos recientes.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Escanear')} style={styles.scanBtnMini}>
                <Text style={styles.scanBtnText}>Escanear Ahora</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  greeting: { color: '#888', fontSize: 14 },
  userName: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  profileBtn: { padding: 5 },

  summaryCard: { backgroundColor: '#1A1A1A', margin: 20, padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  summaryLabel: { color: '#888', fontSize: 12, letterSpacing: 1, marginBottom: 5 },
  summaryAmount: { color: '#D4AF37', fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 15 },
  stat: { marginRight: 30 },
  statLabel: { color: '#666', fontSize: 12 },
  statValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  section: { marginTop: 10, paddingBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#D4AF37', fontSize: 14 },

  rulesList: { paddingHorizontal: 20 },
  ruleCard: { backgroundColor: '#111', width: 200, padding: 15, borderRadius: 15, marginRight: 15, borderWidth: 1, borderColor: '#222' },
  ruleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  commerceName: { color: '#FFF', fontWeight: 'bold', marginLeft: 5 },
  benefitValue: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  conditionText: { color: '#888', fontSize: 12, marginTop: 5 },
  tipContainer: { marginTop: 10, backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 8, borderRadius: 8 },
  tipText: { color: '#D4AF37', fontSize: 10 },

  transactionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  transIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  transInfo: { flex: 1 },
  transCommerce: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  transDate: { color: '#666', fontSize: 12 },
  transAmount: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 10 },
  emptyText: { color: '#666', marginBottom: 10 },
  scanBtnMini: { backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  scanBtnText: { color: '#FFF', fontSize: 12 }
});