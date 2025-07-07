import React, { useState } from 'react';
import { useCart } from '../context/CartContext'; // assuming this is set up
import '../styles/Checkout.css'; // assuming you have a CSS file for styles

const Checkout = () => {
  const { cartItems } = useCart();
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
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price); // remove /kg etc. if needed
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Order placed successfully via ${formData.paymentMethod}, ${formData.firstName}!`);
  };

  return (
    <div className="checkout-container">
      <form className="checkout-form" onSubmit={step === 1 ? handleNext : handleSubmit}>
        {/* LEFT COLUMN */}
        <div className="checkout-left">
          {/* Billing Address */}
          <div className="checkout-section">
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
          </div>

          {/* Payment Method */}
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

          <button type="submit" className="pay-button">
            {step === 1 ? 'Continue to Review' : 'Place Order'}
          </button>
        </div>

        {/* RIGHT COLUMN: Order Summary (only if step === 2) */}
        {step === 2 && (
          <div className="checkout-right">
            <div className="summary-card">
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
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Checkout;
