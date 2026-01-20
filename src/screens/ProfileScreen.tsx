import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { DataService, BankCard } from '../services/DataService';

export default function ProfileScreen({ navigation }: any) {
  const [myBanks, setMyBanks] = useState<BankCard[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    const allBanks = await DataService.getBanks();
    const hiddenIds = await DataService.getHiddenBanks();
    // Filtramos solo los bancos activos (no ocultos)
    const active = allBanks.filter(b => !hiddenIds.includes(b.id));
    setMyBanks(active);
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => console.log("Salir") }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* HEADER PERFIL */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={80} color="#D4AF37" />
          </View>
          <Text style={styles.userName}>Usuario Al Día</Text>
          <Text style={styles.userEmail}>usuario@aldia.cl</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PLAN GRATUITO</Text>
          </View>
        </View>

        {/* MIS BANCOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Bancos Activos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditBanks')}>
              <Text style={styles.editLink}>Editar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankList}>
            {myBanks.length > 0 ? (
              myBanks.map((bank) => (
                <View key={bank.id} style={[styles.bankCard, { backgroundColor: bank.primary_color }]}>
                  <Text style={styles.bankName}>{bank.name}</Text>
                  <Ionicons name="card-outline" size={24} color="rgba(255,255,255,0.5)" style={styles.cardIcon} />
                </View>
              ))
            ) : (
              <Text style={styles.noBanksText}>No tienes bancos configurados.</Text>
            )}
          </ScrollView>
        </View>

        {/* MENÚ DE OPCIONES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Cuenta</Text>
          
          {/* 👇 NUEVO BOTÓN: HISTORIAL */}
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('History')}>
            <View style={styles.rowIcon}><Ionicons name="receipt-outline" size={20} color="#D4AF37" /></View>
            <Text style={styles.rowText}>Historial de Gastos</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowIcon}><Ionicons name="notifications-outline" size={20} color="#D4AF37" /></View>
            <Text style={styles.rowText}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowIcon}><Ionicons name="lock-closed-outline" size={20} color="#D4AF37" /></View>
            <Text style={styles.rowText}>Privacidad y Seguridad</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowIcon}><Ionicons name="help-circle-outline" size={20} color="#D4AF37" /></View>
            <Text style={styles.rowText}>Ayuda y Soporte</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* CERRAR SESIÓN */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 1.0.0 (Build IA)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { alignItems: 'center', padding: 30, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  avatarContainer: { marginBottom: 10 },
  userName: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  userEmail: { color: '#888', fontSize: 14, marginBottom: 10 },
  badge: { backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderWidth: 1, borderColor: '#333' },
  badgeText: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold' },
  
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#666', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  editLink: { color: '#D4AF37', fontSize: 14 },
  
  bankList: { flexDirection: 'row' },
  bankCard: { width: 120, height: 70, borderRadius: 10, padding: 10, marginRight: 10, justifyContent: 'space-between' },
  bankName: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  cardIcon: { alignSelf: 'flex-end' },
  noBanksText: { color: '#444', fontStyle: 'italic' },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#111' },
  rowIcon: { width: 30 },
  rowText: { color: '#FFF', flex: 1, fontSize: 16 },
  
  logoutButton: { margin: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#330000', borderRadius: 10, backgroundColor: '#1A0000' },
  logoutText: { color: '#FF4444', fontWeight: 'bold' },
  version: { color: '#333', textAlign: 'center', marginBottom: 30, fontSize: 12 }
});