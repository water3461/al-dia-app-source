import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native'; // 👈 Importante para recargar al volver
import { Ionicons } from '@expo/vector-icons';
import { DataService, Receipt } from '../services/DataService';

export default function HistoryScreen({ navigation }: any) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  // Esta función se ejecuta cada vez que la pantalla "toma foco" (cuando entras)
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    setLoading(true);
    const data = await DataService.getReceipts();
    setReceipts(data);
    setLoading(false);
  };

  const calculateTotal = () => {
    return receipts.reduce((sum, item) => sum + item.total, 0);
  };

  // Renderizamos cada fila de la lista
  const renderItem = ({ item }: { item: Receipt }) => (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="receipt-outline" size={24} color="#D4AF37" />
      </View>
      <View style={styles.info}>
        <Text style={styles.commerce}>{item.commerce}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.amount}>${item.total.toLocaleString('es-CL')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Gastos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* RESUMEN TOTAL */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>GASTO TOTAL REGISTRADO</Text>
        <Text style={styles.summaryValue}>${calculateTotal().toLocaleString('es-CL')}</Text>
      </View>

      {/* LISTA DE BOLETAS */}
      <FlatList
        data={receipts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadHistory} tintColor="#D4AF37" />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No hay boletas guardadas aún.</Text>
            <Text style={styles.emptySubText}>Ve a escanear tu primera compra.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { padding: 5 },
  title: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  
  summaryCard: { backgroundColor: '#1A1A1A', margin: 20, padding: 20, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  summaryLabel: { color: '#888', fontSize: 12, letterSpacing: 1, marginBottom: 5 },
  summaryValue: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 15, marginBottom: 10, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  iconBox: { width: 40, alignItems: 'center' },
  info: { flex: 1 },
  commerce: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  date: { color: '#666', fontSize: 12, marginTop: 2 },
  amount: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#666', fontSize: 16, marginTop: 10 },
  emptySubText: { color: '#444', fontSize: 12, marginTop: 5 }
});