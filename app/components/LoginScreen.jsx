import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

import {
  faBolt,
  faCheckCircle,
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faInfoCircle,
  faLock,
  faShield,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Enhanced Custom Dialog Component
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

// Simple Pigmy Logo Component with larger size
const PigmyLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoGlow}>
      <Image 
        source={require('../../assets/images/PigmyPro.png')}
        style={styles.logoImage}
        resizeMode="contain"
        onError={(error) => console.log('Logo image error:', error)}
      />
    </View>
  </View>
);

// Simple TechyVerve Logo Component with larger size
const TechyVerveLogo = () => (
  <View style={styles.companyLogoContainer}>
    <View style={styles.companyLogoGlow}>
      <Image 
        source={require('../../assets/images/Techy_Verve.png')}
        style={styles.companyLogoImage}
        resizeMode="contain"
        onError={(error) => console.log('Company logo image error:', error)}
      />
    </View>
  </View>
);

const LoginScreen = () => {
  const { login, isLoading } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [dialogConfig, setDialogConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'default'
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showDialog = (config) => {
    setDialogConfig({
      visible: true,
      ...config
    });
  };

  const hideDialog = () => {
    setDialogConfig(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleLogin = async () => {
    setErrors({});
    
    if (!validateForm()) {
      shakeForm();
      return;
    }

    try {
      const result = await login(username.trim(), password.trim());
      
      if (!result.success) {
        shakeForm();
        showDialog({
          title: 'Login Failed',
          message: result.error,
          type: 'error',
          buttons: [
            {
              text: 'Try Again',
              style: 'default',
            }
          ]
        });
      }
    } catch (error) {
      shakeForm();
      showDialog({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
        buttons: [
          {
            text: 'OK',
            style: 'default',
          }
        ]
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6739B7" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Logo without text */}
          <View style={styles.logoWrapper}>
            <PigmyLogo />
          </View>
          <Text style={styles.headerSubtitle}>Welcome back! Please sign in to continue</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakeAnim }
                ]
              }
            ]}
          >
            {/* Username Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={[styles.inputContainer, errors.username && styles.inputContainerError]}>
                <View style={styles.inputIconContainer}>
                  <FontAwesomeIcon icon={faUser} size={18} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: null }));
                    }
                  }}
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputContainerError]}>
                <View style={styles.inputIconContainer}>
                  <FontAwesomeIcon icon={faLock} size={18} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon 
                    icon={showPassword ? faEyeSlash : faEye} 
                    size={16} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.loginButtonText}>Signing In...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Footer - Company Logo Only */}
            <View style={styles.footer}>
              <TechyVerveLogo />
              <Text style={{color:'#c6bcbcff'}}>© 2024 All Rights Reserved</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Enhanced Custom Dialog */}
      <CustomDialog
        visible={dialogConfig.visible}
        onClose={hideDialog}
        title={dialogConfig.title}
        message={dialogConfig.message}
        buttons={dialogConfig.buttons}
        type={dialogConfig.type}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    flex: 1,
    backgroundColor: '#6739B7',
    fontFamily: 'DMSans-Medium',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 8,
    backgroundColor: '#6739B7',
  },
  statusTime: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  bar: {
    backgroundColor: '#FFFFFF',
    width: 2,
  },
  bar1: { height: 3 },
  bar2: { height: 5 },
  bar3: { height: 7 },
  bar4: { height: 9 },
  wifiIcon: {
    fontSize: 12,
  },
  battery: {
    width: 24,
    height: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 2,
    padding: 1,
  },
  batteryFill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  header: {
    backgroundColor: '#6739B7',
    paddingHorizontal: 20,
    paddingBottom: 40,
    position: 'relative',
  },
  backButton: {
    marginBottom: 20,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoWrapper: {
    margin: -60 ,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 300,
    height: 300,
    tintColor: '#FFFFFF',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontWeight: '400',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  companyLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
  },
  companyLogoImage: {
    width: 100,
    height: 100,
    tintColor: '#6739B7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  scrollContainer: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'DMSans-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  inputIconContainer: {
    paddingLeft: 16,
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 6,
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#6739B7',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  loginButton: {
    backgroundColor: '#6739B7',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6739B7',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'DMSans-Bold',
  },
  
  // Dialog Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  dialogHeader: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dialogIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
  },
  dialogBody: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  dialogMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'DMSans-Medium',
  },
  dialogActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogButtonDefault: {
    backgroundColor: '#6739B7',
    shadowColor: '#6739B7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dialogButtonDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  dialogButtonTextDefault: {
    color: '#FFFFFF',
  },
  dialogButtonTextDestructive: {
    color: '#EF4444',
  },
});

export default LoginScreen;