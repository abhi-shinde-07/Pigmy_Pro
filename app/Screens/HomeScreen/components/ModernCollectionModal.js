import {
  faCheckCircle,
  faExclamationTriangle,
  faRupeeSign,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const ModernCollectionModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  amount, 
  customers,
  type = 'confirm' // 'confirm', 'success', 'error', 'no-collections', 'already-submitted'
}) => {
  const [scaleValue] = React.useState(new Animated.Value(0));
  const [fadeValue] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const getModalConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: faCheckCircle,
          iconColor: '#22C55E',
          iconBg: '#DCFCE7',
          title: 'Collection Submitted!',
          message: 'Your collection has been submitted successfully.',
          primaryButton: 'Great!',
          primaryColor: '#22C55E',
          showSecondary: false
        };
      case 'error':
        return {
          icon: faExclamationTriangle,
          iconColor: '#EF4444',
          iconBg: '#FEE2E2',
          title: 'Submission Failed',
          message: 'There was an error submitting your collection. Please try again.',
          primaryButton: 'Retry',
          primaryColor: '#EF4444',
          showSecondary: true,
          secondaryButton: 'Cancel'
        };
      case 'no-collections':
        return {
          icon: faExclamationTriangle,
          iconColor: '#F59E0B',
          iconBg: '#FEF3C7',
          title: 'No Collections Found',
          message: 'You haven\'t collected any payments today. Please collect at least one payment before submitting.',
          primaryButton: 'Got it',
          primaryColor: '#F59E0B',
          showSecondary: true,
          secondaryButton: 'Cancel'
        };
      case 'already-submitted':
        return {
          icon: faCheckCircle,
          iconColor: '#3B82F6',
          iconBg: '#DBEAFE',
          title: 'Already Submitted',
          message: 'Today\'s collection has already been submitted. You can only submit once per day.',
          primaryButton: 'Understood',
          primaryColor: '#3B82F6',
          showSecondary: true,
          secondaryButton: 'Cancel'
        };
      default:
        return {
          icon: faCheckCircle,
          iconColor: '#6739B7',
          iconBg: '#F3E8FF',
          title: 'Submit Collection',
          message: 'Are you sure you want to submit collection data?',
          primaryButton: 'Submit',
          primaryColor: '#6739B7',
          showSecondary: true,
          secondaryButton: 'Cancel'
        };
    }
  };

  const config = getModalConfig();
  const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}} // Prevent back button from closing modal
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeValue }
        ]}
      >
        {/* Remove the backdrop touchable to prevent closing on outside tap */}
        <View style={styles.backdrop} />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.message}>{config.message}</Text>

            {/* Collection Details (only for confirm type) */}
            {type === 'confirm' && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <FontAwesomeIcon icon={faRupeeSign} size={14} color="#6739B7" />
                  </View>
                  <Text style={styles.detailLabel}>Amount:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(amount)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <FontAwesomeIcon icon={faUsers} size={14} color="#6739B7" />
                  </View>
                  <Text style={styles.detailLabel}>Customers:</Text>
                  <Text style={styles.detailValue}>{customers || 0}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {config.showSecondary && (
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>
                  {config.secondaryButton}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.primaryButton,
                { backgroundColor: config.primaryColor },
                !config.showSecondary && styles.fullWidthButton
              ]} 
              onPress={() => {
                if (type === 'confirm') {
                  onConfirm();
                } else if (type === 'error') {
                  // For error type, primary button should retry
                  onConfirm();
                } else {
                  onClose();
                }
              }}
            >
              <Text style={styles.primaryButtonText}>
                {config.primaryButton}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 320, // Reduced from 400
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  content: {
    paddingHorizontal: 20, // Reduced from 24
    paddingTop: 20, // Reduced from 24
    paddingBottom: 16, // Reduced from 24
  },
  title: {
    fontSize: 20, // Reduced from 24
    fontFamily: 'DMSans-Bold',
    color: '#1E293B',
    marginBottom: 6, // Reduced from 8
    textAlign: 'center',
  },
  message: {
    fontSize: 14, // Reduced from 16
    fontFamily: 'DMSans-Medium',
    color: '#64748B',
    lineHeight: 20, // Reduced from 24
    textAlign: 'center',
    marginBottom: 12, // Reduced from 16
  },
  detailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12, // Reduced from 16
    padding: 12, // Reduced from 16
    marginTop: 6, // Reduced from 8
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Reduced from 12
  },
  detailIcon: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: 14, // Reduced from 16
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Reduced from 12
  },
  detailLabel: {
    fontSize: 14, // Reduced from 16
    fontFamily: 'DMSans-Bold',
    color: '#64748B',
    flex: 1,
  },
  detailValue: {
    fontSize: 14, // Reduced from 16
    fontFamily: 'DMSans-Bold',
    color: '#1E293B',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20, // Reduced from 24
    paddingBottom: 20, // Reduced from 24
    gap: 10, // Reduced from 12
  },
  button: {
    flex: 1,
    paddingVertical: 12, // Reduced from 16
    borderRadius: 12, // Reduced from 16
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#6739B7',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14, // Reduced from 16
    fontFamily: 'DMSans-Bold',
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 14, // Reduced from 16
    fontFamily: 'DMSans-Bold',
  },
});

export default ModernCollectionModal;