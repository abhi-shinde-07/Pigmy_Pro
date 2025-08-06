import {
  faBuildingColumns,
  faCalendarDay,
  faChartLine,
  faCheckCircle,
  faClockRotateLeft,
  faQuestionCircle,
  faUpload,
  faUser,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import PinModal from '../../components/PinModal'; // Import PinModal
import { AuthContext } from '../../context/AuthContext';
import HomeCSS from './styles/HomeCSS';

// Bank Logo Component
const BankLogo = () => (
  <View style={HomeCSS.bankLogo}>
    <FontAwesomeIcon icon={faBuildingColumns} size={28} color="#FFFFFF" />
  </View>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const { 
    user, 
    dashboardData, 
    fetchDashboardData, 
    makeAuthenticatedRequest,
    isLoading: authLoading 
  } = useContext(AuthContext);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Pin Modal states
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinProcessing, setPinProcessing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await fetchDashboardData();
      
      if (!result) {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.message);
      
      // Show error alert
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => loadDashboardData(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    if (user && !dashboardData) {
      loadDashboardData();
    } else if (dashboardData) {
      setLoading(false);
    }
  }, [user, dashboardData, loadDashboardData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  // Handle PIN confirmation for collection submission
  const handlePinConfirm = useCallback(async (pin) => {
    setPinProcessing(true);
    
    try {
      const response = await makeAuthenticatedRequest(
        'http://10.79.49.1:7001/api/v1/agent/submit-collection',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: pin
          }),
        }
      );

      if (!response) {
        // User was logged out due to unauthorized request (401 from token expiry)
        setPinProcessing(false);
        setShowPinModal(false);
        return false;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        // Success - close modal and refresh data
        setShowPinModal(false);
        setPinProcessing(false);
        
        // Refresh dashboard data to reflect the submission
        await loadDashboardData();
        
        Alert.alert(
          'Success', 
          result.message || 'Collection submitted successfully!',
          [{ text: 'OK', style: 'default' }],
          { userInterfaceStyle: 'light' }
        );
        
        return true;
      } else {
        // API returned error
        setPinProcessing(false);
        
        // Use the exact error message from backend
        const errorMessage = result.message || 'Failed to submit collection';
        
        // For all errors including incorrect password (401), just return false to show error in modal
        // Don't close modal for password errors, let user try again
        if (response.status === 401) {
          return false; // This will show the error in PIN modal and keep it open
        }
        
        // For other errors (400, 404, 500), close modal and show alert
        setShowPinModal(false);
        Alert.alert(
          'Error', 
          errorMessage,
          [{ text: 'OK', style: 'default' }],
          { userInterfaceStyle: 'light' }
        );
        return false;
      }
    } catch (error) {
      console.error('Submit collection error:', error);
      setPinProcessing(false);
      setShowPinModal(false);
      
      // Handle network errors
      let errorMessage = 'Network error. Please check your internet connection and try again.';
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      Alert.alert(
        'Error', 
        errorMessage,
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
      return false;
    }
  }, [makeAuthenticatedRequest, loadDashboardData]);

  // Custom confirmation dialog component
  const showConfirmationDialog = () => {
    Alert.alert(
      'Submit Collection',
      `Are you sure you want to submit today's collection?\n\nAmount: ₹${calculations.totalCollected.toLocaleString('en-IN')}\nCustomers: ${calculations.collectedCustomers}\n\nThis action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          style: 'default',
          onPress: () => {
            setShowPinModal(true);
          },
        },
      ],
      {
        cancelable: true,
        userInterfaceStyle: 'light'
      }
    );
  };

  // Handle collection submission button press
  const handleSubmitCollection = useCallback(async () => {
    if (submitting || pinProcessing) return;

    // Check if collection is already submitted
    if (dashboardData?.collectionStatus?.submitted) {
      Alert.alert(
        'Already Submitted',
        'Collection has already been submitted today.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
      return;
    }

    // Check if there are any collections to submit
    if (calculations.collectedCustomers === 0) {
      Alert.alert(
        'No Collections',
        'No collections to submit. Please collect from customers first.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
      return;
    }

    showConfirmationDialog();
  }, [submitting, pinProcessing, dashboardData?.collectionStatus?.submitted, calculations, showConfirmationDialog]);

  // Handle PIN modal close
  const handlePinModalClose = useCallback(() => {
    setShowPinModal(false);
    setPinProcessing(false);
  }, []);

  // Memoized calculations for better performance
  const calculations = useMemo(() => {
    if (!dashboardData?.currentCollection?.transactions) {
      return {
        collectedCustomers: 0,
        remainingCustomers: 0,
        totalTransactions: dashboardData?.totalTransactions || 0,
        totalCollected: dashboardData?.collectionStatus?.totalCollected || 0,
        successRate: 0,
      };
    }

    const transactions = dashboardData.currentCollection.transactions;
    const collectedCustomers = transactions.filter(t => t.collAmt > 0).length;
    const totalTransactions = dashboardData.totalTransactions || 0;
    const remainingCustomers = totalTransactions - collectedCustomers;
    const totalCollected = dashboardData.collectionStatus?.totalCollected || 0;
    const successRate = totalTransactions > 0 ? Math.round((collectedCustomers / totalTransactions) * 100) : 0;

    return {
      collectedCustomers,
      remainingCustomers,
      totalTransactions,
      totalCollected,
      successRate,
    };
  }, [dashboardData]);

  const formatCurrency = useCallback((amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  }, []);

  // Loading state
  if (loading || authLoading) {
    return (
      <SafeAreaView style={HomeCSS.container}>
        <View style={HomeCSS.loadingContainer}>
          <ActivityIndicator size="large" color="#6739B7" />
          <Text style={HomeCSS.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <SafeAreaView style={HomeCSS.container}>
        <View style={HomeCSS.loadingContainer}>
          <Text style={HomeCSS.errorText}>Error loading dashboard</Text>
          <TouchableOpacity 
            style={HomeCSS.retryButton} 
            onPress={loadDashboardData}
          >
            <Text style={HomeCSS.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No user data
  if (!user) {
    return (
      <SafeAreaView style={HomeCSS.container}>
        <View style={HomeCSS.loadingContainer}>
          <Text style={HomeCSS.errorText}>Please login to continue</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={HomeCSS.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6739B7" />
      
      {/* Header */}
      <View style={HomeCSS.header}>
        {/* Header Background Image */}
        <Image 
          source={require('../../../assets/images/HomeScreen.png')} 
          style={HomeCSS.headerBackgroundImage}
          resizeMode="stretch"
        />
        
        {/* Header Content Overlay */}
        <View style={HomeCSS.headerOverlay}>
          {/* Top Corner Icons */}
          <View style={HomeCSS.topCornerIcons}>
            <TouchableOpacity 
              style={HomeCSS.profileIcon} 
              onPress={() => navigation.navigate('Profile')}
            >
              <FontAwesomeIcon icon={faUser} size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={HomeCSS.helpIcon} 
              onPress={() => navigation.navigate('HelpDesk')}
            >
              <FontAwesomeIcon icon={faQuestionCircle} size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Centered Bank Info Section */}
          <View style={HomeCSS.bankInfoSection}>
            <BankLogo />
            <Text style={HomeCSS.bankName}>
              {dashboardData?.patsansthaInfo?.fullname || user?.patsansthaName || 'Bank Name'}
            </Text>
            <Text style={HomeCSS.bankCode}>
              {dashboardData?.patsansthaInfo?.patname || `ID: ${user?.patsansthaId}` || 'Branch Code'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={HomeCSS.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today's Collection Card */}
        <View style={HomeCSS.collectionCard}>
          <View style={HomeCSS.collectionHeader}>
            <FontAwesomeIcon icon={faCalendarDay} size={20} color="#6739B7" />
            <Text style={HomeCSS.collectionHeaderText}>Today's Collection</Text>
          </View>
          <Text style={HomeCSS.collectionAmount}>
            {formatCurrency(calculations.totalCollected)}
          </Text>
          <Text style={HomeCSS.collectionSubtext}>
            From {calculations.collectedCustomers} customers
          </Text>
          
          <View style={HomeCSS.collectionActions}>
            <TouchableOpacity 
              style={[
                HomeCSS.actionButton, 
                (dashboardData?.collectionStatus?.submitted || calculations.collectedCustomers === 0 || submitting || pinProcessing) 
                  ? { opacity: 0.5 } 
                  : {}
              ]}
              disabled={dashboardData?.collectionStatus?.submitted || calculations.collectedCustomers === 0 || submitting || pinProcessing}
              onPress={handleSubmitCollection}
            >
              {(submitting || pinProcessing) ? (
                <ActivityIndicator size={16} color="#FFFFFF" />
              ) : (
                <FontAwesomeIcon icon={faUpload} size={16} color="#FFFFFF" />
              )}
              <Text style={HomeCSS.actionButtonText}>
                {(submitting || pinProcessing) ? 'Processing...' : 
                 dashboardData?.collectionStatus?.submitted ? 'Submitted' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Stats */}
        <View style={HomeCSS.statsContainer}>
          <View style={HomeCSS.statsRow}>
            {/* Total Customers */}
            <View style={HomeCSS.statCard}>
              <View style={[HomeCSS.statIcon, { backgroundColor: '#EBF8FF' }]}>
                <FontAwesomeIcon icon={faUsers} size={20} color="#3182CE" />
              </View>
              <Text style={HomeCSS.statNumber}>{calculations.totalTransactions}</Text>
              <Text style={HomeCSS.statLabel}>Total Customers</Text>
            </View>

            {/* Remaining Customers */}
            <View style={HomeCSS.statCard}>
              <View style={[HomeCSS.statIcon, { backgroundColor: '#FEF5E7' }]}>
                <FontAwesomeIcon icon={faClockRotateLeft} size={20} color="#F6AD55" />
              </View>
              <Text style={HomeCSS.statNumber}>{calculations.remainingCustomers}</Text>
              <Text style={HomeCSS.statLabel}>Remaining</Text>
            </View>
          </View>

          <View style={HomeCSS.statsRow}>
            {/* Collected Customers */}
            <View style={HomeCSS.statCard}>
              <View style={[HomeCSS.statIcon, { backgroundColor: '#F0FDF4' }]}>
                <FontAwesomeIcon icon={faCheckCircle} size={20} color="#22C55E" />
              </View>
              <Text style={HomeCSS.statNumber}>{calculations.collectedCustomers}</Text>
              <Text style={HomeCSS.statLabel}>Collected</Text>
            </View>

            {/* Collection Rate */}
            <View style={HomeCSS.statCard}>
              <View style={[HomeCSS.statIcon, { backgroundColor: '#F3E8FF' }]}>
                <FontAwesomeIcon icon={faChartLine} size={20} color="#8B5CF6" />
              </View>
              <Text style={HomeCSS.statNumber}>{calculations.successRate}%</Text>
              <Text style={HomeCSS.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>

        {/* Additional Information Section */}
        {dashboardData?.additionalInfo && (
          <View style={HomeCSS.additionalInfoContainer}>
            <Text style={HomeCSS.additionalInfoTitle}>Additional Information</Text>
            <Text style={HomeCSS.additionalInfoText}>
              {dashboardData.additionalInfo}
            </Text>
          </View>
        )}

      </ScrollView>

      {/* PIN Modal for Collection Submission */}
      <PinModal
        visible={showPinModal}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirm}
        customer={{ name: 'Collection Submission' }}
        amount={calculations.totalCollected}
        isProcessing={pinProcessing}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;