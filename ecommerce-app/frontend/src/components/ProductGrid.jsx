// src/components/ProductGrid.jsx
import React, { useEffect, useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import '../styles/ProductGrid.css'; // Assuming you have a CSS file for styles

export const dummyProducts = [
  {
    _id: '1',
    name: 'Tomato',
    image: '/assets/cat-tomato.jpg',
    price: '40/kg',
    category: 'vegetable',
  },
  {
    _id: '2',
    name: 'Potato',
    image: '/assets/cat-potato.jpg',
    price: '25/kg',
    category: 'vegetable',
  },
  {
    _id: '3',
    name: 'Onion',
    image: '/assets/cat-onion.jpg',
    price: '40/kg',
    category: 'vegetable',
  },
  {
    _id: '4',
    name: 'Cabbage',
    image: '/assets/cat-cabbage.jpg',
    price: '30/kg',
    category: 'vegetable',
  },
  {
    _id: '5',
    name: 'Broccoli',
    image: '/assets/cat-broccoli.jpg',
    price: '60/kg',
    category: 'exotic',
  },
  {
    _id: '6',
    name: 'Zucchini',
    image: '/assets/cat-zucchini.jpg',
    price: '70/kg',
    category: 'exotic',
  },
  {
    _id: '7',
    name: 'Bell Pepper (Red)',
    image: '/assets/cat-bellpepper-red.jpg',
    price: '90/kg',
    category: 'exotic',
  },
  {
    _id: '8',
    name: 'Bell Pepper (Yellow)',
    image: '/assets/cat-bellpepper-yellow.jpg',
    price: '90/kg',
    category: 'exotic',
  },
  {
    _id: '9',
    name: 'Asparagus',
    image: '/assets/cat-asparagus.jpg',
    price: '150/bunch',
    category: 'exotic',
  },
  {
    _id: '10',
    name: 'Avocado',
    image: '/assets/cat-avocado.jpg',
    price: '120/piece',
    category: 'exotic',
  },
  {
    _id: '11',
    name: 'Lettuce',
    image: '/assets/cat-lettuce.jpg',
    price: '50/kg',
    category: 'exotic',
  },
  {
    _id: '12',
    name: 'Spinach',
    image: '/assets/cat-spinach.jpg',
    price: '35/bundle',
    category: 'vegetable',
  },
  {
    _id: '13',
    name: 'Sweet Corn',
    image: '/assets/cat-sweetcorn.jpg',
    price: '45/piece',
    category: 'vegetable',
  },
  {
    _id: '14',
    name: 'Carrot',
    image: '/assets/cat-carrot.jpg',
    price: '40/kg',
    category: 'vegetable',
  },
  {
    _id: '15',
    name: 'Brussels Sprouts',
    image: '/assets/cat-brussels.jpg',
    price: '140/kg',
    category: 'exotic',
  }
];

const ProductGrid = ({ title, limit, selectedCategory: categoryProp = 'all', searchTerm = '' }) => {
  const [activeCategory, setActiveCategory] = useState(categoryProp);

  // compute filteredProducts using useMemo for small perf gain
  const filteredProducts = useMemo(() => {
    let filtered = dummyProducts;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [activeCategory, searchTerm, limit]);

  // simple add-to-cart handler passed to ProductCard (keeps backward compatibility)
  const handleAddToCart = (product) => {
    // if your ProductCard uses context internally this won't be used, but it's safe to pass.
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="container">
      <h2 className="section-title">{title}</h2>

      {/* Show category buttons if no external category is passed */}
      {!limit && (
        <div className="category-buttons">
          <button
            onClick={() => setActiveCategory('all')}
            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('vegetable')}
            className={`category-btn ${activeCategory === 'vegetable' ? 'active' : ''}`}
          >
            Vegetables
          </button>
          <button
            onClick={() => setActiveCategory('exotic')}
            className={`category-btn ${activeCategory === 'exotic' ? 'active' : ''}`}
          >
            Exotic Vegetables
          </button>
        </div>
      )}

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            // pass onAddToCart so ProductCard can use it if needed
            <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
          ))
        ) : (
          <p style={{ marginTop: '1rem' }}>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
