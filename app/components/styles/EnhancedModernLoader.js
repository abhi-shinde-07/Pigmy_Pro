import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const EnhancedModernLoader = ({ 
  visible = true, 
  message = 'Loading...', 
  size = 'large',
  overlay = true,
  variant = 'spinner', // 'spinner', 'dots', 'progress', 'skeleton'
  color = '#6739B7'
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  
  // Dots animation values
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Variant-specific animations
      if (variant === 'spinner') {
        startSpinnerAnimation();
      } else if (variant === 'dots') {
        startDotsAnimation();
      } else if (variant === 'progress') {
        startProgressAnimation();
      } else if (variant === 'skeleton') {
        startSkeletonAnimation();
      }
    } else {
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, variant]);

  const startSpinnerAnimation = () => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    scaleAnimation.start();
  };

  const startDotsAnimation = () => {
    const createDotAnimation = (dotValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createDotAnimation(dot1, 0).start();
    createDotAnimation(dot2, 200).start();
    createDotAnimation(dot3, 400).start();
  };

  const startProgressAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(progressValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const startSkeletonAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  if (!visible) {
    return null;
  }

  const containerStyle = overlay 
    ? [styles.overlayContainer, { opacity: fadeValue }]
    : [styles.inlineContainer, { opacity: fadeValue }];

  const loaderSize = size === 'small' ? 40 : size === 'medium' ? 60 : 80;

  const renderSpinnerLoader = () => (
    <View style={styles.spinnerContainer}>
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: loaderSize,
            height: loaderSize,
            borderTopColor: color,
            borderRightColor: color,
            transform: [
              { rotate: spinValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })},
              { scale: scaleValue }
            ],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.middleRing,
          {
            width: loaderSize * 0.75,
            height: loaderSize * 0.75,
            borderBottomColor: color + '80',
            borderLeftColor: color + '80',
            transform: [
              { rotate: spinValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['360deg', '0deg'],
              })}
            ],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.innerRing,
          {
            width: loaderSize * 0.5,
            height: loaderSize * 0.5,
            borderTopColor: color + '40',
            borderRightColor: color + '40',
            transform: [
              { rotate: spinValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })}
            ],
          },
        ]}
      />
      
      <View
        style={[
          styles.centerDot,
          {
            width: loaderSize * 0.15,
            height: loaderSize * 0.15,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );

  const renderDotsLoader = () => (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          styles.dot,
          { 
            backgroundColor: color,
            transform: [{ scale: dot1.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.5],
            })}]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { 
            backgroundColor: color,
            transform: [{ scale: dot2.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.5],
            })}]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { 
            backgroundColor: color,
            transform: [{ scale: dot3.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.5],
            })}]
          }
        ]}
      />
    </View>
  );

  const renderProgressLoader = () => (
    <View style={styles.progressBarContainer}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: color,
            width: progressValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );

  const renderSkeletonLoader = () => (
    <Animated.View 
      style={[
        styles.skeletonContainer,
        { transform: [{ scale: scaleValue }] }
      ]}
    >
      <View style={[styles.skeletonItem, styles.skeletonTitle, { backgroundColor: color + '30' }]} />
      <View style={[styles.skeletonItem, styles.skeletonText, { backgroundColor: color + '20' }]} />
      <View style={[styles.skeletonItem, styles.skeletonText, { backgroundColor: color + '20' }]} />
      <View style={[styles.skeletonItem, styles.skeletonTextShort, { backgroundColor: color + '15' }]} />
    </Animated.View>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDotsLoader();
      case 'progress':
        return renderProgressLoader();
      case 'skeleton':
        return renderSkeletonLoader();
      default:
        return renderSpinnerLoader();
    }
  };

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.loaderContent}>
        {renderLoader()}
        
        {message && variant !== 'skeleton' && (
          <Animated.Text
            style={[
              styles.loadingText,
              { 
                fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
                color: color,
                opacity: fadeValue,
              },
            ]}
          >
            {message}
          </Animated.Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(103, 57, 183, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  inlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 40,
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 28,
    shadowColor: '#6739B7',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(103, 57, 183, 0.1)',
  },
  spinnerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'transparent',
    borderRadius: 1000,
  },
  middleRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 1000,
  },
  innerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 1000,
  },
  centerDot: {
    borderRadius: 1000,
    position: 'absolute',
    shadowColor: '#6739B7',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  progressBarContainer: {
    width: 200,
    height: 6,
    backgroundColor: '#E1BEE7',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  skeletonContainer: {
    width: 200,
    padding: 20,
  },
  skeletonItem: {
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonTitle: {
    height: 20,
    width: '70%',
  },
  skeletonText: {
    height: 16,
    width: '100%',
  },
  skeletonTextShort: {
    height: 16,
    width: '60%',
  },
  loadingText: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
  },
});

export default EnhancedModernLoader;