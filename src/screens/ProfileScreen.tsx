import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* HEADER DE PERFIL */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
             <Ionicons name="person" size={50} color="#000" />
          </View>
          <Text style={styles.name}>Usuario Al Día</Text>
          <Text style={styles.email}>usuario@aldia.cl</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PLAN FREE</Text>
          </View>
        </View>

        {/* SECCIÓN: GESTIÓN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MI CUENTA</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Onboarding')} // Truco rápido para editar bancos
          >
            <View style={styles.iconBox}>
              <Ionicons name="card" size={22} color="#D4AF37" />
            </View>
            <Text style={styles.menuText}>Mis Bancos y Tarjetas</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History')}>
            <View style={styles.iconBox}>
              <Ionicons name="receipt" size={22} color="#D4AF37" />
            </View>
            <Text style={styles.menuText}>Historial de Gastos</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* SECCIÓN: APP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APLICACIÓN</Text>

          {/* 👇 ESTE BOTÓN LLEVA A LA PANTALLA DE CONFIGURACIÓN REAL */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.iconBox}>
              <Ionicons name="settings" size={22} color="#FFF" />
            </View>
            <Text style={styles.menuText}>Configuración</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconBox}>
              <Ionicons name="help-circle" size={22} color="#FFF" />
            </View>
            <Text style={styles.menuText}>Ayuda y Soporte</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>AL DÍA v1.0.2</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  header: { alignItems: 'center', padding: 30, borderBottomWidth: 1, borderBottomColor: '#1C1C1E' },
  avatarContainer: { 
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#D4AF37', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    borderWidth: 3, borderColor: '#222'
  },
  name: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  email: { color: '#888', fontSize: 14, marginBottom: 10 },
  badge: { backgroundColor: '#1C1C1E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  badgeText: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold' },

  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: { color: '#666', fontSize: 12, marginBottom: 10, letterSpacing: 1, fontWeight: 'bold' },
  
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', 
    padding: 15, marginBottom: 10, borderRadius: 15,
    borderWidth: 1, borderColor: '#222'
  },
  iconBox: { width: 35, alignItems: 'center' },
  menuText: { color: '#FFF', fontSize: 16, flex: 1 },

  footer: { alignItems: 'center', marginTop: 30 },
  footerText: { color: '#444', fontSize: 12 }
});