import {
  faCheckCircle,
  faCommentSms,
  faDownload,
  faShare,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Audio } from 'expo-av';
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
  Vibration,
  View,
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';

const SuccessTransactionPopup = ({
  visible,
  onClose,
  transactionData,
}) => {
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const [isSMSAvailable, setIsSMSAvailable] = useState(false);
  const hasSentSMS = useRef(false);

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

  // Function to play success sound
  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../../assets/successed-295058.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  };

  // Enhanced SMS function with AuthContext data
  const sendSMSReceipt = async (autoSend = false) => {
    if (!isSMSAvailable) {
      Alert.alert('SMS Not Available', 'SMS functionality is not available on this device.');
      return;
    }

    if (!transactionData) {
      Alert.alert('Error', 'Transaction data not available.');
      return;
    }

    try {
      // Clean and format phone number properly
      let recipientNumber = String(transactionData.customerPhone || '9876543210');
      
      // Remove any spaces, dashes, or special characters
      recipientNumber = recipientNumber.replace(/[\s\-\(\)]/g, '');
      
      // Ensure it's a valid number format
      if (!recipientNumber.match(/^\d+$/)) {
        recipientNumber = '9876543210'; // fallback
      }

      // Get agent and patsanstha names from AuthContext
      const agentName = safeProfileData.agentInfo.agentname?.toUpperCase() || 'COLLECTION AGENT';
      const patsansthaName = safeProfileData.patsansthaInfo.fullname || 'ORGANIZATION';
      const currentBalance = transactionData.totalCollction + transactionData.amount + transactionData.previousBalance;
      // Create comprehensive SMS message with AuthContext data
      console.log("trasactiondata",transactionData)
      console.log("currentBalance", currentBalance)
     const smsMessage = `${patsansthaName} Rs. ${transactionData.amount?.toLocaleString('en-IN')}.00 Received to your Acc. ${transactionData.accountNo} by ${agentName}. Available Bal. Rs. ${currentBalance}.00  Thank you.`;


    
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
        if (!autoSend) {
          Alert.alert('Success', 'SMS receipt sent successfully!');
        }
      } else if (result.result === 'cancelled') {
        console.log('SMS sending was cancelled by user');
        if (!autoSend) {
          Alert.alert('Cancelled', 'SMS sending was cancelled.');
        }
      } else if (result.result === 'unknown') {
        console.log('SMS result unknown - might have been sent');
        if (!autoSend) {
          Alert.alert('Info', 'SMS may have been sent. Please check your messages.');
        }
      }

      return result;

    } catch (error) {
      console.error('Error sending SMS:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to send SMS receipt.';
      
      if (error.message?.includes('not available')) {
        errorMessage = 'SMS service is not available on this device.';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'SMS permission is required to send messages.';
      } else if (Platform.OS === 'ios' && error.message?.includes('MFMessageComposeViewController')) {
        errorMessage = 'SMS app is not available. Please check your device settings.';
      }

      if (!autoSend) {
        Alert.alert('Error', errorMessage + ' Please try again.');
      }
      
      return { result: 'error', error };
    }
  };

  // Auto-send SMS when popup appears
  useEffect(() => {
    if (visible && transactionData && !hasSentSMS.current && isSMSAvailable) {
      // Add small delay to ensure popup is fully rendered
      const smsTimer = setTimeout(async () => {
        hasSentSMS.current = true;
        
        try {
          await sendSMSReceipt(true); // true = autoSend mode
        } catch (error) {
          console.error('Auto SMS failed:', error);
          // Don't show error alert for auto-send, just log it
        }
      }, 1500); // 1.5 second delay after popup appears

      return () => clearTimeout(smsTimer);
    }
  }, [visible, transactionData, isSMSAvailable]);

  useEffect(() => {
    if (visible && transactionData) {
      Vibration.vibrate([0, 100, 50, 100]);
      playSuccessSound();

      // Reset animations
      successScale.setValue(0);
      successOpacity.setValue(0);
      checkScale.setValue(0);

      // Animate popup
      Animated.sequence([
        Animated.parallel([
          Animated.spring(successScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 6,
          }),
          Animated.timing(successOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.spring(checkScale, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 150,
            friction: 5,
          }),
          Animated.spring(checkScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 5,
          }),
        ]),
      ]).start();

      // Auto close after 8 seconds (increased to give time for SMS)
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [visible, transactionData]);

  const handleClose = () => {
    successScale.setValue(0);
    successOpacity.setValue(0);
    checkScale.setValue(0);
    hasSentSMS.current = false;
    onClose();
  };

  // Manual SMS retry function
  const handleManualSMS = async () => {
    await sendSMSReceipt(false); // false = manual mode with alerts
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN')}`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  if (!visible || !transactionData) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popupContainer,
            {
              transform: [{ scale: successScale }],
              opacity: successOpacity,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <FontAwesomeIcon icon={faTimes} size={16} color="#6B7280" />
          </TouchableOpacity>

          {/* Success Icon */}
          <Animated.View
            style={[
              styles.successIconContainer,
              {
                transform: [{ scale: checkScale }],
                opacity: checkScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            <FontAwesomeIcon icon={faCheckCircle} size={60} color="#6739B7" />
          </Animated.View>

          {/* Title */}
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your collection has been recorded successfully
            {isSMSAvailable && '\nSMS receipt will be sent automatically'}
          </Text>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount Collected</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(transactionData.amount)}
            </Text>
          </View>

          {/* Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailValue}>
                {transactionData.customerName}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>
                {transactionData.transactionId}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(transactionData.date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {formatTime(transactionData.date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Agent</Text>
              <Text style={styles.detailValue}>
                {safeProfileData.agentInfo.agentname?.toUpperCase() || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <FontAwesomeIcon icon={faDownload} size={14} color="#6739B7" />
              <Text style={styles.secondaryButtonText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <FontAwesomeIcon icon={faShare} size={14} color="#6739B7" />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>

            {/* Manual SMS Button */}
            {isSMSAvailable && (
              <TouchableOpacity
                style={[styles.actionButton, styles.smsButton]}
                onPress={handleManualSMS}
                activeOpacity={0.7}
              >
                <FontAwesomeIcon icon={faCommentSms} size={14} color="#FFFFFF" />
                <Text style={styles.smsButtonText}>Send SMS</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Done Button */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    borderRadius: 40,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
  },
  successSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'DMSans-Medium',
    lineHeight: 16,
  },
  amountCard: {
    backgroundColor: 'rgba(103, 57, 183, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
  },
  amountValue: {
    fontSize: 24,
    color: '#6739B7',
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
  },
  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
  },
  detailValue: {
    fontSize: 12,
    color: '#1F2937',
    fontFamily: 'DMSans-Bold',
    maxWidth: '55%',
    textAlign: 'right',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(103, 57, 183, 0.2)',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6739B7',
    fontFamily: 'DMSans-Bold',
  },
  smsButton: {
    backgroundColor: '#22C55E',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  smsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
  },
  doneButton: {
    backgroundColor: '#6739B7',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
});

export default SuccessTransactionPopup;