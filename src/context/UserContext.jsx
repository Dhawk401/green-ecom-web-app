import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

// Default shape used when initializing or merging new data
const defaultUser = {
  // identity
  firstName: "",
  lastName: "",
  name: "",
  email: "",
  phone: "",
  // address
  street: "",
  city: "",
  state: "",
  zip: "",
  // profile
  profileImage: "",
  gender: "",
  // account types
  userType: "retail",            // current active type: "retail" | "wholesale"
  availableAccounts: [],         // ✅ empty by default; do NOT auto-add any account
  // wholesale fields
  establishmentName: "",
  designation: "",
  establishmentPhone: "",
  establishmentAddress: "",
  gstNumber: "",
  // status
  isAccountComplete: false,
  completedAt: null,
  signupType: "",                // "email" | "phone" | ""
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

  // Merge helper that also keeps "name" consistent (no auto-add of accounts)
  const finalizeUser = (base) => {
    const firstName = base.firstName ?? "";
    const lastName  = base.lastName ?? "";
    const computedName =
      base.name && base.name.trim().length > 0
        ? base.name
        : `${firstName} ${lastName}`.trim();

    // Ensure availableAccounts is an array (but do NOT inject "retail")
    const availableAccounts = Array.isArray(base.availableAccounts)
      ? Array.from(new Set(base.availableAccounts))
      : [];

    return { ...defaultUser, ...base, name: computedName, availableAccounts };
  };

  // Log the user in (accepts minimal info; merges with defaults)
  const loginUser = (userData) => {
    const merged = finalizeUser({ ...userData });
    setUser(merged);
  };

  /**
   * Update user:
   * - supports either an object of fields OR an updater function (prev => next)
   * - keeps "name" in sync with first/last if "name" not explicitly provided
   * - does NOT auto-add any account type
   */
  const updateUser = (updated) => {
    setUser((prevRaw) => {
      const prev = prevRaw ?? defaultUser;
      const next =
        typeof updated === "function" ? updated(prev) : { ...prev, ...updated };

      // Keep 'name' consistent if not explicitly provided
      if (!("name" in next)) {
        const firstName = next.firstName ?? prev.firstName ?? "";
        const lastName  = next.lastName  ?? prev.lastName  ?? "";
        next.name = `${firstName} ${lastName}`.trim();
      }

      // Normalize availableAccounts without injecting anything
      if (!Array.isArray(next.availableAccounts)) next.availableAccounts = [];
      next.availableAccounts = Array.from(new Set(next.availableAccounts));

      return finalizeUser(next);
    });
  };

  // Add a linked account type if missing (e.g., when creating retail from wholesale)
  const addLinkedAccount = (type /* "retail" | "wholesale" */) => {
    setUser((prevRaw) => {
      const prev = prevRaw ?? defaultUser;
      const set = new Set(prev.availableAccounts || []);
      set.add(type);
      return finalizeUser({ ...prev, availableAccounts: Array.from(set) });
    });
  };

  // Switch active userType (must already exist in availableAccounts ideally)
  const switchUserType = (type /* "retail" | "wholesale" */) => {
    setUser((prevRaw) => {
      const prev = prevRaw ?? defaultUser;
      return finalizeUser({ ...prev, userType: type });
    });
  };

  // Logout
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
