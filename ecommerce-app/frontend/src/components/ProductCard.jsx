import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find(item => item._id === product._id);

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-link">
        <img src={product.image} alt={product.name} />
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
        <button onClick={() => addToCart(product)}>Add to Cart</button>
      )}
    </div>
  );
};

export default ProductCard;
