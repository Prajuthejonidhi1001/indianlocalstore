import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { INDIA_DATA } from '../utils/indiaData';
import { useLocation } from '../context/LocationContext';

const INDIAN_STATES = Object.keys(INDIA_DATA).sort();

export default function LocationPickerScreen({ navigation }) {
  const { setLocation } = useLocation();
  const [step, setStep] = useState(1); // 1: State, 2: District, 3: City
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cityQuery.length >= 2) {
      const timer = setTimeout(() => {
        searchArea();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setCitySuggestions([]);
    }
  }, [cityQuery]);

  const searchArea = async () => {
    setLoading(true);
    try {
      const isPincode = /^\d{6}$/.test(cityQuery.trim());
      const url = isPincode
        ? `https://api.postalpincode.in/pincode/${cityQuery.trim()}`
        : `https://api.postalpincode.in/postoffice/${encodeURIComponent(cityQuery.trim())}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data?.[0]?.Status === 'Success') {
        let filtered = data[0].PostOffice;
        if (selectedDistrict) {
          filtered = filtered.filter(p => 
            p.District.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
            selectedDistrict.toLowerCase().includes(p.District.toLowerCase())
          );
        }
        
        const seen = new Set();
        const unique = [];
        filtered.forEach(p => {
          const key = `${p.Name}-${p.Pincode}`;
          if (!seen.has(key)) { seen.add(key); unique.push(p); }
        });
        setCitySuggestions(unique.slice(0, 10));
      } else {
        setCitySuggestions([]);
      }
    } catch (e) {
      console.error('Area Search Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectState = (state) => {
    setSelectedState(state);
    setStep(2);
  };

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setStep(3);
  };

  const handleSelectFinal = (item) => {
    setLocation({
      name: item.Name,
      district: item.District,
      state: item.State,
      pincode: item.Pincode
    });
    navigation.goBack();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {step === 1 ? 'Select State' : step === 2 ? 'Select District' : 'Search City/Village'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {step === 1 && (
        <FlatList
          data={INDIAN_STATES}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => handleSelectState(item)}>
              <Text style={styles.listItemText}>{item}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {step === 2 && (
        <FlatList
          data={INDIA_DATA[selectedState] || []}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => handleSelectDistrict(item)}>
              <Text style={styles.listItemText}>{item}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {step === 3 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrap}>
            <TextInput
              autoFocus
              placeholder="Type village name or pincode..."
              placeholderTextColor={COLORS.textMuted}
              value={cityQuery}
              onChangeText={setCityQuery}
              style={styles.input}
            />
            {loading && <ActivityIndicator color={COLORS.primary} size="small" />}
          </View>
          
          <FlatList
            data={citySuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cityCard} onPress={() => handleSelectFinal(item)}>
                <View style={styles.cityIcon}>
                  <Ionicons name="location" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.cityName}>{item.Name}</Text>
                  <Text style={styles.citySub}>{item.District}, {item.Pincode}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              cityQuery.length >= 2 && !loading && (
                <Text style={styles.emptyText}>No results found for "{cityQuery}" in {selectedDistrict}</Text>
              )
            )}
            contentContainerStyle={styles.cityList}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  
  list: { paddingHorizontal: 10 },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  listItemText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  
  searchContainer: { flex: 1, padding: 20 },
  searchInputWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20
  },
  input: { flex: 1, color: COLORS.text, fontSize: 16 },
  
  cityList: { gap: 12 },
  cityCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    padding: 15, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  cityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,107,53,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cityName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  citySub: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40 }
});
