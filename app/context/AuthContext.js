import * as SecureStore from 'expo-secure-store';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';

export const AuthContext = createContext();

// API Configuration
const API_BASE_URL = 'http://10.79.49.1:7001/api/v1'; 
const LOGIN_ENDPOINT = '/agent/login';
const LOGOUT_ENDPOINT = '/agent/logout';
const DASHBOARD_ENDPOINT = '/agent/dashboard';

export const AuthProvider = ({ children }) => {
  const SESSION_TIMEOUT = 1000 * 60 * 60 * 12; // 12 hours
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const sessionTimer = useRef(null);
  const appState = useRef(AppState.currentState);

  const resetSessionTimer = () => {
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    sessionTimer.current = setTimeout(() => {
      logout('Session expired after 12 hours.');
    }, SESSION_TIMEOUT);
  };

  const login = async (agentno, password) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentno: agentno.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error status codes
        let errorMessage = 'Login failed. Please try again.';
        
        switch (response.status) {
          case 400:
            errorMessage = 'Agent number and password are required.';
            break;
          case 401:
            errorMessage = 'Invalid credentials. Please check your agent number and password.';
            break;
          case 403:
            errorMessage = 'Your account is inactive. Please contact administrator.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data.message || 'An unexpected error occurred.';
        }
        
        return { success: false, error: errorMessage };
      }

      // Successful login
      const { agent, accessToken } = data.data;
      
      const userData = {
        agentname: agent.agentname,
        agentno: agent.agentno,
        mobileNumber: agent.mobileNumber,
        patsansthaName: agent.patsansthaName,
        patsansthaId: agent.patsansthaId,
        accessToken: accessToken,
      };

      setUser(userData);
      
      // Store user data and session info securely
      await SecureStore.setItemAsync('session_user', JSON.stringify(userData));
      await SecureStore.setItemAsync('session_timestamp', Date.now().toString());
      await SecureStore.setItemAsync('access_token', accessToken);
      
      resetSessionTimer();
      
      // Fetch initial dashboard data after successful login
      await fetchDashboardData();
      
      return { success: true, user: userData };

    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        return { 
          success: false, 
          error: 'Network error. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (message) => {
    try {
      // Get the access token for the logout API call
      const accessToken = await SecureStore.getItemAsync('access_token');
      
      // Call logout API if token exists
      if (accessToken) {
        try {
          const response = await fetch(`${API_BASE_URL}${LOGOUT_ENDPOINT}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.warn('Logout API call failed, but continuing with local logout');
          }
        } catch (apiError) {
          console.warn('Logout API error:', apiError);
          // Continue with local logout even if API call fails
        }
      }
      
      // Clear local state and storage
      setUser(null);
      setDashboardData(null);
      clearTimeout(sessionTimer.current);
      
      // Clear all stored session data
      await SecureStore.deleteItemAsync('session_user');
      await SecureStore.deleteItemAsync('session_timestamp');
      await SecureStore.deleteItemAsync('access_token');
      
      if (message) {
        Alert.alert('Logged Out', message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loadSession = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('session_user');
      const timestamp = await SecureStore.getItemAsync('session_timestamp');
      const accessToken = await SecureStore.getItemAsync('access_token');

      if (storedUser && timestamp && accessToken) {
        const elapsed = Date.now() - parseInt(timestamp);
        
        if (elapsed < SESSION_TIMEOUT) {
          const userData = JSON.parse(storedUser);
          
          // Verify token is still valid by making a test API call
          const isTokenValid = await verifyToken(accessToken);
          
          if (isTokenValid) {
            setUser(userData);
            resetSessionTimer();
            // Load dashboard data for existing session
            await fetchDashboardData();
          } else {
            await logout('Session expired. Please login again.');
          }
        } else {
          await logout('Session expired after 12 hours');
        }
      }
    } catch (error) {
      console.error('Session load error:', error);
      // Clear corrupted session data
      await logout();
    }
  };

  const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}${DASHBOARD_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

  const getAuthHeaders = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      return {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Only logout on 401 if it's NOT a submit-collection request
      // submit-collection 401 means wrong password, not session expiry
      if (response.status === 401 && !url.includes('/submit-collection') && !url.includes('/collection/')) {
        await logout('Session expired. Please login again.');
        return null;
      }

      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  };

  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${DASHBOARD_ENDPOINT}`, {
        method: 'GET',
      });

      if (!response) {
        // User was logged out due to unauthorized request
        return null;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setDashboardData(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      return null;
    }
  };

  // Get user profile data function
  const getUserProfileData = () => {
    if (!user) return null;

    return {
      agentInfo: {
        agentname: user.agentname,
        agentno: user.agentno,
        mobileNumber: user.mobileNumber,
        email: dashboardData?.agentInfo?.email || null,
        joinDate: dashboardData?.agentInfo?.joinDate || null,
      },
      patsansthaInfo: {
        fullname: user.patsansthaName || dashboardData?.patsansthaInfo?.fullname,
        patsansthaId: user.patsansthaId,
        patname: dashboardData?.patsansthaInfo?.patname || null,
      },
    };
  };

  useEffect(() => {
    loadSession();

    const subscription = AppState.addEventListener('change', (nextState) => {
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
      clearTimeout(sessionTimer.current);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        dashboardData,
        login,
        logout,
        resetSessionTimer,
        getAuthHeaders,
        makeAuthenticatedRequest,
        fetchDashboardData,
        getUserProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;