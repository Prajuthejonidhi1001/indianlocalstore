import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';

const FAQS = [
  { q: "How do I track my order?", a: "Go to the 'Orders' tab to view real-time tracking for your active orders." },
  { q: "What is the return policy?", a: "We offer a 7-day hassle-free return policy for unused products in their original packaging." },
  { q: "How do I apply a promo code?", a: "During checkout or on the cart page, enter your promo code in the 'Promo Code' box and tap Apply." },
  { q: "Do you offer Cash on Delivery?", a: "Yes! You can choose Cash on Delivery (COD) as a payment option during checkout." },
];

export default function SupportScreen({ navigation }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const contactSupport = (method) => {
    if (method === 'email') Linking.openURL('mailto:support@indianlocalstore.com');
    if (method === 'phone') Linking.openURL('tel:+919686068979');
    if (method === 'whatsapp') Linking.openURL('whatsapp://send?phone=+919686068979&text=Hi,%20I%20need%20help');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactGrid}>
          <TouchableOpacity style={styles.contactCard} onPress={() => contactSupport('whatsapp')}>
            <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
            <Text style={styles.contactText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard} onPress={() => contactSupport('phone')}>
            <Ionicons name="call-outline" size={32} color={COLORS.primary} />
            <Text style={styles.contactText}>Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard} onPress={() => contactSupport('email')}>
            <Ionicons name="mail-outline" size={32} color={COLORS.secondary} />
            <Text style={styles.contactText}>Email</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <TouchableOpacity key={idx} style={styles.faqCard} onPress={() => setExpandedIndex(isExpanded ? null : idx)} activeOpacity={0.7}>
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textMuted} />
                </View>
                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqA}>{faq.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, marginRight: 15 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  scroll: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 15, marginTop: 10 },
  
  contactGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  contactCard: { flex: 1, backgroundColor: COLORS.card, padding: 20, borderRadius: RADIUS.lg, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  contactText: { marginTop: 10, fontSize: 13, fontWeight: '700', color: COLORS.text },

  faqList: { gap: 10 },
  faqCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  faqQ: { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 10 },
  faqBody: { padding: 16, paddingTop: 0, backgroundColor: 'rgba(255₹07,53,0.03)' },
  faqA: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
});


