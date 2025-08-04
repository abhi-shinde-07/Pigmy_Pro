import { useEffect, useRef } from 'react';

import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Pigmy Pro Logo Component matching login page design
const PigmyLogo = ({ scale, opacity, rotate }) => (
  <Animated.View
    style={[
      styles.logoWrapper,
      {
        opacity: opacity,
        transform: [
          { scale: scale },
          { rotate: rotate },
        ],
      },
    ]}
  >
    <View style={styles.logoCircle}>
      <View style={styles.logoInnerCircle}>
        <View style={styles.letterContainer}>
          <Text style={styles.logoLetter}>P</Text>
        </View>
        <View style={styles.accentDot} />
      </View>
    </View>
  </Animated.View>
);

// TechyVerve Logo Component
const TechyVerveLogo = ({ opacity }) => (
  <Animated.View
    style={[
      styles.companyLogoContainer,
      {
        opacity: opacity,
      },
    ]}
  >
    <View style={styles.companyLogo}>
      <Text style={styles.companyLogoText}>T</Text>
    </View>
  </Animated.View>
);

const SplashScreen = ({ onAnimationComplete }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textSlideY = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const backgroundFade = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Glowing ring animation
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the animation sequence
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Phase 1: Logo appears with scale and rotation
    Animated.parallel([
      // Logo scale up
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Logo fade in
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Logo subtle rotation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Glowing ring effect
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(glowScale, {
            toValue: 1.2,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // Phase 2: Text slides up after logo animation
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(textSlideY, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Phase 3: Pulse effect and completion
          setTimeout(() => {
            startPulseEffect();
            // Complete animation after pulse
            setTimeout(() => {
              completeAnimation();
            }, 1000);
          }, 500);
        });
      }, 300);
    });
  };

  const startPulseEffect = () => {
    // Create a subtle pulse effect
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const completeAnimation = () => {
    // Fade out the splash screen
    Animated.timing(backgroundFade, {
      toValue: 0,
      duration: 500,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      onAnimationComplete && onAnimationComplete();
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '3deg'],
  });

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
      
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Floating background elements */}
      <View style={styles.floatingElements}>
        <View style={[styles.floatingElement, styles.element1]} />
        <View style={[styles.floatingElement, styles.element2]} />
        <View style={[styles.floatingElement, styles.element3]} />
      </View>

      {/* Main content container */}
      <View style={styles.content}>
        {/* Logo container with glow effect */}
        <View style={styles.logoContainer}>
          {/* Glowing ring behind logo */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
          
          {/* Main Pigmy Pro logo */}
          <PigmyLogo 
            scale={Animated.multiply(logoScale, pulseAnim)}
            opacity={logoOpacity}
            rotate={rotateInterpolate}
          />
        </View>

        {/* App name and tagline */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textSlideY }],
            },
          ]}
        >
          <View style={styles.brandContainer}>
            <Text style={styles.appName}>Pigmy Pro</Text>
            <Text style={styles.appSubtitle}>Agent Management</Text>
          </View>
          
          <View style={styles.taglineContainer}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>Secure & Simple</Text>
            <View style={styles.taglineLine} />
          </View>
        </Animated.View>

        {/* Loading indicator */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: textOpacity,
            },
          ]}
        >
        </Animated.View>
      </View>

      {/* Bottom branding */}
      <Animated.View
        style={[
          styles.bottomBranding,
          {
            opacity: textOpacity,
          },
        ]}
      >
        <Text style={styles.poweredBy}>Powered by</Text>
        <View style={styles.brandNameContainer}>
          <TechyVerveLogo opacity={textOpacity} />
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName}>Techy</Text>
            <Text style={styles.brandNameAccent}>Verve</Text>
          </View>
        </View>
        <Text style={styles.brandTagline}>Innovative Solutions</Text>
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
    opacity: 0.1,
  },
  element1: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    top: '20%',
    right: '10%',
  },
  element2: {
    width: 80,
    height: 80,
    backgroundColor: '#9333EA',
    top: '70%',
    left: '15%',
  },
  element3: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    bottom: '30%',
    right: '20%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    top: -30,
    left: -30,
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
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#6739B7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  letterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
    lineHeight: 28,
  },
  accentDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    top: 8,
    right: 8,
    opacity: 0.9,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
    fontFamily: 'DMSans-Bold',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 42,
    fontFamily: 'DMSans-Bold',
  },
  appSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 4,
    fontFamily: 'DMSans-Bold',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 12,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.5,
    fontFamily: 'DMSans-Bold',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    opacity: 0.8,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    fontFamily: 'DMSans-Bold',
  },
  bottomBranding: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    fontWeight: '500',
    fontFamily: 'DMSans-Regular',
  },
  brandNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyLogoContainer: {
    marginRight: 8,
  },
  companyLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6739B7',
    fontFamily: 'DMSans-Bold',
  },
  brandTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: 'DMSans-Bold',
  },
  brandNameAccent: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
    fontFamily: 'DMSans-Bold',
  },
  brandTagline: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
    marginTop: 2,
   fontFamily: 'DMSans-Bold',
  },
});

export default SplashScreen;