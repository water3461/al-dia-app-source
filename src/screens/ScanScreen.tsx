import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
// 👇 1. IMPORTANTE: Traemos el servicio de inteligencia que creamos
import { OCRService } from '../services/OCRService';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // ABRIR CÁMARA
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Requerido", "Necesitas dar permiso a la cámara para escanear documentos.");
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

  // BORRAR FOTO
  const clearImage = () => {
    setImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ESCANER SEGURO</Text>
        <Text style={styles.subtitle}>Tus datos se procesan solo en tu dispositivo.</Text>
      </View>

      <View style={styles.content}>
        {image ? (
          // --- VISTA CON FOTO ---
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            
            <View style={styles.actionsRow}>
              {/* Botón Borrar */}
              <TouchableOpacity style={styles.retryButton} onPress={clearImage}>
                <Ionicons name="trash-outline" size={24} color="#FF4444" />
                <Text style={styles.retryText}>Borrar</Text>
              </TouchableOpacity>

              {/* 👇 2. AQUÍ ESTÁ EL BOTÓN MODIFICADO CON LA SIMULACIÓN */}
              <TouchableOpacity 
                style={styles.processButton} 
                onPress={() => {
                  setUploading(true);

                  // --- SIMULACIÓN DE LECTURA ---
                  // (Esto simula lo que leería la cámara de una boleta real)
                  const textoSimulado = `
                    SUPERMERCADO LIDER
                    RUT: 77.123.456-1
                    FECHA: 20-01-2026
                    
                    LECHE  $1.200
                    PAN    $2.500
                    
                    TOTAL  $3.700
                    GRACIAS POR SU COMPRA
                  `;

                  // Usamos el OCRService para analizar el texto
                  const datos = OCRService.analyzeReceipt(textoSimulado);
                  
                  setUploading(false);

                  // Mostramos el resultado
                  Alert.alert(
                    "¡Lectura Exitosa! 🧠",
                    `Comercio: ${datos.commerce}\nFecha: ${datos.date}\nTotal Detectado: $${datos.total}`
                  );
                }}
              >
                <Ionicons name="scan-circle" size={24} color="#000" />
                <Text style={styles.processText}>ANALIZAR TEXTO</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // --- VISTA SIN FOTO (INICIO) ---
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={60} color="#333" />
            </View>
            <Text style={styles.emptyTitle}>Escanea un documento</Text>
            <Text style={styles.emptyDesc}>Boletas, Cartas del Banco, Cuentas de Luz...</Text>
            
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Ionicons name="camera" size={30} color="#000" />
              <Text style={styles.cameraButtonText}>ABRIR CÁMARA</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Indicador de carga si está procesando */}
      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={{color:'#D4AF37', marginTop: 10}}>Analizando...</Text>
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
  emptyDesc: { color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 40 },
  cameraButton: { flexDirection: 'row', backgroundColor: '#D4AF37', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 50, alignItems: 'center', elevation: 5 },
  cameraButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  previewContainer: { width: '100%', height: '100%', alignItems: 'center' },
  imagePreview: { width: '100%', height: '70%', borderRadius: 15, borderWidth: 1, borderColor: '#333', resizeMode: 'contain', backgroundColor: '#111' },
  actionsRow: { flexDirection: 'row', marginTop: 30, width: '100%', justifyContent: 'space-around' },
  retryButton: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, backgroundColor: '#1A0000', borderWidth: 1, borderColor: '#330000' },
  retryText: { color: '#FF4444', fontWeight: 'bold', marginLeft: 5 },
  processButton: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, backgroundColor: '#D4AF37', paddingHorizontal: 30 },
  processText: { color: '#000', fontWeight: 'bold', marginLeft: 5 },

  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }
});