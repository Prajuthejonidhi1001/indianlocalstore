import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Modal, Platform, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { shopAPI, productAPI } from '../utils/api';

export default function SellerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [shopForm, setShopForm] = useState({ name: '', description: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', is_open: true, online_delivery_enabled: false, gst_number: '' });
  const [shopLogo, setShopLogo] = useState(null);
  const [shopBanner, setShopBanner] = useState(null);
  const [savingShop, setSavingShop] = useState(false);
  const [fetchingPin, setFetchingPin] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', gst_rate: '0' });
  const [productVariants, setProductVariants] = useState({ sizes: [], colors: [] });
  const [productImages, setProductImages] = useState([]);
  const [savingProduct, setSavingProduct] = useState(false);

  const [allCategories, setAllCategories] = useState([]);
  const [allSubcats, setAllSubcats] = useState({});
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedSubcats, setSelectedSubcats] = useState([]);
  const [catsLocked, setCatsLocked] = useState(false);
  const [savingCats, setSavingCats] = useState(false);

  const categoryName = allCategories.find(c => c.id === shop?.category)?.name || '';
  const isClothing = categoryName.toLowerCase().includes('clothing') || categoryName.toLowerCase().includes('fashion');
  const isFootwear = categoryName.toLowerCase().includes('footwear') || categoryName.toLowerCase().includes('shoes');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const catRes = await productAPI.getCategories();
      const cats = catRes.data.results || catRes.data;
      setAllCategories(cats);

      try {
        const shopRes = await shopAPI.getMyShop();
        const shopData = shopRes.data;
        setShop(shopData);
        setShopForm({ ...shopData, is_open: shopData.is_open ?? true, online_delivery_enabled: shopData.online_delivery_enabled || false });

        if (shopData.categories?.length > 0) {
          setSelectedCats(shopData.categories.map(c => c.id || c));
          setCatsLocked(true);
        }
        if (shopData.subcategories?.length > 0) {
          setSelectedSubcats(shopData.subcategories.map(s => s.id || s));
        }

        const prodRes = await productAPI.getMyProducts();
        setProducts(prodRes.data.results || prodRes.data);
      } catch (shopErr) {
        if (shopErr.response?.status !== 404) console.error(shopErr);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeChange = async (pin) => {
    setShopForm(prev => ({ ...prev, pincode: pin }));
    if (pin.length === 6) {
      setFetchingPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
          const postOffice = data[0].PostOffice[0];
          setShopForm(prev => ({ ...prev, city: postOffice.District, state: postOffice.State }));
        }
      } catch (e) {
        console.log('Failed to fetch pincode', e);
      } finally {
        setFetchingPin(false);
      }
    }
  };


  const handleSaveShop = async () => {
    if (!shopForm.name || !shopForm.phone || !shopForm.address || !shopForm.pincode) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setSavingShop(true);
    try {
      const formData = new FormData();
      Object.keys(shopForm).forEach(key => {
        if (shopForm[key] !== null && shopForm[key] !== undefined) {
          formData.append(key, shopForm[key]);
        }
      });
      if (shopLogo) {
        formData.append('logo', {
          uri: shopLogo.uri,
          name: 'logo.jpg',
          type: 'image/jpeg',
        });
      }
      if (shopBanner) {
        formData.append('banner', {
          uri: shopBanner.uri,
          name: 'banner.jpg',
          type: 'image/jpeg',
        });
      }

      const isUpdate = !!shop?.id;
      const res = isUpdate 
        ? await shopAPI.updateShop(shop.id, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await shopAPI.createShop(formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      setShop(res.data);
      Alert.alert('Success', isUpdate ? 'Shop details updated successfully' : 'Shop created successfully');
    } catch (err) {
      console.log('Error saving shop:', err);
      Alert.alert('Error', 'Failed to save shop. Check required fields.');
    } finally {
      setSavingShop(false);
    }
  };

  const pickShopImage = async (type) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'banner' ? [16, 9] : [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      if (type === 'banner') setShopBanner(result.assets[0]);
      if (type === 'logo') setShopLogo(result.assets[0]);
    }
  };

  const handleCatToggle = async (catId) => {
    if (catsLocked) return;
    const newSel = selectedCats.includes(catId) ? selectedCats.filter(id => id !== catId) : [...selectedCats, catId];
    setSelectedCats(newSel);
    if (!allSubcats[catId]) {
      try {
        const res = await productAPI.getSubCategories(catId);
        setAllSubcats(prev => ({ ...prev, [catId]: res.data.results || res.data }));
      } catch {}
    }
    if (selectedCats.includes(catId)) {
      const toRemove = (allSubcats[catId] || []).map(s => s.id);
      setSelectedSubcats(prev => prev.filter(id => !toRemove.includes(id)));
    }
  };

  const handleSubcatToggle = (subcatId) => {
    if (catsLocked) return;
    setSelectedSubcats(prev => prev.includes(subcatId) ? prev.filter(id => id !== subcatId) : [...prev, subcatId]);
  };

  const handleSaveCats = async () => {
    if (!shop) return Alert.alert('Error', 'Complete shop setup first');
    if (selectedCats.length === 0) return Alert.alert('Error', 'Select at least one category');
    setSavingCats(true);
    try {
      await shopAPI.updateShop(shop.id, { categories: selectedCats, subcategories: selectedSubcats });
      setCatsLocked(true);
      Alert.alert('Saved', 'Categories locked.');
    } catch {
      Alert.alert('Error', 'Failed to save categories');
    } finally {
      setSavingCats(false);
    }
  };

  const pickProductImage = async () => {
    if (productImages.length >= 5) return Alert.alert('Limit Reached', 'Max 5 images allowed');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied', 'Camera roll access required.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, selectionLimit: 5 - productImages.length, quality: 0.8 });
    if (!result.canceled) {
      const newImgs = result.assets.slice(0, 5 - productImages.length);
      setProductImages(prev => [...prev, ...newImgs].slice(0, 5));
    }
  };

  const removeProductImage = (index) => setProductImages(prev => prev.filter((_, i) => i !== index));

  const handleSaveProduct = async () => {
    if (!shop) return Alert.alert('Error', 'Complete shop setup first');
    if (!productForm.name || !productForm.price) return Alert.alert('Error', 'Name and price required');
    if (productImages.length === 0) return Alert.alert('Error', 'At least 1 product image required');

    setSavingProduct(true);
    try {
      const formData = new FormData();
      Object.keys(productForm).forEach(key => { if (productForm[key]) formData.append(key, productForm[key]); });
      if (productVariants.sizes.length > 0 || productVariants.colors.length > 0) {
        const variantsArr = [];
        if (productVariants.sizes.length > 0) variantsArr.push({ type: 'Size', values: productVariants.sizes });
        if (productVariants.colors.length > 0) variantsArr.push({ type: 'Color', values: productVariants.colors });
        formData.append('variants', JSON.stringify(variantsArr));
      }
      const makeFileObj = (asset) => {
        const uri = asset.uri;
        const filename = uri.split('/').pop();
        const ext = filename.split('.').pop();
        return { uri, name: filename, type: "image/" };
      };
      formData.append('image', makeFileObj(productImages[0]));
      productImages.slice(1).forEach(asset => formData.append('images', makeFileObj(asset)));

      await productAPI.createProduct(formData);
      const prodRes = await productAPI.getMyProducts();
      setProducts(prodRes.data.results || prodRes.data);
      setShowProductModal(false);
      setProductForm({ name: '', description: '', price: '', stock: '', gst_rate: '0' });
      setProductImages([]);
      setProductVariants({ sizes: [], colors: [] });
      Alert.alert('Success', 'Product added!');
    } catch (err) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setSavingProduct(false);
    }
  };

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const menuItems = [
    { name: 'Dashboard', icon: 'grid-outline' },
    { name: 'Inventory', icon: 'cube-outline' },
    { name: 'Orders', icon: 'receipt-outline' },
    { name: 'Financials', icon: 'wallet-outline' },
    { name: 'Customer Reviews', icon: 'star-outline' },
    { name: 'Marketing', icon: 'megaphone-outline' },
    { name: 'Shop Settings', icon: 'settings-outline' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Exact Header matching website */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.badgesWrap}>
            <View style={styles.hexBadge}><Text style={styles.hexText}># 1B7F79E9</Text></View>
            <View style={styles.statusBadge}><Text style={styles.statusText}>Open</Text></View>
            <View style={styles.unverifiedBadge}><Text style={styles.unverifiedText}>UNVERIFIED</Text></View>
          </View>
        </View>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your shop, products, and catalog</Text>
      </View>

      {/* Horizontal Nav mimicking Website Sidebar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScroll} contentContainerStyle={styles.navContainer}>
        {menuItems.map(item => {
          const isActive = activeTab === item.name;
          return (
            <TouchableOpacity key={item.name} style={[styles.navItem, isActive && styles.navItemActive]} onPress={() => setActiveTab(item.name)}>
              <Ionicons name={item.icon} size={18} color={isActive ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          )
        })}
              {showProductModal && (
          <Modal visible={true} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowProductModal(false)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
              <View style={[styles.header, { paddingBottom: 10 }]}>
                <View style={styles.flexBetween}>
                  <Text style={styles.headerTitle}>{productForm.id ? 'Edit Product' : 'Add Product'}</Text>
                  <TouchableOpacity onPress={() => setShowProductModal(false)}>
                    <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={{ padding: 20 }}>
                {activeProductTab === 'basic' && (
                  <View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Product Name *</Text>
                      <TextInput style={styles.input} value={productForm.name} onChangeText={t => setProductForm({...productForm, name: t})} placeholder="e.g. Premium Cotton T-Shirt" />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Description *</Text>
                      <TextInput style={styles.input} value={productForm.description} onChangeText={t => setProductForm({...productForm, description: t})} placeholder="Describe your product in detail..." multiline numberOfLines={4} style={[styles.input, { height: 100 }]} />
                    </View>
                  </View>
                )}

                {activeProductTab === 'pricing' && (
                  <View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Price (₹) *</Text>
                      <TextInput style={styles.input} value={productForm.price} onChangeText={t => setProductForm({...productForm, price: t})} placeholder="0.00" keyboardType="numeric" />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Discount Price (₹)</Text>
                      </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>GST Rate (%)</Text>
                      <TextInput style={styles.input} value={productForm.gst_rate} onChangeText={t => setProductForm({...productForm, gst_rate: t})} placeholder="18.00" keyboardType="numeric" />
                      <TextInput style={styles.input} value={productForm.discount_price} onChangeText={t => setProductForm({...productForm, discount_price: t})} placeholder="0.00" keyboardType="numeric" />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Available Stock *</Text>
                      <TextInput style={styles.input} value={productForm.stock} onChangeText={t => setProductForm({...productForm, stock: t})} placeholder="100" keyboardType="numeric" />
                    </View>
                  </View>
                )}

                {activeProductTab === 'media' && (
                  <View>
                    <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                      <Ionicons name="image-outline" size={32} color={COLORS.primary} />
                      <Text style={styles.imagePickerText}>Select Product Image *</Text>
                    </TouchableOpacity>
                    {productImages.length > 0 && (
                      <Image source={{ uri: productImages[0] }} style={{ width: 100, height: 100, borderRadius: 8, marginTop: 16 }} />
                    )}
                  </View>
                )}

                {activeProductTab === 'variants' && (
                  <View>
                    <Text style={styles.label}>Product Options (Optional)</Text>
                    <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>
                      Currently, please use the website to manage complex variants like size and color.
                    </Text>
                  </View>
                )}

                <View style={{ height: 100 }} />
              </ScrollView>

              <View style={styles.modalFooter}>
                {activeProductTab === 'basic' && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveProductTab('pricing')}>
                    <Text style={styles.nextBtnText}>Next: Pricing</Text>
                  </TouchableOpacity>
                )}
                {activeProductTab === 'pricing' && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveProductTab('media')}>
                    <Text style={styles.nextBtnText}>Next: Media</Text>
                  </TouchableOpacity>
                )}
                {activeProductTab === 'media' && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveProductTab('variants')}>
                    <Text style={styles.nextBtnText}>Next: Variants</Text>
                  </TouchableOpacity>
                )}
                {activeProductTab === 'variants' && (
                  <TouchableOpacity style={styles.submitBtn} onPress={handleSaveProduct} disabled={savingProduct}>
                    {savingProduct ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{productForm.id ? 'Update Product' : 'Publish Product'}</Text>}
                  </TouchableOpacity>
                )}
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </ScrollView>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.content}>
        
        {activeTab === 'Dashboard' && (
          <View>
            <Text style={styles.sectionTitle}>Dashboard Overview</Text>
            <Text style={styles.sectionSub}>Track your shop's performance and recent activity</Text>

            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricIcon}><Ionicons name="trending-up" size={16} color={COLORS.green} /></View>
                <View>
                  <Text style={styles.metricLabel}>TOTAL REVENUE</Text>
                  <Text style={styles.metricValue}>?0.00</Text>
                </View>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: 'rgba(255₹07,53,0.1)' }]}><Ionicons name="cube" size={16} color={COLORS.primary} /></View>
                <View>
                  <Text style={styles.metricLabel}>TOTAL ORDERS</Text>
                  <Text style={styles.metricValue}>0</Text>
                </View>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: 'rgba(255₹07,53,0.1)' }]}><Ionicons name="cube-outline" size={16} color={COLORS.primary} /></View>
                <View>
                  <Text style={styles.metricLabel}>ACTIVE PRODUCTS</Text>
                  <Text style={styles.metricValue}>{products.length}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionGrid}>
              <View style={[styles.actionCard, { flex: 1 }]}>
                <Text style={styles.cardHeader}>Action Required <Ionicons name="warning-outline" size={14} color={COLORS.red} /></Text>
                <Text style={styles.cardText}>No urgent alerts at this time.</Text>
                <View style={styles.cardDivider} />
                <View style={styles.flexBetween}>
                  <Text style={styles.cardText}>Account Verification</Text>
                  <Text style={[styles.cardText, { fontWeight: '700' }]}>Pending</Text>
                </View>
              </View>

              <View style={[styles.actionCard, { flex: 1 }]}>
                <Text style={styles.cardHeader}>7-Day Revenue Trend</Text>
                <View style={styles.chartMock}>
                  {[30, 70, 50, 90, 80, 40, 60].map((h, i) => <View key={i} style={[styles.chartBar, { height: `${h}%` }]} />)}
                </View>
                <View style={styles.chartLabels}>
                  {['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'].map(d => <Text key={d} style={styles.chartLabel}>{d}</Text>)}
                </View>
              </View>
            </View>

            <View style={styles.actionCard}>
              <Text style={styles.cardHeader}>Quick Actions</Text>
              <TouchableOpacity style={styles.quickBtn} onPress={() => { setActiveTab('Inventory'); setShowProductModal(true); }}>
                <Ionicons name="add" size={18} color={COLORS.text} />
                <Text style={styles.quickBtnText}>Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn}>
                <Ionicons name="cube-outline" size={18} color={COLORS.text} />
                <Text style={styles.quickBtnText}>Manage Shipments</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn}>
                <Ionicons name="star-outline" size={18} color={COLORS.text} />
                <Text style={styles.quickBtnText}>Create Promotion</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        {activeTab === 'Inventory' && (
          <View>
            <View style={[styles.flexBetween, { marginBottom: 20 }]}>
              <Text style={styles.sectionTitle}>Inventory</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowProductModal(true)}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addBtnText}>Add Product</Text>
              </TouchableOpacity>
            </View>
            
            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color={COLORS.borderStrong} />
                <Text style={styles.emptyTitle}>No products yet</Text>
                <Text style={styles.emptySub}>Start adding products to your catalog to sell.</Text>
              </View>
            ) : (
              products.map(p => (
                <View key={p.id} style={styles.productRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productStats}>Ã¢â€šÂ¹{typeof p.price === 'object' && p.price !== null ? (p.price.price || p.price.Size || 0) : p.price} Ã¢â‚¬Â¢ {p.stock} in stock</Text>
                  </View>
                  <View style={[styles.badge, p.is_active ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={[styles.badgeText, p.is_active ? styles.badgeTextActive : styles.badgeTextInactive]}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'Shop Settings' && (
          <View>
            <Text style={styles.sectionTitle}>Shop Settings</Text>
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Shop Name</Text>
                <TextInput style={styles.input} value={shopForm.name} onChangeText={t => setShopForm({...shopForm, name: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>GST Number (Optional)</Text>
                <TextInput style={styles.input} value={shopForm.gst_number} onChangeText={t => setShopForm({...shopForm, gst_number: t})} placeholder="e.g. 22AAAAA0000A1Z5" autoCapitalize="characters" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={styles.input} value={shopForm.description} onChangeText={t => setShopForm({...shopForm, description: t})} multiline />
              </View>
                            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={shopForm.phone} onChangeText={t => setShopForm({...shopForm, phone: t})} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Shop Address</Text>
                <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline value={shopForm.address} onChangeText={t => setShopForm({...shopForm, address: t})} />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Text style={[styles.label, { marginBottom: 0 }]}>Pincode</Text>
                    {fetchingPin && <ActivityIndicator size="small" color={COLORS.primary} />}
                  </View>
                  <TextInput style={styles.input} value={shopForm.pincode} onChangeText={handlePincodeChange} keyboardType="number-pad" maxLength={6} placeholder="123456" />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>City/District</Text>
                  <TextInput style={styles.input} value={shopForm.city} onChangeText={t => setShopForm({...shopForm, city: t})} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>State</Text>
                  <TextInput style={styles.input} value={shopForm.state} onChangeText={t => setShopForm({...shopForm, state: t})} />
                </View>
              </View>

              <View style={styles.togglesRow}>
                <View style={styles.toggleItem}>
                  <Text style={styles.toggleLabel}>Shop Open</Text>
                  <Switch value={shopForm.is_open} onValueChange={v => setShopForm({...shopForm, is_open: v})} trackColor={{ true: COLORS.primary }} />
                </View>
                <View style={styles.toggleItem}>
                  <Text style={styles.toggleLabel}>Online Delivery</Text>
                  <Switch value={shopForm.online_delivery_enabled} onValueChange={v => { if (v && !shopForm.gst_number) { Alert.alert('GST Required', 'Please enter your GST number to enable Online Delivery.'); setShopForm({...shopForm, online_delivery_enabled: false}); } else { setShopForm({...shopForm, online_delivery_enabled: v}); } }} trackColor={{ true: COLORS.primary }} />
                </View>
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveShop} disabled={savingShop}>
                {savingShop ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Settings</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

              {showProductModal && (
          <Modal visible={true} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowProductModal(false)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
              <View style={[styles.header, { paddingBottom: 10 }]}>
                <View style={styles.flexBetween}>
                  <Text style={styles.headerTitle}>{productForm.id ? 'Edit Product' : 'Add Product'}</Text>
                  <TouchableOpacity onPress={() => setShowProductModal(false)}>
                    <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={{ padding: 20 }}>
                {activeProductTab === 'basic' && (
                  <View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Product Name *</Text>
                      <TextInput style={styles.input} value={productForm.name} onChangeText={t => setProductForm({...productForm, name: t})} placeholder="e.g. Premium Cotton T-Shirt" />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Description *</Text>
                      <TextInput style={styles.input} value={productForm.description} onChangeText={t => setProductForm({...productForm, description: t})} placeholder="Describe your product in detail..." multiline numberOfLines={4} style={[styles.input, { height: 100 }]} />
                    </View>
                  </View>
                )}

                {activeProductTab === 'pricing' && (
                  <View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Price (₹) *</Text>
                      <TextInput style={styles.input} value={productForm.price} onChangeText={t => setProductForm({...productForm, price: t})} placeholder="0.00" keyboardType="numeric" />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Discount Price (₹)</Text>
                      </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>GST Rate (%)</Text>
                      <TextInput style={styles.input} value={productForm.gst_rate} onChangeText={t => setProductForm({...productForm, gst_rate: t})} placeholder="18.00" keyboardType="numeric" />
                      <TextInput style={styles.input} value={productForm.discount_price} onChangeText={t => setProductForm({...productForm, discount_price: t})} placeholder="0.00" keyboardType="numeric" />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Available Stock *</Text>
                      <TextInput style={styles.input} value={productForm.stock} onChangeText={t => setProductForm({...productForm, stock: t})} placeholder="100" keyboardType="numeric" />
                    </View>
                  </View>
                )}

                {activeProductTab === 'media' && (
                  <View>
                    <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                      <Ionicons name="image-outline" size={32} color={COLORS.primary} />
                      <Text style={styles.imagePickerText}>Select Product Image *</Text>
                    </TouchableOpacity>
                    {productImages.length > 0 && (
                      <Image source={{ uri: productImages[0] }} style={{ width: 100, height: 100, borderRadius: 8, marginTop: 16 }} />
                    )}
                  </View>
                )}

                {activeProductTab === 'variants' && (
                  <View>
                    <Text style={styles.label}>Product Options (Optional)</Text>
                    <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>
                      Currently, please use the website to manage complex variants like size and color.
                    </Text>
                  </View>
                )}

                <View style={{ height: 100 }} />
              </ScrollView>

              <View style={styles.modalFooter}>
                {activeProductTab === 'basic' && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveProductTab('pricing')}>
                    <Text style={styles.nextBtnText}>Next: Pricing</Text>
                  </TouchableOpacity>
                )}
                {activeProductTab === 'pricing' && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveProductTab('media')}>
                    <Text style={styles.nextBtnText}>Next: Media</Text>
                  </TouchableOpacity>
                )}
                {activeProductTab === 'media' && (
                  <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveProductTab('variants')}>
                    <Text style={styles.nextBtnText}>Next: Variants</Text>
                  </TouchableOpacity>
                )}
                {activeProductTab === 'variants' && (
                  <TouchableOpacity style={styles.submitBtn} onPress={handleSaveProduct} disabled={savingProduct}>
                    {savingProduct ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{productForm.id ? 'Update Product' : 'Publish Product'}</Text>}
                  </TouchableOpacity>
                )}
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  // Header
  header: { padding: 24, paddingBottom: 16, backgroundColor: COLORS.background },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { padding: 8, marginLeft: -8 },
  badgesWrap: { flexDirection: 'row', gap: 8 },
  hexBadge: { backgroundColor: 'rgba(231,76,60,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  hexText: { color: COLORS.red, fontSize: 10, fontWeight: '800' },
  statusBadge: { backgroundColor: 'rgba(46,204₹13,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(46,204₹13,0.3)' },
  statusText: { color: COLORS.green, fontSize: 10, fontWeight: '800' },
  unverifiedBadge: { backgroundColor: 'rgba(255₹07,53,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(255₹07,53,0.3)' },
  unverifiedText: { color: COLORS.primary, fontSize: 10, fontWeight: '800' },
  
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
  headerSubtitle: { color: COLORS.textMuted, fontSize: 15, fontWeight: '500' },

  // Nav
  navScroll: { maxHeight: 54, minHeight: 54, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#fff' },
  navContainer: { paddingHorizontal: 20, alignItems: 'center', gap: 8 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: 'transparent' },
  navItemActive: { backgroundColor: 'rgba(255₹07,53,0.1)' },
  navText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  navTextActive: { color: COLORS.primary, fontWeight: '800' },

  // Content
  content: { padding: 24, paddingBottom: 60 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginBottom: 6, letterSpacing: -0.5 },
  sectionSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24, fontWeight: '500' },

  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  metricCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  metricIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(46,204₹13,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  metricLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, marginBottom: 4, letterSpacing: 0.5 },
  metricValue: { fontSize: 24, fontWeight: '900', color: COLORS.text },

  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: 12 },
  cardHeader: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  cardText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  flexBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  chartMock: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, marginBottom: 8 },
  chartBar: { width: '10%', backgroundColor: COLORS.primary, borderRadius: 4 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chartLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '700' },

  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  quickBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.text },

  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  emptyState: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  productRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  productName: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  productStats: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  badgeActive: { backgroundColor: 'rgba(46,204₹13,0.1)' },
  badgeInactive: { backgroundColor: 'rgba(231,76,60,0.1)' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  badgeTextActive: { color: COLORS.green },
  badgeTextInactive: { color: COLORS.red },

  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.elevated, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  togglesRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  toggleItem: { flex: 1, alignItems: 'center' },
  toggleLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  saveBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: RADIUS.lg, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});















