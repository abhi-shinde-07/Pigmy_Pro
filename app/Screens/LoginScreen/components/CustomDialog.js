import {
    faBolt,
    faCheckCircle,
    faExclamationTriangle,
    faInfoCircle,
    faShield,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { dialogStyles as styles } from '../styles/LoginScreenStyles';

const CustomDialog = ({ visible, onClose, title, message, buttons, type = 'default' }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getDialogIcon = () => {
    switch (type) {
      case 'error': return faExclamationTriangle;
      case 'success': return faCheckCircle;
      case 'info': return faInfoCircle;
      case 'warning': return faBolt;
      default: return faShield;
    }
  };

  const getDialogColor = () => {
    switch (type) {
      case 'error': return '#EF4444';
      case 'success': return '#10B981';
      case 'info': return '#6739B7';
      case 'warning': return '#F59E0B';
      default: return '#6739B7';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.dialogOverlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.dialogContainer,
                {
                  transform: [
                    { scale: scaleAnim },
                    { 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      })
                    }
                  ]
                }
              ]}
            >
              <View style={[styles.dialogHeader, { borderBottomColor: getDialogColor() }]}>
                <View style={[styles.dialogIconContainer, { backgroundColor: getDialogColor() + '20' }]}>
                  <FontAwesomeIcon 
                    icon={getDialogIcon()} 
                    size={24} 
                    color={getDialogColor()} 
                  />
                </View>
                <Text style={styles.dialogTitle}>{title}</Text>
              </View>

              <View style={styles.dialogBody}>
                <Text style={styles.dialogMessage}>{message}</Text>
              </View>

              <View style={styles.dialogActions}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dialogButton,
                      button.style === 'destructive' && styles.dialogButtonDestructive,
                      button.style === 'default' && styles.dialogButtonDefault,
                    ]}
                    onPress={() => {
                      button.onPress && button.onPress();
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.dialogButtonText,
                      button.style === 'destructive' && styles.dialogButtonTextDestructive,
                      button.style === 'default' && styles.dialogButtonTextDefault,
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomDialog;