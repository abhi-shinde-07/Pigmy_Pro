import {
  faCommentSms,
  faInfoCircle,
  faShareAlt,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Sharing from 'expo-sharing';
import * as SMS from 'expo-sms';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { AuthContext } from '../../../context/AuthContext';

const TransactionDetailPopup = ({ visible, onClose, transaction }) => {
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const [isSMSAvailable, setIsSMSAvailable] = useState(false);

  const popupRef = useRef();

  const authContext = useContext(AuthContext);
  const profileData = authContext?.getUserProfileData?.() || null;
  const user = authContext?.user || null;

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

  useEffect(() => {
    if (visible && transaction) {
      popupScale.setValue(0);
      popupOpacity.setValue(0);

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

  const sendSMSReceipt = async () => {
    if (!isSMSAvailable) {
      Alert.alert('SMS Not Available', 'SMS functionality is not available on this device.');
      return;
    }

    if (!transaction) {
      Alert.alert('Error', 'Transaction data not available.');
      return;
    }

    try {
      let recipientNumber = String(transaction.mobileNumber || '9876543210');
      recipientNumber = recipientNumber.replace(/[\s\-\(\)]/g, '');
      if (!recipientNumber.match(/^\d+$/)) {
        recipientNumber = '9876543210';
      }

      const agentName = safeProfileData.agentInfo.agentname?.toUpperCase() || 'COLLECTION AGENT';
      const patsansthaName = safeProfileData.patsansthaInfo.fullname || 'ORGANIZATION';

      const smsMessage = `${patsansthaName} Rs. ${transaction.collAmt?.toLocaleString(
        'en-IN'
      )}.00 Received to your Acc. ${transaction.accountNo} by ${agentName}. Thank you.`;

      const result = await SMS.sendSMSAsync([recipientNumber], smsMessage);

      if (result.result === 'sent') {
        Alert.alert('Success ✅', 'SMS receipt sent successfully!');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      Alert.alert('SMS Failed', 'Unable to send SMS receipt.');
    }
  };

  const sharePopup = async () => {
    try {
      const uri = await captureRef(popupRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing not available on this device');
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error sharing popup:', error);
      Alert.alert('Share Failed', 'Unable to share the popup.');
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

    const transactionDateOnly = new Date(
      transactionDate.getFullYear(),
      transactionDate.getMonth(),
      transactionDate.getDate()
    );
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDateOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (transactionDateOnly.getTime() === todayDateOnly.getTime()) return 'Today';
    if (transactionDateOnly.getTime() === yesterdayDateOnly.getTime()) return 'Yesterday';
    return transactionDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => (timeString ? timeString : 'Not collected');

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
          {/* Capture only this part */}
          <View ref={popupRef} collapsable={false} style={styles.captureArea}>
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
                <Text style={styles.customerDetails}>Account: {transaction.accountNo}</Text>
                <Text style={styles.customerDetails}>Mobile: {transaction.mobileNumber}</Text>
              </View>
            </View>

            {/* Amount Card */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Amount Collected</Text>
              <Text style={styles.amountValue}>{formatAmount(transaction.collAmt) + '.00'}</Text>
            </View>

            {/* Transaction Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{formatTime(transaction.time)}</Text>
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
          </View>

          {/* Action Buttons (not captured) */}
          <View style={styles.actionContainer}>
            {isSMSAvailable && (
              <TouchableOpacity style={styles.smsButton} onPress={sendSMSReceipt} activeOpacity={0.7}>
                <FontAwesomeIcon icon={faCommentSms} size={16} color="#FFFFFF" />
                <Text style={styles.smsButtonText}>Send SMS</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.shareButton} onPress={sharePopup} activeOpacity={0.7}>
              <FontAwesomeIcon icon={faShareAlt} size={16} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeActionButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeActionButtonText}>Close</Text>
          </TouchableOpacity>

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
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  captureArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  customerInfo: { flex: 1 },
  customerName: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  customerDetails: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#6B7280',
  },
  amountCard: {
    backgroundColor: 'rgba(103, 57, 183, 0.05)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(103, 57, 183, 0.1)',
  },
  amountLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#6B7280',
    marginBottom: 3,
  },
  amountValue: {
    fontSize: 22,
    fontFamily: 'DMSans-Bold',
    color: '#6739B7',
  },
  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  smsButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  smsButtonText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  shareButtonText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  closeActionButton: {
    marginTop: 10,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#6739B7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeActionButtonText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: '#6739B7',
  },
  smsNotAvailable: {
    fontSize: 11,
    fontFamily: 'DMSans-Medium',
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
});


export default TransactionDetailPopup;
