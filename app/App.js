import * as Font from 'expo-font';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AppState, PanResponder, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthContext, AuthProvider } from './context/AuthContext';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AlertScreen from './components/AlertScreen';
import BottomNavBar from './components/BottomNavBar';
import HelpDeskScreen from './components/HelpDeskScreen'; // ✅ NEW
import HistoryScreen from './components/HistoryScreen';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import PinScreen from './components/PinScreen';
import ProfileScreen from './components/ProfileScreen';
import SearchScreen from './components/SearchScreen';
import SplashScreen from './components/SplashScreen';

const Tab = createBottomTabNavigator();

export const FONTS = {
  'DMSans-Medium': require('../assets/fonts/DMSans_18pt-Medium.ttf'),
  'DMSans-Bold': require('../assets/fonts/DMSans_24pt-Bold.ttf'),
};

const MainApp = () => {
  const { user, pinRequired, resetInactivityTimer } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(FONTS);
        console.log('✅ Custom fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.warn('❌ Error loading fonts:', error);
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resetInactivityTimer?.();
    });
    return () => sub.remove();
  }, [resetInactivityTimer]);

  const handleUserInteraction = useCallback(() => {
    resetInactivityTimer?.();
  }, [resetInactivityTimer]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      handleUserInteraction();
      return false;
    },
    onMoveShouldSetPanResponder: () => false,
  });

  useEffect(() => {
    if (!showSplash && !appReady && fontsLoaded) {
      setTimeout(() => setAppReady(true), 300);
    }
  }, [showSplash, appReady, fontsLoaded]);

  if (showSplash || !appReady || !fontsLoaded) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

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
            <Tab.Screen
              name="HelpDesk"
              component={HelpDeskScreen}
              options={{ tabBarButton: () => null }} // ✅ Hide from tab bar
            />
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
