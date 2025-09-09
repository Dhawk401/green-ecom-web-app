// src/components/ProductCard.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';
import '../styles/ProductCard.css';

function getOptimizedPaths(originalPath) {
  if (!originalPath || typeof originalPath !== 'string') return null;

  const normalized = originalPath.startsWith('/') ? originalPath.slice(1) : originalPath;

  if (normalized.startsWith('assets/optimized/')) {
    const withoutExt = normalized.replace(/\.[^/.]+$/, '');
    const base = `/${withoutExt}`;
    return {
      primary: `${base}-800.webp`,
      srcSet: `${base}-400.webp 400w, ${base}-800.webp 800w, ${base}-1200.webp 1200w`,
      placeholder: `${base}-small.jpg`,
    };
  }

  const rel = normalized.replace(/^assets\//, '');
  const parsed = rel.replace(/\.[^/.]+$/, '');
  const base = `/assets/optimized/${parsed}`;
  return {
    primary: `${base}-800.webp`,
    srcSet: `${base}-400.webp 400w, ${base}-800.webp 800w, ${base}-1200.webp 1200w`,
    placeholder: `${base}-small.jpg`,
  };
}

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const cartItem = cartItems.find(item => item._id === product._id);

  const optimized = getOptimizedPaths(product.image);
  const originalSrc = product.image && product.image.startsWith('/') ? product.image : `/${product.image}`;

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-link">
        <div className="product-thumb">
          <LazyImage
            src={optimized ? optimized.primary : originalSrc}
            srcSet={optimized ? optimized.srcSet : undefined}
            sizes="(max-width:600px) 100vw, 33vw"
            placeholder={optimized ? optimized.placeholder : undefined}
            alt={product.name}
            fallbackSrc={originalSrc}
          />
        </div>

        <h3>{product.name}</h3>
        <p>{product.price}</p>
      </Link>

      {cartItem ? (
        <div className="quantity-controls1">
          <button
            className="qty-btn1"
            onClick={() => updateQuantity(product._id, cartItem.quantity - 1)}
          >
            −
          </button>
          <span>{cartItem.quantity}</span>
          <button
            className="qty-btn1"
            onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
          >
            +
          </button>
        </div>
      ) : (
        <button className="add-to-cart-btn" onClick={() => addToCart(product)}>Add to Cart</button>
      )}
    </div>
  );
};

export default ProductCard;
