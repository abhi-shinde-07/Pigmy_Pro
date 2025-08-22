import {
    faCommentSms,
    faInfoCircle,
    faTimes,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as SMS from 'expo-sms';
import { useContext, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';

const TransactionDetailPopup = ({
  visible,
  onClose,
  transaction,
}) => {
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const [isSMSAvailable, setIsSMSAvailable] = useState(false);

  // Get auth context for agent and patsanstha data
  const authContext = useContext(AuthContext);
  
  // Get profile data from authentication context
  const profileData = authContext?.getUserProfileData?.() || null;
  const user = authContext?.user || null;

  // Safe profile data with fallbacks
  const safeProfileData = profileData || {
    agentInfo: {
      agentname: user?.agentname,
      agentno: user?.agentno,
      mobileNumber: user?.mobileNumber,
    },
    patsansthaInfo: {
      fullname: user?.patsansthaName,
      patsansthaId: user?.patsansthaId,
    },
  };

  // Check SMS availability on component mount
  useEffect(() => {
    const checkSMSAvailability = async () => {
      try {
        const available = await SMS.isAvailableAsync();
        setIsSMSAvailable(available);
      } catch (error) {
        console.warn('Error checking SMS availability:', error);
        setIsSMSAvailable(false);
      }
    };
    
    checkSMSAvailability();
  }, []);

  // Animation effects
  useEffect(() => {
    if (visible && transaction) {
      // Reset animations
      popupScale.setValue(0);
      popupOpacity.setValue(0);

      // Animate popup
      Animated.parallel([
        Animated.spring(popupScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 6,
        }),
        Animated.timing(popupOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, transaction]);

  // SMS function with AuthContext data and better feedback
  const sendSMSReceipt = async () => {
    if (!isSMSAvailable) {
      Alert.alert(
        'SMS Not Available', 
        'SMS functionality is not available on this device.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (!transaction) {
      Alert.alert(
        'Error', 
        'Transaction data not available.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      // Clean and format phone number properly
      let recipientNumber = String(transaction.mobileNumber || '9876543210');
      
      // Remove any spaces, dashes, or special characters
      recipientNumber = recipientNumber.replace(/[\s\-\(\)]/g, '');
      
      // Ensure it's a valid number format
      if (!recipientNumber.match(/^\d+$/)) {
        recipientNumber = '9876543210'; // fallback
      }

      // Get agent and patsanstha names from AuthContext
      const agentName = safeProfileData.agentInfo.agentname?.toUpperCase() || 'COLLECTION AGENT';
      const patsansthaName = safeProfileData.patsansthaInfo.fullname || 'ORGANIZATION';
      
      // Create comprehensive SMS message with transaction data
      const smsMessage = `${patsansthaName} Rs. ${transaction.collAmt?.toLocaleString('en-IN')}.00 Received to your Acc. ${transaction.accountNo} by ${agentName}. Thank you.`;

      // Use proper SMS options for better compatibility
      const smsOptions = {
        attachments: undefined, // Ensure no attachments
      };

      const result = await SMS.sendSMSAsync(
        [recipientNumber], 
        smsMessage,
        smsOptions
      );

      // Handle different result scenarios
      if (result.result === 'sent') {
        Alert.alert(
          'Success ✅', 
          'SMS receipt sent successfully!',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (result.result === 'cancelled') {
        // Don't show alert for user cancellation, it's intentional
      } else if (result.result === 'unknown')

      return result;

    } catch (error) {
      console.error('Error sending SMS:', error);
      
      // More specific error handling
      let errorTitle = 'SMS Failed';
      let errorMessage = 'Unable to send SMS receipt.';
      
      if (error.message?.includes('not available')) {
        errorTitle = 'SMS Not Available';
        errorMessage = 'SMS service is not available on this device.';
      } else if (error.message?.includes('permission')) {
        errorTitle = 'Permission Required';
        errorMessage = 'Please allow SMS permissions in your device settings.';
      } else if (Platform.OS === 'ios' && error.message?.includes('MFMessageComposeViewController')) {
        errorTitle = 'SMS App Required';
        errorMessage = 'Messages app is required to send SMS.';
      }

      Alert.alert(
        errorTitle, 
        errorMessage,
        [
          { text: 'OK', style: 'default' }
        ]
      );
      
      return { result: 'error', error };
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(popupScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const formatAmount = (amount) => `₹${amount?.toLocaleString('en-IN')}`;
  
  const formatDate = (dateString) => {
    const transactionDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Normalize dates to compare only the date part (ignore time)
    const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (transactionDateOnly.getTime() === todayDateOnly.getTime()) {
      return "Today";
    } else if (transactionDateOnly.getTime() === yesterdayDateOnly.getTime()) {
      return "Yesterday";
    } else {
      return transactionDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not collected";
    return timeString;
  };

  if (!visible || !transaction) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popupContainer,
            {
              transform: [{ scale: popupScale }],
              opacity: popupOpacity,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <FontAwesomeIcon icon={faInfoCircle} size={20} color="#6739B7" />
              </View>
              <Text style={styles.headerTitle}>Transaction Details</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <FontAwesomeIcon icon={faTimes} size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Customer Info */}
          <View style={styles.customerSection}>
            <View style={styles.customerIconContainer}>
              <FontAwesomeIcon icon={faUser} size={24} color="#6739B7" />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{transaction.name}</Text>
              <Text style={styles.customerDetails}>
                Account: {transaction.accountNo}
              </Text>
              <Text style={styles.customerDetails}>
                Mobile: {transaction.mobileNumber}
              </Text>
            </View>
          </View>

          {/* Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount Collected</Text>
            <Text style={styles.amountValue}>
              {formatAmount(transaction.collAmt)+".00"}
            </Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(transaction.date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {formatTime(transaction.time)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Agent</Text>
              <Text style={styles.detailValue}>
                {safeProfileData.agentInfo.agentname?.toUpperCase() || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Organization</Text>
              <Text style={styles.detailValue}>
                {safeProfileData.patsansthaInfo.fullname || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {/* SMS Button */}
            {isSMSAvailable && (
              <TouchableOpacity
                style={styles.smsButton}
                onPress={sendSMSReceipt}
                activeOpacity={0.7}
              >
                <FontAwesomeIcon icon={faCommentSms} size={16} color="#FFFFFF" />
                <Text style={styles.smsButtonText}>Send SMS Receipt</Text>
              </TouchableOpacity>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeActionButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeActionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          {!isSMSAvailable && (
            <Text style={styles.smsNotAvailable}>
              SMS functionality is not available on this device
            </Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'DMSans-Bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'DMSans-Bold',
    marginBottom: 4,
  },
  customerDetails: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
    marginBottom: 2,
  },
  amountCard: {
    backgroundColor: 'rgba(103, 57, 183, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(103, 57, 183, 0.1)',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    color: '#6739B7',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'DMSans-Bold',
    flex: 1,
    textAlign: 'right',
  },
  actionContainer: {
    gap: 12,
  },
  smsButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  smsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
  },
  closeActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6739B7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeActionButtonText: {
    fontSize: 14,
    color: '#6739B7',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  smsNotAvailable: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'DMSans-Medium',
  },
});

export default TransactionDetailPopup;