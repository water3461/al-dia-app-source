import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataService } from '../services/DataService';

interface Message { id: string; text: string; sender: 'user' | 'ai'; }

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hola 👋. Soy tu asesor financiero. Pregúntame por tus "descuentos" de hoy o el "total" de tus gastos.', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const generateResponse = async (userText: string) => {
    const lower = userText.toLowerCase();
    
    // RESPUESTAS INTELIGENTES REALES
    if (lower.includes('descuento') || lower.includes('hoy') || lower.includes('oferta')) {
      const rules = await DataService.getDailyRules();
      if (rules.length === 0) return "No veo descuentos para hoy en tus bancos seleccionados.";
      return "¡Sí! Hoy tienes:\n" + rules.map(r => `• ${r.store}: ${r.discount} con ${r.bank}`).join('\n');
    }
    
    if (lower.includes('gasto') || lower.includes('total') || lower.includes('historial')) {
      const history = await DataService.getHistory();
      if (history.length === 0) return "Aún no tienes gastos registrados. ¡Usa el escáner!";
      const total = history.reduce((sum, item) => sum + item.total, 0);
      return `Hasta ahora has gastado un total de $${total.toLocaleString('es-CL')}.`;
    }

    if (lower.includes('banco') || lower.includes('tarjeta')) {
         return "Puedes editar tus bancos en Perfil > Mis Bancos.";
    }

    return "Entendido. Recuerda que puedo decirte tus 'gastos' totales o tus 'descuentos' de hoy.";
  };

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;
    const userMsg = inputText;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userMsg, sender: 'user' }]);
    setInputText('');
    setIsTyping(true);

    const responseText = await generateResponse(userMsg);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: responseText, sender: 'ai' }]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef} data={messages} 
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={{color: item.sender === 'user' ? '#000' : '#FFF'}}>{item.text}</Text>
          </View>
        )}
        keyExtractor={i => i.id}
        contentContainerStyle={{padding: 20}}
      />
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Escribe aquí..." placeholderTextColor="#666" value={inputText} onChangeText={setInputText} />
        <TouchableOpacity onPress={handleSend}><Ionicons name="send" size={24} color="#D4AF37" /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bubble: { padding: 15, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
  userBubble: { backgroundColor: '#D4AF37', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#1C1C1E', alignSelf: 'flex-start' },
  inputContainer: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderColor: '#333', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#1C1C1E', color: '#FFF', borderRadius: 20, padding: 10, marginRight: 10 }
});