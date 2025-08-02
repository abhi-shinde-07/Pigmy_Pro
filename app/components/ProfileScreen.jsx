// ProfileScreen.jsx

import { useContext, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [dialogAnimation] = useState(new Animated.Value(0));
  const [overlayAnimation] = useState(new Animated.Value(0));

  const showDialog = (type) => {
    if (type === 'logout') {
      setShowLogoutDialog(true);
    } else if (type === 'profile') {
      setShowProfileDialog(true);
    }

    Animated.parallel([
      Animated.timing(overlayAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(dialogAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideDialog = () => {
    Animated.parallel([
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(dialogAnimation, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLogoutDialog(false);
      setShowProfileDialog(false);
    });
  };

  const handleLogout = () => {
    hideDialog();
    setTimeout(() => {
      logout();
    }, 300);
  };

  const handleProfilePress = () => {
    showDialog('profile');
  };

  const DialogOverlay = ({ children, visible }) => {
    if (!visible) return null;
    return (
      <Modal visible={visible} transparent animationType="none" onRequestClose={hideDialog}>
        <Animated.View style={[styles.dialogOverlay, { opacity: overlayAnimation }]}>
          <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={hideDialog} />
          <Animated.View
            style={[
              styles.dialogContainer,
              {
                transform: [
                  {
                    scale: dialogAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                  {
                    translateY: dialogAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: dialogAnimation,
              },
            ]}
          >
            {children}
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  const LogoutDialog = () => (
    <DialogOverlay visible={showLogoutDialog}>
      <View style={styles.dialog}>
        <View style={styles.dialogGlow} />
        <View style={styles.dialogHeader}>
          <View style={styles.dialogIconContainer}>
            <Text style={styles.dialogIcon}>⚠️</Text>
          </View>
          <Text style={styles.dialogTitle}>Confirm Sign Out</Text>
        </View>
        <View style={styles.dialogContent}>
          <Text style={styles.dialogMessage}>
            Are you sure you want to sign out? You'll need to log in again to access your account.
          </Text>
        </View>
        <View style={styles.dialogActions}>
          <TouchableOpacity
            style={[styles.dialogButton, styles.cancelButton]}
            onPress={hideDialog}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dialogButton, styles.confirmButton]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.confirmButtonGradient}>
              <Text style={styles.confirmButtonText}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </DialogOverlay>
  );

  const ProfileDialog = () => (
    <DialogOverlay visible={showProfileDialog}>
      <View style={styles.dialog}>
        <View style={styles.dialogGlow} />
        <View style={styles.dialogHeader}>
          <View style={styles.dialogIconContainer}>
            <Text style={styles.dialogIcon}>👤</Text>
          </View>
          <Text style={styles.dialogTitle}>Profile Details</Text>
        </View>
        <View style={styles.dialogContent}>
          <View style={styles.profileDetailItem}>
            <Text style={styles.profileDetailLabel}>Full Name</Text>
            <Text style={styles.profileDetailValue}>{user?.name || 'John Doe'}</Text>
          </View>
          <View style={styles.profileDetailItem}>
            <Text style={styles.profileDetailLabel}>Email Address</Text>
            <Text style={styles.profileDetailValue}>{user?.email || 'john.doe@email.com'}</Text>
          </View>
          <View style={styles.profileDetailItem}>
            <Text style={styles.profileDetailLabel}>Account Status</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.profileDetailItem}>
            <Text style={styles.profileDetailLabel}>Member Since</Text>
            <Text style={styles.profileDetailValue}>January 2024</Text>
          </View>
        </View>
        <View style={styles.dialogActions}>
          <TouchableOpacity
            style={[styles.dialogButton, styles.primaryButton]}
            onPress={hideDialog}
            activeOpacity={0.8}
          >
            <View style={styles.primaryButtonGradient}>
              <Text style={styles.primaryButtonText}>Close</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </DialogOverlay>
  );

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerAccent} />
      </View>

      <TouchableOpacity style={styles.profileCard} onPress={handleProfilePress} activeOpacity={0.9}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarGlow} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name || 'John Doe')}</Text>
          </View>
        </View>
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'john.doe@email.com'}</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
          <Text style={styles.tapHint}>Tap to view details</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => showDialog('logout')}
          activeOpacity={0.8}
        >
          <View style={styles.logoutGradient}>
            <View style={styles.logoutContent}>
              <Text style={styles.logoutIcon}>🚀</Text>
              <Text style={styles.logoutText}>Sign Out</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* TechyVerve Branding */}
      <View style={styles.brandingContainer}>
        <View style={styles.brandCard}>
          <View style={styles.brandGlow} />
          <Text style={styles.poweredByText}>Crafted with ❤️ by</Text>
          <View style={styles.brandNameContainer}>
            <Text style={styles.brandName}>Techy</Text>
            <Text style={styles.brandNameAccent}>Verve</Text>
            <Text style={styles.trademark}>™</Text>
          </View>
          <Text style={styles.copyrightText}>Innovation • Excellence • Trust</Text>
          <Text style={styles.yearText}>© 2024 All Rights Reserved</Text>
        </View>
      </View>

      {/* Dialogs */}
      <LogoutDialog />
      <ProfileDialog />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
  element1: {
    width: 100,
    height: 100,
    backgroundColor: '#3B82F6',
    top: '15%',
    right: '10%',
  },
  element2: {
    width: 60,
    height: 60,
    backgroundColor: '#8B5CF6',
    top: '60%',
    left: '5%',
  },
  element3: {
    width: 80,
    height: 80,
    backgroundColor: '#10B981',
    bottom: '25%',
    right: '15%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerAccent: {
    width: 60,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginTop: 8,
  },
  profileCard: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(42, 42, 62, 0.8)',
    margin: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  avatarGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    opacity: 0.3,
    top: -10,
    left: -10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  logoutContainer: {
    margin: 20,
    marginTop: 30,
  },
  logoutButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutGradient: {
    backgroundColor: '#EF4444',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 'auto',
  },
  brandCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(42, 42, 62, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  brandGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 20,
  },
  poweredByText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '500',
  },
  brandNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandName: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandNameAccent: {
    fontSize: 24,
    color: '#8B5CF6',
    fontWeight: '800',
    letterSpacing: 1,
  },
  trademark: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 2,
    marginTop: -8,
  },
  copyrightText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  yearText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '400',
  },

  // Dialog Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayTouchable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: 'rgba(42, 42, 62, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  dialogGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  dialogHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  dialogIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  dialogIcon: {
    fontSize: 28,
  },
  dialogTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dialogContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dialogMessage: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 24,
  },
  profileDetailItem: {
    marginBottom: 20,
  },
  profileDetailLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileDetailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignSelf: 'flex-start',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  dialogActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  cancelButtonText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonGradient: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;