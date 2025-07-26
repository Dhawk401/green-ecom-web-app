import React from 'react';
import { useCart } from '../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/CartBar.css';

const CartBar = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  // ❌ Do NOT show the bar if no items or we're on the /cart page
  if (
        itemCount === 0 ||
        ['/cart', '/profile', '/checkout', '/signup', '/login', '/about', '/contact','/edit-profile','/complete-account', '/account-details', '/SignupForm'].includes(location.pathname)
        ) return null;


  return (
    <div className="cart-bottom-bar">
      <span>{itemCount} item{itemCount > 1 ? 's' : ''} added</span>
      <button className="view-cart-btn" onClick={() => navigate('/cart')}>View Cart →</button>
    </div>
  );
};

export default CartBar;
