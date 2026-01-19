import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DataService, Rule, BankCard } from '../services/DataService';
import RuleDetailModal from '../components/RuleDetailModal';

export default function HomeScreen() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [banks, setBanks] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // --- ESTADOS DE FILTROS ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // --- MODAL ---
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // CATEGORÍAS DEFINIDAS
  const categories = ['Todos', 'Supermercado', 'Farmacia', 'Combustible', 'Comida', 'Varios'];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const rulesData = await DataService.getDailyRules();
    const banksData = await DataService.getBanks();
    const hiddenBanks = await DataService.getHiddenBanks();
    const activeRules = rulesData.filter(r => !hiddenBanks.includes(r.issuer_id));
    setRules(activeRules);
    setBanks(banksData);
    setLoading(false);
    setRefreshing(false);
  };

  // 🧠 FUNCIÓN INTELIGENTE: ADIVINA LA CATEGORÍA
  const detectCategory = (commerceName: string, tip: string): string => {
    const text = (commerceName + " " + tip).toLowerCase();
    
    if (text.match(/lider|jumbo|unimarc|tottus|santa isabel|super|mayorista/)) return 'Supermercado';
    if (text.match(/farmacia|cruz verde|ahumada|salcobrand|dr\. simi/)) return 'Farmacia';
    if (text.match(/copec|shell|petrobras|bencina|combustible/)) return 'Combustible';
    if (text.match(/mcdonald|burger|pizza|sushi|starbucks|dunkin|ubereats|pedidos|wok|bistrot/)) return 'Comida';
    
    return 'Varios'; // Si no coincide con nada
  };

  // 🔍 FILTRO MAESTRO (Texto + Categoría)
  const getFilteredRules = () => {
    let result = rules;

    // 1. Filtrar por Categoría (si no es 'Todos')
    if (selectedCategory !== 'Todos') {
      result = result.filter(rule => {
        const cat = detectCategory(rule.commerce_name, rule.smart_tip);
        // 'Varios' agrupa todo lo que no calza en las otras
        if (selectedCategory === 'Varios') return cat === 'Varios';
        return cat === selectedCategory;
      });
    }

    // 2. Filtrar por Texto del Buscador
    if (searchQuery) {
      const lowerText = searchQuery.toLowerCase();
      result = result.filter(rule => 
        rule.commerce_name.toLowerCase().includes(lowerText) ||
        rule.smart_tip.toLowerCase().includes(lowerText) ||
        rule.condition.toLowerCase().includes(lowerText)
      );
    }

    return result;
  };

  const filteredList = getFilteredRules();
  const getBank = (issuerId: string) => banks.find(b => b.id === issuerId);

  const handleCardPress = (rule: Rule) => {
    setSelectedRule(rule);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>AL DÍA</Text>
        <Text style={styles.subGreeting}>Tu Estrategia de Hoy</Text>
        
        {/* BUSCADOR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* --- NUEVO: CARRUSEL DE CATEGORÍAS --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{paddingRight: 20}}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity 
                key={cat} 
                style={[styles.catButton, isActive && styles.catButtonActive]} 
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.catText, isActive && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {/* -------------------------------------- */}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} tintColor="#D4AF37" />}
      >
        <View style={styles.resultsHeader}>
           <Text style={styles.sectionTitle}>
            {selectedCategory !== 'Todos' ? selectedCategory.toUpperCase() : 'TODAS LAS OPORTUNIDADES'}
          </Text>
          <Text style={styles.countText}>{filteredList.length}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#D4AF37" style={{marginTop: 50}} />
        ) : filteredList.length > 0 ? (
          filteredList.map((item, index) => {
            const bank = getBank(item.issuer_id);
            const bgColor = bank ? bank.primary_color : '#1C1C1E';
            const bankName = bank ? bank.name : item.issuer_id;
            const initial = bankName ? bankName.charAt(0).toUpperCase() : "?";

            return (
              <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => handleCardPress(item)}>
                <View style={[styles.card, { backgroundColor: bgColor }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.bankIdentity}>
                      <View style={styles.logoPlaceholder}><Text style={styles.logoText}>{initial}</Text></View>
                      <Text style={styles.cardBankName}>{bankName}</Text>
                    </View>
                    <View style={styles.discountBadge}><Text style={styles.discountText}>{item.benefit_value}</Text></View>
                  </View>
                  <Text style={styles.cardCommerce}>{item.commerce_name}</Text>
                  <Text style={styles.cardCondition} numberOfLines={1}>{item.condition}</Text>
                  <View style={styles.tipContainer}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.cardTip} numberOfLines={1}>{item.smart_tip}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{alignItems: 'center', marginTop: 50}}>
            <Text style={{fontSize: 40}}>🤷‍♂️</Text>
            <Text style={styles.emptyText}>No hay descuentos aquí.</Text>
            <Text style={{color: '#666', marginTop: 5}}>Prueba otra categoría o borra la búsqueda.</Text>
          </View>
        )}
      </ScrollView>

      <RuleDetailModal 
        isVisible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        rule={selectedRule}
        bank={selectedRule ? getBank(selectedRule.issuer_id) : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  greeting: { fontSize: 28, fontWeight: '800', color: '#D4AF37', letterSpacing: 1 },
  subGreeting: { fontSize: 14, color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 15 },
  
  searchContainer: { flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', marginBottom: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 16 },

  // ESTILOS CATEGORÍAS
  categoryScroll: { flexDirection: 'row' },
  catButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1C1C1E', marginRight: 10, borderWidth: 1, borderColor: '#333' },
  catButtonActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  catText: { color: '#888', fontWeight: '600' },
  catTextActive: { color: '#000', fontWeight: 'bold' },

  scrollContent: { padding: 20 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', opacity: 0.5, letterSpacing: 1 },
  countText: { color: '#D4AF37', fontWeight: 'bold' },
  
  emptyText: { color: '#666', fontSize: 16, marginTop: 10, textAlign: 'center' },
  
  card: { borderRadius: 20, padding: 20, marginBottom: 20, elevation: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  bankIdentity: { flexDirection: 'row', alignItems: 'center' },
  logoPlaceholder: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#000' },
  logoText: { color: '#000000', fontWeight: '900', fontSize: 16 },
  cardBankName: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 14, textTransform: 'uppercase' },
  discountBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cardCommerce: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  cardCondition: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },
  tipContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12, alignItems: 'center' },
  tipIcon: { fontSize: 16, marginRight: 10 },
  cardTip: { color: '#FFF', fontStyle: 'italic', fontSize: 13, flex: 1 }
});