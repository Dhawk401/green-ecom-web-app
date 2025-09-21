// src/components/CheckoutSelector.jsx
import React, { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { usePrice } from "../context/PriceContext";
import Checkout from "../pages/Checkout";
import CheckoutWholesale from "../pages/CheckoutWholesale";

const CheckoutSelector = () => {
  const { user, switchUserType } = useUser();
  const { userType: priceUserType } = usePrice();

  // Option A: price toggle takes precedence over user.userType
  const effective = priceUserType || (user && user.userType) || "retail";

  // Optional: when logged in, persist the toggle into UserContext so the logged-in user's role follows the UI toggle
  // (only run when user exists and priceUserType is present)
  useEffect(() => {
    if (user && priceUserType && user.userType !== priceUserType && typeof switchUserType === "function") {
      // keep user role in sync with UI toggle
      switchUserType(priceUserType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceUserType]);

  return effective === "wholesale" ? <CheckoutWholesale /> : <Checkout />;
};

export default CheckoutSelector;
