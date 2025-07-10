import React, { useState } from 'react';
import ProductGrid from '../components/ProductGrid';
import '../styles/Shop.css'; // Assuming you have a CSS file for styles

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="shop-page-wrapper">
      {/* Search Bar Below Navbar */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search for products..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="shop-page">
        <div className="shop-products">
          <ProductGrid
            title="All Products"
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
          />
        </div>
      </div>
    </div>
  );
};

export default Shop;
