import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { DataService, Rule, BankCard } from '../services/DataService';

export default function CalendarScreen() {
  const [loading, setLoading] = useState(true);
  const [weeklyRules, setWeeklyRules] = useState<any[]>([]);
  const [banks, setBanks] = useState<BankCard[]>([]);

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

  useEffect(() => {
    loadCalendar();
  }, []);

  const loadCalendar = async () => {
    // Bajamos todas las reglas y bancos
    const allRules = await DataService.getAllRules();
    const banksData = await DataService.getBanks();
    setBanks(banksData);
    setWeeklyRules(allRules);
    setLoading(false);
  };

  const getBankColor = (issuerId: string) => {
    const bank = banks.find(b => b.id === issuerId);
    return bank ? bank.primary_color : '#333';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CALENDARIO SEMANAL</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.scroll}>
          {daysOfWeek.map((day) => {
            // Buscamos qué reglas aplican para este día específico
            const rulesForDay = weeklyRules.filter(r => r.days.includes(day.id));

            // Si no hay reglas este día, no lo mostramos (o podrías mostrar "Sin beneficios")
            if (rulesForDay.length === 0) return null;

            return (
              <View key={day.id} style={styles.daySection}>
                <Text style={styles.dayTitle}>{day.name}</Text>
                
                {rulesForDay.map((rule, index) => (
                  <View key={index} style={[styles.miniCard, { borderLeftColor: getBankColor(rule.issuer_id) }]}>
                    <Text style={styles.commerce}>{rule.commerce_name}</Text>
                    <Text style={styles.benefit}>{rule.benefit_value}</Text>
                    <Text style={styles.bankName}>{rule.issuer_id.toUpperCase()}</Text>
                  </View>
                ))}
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
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#222' },
  title: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center' },
  scroll: { padding: 20 },
  
  daySection: { marginBottom: 25 },
  dayTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  
  miniCard: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4, // Borde de color a la izquierda
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  commerce: { color: '#FFF', fontWeight: 'bold', fontSize: 16, flex: 1 },
  benefit: { color: '#00FF94', fontWeight: 'bold', fontSize: 16, marginRight: 10 },
  bankName: { color: '#666', fontSize: 10 }
});