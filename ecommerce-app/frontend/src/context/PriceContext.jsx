// src/context/PriceContext.jsx
import React, { createContext, useContext, useState } from "react";

const PriceContext = createContext();

export const PriceProvider = ({ children }) => {
  const [userType, setUserType] = useState("retail"); // default retail

  // Apply % markup/discount
  const getPrice = (basePrice) => {
    if (!basePrice || isNaN(basePrice)) return 0;
    let price = parseFloat(basePrice);

    // Example: retail is 15% higher
    if (userType === "retail") {
      return +(price * 1.15).toFixed(2);
    }
    // wholesale = base price
    return +price.toFixed(2);
  };

  const formatPrice = (val) => {
    if (!val || isNaN(val)) return "0";
    return Number.isInteger(val) ? val : val.toFixed(2);
  };

  const toggleUserType = () => {
    setUserType((prev) => (prev === "retail" ? "wholesale" : "retail"));
  };

  return (
    <PriceContext.Provider value={{ userType, toggleUserType, getPrice, formatPrice }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => useContext(PriceContext);
