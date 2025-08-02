// app/context/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      const userData = {
        name: 'Abhishek Shinde',
        email: 'abhishek@example.com',
        accountNumber: '9876543210',
      };
      setUser(userData);
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
