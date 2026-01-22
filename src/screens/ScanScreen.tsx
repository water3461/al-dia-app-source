import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
// 👇 USAMOS LO NUEVO: CameraView
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DataService } from '../services/DataService';

export default function ScanScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      
      console.log("Foto tomada. Procesando...");
      
      // SIMULACIÓN DE LECTURA (Aquí conectaríamos ML Kit Real)
      // Por ahora simulamos una lectura exitosa para probar el flujo
      setTimeout(() => {
        setScannedData({
            total: "24.990",
            date: new Date().toLocaleDateString(),
            store: "Lider (Lectura Simulada)",
            raw: "Simulación activa."
        });
        setIsProcessing(false);
      }, 1500);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No pudimos procesar la imagen.");
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (scannedData) {
      await DataService.saveReceipt({
        store: scannedData.store,
        total: parseInt(scannedData.total.replace(/\./g, '')),
        date: scannedData.date,
        items: []
      });
      Alert.alert("Guardado", "Gasto registrado correctamente.");
      navigation.goBack();
    }
  };

  if (!permission || !permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{color:'white'}}>Necesitamos permiso de cámara</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btnGold}><Text>DAR PERMISO</Text></TouchableOpacity>
      </View>
    );
  }

  if (scannedData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Ionicons name="receipt" size={60} color="#D4AF37" />
          <Text style={styles.titleResult}>Datos Detectados</Text>
          <View style={styles.ticket}>
            <Text style={styles.label}>Comercio:</Text>
            <Text style={styles.value}>{scannedData.store}</Text>
            <Text style={styles.label}>Total:</Text>
            <Text style={styles.totalValue}>${scannedData.total}</Text>
          </View>
          <TouchableOpacity style={styles.btnGold} onPress={handleSave}>
            <Text style={styles.btnTextBlack}>GUARDAR</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScannedData(null)} style={{marginTop:20}}>
            <Text style={{color:'#888'}}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <SafeAreaView style={styles.overlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.bottomBar}>
            {isProcessing ? <ActivityIndicator size="large" color="#D4AF37" /> : (
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
  center: { justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  closeBtn: { alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  bottomBar: { alignItems: 'center', marginBottom: 40 },
  shutterBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF' },
  btnGold: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 30, width: 200, alignItems: 'center', marginTop: 20 },
  btnTextBlack: { fontWeight: 'bold' },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  titleResult: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginVertical: 20 },
  ticket: { backgroundColor: '#1C1C1E', padding: 20, borderRadius: 15, width: '100%', marginBottom: 20 },
  label: { color: '#888', fontSize: 12 },
  value: { color: '#FFF', fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  totalValue: { color: '#D4AF37', fontSize: 32, fontWeight: 'bold' }
});