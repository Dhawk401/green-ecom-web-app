// src/context/OrdersContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useCart } from "./CartContext";

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [justPlacedOrderIds, setJustPlacedOrderIds] = useState([]);
  const { addMultipleToCart } = useCart();

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (newOrder) => {
    const orderWithRating = { ...newOrder, rating: null };
    setOrders((prev) => [orderWithRating, ...prev]);
    setJustPlacedOrderIds((prev) => [...prev, orderWithRating.id]);
  };

  const clearOrders = () => {
    setOrders([]);
    setJustPlacedOrderIds([]);
    localStorage.removeItem("orders");
  };

  const reorderItems = (items) => {
    if (!items || !items.length) return;
    addMultipleToCart(items.map((it) => ({ ...it })));
  };

  const canEditOrder = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    return justPlacedOrderIds.includes(orderId) || order?.rating === null;
  };

  const updateOrderRating = (orderId, rating) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, rating: Number(rating) } : o
      )
    );
  };

  /** 🆕 update an order's items */
  const updateOrder = (orderId, updatedItems) => {
  // calculate new total
  const newTotal = updatedItems.reduce(
    (sum, it) => sum + (parseFloat(it.finalPrice) || 0) * (it.quantity || 1),
    0
  ).toFixed(2);

  setOrders((prev) =>
    prev.map((o) =>
      o.id === orderId
        ? {
            ...o,
            items: updatedItems,
            total: newTotal,   // 🆕 update the total
            updatedAt: Date.now(),
          }
        : o
    )
  );
};


  /** 🆕 cancel (delete) an order entirely */
  const cancelOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setJustPlacedOrderIds((prev) => prev.filter((id) => id !== orderId));
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        clearOrders,
        reorderItems,
        canEditOrder,
        updateOrderRating,
        updateOrder,
        cancelOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
