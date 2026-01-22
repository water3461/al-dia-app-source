import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataService, Rule } from '../services/DataService';

interface Message { id: string; text: string; sender: 'user' | 'ai'; }

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hola, soy tu Asesor AL DÍA. 🤖\n\nPuedo revisar tus descuentos de hoy, ver tus bancos o analizar tus gastos. ¿Qué necesitas?', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 🧠 CEREBRO REAL: CONECTADO A DATOS
  const generateResponse = async (userText: string) => {
    const lower = userText.toLowerCase();
    
    // CASO 1: DESCUENTOS / HOY
    if (lower.includes('descuento') || lower.includes('hoy') || lower.includes('oferta')) {
      const rules = await DataService.getDailyRules();
      if (rules.length === 0) return "No veo descuentos específicos para hoy en tus bancos. 😕 ¡Intenta usar una tarjeta de crédito para acumular puntos!";
      const list = rules.map(r => `• ${r.store}: ${r.discount} con ${r.bank}`).join('\n');
      return `¡Tengo estos datos para hoy! ⚡:\n\n${list}`;
    }

    // CASO 2: BANCOS
    if (lower.includes('banco') || lower.includes('tarjeta')) {
      const hidden = await DataService.getHiddenBanks();
      const all = await DataService.getBanks();
      const myBanks = all.filter(b => !hidden.includes(b.id)).map(b => b.name).join(', ');
      return `Actualmente tienes configurados: ${myBanks}.\n\nSi te falta alguno, ve a Perfil > Mis Bancos.`;
    }

    // CASO 3: HISTORIAL / GASTOS
    if (lower.includes('gasto') || lower.includes('historial') || lower.includes('cuanto')) {
      const history = await DataService.getHistory();
      if (history.length === 0) return "Aún no has escaneado ninguna boleta. ¡Usa el escáner para empezar a llevar la cuenta!";
      
      const total = history.reduce((sum, item) => sum + item.total, 0);
      return `Hasta ahora has registrado ${history.length} compras.\n\n💸 Total gastado: $${total.toLocaleString('es-CL')}`;
    }

    // DEFAULT
    return "Entendido. Recuerda que puedo buscar 'descuentos', revisar tus 'gastos' o listar tus 'bancos'.";
  };

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;
    const userMsg = inputText;
    const newMsg: Message = { id: Date.now().toString(), text: userMsg, sender: 'user' };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Procesamos respuesta
    const responseText = await generateResponse(userMsg);
    
    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, [messages, isTyping]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.sender === 'ai' && <Ionicons name="sparkles" size={16} color="#D4AF37" style={{marginBottom: 5}} />}
      <Text style={[styles.msgText, item.sender === 'user' ? styles.userText : styles.aiText]}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Asesor AL DÍA 🧠</Text>
      </View>
      <FlatList
        ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={i => i.id}
        contentContainerStyle={styles.chatContainer}
        ListFooterComponent={isTyping ? <ActivityIndicator size="small" color="#D4AF37" style={{alignSelf:'flex-start', marginLeft:20}} /> : null}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Pregunta por descuentos..." placeholderTextColor="#666" value={inputText} onChangeText={setInputText} onSubmitEditing={handleSend} />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}><Ionicons name="send" size={20} color="#000" /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#222', alignItems: 'center' },
  headerTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  chatContainer: { padding: 20 },
  msgBubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 15 },
  aiBubble: { backgroundColor: '#1C1C1E', borderBottomLeftRadius: 5, alignSelf: 'flex-start', borderWidth:1, borderColor:'#333' },
  userBubble: { backgroundColor: '#D4AF37', borderBottomRightRadius: 5, alignSelf: 'flex-end' },
  msgText: { fontSize: 16, lineHeight: 22 },
  aiText: { color: '#FFF' },
  userText: { color: '#000', fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderTopColor: '#222', backgroundColor: '#000' },
  input: { flex: 1, backgroundColor: '#1C1C1E', color: '#FFF', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10 },
  sendButton: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' }
});