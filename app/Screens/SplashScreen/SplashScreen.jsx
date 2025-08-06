import { useEffect, useRef } from 'react';

import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onAnimationComplete }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textSlideY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const backgroundFade = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Modern glow effect
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Phase 1: Logo entrance with modern spring animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Subtle glow effect
      Animated.sequence([
        Animated.delay(150),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.6,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(glowScale, {
            toValue: 1.1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // Phase 2: Text animation
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(textSlideY, {
            toValue: 0,
            tension: 120,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Phase 3: Completion
          setTimeout(() => {
            startPulseEffect();
            setTimeout(() => {
              completeAnimation();
            }, 800);
          }, 400);
        });
      }, 200);
    });
  };

  const startPulseEffect = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 300,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const completeAnimation = () => {
    Animated.timing(backgroundFade, {
      toValue: 0,
      duration: 400,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      onAnimationComplete && onAnimationComplete();
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: backgroundFade,
        }
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6739B7" />
      
      {/* Modern gradient background */}
      <View style={styles.backgroundGradient} />
      
      {/* Floating geometric elements */}
      <View style={styles.floatingElements}>
        <View style={[styles.floatingElement, styles.element1]} />
        <View style={[styles.floatingElement, styles.element2]} />
        <View style={[styles.floatingElement, styles.element3]} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo section */}
        <View style={styles.logoContainer}>
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
          
          {/* PigmyPro Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, pulseAnim) }
                ],
              },
            ]}
          >
            <Image 
              source={require('../../../assets/images/PigmyPro.png')}
              style={styles.logoImage}
              resizeMode="contain"
              onError={(error) => console.log('Logo image error:', error)}
            />
          </Animated.View>
        </View>

        {/* App branding */}
        <Animated.View
          style={[
            styles.brandingContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textSlideY }],
            },
          ]}
        >

          <Text style={styles.appSubtitle}>Agent Management</Text>
          
          <View style={styles.taglineContainer}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>Secure & Simple</Text>
            <View style={styles.taglineLine} />
          </View>
        </Animated.View>
      </View>

      {/* Bottom branding */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: textOpacity,
          },
        ]}
      >
        <Text style={styles.poweredBy}>Powered by</Text>
        <View style={styles.brandContainer}>
          <Image 
            source={require('../../../assets/images/Techy_Verve.png')}
            style={styles.companyLogo}
            resizeMode="contain"
            onError={(error) => console.log('Company logo error:', error)}
          />
        </View>
        <Text style={styles.copyright}>© 2024 All Rights Reserved</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6739B7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#6739B7',
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.05,
  },
  element1: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    top: '15%',
    right: '15%',
  },
  element2: {
    width: 60,
    height: 60,
    backgroundColor: '#9333EA',
    top: '65%',
    left: '20%',
  },
  element3: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    bottom: '25%',
    right: '25%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoWrapper: {
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
  },
  logoImage: {
    width: 300,
    height: 300,
    tintColor: '#FFFFFF',
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'DMSans-Regular',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  taglineLine: {
    width: 25,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 10,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    letterSpacing: 0.5,
    fontFamily: 'DMSans-Regular',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    fontWeight: '400',
    fontFamily: 'DMSans-Regular',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyLogo: {
    width: 100,
    height: 100,
    tintColor: '#FFFFFF',
    margin: -20,
  },
 
  brandNameAccent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  copyright: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '400',
    fontFamily: 'DMSans-Regular',
  },
});

export default SplashScreen;