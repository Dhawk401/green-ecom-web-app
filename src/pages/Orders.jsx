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

  const products = [
    {
      _id: '1',
      name: 'Tomato',
      image: '/assets/cat-tomato.jpg',
      price: '30/kg',
      category: 'vegetable',
    },
    {
      _id: '2',
      name: 'Potato',
      image: '/assets/cat-potato.jpg',
      price: '25/kg',
      category: 'vegetable',
    },
    {
      _id: '3',
      name: 'Onion',
      image: '/assets/cat-onion.jpg',
      price: '40/kg',
      category: 'vegetable',
    },
    {
      _id: '4',
      name: 'Cabbage',
      image: '/assets/cat-cabbage.jpg',
      price: '30/kg',
      category: 'vegetable',
    },
    {
      _id: '5',
      name: 'Broccoli',
      image: '/assets/cat-broccoli.jpg',
      price: '60/kg',
      category: 'exotic',
    },
    {
      _id: '6',
      name: 'Zucchini',
      image: '/assets/cat-zucchini.jpg',
      price: '70/kg',
      category: 'exotic',
    },
    {
      _id: '7',
      name: 'Bell Pepper (Red)',
      image: '/assets/cat-bellpepper-red.jpg',
      price: '90/kg',
      category: 'exotic',
    },
    {
      _id: '8',
      name: 'Bell Pepper (Yellow)',
      image: '/assets/cat-bellpepper-yellow.jpg',
      price: '90/kg',
      category: 'exotic',
    },
    {
      _id: '9',
      name: 'Asparagus',
      image: '/assets/cat-asparagus.jpg',
      price: '150/bunch',
      category: 'exotic',
    },
    {
      _id: '10',
      name: 'Avocado',
      image: '/assets/cat-avocado.jpg',
      price: '120/piece',
      category: 'exotic',
    },
    {
      _id: '11',
      name: 'Lettuce',
      image: '/assets/cat-lettuce.jpg',
      price: '50/kg',
      category: 'exotic',
    },
    {
      _id: '12',
      name: 'Spinach',
      image: '/assets/cat-spinach.jpg',
      price: '35/bundle',
      category: 'vegetable',
    },
    {
      _id: '13',
      name: 'Sweet Corn',
      image: '/assets/cat-sweetcorn.jpg',
      price: '45/piece',
      category: 'vegetable',
    },
    {
      _id: '14',
      name: 'Carrot',
      image: '/assets/cat-carrot.jpg',
      price: '40/kg',
      category: 'vegetable',
    },
    {
      _id: '15',
      name: 'Brussels Sprouts',
      image: '/assets/cat-brussels.jpg',
      price: '140/kg',
      category: 'exotic',
    }
  ];

  // ✅ Pick 4 random recommended items
  const recommended = products
    ? [...products].sort(() => 0.5 - Math.random()).slice(0, 3)
    : [];

  // ---- Delivery Slots ----
  const getDeliverySlot = (order) => {
    const ts = Number(order.timestamp) || Date.now();
    const orderDate = new Date(ts);
    const hours = orderDate.getHours() + orderDate.getMinutes() / 60;

    if (hours < 9 - 0.16)
      return { label: "9:00 AM – 11:00 AM", class: "morning" };
    else if (hours < 13.5 - 0.16)
      return { label: "1:30 PM – 4:30 PM", class: "afternoon" };
    else return { label: "6:00 PM – 9:00 PM", class: "evening" };
  };

  // ---- Helpers ----
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

  // ---- Split orders ----
  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;
  const currentOrders = orders.filter(
    (o) => now - getOrderPlacedTime(o) < twoHours
  );
  const previousOrders = orders.filter(
    (o) => now - getOrderPlacedTime(o) >= twoHours
  );

  // Countdown for editing (only on newest current order)
  useEffect(() => {
    if (currentOrders.length === 0) return;

    const newestOrder = currentOrders[0];
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

  // ---- Proof Handling ----
  const normalize = (v) => (v || "").toString().trim().toLowerCase();

  const needsPaymentProof = (order) => {
    const userType = normalize(order.userType) || "retail";
    const method =
      normalize(
        (order.payment && order.payment.method) ||
          order.payment ||
          order.paymentMethod
      ) || "";
    const timing =
      (order.payment && normalize(order.payment.timing)) || "now";

    if (timing !== "now") return false;

    if (userType === "wholesale") {
      const isCashLike = method === "cash" || method === "cod";
      return !isCashLike;
    }
    return method === "gpay" || method === "upi";
  };

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

  // Proof modal state
  const [showProofModal, setShowProofModal] = useState(false);
  const [activeOrderForProof, setActiveOrderForProof] = useState(null);
  const [proofPreview, setProofPreview] = useState("");

  useEffect(() => {
    if (currentOrders.length === 0) return;
    const newest = currentOrders[0];

    if (timeLeft > 0) {
      if (showProofModal) setShowProofModal(false);
      return;
    }

    const alreadyUploaded = getSavedProof(newest.id);
    const status = getProofStatus(newest.id);
    const shouldAsk = needsPaymentProof(newest);

    if (shouldAsk && !alreadyUploaded && status !== "uploaded") {
      setActiveOrderForProof(newest);
      setShowProofModal(true);
    }
  }, [timeLeft, orders]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofPreview(reader.result.toString());
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

  // ---- Actions ----
  const handleReorder = (orderItems) => {
    reorderItems(orderItems);
    navigate("/cart");
  };

  const handleEditOrder = (orderItems) => {
    clearCart();
    addMultipleToCart(orderItems);
    navigate("/cart");
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

    {/* ✅ Recommendations appear ONLY when no orders */}
    {recommended.length > 0 && (
      <div className="recommendations">
        <h3>Recommended for You</h3>
        <div className="recommendation-grid">
          {recommended.map((product) => (
            <div
              key={product.id}
              className="recommend-card"
              onClick={() => navigate(`/product/${product.id}`)}
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
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-top">
                        <h3 className="order-id">Order #{order.id}</h3>
                        <span
                          className={`order-status ${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </div>

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

                      <div className="order-meta">
                        <p className="order-date">📅 {order.date}</p>
                        <p className="order-total">💰 Total: {order.total}</p>
                        <p className={`order-slot ${slot.class}`}>
                          🚚 Delivery Slot: {slot.label}
                        </p>
                      </div>

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
                        {timeLeft > 0 && canEditOrder(order.id) && (
                          <>
                            <button
                              className="edit-btn"
                              onClick={() => handleEditOrder(order.items)}
                            >
                              ✏ Edit
                            </button>
                            <span className="edit-timer">
                              ⏳ {timeLeft}s left
                            </span>
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
                        <span
                          className={`order-status ${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </div>

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

                      <div className="order-meta">
                        <p className="order-date">📅 {order.date}</p>
                        <p className="order-total">💰 Total: {order.total}</p>
                        <p className={`order-slot ${slot.class}`}>
                          🚚 Delivery Slot: {slot.label}
                        </p>
                      </div>

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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== Proof Modal ===== */}
      {timeLeft === 0 && showProofModal && activeOrderForProof && (
        <div className="popup-overlay">
          <div className="popup-content" style={{ maxWidth: 420 }}>
            <h3>Upload Payment Proof</h3>
            <p style={{ margin: "0.5rem 0 1rem", color: "#444" }}>
              Please upload a screenshot/receipt for{" "}
              <b>Order #{activeOrderForProof.id}</b>.
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
              <button className="popup-btn" onClick={handleSubmitProof}>
                Upload Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
