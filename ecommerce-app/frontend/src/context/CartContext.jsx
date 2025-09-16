// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "cart"; // bump version if you change shape

export const CartProvider = ({ children }) => {
  // lazy init from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Cart: failed to parse localStorage", e);
      return [];
    }
  });

  // simple debounce to avoid many writes
  const saveTimer = useRef(null);
  const scheduleSave = (items) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Cart: failed to save to localStorage", e);
      }
      saveTimer.current = null;
    }, 200); // 200ms debounce
  };

  useEffect(() => {
    scheduleSave(cartItems);
    // cleanup on unmount
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [cartItems]);

  // Helpers / Actions (preserve your existing behavior)
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item._id === product._id && item.selectedWeight === product.selectedWeight
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: (copy[existingIndex].quantity || 0) + (product.quantity || 1),
        };
        return copy;
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const addMultipleToCart = (products) => {
    setCartItems((prev) => {
      const map = new Map();
      // start with existing
      prev.forEach((p) => map.set(`${p._id}::${p.selectedWeight}`, { ...p }));
      // merge new ones
      products.forEach((product) => {
        const key = `${product._id}::${product.selectedWeight}`;
        const existing = map.get(key);
        const qty = product.quantity || 1;
        if (existing) {
          existing.quantity = (existing.quantity || 0) + qty;
          map.set(key, existing);
        } else {
          map.set(key, { ...product, quantity: qty });
        }
      });
      return Array.from(map.values());
    });
  };

  const removeFromCart = (id, weight) => {
    setCartItems((prev) => prev.filter((item) => !(item._id === id && item.selectedWeight === weight)));
  };

  const updateQuantity = (id, weight, newQty) => {
    setCartItems((prev) => {
      if (newQty < 1) {
        return prev.filter((item) => !(item._id === id && item.selectedWeight === weight));
      }
      return prev.map((item) =>
        item._id === id && item.selectedWeight === weight ? { ...item, quantity: newQty } : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  // read-only derived value
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // ---------- Persistence helpers (for login merge etc) ----------
  // Force reload from storage (useful if you updated storage externally)
  const loadCartFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setCartItems(parsed);
    } catch (e) {
      console.error("Cart: failed to load from storage", e);
    }
  };

  // Merge serverCart (array) with local cart. Strategy: merge quantities for identical product+weight.
  // You can change merge logic to "server wins" or "client wins" depending on needs.
  const mergeLocalWithServer = (serverItems = []) => {
    setCartItems((local) => {
      const map = new Map();
      // add local first
      local.forEach((p) => map.set(`${p._id}::${p.selectedWeight}`, { ...p }));
      // merge server items (server will be added/incremented)
      serverItems.forEach((s) => {
        const key = `${s._id}::${s.selectedWeight}`;
        const existing = map.get(key);
        if (existing) {
          // choose to sum quantities (you can change to server overwrite by setting existing.quantity = s.quantity)
          existing.quantity = (existing.quantity || 0) + (s.quantity || 0);
          map.set(key, existing);
        } else {
          map.set(key, { ...s, quantity: s.quantity || 0 });
        }
      });
      const merged = Array.from(map.values());
      // persist merged immediately
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.error("Cart: failed to save merged cart to storage", e);
      }
      return merged;
    });
  };

  // Example: call this after successful login with serverCart (array) returned from backend.
  // serverCart should be [{ _id, selectedWeight, quantity, finalPrice, ... }]
  const syncOnLogin = async (serverCart = [], options = { clearLocalAfterMerge: true }) => {
    // Strategy:
    // 1) Merge local cart with serverCart (client+server quantities summed)
    // 2) Call backend to persist merged cart (you'll replace the comment with axios)
    mergeLocalWithServer(serverCart);

    // TODO: call backend API to save merged cart for the logged-in user.
    // await axios.post("/api/cart/merge", { items: merged })  // later

    if (options.clearLocalAfterMerge) {
      // If server will now be authoritative, optionally clear local storage (but we already saved merged to localStorage)
      // localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Expose everything
  const value = {
    cartItems,
    addToCart,
    addMultipleToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    // helpers
    loadCartFromStorage,
    mergeLocalWithServer,
    syncOnLogin,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
