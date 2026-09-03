import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin, Instagram, Youtube, Twitter, ArrowRight, Heart } from 'lucide-react';
import './Footer.css';

const links = {
  Shop: [
    { label: 'All Shops', to: '/shops' },
    { label: 'Categories', to: '/categories' },
    { label: 'Nearby Shops', to: '/shops' },
  ],
  Account: [
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
    { label: 'My Orders', to: '/orders' },
    { label: 'My Profile', to: '/profile' },
  ],
  Sellers: [
    { label: 'Seller Dashboard', to: '/seller' },
    { label: 'Open a Shop', to: '/register' },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      {/* CTA strip */}
      <div className="footer-cta-strip">
        <div className="container footer-cta-inner">
          <div>
            <p className="footer-cta-label">Ready to sell locally?</p>
            <p className="footer-cta-sub">Join thousands of local sellers on India's #1 local commerce platform.</p>
          </div>
          <Link to="/register" className="btn btn-primary footer-cta-btn">
            Start Selling Free <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/logo.png" alt="Indian Local Store" style={{ height: '40px', width: 'auto', borderRadius: '6px' }} />
              </div>
              <p className="footer-desc">
                Connecting you with the best local Indian shops and products. Support local businesses, shop fresh, live better.
              </p>
              <div className="footer-contact">
                <a href="mailto:stiratechindianlocalstore@gmail.com" className="footer-contact-item">
                  <Mail size={14} /> stiratechindianlocalstore@gmail.com
                </a>
                <a href="tel:+919686068979" className="footer-contact-item">
                  <Phone size={14} /> +91 96860 68979 (Support & WhatsApp)
                </a>
                <span className="footer-contact-item" style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Phone size={14} /> Customer Support:</span>
                  <span style={{paddingLeft: '22px', fontSize: '13px', opacity: 0.8}}>+91 63606 42663</span>
                  <span style={{paddingLeft: '22px', fontSize: '13px', opacity: 0.8}}>+91 86184 71245</span>
                  <span style={{paddingLeft: '22px', fontSize: '13px', opacity: 0.8}}>+91 74830 82241</span>
                </span>
                <span className="footer-contact-item mt-2">
                  <MapPin size={14} /> India 🇮🇳
                </span>
              </div>
              <div className="footer-social">
                <a href="https://www.instagram.com/indian_local_store?utm_source=qr&igsi=MTY4N3o0MHcwbTg2aQ==" target="_blank" rel="noreferrer" className="social-btn" aria-label="Instagram"><Instagram size={16} /></a>
                <a href="https://youtube.com/@indian_local_stores?si=LO0eDB43-fnL2zD_" target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube"><Youtube size={16} /></a>
                <a href="https://x.com/_indian_stores" target="_blank" rel="noreferrer" className="social-btn" aria-label="Twitter"><Twitter size={16} /></a>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(links).map(([title, items]) => (
              <div className="footer-col" key={title}>
                <h4 className="footer-col-title">{title}</h4>
                <ul>
                  {items.map(item => (
                    <li key={item.to}>
                      <Link to={item.to} className="footer-link">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Indian Local Store. All rights reserved.</p>
            <p className="footer-made">Made with <Heart size={12} fill="currentColor" color="#FF6B35" /> for local India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
