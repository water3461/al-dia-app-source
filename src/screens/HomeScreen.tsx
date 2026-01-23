import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, 
  TextInput, Modal, Vibration
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
  
  // ESTADOS DE DATOS
  const [totalSpent, setTotalSpent] = useState(0);
  const [dailyQuote, setDailyQuote] = useState("Conectando...");
  const [weeklyOffers, setWeeklyOffers] = useState<any>({}); // Ofertas dinámicas
  const [myBankData, setMyBankData] = useState<any>({});   // Datos bancarios dinámicos

  // ESTADOS DE INTERFAZ
  const [selectedDay, setSelectedDay] = useState('LU'); // Día seleccionado
  const [storeSearch, setStoreSearch] = useState("");
  const [cardRecommendation, setCardRecommendation] = useState<string | null>(null);
  const [showMyData, setShowMyData] = useState(false);

  // CARGA DE DATOS (Se ejecuta al entrar a la pantalla)
  const loadData = async () => {
    // 1. Historial y Gasto
    const history = await DataService.getHistory();
    const total = history.reduce((acc: any, item: any) => acc + item.total, 0);
    setTotalSpent(total);

    // 2. Cargar Configuración Personal (Persistencia)
    const offers = await DataService.getOffers();
    setWeeklyOffers(offers);
    
    const userData = await DataService.getUserData();
    setMyBankData(userData);

    // 3. Frase IA
    const quote = await AIService.generateDailyQuote(total);
    setDailyQuote(quote);
    
    setRefreshing(false);
  };

  // Forzar recarga al volver de Settings
  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleCardHunt = async () => {
    if (!storeSearch.trim()) return;
    Vibration.vibrate(50);
    setCardRecommendation("🤖 Analizando...");
    const rec = await AIService.recommendCard(storeSearch);
    setCardRecommendation(rec);
  };

  // Obtener oferta del día seleccionado (o fallback vacío)
  const currentOffer = weeklyOffers[selectedDay] || {
    color: '#333', dayFull: 'Cargando...', bank: '...', benefit: '...', store: '...', icon: 'help'
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} tintColor="#D4AF37"/>}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{flex:1}}>
            <Text style={styles.greeting}>Hola, Partner 🤜🤛</Text>
            <Text style={styles.aiQuote}>"{dailyQuote}"</Text>
          </View>
          
          <View style={{flexDirection: 'row', gap: 10}}>
            {/* BOTÓN CONFIGURACIÓN (NUEVO) */}
            <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={styles.iconBtn}>
              <Ionicons name="settings-sharp" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* BOTÓN MIS DATOS */}
            <TouchableOpacity onPress={() => setShowMyData(true)} style={[styles.iconBtn, {backgroundColor: '#D4AF37'}]}>
              <Ionicons name="card-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CALENDARIO DE BENEFICIOS */}
        <View style={styles.sectionContainer}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text style={styles.sectionTitle}>📅 Tu Agenda de Ahorro</Text>
            <Text style={{color: currentOffer.color || '#FFF', fontWeight:'bold', fontSize:12}}>
              {currentOffer.dayFull}
            </Text>
          </View>

          <View style={styles.calendarRow}>
            {DAYS.map((day) => (
              <TouchableOpacity 
                key={day} 
                onPress={() => {setSelectedDay(day); Vibration.vibrate(15);}}
                style={[
                  styles.dayCircle, 
                  selectedDay === day && {
                    backgroundColor: weeklyOffers[day]?.color || '#333', 
                    borderColor: weeklyOffers[day]?.color || '#333'
                  }
                ]}
              >
                <Text style={[styles.dayText, selectedDay === day && {color:'#FFF'}]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TARJETA DE BENEFICIO DINÁMICA */}
          <View style={[styles.benefitCard, { backgroundColor: currentOffer.color || '#222' }]}>
            <View style={styles.benefitHeader}>
               <Ionicons name={currentOffer.icon as any || 'help'} size={24} color="rgba(255,255,255,0.8)" />
               <Text style={styles.bankName}>{currentOffer.bank}</Text>
            </View>
            <Text style={styles.benefitBig}>{currentOffer.benefit}</Text>
            <Text style={styles.benefitStore}>{currentOffer.store}</Text>
            <View style={styles.cardChip} /> 
          </View>
        </View>

        {/* CAZADOR DE DESCUENTOS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🕵️‍♂️ ¿Con qué pago?</Text>
          <View style={styles.hunterRow}>
            <TextInput 
              style={styles.searchInput} placeholder="Escribe tienda (ej: Zara...)" placeholderTextColor="#666"
              value={storeSearch} onChangeText={setStoreSearch}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleCardHunt}>
              <Ionicons name="search" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {cardRecommendation && (
            <View style={styles.recBubble}><Text style={styles.aiRecText}>{cardRecommendation}</Text></View>
          )}
        </View>

        {/* GASTO TOTAL */}
        <View style={styles.moneyCard}>
          <Text style={styles.moneyLabel}>GASTO ACUMULADO</Text>
          <Text style={styles.moneyValue}>${totalSpent.toLocaleString('es-CL')}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(totalSpent/500000, 1) * 100}%` }]} />
          </View>
        </View>

        {/* ACCESOS DIRECTOS */}
        <View style={styles.actionsGrid}>
          {/* Escanear */}
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Escanear' as never)}>
            <View style={styles.iconCircle}>
              <Ionicons name="scan" size={26} color="#D4AF37" />
            </View>
            <Text style={styles.btnLabel}>Escanear</Text>
          </TouchableOpacity>
          
          {/* Asistente */}
          <TouchableOpacity style={[styles.actionBtn, styles.aiBtn]} onPress={() => navigation.navigate('Asistente' as never)}>
            <View style={[styles.iconCircle, {borderColor: '#FFF'}]}>
              <Ionicons name="chatbubble-ellipses" size={26} color="#FFF" />
            </View>
            <Text style={[styles.btnLabel, {color: '#FFF'}]}>Asistente</Text>
          </TouchableOpacity>

          {/* Historial */}
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('History' as never)}>
            <View style={[styles.iconCircle, {borderColor: '#666'}]}>
              <Ionicons name="list" size={26} color="#888" />
            </View>
            <Text style={[styles.btnLabel, {color: '#888'}]}>Historial</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* MODAL MIS DATOS */}
      <Modal visible={showMyData} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{alignItems:'center', marginBottom:20}}>
              <Ionicons name="wallet" size={40} color="#D4AF37" />
              <Text style={styles.modalTitle}>Mis Datos</Text>
            </View>
            <View style={styles.dataRow}><Text style={styles.dataLabel}>Titular:</Text><Text style={styles.dataValue}>{myBankData.name || '---'}</Text></View>
            <View style={styles.dataRow}><Text style={styles.dataLabel}>Banco:</Text><Text style={styles.dataValue}>{myBankData.bank || '---'}</Text></View>
            <View style={styles.dataRow}><Text style={styles.dataLabel}>Cuenta:</Text><Text style={styles.dataValue}>{myBank