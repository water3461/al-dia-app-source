import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DataService, Rule, BankCard } from '../services/DataService';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  // Estado para la fecha seleccionada (Objeto Date completo)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyBenefits, setDailyBenefits] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [myBanks, setMyBanks] = useState<BankCard[]>([]);

  // 1. Cargar datos iniciales
  useEffect(() => {
    loadUserData();
  }, []);

  // 2. Cada vez que cambie la fecha seleccionada, filtramos los beneficios
  useEffect(() => {
    filterBenefitsByDate(selectedDate);
  }, [selectedDate, myBanks]);

  const loadUserData = async () => {
    // Obtenemos todos los bancos (mocks)
    const allBanks = await DataService.getBanks();
    // Obtenemos los ocultos
    const hiddenIds = await DataService.getHiddenBanks();
    // Filtramos solo MIS bancos
    const visibleBanks = allBanks.filter(b => !hiddenIds.includes(b.id));
    setMyBanks(visibleBanks);
  };

  const filterBenefitsByDate = (date: Date) => {
    setLoading(true);
    // Convertimos la fecha a día de la semana (ej: "Lunes")
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = days[date.getDay()]; // ej: "Miércoles"

    let rulesForDay: Rule[] = [];

    // Buscamos en MIS bancos las reglas que coincidan con este día
    myBanks.forEach(bank => {
      const bankRules = bank.rules.filter(rule => 
        rule.day === dayName || rule.day === 'Todos' || (rule.days && rule.days.includes(dayName))
      );
      rulesForDay = [...rulesForDay, ...bankRules];
    });

    setDailyBenefits(rulesForDay);
    setLoading(false);
  };

  // Generamos la semana actual para el calendario visual
  const generateWeek = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - today.getDay() + i); // Ajustar al Domingo como inicio
      return { 
        label: days[d.getDay()], 
        dayNumber: d.getDate(), 
        fullDate: d 
      };
    });
  };
  const weekDates = generateWeek();

  // Acción al tocar un beneficio (Feedback útil)
  const handleBenefitPress = (rule: Rule) => {
    Alert.alert(
      `${rule.store}`,
      `💳 Usa tu tarjeta: ${rule.bank} (${rule.cardType})\n\n✅ Descuento: ${rule.discount}\n📅 Válido: ${rule.day}`,
      [{ text: "Entendido", style: "default" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.username}>Organiza tu día ☀️</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={45} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* CALENDARIO INTERACTIVO */}
        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Tu Semana</Text>
          <View style={styles.calendarRow}>
            {weekDates.map((item, index) => {
              // Comparamos si es el mismo día
              const isSelected = item.fullDate.getDate() === selectedDate.getDate();
              const isToday = item.fullDate.getDate() === new Date().getDate();
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.dayItem, 
                    isSelected && styles.dayItemSelected,
                    !isSelected && isToday && styles.dayItemToday // Estilo para "Hoy" si no está seleccionado
                  ]}
                  onPress={() => setSelectedDate(item.fullDate)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{item.label}</Text>
                  <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>{item.dayNumber}</Text>
                  {isSelected && <View style={styles.dot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* LISTA DE BENEFICIOS DINÁMICA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedDate.getDate() === new Date().getDate() ? 'Ahorra Hoy ⚡' : `Ahorra el ${selectedDate.toLocaleDateString('es-CL', {weekday: 'long'})} 🗓️`}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#D4AF37" style={{marginTop: 20}} />
        ) : dailyBenefits.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.benefitsScroll}>
            {dailyBenefits.map((rule, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.benefitCard}
                onPress={() => handleBenefitPress(rule)}
              >
                <View style={styles.cardHeader}>
                  {/* Icono genérico según tienda */}
                  <Ionicons name={rule.store.includes('Starbucks') ? 'cafe' : rule.store.includes('Copec') ? 'car' : 'pricetag'} size={20} color="#D4AF37" />
                  <Text style={styles.benefitBrand} numberOfLines={1}>{rule.store}</Text>
                </View>
                
                <View>
                  <Text style={styles.benefitOffer}>{rule.discount}</Text>
                  <Text style={styles.benefitDesc}>con {rule.bank}</Text>
                  <View style={styles.tagContainer}>
                     <Text style={styles.cardTypeTag}>{rule.cardType}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay beneficios registrados para este día en tus bancos seleccionados.</Text>
          </View>
        )}

        {/* ACCESO RÁPIDO A ESCÁNER */}
        <View style={styles.actionContainer}>
            <Text style={styles.sectionTitle}>Gastos</Text>
            <TouchableOpacity 
                style={styles.bigScanButton}
                onPress={() => navigation.navigate('Escanear')}
            >
                <Ionicons name="scan" size={30} color="#000" />
                <Text style={styles.bigScanText}>Escanear Boleta</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#888', fontSize: 14 },
  username: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  
  calendarContainer: { paddingHorizontal: 20, marginBottom: 25 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  dayItem: { alignItems: 'center', padding: 8, borderRadius: 12, width: 45, backgroundColor: '#111' },
  dayItemToday: { borderColor: '#333', borderWidth: 1 },
  dayItemSelected: { backgroundColor: '#D4AF37' },
  dayText: { color: '#666', fontSize: 12, marginBottom: 4 },
  dayTextSelected: { color: '#000', fontWeight: 'bold' },
  dateText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  dateTextSelected: { color: '#000' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#000', marginTop: 4 },

  sectionHeader: { paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  benefitsScroll: { paddingLeft: 20, marginBottom: 30 },
  benefitCard: { 
    width: 160, padding: 15, borderRadius: 16, marginRight: 15, height: 150, 
    backgroundColor: '#1C1C1E', justifyContent: 'space-between', borderWidth: 1, borderColor: '#333' 
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitBrand: { color: '#FFF', fontWeight: 'bold', fontSize: 14, flex: 1 },
  benefitOffer: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', marginVertical: 5 },
  benefitDesc: { color: '#888', fontSize: 12 },
  tagContainer: { flexDirection: 'row', marginTop: 5 },
  cardTypeTag: { backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, color: '#CCC', fontSize: 10 },

  emptyState: { paddingHorizontal: 20, marginBottom: 30 },
  emptyText: { color: '#555', fontStyle: 'italic' },

  actionContainer: { paddingHorizontal: 20 },
  bigScanButton: { 
    backgroundColor: '#D4AF37', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 20, borderRadius: 20, marginTop: 10, gap: 10 
  },
  bigScanText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});