import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DataService } from '../services/DataService';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleReset = async () => {
    Alert.alert("¿Reiniciar App?", "Se borrarán tus preferencias y volverás al inicio.", [
      { text: "Cancelar" },
      { text: "Sí, Borrar", style: "destructive", onPress: async () => {
          await DataService.resetAll();
          Alert.alert("Listo", "Cierra y abre la app para ver los cambios.");
      }}
    ]);
  };

  const handleHelp = () => {
    Alert.alert("Soporte AL DÍA", "Contacto: soporte@aldia.cl\nHorario: 9:00 - 18:00");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>GENERAL</Text>
        <View style={styles.row}>
          <Text style={styles.rowText}>Notificaciones</Text>
          <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ false: "#333", true: "#D4AF37" }} />
        </View>

        <Text style={styles.sectionTitle}>AYUDA</Text>
        <TouchableOpacity style={styles.rowArrow} onPress={handleHelp}>
          <Text style={styles.rowText}>Contactar Soporte</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rowArrow} onPress={() => Alert.alert("Privacidad", "Tus datos son privados y se guardan solo en tu dispositivo.")}>
          <Text style={styles.rowText}>Políticas de Privacidad</Text>
          <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleReset}>
          <Text style={styles.logoutText}>Reiniciar App de Fábrica</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>Versión 1.1.0 - Chile</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 20 },
  sectionTitle: { color: '#666', fontSize: 12, marginTop: 20, marginBottom: 10, letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#1C1C1E' },
  rowArrow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#1C1C1E' },
  rowText: { color: '#FFF', fontSize: 16 },
  logoutBtn: { marginTop: 40, padding: 15, alignItems: 'center', backgroundColor: '#330000', borderRadius: 10, borderWidth: 1, borderColor: '#FF0000' },
  logoutText: { color: '#FF4444', fontWeight: 'bold' },
  version: { color: '#444', textAlign: 'center', marginTop: 30 }
});