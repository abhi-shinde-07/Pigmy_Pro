import {
    faBackspace,
    faCheck,
    faLock,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

const PinModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  customer, 
  amount,
  isProcessing 
}) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setPin('');
      setPinError('');
    }
  }, [visible]);

  const handlePinPress = (digit) => {
    if (pin.length < 4) {
      setPin(pin + digit);
      setPinError('');
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setPinError('');
  };

  const handleConfirm = async () => {
    if (pin.length !== 4) {
      setPinError('Please enter 4-digit PIN');
      return;
    }

    try {
      const success = await onConfirm(pin);
      if (!success) {
        setPinError('Invalid PIN');
        setPin('');
        // Shake animation for error
        Animated.sequence([
          Animated.timing(shakeAnimation, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        Vibration.vibrate(500); // Error vibration
      }
    } catch (error) {
      setPinError('Something went wrong');
      setPin('');
    }
  };

  const handleClose = () => {
    setPin('');
    setPinError('');
    onClose();
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length ? styles.pinDotFilled : null,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={styles.keypadButton} />;
              }
              
              if (key === 'backspace') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={[styles.keypadButton, styles.backspaceButton]}
                    onPress={handleBackspace}
                    activeOpacity={0.7}
                    disabled={pin.length === 0}
                  >
                    <FontAwesomeIcon 
                      icon={faBackspace} 
                      size={20} 
                      color={pin.length === 0 ? '#9CA3AF' : '#6B7280'} 
                    />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={styles.keypadButton}
                  onPress={() => handlePinPress(key)}
                  activeOpacity={0.7}
                  disabled={pin.length >= 4}
                >
                  <Text style={styles.keypadButtonText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modal,
              {
                transform: [{ translateX: shakeAnimation }],
              }
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <FontAwesomeIcon icon={faTimes} size={18} color="#6B7280" />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <View style={styles.lockIconContainer}>
                  <FontAwesomeIcon icon={faLock} size={32} color="#6739B7" />
                </View>
                <Text style={styles.modalTitle}>Enter PIN</Text>
                <Text style={styles.modalSubtitle}>
                  Verify your PIN to complete the transaction
                </Text>
              </View>
            </View>

            {/* PIN Input */}
            <View style={styles.pinSection}>
              {renderPinDots()}
              
              {pinError ? (
                <Text style={styles.errorText}>{pinError}</Text>
              ) : (
                <Text style={styles.pinHint}>Enter your 4-digit PIN</Text>
              )}
            </View>

            {/* Transaction Summary */}
            <View style={styles.transactionSummary}>
              <Text style={styles.summaryTitle}>Transaction Summary</Text>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Customer:</Text>
                  <Text style={styles.summaryValue}>{customer?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount:</Text>
                  <Text style={styles.summaryAmount}>{formatCurrency(amount || 0)}</Text>
                </View>
              </View>
            </View>

            {/* Keypad */}
            {renderKeypad()}

            {/* Confirm Button */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (pin.length !== 4 || isProcessing) ? styles.disabledButton : null
                ]}
                onPress={handleConfirm}
                disabled={pin.length !== 4 || isProcessing}
                activeOpacity={0.7}
              >
                {isProcessing ? (
                  <Text style={styles.confirmButtonText}>Processing...</Text>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} size={16} color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  overlayTouchable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360, // slightly smaller
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
    paddingVertical: 12, // reduced vertical padding
  },
  modalHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lockIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
    textAlign: 'center',
  },
  pinSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  pinDotFilled: {
    backgroundColor: '#6739B7',
    borderColor: '#6739B7',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'DMSans-Medium',
    textAlign: 'center',
  },
  pinHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'DMSans-Medium',
    textAlign: 'center',
  },
  transactionSummary: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryContent: {
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
  },
  summaryValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
    maxWidth: '60%',
    textAlign: 'right',
  },
  summaryAmount: {
    fontSize: 16,
    color: '#6739B7',
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
  },
  keypad: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  keypadButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backspaceButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  keypadButtonText: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  actionContainer: {
    paddingHorizontal: 16,
  },
  confirmButton: {
    backgroundColor: '#6739B7',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
});


export default PinModal;