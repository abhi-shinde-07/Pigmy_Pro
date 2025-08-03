import React, { useContext, useEffect, useState } from 'react';
import { AppState, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthContext, AuthProvider } from './context/AuthContext';

import AlertScreen from './components/AlertScreen';
import BottomNavBar from './components/BottomNavBar';
import HistoryScreen from './components/HistoryScreen';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import PinScreen from './components/PinScreen';
import ProfileScreen from './components/ProfileScreen';
import SearchScreen from './components/SearchScreen';
import SplashScreen from './components/SplashScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const MainApp = () => {
  const { user, pinRequired, resetInactivityTimer } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resetInactivityTimer?.();
    });
    return () => sub.remove();
  }, []);

  const handleUserTouch = () => {
    resetInactivityTimer?.();
  };

  useEffect(() => {
    if (!showSplash && !appReady) {
      setTimeout(() => setAppReady(true), 300);
    }
  }, [showSplash, appReady]);

  if (showSplash || !appReady) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  if (pinRequired && user) return <PinScreen />;

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={handleUserTouch} onTouchStart={handleUserTouch}>
        <View style={{ flex: 1 }}>
          {!user ? (
            <LoginScreen />
          ) : (
            <Tab.Navigator
              tabBar={(props) => <BottomNavBar {...props} />}
              screenOptions={{ headerShown: false }}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Alerts" component={AlertScreen} />
              <Tab.Screen name="Search" component={SearchScreen} />
              <Tab.Screen name="History" component={HistoryScreen} />
              <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
};

// Do not add NavigationContainer here if using DOM or another setup
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
