import { useRef } from 'react';

import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BottomNavBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;

   const navigationItems = [
    { id: 'Home', icon: '⌂', label: 'Home', type: 'normal' },
    { id: 'Alerts', icon: '⚠', label: 'Alerts', type: 'normal' },
    { id: 'Search', icon: '⚲', label: 'Search', type: 'special' },
    { id: 'History', icon: '⏲', label: 'History', type: 'normal' },
    { id: 'Profile', icon: '◯', label: 'Profile', type: 'normal' },
  ];

  const handleTabPress = (routeName, index, type) => {
    // Minimal scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[index].key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const renderNavItem = (item, index) => {
    const isActive = state.index === index;
    
    // Special elevated search button (PhonePe style)
    if (item.type === 'special') {
      return (
        <View key={item.id} style={styles.specialContainer}>
          {/* Add a subtle outer glow ring */}
          <View style={styles.glowRing} />
          <TouchableOpacity
            style={[
              styles.specialButton,
              isActive && styles.activeSpecialButton
            ]}
            onPress={() => handleTabPress(item.id, index, 'special')}
            activeOpacity={0.85}
          >
            <Text style={styles.specialIcon}>{item.icon}</Text>
            {/* Add subtle pulse effect indicator */}
            <View style={styles.pulseIndicator} />
          </TouchableOpacity>
        </View>
      );
    }

    // Normal navigation items
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.navItem}
        onPress={() => handleTabPress(item.id, index, 'normal')}
        activeOpacity={0.6}
      >
        <Text style={[
          styles.navIcon,
          isActive && styles.activeNavIcon
        ]}>
          {item.icon}
        </Text>
        <Text style={[
          styles.navLabel,
          isActive && styles.activeNavLabel
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Main Navigation Bar */}
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.navContainer}>
          {navigationItems.map((item, index) => renderNavItem(item, index))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    position: 'relative',
  },
  elevatedButtonBg: {
    // Removed - no longer needed
  },
  // Awesome glow effects for the floating button
  glowRing: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)', // Updated to match your blue theme
    top: -7.5,
    zIndex: 1,
  },
  pulseIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    top: 8,
    right: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    backgroundColor: '#2a2a3e',
    paddingTop: 8,
    paddingHorizontal: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  navIcon: {
    fontSize: 22,
    color: '#8B8B9B',
    marginBottom: 2,
  },
  activeNavIcon: {
    color: '#3B82F6',
  },
  navLabel: {
    fontSize: 10,
    color: '#8B8B9B',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  
  // Special elevated button - Awesome floating design
  specialContainer: {
    alignItems: 'center',
    marginTop: -45, // Moved higher up
    zIndex: 10,
    position: 'relative',
  },
  specialButton: {
    width: 70, // Increased size
    height: 70, // Increased size
    borderRadius: 35,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Will fallback to solid color
    backgroundColor: '#3B82F6', // Your theme's blue accent color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Add a subtle inner glow effect
    position: 'relative',
    zIndex: 15, // Ensure it's above other elements
  },
  activeSpecialButton: {
    backgroundColor: '#2563EB', // Darker shade of your blue
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    transform: [{ scale: 0.92 }],
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  specialIcon: {
    fontSize: 28, // Larger icon
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default BottomNavBar;