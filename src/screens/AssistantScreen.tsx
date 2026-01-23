import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, 
  KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataService } from '../services/DataService';
import { AIService } from '../services/AIService';

// Definimos cómo se ve un mensaje
interface Message { id: string; text: string; sender: 'user' | 'ai'; }

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '¡Hola! Soy Al Día. 🧠\n\nPregúntame lo que quieras sobre tus finanzas.', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    const text = inputText.trim();
    if (text.length === 0) return;

    // 1. Mostrar mensaje del usuario inmediatamente
    const newUserMsg: Message = { id: Date.now().toString(), text: text, sender: 'user' };
    
    // GUARDAMOS UNA COPIA DEL HISTORIAL ACTUAL (Para enviárselo a la IA)
    const currentHistory = [...messages]; 

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    // 2. Preparar el contexto (Datos financieros)
    // Buscamos cuánto ha gastado para que la IA sepa
    const historyData = await DataService.getHistory();
    const totalSpent = historyData.reduce((sum, item) => sum + item.total, 0);
    
    const contextData = `
      - Gasto total histórico: $${totalSpent}
      - Cantidad de boletas: ${historyData.length}
      - Último gasto registrado: ${historyData.length > 0 ? JSON.stringify(historyData[0]) : "Ninguno"}
    `;

    // 3. LLAMADA CORREGIDA A LA IA (3 Argumentos)
    // Orden: (Mensaje Nuevo, Historial de Chat, Contexto Financiero)
    const aiReply = await AIService.chatWithAI(text, currentHistory, contextData);

    // 4. Mostrar respuesta de la IA
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiReply, sender: 'ai' }]);
    setIsTyping(false);
  };

  // Scroll automático al último mensaje
  useEffect(() => { 
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SIMPLE */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Asistente IA</Text>
        <Ionicons name="sparkles" size={20} color="#D4AF37" />
      </View>

      <FlatList
        ref={flatListRef} 
        data={messages} 
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={{color: item.sender === 'user' ? '#000' : '#FFF', fontSize: 16, lineHeight: 22}}>
              {item.text}
            </Text>
          </View>
        )}
        keyExtractor={i => i.id} 
        contentContainerStyle={{padding: 20, paddingBottom: 20}}
      />
      
      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator color="#D4AF37" size="small" />
          <Text style={{color:'#666', marginLeft: 10, fontSize: 12}}>Pensando...</Text>
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Escribe aquí..." 
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#1C1C1E' },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  
  bubble: { padding: 15, borderRadius: 20, marginBottom: 15, maxWidth: '85%' },
  userBubble: { backgroundColor: '#D4AF37', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiBubble: { backgroundColor: '#1C1C1E', alignSelf: 'flex-start', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#333' },
  
  typingIndicator: { flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginBottom: 10 },
  
  inputContainer: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderColor: '#222', backgroundColor: '#000', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#1C1C1E', color: '#FFF', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, marginRight: 10, fontSize: 16 },
  sendBtn: { backgroundColor: '#D4AF37', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});