// src/pages/Wallet.jsx
import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import "../styles/Wallet.css";
import { useOrders } from "../context/OrdersContext";
import { usePrice } from "../context/PriceContext";

const CREDIT_LIMITS = {
  retail: 10000,
  wholesale: 100000,
};

const Wallet = () => {
  const { orders } = useOrders();
  const { userType, toggleUserType } = usePrice();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(() => {
    try {
      const raw = localStorage.getItem("walletBalance");
      const n = raw ? parseFloat(raw) : 0;
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  });

  // Sync when orders change (checkout writes walletBalance to localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("walletBalance");
      const n = raw ? parseFloat(raw) : 0;
      setBalance(Number.isFinite(n) ? n : 0);
    } catch {
      setBalance(0);
    }
  }, [orders]);

  // Listen to storage events (other tabs / direct localStorage writes)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "walletBalance") {
        const n = e.newValue ? parseFloat(e.newValue) : 0;
        setBalance(Number.isFinite(n) ? n : 0);
      }
      if (e.key === "price_userType") {
        // price_userType changed in another tab — no direct wallet update required,
        // but Wallet will re-render because usePrice reads localStorage internally
        // (PriceContext already persists).
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    try {
      // persist with 2 decimals
      localStorage.setItem("walletBalance", String(Number(balance).toFixed(2)));
    } catch {}
  }, [balance]);

  const creditLimit = CREDIT_LIMITS[userType] ?? CREDIT_LIMITS.retail;
  const availableCredit = +(balance + creditLimit);

  // top-up state
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState("");
  const [proofPreview, setProofPreview] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [requests, setRequests] = useState(() => {
    try {
      const raw = localStorage.getItem("walletTopupRequests");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("walletTopupRequests", JSON.stringify(requests));
    } catch {}
  }, [requests]);

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
    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    const newReq = {
      id: Date.now(),
      // store numeric rounded to 2 decimals
      amount: Number(parsed.toFixed(2)),
      method: paymentMethod,
      date: new Date().toLocaleDateString(),
      status: "pending",
      proof: proofPreview,
    };

    setRequests((prev) => [newReq, ...prev]);

    // demo: credit immediately and persist (persist with 2 decimals)
    const newBal = +(balance + newReq.amount);
    const rounded = Number(newBal.toFixed(2));
    setBalance(rounded);
    try {
      localStorage.setItem("walletBalance", String(rounded.toFixed(2)));
      // notify same-tab listeners if you use custom event elsewhere
      window.dispatchEvent(new CustomEvent("walletUpdated", { detail: rounded }));
    } catch {}

    setShowTopup(false);
    setAmount("");
    setProofPreview("");
    setPaymentMethod("gpay");
    alert("Top-up request submitted. Wallet credited (demo). Admin will verify.");
  };

  // derived transactions
  const derivedTransactions = [
    ...requests.map((r) => ({
      id: `REQ${r.id}`,
      amount: +r.amount,
      date: r.date,
      type: "topup",
      status: r.status,
      proof: r.proof,
    })),
    ...(orders || []).map((o) => {
      let amt = 0;
      try {
        if (typeof o.total === "string") {
          amt = parseFloat(o.total.replace(/[^\d.]/g, "")) || 0;
        } else if (typeof o.total === "number") {
          amt = o.total;
        } else if (o.items && Array.isArray(o.items)) {
          amt = o.items.reduce(
            (s, it) => s + (parseFloat(it.finalPrice ?? it.price) || 0) * (it.quantity || 1),
            0
          );
        }
      } catch {
        amt = 0;
      }
      // make sure amount is rounded to 2 decimals
      return {
        id: `ORD${o.id}`,
        amount: -Math.abs(Number(amt.toFixed ? amt.toFixed(2) : Number(amt).toFixed(2))),
        date: o.date || new Date(o.timestamp || Date.now()).toLocaleDateString(),
        type: "order",
        status: o.status || "Confirmed",
      };
    }),
  ];

  // helper to format numbers with 2 decimals and thousands separators
  const formatCurrency = (num) => {
    const n = Number(num) || 0;
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="wallet-container">
      <button className="back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="user-type-toggle" style={{ marginBottom: "1rem" }}>
        <span className={userType === "retail" ? "active" : ""}>Retail</span>
        <label className="switch">
          <input type="checkbox" checked={userType === "wholesale"} onChange={toggleUserType} />
          <span className="slider"></span>
        </label>
        <span className={userType === "wholesale" ? "active" : ""}>Wholesale</span>
      </div>

      <div className="wallet-balance-card">
        <h2>Wallet Balance</h2>
        <p className="wallet-amount">
          ₹
          <CountUp
            end={Number(balance)}
            duration={1.2}
            separator=","
            decimals={2}
            decimal="."
          />
        </p>

        <div style={{ marginTop: 8 }}>
          <small style={{ color: "#666" }}>
            Credit limit for <b>{userType}</b>: <strong>₹{formatCurrency(creditLimit)}</strong>
          </small>
          <br />
          <small style={{ color: availableCredit >= 0 ? "#0a7a3a" : "#c0392b" }}>
            Available (balance + credit): <strong>₹{formatCurrency(availableCredit)}</strong>
          </small>
        </div>

        <div className="wallet-actions">
          <button className="topup-btn" onClick={() => setShowTopup(true)}>+ Top Up Wallet</button>
          <button className="orders-btn" onClick={() => navigate("/orders")}>View Orders</button>
        </div>
      </div>

      <div className="wallet-requests">
        <h3>Top-Up Requests</h3>
        {requests.length === 0 ? <p className="muted">No top-up requests yet.</p> : (
          <ul className="requests">
            {requests.map((req) => (
              <li key={req.id} className="request-item">
                <div className="request-left">
                  <span className="req-id">REQ{req.id}</span>
                  <span className="req-date">📅 {req.date}</span>
                </div>
                <div className="request-right">
                  <span className="req-amount">₹{formatCurrency(req.amount)}</span>
                  <span className={`req-status ${req.status}`}>{req.status}</span>
                  <a href={req.proof} target="_blank" rel="noreferrer" className="req-proof">View Proof</a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="wallet-history">
        <h3>Transaction History</h3>
        <ul className="transactions">
          {derivedTransactions.length === 0 ? (
            <li className="transaction-item muted">No transactions yet.</li>
          ) : (
            derivedTransactions.map((t) => (
              <li key={t.id} className="transaction-item">
                <span className="txn-id">{t.id}</span>
                <span className="txn-amount" style={{ color: t.amount < 0 ? "#c0392b" : "#0a7a3a" }}>
                  {t.amount < 0 ? `- ₹${formatCurrency(Math.abs(t.amount))}` : `₹${formatCurrency(t.amount)}`}
                </span>
                <span className="txn-date">{t.date}</span>
                {t.type === "topup" && t.proof && (
                  <a href={t.proof} target="_blank" rel="noreferrer" className="txn-proof">View Proof</a>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {showTopup && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal">
            <h3>Top-Up Wallet</h3>
            <form className="topup-form" onSubmit={(e) => { e.preventDefault(); handleSubmitTopup(); }}>
              <div className="field">
                <span>Amount (₹)</span>
                <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>

              <div className="field">
                <span>Payment Method</span>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="gpay">GPay / UPI</option>
                  {userType === "wholesale" && <option value="bank">Bank Transfer</option>}
                </select>
              </div>

              <div className="field">
                <span>Upload Proof of Payment</span>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>

              {proofPreview && <div className="proof-preview"><img src={proofPreview} alt="Proof" /></div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowTopup(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
