import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css'; // Assuming you have a CSS file for styles

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-section">
          <h3 className="footer-title">Greensure Daily</h3>
          <p>Your destination for affordable green products.</p>
        </div>
        <div className="footer-section">
          <h4 className="footer-subtitle">Quick Links</h4>
          <ul>
            <li><Link to="/" className="footer-link">Home</Link></li>
            <li><Link to="/shop" className="footer-link">Shop</Link></li>
            <li><Link to="/about" className="footer-link">About</Link></li>
            <li><Link to="/contact" className="footer-link">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4 className="footer-subtitle">Support</h4>
          <ul>
            <li><a href="#" className="footer-link">FAQs</a></li>
            <li><a href="#" className="footer-link">Delivery Queries</a></li>
            <li><a href="#" className="footer-link">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4 className="footer-subtitle">Contact</h4>
          <p>Email: support@greenuredaily.in</p>
          <p>Phone: +91 98765 43210</p>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} GreenSure Daily. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
