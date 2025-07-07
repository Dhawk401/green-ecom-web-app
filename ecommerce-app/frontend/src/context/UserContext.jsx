import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loginUser = (name, email) => {
    setUser({ name, email });
  };

  const updateUser = (updatedFields) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedFields,
    }));
  };

  const logoutUser = () => {
    setUser(null);
  };


  return (
    <UserContext.Provider value={{ user, loginUser, updateUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
