import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, 
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView, Vibration, Modal 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DataService } from '../services/DataService';
import { AIService } from '../services/AIService';

export default function ScanScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false); // <--- Estado para la dopamina
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{color:'white', marginBottom:20}}>Necesito permiso de cámara</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btnGold}><Text style={styles.btnTextBlack}>DAR PERMISO</Text></TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.4, base64: true });
      if (photo?.base64) {
        const result = await AIService.analyzeReceipt(photo.base64);
        if (result && result.total) {
          setScannedData({
            store: result.store || "Comercio desconocido",
            date: result.date || new Date().toLocaleDateString('es-CL'),
            total: result.total.toString(),
            rawTotal: result.total
          });
        } else {
          Alert.alert("Ups", "No pude leerlo. Intenta mejorar la luz.");
        }
      }
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (scannedData) {
      const finalTotal = parseInt(scannedData.total.replace(/[^0-9]/g, ''));
      if (isNaN(finalTotal) || finalTotal === 0) return;

      await DataService.saveReceipt({
        store: scannedData.store,
        total: finalTotal,
        date: scannedData.date,
        items: []
      });
      
      // --- AQUÍ EMPIEZA LA FIESTA DE LA DOPAMINA ---
      Vibration.vibrate([0, 100, 50, 100]); // Vibración tipo "Ta-Da!"
      setShowSuccess(true); // Mostramos pantalla de éxito
      
      // Cerramos todo automático después de 2 segundos
      setTimeout(() => {
        setShowSuccess(false);
        setScannedData(null);
        navigation.goBack();
      }, 2000);
    }
  };

  // --- VISTA DE CÁMARA ---
  return (
    <View style={styles.container}>
      
      {/* MODAL DE ÉXITO (DOPAMINA PURA) */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <Ionicons name="checkmark-circle" size={120} color="#4CD964" />
          <Text style={styles.successTitle}>¡GUARDADO!</Text>
          <Text style={styles.successSub}>Sumando puntos a tu control financiero 📈</Text>
        </View>
      </Modal>

      {!scannedData ? (
        <CameraView style={styles.camera} facing="back" ref={cameraRef}>
          <SafeAreaView style={styles.overlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <View style={styles.bottomBar}>
              {isProcessing ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color="#000" />
                  <Text style={{fontWeight:'bold', marginLeft:10}}>IA Analizando...</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={takePicture} style={styles.shutterBtn}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </CameraView>
      ) : (
        // VISTA DE EDICIÓN
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
            <ScrollView contentContainerStyle={styles.resultContainer}>
              <Ionicons name="scan-circle" size={60} color="#D4AF37" style={{marginBottom:10}} />
              <Text style={styles.titleResult}>Confirma el Gasto</Text>
              
              <View style={styles.ticket}>
                <Text style={styles.label}>Comercio:</Text>
                <TextInput style={styles.input} value={scannedData.store} onChangeText={(t) => setScannedData({...scannedData, store: t})} />
                <View style={styles.divider} />
                <Text style={styles.label}>Total ($):</Text>
                <TextInput style={[styles.input, styles.totalInput]} value={scannedData.total} onChangeText={(t) => setScannedData({...scannedData, total: t})} keyboardType="numeric" />
              </View>

              <TouchableOpacity style={styles.btnGold} onPress={handleSave}>
                <Text style={styles.btnTextBlack}>¡CONFIRMAR! 🚀</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScannedData(null)} style={{marginTop:20}}><Text style={{color:'#666'}}>Cancelar</Text></TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { justifyContent: 'center', alignItems: 'center', flex:1 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  closeBtn: { alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  bottomBar: { alignItems: 'center', marginBottom: 40 },
  shutterBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF' },
  loadingBox: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 25, flexDirection: 'row', alignItems: 'center' },
  
  resultContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  titleResult: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  ticket: { backgroundColor: '#1C1C1E', padding: 20, borderRadius: 15, width: '100%', borderWidth: 1, borderColor: '#333', marginBottom: 30 },
  label: { color: '#888', fontSize: 12, marginBottom: 5 },
  input: { color: '#FFF', fontSize: 18, borderBottomWidth: 1, borderColor: '#333', paddingVertical: 10 },
  totalInput: { color: '#D4AF37', fontSize: 28, fontWeight: 'bold' },
  divider: { height: 20 },
  btnGold: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 30, width: '100%', alignItems: 'center', shadowColor: "#D4AF37", shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  btnTextBlack: { fontWeight: 'bold', fontSize: 18 },

  // ESTILOS DE ÉXITO
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  successTitle: { color: '#4CD964', fontSize: 32, fontWeight: 'bold', marginTop: 20 },
  successSub: { color: '#FFF', marginTop: 10, fontSize: 16 }
});