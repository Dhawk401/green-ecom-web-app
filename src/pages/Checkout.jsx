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

  const [checkoutMode, setCheckoutMode] = useState("delivery");
  const [deliveryError, setDeliveryError] = useState("");
  const [step, setStep] = useState(1);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("gpay");

  useEffect(() => {
    if (location.state?.orderType) {
      setCheckoutMode(location.state.orderType);
    }
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

  const lineSubtotal = (item) => toNumber(item.price) * (item.quantity || 0);

  const calculateTotal = () =>
    cartItems
      .reduce((sum, item) => sum + lineSubtotal(item), 0)
      .toFixed(2);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && isFormValid()) {
      setStep(2);
    } else if (step === 2) {
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
      timestamp: Date.now(),                 // ✅ precise time for the timer
      date: new Date().toLocaleString(),     // readable
      status: "Confirmed",
      mode: checkoutMode,
      total: `₹${calculateTotal()}`,
      items: cartItems,
      customer: formData,
      // Only include payment if you actually have paymentMethod state in this file:
      ...(typeof paymentMethod !== "undefined" ? { payment: paymentMethod } : {}),
      // DO NOT include userType here unless you defined it in this file
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
      <div className="step-indicator">
        <div className={`step ${step === 1 ? "active" : ""}`}>
          <span className="step-number">1</span>
          <span className="step-label">Details</span>
        </div>
        <div className={`step ${step === 2 ? "active" : ""}`}>
          <span className="step-number">2</span>
          <span className="step-label">Review</span>
        </div>
        <div className={`step ${step === 3 ? "active" : ""}`}>
          <span className="step-number">3</span>
          <span className="step-label">Payment</span>
        </div>
      </div>

      {/* Step 1: Customer Details */}
      {step === 1 && (
        <form className="checkout-form" onSubmit={handleNext}>
          <div className="row">
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              required
              onChange={handleChange}
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              required
              onChange={handleChange}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            required
            onChange={handleChange}
          />

          <div className="row">
            <input
              name="zip"
              placeholder="Zip/Postal Code"
              value={formData.zip}
              required
              onChange={handleChange}
            />
          </div>

          {checkoutMode === "delivery" && (
            <>
              <input
                name="address"
                placeholder="Street Address"
                value={formData.address}
                required
                onChange={handleChange}
              />
              <div className="row">
                <input
                  name="state"
                  placeholder="State/Province"
                  value={formData.state}
                  required
                  onChange={handleChange}
                />
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  required
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            required
            onChange={handleChange}
          />

          {deliveryError && <p className="error">{deliveryError}</p>}

          <button className="next-button" type="submit" disabled={!isFormValid()}>
            Next
          </button>
        </form>
      )}

      {/* Step 2: Order Summary */}
      {step === 2 && (
        <div className="order-summary">
          <h3>Order Summary</h3>
          <ul className="cart-summary-list">
            {cartItems.map((item) => {
              const unit = toNumber(item.price);
              const qty = item.quantity || 0;
              const subtotal = (unit * qty).toFixed(2);
              return (
                <li key={item._id || item.id} className="cart-summary-item">
                  {item.image && <img src={item.image} alt={item.name} />}
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      ₹{unit.toFixed(2)} × {qty} = <b>₹{subtotal}</b>
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
            <p>
              {formData.firstName} {formData.lastName}
            </p>
            <p>{formData.email}</p>
            <p>{formData.phone}</p>
            {checkoutMode === "delivery" ? (
              <>
                <p>{formData.address}</p>
                <p>
                  {formData.city}, {formData.state}, {formData.zip}
                </p>
              </>
            ) : (
              <p>
                <em>Takeaway order</em>
              </p>
            )}
          </div>

          <div className="review-buttons">
            <button type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="next-button" onClick={() => setStep(3)}>
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment Method */}
      {step === 3 && (
        <div className="checkout-section">
          <h3>Select Payment Method</h3>
          <div className="payment-options">
            <label
              className={`payment-card ${paymentMethod === "gpay" ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="payment"
                value="gpay"
                checked={paymentMethod === "gpay"}
                onChange={() => setPaymentMethod("gpay")}
              />
              <div className="payment-icon">💳</div>
              <span>Google Pay</span>
            </label>

            <label
              className={`payment-card ${paymentMethod === "cod" ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <div className="payment-icon">💵</div>
              <span>Cash on Delivery</span>
            </label>
          </div>
            
          <p className="total-amount" style={{ textAlign: "left", marginTop: "0" }}>
            Total: <strong>₹{calculateTotal()}</strong>
          </p>

          <div className="customer-details" style={{ marginTop: "1rem" }}>
            <h4>Payment</h4>
            <p>Method: {paymentMethod === "gpay" ? "Google Pay" : "Cash on Delivery"}</p>
          </div>

          <div className="review-buttons">
            <button type="button" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="pay-button" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
