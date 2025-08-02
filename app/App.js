// App.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import AlertScreen from './components/AlertScreen';
import BottomNavBar from './components/BottomNavBar';
import HistoryScreen from './components/HistoryScreen';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import SearchScreen from './components/SearchScreen';
import SplashScreen from './components/SplashScreen';

// ✅ Auth context
import { AuthContext, AuthProvider } from './context/AuthContext';

const Tab = createBottomTabNavigator();

// 🔁 MainApp that reacts to auth context
const MainApp = () => {
  const { user } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!showSplash && !appReady) {
      const initializeApp = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
        } finally {
          setAppReady(true);
        }
      };
      initializeApp();
    }
  }, [showSplash, appReady]);

  if (showSplash || !appReady) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
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
    </SafeAreaProvider>
  );
};

// 🔁 Wrap with AuthProvider to make context work globally
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
