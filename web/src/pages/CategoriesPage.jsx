import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { productAPI } from '../api';
import './CategoriesPage.css';

const EMOJIS = ['🥬', '🍎', '🥛', '🌿', '🌾', '🥜', '🧴', '🏠', '🐟', '🍬', '🥦', '🫙'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState({});

  const toggleCat = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    productAPI.getCategories()
      .then(r => setCategories(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <div className="section-header">
          <div className="section-label">🛍️ Shop by Category</div>
          <h1 id="categories-heading">All Categories</h1>
          <p className="section-subtitle">Choose a category to explore fresh local products</p>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3>No categories found</h3>
          </div>
        ) : (
          <div className="categories-list">
            {categories.map((cat, i) => (
              <div key={cat.id} className="cat-section" id={`cat-section-${cat.id}`}>
                <div className="cat-section-header clickable" onClick={() => toggleCat(cat.id)}>
                  {cat.icon ? (
                    <img src={cat.icon} alt={cat.name} className="cat-section-img" />
                  ) : (
                    <div className="cat-page-emoji">{EMOJIS[i % EMOJIS.length]}</div>
                  )}
                  <div className="cat-section-title">
                    <h2>{cat.name}</h2>
                    {cat.description && <p>{cat.description}</p>}
                  </div>
                  <ChevronDown className={`cat-chevron ${expandedCats[cat.id] ? 'expanded' : ''}`} />
                </div>
                
                {expandedCats[cat.id] && (
                  cat.subcategories?.length > 0 ? (
                  <div className="subcat-grid">
                    {cat.subcategories.map((sub, j) => (
                      <Link to={`/products?category=${cat.id}&subcategory=${sub.id}`} key={sub.id} className="subcat-card card" id={`subcat-${sub.id}`}>
                        {sub.icon ? (
                          <img src={sub.icon} alt={sub.name} className="subcat-img" />
                        ) : (
                          <div className="subcat-emoji">{EMOJIS[(i + j + 1) % EMOJIS.length]}</div>
                        )}
                        <span className="subcat-name">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="subcat-empty">No subcategories available.</div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
