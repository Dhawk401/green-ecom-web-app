// CartContext.jsx
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Add single product
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ✅ Add multiple items (for reorder / bulk add)
  const addMultipleToCart = (products) => {
    setCartItems((prev) => {
      let updatedCart = [...prev];
      products.forEach((product) => {
        const existing = updatedCart.find((item) => item._id === product._id);
        if (existing) {
          updatedCart = updatedCart.map((item) =>
            item._id === product._id
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

  // Remove by ID
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  // Update quantity
  const updateQuantity = (id, newQty) => {
    setCartItems((prev) => {
      if (newQty < 1) return prev.filter((item) => item._id !== id);
      return prev.map((item) =>
        item._id === id ? { ...item, quantity: newQty } : item
      );
    });
  };

  // Clear cart
  const clearCart = () => setCartItems([]);

  // ✅ Total item count for navbar badge
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
        cartCount, // Exposed for navbar badge
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
