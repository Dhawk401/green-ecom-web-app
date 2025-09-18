// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { useOrders } from "../context/OrdersContext";
import { dummyProducts } from "../components/ProductGrid";
import "../styles/Cart.css";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, addToCart, clearCart, addMultipleToCart } =
    useCart();
  const { user } = useUser();
  const { updateOrder, cancelOrder } = useOrders();
  const navigate = useNavigate();
  const location = useLocation();

  const [showOptionModal, setShowOptionModal] = useState(false);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [userType, setUserType] = useState("retail");
  const [editMode, setEditMode] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);

  const toggleUserType = () =>
    setUserType((p) => (p === "retail" ? "wholesale" : "retail"));

  useEffect(() => {
    if (location.state?.editOrderId) {
      setEditMode(true);
      setEditOrderId(location.state.editOrderId);
      clearCart();
      addMultipleToCart(location.state.items || []);
    }
  }, [location.state]);

  const deliveryPincodes = ["560001", "110001"];
  const userPincode = "560001";

  const calculateTotal = () =>
    cartItems
      .reduce((t, i) => t + parseFloat(i.finalPrice) * i.quantity, 0)
      .toFixed(2);

  const handleConfirmChanges = () => {
    updateOrder(editOrderId, cartItems);
    clearCart();
    navigate("/orders");
  };

  const handleCancelOrder = () => {
    if (!window.confirm("Cancel this order?")) return;
    cancelOrder(editOrderId);
    clearCart();
    navigate("/orders");
  };

  const handleCheckout = () => {
    if (!user) {
      alert("Please log in to proceed to checkout.");
      navigate("/login?redirectTo=/checkout");
      return;
    }
    if (deliveryPincodes.includes(userPincode)) {
      setAvailableOptions(["Delivery", "Takeaway"]);
      setShowOptionModal(true);
    } else {
      alert("Delivery is not available for your location. Please choose Takeaway.");
      navigate(userType === "wholesale" ? "/checkout-wholesale" : "/checkout", {
        state: { orderType: "takeaway", userType },
      });
    }
  };

  const recommendedProducts = dummyProducts
    .filter(
      (p) =>
        !cartItems.find((c) => c._id === p._id) &&
        (p.category === "exotic" || p.category === "vegetable")
    )
    .slice(0, 4);

  return (
    <div className="cart-container">
      <div className="cart-header">
        {cartItems.length > 0 && !editMode && (
          <button
            className="top-continue-btn"
            onClick={() => navigate("/shop")}
          >
            ← Continue Shopping
          </button>
        )}
        <h2 className="cart-heading">
          {editMode ? "Edit Order" : "Your Cart"}
        </h2>
        {!editMode && (
          <div className="user-type-toggle">
            <span className={userType === "retail" ? "active" : ""}>Retail</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={userType === "wholesale"}
                onChange={toggleUserType}
              />
              <span className="slider" />
            </label>
            <span className={userType === "wholesale" ? "active" : ""}>
              Wholesale
            </span>
          </div>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p>No items {editMode ? "in this order" : "in cart"}</p>
          {!editMode && (
            <button
              className="start-shopping-btn"
              onClick={() => navigate("/shop")}
            >
              Start Shopping
            </button>
          )}
        </div>
      ) : (
        <>
          {cartItems.map((item) => (
            <div
              key={`${item._id}-${item.selectedWeight}`}
              className="cart-item"
            >
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>
                  Price: ₹{item.finalPrice} / {item.selectedWeight}
                </p>
              </div>

              <div className="item-actions">
                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() =>
                      updateQuantity(
                        item._id,
                        item.selectedWeight,
                        item.quantity - 1
                      )
                    }
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() =>
                      updateQuantity(
                        item._id,
                        item.selectedWeight,
                        item.quantity + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item._id, item.selectedWeight)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {recommendedProducts.length > 0 && !editMode && (
            <div className="recommended-section">
              <h3>You may also like</h3>
              <div className="recommended-grid">
                {recommendedProducts.map((p) => (
                  <div key={p._id} className="recommended-card">
                    <img src={p.image} alt={p.name} />
                    <h4>{p.name}</h4>
                    <p>{p.price}</p>
                    <button onClick={() => addToCart(p)}>Add to Cart</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="cart-summary">
            <h3>Total: ₹{calculateTotal()}</h3>
            <div className="cart-buttons">
              {editMode ? (
                <>
                  <button
                    className="cancel-order-btn"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </button>
                  <button
                    className="confirm-changes-btn"
                    onClick={handleConfirmChanges}
                  >
                    Confirm Changes
                  </button>
                </>
              ) : (
                <>
                  <button className="continue-shopping-btn" onClick={clearCart}>
                    Empty Cart
                  </button>
                  <button className="z-checkout-btn" onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {showOptionModal && !editMode && (
        <div
          className="popup-overlay"
          onClick={() => setShowOptionModal(false)}
        >
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Choose Order Type</h3>
            {availableOptions.includes("Delivery") && (
              <button
                className="popup-btn"
                onClick={() =>
                  navigate(
                    userType === "wholesale"
                      ? "/checkout-wholesale"
                      : "/checkout",
                    { state: { orderType: "delivery", userType } }
                  )
                }
              >
                Delivery
              </button>
            )}
            {availableOptions.includes("Takeaway") && (
              <button
                className="popup-btn"
                onClick={() =>
                  navigate(
                    userType === "wholesale"
                      ? "/checkout-wholesale"
                      : "/checkout",
                    { state: { orderType: "takeaway", userType } }
                  )
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
