import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DataService } from '../services/DataService';

// LISTA PREDEFINIDA DE BANCOS/TARJETAS CHILENAS 🇨🇱
const CHILEAN_BANKS = [
  { id: 'bch', name: 'Banco de Chile', color: '#002C5F', icon: 'card' },
  { id: 'santander', name: 'Banco Santander', color: '#EC0000', icon: 'card' },
  { id: 'falabella', name: 'Banco Falabella', color: '#137E30', icon: 'cart' },
  { id: 'cmr', name: 'CMR Falabella', color: '#3A8D28', icon: 'cart' },
  { id: 'bci', name: 'BCI / Lider BCI', color: '#002E6D', icon: 'card' },
  { id: 'scotia', name: 'Scotiabank', color: '#EC111A', icon: 'card' },
  { id: 'estado', name: 'Banco Estado', color: '#E56E00', icon: 'wallet' },
  { id: 'itau', name: 'Itaú', color: '#EC7000', icon: 'card' },
  { id: 'tenpo', name: 'Tenpo', color: '#0099FF', icon: 'phone-portrait' },
  { id: 'mach', name: 'Mach', color: '#540099', icon: 'phone-portrait' },
  { id: 'mercadopago', name: 'Mercado Pago', color: '#009EE3', icon: 'qr-code' },
  { id: 'copec', name: 'Copec Pay', color: '#E84E1B', icon: 'car' },
  { id: 'check', name: 'Chek (Ripley)', color: '#7D2E8C', icon: 'phone-portrait' },
  { id: 'ripley', name: 'Banco Ripley', color: '#7D2E8C', icon: 'card' },
  { id: 'consur', name: 'Cencosud Scotiabank', color: '#006DB1', icon: 'cart' },
];

export default function EditBanksScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { dayId, currentOffer } = route.params || {};

  const handleSelectBank = async (bank: any) => {
    // 1. Obtener todas las ofertas actuales
    const offers = await DataService.getOffers();
    
    // 2. Actualizar solo el día seleccionado
    const newOffer = {
      ...offers[dayId], // Mantiene el día ("Lunes")
      bank: bank.name,
      color: bank.color,
      icon: bank.icon,
      // Mantenemos el beneficio y tienda antiguos, o ponemos uno genérico si quieres
      benefit: offers[dayId]?.benefit || "Tu Beneficio",
      store: offers[dayId]?.store || "Comercio"
    };

    // 3. Guardar
    const updatedOffers = { ...offers, [dayId]: newOffer };
    await DataService.saveOffers(updatedOffers);

    // 4. Volver atrás
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.bankItem} onPress={() => handleSelectBank(item)}>
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={20} color="#FFF" />
      </View>
      <Text style={styles.bankName}>{item.name}</Text>
      {currentOffer?.bank === item.name && (
        <Ionicons name="checkmark-circle" size={24} color="#D4AF37" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Selecciona Banco</Text>
        <View style={{width:40}} />
      </View>

      <Text style={styles.subtitle}>Elige la tarjeta para el {currentOffer?.dayFull}</Text>

      <FlatList
        data={CHILEAN_BANKS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        initialNumToRender={15} // Optimización para que no se pegue
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth:1, borderColor:'#222' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', justifyContent:'center', alignItems:'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#888', textAlign: 'center', marginVertical: 15, fontSize: 14 },
  
  bankItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', padding: 15, borderRadius: 15, marginBottom: 10, borderWidth:1, borderColor:'#333' },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  bankName: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1 },
});