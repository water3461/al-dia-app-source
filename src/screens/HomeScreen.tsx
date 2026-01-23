import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DataService } from '../services/DataService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [receiptCount, setReceiptCount] = useState(0);
  
  // META FICTICIA (Para el juego)
  const MONTHLY_BUDGET = 500000; 

  const loadData = async () => {
    const history = await DataService.getHistory();
    const total = history.reduce((acc, item) => acc + item.total, 0);
    setTotalSpent(total);
    setReceiptCount(history.length);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  // Cálculo de la barra de progreso
  const progress = Math.min(totalSpent / MONTHLY_BUDGET, 1);
  const progressColor = progress > 0.8 ? '#FF3B30' : (progress > 0.5 ? '#FFCC00' : '#4CD964');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#D4AF37"/>}
      >
        {/* HEADER TIPO JUEGO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, Capitán 👋</Text>
            <Text style={styles.subtitle}>Estado de tus finanzas</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color="#000" />
            <Text style={styles.badgeText}>NIVEL 1</Text>
          </View>
        </View>

        {/* TARJETA PRINCIPAL (HUD) */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>GASTO MENSUAL</Text>
          <Text style={styles.bigMoney}>${totalSpent.toLocaleString('es-CL')}</Text>
          
          <View style={styles.barContainer}>
            <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: progressColor }]} />
          </View>
          
          <View style={styles.rowBetween}>
            <Text style={styles.limitText}>Meta: ${MONTHLY_BUDGET.toLocaleString('es-CL')}</Text>
            <Text style={{color: progressColor, fontWeight:'bold'}}>
              {(progress * 100).toFixed(0)}% Usado
            </Text>
          </View>
        </View>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="receipt" size={24} color="#D4AF37" />
            <Text style={styles.statNumber}>{receiptCount}</Text>
            <Text style={styles.statLabel}>Boletas</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="trending-up" size={24} color="#4CD964" />
            <Text style={styles.statNumber}>Top</Text>
            <Text style={styles.statLabel}>Control</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="flame" size={24} color="#FF9500" />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Días Racha</Text>
          </View>
        </View>

        {/* ACCIONES RÁPIDAS */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Escanear' as never)}>
            <View style={[styles.iconCircle, {backgroundColor: 'rgba(212, 175, 55, 0.2)'}]}>
              <Ionicons name="scan" size={24} color="#D4AF37" />
            </View>
            <Text style={styles.actionText}>Escanear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('History' as never)}>
            <View style={[styles.iconCircle, {backgroundColor: 'rgba(255, 255, 255, 0.1)'}]}>
              <Ionicons name="list" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionText}>Historial</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 30 },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 14 },
  badge: { flexDirection: 'row', backgroundColor: '#D4AF37', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignItems: 'center', gap: 5 },
  badgeText: { fontWeight: 'bold', fontSize: 12 },
  
  mainCard: { backgroundColor: '#1C1C1E', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: '#333', marginBottom: 25 },
  cardTitle: { color: '#888', fontSize: 12, letterSpacing: 1, marginBottom: 5 },
  bigMoney: { color: '#FFF', fontSize: 42, fontWeight: 'bold', marginBottom: 20 },
  barContainer: { height: 10, backgroundColor: '#333', borderRadius: 5, marginBottom: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  limitText: { color: '#666', fontSize: 12 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { backgroundColor: '#111', width: '30%', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  statNumber: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginVertical: 5 },
  statLabel: { color: '#666', fontSize: 12 },

  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  actionGrid: { flexDirection: 'row', gap: 15 },
  actionBtn: { backgroundColor: '#1C1C1E', flex: 1, padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText: { color: '#FFF', fontWeight: 'bold' }
});