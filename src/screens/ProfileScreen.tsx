import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function ProfileScreen() {

  const handlePress = (option: string) => {
    Alert.alert("Próximamente", `Configuración de ${option} estará lista en la v2.0`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MI PERFIL</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* TARJETA DE USUARIO */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>YO</Text>
          </View>
          <View>
            <Text style={styles.userName}>Usuario Pro</Text>
            <Text style={styles.userLevel}>Nivel: Ahorrador Experto</Text>
          </View>
        </View>

        {/* SECCIÓN 1: MIS BANCOS */}
        <Text style={styles.sectionTitle}>MIS BANCOS ACTIVOS</Text>
        <View style={styles.optionsContainer}>
          <View style={styles.optionRow}>
            <Text style={styles.optionIcon}>🔵</Text>
            <Text style={styles.optionText}>Banco de Chile</Text>
            <Text style={styles.check}>✓</Text>
          </View>
          <View style={[styles.optionRow, styles.separator]}>
            <Text style={styles.optionIcon}>🔴</Text>
            <Text style={styles.optionText}>Santander</Text>
            <Text style={styles.check}>✓</Text>
          </View>
          <View style={[styles.optionRow, styles.separator]}>
            <Text style={styles.optionIcon}>🟢</Text>
            <Text style={styles.optionText}>Falabella CMR</Text>
            <Text style={styles.check}>✓</Text>
          </View>
        </View>

        {/* SECCIÓN 2: CONFIGURACIÓN */}
        <Text style={styles.sectionTitle}>PREFERENCIAS</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionRow} onPress={() => handlePress("Notificaciones")}>
            <Text style={styles.optionIcon}>🔔</Text>
            <Text style={styles.optionText}>Notificaciones</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.optionRow, styles.separator]} onPress={() => handlePress("Modo Oscuro")}>
            <Text style={styles.optionIcon}>🌙</Text>
            <Text style={styles.optionText}>Modo Oscuro</Text>
            <Text style={[styles.arrow, {color: '#D4AF37'}]}>Activado</Text>
          </TouchableOpacity>
        </View>

        {/* VERSIÓN */}
        <Text style={styles.versionText}>AL DÍA v1.0.0 - Build 2026</Text>
        <Text style={styles.footerText}>Made with ☕ in Chile</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#222' },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center' },
  scroll: { padding: 20 },

  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#D4AF37'
  },
  avatarText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 18 },
  userName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  userLevel: { color: '#888', fontSize: 14, marginTop: 4 },

  // Sections
  sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 10, marginLeft: 10, letterSpacing: 1 },
  optionsContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    marginBottom: 30,
    overflow: 'hidden'
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E'
  },
  optionIcon: { fontSize: 20, marginRight: 15, width: 30, textAlign: 'center' },
  optionText: { color: '#FFF', fontSize: 16, flex: 1 },
  check: { color: '#D4AF37', fontWeight: 'bold', fontSize: 18 },
  arrow: { color: '#666', fontSize: 20, fontWeight: 'bold' },

  // Footer
  versionText: { color: '#444', textAlign: 'center', marginTop: 10, fontSize: 12 },
  footerText: { color: '#333', textAlign: 'center', marginTop: 5, fontSize: 12 },
});