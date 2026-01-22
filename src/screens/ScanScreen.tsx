import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DataService } from '../services/DataService';
import { AIService } from '../services/AIService'; // 👈 IMPORTAMOS LA IA

export default function ScanScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{color:'white'}}>Necesito permiso de cámara</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btnGold}><Text>DAR PERMISO</Text></TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsProcessing(true);
      
      // 1. Tomamos la foto en base64 (formato que entiende la IA)
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.4, // Calidad media para que sea rápido
        base64: true 
      });
      
      console.log("Enviando a la IA...");

      // 2. Enviamos a la IA REAL
      if (photo?.base64) {
        const result = await AIService.analyzeReceipt(photo.base64);
        
        if (result && result.total) {
          setScannedData(result); // ¡DATOS REALES!
        } else {
          Alert.alert("Ups", "No pude leer la boleta. Intenta acercarte más o mejorar la luz.");
        }
      }
      setIsProcessing(false);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Falló el análisis.");
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (scannedData) {
      await DataService.saveReceipt({
        store: scannedData.store,
        total: Number(scannedData.total),
        date: scannedData.date,
        items: []
      });
      Alert.alert("¡Guardado!", "Gasto real registrado.");
      navigation.goBack();
    }
  };

  // VISTA DE RESULTADOS
  if (scannedData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Ionicons name="sparkles" size={60} color="#D4AF37" />
          <Text style={styles.titleResult}>IA: Boleta Leída</Text>
          <View style={styles.ticket}>
            <Text style={styles.label}>Comercio Detectado:</Text>
            <Text style={styles.value}>{scannedData.store}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{scannedData.date}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Monto Total:</Text>
            <Text style={styles.totalValue}>${scannedData.total.toLocaleString('es-CL')}</Text>
          </View>
          <TouchableOpacity style={styles.btnGold} onPress={handleSave}>
            <Text style={styles.btnTextBlack}>GUARDAR (REAL)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScannedData(null)} style={{marginTop:20}}>
            <Text style={{color:'#888'}}>Descartar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // VISTA DE CÁMARA
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <SafeAreaView style={styles.overlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.bottomBar}>
            {isProcessing ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{fontWeight:'bold'}}>La IA está pensando...</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={takePicture} style={styles.shutterBtn}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
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
  loadingBox: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 20, flexDirection: 'row', gap: 10, alignItems: 'center' },
  btnGold: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 30, width: 200, alignItems: 'center', marginTop: 20 },
  btnTextBlack: { fontWeight: 'bold' },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  titleResult: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginVertical: 20 },
  ticket: { backgroundColor: '#1C1C1E', padding: 25, borderRadius: 15, width: '100%', marginBottom: 30 },
  label: { color: '#888', fontSize: 12, marginTop: 10 },
  value: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  totalValue: { color: '#D4AF37', fontSize: 36, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 10 }
});