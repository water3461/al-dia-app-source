import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DataService } from '../services/DataService';
import QRCode from 'react-native-qrcode-svg'; // Si no tienes esta librería, usaremos un icono gigante por ahora.

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState<any>({});
  const [showQR, setShowQR] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    const user = await DataService.getUserData();
    setUserData(user);
  };

  // FUNCION PARA COMPARTIR POR WHATSAPP/OTROS
  const shareData = async () => {
    try {
      const message = `Hola, aquí están mis datos para transferir:\n\n👤 ${userData.name}\n🏦 ${userData.bank}\n🔢 ${userData.account}\n🆔 ${userData.rut}\n📧 ${userData.email}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert("Error", "No se pudo compartir.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* HEADER CON ENGRANAJE (MOVIDO DESDE HOME) */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <TouchableOpacity 
            style={styles.settingsBtn} 
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Ionicons name="settings-sharp" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* TARJETA DE DATOS (ESTILO VISUAL) */}
        <View style={styles.cardContainer}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#000" />
            </View>
            <View>
              <Text style={styles.name}>{userData.name || "Usuario Al Día"}</Text>
              <Text style={styles.rut}>{userData.rut || "11.111.111-1"}</Text>
            </View>
          </View>
          
          <View style={styles.bankInfo}>
            <Text style={styles.bankLabel}>Banco:</Text>
            <Text style={styles.bankValue}>{userData.bank || "---"}</Text>
            <Text style={styles.bankLabel}>Cuenta:</Text>
            <Text style={styles.bankValue}>{userData.account || "---"}</Text>
          </View>

          {/* BOTONES DE COMPARTIR */}
          <View style={styles.shareRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={shareData}>
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={styles.shareText}>Compartir Datos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.shareBtn, {backgroundColor:'#333'}]} onPress={() => setShowQR(true)}>
              <Ionicons name="qr-code" size={20} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        </View>

        {/* MODAL QR (SIMULADO VISUALMENTE SI NO HAY LIBRERÍA) */}
        <Modal visible={showQR} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.qrCard}>
              <Text style={styles.qrTitle}>Escanea para transferir</Text>
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={150} color="#000" />
              </View>
              <TouchableOpacity onPress={() => setShowQR(false)} style={styles.closeBtn}>
                <Text style={{fontWeight:'bold'}}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  settingsBtn: { backgroundColor: '#D4AF37', width: 45, height: 45, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  
  cardContainer: { backgroundColor: '#1C1C1E', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#333' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  name: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  rut: { color: '#888' },
  
  bankInfo: { backgroundColor: '#000', padding: 15, borderRadius: 10, marginBottom: 20 },
  bankLabel: { color: '#666', fontSize: 12 },
  bankValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },

  shareRow: { flexDirection: 'row', gap: 10 },
  shareBtn: { flex: 1, backgroundColor: '#25D366', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  shareText: { color: '#FFF', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  qrCard: { backgroundColor: '#FFF', padding: 30, borderRadius: 20, alignItems: 'center' },
  qrTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  qrPlaceholder: { marginBottom: 20 },
  closeBtn: { padding: 10 },
});