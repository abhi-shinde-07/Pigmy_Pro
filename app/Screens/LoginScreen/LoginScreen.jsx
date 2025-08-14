import { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

// Import components
import CustomDialog from './components/CustomDialog';
import Footer from './components/Footer';
import Header from './components/Header';
import LoginForm from './components/LoginForm';

// Import styles
import { styles } from './styles/LoginScreenStyles';

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
          title: 'Access Denied',
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

  const handleUsernameChange = (text) => {
    setUsername(text);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: null }));
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: null }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6739B7" />
      
      <Header />

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
            <LoginForm
              username={username}
              password={password}
              showPassword={showPassword}
              errors={errors}
              isLoading={isLoading}
              onUsernameChange={handleUsernameChange}
              onPasswordChange={handlePasswordChange}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onLogin={handleLogin}
            />

            <Footer />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

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

export default LoginScreen;