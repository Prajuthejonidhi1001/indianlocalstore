import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS, RADIUS } from '../constants';

const { width, height } = Dimensions.get('window');

function generateHistogram(reviews) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let total = reviews?.length || 0;
  reviews?.forEach(r => {
    if (counts[r.rating] !== undefined) counts[r.rating]++;
  });
  return { counts, total };
}

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const { user, toggleWishlist, getWishlist } = useAuth();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [wishlist, setWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('desc');

  const reviews = product.product_reviews || [];
  const { counts: histCounts, total: histTotal } = generateHistogram(reviews);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const wishlistItems = await getWishlist();
        const wishlistProductIds = wishlistItems.map(item => item.product);
        setWishlist(wishlistProductIds.includes(product.id));
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    };
    fetchWishlist();
  }, [user, product.id]);

  const price = parseFloat(product.price || 0);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const discount = discountPrice ? Math.round((1 - discountPrice / price) * 100) : 0;

  const images = product.images?.length > 0
    ? product.images.map(i => i.image || i)
    : product.image
    ? [product.image]
    : [];

  const handleAddToCart = async () => {
    if (product.variants && product.variants.length > 0) {
      const requiredTypes = product.variants.map(v => v.type);
      const selectedKeys = Object.keys(selectedVariants);
      const missing = requiredTypes.filter(t => !selectedKeys.includes(t));
      if (missing.length > 0) {
        alert(`Please select: ${missing.join(', ')}`);
        return;
      }
    }
    await addToCart(product.id, quantity, selectedVariants);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const AccordionItem = ({ id, title, children }) => {
    const isOpen = activeAccordion === id;
    return (
      <View style={styles.accordionWrap}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => setActiveAccordion(isOpen ? null : id)}>
          <Text style={styles.accordionTitle}>{title}</Text>
          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        {isOpen && <View style={styles.accordionContent}>{children}</View>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Modal visible={imageModalVisible} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setImageModalVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: images[activeImage] }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Gallery */}
        <View style={styles.gallery}>
          <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
            <Image source={{ uri: images[activeImage] || 'https://placehold.co/600x600/131920/FFF?text=No+Image' }} style={styles.mainImage} resizeMode="cover" />
          </TouchableOpacity>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.roundActionBtn}>
              <Ionicons name="share-social" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundActionBtn} onPress={async () => {
              if (!user) return alert('Please login to save items');
              try { await toggleWishlist(product.id); setWishlist(!wishlist); } catch (e) {}
            }}>
              <Ionicons name={wishlist ? 'heart' : 'heart-outline'} size={20} color={wishlist ? COLORS.red : COLORS.text} />
            </TouchableOpacity>
          </View>
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
              {images.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)} style={[styles.thumb, activeImage === i && styles.thumbActive]}>
                  <Image source={{ uri: img }} style={styles.thumbImg} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.stars}>
              {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={14} color={s <= (product.average_rating || 0) ? '#FFB627' : COLORS.border} />)}
            </View>
            <Text style={styles.metaLink}>{product.average_rating || 'New'} ({histTotal} reviews)</Text>
            <View style={styles.dot} />
            <Ionicons name="eye" size={14} color={COLORS.primary} />
            <Text style={styles.metaText}>{product.view_count || 1} viewed</Text>
          </View>

          <View style={styles.pricing}>
            <Text style={styles.priceSymbol}>₹</Text>
            <Text style={styles.priceMain}>{(discountPrice || price).toFixed(2)}</Text>
            {discount > 0 && <Text style={styles.priceOld}>₹{price.toFixed(2)}</Text>}
            {discount > 0 && <Text style={styles.discountPct}>{discount}% off</Text>}
          </View>

          {/* Offers */}
          <View style={styles.offersBox}>
            <View style={styles.offerHeader}>
              <Ionicons name="pricetag" size={16} color="#FFB627" />
              <Text style={styles.offerTitle}>Available Offers</Text>
            </View>
            <View style={styles.offerItem}>
              <View style={styles.offerDot} />
              <Text style={styles.offerText}><Text style={{fontWeight:'700'}}>Bank Offer:</Text> 10% instant discount on HDFC Bank Credit Cards.</Text>
            </View>
            <View style={styles.offerItem}>
              <View style={styles.offerDot} />
              <Text style={styles.offerText}><Text style={{fontWeight:'700'}}>Partner Offer:</Text> Sign up for IndianLocalStore Pay Later.</Text>
            </View>
          </View>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.variantsBox}>
              {product.variants.map(v => (
                <View key={v.type} style={styles.variantGroup}>
                  <Text style={styles.variantLabel}>{v.type}: <Text style={{fontWeight:'700'}}>{selectedVariants[v.type] || 'Select'}</Text></Text>
                  <View style={styles.variantOptions}>
                    {v.values.map(val => {
                      const isActive = selectedVariants[v.type] === val;
                      return (
                        <TouchableOpacity key={val} style={[styles.variantBtn, isActive && styles.variantBtnActive]} onPress={() => setSelectedVariants({...selectedVariants, [v.type]: val})}>
                          <Text style={[styles.variantBtnText, isActive && styles.variantBtnTextActive]}>{val}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Delivery Check */}
          <View style={styles.deliveryBox}>
            <View style={styles.delHeader}>
              <Ionicons name="location" size={18} color="#FFB627" />
              <Text style={styles.delTitle}>Check Delivery Option</Text>
            </View>
            <View style={styles.delInputRow}>
              <TextInput style={styles.delInput} placeholder="Enter Pincode" keyboardType="number-pad" maxLength={6} />
              <TouchableOpacity style={styles.delBtn}><Text style={styles.delBtnText}>Check</Text></TouchableOpacity>
            </View>
            <View style={styles.delFeature}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.green} />
              <View>
                <Text style={styles.delFTitle}>Secure Transaction</Text>
                <Text style={styles.delFDesc}>Safe and reliable payments</Text>
              </View>
            </View>
          </View>

          {/* Seller */}
          {(product.seller_name || product.seller) && product.shop_id && (
            <TouchableOpacity style={styles.sellerBox} onPress={() => navigation.navigate('ShopProducts', { shopId: product.shop_id })}>
              <View style={styles.sellerAvatar}><Text style={styles.sellerInitial}>{String(product.seller_name || product.seller)[0].toUpperCase()}</Text></View>
              <View style={{flex:1}}>
                <Text style={styles.sellerName}>Sold by {product.seller_name || `Shop #${product.shop_id}`}</Text>
                <View style={{flexDirection:'row', alignItems:'center', gap:4, marginTop:4}}>
                  <Ionicons name="storefront" size={14} color="#FFB627" />
                  <Text style={styles.sellerLink}>Visit Store</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Accordions */}
          <View style={styles.accordions}>
            <AccordionItem id="desc" title="Product Description">
              <Text style={styles.accText}>{product.description || 'No detailed description available.'}</Text>
            </AccordionItem>
            <AccordionItem id="specs" title="Specifications">
              <View style={styles.specRow}><Text style={styles.specLabel}>Brand</Text><Text style={styles.specValue}>{product.brand || 'Generic'}</Text></View>
              <View style={styles.specRow}><Text style={styles.specLabel}>Category</Text><Text style={styles.specValue}>{product.category?.name || product.category_name || 'Category'}</Text></View>
              <View style={styles.specRow}><Text style={styles.specLabel}>Stock</Text><Text style={styles.specValue}>{product.stock} units</Text></View>
            </AccordionItem>
            <AccordionItem id="returns" title="Return Policy">
              <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                <Ionicons name="refresh" size={16} color={COLORS.textMuted} />
                <Text style={styles.accText}>7 Days Replacement Policy</Text>
              </View>
            </AccordionItem>
          </View>

          {/* FBT Mock */}
          <View style={styles.fbtBox}>
            <Text style={styles.sectionTitle}>Frequently Bought Together</Text>
            <View style={styles.fbtCard}>
              <View style={styles.fbtRow}>
                <Image source={{uri: images[0]}} style={styles.fbtImg} />
                <Ionicons name="add" size={24} color={COLORS.textMuted} />
                <View style={styles.fbtPlaceholder}><Text style={styles.fbtPText}>Item 2</Text></View>
                <Ionicons name="add" size={24} color={COLORS.textMuted} />
                <View style={styles.fbtPlaceholder}><Text style={styles.fbtPText}>Item 3</Text></View>
              </View>
              <View style={styles.fbtTotal}>
                <Text style={{color: COLORS.textMuted, fontSize: 12}}>Total price:</Text>
                <Text style={{fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 8}}>₹{((discountPrice || price) + 499).toFixed(2)}</Text>
                <TouchableOpacity style={styles.fbtBtn}><Text style={styles.fbtBtnText}>Add all 3 to Cart</Text></TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.reviewsBox}>
            <Text style={styles.sectionTitle}>Customer Ratings & Reviews</Text>
            <View style={styles.revStatsCard}>
              <View style={styles.rsMain}>
                <Text style={styles.rsValue}>{product.average_rating?.toFixed(1) || '0.0'}</Text>
                <View style={styles.stars}>
                  {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={16} color={s <= (product.average_rating || 0) ? '#FFB627' : COLORS.border} />)}
                </View>
                <Text style={styles.rsTotal}>{histTotal} global ratings</Text>
              </View>
              <View style={styles.rsHist}>
                {[5,4,3,2,1].map(star => {
                  const percent = histTotal === 0 ? 0 : Math.round((histCounts[star] / histTotal) * 100);
                  return (
                    <View key={star} style={styles.histRow}>
                      <Text style={styles.histLabel}>{star} star</Text>
                      <View style={styles.histBarBg}>
                        <View style={[styles.histBarFill, { width: `${percent}%` }]} />
                      </View>
                      <Text style={styles.histPct}>{percent}%</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyBox}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}><Ionicons name="remove" size={18} color={COLORS.text} /></TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => q + 1)}><Ionicons name="add" size={18} color={COLORS.text} /></TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.addBtn, addedToCart && styles.addBtnSuccess]} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>{addedToCart ? 'Added!' : 'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  
  header: { position: 'absolute', top: 40, left: 16, right: 16, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  
  gallery: { position: 'relative' },
  mainImage: { width, height: 380, backgroundColor: COLORS.elevated },
  actionBtns: { position: 'absolute', right: 16, top: 90, gap: 12 },
  roundActionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  thumbnails: { position: 'absolute', bottom: 16, left: 16, gap: 10, paddingRight: 32 },
  thumb: { width: 50, height: 50, borderRadius: 8, borderWidth: 2, borderColor: 'transparent', backgroundColor: '#FFF', overflow: 'hidden' },
  thumbActive: { borderColor: COLORS.primary },
  thumbImg: { width: '100%', height: '100%' },

  infoSection: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 12, lineHeight: 28 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  stars: { flexDirection: 'row', gap: 2 },
  metaLink: { color: COLORS.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textDim, marginHorizontal: 4 },
  metaText: { color: COLORS.textMuted, fontSize: 13 },
  
  pricing: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  priceSymbol: { fontSize: 18, fontWeight: '600', color: COLORS.text, top: -8 },
  priceMain: { fontSize: 32, fontWeight: '900', color: COLORS.text },
  priceOld: { fontSize: 16, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  discountPct: { fontSize: 14, fontWeight: '800', color: COLORS.green, marginLeft: 4 },

  offersBox: { marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  offerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  offerItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8, paddingRight: 16 },
  offerDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.textMuted, marginTop: 6 },
  offerText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },

  variantsBox: { marginBottom: 24 },
  variantGroup: { marginBottom: 16 },
  variantLabel: { fontSize: 14, color: COLORS.textMuted, marginBottom: 10 },
  variantOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  variantBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  variantBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(255,107,53,0.1)' },
  variantBtnText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  variantBtnTextActive: { color: COLORS.primary },

  deliveryBox: { backgroundColor: COLORS.elevated, borderRadius: RADIUS.lg, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  delHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  delTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  delInputRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  delInput: { flex: 1, height: 44, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 12 },
  delBtn: { height: 44, paddingHorizontal: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  delBtnText: { color: COLORS.primary, fontWeight: '700' },
  delFeature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  delFTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  delFDesc: { fontSize: 12, color: COLORS.textMuted },

  sellerBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.elevated, alignItems: 'center', justifyContent: 'center' },
  sellerInitial: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  sellerName: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  sellerLink: { fontSize: 12, color: '#FFB627', fontWeight: '600' },

  accordions: { borderTopWidth: 1, borderTopColor: COLORS.border },
  accordionWrap: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  accordionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  accordionContent: { paddingBottom: 16 },
  accText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
  specRow: { flexDirection: 'row', py: 8, borderBottomWidth: 1, borderBottomColor: COLORS.elevated, paddingVertical: 8 },
  specLabel: { flex: 1, fontSize: 13, color: COLORS.textMuted },
  specValue: { flex: 2, fontSize: 13, fontWeight: '600', color: COLORS.text },

  fbtBox: { marginTop: 32, paddingTop: 32, borderTopWidth: 1, borderTopColor: COLORS.border },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  fbtCard: { backgroundColor: COLORS.elevated, borderRadius: RADIUS.lg, padding: 16 },
  fbtRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  fbtImg: { width: 70, height: 70, borderRadius: RADIUS.md, backgroundColor: '#FFF' },
  fbtPlaceholder: { width: 70, height: 70, borderRadius: RADIUS.md, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  fbtPText: { fontSize: 12, color: COLORS.textDim },
  fbtTotal: { alignItems: 'flex-end' },
  fbtBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.sm },
  fbtBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  reviewsBox: { marginTop: 32, paddingTop: 32, borderTopWidth: 1, borderTopColor: COLORS.border },
  revStatsCard: { backgroundColor: COLORS.elevated, borderRadius: RADIUS.lg, padding: 20 },
  rsMain: { alignItems: 'center', marginBottom: 24 },
  rsValue: { fontSize: 48, fontWeight: '900', color: COLORS.text, marginBottom: 8 },
  rsTotal: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
  rsHist: { gap: 8 },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  histLabel: { width: 40, fontSize: 12, color: COLORS.textMuted },
  histBarBg: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  histBarFill: { height: '100%', backgroundColor: '#FFB627', borderRadius: 4 },
  histPct: { width: 32, fontSize: 12, color: COLORS.textMuted, textAlign: 'right' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, paddingBottom: 32, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.lg },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.elevated, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  qtyBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  qtyText: { width: 24, textAlign: 'center', fontSize: 16, fontWeight: '700', color: COLORS.text },
  addBtn: { flex: 1, height: 48, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  addBtnSuccess: { backgroundColor: COLORS.green },
  addBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  imageModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  fullImage: { width, height: height * 0.7 },
});
