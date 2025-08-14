import {
  faEye,
  faEyeSlash,
  faLock,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { formStyles as styles } from '../styles/LoginScreenStyles';

const LoginForm = ({
  username,
  password,
  showPassword,
  errors,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onTogglePassword,
  onLogin,
}) => {
  return (
    <>
      {/* Agent Number Input */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Agent ID</Text>
        <View style={[styles.inputContainer, errors.username && styles.inputContainerError]}>
          <View style={styles.inputIconContainer}>
            <FontAwesomeIcon icon={faUser} size={18} color="#6B7280" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter your agent number"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={onUsernameChange}
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
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            autoComplete="password"
            autoCorrect={false}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={onTogglePassword}
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
        onPress={onLogin}
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
    </>
  );
};

export default LoginForm;