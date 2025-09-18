// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePrice } from "./PriceContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { userType: priceUserType, getMultiplier } = usePrice();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cartItems");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to read cart from localStorage:", e);
      return [];
    }
  });

  // persist cart to localStorage so cart doesn't disappear
  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [cartItems]);

  // --- helpers ---
  const parseNumber = (v) => {
    if (typeof v === "number") return v;
    if (!v && v !== 0) return 0;
    const m = String(v).match(/([\d,.]+)/);
    if (!m) return 0;
    return parseFloat(m[1].replace(/,/g, "")) || 0;
  };

  // Add single product
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          item._id === product._id && item.selectedWeight === product.selectedWeight
      );
      if (existing) {
        return prev.map((item) =>
          item._id === product._id && item.selectedWeight === product.selectedWeight
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // store basePrice on the item so we can recompute finalPrice later
      const basePrice = parseNumber(product.basePrice ?? product.finalPrice ?? product.price);
      const finalPrice = Number((basePrice * getMultiplier(priceUserType)).toFixed(2));
      return [...prev, { ...product, quantity: 1, basePrice, finalPrice }];
    });
  };

  // Add multiple items (for reorder / bulk add)
  const addMultipleToCart = (products) => {
    setCartItems((prev) => {
      let updatedCart = [...prev];
      products.forEach((product) => {
        const existing = updatedCart.find(
          (item) =>
            item._id === product._id &&
            item.selectedWeight === product.selectedWeight
        );
        const basePrice = parseNumber(product.basePrice ?? product.finalPrice ?? product.price);
        if (existing) {
          updatedCart = updatedCart.map((item) =>
            item._id === product._id &&
            item.selectedWeight === product.selectedWeight
              ? {
                  ...item,
                  quantity: item.quantity + (product.quantity || 1),
                  // keep basePrice
                }
              : item
          );
        } else {
          updatedCart.push({
            ...product,
            quantity: product.quantity || 1,
            basePrice,
            finalPrice: Number((basePrice * getMultiplier(priceUserType)).toFixed(2)),
          });
        }
      });
      return updatedCart;
    });
  };

  // Remove by ID + weight
  const removeFromCart = (id, weight) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item._id === id && item.selectedWeight === weight)
      )
    );
  };

  // Update quantity by ID + weight
  const updateQuantity = (id, weight, newQty) => {
    setCartItems((prev) => {
      if (newQty < 1) {
        return prev.filter(
          (item) => !(item._id === id && item.selectedWeight === weight)
        );
      }
      return prev.map((item) =>
        item._id === id && item.selectedWeight === weight
          ? { ...item, quantity: newQty }
          : item
      );
    });
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem("cartItems");
    } catch (e) {
      console.error("Failed to remove cart from localStorage:", e);
    }
  };

  // Total item count for navbar badge
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Recompute finalPrice for all items given a userType (uses PriceContext.getMultiplier)
  const updatePricesForUserType = useCallback((type) => {
    setCartItems((prev) => {
      const multiplier = getMultiplier(type);
      return prev.map((it) => {
        const base = parseNumber(it.basePrice ?? it.price ?? it.finalPrice ?? 0);
        return {
          ...it,
          basePrice: base,
          finalPrice: Number((base * multiplier).toFixed(2)),
        };
      });
    });
  }, [getMultiplier]);

  // When PriceContext.userType changes, recompute finalPrice automatically
  useEffect(() => {
    updatePricesForUserType(priceUserType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceUserType]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        updatePricesForUserType, // exported so components can call it if needed
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
