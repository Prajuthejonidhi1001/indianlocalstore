import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ChevronRight } from 'lucide-react';
import { productAPI } from '../api';
import './CategoriesPage.css';

const CAT_COLORS = [
  'linear-gradient(135deg,#FF6B35,#FF8C42)',
  'linear-gradient(135deg,#5521FF,#7C3AED)',
  'linear-gradient(135deg,#00C896,#00A878)',
  'linear-gradient(135deg,#FFB627,#FF9500)',
  'linear-gradient(135deg,#E91E8C,#C2185B)',
  'linear-gradient(135deg,#00B4D8,#0077B6)',
  'linear-gradient(135deg,#FF4757,#E84393)',
  'linear-gradient(135deg,#2ED573,#1E9E56)',
  'linear-gradient(135deg,#FFA502,#FF6348)',
  'linear-gradient(135deg,#747D8C,#2F3542)',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    productAPI.getCategories()
      .then(r => {
        const cats = r.data.results || r.data;
        setCategories(cats);
        if (cats.length > 0) setActiveId(cats[0].id); // auto-open first
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subcategories?.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const scrollToSection = (id) => {
    setActiveId(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return (
    <div className="cat-loading">
      <div className="cat-loading-grid">
        {[...Array(6)].map((_, i) => <div key={i} className="cat-skeleton" />)}
      </div>
    </div>
  );

  return (
    <div className="cat-page">
      {/* Hero Header */}
      <div className="cat-hero">
        <div className="cat-hero-inner container">
          <p className="cat-label">🛍️ Browse All</p>
          <h1 className="cat-hero-title">Shop by Category</h1>
          <p className="cat-hero-sub">Explore {categories.length} categories from local stores near you</p>

          {/* Search */}
          <div className="cat-search-wrap">
            <Search size={18} className="cat-search-icon" />
            <input
              className="cat-search-input"
              placeholder="Search categories or subcategories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container cat-body">
        {/* Sidebar pill navigation */}
        <aside className="cat-sidebar">
          <p className="cat-sidebar-label">CATEGORIES</p>
          {filtered.map((cat, i) => (
            <button
              key={cat.id}
              className={`cat-pill ${activeId === cat.id ? 'active' : ''}`}
              onClick={() => scrollToSection(cat.id)}
            >
              {cat.icon
                ? <img src={cat.icon} alt={cat.name} className="cat-pill-img" />
                : <span className="cat-pill-dot" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
              }
              <span>{cat.name}</span>
              <span className="cat-pill-count">{cat.subcategories?.length || 0}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="cat-main">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No results for "{search}"</h3>
              <p>Try a different search term</p>
            </div>
          ) : (
            filtered.map((cat, i) => (
              <section
                key={cat.id}
                id={`cat-${cat.id}`}
                ref={el => sectionRefs.current[cat.id] = el}
                className="cat-section"
              >
                {/* Category Header */}
                <div className="cat-section-header">
                  <div className="cat-header-icon" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }}>
                    {cat.icon
                      ? <img src={cat.icon} alt={cat.name} className="cat-header-img" />
                      : <span className="cat-header-letter">{cat.name[0]}</span>
                    }
                  </div>
                  <div className="cat-header-text">
                    <h2 className="cat-section-name">{cat.name}</h2>
                    {cat.description && <p className="cat-section-desc">{cat.description}</p>}
                  </div>
                  <Link
                    to={`/shops?category=${cat.id}`}
                    className="cat-view-all"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Subcategory Grid */}
                {cat.subcategories?.length > 0 ? (
                  <div className="subcat-grid">
                    {cat.subcategories.map((sub) => (
                      <Link
                        to={`/shops?category=${cat.id}&subcategory=${sub.id}`}
                        key={sub.id}
                        className="subcat-card"
                        id={`subcat-${sub.id}`}
                      >
                        <div className="subcat-img-wrap" style={{ background: CAT_COLORS[i % CAT_COLORS.length] + '22' }}>
                          {sub.icon
                            ? <img src={sub.icon} alt={sub.name} className="subcat-img" />
                            : <span className="subcat-emoji">🏪</span>
                          }
                        </div>
                        <span className="subcat-name">{sub.name}</span>
                        <ChevronRight size={13} className="subcat-arrow" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link to={`/shops?category=${cat.id}`} className="cat-no-sub">
                    Browse {cat.name} Shops <ArrowRight size={14} />
                  </Link>
                )}
              </section>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
