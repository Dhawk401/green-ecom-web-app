import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // ✅ NEW
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { user } = useUser(); // ✅ NEW
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      alert('Please log in to proceed to checkout.');
      navigate('/login?redirectTo=/checkout'); // ✅ Redirect with param
      return;
    }

    navigate('/checkout');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price);
      return total + price * item.quantity;
    }, 0).toFixed(2);
  };

  return (
    <div className="cart-container">
      <h2 className="cart-heading">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart">No items in cart.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>Price: {item.price}</p>
                <div className="quantity-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item._id)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <h3>Total: ₹{calculateTotal()}</h3>
            <button className="continue-shopping-btn" onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>
            <button className="z-checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
