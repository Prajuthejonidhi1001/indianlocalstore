import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon"><Store size={20} /></div>
              <span>Indian<span className="logo-accent">LocalStore</span></span>
            </div>
            <p className="footer-desc">
              Connecting you with the best local Indian shops and products near you. Support local, shop smart.
            </p>
            <div className="footer-social">
              <a href="#" className="social-btn" aria-label="Facebook"><Facebook size={16} /></a>
              <a href="#" className="social-btn" aria-label="Twitter"><Twitter size={16} /></a>
              <a href="#" className="social-btn" aria-label="Instagram"><Instagram size={16} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/shops">Nearby Shops</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="contact-list">
              <li><Mail size={14} /> support@indianlocalstore.in</li>
              <li><Phone size={14} /> +91 98765 43210</li>
              <li><MapPin size={14} /> India</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Indian Local Store. All rights reserved.</p>
          <p>Made with ❤️ for local businesses</p>
        </div>
      </div>
    </footer>
  );
}
