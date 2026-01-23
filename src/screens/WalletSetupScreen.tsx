import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DataService } from '../services/DataService';

const ALL_BANKS = [
  { name: 'Banco de Chile', color: '#002C5F' },
  { name: 'Banco Santander', color: '#EC0000' },
  { name: 'Banco Falabella', color: '#137E30' },
  { name: 'BCI', color: '#002E6D' },
  { name: 'Scotiabank', color: '#EC111A' },
  { name: 'Banco Estado', color: '#E56E00' },
  { name: 'Itaú', color: '#EC7000' },
  { name: 'Tenpo', color: '#0099FF' },
  { name: 'Mach', color: '#540099' },
  { name: 'Mercado Pago', color: '#009EE3' },
  { name: 'Copec Pay', color: '#E84E1B' },
];

export default function WalletSetupScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleBank = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter(b => b !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      Alert.alert("Ojo 👀", "Selecciona al menos una tarjeta.");
      return;
    }
    
    await DataService.saveMyWallet(selected);
    await DataService.setOnboardingComplete();
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' as never }],
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selected.includes(item.name);
    return (
      <TouchableOpacity 
        style={[styles.card, isSelected && {borderColor: '#D4AF37', backgroundColor: '#222'}]} 
        onPress={() => toggleBank(item.name)}
      >
        <View style={[styles.colorDot, {backgroundColor: item.color}]} />
        <Text style={[styles.name, isSelected && {color: '#D4AF37'}]}>{item.name}</Text>
        <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={24} color={isSelected ? "#D4AF37" : "#666"} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>¿Qué usas?</Text>
        <Text style={styles.subtitle}>Elige tus bancos para armar la agenda.</Text>
      </View>
      <FlatList data={ALL_BANKS} renderItem={renderItem} keyExtractor={item => item.name} contentContainerStyle={{ padding: 20 }} />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleContinue}>
          <Text style={styles.btnText}>LISTO 🚀</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, paddingTop: 40 },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#888', fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  name: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1 },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#222' },
  btn: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { fontWeight: 'bold', fontSize: 16 }
});