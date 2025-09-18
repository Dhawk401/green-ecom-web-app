// src/pages/Orders.jsx
import React, { useEffect, useState, useRef } from "react";
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
  const { orders, canEditOrder, reorderItems, updateOrderRating, cancelOrder } = useOrders();
  const { addMultipleToCart, clearCart } = useCart();
  const navigate = useNavigate();

  // map of orderId -> remaining seconds
  const [timeLeftMap, setTimeLeftMap] = useState({});
  const [showProofModal, setShowProofModal] = useState(false);
  const [activeOrderForProof, setActiveOrderForProof] = useState(null);
  const [proofPreview, setProofPreview] = useState("");
  const [proofUploading, setProofUploading] = useState(false);
  const tickRef = useRef(null);

  // sample products (kept for recommendations)
  const products = [
    { _id: "1", name: "Tomato", image: "/assets/cat-tomato.jpg", price: "30/kg", category: "vegetable" },
    { _id: "2", name: "Potato", image: "/assets/cat-potato.jpg", price: "25/kg", category: "vegetable" },
    { _id: "3", name: "Onion", image: "/assets/cat-onion.jpg", price: "40/kg", category: "vegetable" },
    { _id: "4", name: "Cabbage", image: "/assets/cat-cabbage.jpg", price: "30/kg", category: "vegetable" },
    { _id: "5", name: "Broccoli", image: "/assets/cat-broccoli.jpg", price: "60/kg", category: "exotic" },
  ];

  const recommended = products ? [...products].sort(() => 0.5 - Math.random()).slice(0, 3) : [];

  // Delivery slot helper
  const getDeliverySlot = (order) => {
    const ts = Number(order.timestamp) || Date.now();
    const orderDate = new Date(ts);
    const hours = orderDate.getHours() + orderDate.getMinutes() / 60;
    if (hours < 9 - 0.16) return { label: "9:00 AM – 11:00 AM", class: "morning" };
    else if (hours < 13.5 - 0.16) return { label: "1:30 PM – 4:30 PM", class: "afternoon" };
    else return { label: "6:00 PM – 9:00 PM", class: "evening" };
  };

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

  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;
  const currentOrders = orders.filter((o) => now - getOrderPlacedTime(o) < twoHours);
  const previousOrders = orders.filter((o) => now - getOrderPlacedTime(o) >= twoHours);

  // Payment proof helpers
  const normalize = (v) => (v || "").toString().trim().toLowerCase();
  const needsPaymentProof = (order) => {
    const userType = normalize(order.userType) || "retail";
    const method =
      normalize(
        (order.payment && order.payment.method) ||
          order.payment ||
          order.paymentMethod
      ) || "";
    const timing = (order.payment && normalize(order.payment.timing)) || "now";

    if (timing !== "now") return false;
    if (userType === "wholesale") {
      const isCashLike = method === "cash" || method === "cod";
      return !isCashLike;
    }
    return method === "gpay" || method === "upi";
  };

  const getProofStatus = (orderId) => localStorage.getItem(`paymentProofStatus_${orderId}`) || "";
  const setProofStatus = (orderId, status) => {
    try {
      localStorage.setItem(`paymentProofStatus_${orderId}`, status);
    } catch (e) {
      console.error("setProofStatus error:", e);
    }
  };
  const getSavedProof = (orderId) => localStorage.getItem(`paymentProof_${orderId}`) || "";

  // compute remaining seconds for an order (2 minutes window)
  const computeRemainingSeconds = (order) => {
    const orderTime = getOrderPlacedTime(order);
    const elapsed = Date.now() - orderTime;
    const remainingMs = Math.max(0, 2 * 60 * 1000 - elapsed); // 2 minutes in ms
    return Math.floor(remainingMs / 1000);
  };

  // update timeLeftMap every second
  useEffect(() => {
    // initial fill
    const initialMap = {};
    currentOrders.forEach((o) => {
      initialMap[o.id] = computeRemainingSeconds(o);
    });
    setTimeLeftMap(initialMap);

    // interval tick updates all current orders
    tickRef.current = setInterval(() => {
      setTimeLeftMap((prev) => {
        const next = { ...prev };
        // update for currentOrders (in case orders array changed)
        currentOrders.forEach((o) => {
          next[o.id] = computeRemainingSeconds(o);
        });

        // remove entries for orders no longer current
        Object.keys(next).forEach((id) => {
          if (!currentOrders.find((o) => String(o.id) === String(id))) {
            delete next[id];
          }
        });

        // After computing next map, check for newly-expired orders that need proof
        if (!showProofModal) {
          for (const o of currentOrders) {
            const rem = next[o.id];
            if (rem === 0 && needsPaymentProof(o)) {
              const alreadyUploaded = getSavedProof(o.id);
              const status = getProofStatus(o.id);
              if (!alreadyUploaded && status !== "uploaded") {
                setActiveOrderForProof(o);
                setShowProofModal(true);
                break; // show one at a time
              }
            }
          }
        }

        return next;
      });
    }, 1000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  // --- file upload handlers (compress before saving) ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const img = new Image();
      img.onload = () => {
        try {
          const MAX_WIDTH = 800;
          let targetWidth = img.width;
          let targetHeight = img.height;

          if (img.width > MAX_WIDTH) {
            targetWidth = MAX_WIDTH;
            targetHeight = Math.round((img.height * MAX_WIDTH) / img.width);
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const compressed = canvas.toDataURL("image/jpeg", 0.7);

          console.log("Original size (approx chars):", String(dataUrl).length);
          console.log("Compressed size (bytes):", Math.round(compressed.length * 3 / 4 / 1024), "KB (approx)");

          setProofPreview(compressed);
        } catch (err) {
          console.error("Image compression error:", err);
          alert("Failed to process image. See console for details.");
        }
      };
      img.onerror = (err) => {
        console.error("Image load error:", err);
        alert("Invalid image file.");
      };
      img.src = dataUrl;
    };
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      alert("Failed to read file. See console for details.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = () => {
    try {
      console.log("handleSubmitProof called", { activeOrderForProof, proofPreviewLength: proofPreview?.length || 0 });

      if (!activeOrderForProof) {
        console.warn("No activeOrderForProof");
        alert("No order selected for proof.");
        return;
      }
      if (!proofPreview) {
        alert("Please select a screenshot to upload.");
        return;
      }

      setProofUploading(true);

      try {
        localStorage.setItem(`paymentProof_${activeOrderForProof.id}`, proofPreview);
        setProofStatus(activeOrderForProof.id, "uploaded");
        console.log("Saved proof to localStorage for order:", activeOrderForProof.id);
      } catch (err) {
        console.error("Failed to save proof to localStorage:", err);
        alert("Failed to save proof (localStorage). See console for details.");
        setProofUploading(false);
        return;
      }

      // close modal and clear preview
      setProofPreview("");
      setActiveOrderForProof(null);
      setShowProofModal(false);
      setProofUploading(false);

      alert("Payment proof uploaded successfully.");
    } catch (err) {
      console.error("handleSubmitProof unexpected error:", err);
      alert("There was an unexpected error. See console for details.");
      setProofUploading(false);
    }
  };

  // Actions
  const handleReorder = (orderItems) => {
    reorderItems(orderItems);
    navigate("/cart");
  };

  const handleEditOrder = (order) => {
    clearCart();
    addMultipleToCart(order.items.map((it) => ({ ...it })));
    navigate("/cart", { state: { editOrderId: order.id, items: order.items } });
  };

  const handleCancelOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    cancelOrder(orderId);
  };

  return (
    <div className="orders-page">
      <h2 className="orders-header">Your Orders</h2>

      {orders.length === 0 ? (
        <div className="no-orders-wrapper">
          <div className="no-orders-icon">🛒</div>
          <h3>You haven’t placed any orders yet</h3>
          <p>Start shopping fresh vegetables and groceries now.</p>
          <button className="start-shopping-btn" onClick={() => navigate("/shop")}>
            Start Shopping
          </button>

          {recommended.length > 0 && (
            <div className="recommendations">
              <h3>Recommended for You</h3>
              <div className="recommendation-grid">
                {recommended.map((product) => (
                  <div
                    key={product._id}
                    className="recommend-card"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <img src={product.image} alt={product.name} />
                    <h4>{product.name}</h4>
                    <p>₹{product.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ===== Current Orders ===== */}
          {currentOrders.length > 0 && (
            <div className="orders-section">
              <h3 className="section-title">Current Orders</h3>
              <div className="orders-container">
                {currentOrders.map((order) => {
                  const slot = getDeliverySlot(order);
                  const remaining = timeLeftMap[order.id] ?? computeRemainingSeconds(order);
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-top">
                        <h3 className="order-id">Order #{order.id}</h3>
                        <span className={`order-status ${order.status?.toLowerCase?.() || ""}`}>{order.status}</span>
                      </div>

                      <div className="order-items">
                        {order.items.map((item, i) => (
                          <div key={i} className="order-item">
                            <img src={item.image} alt={item.name} className="item-image" />
                            <div className="item-details">
                              <p className="item-name">{item.name}</p>
                              <p className="item-qty-price">
                                {item.quantity} × ₹{item.finalPrice ?? item.price} / {item.selectedWeight ?? "unit"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-meta">
                        <p className="order-date">📅 {order.date}</p>
                        <p className="order-total">💰 Total: {order.total}</p>
                        <p className={`order-slot ${slot.class}`}>🚚 Delivery Slot: {slot.label}</p>
                      </div>

                      <div className="order-actions">
                        <div className="rating">
                          <span>Rate: </span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} filled={(order.rating || 0) >= star} onClick={() => updateOrderRating(order.id, star)} />
                          ))}
                        </div>

                        <button className="reorder-btn" onClick={() => handleReorder(order.items)}>↻ Reorder</button>

                        {/* per-order edit/cancel using remaining */}
                        {remaining > 0 && canEditOrder(order.id) && (
                          <>
                            <button className="edit-btn" onClick={() => handleEditOrder(order)}>✏ Edit</button>
                            <button className="cancel-btn" onClick={() => handleCancelOrder(order.id)}>❌ Cancel</button>
                            <span className="edit-timer">⏳ {remaining}s left</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== Previous Orders ===== */}
          {previousOrders.length > 0 && (
            <div className="orders-section">
              <h3 className="section-title">Previous Orders</h3>
              <div className="orders-container">
                {previousOrders.map((order) => {
                  const slot = getDeliverySlot(order);
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-top">
                        <h3 className="order-id">Order #{order.id}</h3>
                        <span className={`order-status ${order.status?.toLowerCase?.() || ""}`}>{order.status}</span>
                      </div>

                      <div className="order-items">
                        {order.items.map((item, i) => (
                          <div key={i} className="order-item">
                            <img src={item.image} alt={item.name} className="item-image" />
                            <div className="item-details">
                              <p className="item-name">{item.name}</p>
                              <p className="item-qty-price">
                                {item.quantity} × ₹{item.finalPrice ?? item.price} / {item.selectedWeight ?? "unit"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-meta">
                        <p className="order-date">📅 {order.date}</p>
                        <p className="order-total">💰 Total: {order.total}</p>
                        <p className={`order-slot ${slot.class}`}>🚚 Delivery Slot: {slot.label}</p>
                      </div>

                      <div className="order-actions">
                        <div className="rating">
                          <span>Rate: </span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} filled={(order.rating || 0) >= star} onClick={() => updateOrderRating(order.id, star)} />
                          ))}
                        </div>

                        <button className="reorder-btn" onClick={() => handleReorder(order.items)}>↻ Reorder</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showProofModal && activeOrderForProof && (
        <div className="popup-overlay">
          <div className="popup-content" style={{ maxWidth: 420 }}>
            <h3>Upload Payment Proof</h3>
            <p style={{ margin: "0.5rem 0 1rem", color: "#444" }}>
              Please upload a screenshot/receipt for <b>Order #{activeOrderForProof.id}</b>.
            </p>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {proofPreview && (
              <img
                src={proofPreview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: 240,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginTop: "1rem",
                }}
              />
            )}
            <div style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="popup-btn"
                onClick={handleSubmitProof}
                disabled={proofUploading}
              >
                {proofUploading ? "Uploading…" : "Upload Proof"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
