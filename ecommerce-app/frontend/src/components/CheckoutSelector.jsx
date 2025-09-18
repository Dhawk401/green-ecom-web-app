// src/components/CheckoutSelector.jsx
import React from "react";
import { useUser } from "../context/UserContext";
import { usePrice } from "../context/PriceContext";
import Checkout from "../pages/Checkout";
import CheckoutWholesale from "../pages/CheckoutWholesale";

const CheckoutSelector = () => {
  const { user } = useUser();
  const { userType: priceUserType } = usePrice();

  // priority: logged-in user's role -> price toggle -> fallback retail
  const effective = (user && user.userType) ? user.userType : (priceUserType || "retail");

  if (effective === "wholesale") {
    return <CheckoutWholesale />;
  }
  return <Checkout />;
};

export default CheckoutSelector;
