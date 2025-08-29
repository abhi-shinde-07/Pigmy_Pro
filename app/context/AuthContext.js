import * as SecureStore from 'expo-secure-store';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { AppState, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const AuthContext = createContext();

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const LOGIN_ENDPOINT = '/agent/login';
const LOGOUT_ENDPOINT = '/agent/logout';
const DASHBOARD_ENDPOINT = '/agent/dashboard';

export const AuthProvider = ({ children }) => {
  const SESSION_TIMEOUT =   12 * 60 * 60 * 1000;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const sessionTimer = useRef(null);
  const appState = useRef(AppState.currentState);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogData, setDialogData] = useState({ title: '', message: '', type: 'info', buttonText: 'OK' });
  const isLoggingOut = useRef(false); // 🔑 Prevent multiple dialogs

  const showDialog = ({ title, message, type = 'info', buttonText = 'OK' }) => {
    setDialogData({ title, message, type, buttonText });
    setDialogVisible(true);
  };

  const closeDialog = () => setDialogVisible(false);

  const resetSessionTimer = () => {
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    sessionTimer.current = setTimeout(() => {
      logout('You Have been logged out due to inactivity.');
    }, SESSION_TIMEOUT);
  };

  const login = async (agentno, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentno: agentno.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Login failed',
          message: data.message || 'Login failed',
        };
      }

      const { agent, accessToken } = data.data;

      const userData = {
        _id: agent._id,
        agentname: agent.agentname,
        agentno: agent.agentno,
        mobileNumber: agent.mobileNumber,
        patsansthaName: agent.patsansthaName,
        patsansthaId: agent.patsansthaId,
        address: agent.address,
        expDate: agent.expDate,
        accessToken,
        loginTime: Date.now(),
      };

      setUser(userData);
      await SecureStore.setItemAsync('session_user', JSON.stringify(userData));
      await SecureStore.setItemAsync('session_timestamp', Date.now().toString());
      await SecureStore.setItemAsync('access_token', accessToken);

      resetSessionTimer();
      await fetchDashboardData();

      return {
        success: true,
        user: userData,
        message: data.message || 'Login successful',
      };
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        return {
          success: false,
          error: 'Network error. Please check your connection.',
          message: 'Network error. Please check your connection.',
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred.',
        message: 'An unexpected error occurred.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (message) => {
    if (isLoggingOut.current) return; // 🔑 prevent duplicate calls
    isLoggingOut.current = true;

    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (accessToken) {
        try {
          await fetch(`${API_BASE_URL}${LOGOUT_ENDPOINT}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          });
        } catch {}
      }

      setUser(null);
      setDashboardData(null);
      clearTimeout(sessionTimer.current);
      await SecureStore.deleteItemAsync('session_user');
      await SecureStore.deleteItemAsync('session_timestamp');
      await SecureStore.deleteItemAsync('access_token');

      if (message) {
        showDialog({
          message,
          type: message.includes('expired') ? 'warning' : 'info',
          buttonText: 'Understood',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Reset flag after small delay (so another logout can show popup later if needed)
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 500);
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
          const isTokenValid = await verifyToken(accessToken);
          if (isTokenValid) {
            setUser(userData);
            resetSessionTimer();
            await fetchDashboardData();
          } else {
            await logout('Session expired. Please log in again.');
          }
        } else {
          await logout('Session expired due to inactivity. Please log in again.');
        }
      }
    } catch (error) {
      await logout();
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}${DASHBOARD_ENDPOINT}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const getAuthHeaders = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      return { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    } catch {
      return { 'Content-Type': 'application/json' };
    }
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });

      if (response.status === 401) {
        if (!url.includes('/submit-collection') && !url.includes('/collection/') && !url.includes('/add-collection')) {
          await logout('Your account has logged in another device.');
          return null;
        }
      }
      if (response.status === 403) {
        await logout('Your account has been deactivated.');
        return null;
      }
      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${DASHBOARD_ENDPOINT}`, { method: 'GET' });
      if (!response) return null;
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const result = await response.json();
      if (result.success && result.data) {
        setDashboardData(result.data);
        return result.data;
      }
      throw new Error(result.message || 'Failed to fetch dashboard data');
    } catch {
      return null;
    }
  };

  const refreshDashboardData = async () => {
    if (!user) return null;
    return await fetchDashboardData();
  };

  const getUserProfileData = () => {
    if (!user) return null;
    return {
      agentInfo: {
        _id: user._id,
        agentname: user.agentname,
        agentno: user.agentno,
        mobileNumber: user.mobileNumber,
        status: dashboardData?.agentInfo?.status || 'unknown',
        loginTime: user.loginTime,
        expDate: user.expDate
      },
      patsansthaInfo: {
        fullname: user.patsansthaName || dashboardData?.patsansthaInfo?.fullname || '',
        patsansthaId: user.patsansthaId,
        patname: dashboardData?.patsansthaInfo?.patname || '',
      },
      collectionInfo: {
        hasDataToWork: dashboardData?.hasDataToWork || false,
        currentCollection: dashboardData?.currentCollection || null,
        totalTransactions: dashboardData?.totalTransactions || 0,
        collectionStatus: dashboardData?.collectionStatus || null,
      },
    };
  };

  const hasActiveCollection = () => {
    return dashboardData?.hasDataToWork === true && dashboardData?.currentCollection && !dashboardData?.currentCollection?.submitted;
  };

  const getCollectionSummary = () => {
    if (!dashboardData?.collectionStatus) return null;
    return {
      totalTransactions: dashboardData.collectionStatus.totalTransactions || 0,
      totalCollected: dashboardData.collectionStatus.totalCollected || 0,
      submitted: dashboardData.collectionStatus.submitted || false,
      submittedAt: dashboardData.collectionStatus.submittedAt || null,
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
        refreshDashboardData,
        getUserProfileData,
        hasActiveCollection,
        getCollectionSummary,
      }}
    >
      {children}

      {/* Dialog */}
      <Modal transparent visible={dialogVisible} animationType="fade" onRequestClose={closeDialog}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, dialogData.type === 'warning' ? styles.warningBorder : styles.infoBorder]}>
            <Text style={styles.modalMessage}>{dialogData.message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeDialog}>
              <Text style={styles.modalButtonText}>{dialogData.buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1 },
  warningBorder: { borderColor: '#ff9800' },
  infoBorder: { borderColor: '#2196f3' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  modalMessage: { fontSize: 16, color: '#333', marginBottom: 20 , textAlign: 'center', fontFamily: 'DMSans-Medium',},
  modalButton: { backgroundColor: '#2196f3', borderRadius: 8, paddingVertical: 10, alignItems: 'center',fontFamily: 'DMSans-Bold', },
  modalButtonText: { color: '#fff', fontSize: 16,fontFamily: 'DMSans-Bold',},
});

export default AuthProvider;
