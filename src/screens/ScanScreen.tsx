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

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso requerido", "Necesitamos la cámara para ver el local.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const clearImage = () => setImage(null);

  const handleAnalyze = async () => {
    if (!image) return;
    setUploading(true);

    try {
      // 1. La IA lee TODO lo que ve (Letrero o Boleta)
      const data = await OCRService.analyzeReceiptFromImage(image!);
      const rawTextLower = data.rawText.toLowerCase(); // Texto crudo en minúsculas
      
      // 2. BUSCAMOS SI HAY UN COMERCIO CONOCIDO EN EL TEXTO
      const allRules = await DataService.getDailyRules();
      
      // Buscamos si alguna marca (ej: "starbucks") está en el texto de la foto
      const detectedRule = allRules.find(rule => 
        rawTextLower.includes(rule.commerce_name.toLowerCase())
      );

      setUploading(false);

      // --- CASO A: ES UN LOCAL (DETECTAMOS LA MARCA, PERO NO HAY TOTAL) ---
      // Si encontramos la marca Y el total es 0 (o muy bajo/confuso), asumimos que es el letrero.
      if (detectedRule && (!data.total || data.total === 0)) {
        
        Alert.alert(
          `📍 ¡Estás en ${detectedRule.commerce_name}!`,
          `\n💳 **TARJETA RECOMENDADA:**\nBanco ${detectedRule.issuer_id.toUpperCase()}\n\n🎁 **Beneficio:** ${detectedRule.benefit_value}\n💡 **Tip:** ${detectedRule.smart_tip}`,
          [
            { text: "¡Gracias!", onPress: clearImage, style: "default" }
          ]
        );
        return; // Terminamos aquí, no guardamos nada porque aún no compras.
      }

      // --- CASO B: ES UNA BOLETA (HAY TOTAL Y FECHA) ---
      const commerceName = data.commerce || (detectedRule ? detectedRule.commerce_name : "Comercio Desconocido");
      
      // Preparamos el mensaje tipo "Coach"
      let title = "🧾 Boleta Procesada";
      let body = `📅 Fecha: ${data.date || 'Hoy'}\n🏪 Comercio: ${commerceName}\n💰 Total: $${(data.total || 0).toLocaleString('es-CL')}`;
      let alertLog = "";

      // Verificamos si tenías descuento (usando la lógica anterior)
      const missedBenefit = await DataService.checkBenefit(commerceName);

      if (missedBenefit) {
        title = "💡 Tip para la próxima";
        body += `\n\n✨ ¿Sabías que ${commerceName} tiene dcto con Banco ${missedBenefit.issuer_id.toUpperCase()}?\nLa próxima vez inténtalo y ahorra. 😉`;
        alertLog = `Oportunidad: ${missedBenefit.benefit_value}`;
      }

      Alert.alert(
        title,
        body,
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "GUARDAR GASTO", 
            onPress: async () => {
              await DataService.addReceipt({
                commerce: commerceName,
                date: data.date || new Date().toLocaleDateString(),
                total: data.total || 0,
                savingsAlert: alertLog
              });
              Alert.alert("✅ Guardado", "Gasto registrado.", [
                { text: "Ver Historial", onPress: () => navigation.navigate('History') },
                { text: "OK", onPress: clearImage }
              ]);
            } 
          }
        ]
      );

    } catch (error) {
      setUploading(false);
      Alert.alert("Error", "No pude leer el cartel ni la boleta. Intenta acercarte más.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VISIÓN IA 👁️</Text>
        <Text style={styles.subtitle}>Apunta a un Local o a una Boleta</Text>
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
              <TouchableOpacity style={styles.processButton} onPress={handleAnalyze} disabled={uploading}>
                <Ionicons name="scan-circle" size={24} color="#000" />
                <Text style={styles.processText}>ANALIZAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera-outline" size={60} color="#D4AF37" />
            </View>
            <Text style={styles.emptyTitle}>¿Dónde estás?</Text>
            <Text style={styles.emptyDesc}>
              📸 **Opción 1:** Saca foto al letrero del local ANTES de pagar.{"\n"}
              🧾 **Opción 2:** Saca foto a la boleta DESPUÉS de pagar.
            </Text>
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
          <Text style={styles.loadingText}>La IA está analizando...</Text>
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
  emptyDesc: { color: '#888', fontSize: 14, textAlign: 'left', marginBottom: 40, paddingHorizontal: 20, lineHeight: 22 },
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