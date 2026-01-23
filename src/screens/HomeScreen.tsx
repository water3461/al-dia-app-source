import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, 
  TextInput, Vibration, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DataService } from '../services/DataService';
import { AIService } from '../services/AIService';

const DAYS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  
  // ESTADOS DE DINERO
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0); // Nuevo estado de Ahorro
  const [dailyQuote, setDailyQuote] = useState("Conectando...");
  const [weeklyOffers, setWeeklyOffers] = useState<any>({});

  // ESTADOS DE INTERFAZ
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // Para el Modal
  const [storeSearch, setStoreSearch] = useState("");
  const [cardRecommendation, setCardRecommendation] = useState<string | null>(null);

  const loadData = async () => {
    const history = await DataService.getHistory();
    const total = history.reduce((acc: any, item: any) => acc + item.total, 0);
    setTotalSpent(total);
    
    // NOTA: En una app real, el ahorro también vendría del historial.
    // Aquí lo simulamos o lo guardamos en DataService si quieres persistencia.
    
    const offers = await DataService.getOffers();
    setWeeklyOffers(offers);
    const quote = await AIService.generateDailyQuote(total);
    setDailyQuote(quote);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleCardHunt = async () => {
    if (!storeSearch.trim()) return;
    Vibration.vibrate(50);
    setCardRecommendation("Analizando..."); // Feedback rápido
    const rec = await AIService.recommendCard(storeSearch);
    setCardRecommendation(rec);
  };

  // Función cuando el usuario dice "Lo usé"
  const handleUsedBenefit = (savingsAmount: number) => {
    setTotalSaved(prev => prev + savingsAmount);
    setSelectedDay(null); // Cerrar modal
    Alert.alert("¡Buena! 🤑", "Ese ahorro ya suma a tu bolsillo.");
  };

  // Datos del día seleccionado para el Modal
  const modalOffer = selectedDay ? weeklyOffers[selectedDay] : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} tintColor="#D4AF37"/>}
      >
        {/* HEADER MINIMALISTA */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, Partner 🤜🤛</Text>
            <Text style={styles.aiQuote}>{dailyQuote}</Text>
          </View>
          {/* Ya no hay botón de settings aquí */}
        </View>

        {/* EL "LUJO": ASISTENTE DE PAGO (FEATURE PRINCIPAL) */}
        <View style={styles.luxuryHunter}>
          <View style={styles.hunterHeader}>
            <Ionicons name="sparkles" size={20} color="#D4AF37" />
            <Text style={styles.hunterTitle}>ASISTENTE INTELIGENTE</Text>
          </View>
          
          <Text style={styles.hunterQuestion}>¿Qué vas a comprar ahora?</Text>
          
          <View style={styles.searchBox}>
            <TextInput 
              style={styles.searchInput} 
              placeholder="Ej: Zapatillas, Supermercado..." 
              placeholderTextColor="#666"
              value={storeSearch} 
              onChangeText={setStoreSearch}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleCardHunt}>
              <Ionicons name="arrow-forward" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {cardRecommendation && (
            <View style={styles.recResult}>
              <Text style={styles.recText}>{cardRecommendation}</Text>
            </View>
          )}
        </View>

        {/* METAS: GASTO VS AHORRO */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>GASTADO</Text>
            <Text style={styles.statValue}>${totalSpent.toLocaleString('es-CL')}</Text>
          </View>
          <View style={[styles.statCard, {borderColor: '#4CD964'}]}>
            <Text style={[styles.statLabel, {color:'#4CD964'}]}>AHORRADO</Text>
            <Text style={[styles.statValue, {color:'#4CD964'}]}>${totalSaved.toLocaleString('es-CL')}</Text>
          </View>
        </View>

        {/* AGENDA DE AHORRO (INTERACTIVA) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📅 Toca un día para ahorrar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:10}}>
            {DAYS.map((day) => {
              const offer = weeklyOffers[day] || {};
              return (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.dayCard, {backgroundColor: offer.color || '#222'}]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={styles.dayCardTitle}>{day}</Text>
                  <Ionicons name={offer.icon || 'help'} size={24} color="#FFF" style={{marginVertical:5}} />
                  <Text style={styles.dayCardBank} numberOfLines={1}>{offer.bank || '---'}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* ACCESOS RÁPIDOS */}
        <View style={styles.actionsRow}>
           <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Escanear' as never)}>
             <Ionicons name="scan" size={24} color="#D4AF37" />
             <Text style={styles.quickText}>Escanear</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('History' as never)}>
             <Ionicons name="receipt" size={24} color="#D4AF37" />
             <Text style={styles.quickText}>Ver Historial</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>

      {/* MODAL EDUCATIVO DEL DESCUENTO */}
      <Modal visible={!!selectedDay} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalOffer && (
              <>
                <View style={[styles.modalHeader, {backgroundColor: modalOffer.color || '#333'}]}>
                   <Text style={styles.modalDay}>{modalOffer.dayFull}</Text>
                   <Ionicons name={modalOffer.icon} size={40} color="#FFF" />
                </View>

                <View style={{padding:25}}>
                  <Text style={styles.modalBank}>{modalOffer.bank}</Text>
                  <Text style={styles.modalBenefit}>{modalOffer.benefit}</Text>
                  
                  <View style={styles.educationBox}>
                    <Text style={styles.educationTitle}>💡 ¿Cómo lo uso?</Text>
                    <Text style={styles.educationText}>
                      Paga usando tu tarjeta <Text style={{fontWeight:'bold'}}>{modalOffer.bank}</Text> (física o digital). 
                      ¡Avísale al cajero que tienes el descuento!
                    </Text>
                  </View>

                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleTitle}>💰 Ejemplo real:</Text>
                    <Text style={styles.exampleText}>
                      Si gastas <Text style={{color:'#FFF'}}>$20.000</Text>, te ahorras aprox <Text style={{color:'#4CD964', fontWeight:'bold'}}>$8.000</Text>.
                    </Text>
                    <Text style={styles.motivationText}>
                      ¡Con ese ahorro ya pagas la mensualidad de la App y te sobra para una bebida! 🥤
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.useBtn} 
                    onPress={() => handleUsedBenefit(8000)} // Simulamos 8000 de ahorro
                  >
                    <Text style={styles.useBtnText}>¡Lo usé! (Sumar $8.000)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{marginTop:15, alignSelf:'center'}} onPress={() => setSelectedDay(null)}>
                    <Text style={{color:'#666'}}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20, paddingBottom: 40 }, 
  
  header: { marginBottom: 20 },
  greeting: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  aiQuote: { color: '#666', fontStyle: 'italic', marginTop: 5 },

  // EL "LUJO" (ASISTENTE)
  luxuryHunter: { backgroundColor: '#1C1C1E', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#D4AF37', marginBottom: 25 },
  hunterHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  hunterTitle: { color: '#D4AF37', fontWeight: 'bold', letterSpacing: 1, fontSize: 12 },
  hunterQuestion: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  searchBox: { flexDirection: 'row', gap: 10 },
  searchInput: { flex: 1, backgroundColor: '#111', borderRadius: 12, color: '#FFF', paddingHorizontal: 15, height: 50, fontSize: 16, borderWidth:1, borderColor:'#333' },
  searchBtn: { backgroundColor: '#D4AF37', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recResult: { marginTop: 15, padding: 10, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 10 },
  recText: { color: '#D4AF37', fontSize: 15 },

  // ESTADISTICAS
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: '#1C1C1E', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },

  // AGENDA
  sectionContainer: { marginBottom: 25 },
  sectionTitle: { color: '#888', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  dayCard: { width: 90, height: 110, borderRadius: 15, padding: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  dayCardTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  dayCardBank: { color: 'rgba(255,255,255,0.7)', fontSize: 10, textAlign: 'center' },

  // BOTONES RAPIDOS
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor:'#111', padding: 15, borderRadius: 20 },
  quickBtn: { alignItems: 'center', gap: 5 },
  quickText: { color: '#888', fontSize: 12 },

  // MODAL EDUCATIVO
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' },
  modalHeader: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  modalDay: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  modalBank: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  modalBenefit: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  
  educationBox: { backgroundColor: '#111', padding: 15, borderRadius: 10, marginBottom: 15 },
  educationTitle: { color: '#FFF', fontWeight: 'bold', marginBottom: 5 },
  educationText: { color: '#CCC', lineHeight: 20 },

  exampleBox: { backgroundColor: 'rgba(76, 217, 100, 0.1)', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(76, 217, 100, 0.3)' },
  exampleTitle: { color: '#4CD964', fontWeight: 'bold', marginBottom: 5 },
  exampleText: { color: '#CCC', marginBottom: 10 },
  motivationText: { color: '#FFF', fontStyle: 'italic', fontSize: 12 },

  useBtn: { backgroundColor: '#4CD964', padding: 18, borderRadius: 15, alignItems: 'center' },
  useBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});