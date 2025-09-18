// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
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
      return [...prev, { ...product, quantity: 1 }];
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
        if (existing) {
          updatedCart = updatedCart.map((item) =>
            item._id === product._id &&
            item.selectedWeight === product.selectedWeight
              ? {
                  ...item,
                  quantity: item.quantity + (product.quantity || 1),
                }
              : item
          );
        } else {
          updatedCart.push({ ...product, quantity: product.quantity || 1 });
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
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
