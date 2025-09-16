// src/components/ProductCard.jsx
import React, { useState, useMemo } from 'react';
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

function buildPriceOptions(price) {
  if (!price && price !== 0) return { "1": "N/A" };

  if (typeof price === 'object') {
    return price;
  }

  if (typeof price === 'number') {
    return { "1": price };
  }

  if (typeof price === 'string') {
    const m = price.match(/([\d,.]+)\s*\/\s*([a-zA-Z]+)/);
    if (m) {
      const rawNum = m[1].replace(/,/g, '');
      const num = parseFloat(rawNum);
      const unit = m[2].toLowerCase();

      if (!Number.isNaN(num)) {
        if (unit === 'kg' || unit === 'kgs') {
          return {
            "500g": +(num / 2),
            "1kg": +num,
          };
        }
        return { [`1${unit}`]: +num };
      }
    }
    return { "1": price };
  }

  return { "1": String(price) };
}

const formatPrice = (val) => {
  if (typeof val === 'number' && !Number.isNaN(val)) {
    return Number.isInteger(val) ? `${val}` : `${val.toFixed(2)}`;
  }
  return String(val);
};

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const optimized = getOptimizedPaths(product.image);
  const originalSrc =
    product.image && product.image.startsWith('/')
      ? product.image
      : `/${product.image}`;

  const priceOptions = useMemo(() => buildPriceOptions(product.price), [product.price]);

  const orderedKeys = useMemo(() => {
    const keys = Object.keys(priceOptions);
    if (keys.includes('500g') && keys.includes('1kg')) {
      return ['500g', '1kg'];
    }
    return keys;
  }, [priceOptions]);

  const [selectedWeight, setSelectedWeight] = useState(orderedKeys[0]);

  // 🔑 Match by both _id and selectedWeight
  const cartItem = cartItems.find(
    item => item._id === product._id && item.selectedWeight === selectedWeight
  );

  const handleAddToCart = () => {
    const rawPrice = priceOptions[selectedWeight];
    const finalProduct = {
      ...product,
      selectedWeight,
      finalPrice: rawPrice,
    };
    addToCart(finalProduct);
  };

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
        <p>
          ₹{formatPrice(priceOptions[selectedWeight])} / {selectedWeight}
        </p>
      </Link>

      {/* ✅ Weight toggle buttons */}
      {Object.keys(priceOptions).length > 1 && (
        <div className="weight-toggle">
          {orderedKeys.map((w) => (
            <button
              key={w}
              type="button"
              className={`weight-btn ${selectedWeight === w ? 'active' : ''}`}
              onClick={() => setSelectedWeight(w)}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {cartItem ? (
        <div className="quantity-controls1">
          <button
            className="qty-btn1"
            onClick={() =>
              updateQuantity(product._id, selectedWeight, cartItem.quantity - 1)
            }
          >
            −
          </button>
          <span>{cartItem.quantity}</span>
          <button
            className="qty-btn1"
            onClick={() =>
              updateQuantity(product._id, selectedWeight, cartItem.quantity + 1)
            }
          >
            +
          </button>
        </div>
      ) : (
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      )}
    </div>
  );
};

export default ProductCard;
