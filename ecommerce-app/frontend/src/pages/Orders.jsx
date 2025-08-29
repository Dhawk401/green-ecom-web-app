import React, { useEffect, useState } from "react";
import "../styles/Orders.css";
import { useOrders } from "../context/OrdersContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

// ⭐ Star component
const Star = ({ filled, onClick }) => (
  <span
    onClick={onClick}
    style={{
      cursor: "pointer",
      color: filled ? "#FFD700" : "#ccc",
      fontSize: "1.3rem",
      marginRight: "2px",
    }}
  >
    ★
  </span>
);

const Orders = () => {
  const { orders, canEditOrder, reorderItems, updateOrderRating } = useOrders();
  const { addMultipleToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(0);

  // ---- Payment proof modal state ----
  const [showProofModal, setShowProofModal] = useState(false);
  const [activeOrderForProof, setActiveOrderForProof] = useState(null);
  const [proofPreview, setProofPreview] = useState("");
  const [proofFile, setProofFile] = useState(null);

  // Helper: read order timestamp safely
  const getOrderPlacedTime = (order) => {
    const explicitTs = Number(order.timestamp) || Number(order.createdAt);
    if (Number.isFinite(explicitTs) && explicitTs > 0) return explicitTs;

    if (order.date) {
      const parsed = Date.parse(order.date);
      if (Number.isFinite(parsed)) return parsed;
    }

    if (typeof order.id === "number" && order.id > 1_600_000_000_000) {
      return order.id;
    }

    return Date.now();
  };

  // Countdown for editing (newest order only)
  useEffect(() => {
    if (orders.length === 0) return;

    const newestOrder = orders[0];
    const orderTime = getOrderPlacedTime(newestOrder);

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.floor((2 * 60 * 1000 - (now - orderTime)) / 1000)
      );
      setTimeLeft(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  // ---- Should this order require payment proof? ----
  const normalize = (v) => (v || "").toString().trim().toLowerCase();

  const needsPaymentProof = (order) => {
    const userType = normalize(order.userType) || "retail";

    // retail: order.payment might be "gpay"|"cod"
    // wholesale: order.payment might be { method, timing }
    const method =
      normalize(
        (order.payment && order.payment.method) ||
          order.payment ||
          order.paymentMethod
      ) || "";

    const timing =
      (order.payment && normalize(order.payment.timing)) || "now";

    // Only ask for proof when timing is "now"
    if (timing !== "now") return false;

    if (userType === "wholesale") {
      // Need proof if NOT cash/COD
      const isCashLike = method === "cash" || method === "cod";
      return !isCashLike; // upi/gpay, banktransfer, netbanking, card, cheque need proof
    }
    // Retail: only if GPay/UPI
    return method === "gpay" || method === "upi";
  };

  // ---- Local storage helpers to avoid repeat prompts ----
  const getProofStatus = (orderId) =>
    localStorage.getItem(`paymentProofStatus_${orderId}`) || "";
  const setProofStatus = (orderId, status) =>
    localStorage.setItem(`paymentProofStatus_${orderId}`, status);

  const getSavedProof = (orderId) =>
    localStorage.getItem(`paymentProof_${orderId}`) || "";

  const saveProof = (orderId, dataUrl) => {
    localStorage.setItem(`paymentProof_${orderId}`, dataUrl);
    setProofStatus(orderId, "uploaded");
  };

  // ✅ Show modal ONLY AFTER timer hits 0, and only when required (newest order)
  useEffect(() => {
    if (orders.length === 0) return;
    const newest = orders[0];

    // If countdown still running, ensure modal is closed and bail
    if (timeLeft > 0) {
      if (showProofModal) setShowProofModal(false);
      return;
    }

    // timeLeft === 0 -> decide whether to prompt
    const alreadyUploaded = getSavedProof(newest.id);
    const status = getProofStatus(newest.id); // 'uploaded'
    const shouldAsk = needsPaymentProof(newest);

    if (shouldAsk && !alreadyUploaded && status !== "uploaded") {
      setActiveOrderForProof(newest);
      setShowProofModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, orders]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProofPreview(reader.result.toString());
      setProofFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = () => {
    if (!activeOrderForProof || !proofPreview) {
      alert("Please select a screenshot to upload.");
      return;
    }
    saveProof(activeOrderForProof.id, proofPreview);
    setShowProofModal(false);
  };

  const handleReorder = (orderItems) => {
    reorderItems(orderItems);
    navigate("/cart");
  };

  const handleEditOrder = (orderItems) => {
    clearCart();
    addMultipleToCart(orderItems);
    navigate("/cart");
  };

  // --- Split orders
  const newestOrder = orders[0];
  const previousOrders = orders.slice(1);

  // Hint badge content for the current (newest) order
  const currentProofHint = (() => {
    if (!newestOrder) return null;
    const proofNeeded = needsPaymentProof(newestOrder);
    const uploaded = getSavedProof(newestOrder.id);
    if (!proofNeeded) return <span className="order-hint ok">No payment proof required</span>;
    if (timeLeft > 0) {
      return (
        <span className="order-hint warn">
          Proof required after ⏳ {timeLeft}s
        </span>
      );
    }
    // timeLeft === 0
    if (!uploaded) {
      return <span className="order-hint danger">Proof pending</span>;
    }
    return <span className="order-hint ok">Proof uploaded</span>;
  })();

  return (
    <div className="orders-page">
      <h2 className="orders-header">Your Orders</h2>

      {orders.length === 0 ? (
        <p className="no-orders">You haven’t placed any orders yet.</p>
      ) : (
        <>
          {/* ============== Current Order (newest) ============== */}
          {newestOrder && (
            <div className="orders-section">
              <h3 className="section-title">
                Current Order {currentProofHint && <span style={{ marginLeft: 8 }}>{currentProofHint}</span>}
              </h3>

              <div className="orders-container">
                <div key={newestOrder.id} className="order-card">
                  {/* Order header */}
                  <div className="order-top">
                    <h3 className="order-id">Order #{newestOrder.id}</h3>
                    <span className={`order-status ${newestOrder.status.toLowerCase()}`}>
                      {newestOrder.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="order-items">
                    {newestOrder.items.map((item, i) => (
                      <div key={i} className="order-item">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="item-image"
                        />
                        <div className="item-details">
                          <p className="item-name">{item.name}</p>
                          <p className="item-qty-price">
                            {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="order-meta">
                    <p className="order-date">📅 {newestOrder.date}</p>
                    <p className="order-total">💰 Total: {newestOrder.total}</p>
                    {getSavedProof(newestOrder.id) && (
                      <a
                        className="order-proof-link"
                        href={getSavedProof(newestOrder.id)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📎 View Payment Proof
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="order-actions">
                    {/* ⭐ Rating system */}
                    <div className="rating">
                      <span>Rate: </span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          filled={newestOrder.rating >= star}
                          onClick={() => updateOrderRating(newestOrder.id, star)}
                        />
                      ))}
                    </div>

                    {/* Reorder */}
                    <button
                      className="reorder-btn"
                      onClick={() => handleReorder(newestOrder.items)}
                    >
                      ↻ Reorder
                    </button>

                    {/* Edit with countdown — ALWAYS available during countdown */}
                    {timeLeft > 0 && canEditOrder(newestOrder.id) && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditOrder(newestOrder.items)}
                        >
                          ✏ Edit
                        </button>
                        <span className="edit-timer">⏳ {timeLeft}s left</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============== Previous Orders ============== */}
          {previousOrders.length > 0 && (
            <div className="orders-section">
              <h3 className="section-title">Previous Orders</h3>

              <div className="orders-container">
                {previousOrders.map((order) => {
                  const uploadedProof = getSavedProof(order.id);
                  const proofNeeded = needsPaymentProof(order);
                  return (
                    <div key={order.id} className="order-card">
                      {/* Order header */}
                      <div className="order-top">
                        <h3 className="order-id">Order #{order.id}</h3>
                        <span className={`order-status ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="order-items">
                        {order.items.map((item, i) => (
                          <div key={i} className="order-item">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="item-image"
                            />
                            <div className="item-details">
                              <p className="item-name">{item.name}</p>
                              <p className="item-qty-price">
                                {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="order-meta">
                        <p className="order-date">📅 {order.date}</p>
                        <p className="order-total">💰 Total: {order.total}</p>
                        {uploadedProof ? (
                          <a
                            className="order-proof-link"
                            href={uploadedProof}
                            target="_blank"
                            rel="noreferrer"
                          >
                            📎 View Payment Proof
                          </a>
                        ) : proofNeeded ? (
                          <span className="order-hint danger">Proof not uploaded</span>
                        ) : (
                          <span className="order-hint ok">No payment proof required</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="order-actions">
                        <div className="rating">
                          <span>Rate: </span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              filled={order.rating >= star}
                              onClick={() => updateOrderRating(order.id, star)}
                            />
                          ))}
                        </div>

                        <button
                          className="reorder-btn"
                          onClick={() => handleReorder(order.items)}
                        >
                          ↻ Reorder
                        </button>
                        {/* No edit or timer on previous orders */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment Proof Modal — only renders when timer is 0 for CURRENT order */}
      {timeLeft === 0 && showProofModal && activeOrderForProof && (
        <div className="popup-overlay">
          <div className="popup-content" style={{ maxWidth: 420 }}>
            <h3>Upload Payment Proof</h3>
            <p style={{ margin: "0.5rem 0 1rem", color: "#444" }}>
              Please upload a screenshot/receipt for{" "}
              <b>Order #{activeOrderForProof.id}</b>.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginBottom: "1rem" }}
            />

            {proofPreview && (
              <img
                src={proofPreview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: 240,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: "1rem",
                }}
              />
            )}

            {/* ✅ Only Upload button; non-dismissable */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="popup-btn" onClick={handleSubmitProof}>
                Upload Proof
              </button>
            </div>

            <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#666" }}>
              You can edit your order for 2 minutes after placing it. We only ask for
              proof after the timer ends and when the payment method requires it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
