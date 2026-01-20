import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { OCRService } from '../services/ocr';
import { DataService } from '../services/DataService';

export default function ScanScreen({ navigation }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 1. ABRIR CÁMARA
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permiso Denegado", "Necesitas dar acceso a la cámara para escanear boletas.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 2. BORRAR IMAGEN
  const clearImage = () => {
    setImage(null);
  };

  // 3. PROCESAR CON IA Y GUARDAR
  const handleAnalyze = async () => {
    if (!image) return;

    setUploading(true);

    try {
      console.log("🧠 Iniciando escaneo con IA...");

      // Agregamos el signo ! para asegurar que image no es null
      const data = await OCRService.analyzeReceiptFromImage(image!);

      setUploading(false);

      Alert.alert(
        "¡Lectura Exitosa! 🤖",
        `📅 Fecha: ${data.date || 'Hoy'}\n🏪 Comercio: ${data.commerce || 'Desconocido'}\n💰 Total: $${data.total || 0}`,
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "GUARDAR GASTO", 
            onPress: async () => {
              // AQUÍ ESTABA EL ERROR: Agregamos valores por defecto (||) para evitar nulls
              await DataService.addReceipt({
                commerce: data.commerce || "Comercio Desconocido", 
                date: data.date || new Date().toLocaleDateString(),
                total: data.total || 0
              });
              
              Alert.alert("✅ Guardado", "Tu gasto ya está en el historial.", [
                { text: "Ver Historial", onPress: () => navigation.navigate('History') },
                { text: "OK", onPress: () => clearImage() }
              ]);
            } 
          }
        ]
      );

    } catch (error) {
      setUploading(false);
      console.error(error);
      Alert.alert("Error", "No pudimos leer el texto. Intenta mejorar la iluminación.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ESCANER IA 🧠</Text>
        <Text style={styles.subtitle}>Lectura inteligente y privada</Text>
      </View>

      <View style={styles.content}>
        {image ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.retryButton} onPress={clearImage}>
                <Ionicons name="trash-outline" size={24} color="#FF4444" />
                <Text style={styles.retryText}>Borrar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.processButton} 
                onPress={handleAnalyze}
                disabled={uploading}
              >
                <Ionicons name="scan-circle" size={24} color="#000" />
                <Text style={styles.processText}>ANALIZAR FOTO</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={60} color="#333" />
            </View>
            <Text style={styles.emptyTitle}>Escanea tu Boleta</Text>
            <Text style={styles.emptyDesc}>La IA buscará automáticamente el Total, la Fecha y el Comercio.</Text>
            
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Ionicons name="camera" size={30} color="#000" />
              <Text style={styles.cameraButtonText}>ABRIR CÁMARA</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>La IA está leyendo...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  title: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },
  subtitle: { color: '#666', textAlign: 'center', fontSize: 12, marginTop: 5 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyState: { alignItems: 'center', width: '100%' },
  iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  emptyDesc: { color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
  cameraButton: { flexDirection: 'row', backgroundColor: '#D4AF37', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 50, alignItems: 'center', elevation: 5 },
  cameraButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  previewContainer: { width: '100%', height: '100%', alignItems: 'center' },
  imagePreview: { width: '100%', height: '70%', borderRadius: 15, borderWidth: 1, borderColor: '#333', resizeMode: 'contain', backgroundColor: '#111' },
  actionsRow: { flexDirection: 'row', marginTop: 30, width: '100%', justifyContent: 'space-around' },
  retryButton: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, backgroundColor: '#1A0000', borderWidth: 1, borderColor: '#330000' },
  retryText: { color: '#FF4444', fontWeight: 'bold', marginLeft: 5 },
  processButton: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, backgroundColor: '#D4AF37', paddingHorizontal: 20 },
  processText: { color: '#000', fontWeight: 'bold', marginLeft: 5 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  loadingText: { color: '#D4AF37', marginTop: 15, fontWeight: 'bold', fontSize: 16 }
});