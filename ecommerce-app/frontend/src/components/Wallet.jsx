// src/pages/Wallet.jsx
import React, { useState } from "react";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import "../styles/Wallet.css";
import { useUser } from "../context/UserContext";

const Wallet = () => {
  const { user, switchUserType, preferredUserType, setPreferredUserType } = useUser();
  const currentUserType = (user && user.userType) || preferredUserType || "retail";

  const [balance, setBalance] = useState(5000); // Example balance
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState("");
  const [proofPreview, setProofPreview] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(currentUserType === "wholesale" ? "upi" : "gpay"); // default depends on userType
  const navigate = useNavigate();

  // Dummy transactions
  const transactions = [
    { id: "ORD12345", amount: 350, date: "Aug 20, 2025" },
    { id: "ORD12346", amount: 420, date: "Aug 18, 2025" },
    { id: "ORD12347", amount: 299, date: "Aug 15, 2025" },
    { id: "ORD12348", amount: 550, date: "Aug 12, 2025" },
    { id: "ORD12349", amount: 270, date: "Aug 10, 2025" },
  ];

  // Dummy top-up requests
  const [requests, setRequests] = useState([]);

  const toggleUserType = () => {
    const next = currentUserType === "retail" ? "wholesale" : "retail";

    // Persist preference for guests and keep logged-in users in sync
    setPreferredUserType(next);

    // If a real user is logged in, also update their account userType
    if (user) {
      // keep user object in sync (UserContext.switchUserType will update both preferred and user)
      try {
        switchUserType(next);
      } catch (e) {
        // fallback: ensure at least preference set
        console.error("switchUserType failed:", e);
        setPreferredUserType(next);
      }
    }

    // update default payment method depending on type
    setPaymentMethod(next === "wholesale" ? "upi" : "gpay");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofPreview(reader.result.toString());
    reader.readAsDataURL(file);
  };

  const handleSubmitTopup = () => {
    if (!amount || !proofPreview) {
      alert("Please enter amount and upload proof.");
      return;
    }
    const newReq = {
      id: Date.now(),
      amount,
      method: paymentMethod,
      date: new Date().toLocaleDateString(),
      status: "pending",
      proof: proofPreview,
    };
    setRequests([newReq, ...requests]);
    setShowTopup(false);
    setAmount("");
    setProofPreview("");
    setPaymentMethod(currentUserType === "wholesale" ? "upi" : "gpay");
    alert("Top-up request submitted. Awaiting admin verification.");
  };

  return (
    <div className="wallet-container">
      {/* Back Button */}
      <button className="back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Retail / Wholesale Toggle */}
      <div className="user-type-toggle" style={{ marginBottom: "1rem" }}>
        <span className={currentUserType === "retail" ? "active" : ""}>Retail</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={currentUserType === "wholesale"}
            onChange={toggleUserType}
          />
          <span className="slider"></span>
        </label>
        <span className={currentUserType === "wholesale" ? "active" : ""}>
          Wholesale
        </span>
      </div>

      {/* Wallet Balance */}
      <div className="wallet-balance-card">
        <h2>Wallet Balance</h2>
        <p className="wallet-amount">
          ₹<CountUp end={balance} duration={2} />
        </p>
        <div className="wallet-actions">
          <button className="topup-btn" onClick={() => setShowTopup(true)}>
            + Top Up Wallet
          </button>
          <button className="orders-btn" onClick={() => navigate("/orders")}>
            View Orders
          </button>
        </div>
      </div>

      {/* Top-Up Requests */}
      <div className="wallet-requests">
        <h3>Top-Up Requests</h3>
        {requests.length === 0 ? (
          <p className="muted">No top-up requests yet.</p>
        ) : (
          <ul className="requests">
            {requests.map((req) => (
              <li key={req.id} className="request-item">
                <div className="request-left">
                  <span className="req-id">REQ{req.id}</span>
                  <span className="req-date">📅 {req.date}</span>
                </div>
                <div className="request-right">
                  <span className="req-amount">₹{req.amount}</span>
                  <span className={`req-status ${req.status}`}>
                    {req.status}
                  </span>
                  <a
                    href={req.proof}
                    target="_blank"
                    rel="noreferrer"
                    className="req-proof"
                  >
                    View Proof
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Transaction History */}
      <div className="wallet-history">
        <h3>Transaction History</h3>
        <ul className="transactions">
          {transactions.map((txn) => (
            <li key={txn.id} className="transaction-item">
              <span className="txn-id">{txn.id}</span>
              <span className="txn-amount">- ₹{txn.amount}</span>
              <span className="txn-date">{txn.date}</span>
              <button
                className="view-details-btn"
                onClick={() => navigate("/orders")}
              >
                View Details
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Top-Up Modal */}
      {showTopup && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal">
            <h3>Top-Up Wallet</h3>
            <form
              className="topup-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitTopup();
              }}
            >
              <div className="field">
                <span>Amount (₹)</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <span>Payment Method</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="gpay">GPay / UPI</option>
                  {currentUserType === "wholesale" && (
                    <option value="bank">Bank Transfer</option>
                  )}
                </select>
              </div>

              <div className="field">
                <span>Upload Proof of Payment</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {proofPreview && (
                <div className="proof-preview">
                  <img src={proofPreview} alt="Proof" />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowTopup(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
