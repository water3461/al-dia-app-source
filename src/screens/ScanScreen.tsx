import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, 
  TextInput, KeyboardAvoidingView, Platform, ScrollView, Vibration, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
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
  const [showSuccess, setShowSuccess] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View style={styles.container} />;
  
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        {/* CORRECCIÓN AQUÍ: Usamos 'videocam-off' en vez de 'camera-off' */}
        <Ionicons name="videocam-off" size={50} color="#666" style={{marginBottom:20}} />
        <Text style={{color:'white', marginBottom:20, fontSize:16}}>Necesito permiso para ver las boletas</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btnGold}>
          <Text style={styles.btnTextBlack}>DAR PERMISO</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
            store: result.store || "Comercio",
            date: result.date || new Date().toLocaleDateString('es-CL'),
            total: result.total.toString(),
          });
        } else {
          Alert.alert("Ups", "No pude leer el total. Intenta acercarte más. 🧐");
        }
      }
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert("Error", "Algo falló al tomar la foto.");
    }
  };

  const handleSave = async () => {
    if (scannedData) {
      const cleanTotal = scannedData.total.toString().replace(/[^0-9]/g, '');
      const finalTotal = parseInt(cleanTotal);

      if (isNaN(finalTotal) || finalTotal === 0) {
        Alert.alert("Error", "El total no es válido.");
        return;
      }

      await DataService.saveReceipt({
        id: Date.now().toString(),
        store: scannedData.store,
        total: finalTotal,
        date: scannedData.date,
      });
      
      Vibration.vibrate([0, 50, 50, 50]); 
      setShowSuccess(true); 
      
      setTimeout(() => {
        setShowSuccess(false);
        setScannedData(null);
        navigation.goBack(); 
      }, 1800);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* MODAL DE ÉXITO */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={80} color="#4CD964" />
            <Text style={styles.successTitle}>¡GUARDADO!</Text>
            <Text style={styles.successSub}>Sumando puntos... 📈</Text>
          </View>
        </View>
      </Modal>

      {!scannedData ? (
        <CameraView style={styles.camera} facing="back" ref={cameraRef}>
          <SafeAreaView style={styles.overlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            
            <View style={styles.focusFrame} />

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
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
            <ScrollView contentContainerStyle={styles.resultContainer}>
              <Text style={styles.titleResult}>Confirma el Gasto</Text>
              
              <View style={styles.ticket}>
                <View style={{alignItems:'center', marginBottom:20}}>
                  <Ionicons name="receipt" size={40} color="#D4AF37" />
                </View>

                <Text style={styles.label}>COMERCIO</Text>
                <TextInput 
                  style={styles.input} 
                  value={scannedData.store} 
                  onChangeText={(t) => setScannedData({...scannedData, store: t})} 
                />
                
                <View style={styles.divider} />
                
                <Text style={styles.label}>TOTAL ($)</Text>
                <TextInput 
                  style={[styles.input, styles.totalInput]} 
                  value={scannedData.total} 
                  onChangeText={(t) => setScannedData({...scannedData, total: t})} 
                  keyboardType="numeric" 
                />
              </View>

              <View style={{flexDirection:'row', gap:15, width:'100%'}}>
                <TouchableOpacity onPress={() => setScannedData(null)} style={styles.btnCancel}>
                  <Text style={{color:'#FFF', fontWeight:'bold'}}>Reintentar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.btnGold} onPress={handleSave}>
                  <Text style={styles.btnTextBlack}>CONFIRMAR ✅</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  closeBtn: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
  focusFrame: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', marginVertical: 40, borderRadius: 20, borderStyle: 'dashed' },
  bottomBar: { alignItems: 'center', marginBottom: 20 },
  shutterBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 5, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF' },
  loadingBox: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 30, flexDirection: 'row', alignItems: 'center' },
  resultContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  titleResult: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  ticket: { backgroundColor: '#1C1C1E', padding: 30, borderRadius: 20, width: '100%', borderWidth: 1, borderColor: '#333', marginBottom: 30 },
  label: { color: '#666', fontSize: 10, marginBottom: 5, fontWeight:'bold', letterSpacing:1 },
  input: { color: '#FFF', fontSize: 18, borderBottomWidth: 1, borderColor: '#333', paddingVertical: 10, marginBottom: 20 },
  totalInput: { color: '#D4AF37', fontSize: 32, fontWeight: 'bold', textAlign:'center', borderBottomWidth:0 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 10 },
  btnGold: { flex: 1, backgroundColor: '#D4AF37', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnCancel: { flex: 1, backgroundColor: '#333', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnTextBlack: { fontWeight: 'bold', fontSize: 16 },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  successCard: { backgroundColor: '#1C1C1E', padding: 40, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  successTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 20 },
  successSub: { color: '#888', marginTop: 10 }
});