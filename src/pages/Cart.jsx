import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { dummyProducts } from '../components/ProductGrid';
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, addToCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const [showOptionModal, setShowOptionModal] = useState(false);
  const [availableOptions, setAvailableOptions] = useState([]);

  // 🔹 Retail / Wholesale toggle (frontend only)
  const [userType, setUserType] = useState("retail"); // default = retail

  const toggleUserType = () => {
    setUserType((prev) => (prev === "retail" ? "wholesale" : "retail"));
  };

  // Mock delivery pincodes
  const deliveryPincodes = ["560001", "110001"];
  const userPincode = "560001";

  const handleCheckout = () => {
    if (!user) {
      alert('Please log in to proceed to checkout.');
      navigate('/login?redirectTo=/checkout'); // keeping as-is
      return;
    }

    if (deliveryPincodes.includes(userPincode)) {
      setAvailableOptions(["Delivery", "Takeaway"]);
      setShowOptionModal(true);
    } else {
      alert("Delivery is not available for your location. Please choose Takeaway.");
      // ✅ Route based on userType when delivery not available
      if (userType === "wholesale") {
        navigate('/checkout-wholesale', { state: { orderType: "takeaway", userType } });
      } else {
        navigate('/checkout', { state: { orderType: "takeaway", userType } });
      }
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const price = parseFloat(item.price);
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  // Recommendation logic
  const recommendedProducts = dummyProducts
    .filter(
      (p) =>
        !cartItems.find((item) => item._id === p._id) &&
        (p.category === 'exotic' || p.category === 'vegetable')
    )
    .slice(0, 4);

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2 className="cart-heading">Your Cart</h2>

        {/* 🔹 Retail / Wholesale Toggle */}
        <div className="user-type-toggle">
          <span className={userType === "retail" ? "active" : ""}>Retail</span>
          <label className="switch">
            <input type="checkbox" checked={userType === "wholesale"} onChange={toggleUserType} />
            <span className="slider"></span>
          </label>
          <span className={userType === "wholesale" ? "active" : ""}>Wholesale</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p>No items in cart</p>
          <button
            className="start-shopping-btn"
            onClick={() => navigate("/shop")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>Price: {item.price}</p>
              </div>

              <div className="item-actions">
                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() =>
                      updateQuantity(item._id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() =>
                      updateQuantity(item._id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* 🔹 Recommended Section */}
          {recommendedProducts.length > 0 && (
            <div className="recommended-section">
              <h3>You may also like</h3>
              <div className="recommended-grid">
                {recommendedProducts.map((product) => (
                  <div key={product._id} className="recommended-card">
                    <img src={product.image} alt={product.name} />
                    <h4>{product.name}</h4>
                    <p>{product.price}</p>
                    <button onClick={() => addToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checkout Summary */}
          <div className="cart-summary">
            <h3>Total: ₹{calculateTotal()}</h3>
            <div className="cart-buttons">
              <button className="continue-shopping-btn" onClick={() => navigate('/shop')}>
                Continue Shopping
              </button>
              <button className="z-checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Option Modal */}
      {showOptionModal && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Choose Order Type</h3>
            {availableOptions.includes("Delivery") && (
              <button
                className="popup-btn"
                onClick={() =>
                  userType === "wholesale"
                    ? navigate('/checkout-wholesale', { state: { orderType: "delivery", userType } })
                    : navigate('/checkout', { state: { orderType: "delivery", userType } })
                }
              >
                Delivery
              </button>
            )}
            {availableOptions.includes("Takeaway") && (
              <button
                className="popup-btn"
                onClick={() =>
                  userType === "wholesale"
                    ? navigate('/checkout-wholesale', { state: { orderType: "takeaway", userType } })
                    : navigate('/checkout', { state: { orderType: "takeaway", userType } })
                }
              >
                Takeaway
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
