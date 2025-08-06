import {
  faBackspace,
  faRupeeSign,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PinModal from '../../../components/PinModal';

const CollectionModal = ({ 
  visible, 
  onClose, 
  onNext, 
  customer 
}) => {
  const [collectionAmount, setCollectionAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => {
    if (!collectionAmount || parseFloat(collectionAmount) <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }

    if (parseFloat(collectionAmount) > 100000) {
      setAmountError('Amount cannot exceed ₹1,00,000');
      return;
    }

    // Show PIN modal instead of directly calling onNext
    setShowPinModal(true);
  };

  const handlePinConfirm = async (pin) => {
    setIsProcessing(true);
    
    try {
      // Call the parent's onNext function with amount and password (pin)
      const success = await onNext(parseFloat(collectionAmount), pin);
      
      if (success !== false) {
        // Success - close all modals and reset form
        setShowPinModal(false);
        setCollectionAmount('');
        setAmountError('');
        return true;
      } else {
        // PIN was incorrect or other error
        return false;
      }
    } catch (error) {
      console.error('Pin confirmation error:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePinModalClose = () => {
    setShowPinModal(false);
    setIsProcessing(false);
  };

  const handleClose = () => {
    setCollectionAmount('');
    setAmountError('');
    setShowPinModal(false);
    setIsProcessing(false);
    onClose();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleAmountChange = (text) => {
    // Remove any non-numeric characters except decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setCollectionAmount(numericText);
    setAmountError('');
  };

  const handleNumberPress = (number) => {
    const newAmount = collectionAmount + number;
    handleAmountChange(newAmount);
  };

  const handleDecimalPress = () => {
    if (!collectionAmount.includes('.')) {
      const newAmount = collectionAmount ? collectionAmount + '.' : '0.';
      setCollectionAmount(newAmount);
      setAmountError('');
    }
  };

  const handleBackspace = () => {
    if (collectionAmount.length > 0) {
      const newAmount = collectionAmount.slice(0, -1);
      setCollectionAmount(newAmount);
      setAmountError('');
    }
  };

  const renderNumpadButton = (value, onPress, style = {}) => (
    <TouchableOpacity
      style={[styles.numpadButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {value === 'backspace' ? (
        <FontAwesomeIcon icon={faBackspace} size={20} color="#6B7280" />
      ) : (
        <Text style={styles.numpadButtonText}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <>
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
            <View style={styles.modal}>
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
                  <View style={styles.customerAvatar}>
                    <FontAwesomeIcon icon={faUser} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.modalTitle}>Add Collection</Text>
                  {customer && (
                    <>
                      <Text style={styles.customerName}>{customer.name}</Text>
                      <Text style={styles.customerAccount}>{customer.accountNumber}</Text>
                    </>
                  )}
                </View>
              </View>

              {/* Modal Content */}
              <View style={styles.modalContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Collection Amount</Text>
                  <View style={[
                    styles.amountInputContainer,
                    amountError ? styles.inputError : null
                  ]}>
                    <FontAwesomeIcon icon={faRupeeSign} size={18} color="#6B7280" />
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      value={collectionAmount}
                      onChangeText={handleAmountChange}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      onSubmitEditing={handleNext}
                      showSoftInputOnFocus={false} // Disable system keyboard
                    />
                  </View>

                  
                  {amountError ? (
                    <Text style={styles.errorText}>{amountError}</Text>
                  ) : null}
                </View>

                {/* Custom Numpad */}
                <View style={styles.numpadContainer}>
                  <View style={styles.numpadRow}>
                    {renderNumpadButton('1', () => handleNumberPress('1'))}
                    {renderNumpadButton('2', () => handleNumberPress('2'))}
                    {renderNumpadButton('3', () => handleNumberPress('3'))}
                  </View>
                  <View style={styles.numpadRow}>
                    {renderNumpadButton('4', () => handleNumberPress('4'))}
                    {renderNumpadButton('5', () => handleNumberPress('5'))}
                    {renderNumpadButton('6', () => handleNumberPress('6'))}
                  </View>
                  <View style={styles.numpadRow}>
                    {renderNumpadButton('7', () => handleNumberPress('7'))}
                    {renderNumpadButton('8', () => handleNumberPress('8'))}
                    {renderNumpadButton('9', () => handleNumberPress('9'))}
                  </View>
                  <View style={styles.numpadRow}>
                    {renderNumpadButton('.', handleDecimalPress)}
                    {renderNumpadButton('0', () => handleNumberPress('0'))}
                    {renderNumpadButton('backspace', handleBackspace, styles.backspaceButton)}
                  </View>
                </View>
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.modalButton, 
                    styles.nextButton,
                    (!collectionAmount || parseFloat(collectionAmount) <= 0) ? styles.disabledButton : null
                  ]}
                  onPress={handleNext}
                  disabled={!collectionAmount || parseFloat(collectionAmount) <= 0}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.nextButtonText,
                    (!collectionAmount || parseFloat(collectionAmount) <= 0) ? styles.disabledButtonText : null
                  ]}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* PIN Modal */}
      <PinModal
        visible={showPinModal}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirm}
        customer={customer}
        amount={parseFloat(collectionAmount) || 0}
        isProcessing={isProcessing}
      />
    </>
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
  customerAvatar: {
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
    fontFamily: 'DMSans-Bold',
    marginBottom: 6,
  },
  customerName: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
    marginBottom: 2,
  },
  customerAccount: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
  },
  modalContent: {
    padding: 18,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
    marginBottom: 6,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#1F2937',
    paddingVertical: 12,
    paddingLeft: 10,
    fontFamily: 'DMSans-Bold',
    textAlign: 'left',
  },

  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontFamily: 'DMSans-Medium',
  },
  // Numpad Styles
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
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'DMSans-Bold',
  },
  nextButton: {
    backgroundColor: '#6739B7',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});

export default CollectionModal;