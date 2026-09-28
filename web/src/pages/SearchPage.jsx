import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Star, ChevronRight, Package, Check, X } from 'lucide-react';
import { productAPI } from '../api';
import ProductCard from '../components/ProductCard';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('category') || null;
  const initialMinPrice = searchParams.get('min_price') || '';
  const initialMaxPrice = searchParams.get('max_price') || '';
  const initialRating = searchParams.get('min_rating') || null;
  const initialOrdering = searchParams.get('ordering') || '-created_at';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [sortBy, setSortBy] = useState(initialOrdering);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    // Load categories once
    productAPI.getCategories().then(res => {
      setCategories(res.data.results || res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchQuery,
          category: selectedCategory,
          min_price: minPrice,
          max_price: maxPrice,
          min_rating: selectedRating,
          ordering: sortBy
        };
        // clean undefined/empty
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key];
        });

        const res = await productAPI.getProducts(params);
        setProducts(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // debounce fetching
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, selectedRating, sortBy]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (selectedRating) params.set('min_rating', selectedRating);
    if (sortBy && sortBy !== '-created_at') params.set('ordering', sortBy);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, minPrice, maxPrice, selectedRating, sortBy, setSearchParams]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating(null);
    setSortBy('-created_at');
  };

  return (
    <div className="page search-page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        
        {/* Breadcrumb */}
        <div className="breadcrumb mb-4 text-sm text-muted">
          <Link to="/home">Home</Link> <ChevronRight size={14}/>
          <span className="text-primary font-medium">Search Products</span>
        </div>

        <div className="sp-header mb-4">
          <h1 className="mb-2">Product Search</h1>
          <p className="text-muted">Find exactly what you are looking for.</p>
        </div>

        <div className="sp-layout">
          
          {/* ── SIDEBAR FILTERS ── */}
          <aside className={`sp-sidebar ${showMobileFilters ? 'show' : ''}`}>
            <div className="sp-sidebar-inner">
              <div className="flex-between mb-2 d-md-none">
                <h3 className="font-medium">Filters</h3>
                <button className="btn-icon" onClick={() => setShowMobileFilters(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="filter-group">
                <h4 className="filter-title">Categories</h4>
                <div className="filter-list">
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedCategory === null} 
                      onChange={() => setSelectedCategory(null)} 
                    />
                    <span className="chk-box"><Check size={12}/></span>
                    <span className="chk-label">All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="filter-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedCategory == cat.id} 
                        onChange={() => setSelectedCategory(cat.id == selectedCategory ? null : cat.id)} 
                      />
                      <span className="chk-box"><Check size={12}/></span>
                      <span className="chk-label">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4 className="filter-title">Price Range</h4>
                <div className="price-inputs">
                  <input 
                    type="number" 
                    className="price-input-box" 
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                  />
                  <span className="text-muted">-</span>
                  <input 
                    type="number" 
                    className="price-input-box" 
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
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
                        checked={selectedRating == rating} 
                        onChange={() => setSelectedRating(rating)} 
                      />
                      <span className="chk-box radio"><Check size={12}/></span>
                      <span className="chk-label flex-center gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= rating ? 'star-filled text-saffron' : 'star-empty'} fill={s <= rating ? 'currentColor' : 'none'}/>)}
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
              
              <button className="btn btn-outline btn-full mt-2" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="sp-main">
            
            {/* Toolbar */}
            <div className="sp-toolbar">
              <div className="plp-search-box" style={{ flex: 1, maxWidth: '400px' }}>
                <Search size={18} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', color: 'var(--text)' }}
                />
              </div>

              <div className="plp-toolbar-actions flex-center gap-3">
                <div className="plp-results-count text-muted text-sm d-none d-sm-block">
                  {products.length} results
                </div>
                
                <button className="btn btn-outline btn-sm sp-mobile-filter-btn" onClick={() => setShowMobileFilters(true)}>
                  <Filter size={14} /> Filters
                </button>

                <div className="flex-center gap-2">
                  <span className="text-muted text-sm d-none d-sm-block">Sort by:</span>
                  <select className="sp-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="-created_at">Newest Arrivals</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="products-grid">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="card p-3" style={{ height: '300px' }}>
                    <div className="shimmer" style={{ width: '100%', height: '180px', borderRadius: '8px' }} />
                    <div className="shimmer mt-3" style={{ width: '80%', height: '20px' }} />
                    <div className="shimmer mt-2" style={{ width: '40%', height: '16px' }} />
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="empty-state card" style={{ gridColumn: '1 / -1', padding: '4rem 2rem' }}>
                  <Package size={48} className="text-muted mb-3" style={{ opacity: 0.5 }} />
                  <h3>No products found</h3>
                  <p className="text-muted text-center" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    We couldn't find any products matching your search criteria. Try adjusting your filters.
                  </p>
                  <button className="btn btn-primary mt-4" onClick={clearFilters}>Clear All Filters</button>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
