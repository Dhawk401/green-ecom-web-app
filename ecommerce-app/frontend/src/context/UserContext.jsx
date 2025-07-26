import React, { createContext, useContext, useState } from 'react';

// Initial user structure
const defaultUser = {
  name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  zip: '',
  isAccountComplete: false, // ✅ NEW FIELD
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Start as null to check if user is logged in

  const loginUser = (userData) => {
    setUser(userData); // stores name, email or phone
  };

  const updateUser = (updatedData) => {
    const updatedUser = {
      ...user,
      ...updatedData,
      name: `${updatedData.firstName || user.firstName} ${updatedData.lastName || user.lastName}`,
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };


  const logoutUser = () => {
    setUser(null); // Set to null on logout
  };

  return (
    <UserContext.Provider value={{ user, loginUser, updateUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
