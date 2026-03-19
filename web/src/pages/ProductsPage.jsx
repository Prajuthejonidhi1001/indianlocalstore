import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productAPI } from '../api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
  const [ordering, setOrdering] = useState('-created_at');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    productAPI.getCategories().then(r => setCategories(r.data.results || r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { ordering };
    if (search) params.search = search;
    if (selectedCat) params.category = selectedCat;
    productAPI.getProducts(params)
      .then(r => setProducts(r.data.results || r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, selectedCat, ordering]);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.querySelector('input').value;
    setSearch(val);
    setSearchParams(val ? { search: val } : {});
  };

  const clearFilters = () => {
    setSearch(''); setSelectedCat(''); setOrdering('-created_at');
    setSearchParams({});
  };

  const hasFilters = search || selectedCat;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div className="products-header">
          <div>
            <h1 id="products-heading">All Products</h1>
            <p className="products-count">{products.length} products found</p>
          </div>
          <div className="products-controls">
            <form onSubmit={handleSearch} className="products-search">
              <Search size={15} className="ps-icon" />
              <input
                id="product-search-input"
                type="text"
                placeholder="Search products..."
                defaultValue={search}
              />
            </form>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)} id="filter-toggle-btn">
              <SlidersHorizontal size={15} /> Filters
            </button>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters} id="clear-filters-btn">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="filter-panel animate-in">
            <div className="filter-group">
              <p className="filter-label">Category</p>
              <div className="filter-chips">
                <button
                  className={`filter-chip ${!selectedCat ? 'active' : ''}`}
                  id="cat-all"
                  onClick={() => setSelectedCat('')}
                >All</button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    className={`filter-chip ${selectedCat == c.id ? 'active' : ''}`}
                    id={`cat-filter-${c.id}`}
                    onClick={() => setSelectedCat(c.id)}
                  >{c.name}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <p className="filter-label">Sort by</p>
              <div className="filter-chips">
                {[
                  { val: '-created_at', label: 'Newest' },
                  { val: 'price', label: 'Price: Low to High' },
                  { val: '-price', label: 'Price: High to Low' },
                  { val: '-rating', label: 'Top Rated' },
                ].map(o => (
                  <button
                    key={o.val}
                    className={`filter-chip ${ordering === o.val ? 'active' : ''}`}
                    id={`sort-${o.val.replace(/^-/, 'desc-')}`}
                    onClick={() => setOrdering(o.val)}
                  >{o.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try a different search or category</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-auto gap-3" id="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
