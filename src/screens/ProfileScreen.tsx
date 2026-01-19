import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ENCABEZADO DEL PERFIL */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color="#000" />
          </View>
          <Text style={styles.name}>Usuario AL DÍA</Text>
          <Text style={styles.email}>usuario@ejemplo.com</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PLAN GRATUITO</Text>
          </View>
        </View>

        {/* OPCIONES DE MENÚ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIGURACIÓN</Text>
          
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowIcon}><Ionicons name="card-outline" size={20} color="#D4AF37" /></View>
            <Text style={styles.rowText}>Mis Bancos y Tarjetas</Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOPORTE</Text>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowIcon}><Ionicons name="help-buoy-outline" size={20} color="#D4AF37" /></View>
            <Text style={styles.rowText}>Ayuda y Sugerencias</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingVertical: 30, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#FFF' },
  name: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  email: { color: '#888', fontSize: 14, marginBottom: 15 },
  badge: { backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  badgeText: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  
  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 16, marginBottom: 10, borderRadius: 12 },
  rowIcon: { width: 30, alignItems: 'center', marginRight: 10 },
  rowText: { flex: 1, color: '#FFF', fontSize: 16 },
  
  logoutButton: { marginTop: 40, marginHorizontal: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#330000', backgroundColor: '#1A0000', alignItems: 'center' },
  logoutText: { color: '#FF4444', fontWeight: 'bold' }
});