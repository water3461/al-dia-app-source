import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DataService, Rule, BankCard } from '../services/DataService';
import RuleDetailModal from '../components/RuleDetailModal'; // <--- IMPORTAMOS EL NUEVO COMPONENTE

export default function HomeScreen() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [banks, setBanks] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ESTADO PARA EL MODAL
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const rulesData = await DataService.getDailyRules();
    const banksData = await DataService.getBanks();
    const hiddenBanks = await DataService.getHiddenBanks();
    const filteredRules = rulesData.filter(r => !hiddenBanks.includes(r.issuer_id));

    setRules(filteredRules);
    setBanks(banksData);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getBank = (issuerId: string) => {
    return banks.find(b => b.id === issuerId);
  };

  // FUNCIÓN AL TOCAR UNA TARJETA
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
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        <Text style={styles.sectionTitle}>OPORTUNIDADES DE HOY</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#D4AF37" style={{marginTop: 50}} />
        ) : rules.length > 0 ? (
          rules.map((item, index) => {
            const bank = getBank(item.issuer_id);
            const bgColor = bank ? bank.primary_color : '#1C1C1E';
            const bankName = bank ? bank.name : item.issuer_id;
            const initial = bankName ? bankName.charAt(0).toUpperCase() : "?";

            return (
              // AHORA LA TARJETA ES TOCABLE
              <TouchableOpacity 
                key={index} 
                activeOpacity={0.9}
                onPress={() => handleCardPress(item)}
              >
                <View style={[styles.card, { backgroundColor: bgColor }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.bankIdentity}>
                      <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoText}>{initial}</Text>
                      </View>
                      <Text style={styles.cardBankName}>{bankName}</Text>
                    </View>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{item.benefit_value}</Text>
                    </View>
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
            <Text style={{fontSize: 40}}>💤</Text>
            <Text style={styles.emptyText}>No hay alertas activas.</Text>
            <Text style={{color: '#444', marginTop: 10}}>Revisa tu Perfil para activar más bancos.</Text>
          </View>
        )}
      </ScrollView>

      {/* EL MODAL INVISIBLE QUE APARECE AL TOCAR */}
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
  subGreeting: { fontSize: 14, color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 },
  scrollContent: { padding: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, marginBottom: 15, fontWeight: '700', opacity: 0.5, letterSpacing: 1 },
  emptyText: { color: '#666', fontSize: 16, marginTop: 10, textAlign: 'center' },
  
  card: { borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
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