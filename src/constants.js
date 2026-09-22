export const COLORS = {
  // Brand Colors
  primary: '#FF6B35',        // Saffron
  primaryLight: '#FF8C5A',
  primaryDark: '#E5531A',
  secondary: '#FFB627',       // Gold
  secondaryLight: '#FFC94D',
  green: '#2ECC71',
  red: '#E74C3C',

  // Background System (Vibrant Aurora Theme)
  background: '#0F0C29',     // Midnight Base
  surface: '#302B63',        // Deep indigo surface
  card: 'rgba(25, 20, 40, 0.6)',           
  elevated: 'rgba(40, 35, 70, 0.7)',       
  hover: 'rgba(255, 107, 53, 0.15)',          
  
  // Text
  text: '#FFFFFF',           // Bright text on dark
  textMuted: '#E2E8F0',      
  textDim: '#94A3B8',        
  
  // Interactions
  border: 'rgba(255, 107, 53, 0.3)',
  borderStrong: 'rgba(255, 107, 53, 0.6)',
  glass: 'rgba(20, 15, 40, 0.45)',
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
  { id: 1, name: 'Agriculture', icon: '🌾' },
  { id: 2, name: 'Automobile', icon: '🚗' },
  { id: 3, name: 'Construction', icon: '🏗️' },
  { id: 4, name: 'Electronics', icon: '📱' },
  { id: 5, name: 'Event Management', icon: '🎉' },
  { id: 6, name: 'Fashion', icon: '👗' },
  { id: 7, name: 'Furnitures', icon: '🪑' },
  { id: 8, name: 'Marts', icon: '🛒' },
  { id: 9, name: 'Pharmacy', icon: '💊' },
  { id: 10, name: 'Second Hand Vehicles', icon: '🚙' },
  { id: 11, name: 'Traders', icon: '🤝' },
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
