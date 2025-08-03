// ✅ Updated ProfileScreen.jsx with loop protection and session timeout reset
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Modal from 'react-native-modal';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout, resetSessionTimer } = useContext(AuthContext);

  const [dialogVisible, setDialogVisible] = useState(null); // 'logout' | 'profile' | null
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const dialogAnimation = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      resetSessionTimer();
    }, [])
  );

  const showDialog = (type) => {
    if (dialogVisible !== type) {
      setDialogVisible(type);
    }
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
    ]).start(() => setDialogVisible(null));
  };

  const handleLogout = () => {
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
      setDialogVisible(null);
      requestAnimationFrame(() => {
        logout();
      });
    });
  };

  useEffect(() => {
    if (dialogVisible) {
      overlayAnimation.setValue(0);
      dialogAnimation.setValue(0);

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
    }
  }, [dialogVisible]);

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();

  const DialogOverlay = ({ children, type }) => {
    const isVisible = dialogVisible === type;

    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={hideDialog}
        onBackButtonPress={hideDialog}
        backdropOpacity={0.7}
        animationIn="zoomIn"
        animationOut="zoomOut"
        useNativeDriver={false}
        hideModalContentWhileAnimating
        style={styles.modalContainer}
      >
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
      </Modal>
    );
  };

  const LogoutDialog = () => (
    <DialogOverlay type="logout">
      <View style={styles.dialog}>
        <Text style={styles.dialogTitle}>Confirm Sign Out</Text>
        <Text style={styles.dialogMessage}>
          Are you sure you want to sign out? You'll need to log in again to access your account.
        </Text>
        <View style={styles.dialogActions}>
          <TouchableOpacity style={styles.dialogButton} onPress={hideDialog}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dialogButton, styles.confirmButton]}
            onPress={handleLogout}
          >
            <Text style={styles.confirmButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </DialogOverlay>
  );

  const ProfileDialog = () => (
    <DialogOverlay type="profile">
      <View style={styles.dialog}>
        <Text style={styles.dialogTitle}>Profile Details</Text>
        <Text style={styles.dialogMessage}>Full Name: {user?.name || 'John Doe'}</Text>
        <Text style={styles.dialogMessage}>Email: {user?.email || 'john.doe@email.com'}</Text>
        <TouchableOpacity style={styles.dialogButton} onPress={hideDialog}>
          <Text style={styles.confirmButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </DialogOverlay>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <TouchableOpacity style={styles.profileCard} onPress={() => showDialog('profile')}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name || 'John Doe')}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'john.doe@email.com'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => showDialog('logout')}>
        <Text style={styles.logoutText}>🚀 Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.brandingContainer}>
        <Text style={styles.poweredByText}>Crafted with ❤️ by TechyVerve™</Text>
      </View>

      <LogoutDialog />
      <ProfileDialog />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23', padding: 20 },
  header: { alignItems: 'center', marginVertical: 20 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  profileCard: {
    backgroundColor: '#1f1f3f',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  userName: { color: '#fff', fontSize: 22, fontWeight: '600' },
  userEmail: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  brandingContainer: { marginTop: 50, alignItems: 'center' },
  poweredByText: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  modalContainer: { justifyContent: 'center', alignItems: 'center', margin: 0 },
  dialogContainer: {
    backgroundColor: '#1f1f3f',
    padding: 20,
    borderRadius: 16,
    width: '80%',
  },
  dialog: { alignItems: 'center' },
  dialogTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  dialogMessage: {
    color: '#CBD5E1',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    marginHorizontal: 8,
    padding: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#CBD5E1', fontSize: 16, fontWeight: '600' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  confirmButton: { backgroundColor: '#EF4444' },
});

export default ProfileScreen;
