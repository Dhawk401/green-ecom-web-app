// src/context/OrdersContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useCart } from "./CartContext";

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("orders");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to read orders from localStorage:", e);
      return [];
    }
  });

  const [justPlacedOrderIds, setJustPlacedOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem("justPlacedOrderIds");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const { addMultipleToCart } = useCart();

  useEffect(() => {
    try {
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders to localStorage:", e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem("justPlacedOrderIds", JSON.stringify(justPlacedOrderIds));
    } catch (e) {
      console.error("Failed to save justPlacedOrderIds:", e);
    }
  }, [justPlacedOrderIds]);

  const addOrder = (newOrder) => {
    const orderWithRating = { ...newOrder, rating: null };
    setOrders((prev) => [orderWithRating, ...prev]);
    setJustPlacedOrderIds((prev) => [...prev, orderWithRating.id]);
  };

  const clearOrders = () => {
    setOrders([]);
    setJustPlacedOrderIds([]);
    try {
      localStorage.removeItem("orders");
      localStorage.removeItem("justPlacedOrderIds");
    } catch (e) {
      console.error("Failed to clear orders from localStorage:", e);
    }
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

  // Helper: parse numeric price
  const getNumericPrice = (item) => {
    const candidate = item.finalPrice ?? item.price ?? 0;
    if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
    if (typeof candidate === "string") {
      const m = candidate.match(/([\d,.]+)/);
      if (m) {
        const num = parseFloat(m[1].replace(/,/g, ""));
        return Number.isFinite(num) ? num : 0;
      }
    }
    return 0;
  };

  // Update order items (edit) - also recalculates order.total
  const updateOrder = (orderId, updatedItems) => {
    const items = (updatedItems || []).map((it) => ({
      ...it,
      quantity: it.quantity || 1,
    }));

    const totalNumeric = items.reduce((s, it) => {
      const price = getNumericPrice(it);
      const qty = Number(it.quantity || 0);
      return s + price * qty;
    }, 0);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items,
              total: `₹${totalNumeric.toFixed(2)}`,
              updatedAt: Date.now(),
            }
          : o
      )
    );
  };

  // Cancel (delete) order
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
