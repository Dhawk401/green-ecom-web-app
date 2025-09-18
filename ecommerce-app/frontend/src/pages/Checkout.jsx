// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Checkout.css";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  // receive orderType and userType from Cart (if provided)
  const [checkoutMode, setCheckoutMode] = useState("delivery");
  const [userType, setUserType] = useState("retail");
  const [deliveryError, setDeliveryError] = useState("");
  const [step, setStep] = useState(1);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("gpay");

  // UI: wallet balance (frontend-only)
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (location.state?.orderType) setCheckoutMode(location.state.orderType);
    if (location.state?.userType) setUserType(location.state.userType);

    const stored = sessionStorage.getItem("walletBalance") || localStorage.getItem("walletBalance");
    const numeric = stored ? parseFloat(stored) : 0;
    setWalletBalance(Number.isFinite(numeric) ? numeric : 0);
  }, [location.state]);

  const deliveryZipCodes = ["403001", "403002", "403003"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "zip" && checkoutMode === "delivery") {
      if (deliveryZipCodes.includes(value)) {
        setDeliveryError("");
      } else if (value.trim() !== "") {
        setCheckoutMode("takeaway");
        setDeliveryError("Delivery not available in your area. Switched to Takeaway.");
      } else {
        setDeliveryError("");
      }
    }
  };

  const isFormValid = () => {
    if (checkoutMode === "delivery") {
      return (
        formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.email.trim() &&
        formData.zip.trim() &&
        formData.address.trim() &&
        formData.city.trim() &&
        formData.state.trim() &&
        formData.phone.trim()
      );
    }
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.zip.trim() &&
      formData.phone.trim()
    );
  };

  const toNumber = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  // try to prefer finalPrice (product-level) else parse numeric price
  const lineSubtotal = (item) => {
    const unit = toNumber(item.finalPrice ?? item.price ?? item.unitPrice ?? 0);
    const qty = Number(item.quantity || 0);
    return unit * qty;
  };

  const calculateTotal = () =>
    cartItems.reduce((sum, item) => sum + lineSubtotal(item), 0).toFixed(2);

  const handleNext = (e) => {
    e?.preventDefault?.();
    if (step === 1) {
      if (!isFormValid()) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const newOrder = {
      id: Date.now(),
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
      status: "Confirmed",
      mode: checkoutMode,
      total: `₹${calculateTotal()}`,
      items: cartItems,
      customer: formData,
      payment: {
        method: paymentMethod,
        timing: "now",
      },
      userType: userType || "retail",
    };

    addOrder(newOrder);
    sessionStorage.setItem("justPlacedOrderId", String(newOrder.id));
    sessionStorage.setItem("justPlacedOrderMode", newOrder.mode);
    clearCart();
    navigate("/orders");
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="stepper">
        <div className={`step-item ${step > 1 ? "completed" : step === 1 ? "active" : ""}`}>
          <div className="step-circle">1</div>
          <p className="step-title">Details</p>
        </div>
        <div className={`step-item ${step > 2 ? "completed" : step === 2 ? "active" : ""}`}>
          <div className="step-circle">2</div>
          <p className="step-title">Review</p>
        </div>
        <div className={`step-item ${step === 3 ? "active" : ""}`}>
          <div className="step-circle">3</div>
          <p className="step-title">Payment</p>
        </div>
      </div>

      {step === 1 && (
        <form className="checkout-form" onSubmit={handleNext}>
          <div className="row">
            <input name="firstName" placeholder="First Name" value={formData.firstName} required onChange={handleChange} />
            <input name="lastName" placeholder="Last Name" value={formData.lastName} required onChange={handleChange} />
          </div>

          <input type="email" name="email" placeholder="Email Address" value={formData.email} required onChange={handleChange} />

          <div className="row">
            <input name="zip" placeholder="Zip/Postal Code" value={formData.zip} required onChange={handleChange} />
          </div>

          {checkoutMode === "delivery" && (
            <>
              <input name="address" placeholder="Street Address" value={formData.address} required onChange={handleChange} />
              <div className="row">
                <input name="state" placeholder="State/Province" value={formData.state} required onChange={handleChange} />
                <input name="city" placeholder="City" value={formData.city} required onChange={handleChange} />
              </div>
            </>
          )}

          <input name="phone" placeholder="Phone Number" value={formData.phone} required onChange={handleChange} />

          {deliveryError && <p className="error">{deliveryError}</p>}

          <button className="next-button" type="submit" disabled={!isFormValid()}>
            Next
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="order-summary">
          <h3>Order Summary</h3>
          <ul className="cart-summary-list">
            {cartItems.map((item) => {
              const unit = lineSubtotal({ ...item, quantity: 1 }); // subtotal per 1 item
              const qty = item.quantity || 0;
              const subtotal = (toNumber(unit) * qty).toFixed(2);
              return (
                <li key={item._id || item.id} className="cart-summary-item">
                  {item.image && <img src={item.image} alt={item.name} />}
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      ₹{toNumber(item.finalPrice ?? item.price ?? 0).toFixed(2)} × {qty} = <b>₹{subtotal}</b>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="total-amount">
            Total: <strong>₹{calculateTotal()}</strong>
          </p>

          <div className="customer-details">
            <h4>Customer Details</h4>
            <p>{formData.firstName} {formData.lastName}</p>
            <p>{formData.email}</p>
            <p>{formData.phone}</p>
            {checkoutMode === "delivery" ? (
              <>
                <p>{formData.address}</p>
                <p>{formData.city}, {formData.state}, {formData.zip}</p>
              </>
            ) : (
              <p><em>Takeaway order</em></p>
            )}
          </div>

          <div className="review-buttons">
            <button type="button" onClick={() => setStep(1)}>Back</button>
            <button className="next-button" onClick={() => setStep(3)}>Proceed to Payment</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="checkout-section">
          <h3>Select Payment Method</h3>
          <div className="payment-options">
            <label className={`payment-card ${paymentMethod === "gpay" ? "selected" : ""}`}>
              <input type="radio" name="payment" value="gpay" checked={paymentMethod === "gpay"} onChange={() => setPaymentMethod("gpay")} />
              <div className="payment-icon">💳</div>
              <span>Google Pay</span>
            </label>

            <label className={`payment-card ${paymentMethod === "cod" ? "selected" : ""}`}>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
              <div className="payment-icon">💵</div>
              <span>Cash on Delivery</span>
            </label>

            <label className={`payment-card ${paymentMethod === "balance" ? "selected" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="balance"
                checked={paymentMethod === "balance"}
                onChange={() => setPaymentMethod("balance")}
              />
              <div className="payment-icon">🪙</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span>Pay with Balance</span>
                <small style={{ color: "#666", marginTop: 4 }}>
                  Wallet Balance: <strong>₹{walletBalance.toFixed(2)}</strong>
                </small>
              </div>
            </label>
          </div>

          <p className="total-amount" style={{ textAlign: "left", marginTop: 8 }}>
            Total: <strong>₹{calculateTotal()}</strong>
          </p>

          <div className="review-buttons">
            <button type="button" onClick={() => setStep(2)}>Back</button>
            <button className="pay-button" onClick={handlePlaceOrder}>Place Order</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
