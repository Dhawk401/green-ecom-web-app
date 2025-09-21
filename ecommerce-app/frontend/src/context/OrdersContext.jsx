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
      console.error("Failed to save justPlacedOrderIds to localStorage:", e);
    }
  }, [justPlacedOrderIds]);

  // ---------------------- Wallet helpers ----------------------
  // Safely read wallet balance (returns Number)
  const readWalletBalance = () => {
    try {
      const raw = localStorage.getItem("walletBalance");
      const cleaned = raw ? String(raw).replace(/[,₹\s]/g, "") : "0";
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : 0;
    } catch (e) {
      console.error("readWalletBalance error:", e);
      return 0;
    }
  };

  // Safely write wallet balance (rounded to 2 decimals) and notify same-tab listeners
  const writeWalletBalance = (val) => {
    try {
      const rounded = Number(Math.round((Number(val) || 0) * 100) / 100).toFixed(2);
      localStorage.setItem("walletBalance", String(rounded));
      try {
        window.dispatchEvent(new CustomEvent("walletUpdated", { detail: Number(rounded) }));
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error("writeWalletBalance error:", e);
    }
  };

  // ---------------------- Orders helpers ----------------------
  const addOrder = (newOrder) => {
    const orderWithRating = { ...newOrder, rating: null };
    setOrders((prev) => [orderWithRating, ...prev]);
    setJustPlacedOrderIds((prev) => {
      const next = new Set(prev.map(String));
      next.add(String(orderWithRating.id));
      return [...next];
    });
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
    const idStr = String(orderId);
    const order = orders.find((o) => String(o.id) === idStr);
    return justPlacedOrderIds.map(String).includes(idStr) || order?.rating === null;
  };

  const updateOrderRating = (orderId, rating) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, rating: Number(rating) } : o))
    );
  };

  // Helper: parse numeric price
  const getNumericPrice = (item) => {
    const candidate = item.finalPrice ?? item.price ?? 0;
    if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
    if (typeof candidate === "string") {
      const cleaned = candidate.replace(/[^\d.,-]/g, "").trim();
      const num = parseFloat(cleaned.replace(/,/g, ""));
      return Number.isFinite(num) ? num : 0;
    }
    return 0;
  };

  // ---------------------- updateOrder with wallet adjustment ----------------------
  const updateOrder = (orderId, updatedItems) => {
    const items = (updatedItems || []).map((it) => ({
      ...it,
      quantity: it.quantity || 1,
    }));

    const totalNumericNew = items.reduce((s, it) => {
      const price = getNumericPrice(it);
      const qty = Number(it.quantity || 0);
      return s + price * qty;
    }, 0);

    setOrders((prev) => {
      const prevOrder = prev.find((o) => String(o.id) === String(orderId));
      let prevTotalNumeric = 0;

      if (prevOrder) {
        if (prevOrder.items && Array.isArray(prevOrder.items) && prevOrder.items.length) {
          prevTotalNumeric = prevOrder.items.reduce((s, it) => {
            const price = getNumericPrice(it);
            const qty = Number(it.quantity || 0);
            return s + price * qty;
          }, 0);
        } else if (typeof prevOrder.total === "string") {
          const t = prevOrder.total.replace(/[^\d.-]/g, "");
          prevTotalNumeric = Number.isFinite(Number(t)) ? Number(t) : 0;
        } else if (typeof prevOrder.total === "number") {
          prevTotalNumeric = prevOrder.total;
        }
      }

      const delta = Number((totalNumericNew - prevTotalNumeric).toFixed(2));

      try {
        const currentBal = readWalletBalance();
        // If delta > 0 user added more -> deduct delta from wallet
        // If delta < 0 user removed items -> credit wallet (subtracting negative = add)
        const newBal = Number((currentBal - delta).toFixed(2));
        writeWalletBalance(newBal);
      } catch (e) {
        console.error("Failed to adjust wallet on order update:", e);
      }

      return prev.map((o) =>
        String(o.id) === String(orderId)
          ? {
              ...o,
              items,
              total: `₹${Number(totalNumericNew).toFixed(2)}`,
              updatedAt: Date.now(),
            }
          : o
      );
    });
  };

  // ---------------------- cancelOrder with refund ----------------------
  const cancelOrder = (orderId) => {
    setOrders((prev) => {
      const orderToCancel = prev.find((o) => String(o.id) === String(orderId));
      let refundAmount = 0;

      if (orderToCancel) {
        if (orderToCancel.items && Array.isArray(orderToCancel.items) && orderToCancel.items.length) {
          refundAmount = orderToCancel.items.reduce((s, it) => {
            const price = getNumericPrice(it);
            const qty = Number(it.quantity || 0);
            return s + price * qty;
          }, 0);
        } else if (typeof orderToCancel.total === "string") {
          const t = orderToCancel.total.replace(/[^\d.-]/g, "");
          refundAmount = Number.isFinite(Number(t)) ? Number(t) : 0;
        } else if (typeof orderToCancel.total === "number") {
          refundAmount = orderToCancel.total;
        }
      }

      try {
        const currentBal = readWalletBalance();
        const newBal = Number((currentBal + Number(refundAmount)).toFixed(2));
        writeWalletBalance(newBal);
      } catch (e) {
        console.error("Failed to refund wallet on cancel:", e);
      }

      return prev.filter((o) => String(o.id) !== String(orderId));
    });

    setJustPlacedOrderIds((prev) => prev.filter((id) => String(id) !== String(orderId)));
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
