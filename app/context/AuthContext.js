import * as SecureStore from 'expo-secure-store';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const SESSION_TIMEOUT = 1000 * 60 * 60 * 12; // 12 hours
  const PIN_TIMEOUT = 1000 * 10; 
  const [user, setUser] = useState(null);
  const [pinRequired, setPinRequired] = useState(false);
  const sessionTimer = useRef(null);
  const inactivityTimer = useRef(null);
  const appState = useRef(AppState.currentState);

  const resetSessionTimer = () => {
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    sessionTimer.current = setTimeout(() => {
      logout('Session expired after 12 hours.');
    }, SESSION_TIMEOUT);
  };

  const resetInactivityTimer = () => {
    if (!user || pinRequired) return; // Don't run timer when user is logged out or already needs PIN
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setPinRequired(true);
    }, PIN_TIMEOUT);
  };

  const login = async (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      const userData = {
        name: 'Abhishek Shinde',
        email: 'abhishek@example.com',
        accountNumber: '9876543210',
      };
      setUser(userData);
      await SecureStore.setItemAsync('session_user', JSON.stringify(userData));
      await SecureStore.setItemAsync('session_timestamp', Date.now().toString());
      resetSessionTimer();
      resetInactivityTimer();
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = async (message) => {
    setUser(null);
    setPinRequired(false);
    clearTimeout(sessionTimer.current);
    clearTimeout(inactivityTimer.current);
    await SecureStore.deleteItemAsync('session_user');
    await SecureStore.deleteItemAsync('session_timestamp');
    if (message) Alert.alert('Logged Out', message);
  };

  const verifyPin = async (pin) => {
    const correctPin = '1234';
    if (pin === correctPin) {
      setPinRequired(false);
      resetInactivityTimer(); // Restart inactivity timer
      return true;
    }
    return false;
  };

  const loadSession = async () => {
    const storedUser = await SecureStore.getItemAsync('session_user');
    const timestamp = await SecureStore.getItemAsync('session_timestamp');

    if (storedUser && timestamp) {
      const elapsed = Date.now() - parseInt(timestamp);
      if (elapsed < SESSION_TIMEOUT) {
        setUser(JSON.parse(storedUser));
        resetSessionTimer();
        resetInactivityTimer();
      } else {
        logout('Session expired after 12 hours');
      }
    }
  };

  useEffect(() => {
    loadSession();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        resetInactivityTimer();
      }
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
      clearTimeout(sessionTimer.current);
      clearTimeout(inactivityTimer.current);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        pinRequired,
        verifyPin,
        resetInactivityTimer,
        resetSessionTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
