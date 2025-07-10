import React from 'react';
import '../styles/Orders.css'; // Assuming you have a CSS file for styles

const Orders = () => {
  return (
    <div className="orders-wrapper">
      <h2 className="orders-title">My Orders</h2>
      <div className="orders-list">
        <div className="order-card">
          <h3 className="order-number">Order #12345</h3>
          <p>Date: 27 June 2025</p>
          <p>
            Status: <span className="order-status delivered">Delivered</span>
          </p>
          <p>Total: ₹4999</p>
        </div>
        <div className="order-card">
          <h3 className="order-number">Order #12344</h3>
          <p>Date: 23 June 2025</p>
          <p>
            Status: <span className="order-status shipped">Shipped</span>
          </p>
          <p>Total: ₹2599</p>
        </div>
      </div>
    </div>
  );
};

export default Orders;
