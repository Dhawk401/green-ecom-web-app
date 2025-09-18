// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { useOrders } from "../context/OrdersContext";
import { dummyProducts } from "../components/ProductGrid";
import "../styles/Cart.css";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    addToCart,
    clearCart,
    addMultipleToCart,
  } = useCart();
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

  // Helper to parse numeric price from different shapes
  const parsePriceNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const m = val.match(/([\d,.]+)/);
      if (m) {
        return parseFloat(m[1].replace(/,/g, "")) || 0;
      }
      const n = parseFloat(val);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  // Normalize an order item so the cart always gets items with finalPrice (number), selectedWeight and quantity
  const normalizeOrderItemForCart = (item) => {
    const clone = { ...item };
    // prefer finalPrice, fallback to price -> parse number if string
    if (clone.finalPrice === undefined || clone.finalPrice === null) {
      clone.finalPrice = parsePriceNumber(clone.price);
    } else {
      // if string, try parsing
      clone.finalPrice =
        typeof clone.finalPrice === "string"
          ? parsePriceNumber(clone.finalPrice)
          : clone.finalPrice;
    }

    // ensure selectedWeight
    if (!clone.selectedWeight) {
      // candidates: 'selectedWeight' or if weight-like data present in item.weight or price string unit
      clone.selectedWeight = clone.selectedWeight || clone.weight || "unit";
    }

    // ensure quantity
    clone.quantity = Number.isFinite(Number(clone.quantity)) ? Number(clone.quantity) : 1;
    return clone;
  };

  // when arriving to cart with edit order state
  useEffect(() => {
    const incomingEditId = location.state?.editOrderId;
    const incomingItems = location.state?.items || null;

    // also support sessionStorage fallback (in case of refresh/navigation)
    const storedEdit = sessionStorage.getItem("editingOrderId");

    if (incomingEditId || storedEdit) {
      const idToUse = incomingEditId || Number(storedEdit);
      setEditMode(true);
      setEditOrderId(idToUse);
      sessionStorage.setItem("editingOrderId", String(idToUse));

      // if items provided in navigation, normalize and add them
      if (incomingItems && incomingItems.length) {
        const normalized = incomingItems.map(normalizeOrderItemForCart);
        clearCart();
        addMultipleToCart(normalized);
      } else {
        // If no items were provided (e.g., page refreshed), we can't reconstruct items reliably here.
        // That's ok — the Orders data is persisted in localStorage; for a robust implementation
        // you can read the OrdersContext and fetch that order's items and hydrate the cart.
        // For now do nothing (cart will show whatever is currently in localStorage/cart)
      }
    } else {
      // Make sure we are not in edit mode accidentally
      setEditMode(false);
      setEditOrderId(null);
      sessionStorage.removeItem("editingOrderId");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const deliveryPincodes = ["560001", "110001"];
  const userPincode = "560001";

  // calculate total using finalPrice fallback to price (string)
  const calculateTotal = () =>
    cartItems
      .reduce((t, i) => {
        const priceNum =
          i.finalPrice !== undefined && i.finalPrice !== null
            ? (typeof i.finalPrice === "string" ? parsePriceNumber(i.finalPrice) : Number(i.finalPrice))
            : parsePriceNumber(i.price);
        const qty = Number(i.quantity || 0);
        return t + priceNum * qty;
      }, 0)
      .toFixed(2);

  const handleConfirmChanges = () => {
    if (!editOrderId) {
      alert("No order selected to update.");
      return;
    }
    // normalize cart items before sending to updateOrder
    const normalized = cartItems.map((it) => ({
      ...it,
      finalPrice:
        it.finalPrice !== undefined && it.finalPrice !== null
          ? typeof it.finalPrice === "string"
            ? parsePriceNumber(it.finalPrice)
            : Number(it.finalPrice)
          : parsePriceNumber(it.price),
      quantity: Number(it.quantity || 0),
      selectedWeight: it.selectedWeight || "unit",
    }));

    updateOrder(editOrderId, normalized);
    clearCart();
    setEditMode(false);
    setEditOrderId(null);
    sessionStorage.removeItem("editingOrderId");
    navigate("/orders");
  };

  const handleCancelOrder = () => {
    if (!window.confirm("Cancel this order?")) return;
    if (!editOrderId) {
      alert("No order selected to cancel.");
      return;
    }
    cancelOrder(editOrderId);
    clearCart();
    setEditMode(false);
    setEditOrderId(null);
    sessionStorage.removeItem("editingOrderId");
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
                  Price: ₹{item.finalPrice ?? item.price} / {item.selectedWeight}
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
