import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';

const FAQ_KNOWLEDGE = {
  order: "You can track your order by going to the 'My Orders' section in your profile.",
  track: "You can track your order by going to the 'My Orders' section in your profile.",
  return: "We offer a 7-day hassle-free return policy. Contact support for assistance.",
  refund: "Refunds are processed within 3-5 business days after return approval.",
  cod: "Yes, we support Cash on Delivery (COD) on all eligible orders.",
  cash: "Yes, Cash on Delivery is available.",
  payment: "We currently support Cash on Delivery. Online payments are coming soon!",
  delivery: "Orders are usually delivered within 24-48 hours depending on your location.",
  shipping: "Delivery is completely free on all orders!"
};

const DEFAULT_REPLY = "I'm still learning! For detailed help, please contact our support team directly.";

export default function ChatbotModal({ visible, onClose }) {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi there! 👋 Welcome to Indian Local Store. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  const handleSend = () => {
    const query = input.trim().toLowerCase();
    if (!query) return;

    setMessages(prev => [...prev, { type: 'user', text: input }]);
    setInput('');

    setTimeout(() => {
      let reply = '';
      for (const [key, answer] of Object.entries(FAQ_KNOWLEDGE)) {
        if (query.includes(key)) {
          reply = answer;
          break;
        }
      }
      if (!reply) reply = DEFAULT_REPLY;

      setMessages(prev => [...prev, { type: 'bot', text: reply }]);
    }, 600);
  };

  const showSupportActions = messages.some(m => m.text === DEFAULT_REPLY);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
        <View style={styles.chatWindow}>
          
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Ionicons name="chatbubbles" size={24} color="#fff" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerTitle}>Support Bot</Text>
                <Text style={styles.headerSub}>Typically replies instantly</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollRef}
            contentContainerStyle={styles.body}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg, idx) => (
              <View key={idx} style={[styles.bubbleContainer, msg.type === 'bot' ? styles.botBubbleContainer : styles.userBubbleContainer]}>
                <View style={[styles.bubble, msg.type === 'bot' ? styles.botBubble : styles.userBubble]}>
                  <Text style={[styles.bubbleText, msg.type === 'bot' ? styles.botText : styles.userText]}>{msg.text}</Text>
                </View>
              </View>
            ))}

            {showSupportActions && (
              <View style={styles.actionsBox}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3498db' }]} onPress={() => Linking.openURL('tel:+919876543210')}>
                  <Ionicons name="call" size={16} color="#fff" />
                  <Text style={styles.actionText}>Call Us</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL('whatsapp://send?phone=+919876543210')}>
                  <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                  <Text style={styles.actionText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TextInput
              style={styles.input}
              placeholder="Type your question..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !input.trim() && { backgroundColor: COLORS.border }]} 
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  chatWindow: {
    backgroundColor: COLORS.background,
    height: '80%',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  closeBtn: { padding: 4 },
  
  body: { padding: 16, paddingBottom: 20 },
  bubbleContainer: { marginBottom: 12, maxWidth: '85%' },
  botBubbleContainer: { alignSelf: 'flex-start' },
  userBubbleContainer: { alignSelf: 'flex-end' },
  bubble: { padding: 12, borderRadius: 16 },
  botBubble: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  botText: { color: COLORS.text },
  userText: { color: '#fff' },

  actionsBox: { flexDirection: 'row', gap: 10, marginTop: 10, alignSelf: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 20, borderRadius: RADIUS.md },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  footer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  }
});
