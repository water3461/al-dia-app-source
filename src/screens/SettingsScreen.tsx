import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataService } from '../services/DataService';
import { useNavigation } from '@react-navigation/native';

const DAYS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [offers, setOffers] = useState<any>({});
  const [userData, setUserData] = useState<any>({});
  
  // Estado para editar oferta
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [tempOffer, setTempOffer] = useState<any>({});

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const o = await DataService.getOffers();
    const u = await DataService.getUserData();
    setOffers(o);
    setUserData(u);
  };

  const saveUserData = async () => {
    await DataService.saveUserData(userData);
    Alert.alert("¡Listo!", "Tus datos personales se actualizaron.");
  };

  const openEditOffer = (day: string) => {
    setEditingDay(day);
    setTempOffer({ ...offers[day] });
  };

  const saveOffer = async () => {
    if (editingDay) {
      const newOffers = { ...offers, [editingDay]: tempOffer };
      setOffers(newOffers);
      await DataService.saveOffers(newOffers);
      setEditingDay(null);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{width:24}} />
      </View>

      <ScrollView contentContainerStyle={{padding:20, paddingBottom:50}}>
        
        {/* SECCIÓN 1: MIS DATOS */}
        <Text style={styles.sectionTitle}>👤 Mis Datos Bancarios</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Nombre Titular</Text>
          <TextInput style={styles.input} value={userData.name} onChangeText={t => setUserData({...userData, name: t})} />
          <Text style={styles.label}>Banco</Text>
          <TextInput style={styles.input} value={userData.bank} onChangeText={t => setUserData({...userData, bank: t})} />
          <Text style={styles.label}>N° Cuenta</Text>
          <TextInput style={styles.input} value={userData.account} onChangeText={t => setUserData({...userData, account: t})} />
          <Text style={styles.label}>RUT</Text>
          <TextInput style={styles.input} value={userData.rut} onChangeText={t => setUserData({...userData, rut: t})} />
          <TouchableOpacity style={styles.saveBtn} onPress={saveUserData}>
            <Text style={styles.btnText}>Guardar Datos</Text>
          </TouchableOpacity>
        </View>

        {/* SECCIÓN 2: CALENDARIO */}
        <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:30, marginBottom:10}}>
          <Text style={styles.sectionTitle}>📅 Personalizar Ofertas</Text>
          <TouchableOpacity onPress={resetAll}><Text style={{color:'#D4AF37'}}>Restaurar</Text></TouchableOpacity>
        </View>
        
        {DAYS.map(day => (
          <TouchableOpacity key={day} style={styles.offerRow} onPress={() => openEditOffer(day)}>
            <View style={[styles.dayBadge, {backgroundColor: offers[day]?.color || '#333'}]}>
              <Text style={{color:'#FFF', fontWeight:'bold'}}>{day}</Text>
            </View>
            <View style={{flex:1, marginLeft:10}}>
              <Text style={{color:'#FFF', fontWeight:'bold'}}>{offers[day]?.bank}</Text>
              <Text style={{color:'#888', fontSize:12}}>{offers[day]?.benefit} en {offers[day]?.store}</Text>
            </View>
            <Ionicons name="pencil" size={20} color="#666" />
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* MODAL EDITAR OFERTA */}
      <Modal visible={!!editingDay} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar {offers[editingDay || '']?.dayFull}</Text>
            
            <Text style={styles.label}>Banco / Tarjeta</Text>
            <TextInput style={styles.inputModal} value={tempOffer.bank} onChangeText={t => setTempOffer({...tempOffer, bank: t})} />
            
            <Text style={styles.label}>Beneficio (ej: 40% OFF)</Text>
            <TextInput style={styles.inputModal} value={tempOffer.benefit} onChangeText={t => setTempOffer({...tempOffer, benefit: t})} />
            
            <Text style={styles.label}>Tienda (ej: Sushi)</Text>
            <TextInput style={styles.inputModal} value={tempOffer.store} onChangeText={t => setTempOffer({...tempOffer, store: t})} />

            <View style={{flexDirection:'row', gap:10, marginTop:20}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor:'#333'}]} onPress={() => setEditingDay(null)}>
                <Text style={{color:'#FFF'}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor:'#D4AF37'}]} onPress={saveOffer}>
                <Text style={{color:'#000', fontWeight:'bold'}}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: '#1C1C1E', padding: 20, borderRadius: 15 },
  label: { color: '#888', fontSize: 12, marginBottom: 5 },
  input: { backgroundColor: '#000', color: '#FFF', padding: 10, borderRadius: 8, marginBottom: 15, borderWidth:1, borderColor:'#333' },
  saveBtn: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { fontWeight: 'bold' },
  
  offerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', padding: 15, borderRadius: 12, marginBottom: 10 },
  dayBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#1C1C1E', padding: 20, borderRadius: 20, borderWidth:1, borderColor:'#333' },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign:'center' },
  inputModal: { backgroundColor: '#000', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth:1, borderColor:'#333' },
  modalBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' }
});