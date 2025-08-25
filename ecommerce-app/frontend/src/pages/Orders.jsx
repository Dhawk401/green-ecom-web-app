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

  // Countdown for editing
  useEffect(() => {
    if (orders.length > 0) {
      const newestOrder = orders[0];
      const orderTime = new Date(
        newestOrder.timestamp || newestOrder.createdAt || Date.now()
      ).getTime();

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
    }
  }, [orders]);

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
        <p className="no-orders">You haven’t placed any orders yet.</p>
      ) : (
        <div className="orders-container">
          {orders.map((order, idx) => {
            const isNewestOrder = idx === 0;
            const canEdit =
              isNewestOrder && timeLeft > 0 && canEditOrder(order.id);

            return (
              <div key={order.id} className="order-card">
                {/* Order header */}
                <div className="order-top">
                  <h3 className="order-id">Order #{order.id}</h3>
                  <span
                    className={`order-status ${order.status.toLowerCase()}`}
                  >
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
                </div>

                {/* Actions */}
                <div className="order-actions">
                  {/* ⭐ Rating system */}
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

                  {/* Reorder */}
                  <button
                    className="reorder-btn"
                    onClick={() => handleReorder(order.items)}
                  >
                    ↻ Reorder
                  </button>

                  {/* Edit with countdown */}
                  {canEdit && (
                    <>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditOrder(order.items)}
                      >
                        ✏ Edit
                      </button>
                      <span className="edit-timer">⏳ {timeLeft}s left</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
