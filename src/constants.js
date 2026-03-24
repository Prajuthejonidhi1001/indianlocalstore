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
  background: '#06090F',     // bg-base
  surface: '#0D1117',        // bg-surface
  card: '#131920',           // bg-card
  elevated: '#1A2332',       // bg-elevated
  hover: '#20293A',          // bg-hover
  
  // Text
  text: '#F0F4FF',           // text-primary
  textMuted: '#97A3B6',      // text-secondary
  textDim: '#5A6880',        // text-muted
  
  // Interactions
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  glass: 'rgba(19, 25, 32, 0.7)',
  white: '#FFFFFF',
  black: '#000000',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  brand: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
