import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Rule, BankCard } from '../services/DataService';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  rule: Rule | null;
  bank: BankCard | undefined;
}

export default function RuleDetailModal({ isVisible, onClose, rule, bank }: Props) {
  if (!rule) return null;

  const bankName = bank ? bank.name : rule.issuer_id;
  const bgColor = bank ? bank.primary_color : '#333';
  const initial = bankName.charAt(0).toUpperCase();

  // Función para abrir el enlace
  const handleOpenLink = () => {
    // Truco: Como no tenemos la URL exacta, buscamos en Google automáticamente
    const query = `Descuentos ${bankName} ${rule.commerce_name}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* HEADER CON COLOR DEL BANCO */}
          <View style={[styles.header, { backgroundColor: bgColor }]}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>{initial}</Text>
            </View>
            <Text style={styles.bankName}>{bankName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.commerceName}>{rule.commerce_name}</Text>
            <Text style={styles.benefitValue}>{rule.benefit_value}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.label}>CONDICIONES:</Text>
            <Text style={styles.text}>{rule.condition}</Text>

            <Text style={styles.label}>CONSEJO AL DÍA:</Text>
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>💡 {rule.smart_tip}</Text>
            </View>
          </ScrollView>

          {/* BOTÓN DE ACCIÓN */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenLink}>
              <Text style={styles.actionText}>VER EN WEB DEL BANCO ↗</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', minHeight: '50%' },
  
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#000' },
  logoText: { fontWeight: 'bold', color: '#000' },
  bankName: { color: '#FFF', fontWeight: 'bold', fontSize: 16, flex: 1, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 },
  closeButton: { padding: 5 },
  closeText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },

  content: { padding: 20 },
  commerceName: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  benefitValue: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#333', marginBottom: 20 },
  
  label: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  text: { color: '#DDD', fontSize: 16, marginBottom: 20, lineHeight: 22 },
  
  tipBox: { backgroundColor: 'rgba(212, 175, 55, 0.15)', padding: 15, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  tipText: { color: '#D4AF37', fontStyle: 'italic' },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#333' },
  actionButton: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 10, alignItems: 'center' },
  actionText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});