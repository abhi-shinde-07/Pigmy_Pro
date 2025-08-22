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

  const renderNumpadButton = (value, onPress, style = {}) => (
    <TouchableOpacity
      style={[styles.numpadButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={value === 'backspace' && pin.length === 0}
    >
      {value === 'backspace' ? (
        <FontAwesomeIcon 
          icon={faBackspace} 
          size={18} 
          color={pin.length === 0 ? '#9CA3AF' : '#6B7280'} 
        />
      ) : (
        <Text style={styles.numpadButtonText}>{value}</Text>
      )}
    </TouchableOpacity>
  );

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
                  <FontAwesomeIcon icon={faLock} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.modalTitle}>Enter PIN</Text>
                <Text style={styles.modalSubtitle}>
                  Verify your PIN to complete the transaction
                </Text>
              </View>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
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

              {/* Custom Numpad */}
              <View style={styles.numpadContainer}>
                <View style={styles.numpadRow}>
                  {renderNumpadButton('1', () => handlePinPress('1'))}
                  {renderNumpadButton('2', () => handlePinPress('2'))}
                  {renderNumpadButton('3', () => handlePinPress('3'))}
                </View>
                <View style={styles.numpadRow}>
                  {renderNumpadButton('4', () => handlePinPress('4'))}
                  {renderNumpadButton('5', () => handlePinPress('5'))}
                  {renderNumpadButton('6', () => handlePinPress('6'))}
                </View>
                <View style={styles.numpadRow}>
                  {renderNumpadButton('7', () => handlePinPress('7'))}
                  {renderNumpadButton('8', () => handlePinPress('8'))}
                  {renderNumpadButton('9', () => handlePinPress('9'))}
                </View>
                <View style={styles.numpadRow}>
                  <View style={styles.numpadButton} />
                  {renderNumpadButton('0', () => handlePinPress('0'))}
                  {renderNumpadButton('backspace', handleBackspace, styles.backspaceButton)}
                </View>
              </View>
            </View>

            {/* Confirm Button */}
            <View style={styles.modalActions}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayTouchable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6739B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
    textAlign: 'center',
  },
  modalContent: {
    padding: 18,
    gap: 16,
  },
  pinSection: {
    alignItems: 'center',
    gap: 8,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: 12,
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
    fontSize: 14,
    color: '#6739B7',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  // Numpad Styles (matching CollectionModal)
  numpadContainer: {
    gap: 6,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 6,
  },
  numpadButton: {
    flex: 1,
    aspectRatio: 1.8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  numpadButtonText: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  backspaceButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  modalActions: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  confirmButton: {
    backgroundColor: '#6739B7',
    paddingVertical: 14,
    borderRadius: 10,
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