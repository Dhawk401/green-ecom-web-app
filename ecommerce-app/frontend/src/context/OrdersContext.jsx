import React, { createContext, useContext, useState, useEffect } from "react";
import { useCart } from "./CartContext";

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const [justPlacedOrderIds, setJustPlacedOrderIds] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // ✅ Add new order with default null rating
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
    items.forEach((item) => {
      addToCart(item);
    });
  };

  // ✅ Can edit if just placed or rating is not yet given
  const canEditOrder = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    return justPlacedOrderIds.includes(orderId) || order?.rating === null;
  };

  // ✅ Update rating for specific order
  const updateOrderRating = (orderId, rating) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, rating: Number(rating) } : order
      )
    );
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
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
