import {
  faCheckCircle,
  faDownload,
  faShare,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Audio } from 'expo-av'; // <-- Import sound library
import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';

const SuccessTransactionPopup = ({
  visible,
  onClose,
  transactionData,
}) => {
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  // Function to play success sound
  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/successed-295058.mp3') // <-- Your sound file
      );
      await sound.playAsync();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  };

  useEffect(() => {
    if (visible && transactionData) {
      Vibration.vibrate([0, 100, 50, 100]);
      playSuccessSound(); // Play sound here

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

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, transactionData]);

  const handleClose = () => {
    successScale.setValue(0);
    successOpacity.setValue(0);
    checkScale.setValue(0);
    onClose();
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
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
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
