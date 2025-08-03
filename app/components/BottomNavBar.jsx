import {
  faBell,
  faHistory,
  faHome,
  faSearch,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useRef } from 'react';
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

  const navigationItems = [
    { id: 'Home', icon: faHome, label: 'Home', type: 'normal' },
    { id: 'Alerts', icon: faBell, label: 'Alerts', type: 'normal' },
    { id: 'Search', icon: faSearch, label: 'Search', type: 'special' },
    { id: 'History', icon: faHistory, label: 'History', type: 'normal' },
    { id: 'Profile', icon: faUser, label: 'Profile', type: 'normal' },
  ];

  const handleTabPress = (routeName, index, type) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[index].key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  // Individual animation refs for each nav item (simplified)
  const animationRefs = useRef(
    navigationItems.map(() => ({
      scale: new Animated.Value(1),
    }))
  ).current;

  // Special button animations
  const specialButtonScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Continuous glow animation for special button
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    glowAnimation.start();

    return () => {
      glowAnimation.stop();
    };
  }, []);

  const animateTabPress = (index, isSpecial = false) => {
    if (isSpecial) {
      // Special button animation
      Animated.sequence([
        Animated.timing(specialButtonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(specialButtonScale, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Normal tab animation
      const { scale } = animationRefs[index];
      
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 300,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const renderNavItem = (item, index) => {
    const isActive = state.index === index;
    const { scale } = animationRefs[index];
    
    // Special elevated search button
    if (item.type === 'special') {
      return (
        <View key={item.id} style={styles.specialContainer}>
          {/* Animated glow ring */}
          <Animated.View 
            style={[
              styles.glowRing, 
              { opacity: glowOpacity }
            ]} 
          />
          
          <Animated.View
            style={[
              styles.specialButton,
              isActive && styles.activeSpecialButton,
              { transform: [{ scale: specialButtonScale }] }
            ]}
          >
            <TouchableOpacity
              style={styles.specialButtonTouchable}
              onPress={() => {
                animateTabPress(index, true);
                handleTabPress(item.id, index, 'special');
              }}
              activeOpacity={0.8}
            >
              <FontAwesomeIcon 
                icon={item.icon} 
                size={22} 
                color="#FFFFFF" 
                style={styles.specialIcon}
              />
              
              {/* Static pulse indicator */}
              <View style={styles.pulseIndicator} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    }

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.navItem,
          { transform: [{ scale }] }
        ]}
      >
        <TouchableOpacity
          style={styles.navItemTouchable}
          onPress={() => {
            animateTabPress(index);
            handleTabPress(item.id, index, 'normal');
          }}
          activeOpacity={0.7}
        >
          <FontAwesomeIcon 
            icon={item.icon} 
            size={20} 
            color={isActive ? '#6739B7' : '#9CA3AF'}
            style={styles.navIcon}
          />
          
          <Text style={[
            styles.navLabel,
            isActive && styles.activeNavLabel
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainContainer}>
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
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingHorizontal: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  
  // Normal navigation items
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  navItemTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  navLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    fontFamily: 'DMSans-Regular',
    marginTop: 2,
  },
  activeNavLabel: {
    color: '#6739B7',
    fontWeight: '600',
  },
  
  // Special floating button (keeping original design but adjusted)
  glowRing: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(103, 57, 183, 0.3)',
    top: -7.5,
    zIndex: 1,
  },
  specialContainer: {
    alignItems: 'center',
    marginTop: -45,
    zIndex: 10,
    position: 'relative',
  },
  specialButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6739B7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6739B7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    zIndex: 15,
  },
  activeSpecialButton: {
    backgroundColor: '#5B21B6',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  specialButtonTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  specialIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
});

export default BottomNavBar;