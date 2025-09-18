// src/pages/CheckoutWholesale.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Checkout.css";
import { useUser } from "../context/UserContext";
import { usePrice } from "../context/PriceContext"; // <- read price toggle when user not logged in

const CREDIT_LIMITS = {
  retail: 10000,
  wholesale: 100000,
};

const CheckoutWholesale = () => {
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { userType: priceUserType } = usePrice();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", address: "", city: "", state: "", zip: "", phone: ""
  });

  const [checkoutMode, setCheckoutMode] = useState("delivery");
  const [deliveryError, setDeliveryError] = useState("");
  const [step, setStep] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentTiming, setPaymentTiming] = useState("now");
  const [userType, setUserType] = useState(() => location.state?.userType || "wholesale");

  // Wallet balance stored locally and persisted to localStorage.
  // Use Number(...) and fallback to 0. Ensure consistent numeric type.
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const raw = localStorage.getItem("walletBalance");
      const n = raw !== null ? Number(raw) : 0;
      return Number.isFinite(n) ? +n : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (location.state?.orderType) setCheckoutMode(location.state.orderType);
    if (location.state?.userType) setUserType(location.state.userType);
  }, [location.state]);

  // keep localStorage in-sync when walletBalance changes
  useEffect(() => {
    try {
      // always store normalized number with 2 decimals
      localStorage.setItem("walletBalance", String(Number(walletBalance).toFixed(2)));
    } catch (e) {
      console.error("Failed to persist walletBalance:", e);
    }
  }, [walletBalance]);

  // Determine effectiveUserType:
  // priority: logged-in user.userType -> price toggle -> local userType fallback
  const effectiveUserType = (user && user.userType)
    ? user.userType
    : (priceUserType || userType || "wholesale");

  const creditLimit = CREDIT_LIMITS[effectiveUserType] ?? CREDIT_LIMITS.wholesale;

  const deliveryZipCodes = ["403001", "403002", "403003"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "zip" && checkoutMode === "delivery") {
      if (deliveryZipCodes.includes(value)) setDeliveryError("");
      else if (value.trim() !== "") {
        setCheckoutMode("takeaway");
        setDeliveryError("Delivery not available in your area. Switched to Takeaway.");
      } else setDeliveryError("");
    }
  };

  const isFormValid = () => {
    if (checkoutMode === "delivery") {
      return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() &&
             formData.zip.trim() && formData.address.trim() && formData.city.trim() &&
             formData.state.trim() && formData.phone.trim();
    }
    return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() &&
           formData.zip.trim() && formData.phone.trim();
  };

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const lineSubtotal = (item) => toNumber(item.finalPrice ?? item.price) * (item.quantity || 0);

  const calculateTotalNumber = () => cartItems.reduce((sum, item) => sum + lineSubtotal(item), 0);

  const calculateTotal = () => Number(calculateTotalNumber()).toFixed(2);

  const goNext = (e) => { e?.preventDefault?.(); if (step === 1 && !isFormValid()) return; setStep((s) => Math.min(s + 1, 4)); };
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) { alert("Your cart is empty!"); return; }

    const numericTotal = calculateTotalNumber();
    const numericTotalRounded = Number(numericTotal.toFixed(2));

    // If paying with wallet balance, allow negative balance up to credit limit
    if (paymentMethod === "balance") {
      const newBal = +(Number(walletBalance) - numericTotalRounded);
      const allowed = -creditLimit;

      if (newBal < allowed) {
        alert(
          `Insufficient credit. Your credit limit for ${effectiveUserType} is ₹${creditLimit.toLocaleString()}. ` +
          `You can spend up to ₹${(Number(walletBalance) + creditLimit).toFixed(2)} more using wallet.`
        );
        return;
      }

      // Persist immediately to localStorage so other pages/components (Wallet, Navbar) see updated balance.
      const persisted = Number(newBal.toFixed(2));
      try {
        localStorage.setItem("walletBalance", String(persisted.toFixed(2)));
      } catch (e) {
        console.error("Failed to persist walletBalance in checkout wholesale:", e);
      }

      // Update local state too (keeps this component UI consistent)
      setWalletBalance(persisted);
    }

    const newOrder = {
      id: Date.now(),
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
      status: "Confirmed",
      mode: checkoutMode,
      total: `₹${numericTotalRounded.toFixed(2)}`,
      items: cartItems,
      customer: formData,
      userType: effectiveUserType,
      payment: { method: paymentMethod, timing: paymentTiming },
    };

    // Add order after wallet persisted so Wallet will read correct balance
    addOrder(newOrder);

    // mark just placed order for edit/logic in Orders page (keeps behaviour consistent)
    sessionStorage.setItem("justPlacedOrderId", String(newOrder.id));
    sessionStorage.setItem("justPlacedOrderMode", newOrder.mode);

    // clear cart and navigate
    clearCart();
    navigate("/orders");
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="stepper">
        <div className={`step-item ${step > 1 ? "completed" : step === 1 ? "active" : ""}`}><div className="step-circle">1</div><p className="step-title">Details</p></div>
        <div className={`step-item ${step > 2 ? "completed" : step === 2 ? "active" : ""}`}><div className="step-circle">2</div><p className="step-title">Review</p></div>
        <div className={`step-item ${step > 3 ? "completed" : step === 3 ? "active" : ""}`}><div className="step-circle">3</div><p className="step-title">Payment</p></div>
        <div className={`step-item ${step === 4 ? "active" : ""}`}><div className="step-circle">4</div><p className="step-title">Pay Now/Later</p></div>
      </div>

      {step === 1 && (
        <form className="checkout-form" onSubmit={goNext}>
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

          <button className="next-button" type="submit" disabled={!isFormValid()}>Next</button>
        </form>
      )}

      {step === 2 && (
        <div className="order-summary">
          <h3>Order Summary</h3>
          <ul className="cart-summary-list">
            {cartItems.map((item) => {
              const unit = toNumber(item.finalPrice ?? item.price);
              const qty = item.quantity || 0;
              const subtotal = (unit * qty).toFixed(2);
              return (
                <li key={item._id || item.id} className="cart-summary-item">
                  {item.image && <img src={item.image} alt={item.name} />}
                  <div><strong>{item.name}</strong><p>₹{unit.toFixed(2)} × {qty} = <b>₹{subtotal}</b></p></div>
                </li>
              );
            })}
          </ul>

          <p className="total-amount" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>User: <span className="badge-user-type">{(effectiveUserType || "wholesale").toUpperCase()}</span></span>
            <span>Total: <strong>₹{calculateTotal()}</strong></span>
          </p>

          <div className="customer-details">
            <h4>Customer Details</h4>
            <p>{formData.firstName} {formData.lastName}</p>
            <p>{formData.email}</p>
            <p>{formData.phone}</p>
            {checkoutMode === "delivery" ? (<><p>{formData.address}</p><p>{formData.city}, {formData.state}, {formData.zip}</p></>) : (<p><em>Takeaway order</em></p>)}
          </div>

          <div className="review-buttons">
            <button type="button" onClick={goBack}>Back</button>
            <button className="next-button" onClick={goNext}>Proceed to Payment</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="checkout-section">
          <h3>Select Payment Method</h3>

          <p className="total-amount" style={{ marginTop: 0 }}>Total: <strong>₹{calculateTotal()}</strong></p>

          <div className="payment-options">
            <label className={`payment-card ${paymentMethod === "cash" ? "selected" : ""}`}>
              <input type="radio" name="payment" value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} />
              <div className="payment-icon">💵</div><span>Cash</span>
            </label>

            <label className={`payment-card ${paymentMethod === "upi" ? "selected" : ""}`}>
              <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
              <div className="payment-icon">📱</div><span>GPay / UPI</span>
            </label>

            <label className={`payment-card ${paymentMethod === "banktransfer" ? "selected" : ""}`}>
              <input type="radio" name="payment" value="banktransfer" checked={paymentMethod === "banktransfer"} onChange={() => setPaymentMethod("banktransfer")} />
              <div className="payment-icon">🏦</div><span>Bank Transfer</span>
            </label>

            <label className={`payment-card ${paymentMethod === "cheque" ? "selected" : ""}`}>
              <input type="radio" name="payment" value="cheque" checked={paymentMethod === "cheque"} onChange={() => setPaymentMethod("cheque")} />
              <div className="payment-icon">✒️</div><span>Cheque</span>
            </label>

            <label className={`payment-card ${paymentMethod === "balance" ? "selected" : ""}`}>
              <input type="radio" name="payment" value="balance" checked={paymentMethod === "balance"} onChange={() => setPaymentMethod("balance")} />
              <div className="payment-icon">🪙</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span>Pay with Balance</span>
                <small style={{ color: "#666", marginTop: 4 }}>
                  Wallet Balance: <strong>₹{Number(walletBalance).toFixed(2)}</strong>
                </small>
              </div>
            </label>
          </div>

          <div className="review-buttons">
            <button type="button" onClick={goBack}>Back</button>
            <button className="next-button" onClick={() => setStep(4)}>Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="checkout-section">
          <h3>When would you like to pay?</h3>

          <div className="timing-options">
            <label className={`timing-card ${paymentTiming === "now" ? "selected" : ""}`}>
              <input type="radio" name="timing" value="now" checked={paymentTiming === "now"} onChange={() => setPaymentTiming("now")} />
              <div className="timing-icon">⚡</div><span>Pay Now</span><small>Complete payment during checkout</small>
            </label>

            <label className={`timing-card ${paymentTiming === "later" ? "selected" : ""}`}>
              <input type="radio" name="timing" value="later" checked={paymentTiming === "later"} onChange={() => setPaymentTiming("later")} />
              <div className="timing-icon">⏳</div><span>Pay Later</span><small>We’ll follow up with payment instructions</small>
            </label>
          </div>

          <div className="review-buttons">
            <button type="button" onClick={goBack}>Back</button>
            <button className="pay-button" onClick={handlePlaceOrder}>Place Order</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutWholesale;
