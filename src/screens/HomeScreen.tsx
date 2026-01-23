import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DataService } from '../services/DataService';
import { AIService } from '../services/AIService'; // <--- Importamos la IA

export default function HomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [receiptCount, setReceiptCount] = useState(0);
  const [dailyQuote, setDailyQuote] = useState("Cargando opinión..."); // <--- Estado para la frase

  const MONTHLY_BUDGET = 500000; 

  const loadData = async () => {
    const history = await DataService.getHistory();
    const total = history.reduce((acc, item) => acc + item.total, 0);
    setTotalSpent(total);
    setReceiptCount(history.length);
    
    // PEDIR OPINIÓN A LA IA (DOPAMINA)
    const quote = await AIService.generateDailyQuote(total);
    setDailyQuote(quote);
    
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const progress = Math.min(totalSpent / MONTHLY_BUDGET, 1);
  const progressColor = progress > 0.8 ? '#FF3B30' : (progress > 0.5 ? '#FFCC00' : '#4CD964');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#D4AF37"/>}
      >
        {/* HEADER CON IA */}
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Text style={styles.greeting}>Hola, Jefe 👋</Text>
            {/* AQUÍ VA LA FRASE DIVERTIDA */}
            <Text style={styles.aiQuote}>"{dailyQuote}"</Text>
          </View>
          <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
             <Ionicons name="refresh" size={20} color="#000" />
          </TouchableOpacity>
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

        {/* MEDALLAS (VISUALES POR AHORA) */}
        <Text style={styles.sectionTitle}>Tus Logros 🏆</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
            <View style={styles.badgeCard}>
                <Ionicons name="flash" size={30} color="#FFCC00" />
                <Text style={styles.badgeText}>Iniciador</Text>
            </View>
            <View style={[styles.badgeCard, receiptCount < 5 && styles.lockedBadge]}>
                <Ionicons name="cart" size={30} color={receiptCount >= 5 ? "#4CD964" : "#555"} />
                <Text style={styles.badgeText}>Comprador</Text>
                {receiptCount < 5 && <Ionicons name="lock-closed" size={14} color="#555" style={styles.lockIcon} />}
            </View>
            <View style={[styles.badgeCard, styles.lockedBadge]}>
                <Ionicons name="diamond" size={30} color="#555" />
                <Text style={styles.badgeText}>Magnate</Text>
                <Ionicons name="lock-closed" size={14} color="#555" style={styles.lockIcon} />
            </View>
        </ScrollView>

        {/* ACCIONES RÁPIDAS */}
        <Text style={styles.sectionTitle}>Acciones</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, marginBottom: 25 },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  aiQuote: { color: '#D4AF37', fontSize: 14, fontStyle: 'italic', marginTop: 5, maxWidth: '90%' },
  refreshBtn: { backgroundColor: '#D4AF37', padding: 8, borderRadius: 20 },
  
  mainCard: { backgroundColor: '#1C1C1E', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: '#333', marginBottom: 25 },
  cardTitle: { color: '#888', fontSize: 12, letterSpacing: 1, marginBottom: 5 },
  bigMoney: { color: '#FFF', fontSize: 42, fontWeight: 'bold', marginBottom: 20 },
  barContainer: { height: 10, backgroundColor: '#333', borderRadius: 5, marginBottom: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  limitText: { color: '#666', fontSize: 12 },

  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  
  // ESTILOS DE MEDALLAS
  badgesScroll: { marginBottom: 25 },
  badgeCard: { backgroundColor: '#1C1C1E', width: 90, height: 100, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15, borderWidth: 1, borderColor: '#333' },
  badgeText: { color: '#FFF', fontSize: 12, marginTop: 10, fontWeight: 'bold' },
  lockedBadge: { opacity: 0.5, borderColor: '#222', backgroundColor: '#111' },
  lockIcon: { position: 'absolute', top: 5, right: 5 },

  actionGrid: { flexDirection: 'row', gap: 15 },
  actionBtn: { backgroundColor: '#1C1C1E', flex: 1, padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText: { color: '#FFF', fontWeight: 'bold' }
});