export const COLORS = {
  primary: '#1A3A8F',        // Deep blue matching logo
  primaryLight: '#E8EEFF',
  accent: '#FF8C00',         // Orange from Indian flag
  green: '#138808',          // Green from Indian flag
  dark: '#0D1B3E',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  white: '#FFFFFF',
  background: '#F0F4FF',
  border: '#E5E7EB',
  success: '#10B981',
  textMuted: '#9CA3AF',
};

// ✅ SECTORS in exact order from handwritten notes
export const CATEGORIES = [
  {
    id: 1,
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'Farming supplies, equipment and nursery',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80',
    color: '#1A3A10',
    subcategories: [
      { name: 'Agri Equipments', image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&q=80' },
      { name: 'Feeds & Cattle Feeds', image: 'https://images.unsplash.com/photo-1500595046743-cec271a3dd36?w=600&q=80' },
      { name: 'Fertilizers & Pesticides', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&q=80' },
      { name: 'Nursery', image: 'https://images.unsplash.com/photo-1466692476877-09f19db12bc3?w=600&q=80' },
      { name: 'Seeds', image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&q=80' },
    ],
  },
  {
    id: 2,
    name: 'Fashion',
    slug: 'fashion',
    description: 'Textiles, footwear, tailoring and beauty',
    image: 'https://images.unsplash.com/photo-1537832816519-689ad163238b?w=600&q=80',
    color: '#3B1F5E',
    subcategories: [
      { name: 'Textile', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80' },
      { name: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
      { name: 'Tailors', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80' },
      { name: 'Rental Stores', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
      { name: 'Beautician', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80' },
      { name: 'Saree & Fancy Printing', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80' },
    ],
  },
  {
    id: 3,
    name: 'Mart',
    slug: 'mart',
    description: 'Supermarkets, wholesale and convenience stores',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80',
    color: '#0A3A2A',
    subcategories: [
      { name: 'Supermarkets', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80' },
      { name: 'Convenience Stores', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80' },
      { name: 'Wholesale Markets', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80' },
      { name: 'General Stores', image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&q=80' },
    ],
  },
  {
    id: 4,
    name: 'Electronics',
    slug: 'electronics',
    description: 'Mobile, laptop and home appliances',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
    color: '#0A1A3A',
    subcategories: [
      { name: 'Mobile', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80' },
      { name: 'Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80' },
      { name: 'Home Appliances', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80' },
      { name: 'Audio & Video', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80' },
      { name: 'Accessories', image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&q=80' },
    ],
  },
  {
    id: 5,
    name: 'Traders',
    slug: 'traders',
    description: 'Livestock and commodity traders',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80',
    color: '#3A1A10',
    subcategories: [
      { name: 'Cow', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&q=80' },
      { name: 'Sheep', image: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&q=80' },
      { name: 'Silage', image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&q=80' },
      { name: 'Goats', image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600&q=80' },
      { name: 'Pets', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80' },
      { name: 'Coffee Traders', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80' },
    ],
  },
  {
    id: 6,
    name: 'Automobile',
    slug: 'automobile',
    description: 'New vehicles - two, four wheelers and commercial',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80',
    color: '#1A1A3A',
    subcategories: [
      { name: 'Two Wheelers', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80' },
      { name: 'Four Wheelers', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80' },
      { name: 'Commercial', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80' },
      { name: 'Modified Vehicles', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80' },
    ],
  },
  {
    id: 7,
    name: 'Second Hand Vehicles',
    slug: 'second-hand-vehicles',
    description: 'Pre-owned two, four wheelers and heavy vehicles',
    image: 'https://images.unsplash.com/photo-1562141989-c5c79ac8f576?w=600&q=80',
    color: '#2A1A0A',
    subcategories: [
      { name: 'Two Wheeled', image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&q=80' },
      { name: 'Four Wheeled', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80' },
      { name: 'Commercial Vehicles', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&q=80' },
      { name: 'Heavy Vehicles', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&q=80' },
    ],
  },
  {
    id: 8,
    name: 'Construction',
    slug: 'construction',
    description: 'Hardware, paint, electrical and fabrication',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    color: '#1A2A3A',
    subcategories: [
      { name: 'Hardware', image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&q=80' },
      { name: 'Paints', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80' },
      { name: 'Electric Items', image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=600&q=80' },
      { name: 'Tiles & Granite', image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=600&q=80' },
      { name: 'Carpentry & Wood', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80' },
      { name: 'PVC Fabrication', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80' },
      { name: 'Others', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
    ],
  },
  {
    id: 9,
    name: 'Furnitures',
    slug: 'furnitures',
    description: 'Home and office furniture',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80',
    color: '#3A2A0A',
    subcategories: [
      { name: 'Sofas', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
      { name: 'Beds', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80' },
      { name: 'Dining', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80' },
      { name: 'Office Furniture', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80' },
      { name: 'Outdoor Furniture', image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80' },
    ],
  },
  {
    id: 10,
    name: 'Event Management',
    slug: 'event-management',
    description: 'Stage decoration, catering and photography',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
    color: '#3A0A2A',
    subcategories: [
      { name: 'Stage Decoration', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80' },
      { name: 'Catering', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80' },
      { name: 'Photography Studio', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80' },
    ],
  },
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

export const APP_NAME = 'Indian Local Store';
export const APP_TAGLINE = 'Your Trusted Neighborhood Marketplace';

export const MOCK_SHOPS = {
  'Agri Equipments': [
    { id: 1, name: 'Raju Agri Store', location: 'Bengaluru, Karnataka', rating: 4.5, products: ['Tractor Parts', 'Plough', 'Sprayer'] },
    { id: 2, name: 'Green Fields Equipments', location: 'Mysuru, Karnataka', rating: 4.2, products: ['Water Pump', 'Thresher'] },
  ],
  'Mobile': [
    { id: 3, name: 'City Mobile Hub', location: 'Bengaluru, Karnataka', rating: 4.7, products: ['Samsung Galaxy', 'Redmi Note', 'iPhone'] },
    { id: 4, name: 'Tech World', location: 'Hassan, Karnataka', rating: 4.3, products: ['OnePlus', 'Vivo', 'Oppo'] },
  ],
  'Tailors': [
    { id: 5, name: 'Raghavendra Tailors', location: 'Chikkamagaluru, 577102', rating: 4.8, products: ['Kurta', 'Shirt', 'Pant'] },
    { id: 6, name: 'Style Stitch', location: 'Bengaluru, 560001', rating: 4.4, products: ['Blouse', 'Salwar', 'Suit'] },
  ],
  'Cow': [
    { id: 7, name: 'Sri Venkateswara Cattle', location: 'Tumkur, Karnataka', rating: 4.6, products: ['HF Cow', 'Jersey Cow', 'Desi Cow'] },
  ],
};
