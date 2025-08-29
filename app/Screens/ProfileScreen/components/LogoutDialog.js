import {
  faExclamationTriangle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { dialogStyles } from '../styles/DialogStyles';

const LogoutDialog = ({ 
  visible, 
  onClose, 
  onConfirm, 
  dialogAnimation, 
  overlayAnimation 
}) => {
  // If animations aren't passed, create local ones
  const localDialogAnimation = useRef(new Animated.Value(0)).current;
  const localOverlayAnimation = useRef(new Animated.Value(0)).current;
  
  const dialogAnim = dialogAnimation || localDialogAnimation;
  const overlayAnim = overlayAnimation || localOverlayAnimation;

  const hideDialog = () => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(dialogAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleConfirm = () => {
    hideDialog();
    setTimeout(() => {
      onConfirm();
    }, 300);
  };

  // Animate in when dialog shows
  useEffect(() => {
    if (visible) {
      // Reset values
      dialogAnim.setValue(0);
      overlayAnim.setValue(0);
      
      // Animate in
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(dialogAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, dialogAnim, overlayAnim]);

  // Don't render Modal if not showing
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hideDialog}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          dialogStyles.dialogOverlay,
          {
            opacity: overlayAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={dialogStyles.overlayTouchable}
          activeOpacity={1}
          onPress={hideDialog}
        />
        <Animated.View
          style={[
            dialogStyles.dialogContainer,
            {
              transform: [
                {
                  scale: dialogAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                    extrapolate: 'clamp',
                  }),
                },
                {
                  translateY: dialogAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
              opacity: dialogAnim,
            },
          ]}
        >
          <View style={dialogStyles.dialog}>
            {/* Dialog Header */}
            <View style={dialogStyles.dialogHeader}>
              <TouchableOpacity 
                style={dialogStyles.closeButton}
                onPress={hideDialog}
                activeOpacity={0.7}
              >
                <FontAwesomeIcon icon={faTimes} size={18} color="#6B7280" />
              </TouchableOpacity>
              <View style={dialogStyles.dialogIconContainer}>
                <FontAwesomeIcon icon={faExclamationTriangle} size={24} color="#EF4444" />
              </View>
              <Text style={dialogStyles.dialogTitle}>Log Out</Text>
              <Text style={dialogStyles.dialogSubtitle}>Are you sure you want to log out ?</Text>
            </View>

            {/* Dialog Actions */}
            <View style={dialogStyles.dialogActions}>
              <TouchableOpacity
                style={[dialogStyles.dialogButton, dialogStyles.cancelButton]}
                onPress={hideDialog}
                activeOpacity={0.8}
              >
                <Text style={dialogStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[dialogStyles.dialogButton, dialogStyles.confirmButton]}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={dialogStyles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default LogoutDialog;