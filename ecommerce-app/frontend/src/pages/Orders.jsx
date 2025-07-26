import React from 'react';
import '../styles/Orders.css';

const ordersData = [
  {
    id: 1,
    items: [
      { name: "Tomato", image: "/assets/cat-tomato.jpg", quantity: "2 kg", price: "₹60" },
      { name: "Onion", image: "/assets/cat-onion.jpg", quantity: "1 kg", price: "₹40" }
    ],
    date: "16 Jul, 5:43PM",
    status: "Delivered",
    total: "₹100"
  },
  {
    id: 2,
    items: [
      { name: "Broccoli", image: "/assets/cat-broccoli.jpg", quantity: "500g", price: "₹30" },
      { name: "Sweet Corn", image: "/assets/cat-sweetcorn.jpg", quantity: "2 pieces", price: "₹90" },
      { name: "Potato", image: "/assets/cat-potato.jpg", quantity: "1 kg", price: "₹25" }
    ],
    date: "16 Jul, 9:02AM",
    status: "Delivered",
    total: "₹145"
  },
  {
    id: 3,
    items: [
      { name: "Carrot", image: "/assets/cat-carrot.jpg", quantity: "1 kg", price: "₹40" },
      { name: "Spinach", image: "/assets/cat-spinach.jpg", quantity: "1 bundle", price: "₹35" },
      { name: "Lettuce", image: "/assets/cat-lettuce.jpg", quantity: "1 kg", price: "₹50" }
    ],
    date: "15 Jul, 7:15PM",
    status: "Delivered",
    total: "₹125"
  },
  {
    id: 4,
    items: [
      { name: "Zucchini", image: "/assets/cat-zucchini.jpg", quantity: "1 kg", price: "₹70" },
      { name: "Bell Pepper (Red)", image: "/assets/cat-bellpepper-red.jpg", quantity: "1 kg", price: "₹90" },
      { name: "Bell Pepper (Yellow)", image: "/assets/cat-bellpepper-yellow.jpg", quantity: "1 kg", price: "₹90" }
    ],
    date: "14 Jul, 4:40PM",
    status: "Delivered",
    total: "₹250"
  }
];

const Orders = () => {
  return (
    <div className="orders-page">
      <h2 className="orders-header">Your Orders</h2>

      <div className="orders-container">
        {ordersData.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-number">
              <h3>Order #{order.id}</h3>
            </div>

            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty-price">{item.quantity} • {item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-meta">
              <p className="order-date">📅 {order.date}</p>
              <p className="order-status">✅ {order.status}</p>
              <p className="order-total">💰 Total: {order.total}</p>
            </div>

            <div className="order-actions">
              <div className="rating">Rate: ⭐ ⭐ ⭐ ⭐ ⭐</div>
              <button className="reorder-btn">↻ Reorder</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
