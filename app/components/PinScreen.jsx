import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const PinScreen = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(1));
  const { verifyPin } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      shakeError();
      return;
    }

    setIsLoading(true);
    const success = await verifyPin(pin);
    
    if (!success) {
      setIsLoading(false);
      shakeError();
      Vibration.vibrate(400);
      Alert.alert('Incorrect PIN', 'Please try again.');
      setPin('');
    }
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              pin.length > index && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ['', 0, '⌫']
    ];

    const handleNumberPress = (num) => {
      if (num === '⌫') {
        setPin(prev => prev.slice(0, -1));
      } else if (num !== '' && pin.length < 4) {
        setPin(prev => prev + num.toString());
      }
    };

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((num, numIndex) => (
              <TouchableOpacity
                key={numIndex}
                style={[
                  styles.numberButton,
                  num === '' && styles.numberButtonEmpty,
                ]}
                onPress={() => handleNumberPress(num)}
                disabled={num === ''}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.numberButtonText,
                  num === '⌫' && styles.deleteButtonText
                ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  useEffect(() => {
    if (pin.length === 4) {
      setTimeout(() => handleSubmit(), 300);
    }
  }, [pin]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6739B7" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.lockIcon}>
          <Text style={styles.lockEmoji}>🔒</Text>
        </View>
        <Text style={styles.headerTitle}>Enter PIN</Text>
        <Text style={styles.headerSubtitle}>
          Please enter your 4-digit PIN to continue
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* PIN Input Display */}
        <Animated.View 
          style={[
            styles.pinInputContainer,
            { transform: [{ translateX: shakeAnimation }] }
          ]}
        >
          {renderPinDots()}
        </Animated.View>

        {/* Number Pad */}
        {renderNumberPad()}

     
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Verifying...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#6739B7',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockEmoji: {
    fontSize: 36,
  },
  headerTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'DMSans-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  pinInputContainer: {
    marginBottom: 60,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#6739B7',
    borderColor: '#6739B7',
  },
  numberPad: {
    marginBottom: 40,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  numberButtonEmpty: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  numberButtonText: {
    fontSize: 24,
    color: '#374151',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#EF4444',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 18,
    color: '#6739B7',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
});

export default PinScreen;