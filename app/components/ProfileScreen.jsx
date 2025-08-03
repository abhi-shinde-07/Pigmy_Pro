import {
  faBuilding,
  faCalendarAlt,
  faEnvelope,
  faExclamationTriangle,
  faIdCard,
  faPhone,
  faSignOutAlt,
  faTimes,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useContext, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Fix the import path to match your App.js
import { AuthContext } from '../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

// Sample JSON data matching HomeScreen structure
const profileData = {
  "statusCode": 200,
  "data": {
    "agentInfo": {
      "agentname": "ram",
      "agentno": "9822475463",
      "mobileNumber": "9822475463",
      "email": "ram.agent@punebank.com",
      "joinDate": "15.03.2024",
      "status": "active"
    },
    "patsansthaInfo": {
      "patname": "PuneUrban",
      "fullname": "Pune Urban Cooperative Bank",
      "branchCode": "PUCB001"
    },
    "agentStats": {
      "totalCollections": 125000,
      "totalCustomers": 45,
      "successRate": 92,
      "lastActive": "2025-07-31"
    }
  },
  "message": "Profile data retrieved successfully",
  "success": true
};

const ProfileScreen = () => {
  const authContext = useContext(AuthContext);
  
  // Add safety check for context
  if (!authContext) {
    console.error('AuthContext is undefined. Make sure ProfileScreen is wrapped in AuthProvider.');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Authentication Error</Text>
          <Text style={styles.errorSubtext}>Please restart the app</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { user, logout } = authContext;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [dialogAnimation] = useState(new Animated.Value(0));
  const [overlayAnimation] = useState(new Animated.Value(0));

  const showDialog = () => {
    setShowLogoutDialog(true);
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
    });
  };

  const handleLogout = () => {
    hideDialog();
    setTimeout(() => {
      logout();
    }, 300);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const LogoutDialog = () => (
    <Modal
      visible={showLogoutDialog}
      transparent
      animationType="none"
      onRequestClose={hideDialog}
    >
      <Animated.View
        style={[
          styles.dialogOverlay,
          {
            opacity: overlayAnimation,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={hideDialog}
        />
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
          <View style={styles.dialog}>
            {/* Dialog Header */}
            <View style={styles.dialogHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={hideDialog}
              >
                <FontAwesomeIcon icon={faTimes} size={18} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.dialogIconContainer}>
                <FontAwesomeIcon icon={faExclamationTriangle} size={24} color="#EF4444" />
              </View>
              <Text style={styles.dialogTitle}>Sign Out</Text>
              <Text style={styles.dialogSubtitle}>Are you sure you want to sign out?</Text>
            </View>

            {/* Dialog Actions */}
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
                <Text style={styles.confirmButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  const data = profileData.data;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <FontAwesomeIcon icon={faUser} size={32} color="#FFFFFF" />
              </View>
              <View style={styles.statusIndicator} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {data?.agentInfo?.agentname?.toUpperCase() || 'AGENT NAME'}
              </Text>
              <Text style={styles.profileId}>Agent ID: {data?.agentInfo?.agentno}</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active Agent</Text>
              </View>
            </View>
          </View>

          {/* Bank Information */}
          <View style={styles.bankSection}>
            <View style={styles.bankHeader}>
              <FontAwesomeIcon icon={faBuilding} size={16} color="#6739B7" />
              <Text style={styles.bankTitle}>Bank Information</Text>
            </View>
            <Text style={styles.bankName}>{data?.patsansthaInfo?.fullname}</Text>
            <Text style={styles.bankCode}>Branch Code: {data?.patsansthaInfo?.branchCode}</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesomeIcon icon={faUser} size={16} color="#6739B7" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Full Name</Text>
                <Text style={styles.detailValue}>
                  {data?.agentInfo?.agentname?.toUpperCase() || 'Agent Name'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesomeIcon icon={faIdCard} size={16} color="#6739B7" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Agent ID</Text>
                <Text style={styles.detailValue}>{data?.agentInfo?.agentno}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesomeIcon icon={faPhone} size={16} color="#6739B7" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Mobile Number</Text>
                <Text style={styles.detailValue}>{data?.agentInfo?.mobileNumber}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesomeIcon icon={faEnvelope} size={16} color="#6739B7" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Email Address</Text>
                <Text style={styles.detailValue}>{data?.agentInfo?.email}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesomeIcon icon={faCalendarAlt} size={16} color="#6739B7" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Join Date</Text>
                <Text style={styles.detailValue}>{data?.agentInfo?.joinDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={showDialog}
            activeOpacity={0.8}
          >
            <FontAwesomeIcon icon={faSignOutAlt} size={16} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TechyVerve™</Text>
          <Text style={styles.footerSubtext}>© 2024 All Rights Reserved</Text>
        </View>
      </ScrollView>

      <LogoutDialog />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  // Error handling styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#6739B7',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'DMSans-Regular',
  },
  profileCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6739B7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6739B7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'DMSans-Regular',
  },
  profileId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily: 'DMSans-Regular',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    fontFamily: 'DMSans-Regular',
  },
  bankSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    fontFamily: 'DMSans-Regular',
  },
  bankName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6739B7',
    marginBottom: 4,
    fontFamily: 'DMSans-Regular',
  },
  bankCode: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'DMSans-Regular',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'DMSans-Regular',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    fontFamily: 'DMSans-Regular',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'DMSans-Regular',
  },
  logoutContainer: {
    margin: 20,
    marginTop: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#EF4444',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    fontFamily: 'DMSans-Regular',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6739B7',
    marginBottom: 4,
    fontFamily: 'DMSans-Regular',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Regular',
  },

  // Dialog Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
  },
  dialogHeader: {
    alignItems: 'center',
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'DMSans-Regular',
  },
  dialogSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
  },
  dialogActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'DMSans-Regular',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'DMSans-Regular',
  },
});

export default ProfileScreen;