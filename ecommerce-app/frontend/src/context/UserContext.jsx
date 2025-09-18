// src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

// Default shape used when initializing or merging new data
const defaultUser = {
  firstName: "",
  lastName: "",
  name: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  profileImage: "",
  gender: "",
  userType: "retail",            // "retail" | "wholesale"
  availableAccounts: [],
  establishmentName: "",
  designation: "",
  establishmentPhone: "",
  establishmentAddress: "",
  gstNumber: "",
  isAccountComplete: false,
  completedAt: null,
  signupType: "",
};

export const UserProvider = ({ children }) => {
  // Load user from localStorage if present; else null means "not logged in"
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Persist to localStorage whenever user changes (and is not null)
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const finalizeUser = (base) => {
    const firstName = base.firstName ?? "";
    const lastName = base.lastName ?? "";
    const computedName =
      base.name && base.name.trim().length > 0
        ? base.name
        : `${firstName} ${lastName}`.trim();

    const availableAccounts = Array.isArray(base.availableAccounts)
      ? Array.from(new Set(base.availableAccounts))
      : [];

    return { ...defaultUser, ...base, name: computedName, availableAccounts };
  };

  const loginUser = (userData) => {
    const merged = finalizeUser({ ...userData });
    setUser(merged);
  };

  const updateUser = (updated) => {
    setUser((prevRaw) => {
      const prev = prevRaw ?? defaultUser;
      const next =
        typeof updated === "function" ? updated(prev) : { ...prev, ...updated };

      if (!("name" in next)) {
        const firstName = next.firstName ?? prev.firstName ?? "";
        const lastName = next.lastName ?? prev.lastName ?? "";
        next.name = `${firstName} ${lastName}`.trim();
      }

      if (!Array.isArray(next.availableAccounts)) next.availableAccounts = [];
      next.availableAccounts = Array.from(new Set(next.availableAccounts));

      return finalizeUser(next);
    });
  };

  const addLinkedAccount = (type /* "retail" | "wholesale" */) => {
    setUser((prevRaw) => {
      const prev = prevRaw ?? defaultUser;
      const set = new Set(prev.availableAccounts || []);
      set.add(type);
      return finalizeUser({ ...prev, availableAccounts: Array.from(set) });
    });
  };

  const switchUserType = (type /* "retail" | "wholesale" */) => {
    setUser((prevRaw) => {
      const prev = prevRaw ?? defaultUser;
      return finalizeUser({ ...prev, userType: type });
    });
  };

  const logoutUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loginUser,
        updateUser,
        logoutUser,
        addLinkedAccount,
        switchUserType,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
