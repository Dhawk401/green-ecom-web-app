import React from 'react';
import '../styles/Newsletter.css'; // Assuming you have a CSS file for styles

const NewsletterSubscribe = () => {
  return (
    <div className="newsletter-section">
      <div className="newsletter-container">
        <h2 className="newsletter-heading">Subscribe to our Newsletter</h2>
        <p className="newsletter-text">Get updates about new arrivals, offers, and more.</p>
        <form className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email"
            className="newsletter-input"
          />
          <button type="submit" className="newsletter-button">
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSubscribe;
