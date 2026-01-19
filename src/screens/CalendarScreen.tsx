import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DataService, Rule, BankCard } from '../services/DataService';

export default function CalendarScreen() {
  const [loading, setLoading] = useState(true);
  const [weeklyRules, setWeeklyRules] = useState<Rule[]>([]);
  const [banks, setBanks] = useState<BankCard[]>([]);
  const [hiddenBanks, setHiddenBanks] = useState<string[]>([]);

  // Nombres de días para mostrar
  const daysOfWeek = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
    { id: 7, name: 'Domingo' },
  ];

  // Recargamos cada vez que entras (por si cambiaste filtros en el perfil)
  useFocusEffect(
    useCallback(() => {
      loadCalendar();
    }, [])
  );

  const loadCalendar = async () => {
    setLoading(true);
    // 1. Bajamos todo
    const allRules = await DataService.getAllRules();
    const banksData = await DataService.getBanks();
    const hiddenData = await DataService.getHiddenBanks();

    setBanks(banksData);
    setHiddenBanks(hiddenData);
    setWeeklyRules(allRules);
    setLoading(false);
  };

  const getBank = (issuerId: string) => {
    return banks.find(b => b.id === issuerId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CALENDARIO SEMANAL</Text>
        <Text style={styles.subtitle}>Planifica tu ahorro</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.scroll}>
          {daysOfWeek.map((day) => {
            // FILTRO DOBLE: Por día Y por bancos ocultos
            const rulesForDay = weeklyRules.filter(r => 
              r.days.includes(day.id) && !hiddenBanks.includes(r.issuer_id)
            );

            // Si no hay reglas este día (o las ocultaste todas), no mostramos el día
            if (rulesForDay.length === 0) return null;

            return (
              <View key={day.id} style={styles.daySection}>
                <View style={styles.dayHeaderRow}>
                  <Text style={styles.dayTitle}>{day.name}</Text>
                  <View style={styles.dayLine} />
                </View>
                
                {rulesForDay.map((rule, index) => {
                  const bank = getBank(rule.issuer_id);
                  const bgColor = bank ? bank.primary_color : '#1C1C1E';
                  const bankName = bank ? bank.name : rule.issuer_id;
                  const initial = bankName ? bankName.charAt(0).toUpperCase() : "?";

                  return (
                    <View key={index} style={[styles.card, { backgroundColor: bgColor }]}>
                      
                      {/* CABECERA DE TARJETA VIP */}
                      <View style={styles.cardHeader}>
                        <View style={styles.bankIdentity}>
                           {/* LOGO AMARILLO (Alto Contraste) */}
                          <View style={styles.logoPlaceholder}>
                            <Text style={styles.logoText}>{initial}</Text>
                          </View>
                          <Text style={styles.cardBankName}>{bankName}</Text>
                        </View>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{rule.benefit_value}</Text>
                        </View>
                      </View>

                      {/* CONTENIDO PRINCIPAL */}
                      <Text style={styles.cardCommerce}>{rule.commerce_name}</Text>
                      <Text style={styles.cardCondition}>{rule.condition}</Text>
                      
                      {/* TIP INTELIGENTE (Versión Mini para ahorrar espacio) */}
                      <View style={styles.tipContainer}>
                        <Text style={styles.tipIcon}>💡</Text>
                        <Text style={styles.cardTip} numberOfLines={2}>{rule.smart_tip}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
          <View style={{ height: 40 }} /> 
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#222', backgroundColor: '#000' },
  title: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center' },
  subtitle: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 4, textTransform: 'uppercase' },
  scroll: { padding: 15 },
  
  // SECCIÓN DÍA
  daySection: { marginBottom: 25 },
  dayHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  dayTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', textTransform: 'uppercase', marginRight: 15 },
  dayLine: { flex: 1, height: 1, backgroundColor: '#333' },
  
  // ESTILO TARJETA VIP (Copiado de Home)
  card: { 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    elevation: 5 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bankIdentity: { flexDirection: 'row', alignItems: 'center' },
  
  logoPlaceholder: { 
    width: 24, height: 24, borderRadius: 12, 
    backgroundColor: '#D4AF37', borderWidth: 1, borderColor: '#000',
    justifyContent: 'center', alignItems: 'center', marginRight: 8 
  },
  logoText: { color: '#000', fontWeight: '900', fontSize: 12 },
  
  cardBankName: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  discountBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  discountText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  
  cardCommerce: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  cardCondition: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 12 },
  
  tipContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', padding: 8, borderRadius: 8, alignItems: 'center' },
  tipIcon: { fontSize: 12, marginRight: 6 },
  cardTip: { color: '#EEE', fontStyle: 'italic', fontSize: 11, flex: 1 }
});