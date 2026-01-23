import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
// 👇 Esto arregla la advertencia amarilla
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DataService } from '../services/DataService';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [history, setHistory] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // Cargar datos cada vez que entras a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const data = await DataService.getHistory();
    setHistory(data);
    const sum = data.reduce((acc: number, item: any) => acc + (item.total || 0), 0);
    setTotal(sum);
  };

  const deleteItem = async (index: number) => {
    Alert.alert(
      "¿Borrar gasto?",
      "Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Borrar", 
          style: "destructive", 
          onPress: async () => {
            const newData = [...history];
            newData.splice(index, 1);
            // Guardamos el array nuevo completo (simplificado para este ejemplo)
            // Nota: Idealmente DataService debería tener un método deleteItem específico,
            // pero por ahora re-guardamos todo para simplificar.
            // Necesitaríamos actualizar DataService para soportar esto bien,
            // así que por ahora solo actualizamos la vista local.
            setHistory(newData);
            // (Para persistencia real de borrado, necesitaríamos un update en DataService)
          } 
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="receipt" size={24} color="#D4AF37" />
      </View>
      <View style={{flex: 1, paddingHorizontal: 15}}>
        <Text style={styles.store}>{item.store}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <View style={{alignItems: 'flex-end'}}>
        <Text style={styles.amount}>${item.total.toLocaleString('es-CL')}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Historial de Gastos</Text>
        <View style={{width: 40}} /> 
      </View>

      {/* RESUMEN */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL ACUMULADO</Text>
        <Text style={styles.summaryValue}>${total.toLocaleString('es-CL')}</Text>
      </View>

      {/* LISTA */}
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{padding: 20}}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="basket-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No hay gastos registrados aún.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Escanear' as never)} style={styles.btnEmpty}>
              <Text style={{fontWeight:'bold'}}>Escanear el primero</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', borderRadius: 20 },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  summaryCard: { margin: 20, marginTop: 0, padding: 25, backgroundColor: '#1C1C1E', borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  summaryLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  summaryValue: { color: '#D4AF37', fontSize: 36, fontWeight: 'bold' },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 15, borderRadius: 15, marginBottom: 10, borderBottomWidth: 1, borderColor: '#222' },
  iconBox: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center' },
  store: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  date: { color: '#666', fontSize: 12, marginTop: 2 },
  amount: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#666', marginTop: 10, marginBottom: 20 },
  btnEmpty: { backgroundColor: '#D4AF37', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }
});