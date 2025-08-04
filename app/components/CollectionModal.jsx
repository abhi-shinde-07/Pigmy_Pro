import {
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

const CollectionModal = ({ 
  visible, 
  onClose, 
  onNext, 
  customer 
}) => {
  const [collectionAmount, setCollectionAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  const handleNext = () => {
    if (!collectionAmount || parseFloat(collectionAmount) <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }

    if (parseFloat(collectionAmount) > 100000) {
      setAmountError('Amount cannot exceed ₹1,00,000');
      return;
    }

    onNext(parseFloat(collectionAmount));
    setCollectionAmount('');
    setAmountError('');
  };

  const handleClose = () => {
    setCollectionAmount('');
    setAmountError('');
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
                    autoFocus
                  />
                </View>
                
                {/* Amount Preview */}
                {collectionAmount && parseFloat(collectionAmount) > 0 && (
                  <View style={styles.amountPreview}>
                    <Text style={styles.amountPreviewText}>
                      {formatCurrency(parseFloat(collectionAmount))}
                    </Text>
                  </View>
                )}
                
                {amountError ? (
                  <Text style={styles.errorText}>{amountError}</Text>
                ) : null}
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmountContainer}>
                <Text style={styles.quickAmountLabel}>Quick Amount</Text>
                <View style={styles.quickAmountButtons}>
                  {[500, 1000, 2000, 5000].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.quickAmountButton,
                        collectionAmount === amount.toString() ? styles.quickAmountButtonActive : null
                      ]}
                      onPress={() => handleAmountChange(amount.toString())}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.quickAmountButtonText,
                        collectionAmount === amount.toString() ? styles.quickAmountButtonTextActive : null
                      ]}>
                        ₹{amount.toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
  },
  customerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6739B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
    marginBottom: 4,
  },
  customerAccount: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
  },
  modalContent: {
    padding: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#1F2937',
    paddingVertical: 16,
    paddingLeft: 12,
    fontFamily: 'DMSans-Bold',
    textAlign: 'left',
  },
  amountPreview: {
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  amountPreviewText: {
    fontSize: 18,
    color: '#6739B7',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontFamily: 'DMSans-Medium',
  },
  quickAmountContainer: {
    gap: 12,
  },
  quickAmountLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  quickAmountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickAmountButtonActive: {
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    borderColor: '#6739B7',
  },
  quickAmountButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  quickAmountButtonTextActive: {
    color: '#6739B7',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'DMSans-Bold',
  },
  nextButton: {
    backgroundColor: '#6739B7',
  },
  nextButtonText: {
    fontSize: 16,
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