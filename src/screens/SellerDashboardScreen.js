import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { shopAPI, productAPI } from '../utils/api';

export default function SellerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shop Form
  const [shopForm, setShopForm] = useState({ name: '', description: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' });
  const [savingShop, setSavingShop] = useState(false);

  // Product Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', category: '', subcategory: '' });
  const [productImages, setProductImages] = useState([]); // up to 5
  const [subcategories, setSubcategories] = useState([]);
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Always load categories
      const catRes = await productAPI.getCategories();
      setCategories(catRes.data.results || catRes.data);

      // Fetch seller's own shop via dedicated endpoint
      try {
        const shopRes = await shopAPI.getMyShop();
        const shopData = shopRes.data;
        setShop(shopData);
        setShopForm(shopData);

        // Fetch products belonging to this seller using seller_id
        if (shopData.seller_id) {
          const prodRes = await productAPI.getProducts({ seller: shopData.seller_id });
          setProducts(prodRes.data.results || prodRes.data);
        }
      } catch (shopErr) {
        // 404 means seller has no shop yet
        if (shopErr.response?.status !== 404) console.error(shopErr);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShop = async () => {
    setSavingShop(true);
    try {
      if (shop) {
        const res = await shopAPI.updateShop(shop.id, shopForm);
        setShop(res.data);
        Alert.alert('Success', 'Shop details updated successfully');
      } else {
        const res = await shopAPI.createShop(shopForm);
        setShop(res.data);
        Alert.alert('Success', 'Shop created successfully');
      }
    } catch {
      Alert.alert('Error', 'Failed to save shop. Check required fields.');
    } finally {
      setSavingShop(false);
    }
  };

  const handleCategoryChange = async (catId) => {
    setProductForm(f => ({ ...f, category: String(catId), subcategory: '' }));
    setSubcategories([]);
    if (catId) {
      try {
        const res = await productAPI.getSubCategories(catId);
        setSubcategories(res.data.results || res.data);
      } catch {}
    }
  };

  const pickProductImage = async () => {
    if (productImages.length >= 5) {
      Alert.alert('Limit Reached', 'Maximum 5 images allowed per product.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - productImages.length,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newImgs = result.assets.slice(0, 5 - productImages.length);
      setProductImages(prev => [...prev, ...newImgs].slice(0, 5));
    }
  };

  const removeProductImage = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async () => {
    if (!shop) return Alert.alert('Error', 'Complete shop setup first');
    if (!productForm.name || !productForm.price || !productForm.category) return Alert.alert('Error', 'Name, price, and category are required');
    if (productImages.length === 0) return Alert.alert('Error', 'At least 1 product image is required');

    setSavingProduct(true);
    try {
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        if (productForm[key]) formData.append(key, productForm[key]);
      });
      // First image = main image field
      const makeFileObj = (asset) => {
        const uri = asset.uri;
        const filename = uri.split('/').pop();
        const ext = filename.split('.').pop();
        return { uri, name: filename, type: `image/${ext === 'jpg' ? 'jpeg' : ext}` };
      };
      formData.append('image', makeFileObj(productImages[0]));
      productImages.slice(1).forEach(asset => formData.append('images', makeFileObj(asset)));

      const res = await productAPI.createProduct(formData);
      setProducts([res.data, ...products]);
      setShowProductModal(false);
      setProductForm({ name: '', description: '', price: '', stock: '', category: '', subcategory: '' });
      setProductImages([]);
      setSubcategories([]);
      Alert.alert('Success', 'Product added successfully');
    } catch (err) {
      console.error('Error saving product:', err.response?.data || err);
      const msg = err.response?.data;
      const firstKey = msg ? Object.keys(msg)[0] : null;
      Alert.alert('Error', firstKey ? `${firstKey}: ${Array.isArray(msg[firstKey]) ? msg[firstKey][0] : msg[firstKey]}` : 'Failed to add product');
    } finally {
      setSavingProduct(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Seller Dashboard</Text>
          <Text style={styles.subtitle}>Manage your shop and products</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons name="storefront" size={18} color={activeTab === 'overview' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Shop Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons name="layers" size={18} color={activeTab === 'products' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>Products</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* SHOP SETTINGS TAB */}
        {activeTab === 'overview' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shop Information</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Shop Name</Text>
              <TextInput style={styles.input} value={shopForm.name} onChangeText={t => setShopForm({...shopForm, name: t})} />
            </View>
            
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} multiline value={shopForm.description} onChangeText={t => setShopForm({...shopForm, description: t})} />
            </View>
            
            <View style={styles.row}>
              <View style={[styles.field, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} keyboardType="phone-pad" value={shopForm.phone} onChangeText={t => setShopForm({...shopForm, phone: t})} />
              </View>
              <View style={[styles.field, {flex: 1}]}>
                <Text style={styles.label}>City/Area</Text>
                <TextInput style={styles.input} value={shopForm.city} onChangeText={t => setShopForm({...shopForm, city: t})} />
              </View>
            </View>
            
            <View style={styles.field}>
              <Text style={styles.label}>Full Address</Text>
              <TextInput style={[styles.input, {height: 60}]} multiline value={shopForm.address} onChangeText={t => setShopForm({...shopForm, address: t})} />
            </View>

            <View style={styles.idCard}>
              <View style={styles.idCardHeader}>
                <Ionicons name="finger-print" size={16} color={COLORS.primary} />
                <Text style={styles.idCardTitle}>Professional Identity</Text>
              </View>
              <Text style={styles.idCardValue} numberOfLines={1}>{shop?.shop_code || 'Unassigned'}</Text>
              <Text style={styles.idCardFooter}>Unique identifier for your business on the network</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveShop} disabled={savingShop}>
              {savingShop ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryBtnText}>Save Shop Details</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <View style={styles.card}>
            <View style={styles.flexBetween}>
              <Text style={styles.sectionTitle}>Inventory</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowProductModal(true)} disabled={!shop}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addBtnText}>New</Text>
              </TouchableOpacity>
            </View>

            {!shop ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Complete shop setup first.</Text>
              </View>
            ) : products.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="cube-outline" size={40} color={COLORS.border} />
                <Text style={styles.emptyText}>No products found.</Text>
              </View>
            ) : (
              products.map((p, idx) => (
                <View key={p.id ? String(p.id) : `${p.name}-${idx}`} style={styles.productRow}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productStats}>₹{p.price} • {p.stock} in stock</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: p.is_active !== false ? 'rgba(46,204,113,0.1)' : 'rgba(255,107,53,0.1)' }]}>
                    <Text style={[styles.statusText, { color: p.is_active !== false ? COLORS.green : COLORS.primary }]}>{p.is_active !== false ? 'ACTIVE' : 'DRAFT'}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={showProductModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowProductModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Product</Text>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <View style={styles.field}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput style={styles.input} value={productForm.name} onChangeText={t => setProductForm({...productForm, name: t})} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 5}}>
                {categories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => handleCategoryChange(c.id)}
                    style={[
                      styles.categoryChip,
                      productForm.category === String(c.id) && styles.categoryChipActive
                    ]}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      productForm.category === String(c.id) && styles.categoryChipTextActive
                    ]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {subcategories.length > 0 && (
              <View style={styles.field}>
                <Text style={styles.label}>Sub-Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 5}}>
                  {subcategories.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setProductForm(f => ({ ...f, subcategory: String(s.id) }))}
                      style={[
                        styles.categoryChip,
                        productForm.subcategory === String(s.id) && styles.categoryChipActive
                      ]}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        productForm.subcategory === String(s.id) && styles.categoryChipTextActive
                      ]}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Product Images * (1–5)</Text>
              <View style={styles.imageGrid}>
                {productImages.map((img, idx) => (
                  <View key={idx} style={styles.imageThumbWrap}>
                    <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                    {idx === 0 && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>MAIN</Text></View>}
                    <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeProductImage(idx)}>
                      <Ionicons name="close-circle" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                ))}
                {productImages.length < 5 && (
                  <TouchableOpacity style={styles.addImageTile} onPress={pickProductImage}>
                    <Ionicons name="camera-outline" size={28} color={COLORS.textMuted} />
                    <Text style={styles.addImageTileText}>{productImages.length === 0 ? 'Add Image' : 'Add More'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={[styles.field, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Price (₹) *</Text>
                <TextInput style={styles.input} keyboardType="decimal-pad" value={productForm.price} onChangeText={t => setProductForm({...productForm, price: t})} />
              </View>
              <View style={[styles.field, {flex: 1}]}>
                <Text style={styles.label}>Initial Stock</Text>
                <TextInput style={styles.input} keyboardType="number-pad" value={productForm.stock} onChangeText={t => setProductForm({...productForm, stock: t})} />
              </View>
            </View>
            
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} multiline value={productForm.description} onChangeText={t => setProductForm({...productForm, description: t})} />
            </View>

            <TouchableOpacity style={[styles.primaryBtn, {marginTop: 20}]} onPress={handleSaveProduct} disabled={savingProduct}>
              {savingProduct ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryBtnText}>Publish Product</Text>}
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15 },
  backBtn: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, marginRight: 15 },
  headerInfo: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted },

  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, marginRight: 25, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  tabTextActive: { color: COLORS.primary },

  scroll: { paddingHorizontal: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 20, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 15 },
  flexBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  row: { flexDirection: 'row' },
  field: { marginBottom: 15 },
  label: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.elevated, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 12, color: COLORS.text, fontSize: 15 },
  
  primaryBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.md, ...SHADOWS.brand },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  empty: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.textMuted, marginTop: 10, fontSize: 14 },

  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  productInfo: { flex: 1, paddingRight: 10 },
  productName: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  productStats: { fontSize: 13, color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 20 : 40, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  modalScroll: { padding: 20 },

  // Category chip selector
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.elevated, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8 },
  categoryChipActive: { backgroundColor: 'rgba(255,107,53,0.15)', borderColor: COLORS.primary },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  categoryChipTextActive: { color: COLORS.primary },

  // Image picker (legacy, kept for reference)
  imagePicker: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, borderStyle: 'dashed', overflow: 'hidden' },
  imagePickerPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  imagePickerText: { color: COLORS.textMuted, marginTop: 8, fontSize: 13 },
  imagePreview: { width: '100%', height: 200, resizeMode: 'cover' },

  // Multi-image grid
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageThumbWrap: { width: 80, height: 80, borderRadius: RADIUS.md, overflow: 'hidden', position: 'relative' },
  imageThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  mainBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(46,204,113,0.85)', paddingVertical: 2, alignItems: 'center' },
  mainBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  removeImgBtn: { position: 'absolute', top: 2, right: 2 },
  addImageTile: { width: 80, height: 80, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.elevated },
  addImageTileText: { color: COLORS.textMuted, fontSize: 10, marginTop: 4, fontWeight: '600' },

  // ID Card
  idCard: { backgroundColor: COLORS.elevated, borderRadius: RADIUS.md, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  idCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  idCardTitle: { color: COLORS.primary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  idCardValue: { color: COLORS.text, fontSize: 14, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  idCardFooter: { color: COLORS.textDim, fontSize: 10, marginTop: 4, fontStyle: 'italic' },
});
