// src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

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
  userType: "retail",
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
  // load persisted user
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // NEW: preferredUserType persisted even for guests
  const [preferredUserType, setPreferredUserType] = useState(() => {
    try {
      return localStorage.getItem("preferredUserType") || "retail";
    } catch {
      return "retail";
    }
  });

  // persist user -> localStorage
  useEffect(() => {
    try {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
    } catch (e) {
      console.error("User persist error:", e);
    }
  }, [user]);

  // persist preferredUserType -> localStorage
  useEffect(() => {
    try {
      localStorage.setItem("preferredUserType", preferredUserType);
    } catch (e) {
      console.error("preferredUserType persist error:", e);
    }
  }, [preferredUserType]);

  // helper to produce normalized user object
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
      const next = typeof updated === "function" ? updated(prev) : { ...prev, ...updated };

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

  const addLinkedAccount = (type) => {
    setUser((prevRaw) => {
      const prev = prevRaw ?? defaultUser;
      const set = new Set(prev.availableAccounts || []);
      set.add(type);
      return finalizeUser({ ...prev, availableAccounts: Array.from(set) });
    });
  };

  // Switch active userType (keeps user in sync but does not create accounts)
  const switchUserType = (type) => {
    // update preferred first (single source of truth)
    setPreferredUserType(type);

    setUser((prevRaw) => {
      if (!prevRaw) return prevRaw; // if no logged-in user, don't create one here
      const prev = prevRaw ?? defaultUser;
      return finalizeUser({ ...prev, userType: type });
    });
  };

  const setPreferredType = (type) => {
    // call this from UI for guest toggles; it persists preference and also syncs existing user if present
    setPreferredUserType(type);
    if (user) {
      // keep logged in user's type in sync
      setUser((prevRaw) => (prevRaw ? finalizeUser({ ...prevRaw, userType: type }) : prevRaw));
    }
  };

  const logoutUser = () => {
    setUser(null);
  };

  // When provider mounts: ensure that if a user exists, their userType is in sync with preferredUserType
  useEffect(() => {
    if (user && user.userType !== preferredUserType) {
      setUser((prevRaw) => (prevRaw ? finalizeUser({ ...prevRaw, userType: preferredUserType }) : prevRaw));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <UserContext.Provider
      value={{
        user,
        loginUser,
        updateUser,
        logoutUser,
        addLinkedAccount,
        switchUserType,
        // new exports:
        preferredUserType,
        setPreferredUserType: setPreferredType,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
