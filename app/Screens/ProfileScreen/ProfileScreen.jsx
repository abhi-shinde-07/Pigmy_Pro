import {
  faBuilding,
  faCalendarAlt,
  faEnvelope,
  faIdCard,
  faPhone,
  faSignOutAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useCallback, useContext, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import LogoutDialog from './components/LogoutDialog';
import { styles } from './styles/ProfileStyles';

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

  const { user, logout, isLoading, getUserProfileData } = authContext;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Use refs for animations that persist across renders
  const dialogAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  // Get profile data from authentication context
  const profileData = getUserProfileData();

  const showDialog = useCallback(() => {
    setShowLogoutDialog(true);
  }, []);

  const hideDialog = useCallback(() => {
    setShowLogoutDialog(false);
  }, []);

  const handleLogout = useCallback(async () => {
    hideDialog();
    // Call the logout function which will handle API call and cleanup
    await logout();
  }, [hideDialog, logout]);

  const formatCurrency = useCallback((amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  }, []);

  // Show loading or error state if no user data
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {isLoading ? 'Loading...' : 'No Profile Data Available'}
          </Text>
          <Text style={styles.errorSubtext}>
            {isLoading ? 'Please wait' : 'Please login again'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // Handle case where getUserProfileData returns null
  const safeProfileData = profileData;

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
        keyboardShouldPersistTaps="handled"
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
                {safeProfileData.agentInfo.agentname?.toUpperCase() || 'AGENT NAME'}
              </Text>
              <Text style={styles.profileId}>
                Agent ID: {safeProfileData.agentInfo.agentno}
              </Text>
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
              <Text style={styles.bankTitle}>Organization Name</Text>
            </View>
            <Text style={styles.bankName}>
              {safeProfileData.patsansthaInfo.fullname}
            </Text>
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
                  {safeProfileData.agentInfo.agentname?.toUpperCase() || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesomeIcon icon={faIdCard} size={16} color="#6739B7" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Agent ID</Text>
                <Text style={styles.detailValue}>
                  {safeProfileData.agentInfo.agentno}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesomeIcon icon={faPhone} size={16} color="#6739B7" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Mobile Number</Text>
                <Text style={styles.detailValue}>
                  {safeProfileData.agentInfo.mobileNumber}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesomeIcon icon={faEnvelope} size={16} color="#6739B7" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Email Address</Text>
                <Text style={styles.detailValue}>
                  {safeProfileData.agentInfo.email || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesomeIcon icon={faCalendarAlt} size={16} color="#6739B7" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Exp Date</Text>
                <Text style={styles.detailValue}>
                {/* show proper date is dd/mm/yyyy */}
                  {safeProfileData.agentInfo.expDate ? new Date(safeProfileData.agentInfo.expDate).toLocaleDateString('en-GB') : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]}
            onPress={showDialog}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faSignOutAlt} size={16} color="#EF4444" />
            <Text style={styles.logoutText}>
              {isLoading ? 'Logging Out...' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TechyVerve™</Text>
          <Text style={styles.footerSubtext}>© 2024 All Rights Reserved</Text>
        </View>
      </ScrollView>

      <LogoutDialog 
        visible={showLogoutDialog}
        onClose={hideDialog}
        onConfirm={handleLogout}
        dialogAnimation={dialogAnimation}
        overlayAnimation={overlayAnimation}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;