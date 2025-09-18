// src/context/PriceContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const PriceContext = createContext({
  userType: "retail",
  setUserType: () => {},
  toggleUserType: () => {},
  getMultiplier: () => 1,
  getPrice: () => 0,
  formatPrice: (v) => String(v),
});

const PRICE_MULTIPLIERS = {
  retail: 1.15,   // retail 15% higher (example)
  wholesale: 1.0, // wholesale baseline
};

export const PriceProvider = ({ children }) => {
  // Initialize from localStorage if available so toggle persists across reloads
  const [userType, setUserTypeState] = useState(() => {
    try {
      return localStorage.getItem("price_userType") || "retail";
    } catch {
      return "retail";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("price_userType", userType);
    } catch {}
  }, [userType]);

  const setUserType = useCallback((t) => {
    setUserTypeState(t === "wholesale" ? "wholesale" : "retail");
  }, []);

  const toggleUserType = useCallback(() => {
    setUserTypeState((p) => (p === "retail" ? "wholesale" : "retail"));
  }, []);

  const getMultiplier = useCallback((type = userType) => {
    return PRICE_MULTIPLIERS[type] ?? 1;
  }, [userType]);

  const getPrice = useCallback((basePrice, type = userType) => {
    const n = Number(basePrice) || 0;
    return Number((n * getMultiplier(type)).toFixed(2));
  }, [getMultiplier, userType]);

  const formatPrice = useCallback((val) => {
    if (val === null || val === undefined) return "0";
    const n = Number(val);
    if (Number.isNaN(n)) return String(val);
    return Number.isInteger(n) ? `${n}` : n.toFixed(2);
  }, []);

  return (
    <PriceContext.Provider
      value={{
        userType,
        setUserType,
        toggleUserType,
        getMultiplier,
        getPrice,
        formatPrice,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => useContext(PriceContext);
