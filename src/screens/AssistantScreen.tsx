import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataService } from '../services/DataService';
import { AIService } from '../services/AIService';

interface Message { id: string; text: string; sender: 'user' | 'ai'; }

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '¡Hola! Soy tu IA financiera real. 🧠\n\nAnalizo tus datos en vivo. Pregúntame lo que sea: "Qué tarjeta uso hoy", "He gastado mucho", o "Dame un consejo".', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    const text = inputText.trim();
    if (text.length === 0) return;

    // 1. Mostrar mensaje del usuario
    setMessages(prev => [...prev, { id: Date.now().toString(), text: text, sender: 'user' }]);
    setInputText('');
    setIsTyping(true);

    // 2. RECOPILAR DATOS REALES (EL CONTEXTO)
    // Aquí es donde la IA "lee" tu app antes de responder
    const history = await DataService.getHistory();
    const rules = await DataService.getDailyRules();
    const banks = await DataService.getBanks();
    const myHidden = await DataService.getHiddenBanks();
    const myActiveBanks = banks.filter(b => !myHidden.includes(b.id)).map(b => b.name).join(', ');

    // Calculamos total gastado real
    const totalSpent = history.reduce((sum, item) => sum + item.total, 0);

    // Creamos el "expediente" para la IA
    const contextData = `
      - Bancos del usuario: ${myActiveBanks || "Ninguno configurado"}.
      - Gastos totales históricos: $${totalSpent}.
      - Últimos 5 movimientos: ${JSON.stringify(history.slice(0, 5))}.
      - Beneficios disponibles HOY en sus bancos: ${JSON.stringify(rules)}.
    `;

    // 3. LLAMAR A LA IA (Sin filtros locales)
    const aiReply = await AIService.chatWithAI(text, contextData);

    // 4. Mostrar respuesta
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiReply, sender: 'ai' }]);
    setIsTyping(false);
  };

  useEffect(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef} data={messages} 
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={{color: item.sender === 'user' ? '#000' : '#FFF', fontSize: 16}}>{item.text}</Text>
          </View>
        )}
        keyExtractor={i => i.id} contentContainerStyle={{padding: 20}}
      />
      
      {isTyping && (
        <View style={{flexDirection:'row', alignItems:'center', marginLeft: 20, marginBottom: 10}}>
          <ActivityIndicator color="#D4AF37" size="small" />
          <Text style={{color:'#666', marginLeft: 10, fontSize: 12}}>Pensando respuesta...</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Pregunta algo difícil..." 
            placeholderTextColor="#666" 
            value={inputText} 
            onChangeText={setInputText} 
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <Ionicons name="arrow-up" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bubble: { padding: 15, borderRadius: 20, marginBottom: 15, maxWidth: '85%' },
  userBubble: { backgroundColor: '#D4AF37', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiBubble: { backgroundColor: '#1C1C1E', alignSelf: 'flex-start', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#333' },
  inputContainer: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderColor: '#222', backgroundColor: '#000', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#1C1C1E', color: '#FFF', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, marginRight: 10, fontSize: 16 },
  sendBtn: { backgroundColor: '#D4AF37', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});