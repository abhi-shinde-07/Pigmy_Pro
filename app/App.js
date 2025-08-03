import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AppState, PanResponder, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthContext, AuthProvider } from './context/AuthContext';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AlertScreen from './components/AlertScreen';
import BottomNavBar from './components/BottomNavBar';
import HistoryScreen from './components/HistoryScreen';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import PinScreen from './components/PinScreen';
import ProfileScreen from './components/ProfileScreen';
import SearchScreen from './components/SearchScreen';
import SplashScreen from './components/SplashScreen';

const Tab = createBottomTabNavigator();

const MainApp = () => {
  const { user, pinRequired, resetInactivityTimer } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // 🔄 Reset timer when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resetInactivityTimer?.();
    });
    return () => sub.remove();
  }, [resetInactivityTimer]);

  // 🔄 Reset timer on any screen tap
  const handleUserInteraction = useCallback(() => {
    resetInactivityTimer?.();
  }, [resetInactivityTimer]);

  // PanResponder to detect touch without interfering with scrolling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      handleUserInteraction();
      return false; // Don't capture the gesture, let it pass through
    },
    onMoveShouldSetPanResponder: () => false,
  });

  // Splash handling
  useEffect(() => {
    if (!showSplash && !appReady) {
      setTimeout(() => setAppReady(true), 300);
    }
  }, [showSplash, appReady]);

  if (showSplash || !appReady) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  // ⏳ Show Pin Screen if timeout reached
  if (pinRequired && user) return <PinScreen />;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
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
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}