import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../constants';

const { width } = Dimensions.get('window');

export default function SectorDetailScreen({ route, navigation }) {
  const { sector } = route.params;

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerLabel}>SECTOR</Text>
          <Text style={styles.title}>{sector.name}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: sector.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80' }} 
          style={styles.banner} 
        />
        
        <View style={styles.infoCard}>
          <Text style={styles.description}>
            {sector.description || `Explore top-rated local shops and services in the ${sector.name} sector. Supporting your local economy while getting the best quality.`}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="layers" size={14} color={COLORS.primary} />
            <Text style={styles.sectionLabel}>SUB-CATEGORIES</Text>
          </View>
          
          <View style={styles.grid}>
            {sector.subcategories?.map((sub, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.subCard}
                onPress={() => navigation.navigate('Subcategory', { subcategory: sub, sectorName: sector.name })}
              >
                <Image source={{ uri: sub.image }} style={styles.subImage} />
                <View style={styles.subOverlay} />
                <Text style={styles.subText}>{sub.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  headerInfo: { marginLeft: 15 },
  headerLabel: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },

  banner: { width: '100%', height: 180 },
  infoCard: { 
    backgroundColor: COLORS.card, 
    margin: 20, 
    marginTop: -25, 
    borderRadius: RADIUS.lg, 
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md
  },
  description: { color: COLORS.text, fontSize: 14, lineHeight: 22 },

  section: { paddingHorizontal: 20 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 },
  sectionLabel: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  subCard: { 
    width: (width - 52) / 2, 
    height: 100, 
    borderRadius: RADIUS.md, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  subImage: { width: '100%', height: '100%', position: 'absolute' },
  subOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  subText: { color: '#fff', fontSize: 14, fontWeight: '800', textAlign: 'center', position: 'absolute', bottom: 10, left: 10, right: 10 }
});
