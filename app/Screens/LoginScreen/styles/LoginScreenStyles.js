import { StyleSheet } from 'react-native';

// Main container styles
export const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    flex: 1,
    backgroundColor: '#6739B7',
    fontFamily: 'DMSans-Medium',
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
});

// Header styles
export const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: '#6739B7',
    paddingHorizontal: 20,
    paddingBottom: 40,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoWrapper: {
    margin: -60,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontWeight: '400',
  },
});

// Logo styles
export const logoStyles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    // Add glow effect if needed
  },
  logoImage: {
    width: 300,
    height: 300,
    tintColor: '#FFFFFF',
  },
});

// Company logo styles
export const companyLogoStyles = StyleSheet.create({
  companyLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
  },
  companyLogoGlow: {
    // Add glow effect if needed
  },
  companyLogoImage: {
    width: 100,
    height: 100,
    tintColor: '#6739B7',
  },
});

// Form styles
export const formStyles = StyleSheet.create({
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
    letterSpacing: 0.5,
    fontFamily: 'DMSans-Bold',
  },
});

// Footer styles
export const footerStyles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  copyrightText: {
    color: '#9CA3AF',
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
  },
});

// Dialog styles
export const dialogStyles = StyleSheet.create({
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
    fontWeight: '600',
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

// Color constants for easy maintenance
export const colors = {
  primary: '#6739B7',
  secondary: '#FFFFFF',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#6739B7',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  background: '#FFFFFF',
  shadow: '#000000',
};

// Font constants
export const fonts = {
  regular: 'DMSans-Medium',
  bold: 'DMSans-Bold',
};

// Common spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};

export default {};