export const COLORS = {
  // Brand Colors
  primary: '#FF6B35',        // Saffron
  primaryLight: '#FF8C5A',
  primaryDark: '#E5531A',
  secondary: '#FFB627',       // Gold
  secondaryLight: '#FFC94D',
  green: '#2ECC71',
  red: '#E74C3C',

  // Background System (Exact from Web)
  background: '#F8FAFC',     // bg-base
  surface: '#FFFFFF',        // bg-surface
  card: '#FFFFFF',           // bg-card
  elevated: '#F1F5F9',       // bg-elevated
  hover: '#E2E8F0',          // bg-hover
  
  // Text
  text: '#0F172A',           // text-primary
  textMuted: '#475569',      // text-secondary
  textDim: '#64748B',        // text-muted
  
  // Interactions
  border: 'rgba(0, 0, 0, 0.08)',
  borderStrong: 'rgba(0, 0, 0, 0.15)',
  glass: 'rgba(255, 255, 255, 0.7)',
  white: '#FFFFFF',
  black: '#000000',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 10,
  },
  brand: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  }
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ... existing CATEGORIES and other data ...
export const CATEGORIES = [
  { id: 1, name: 'Vegetables', icon: '🥬' },
  { id: 2, name: 'Fruits', icon: '🍎' },
  { id: 3, name: 'Dairy', icon: '🥛' },
  { id: 4, name: 'Spices', icon: '🌿' },
  { id: 5, name: 'Grains', icon: '🌾' },
  { id: 6, name: 'Snacks', icon: '🥜' },
  { id: 7, name: 'Meat', icon: '🍖' },
  { id: 8, name: 'Beverages', icon: '🧃' },
  { id: 9, name: 'Bakery', icon: '🍞' },
  { id: 10, name: 'Personal Care', icon: '🧴' },
  { id: 11, name: 'Home & Living', icon: '🏠' },
  { id: 12, name: 'Electronics', icon: '📱' },
  { id: 13, name: 'Clothing', icon: '👕' },
  { id: 14, name: 'Stationery', icon: '📚' },
  { id: 15, name: 'Pharmacy', icon: '💊' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];
