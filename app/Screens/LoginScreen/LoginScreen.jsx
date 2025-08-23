import { useContext, useRef, useState } from 'react';
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
  
  // Animation values - Only shake animation for error states
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Basic client-side validation (minimal - let backend handle main validation)
  const validateForm = () => {
    const newErrors = {};
    
    // Only check if fields are empty, let backend handle other validations
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 80,
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
    
    // Only basic validation - let backend handle the rest
    if (!validateForm()) {
      shakeForm();
      return;
    }

    try {
      const result = await login(username.trim(), password.trim());
      
      if (!result.success) {
        shakeForm();
        
        // Show exact backend message
        showDialog({
          title: 'Login Failed',
          message: result.message || result.error || 'Login failed',
          type: 'error',
          buttons: [
            {
              text: 'OK',
              style: 'default',
            }
          ]
        });
      } else {
        // Success case - you can show success message from backend if needed
        // showDialog({
        //   title: 'Success',
        //   message: result.message || 'Login successful',
        //   type: 'success',
        //   buttons: [
        //     {
        //       text: 'OK',
        //       style: 'default',
        //     }
        //   ]
        // });
      }
    } catch (error) {
      shakeForm();
      
      // Handle different error scenarios from backend
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Error';
      
      if (error.response && error.response.data) {
        // If it's an API error with response data
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
        
        // Handle specific status codes
        if (error.response.status === 401) {
          errorTitle = 'Authentication Failed';
        } else if (error.response.status === 403) {
          errorTitle = 'Access Denied';
        } else if (error.response.status === 400) {
          errorTitle = 'Invalid Request';
        }
      } else if (error.message) {
        // Network or other errors
        errorMessage = error.message;
      }
      
      showDialog({
        title: errorTitle,
        message: errorMessage,
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
                transform: [
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