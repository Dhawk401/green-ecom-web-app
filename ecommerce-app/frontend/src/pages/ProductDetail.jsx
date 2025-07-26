import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { dummyProducts } from '../components/ProductGrid';
import '../styles/ProductDetail.css'; // Assuming you have a CSS file for styles

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = dummyProducts.find(p => p._id === id);

  if (!product) return <p>Product not found</p>;

  return (
    <div className="product-detail-wrapper">
      <div className="product-detail-card">
        <img src={product.image} alt={product.name} />
        <div className="product-info">
          <h2>{product.name}</h2>
          <p className="product-price">{product.price}</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fresh and organic.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="product-btn" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
            <button className="product-btn" onClick={() => navigate('/shop')}>
              ← Back to Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
