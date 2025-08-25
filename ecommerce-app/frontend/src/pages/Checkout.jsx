import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    paymentMethod: 'gpay',
  });

  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid = () => {
    return Object.values(formData).every(value => value.trim() !== '');
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      setStep(2);
    } else {
      alert('Please fill out all fields.');
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const newOrder = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      status: "Confirmed",
      total: `₹${calculateTotal()}`,
      items: cartItems
    };

    // ✅ Save order
    addOrder(newOrder);

    // ✅ Store newest order ID in sessionStorage (edit button will only appear for this order in this session)
    sessionStorage.setItem("justPlacedOrderId", newOrder.id);

    // ✅ Clear cart
    clearCart();

    // ✅ Redirect to orders page
    navigate("/orders");
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container single-column">
        <form
          className="checkout-form"
          onSubmit={step === 1 ? handleNext : handlePlaceOrder}
        >
          {/* Step 1: Billing & Payment */}
          {step === 1 && (
            <div className="checkout-step">
              <h3>Billing Address</h3>
              <div className="row">
                <input name="firstName" placeholder="First Name" value={formData.firstName} required onChange={handleChange} />
                <input name="lastName" placeholder="Last Name" value={formData.lastName} required onChange={handleChange} />
              </div>
              <input name="email" placeholder="Email Address" value={formData.email} required onChange={handleChange} />
              <input name="address" placeholder="Street Address" value={formData.address} required onChange={handleChange} />
              <div className="row">
                <input name="state" placeholder="State/Province" value={formData.state} required onChange={handleChange} />
                <input name="city" placeholder="City" value={formData.city} required onChange={handleChange} />
              </div>
              <div className="row">
                <input name="zip" placeholder="Zip/Postal Code" value={formData.zip} required onChange={handleChange} />
                <input name="phone" placeholder="Phone" value={formData.phone} required onChange={handleChange} />
              </div>

              <h3>Payment Method</h3>
              <div className="payment-options">
                <label className={`payment-card ${formData.paymentMethod === 'gpay' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gpay"
                    checked={formData.paymentMethod === 'gpay'}
                    onChange={handleChange}
                  />
                  <div className="payment-icon">💳</div>
                  <span>Google Pay</span>
                </label>

                <label className={`payment-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <div className="payment-icon">💵</div>
                  <span>Cash on Delivery</span>
                </label>
              </div>

              <button type="submit" className="pay-button">Continue to Review</button>
            </div>
          )}

          {/* Step 2: Order Review */}
          {step === 2 && (
            <div className="checkout-step">
              <h3>Order Review</h3>
              <ul className="cart-summary-list">
                {cartItems.length > 0 ? (
                  cartItems.map(item => (
                    <li key={item._id} className="cart-summary-item">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.quantity} x ₹{item.price}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p>No items in cart.</p>
                )}
              </ul>

              <h3>Total: ₹{calculateTotal()}</h3>
              <textarea placeholder="Order comments..." rows="3"></textarea>
              <label className="confirm-label">
                <input type="checkbox" required /> I agree to Privacy & Terms
              </label>

              <div className="review-buttons">
                <button type="button" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="pay-button">Place Order</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Checkout;
