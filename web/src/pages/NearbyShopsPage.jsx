import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, Star, ChevronDown, Filter, ChevronRight, Store, SlidersHorizontal, Check } from 'lucide-react';
import { shopAPI, productAPI } from '../api';
import { useLocation } from '../context/LocationContext';
import './NearbyShopsPage.css';

const CAT_EMOJIS = {
  'Vegetables': '🥬', 'Fruits': '🍎', 'Dairy': '🥛', 'Spices': '🌿',
  'Grains': '🌾', 'Snacks': '🥜', 'Meat': '🍖', 'Beverages': '🧃',
  'Bakery': '🍞', 'Personal Care': '🧴', 'Home & Living': '🏠',
  'Electronics': '📱', 'Clothing': '👕', 'Pharmacy': '💊',
  'Fashion': '👗', 'Agriculture': '🌱', 'Automobile': '🚗',
  'Construction': '🏗️', 'Furniture': '🪑', 'Furnitures': '🪑',
  'Mart': '🏪', 'Traders': '📦', 'Event Management': '🎉',
  'Second Hand Vehicles': '🚙',
};

const CAT_GRADIENTS = [
  'linear-gradient(135deg,#FF6B35,#FF8C42)',
  'linear-gradient(135deg,#5521FF,#7C3AED)',
  'linear-gradient(135deg,#00C896,#00A878)',
  'linear-gradient(135deg,#FFB627,#FF9500)'
];

function ShopSkeleton() {
  return (
    <div className="shop-card-skeleton card">
      <div className="sks-banner shimmer" />
      <div className="sks-body">
        <div className="sks-row">
          <div className="sks-avatar shimmer" />
          <div className="sks-lines">
            <div className="sks-line shimmer" style={{ width: '70%' }} />
            <div className="sks-line shimmer" style={{ width: '40%', height: '10px', marginTop: '6px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NearbyShopsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location } = useLocation();
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [catRes, shopRes] = await Promise.all([
          productAPI.getCategories(),
          shopAPI.getShops({ city: location?.district })
        ]);
        setCategories(catRes.data.results || catRes.data);
        setShops(shopRes.data.results || shopRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [location?.district]);

  const handleLocationSearch = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await shopAPI.getNearbyShops(pos.coords.latitude, pos.coords.longitude);
          setShops(res.data.results || res.data);
        } catch { setShops([]); } finally { setLocating(false); }
      },
      () => { setLocating(false); }
    );
  };

  const handleCategorySelect = (id) => {
    setSelectedCategory(id === selectedCategory ? null : id);
    const newParams = new URLSearchParams(searchParams);
    if (id === selectedCategory) newParams.delete('category');
    else newParams.set('category', id);
    setSearchParams(newParams);
  };

  // Advanced Filtering
  let filteredShops = shops.filter(s => {
    let match = true;
    if (searchQuery) {
      match = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              s.city.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (selectedCategory && match) {
      match = s.category == selectedCategory || s.categories?.includes(parseInt(selectedCategory));
    }
    if (selectedRating && match) {
      match = (s.rating || 4.5) >= selectedRating;
    }
    return match;
  });

  // Sorting
  if (sortBy === 'rating') {
    filteredShops.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
  } else if (sortBy === 'newest') {
    filteredShops.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  return (
    <div className="page plp-page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        
        {/* Breadcrumb & Header */}
        <div className="breadcrumb mb-3 text-sm text-muted">
          <Link to="/home">Home</Link> <ChevronRight size={14}/>
          <span className="text-primary font-medium">Shops Directory</span>
        </div>

        <div className="plp-header-banner mb-4">
          <div className="plp-hb-content">
            <h1>{location ? `Local Shops in ${location.name}` : 'Explore Local Shops'}</h1>
            <p>Support your neighbourhood businesses and discover amazing local products.</p>
          </div>
          <div className="plp-hb-actions">
            <button className="btn btn-primary" onClick={handleLocationSearch} disabled={locating}>
              <Navigation size={16} /> {locating ? 'Locating...' : 'Use My Location'}
            </button>
          </div>
        </div>

        <div className="plp-layout">
          
          {/* ── SIDEBAR FILTERS ── */}
          <aside className={`plp-sidebar ${showMobileFilters ? 'show' : ''}`}>
            <div className="plp-sidebar-inner">
              <div className="flex-between mb-4 d-md-none">
                <h3 className="font-medium">Filters</h3>
                <button className="btn-icon" onClick={() => setShowMobileFilters(false)}>×</button>
              </div>

              {/* Categories */}
              <div className="filter-group">
                <h4 className="filter-title">Categories</h4>
                <div className="filter-list">
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedCategory === null} 
                      onChange={() => handleCategorySelect(selectedCategory)} 
                    />
                    <span className="chk-box"><Check size={12}/></span>
                    <span className="chk-label">All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="filter-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedCategory == cat.id} 
                        onChange={() => handleCategorySelect(cat.id)} 
                      />
                      <span className="chk-box"><Check size={12}/></span>
                      <span className="chk-label">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ratings */}
              <div className="filter-group">
                <h4 className="filter-title">Customer Ratings</h4>
                <div className="filter-list">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="filter-checkbox">
                      <input 
                        type="radio" 
                        name="rating_filter"
                        checked={selectedRating === rating} 
                        onChange={() => setSelectedRating(rating)} 
                      />
                      <span className="chk-box radio"><Check size={12}/></span>
                      <span className="chk-label flex-center gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= rating ? 'star-filled' : 'star-empty'} fill="currentColor"/>)}
                        <span className="text-muted ml-1">& Up</span>
                      </span>
                    </label>
                  ))}
                  <label className="filter-checkbox">
                    <input 
                      type="radio" 
                      name="rating_filter"
                      checked={selectedRating === null} 
                      onChange={() => setSelectedRating(null)} 
                    />
                    <span className="chk-box radio"><Check size={12}/></span>
                    <span className="chk-label">Any Rating</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="plp-main">
            
            {/* Toolbar */}
            <div className="plp-toolbar mb-4">
              <div className="plp-search-box">
                <Search size={18} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search shops by name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="plp-toolbar-actions">
                <div className="plp-results-count text-muted text-sm d-none d-sm-block">
                  Showing {filteredShops.length} results
                </div>
                
                <button className="btn btn-outline btn-sm d-md-none" onClick={() => setShowMobileFilters(true)}>
                  <Filter size={14} /> Filters
                </button>

                <div className="plp-sort">
                  <span className="text-muted text-sm">Sort by:</span>
                  <select className="form-select plp-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="relevance">Relevance</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="shops-grid">
              {loading ? (
                Array(6).fill(0).map((_, i) => <ShopSkeleton key={i} />)
              ) : filteredShops.length > 0 ? (
                filteredShops.map((shop, i) => (
                  <div key={shop.id} className="shop-card card" onClick={() => navigate(`/shops/${shop.id}`)}>
                    <div className="sc-banner">
                      {shop.banner ? <img src={shop.banner} alt={shop.name} /> : <div className="sc-banner-fallback" style={{ background: CAT_GRADIENTS[i % CAT_GRADIENTS.length] }} />}
                      <div className="sc-rating"><Star size={12} fill="currentColor" /> {shop.rating || '4.5'}</div>
                    </div>
                    <div className="sc-body">
                      <div className="sc-row">
                        <div className="sc-avatar">{shop.logo ? <img src={shop.logo} alt="logo" /> : (shop.name?.[0] || 'S')}</div>
                        <div className="sc-info">
                          <h3 className="sc-name truncate">{shop.name}</h3>
                          <p className="sc-desc truncate">{shop.description || 'Premium local seller'}</p>
                          <div className="text-xs text-muted mt-2 flex-center gap-1"><MapPin size={12}/> {shop.city}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '4rem 2rem' }}>
                  <Store size={48} className="text-muted mb-3" />
                  <h3>No shops found</h3>
                  <p className="text-muted">Try adjusting your filters or searching for something else.</p>
                  <button className="btn btn-outline mt-3" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedRating(null); }}>Clear All Filters</button>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
