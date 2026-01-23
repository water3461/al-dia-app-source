import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataService } from '../services/DataService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const DAYS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [offers, setOffers] = useState<any>({});
  
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    const o = await DataService.getOffers();
    setOffers(o);
  };

  const resetAll = async () => {
    Alert.alert("¿Reiniciar?", "Volverán las ofertas por defecto.", [
      { text: "Cancelar" },
      { text: "Sí, reiniciar", onPress: async () => {
        const def = await DataService.resetOffers();
        setOffers(def);
      }}
    ]);
  };

  const goToEditBank = (day: string) => {
    navigation.navigate('EditBanks' as never, { 
      dayId: day, 
      currentOffer: offers[day] 
    } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{width:24}} />
      </View>

      <ScrollView contentContainerStyle={{padding:20, paddingBottom:50}}>
        
        <Text style={styles.infoText}>
          🔒 <Text style={{fontWeight:'bold', color:'#D4AF37'}}>Modo Privado:</Text> Solo ingresa qué banco usas cada día para que la IA te ayude. No guardamos números de tarjeta ni datos personales.
        </Text>

        {/* SECCIÓN ÚNICA: CALENDARIO */}
        <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:20, marginBottom:10}}>
          <Text style={styles.sectionTitle}>📅 Mis Tarjetas por Día</Text>
          <TouchableOpacity onPress={resetAll}><Text style={{color:'#D4AF37'}}>Restaurar</Text></TouchableOpacity>
        </View>
        
        {DAYS.map(day => (
          <TouchableOpacity key={day} style={styles.offerRow} onPress={() => goToEditBank(day)}>
            <View style={[styles.dayBadge, {backgroundColor: offers[day]?.color || '#333'}]}>
              <Text style={{color:'#FFF', fontWeight:'bold'}}>{day}</Text>
            </View>
            <View style={{flex:1, marginLeft:10}}>
              <Text style={{color:'#FFF', fontWeight:'bold'}}>{offers[day]?.bank || 'Sin asignar'}</Text>
              <Text style={{color:'#888', fontSize:12}}>
                {offers[day]?.benefit || '---'} en {offers[day]?.store || '---'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  
  infoText: { color: '#888', backgroundColor: '#1C1C1E', padding: 15, borderRadius: 10, marginBottom: 20, lineHeight: 20 },
  
  sectionTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  
  offerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', padding: 15, borderRadius: 12, marginBottom: 10 },
  dayBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});