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
                <div className="logo-icon"><Store size={18} /></div>
                <span className="logo-text">Indian<span className="logo-accent">LocalStore</span></span>
              </div>
              <p className="footer-desc">
                Connecting you with the best local Indian shops and products. Support local businesses, shop fresh, live better.
              </p>
              <div className="footer-contact">
                <a href="mailto:support@indianlocalstore.in" className="footer-contact-item">
                  <Mail size={14} /> support@indianlocalstore.in
                </a>
                <a href="tel:+919876543210" className="footer-contact-item">
                  <Phone size={14} /> +91 98765 43210
                </a>
                <span className="footer-contact-item">
                  <MapPin size={14} /> India 🇮🇳
                </span>
              </div>
              <div className="footer-social">
                <a href="#" className="social-btn" aria-label="Instagram"><Instagram size={16} /></a>
                <a href="#" className="social-btn" aria-label="YouTube"><Youtube size={16} /></a>
                <a href="#" className="social-btn" aria-label="Twitter"><Twitter size={16} /></a>
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
