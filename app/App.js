import * as Font from 'expo-font';
import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthContext, AuthProvider } from './context/AuthContext';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomNavBar from './components/BottomNavBar';
import AlertScreen from './Screens/AlertScreen/AlertScreen';
import HelpDeskScreen from './Screens/HelpDeskScreen/HelpDeskScreen';
import HistoryScreen from './Screens/HistoryScreen/HistoryScreen';
import HomeScreen from './Screens/HomeScreen/HomeScreen';
import LoginScreen from './Screens/LoginScreen/LoginScreen';
import ProfileScreen from './Screens/ProfileScreen/ProfileScreen';
import SearchScreen from './Screens/SearchScreen/SearchScreen';
import SplashScreen from './Screens/SplashScreen/SplashScreen';

const Tab = createBottomTabNavigator();

export const FONTS = {
  'DMSans-Medium': require('../assets/fonts/DMSans_18pt-Medium.ttf'),
  'DMSans-Bold': require('../assets/fonts/DMSans_24pt-Bold.ttf'),
};

const MainApp = () => {
  const { user } = useContext(AuthContext);

  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts before anything else
  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync(FONTS);
        console.log('✅ Fonts loaded');
      } catch (err) {
        console.warn('❌ Font load error:', err);
      } finally {
        setFontsLoaded(true);
      }
    })();
  }, []);

  // If fonts not ready yet → stay on splash
  if (!fontsLoaded || showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  // Main app after splash + fonts
  return (
    <SafeAreaProvider>
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
            options={{ tabBarButton: () => null }}
          />
        </Tab.Navigator>
      )}
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
