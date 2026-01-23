import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, 
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView 
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
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{color:'white', marginBottom:20}}>Necesito permiso de cámara</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btnGold}>
          <Text style={styles.btnTextBlack}>DAR PERMISO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.4, base64: true });
      
      console.log("Enviando a IA...");
      if (photo?.base64) {
        const result = await AIService.analyzeReceipt(photo.base64);
        
        if (result && result.total) {
          // Preparamos los datos para que sean editables (convertimos números a string)
          setScannedData({
            store: result.store || "Comercio desconocido",
            date: result.date || new Date().toLocaleDateString('es-CL'),
            total: result.total.toString(), // Lo guardamos como string para poder editarlo
            rawTotal: result.total // Guardamos el original por si acaso
          });
        } else {
          Alert.alert("No pude leerlo", "Intenta mejorar la luz o acercarte más.");
        }
      }
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Falló el análisis. Revisa tu conexión.");
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (scannedData) {
      // Validamos que el total sea un número real
      const finalTotal = parseInt(scannedData.total.replace(/[^0-9]/g, ''));
      
      if (isNaN(finalTotal) || finalTotal === 0) {
        Alert.alert("Error en el monto", "Por favor revisa que el total sea correcto.");
        return;
      }

      await DataService.saveReceipt({
        store: scannedData.store,
        total: finalTotal,
        date: scannedData.date,
        items: []
      });
      
      Alert.alert("¡Guardado!", "Gasto registrado correctamente.");
      navigation.goBack();
      setScannedData(null);
    }
  };

  // --- VISTA DE EDICIÓN (RESULTADOS) ---
  if (scannedData) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{flex:1}}
        >
          <ScrollView contentContainerStyle={styles.resultContainer}>
            
            <Ionicons name="create-outline" size={50} color="#D4AF37" style={{marginBottom:10}} />
            <Text style={styles.titleResult}>Verifica los Datos</Text>
            <Text style={styles.subTitle}>Puedes tocar los textos para corregirlos.</Text>

            <View style={styles.ticket}>
              
              {/* CAMPO: COMERCIO */}
              <Text style={styles.label}>Comercio:</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business" size={20} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={scannedData.store}
                  onChangeText={(text) => setScannedData({...scannedData, store: text})}
                  placeholderTextColor="#444"
                />
              </View>

              <View style={styles.divider} />

              {/* CAMPO: FECHA */}
              <Text style={styles.label}>Fecha:</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={scannedData.date}
                  onChangeText={(text) => setScannedData({...scannedData, date: text})}
                  placeholderTextColor="#444"
                />
              </View>

              <View style={styles.divider} />

              {/* CAMPO: TOTAL */}
              <Text style={styles.label}>Total a Pagar ($):</Text>
              <View style={[styles.inputWrapper, {borderColor: '#D4AF37'}]}>
                <Ionicons name="cash" size={20} color="#D4AF37" style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, styles.totalInput]} 
                  value={scannedData.total}
                  onChangeText={(text) => setScannedData({...scannedData, total: text})}
                  keyboardType="numeric" // Teclado numérico
                  placeholderTextColor="#444"
                />
              </View>

            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnGold} onPress={handleSave}>
                <Text style={styles.btnTextBlack}>GUARDAR ✓</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setScannedData(null)} style={styles.btnDiscard}>
                <Text style={styles.linkText}>Descartar y Repetir</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // --- VISTA DE CÁMARA ---
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
                <ActivityIndicator size="small" color="#000" />
                <Text style={{fontWeight:'bold', marginLeft:10}}>Leyendo boleta...</Text>
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
  loadingBox: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 25, flexDirection: 'row', alignItems: 'center' },
  
  // Estilos de Resultados
  resultContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  titleResult: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subTitle: { color: '#888', fontSize: 14, marginBottom: 20 },
  
  ticket: { backgroundColor: '#1C1C1E', padding: 20, borderRadius: 15, width: '100%', borderWidth: 1, borderColor: '#333' },
  label: { color: '#888', fontSize: 12, marginBottom: 5, marginLeft: 5 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 10, borderWidth: 1, borderColor: '#333', paddingHorizontal: 10, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 16, height: '100%' },
  totalInput: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  
  divider: { height: 15 }, // Espacio entre inputs
  
  actions: { width: '100%', alignItems: 'center', marginTop: 30 },
  btnGold: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 15 },
  btnTextBlack: { fontWeight: 'bold', fontSize: 16 },
  btnDiscard: { padding: 10 },
  linkText: { color: '#666' }
});