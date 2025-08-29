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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import PinModal from '../../components/PinModal';
import { AuthContext } from '../../context/AuthContext';
import ModernCollectionModal from './components/ModernCollectionModal';
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
  
  // ✅ Add timestamp to track last API call
  const [lastFetched, setLastFetched] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinProcessing, setPinProcessing] = useState(false);
  
  // Modern modal states
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionModalType, setCollectionModalType] = useState('confirm');
  const [modalMessage, setModalMessage] = useState('');
  
  const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;

  // ✅ Modified loadDashboardData with force parameter and timestamp check
  const loadDashboardData = useCallback(async (force = false) => {
    if (!user) return;

    // ⏱️ Avoid repeated API calls unless forced (refresh) or data is stale
    const CACHE_DURATION = 60000; // 60 seconds
    if (!force && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const result = await fetchDashboardData();

      if (!result) {
        setError('Service is currently unavailable. Please try again later.');
        return;
      }

      // ✅ Update timestamp after successful fetch
      setLastFetched(Date.now());
      setInitialLoadComplete(true);
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Service is currently unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user, fetchDashboardData, lastFetched]);

  // ✅ Fixed useFocusEffect - only calls API if data is stale or force refresh
  useFocusEffect(
    useCallback(() => {
      if (user && !initialLoadComplete) {
        // First time focus - always load
        loadDashboardData(true);
      } else if (user) {
        // Subsequent focus - only load if data is stale
        loadDashboardData(false);
      }
    }, [user, loadDashboardData, initialLoadComplete])
  );

  // ✅ Simplified useEffect - only handles initial state
  useEffect(() => {
    if (user && dashboardData && !initialLoadComplete) {
      // If dashboardData exists from context, mark as loaded
      setInitialLoadComplete(true);
      setLoading(false);
      setLastFetched(Date.now());
    }
  }, [user, dashboardData, initialLoadComplete]);

  // ✅ Refresh always forces API call
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData(true); // Force refresh
    setRefreshing(false);
  }, [loadDashboardData]);

  const getStatsData = () => {
    if (!dashboardData) {
      return {
        totalCustomers: 0,
        collectedCustomers: 0,
        remainingCustomers: 0,
        successRate: 0,
        totalCollected: 0,
      };
    }
    return {
      totalCustomers: dashboardData.totalCustomers || 0,
      collectedCustomers: dashboardData.collectedCustomers || 0,
      remainingCustomers: dashboardData.remainingCustomers || 0,
      successRate: dashboardData.successRate || 0,
      totalCollected: dashboardData.collectionStatus?.totalCollected || 0,
    };
  };

  const handlePinConfirm = useCallback(async (pin) => {
    setPinProcessing(true);
    try {
      const response = await makeAuthenticatedRequest(
        `${baseURL}/agent/submit-collection`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pin }),
        }
      );

      if (!response) {
        setPinProcessing(false);
        setShowPinModal(false);
        return false;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        setShowPinModal(false);
        setPinProcessing(false);
        // ✅ Force refresh after successful submission
        await loadDashboardData(true);
        
        setCollectionModalType('success');
        setModalMessage(result.message || 'Collection submitted successfully!');
        setShowCollectionModal(true);
        return true;
      } else {
        setPinProcessing(false);
        const errorMessage = result.message || 'Failed to submit collection';
        if (response.status === 401) return false;
        
        setShowPinModal(false);
        setCollectionModalType('error');
        setModalMessage(errorMessage);
        setShowCollectionModal(true);
        return false;
      }
    } catch (err) {
      console.error('Submit collection error:', err);
      setPinProcessing(false);
      setShowPinModal(false);
      
      setCollectionModalType('error');
      setModalMessage('Network error. Please check your internet connection.');
      setShowCollectionModal(true);
      return false;
    }
  }, [makeAuthenticatedRequest, loadDashboardData]);

  const showConfirmationDialog = () => {
    setCollectionModalType('confirm');
    setShowCollectionModal(true);
  };

  const handleSubmitCollection = useCallback(() => {
    if (submitting || pinProcessing) return;
    
    if (dashboardData?.currentCollection?.submitted) {
      setCollectionModalType('already-submitted');
      setShowCollectionModal(true);
      return;
    }
    
    const statsData = getStatsData();
    if (statsData.collectedCustomers === 0) {
      setCollectionModalType('no-collections');
      setShowCollectionModal(true);
      return;
    }
    
    showConfirmationDialog();
  }, [submitting, pinProcessing, dashboardData]);

  const handlePinModalClose = () => {
    setShowPinModal(false);
    setPinProcessing(false);
  };

  const handleCollectionModalConfirm = () => {
    setShowCollectionModal(false);
    setShowPinModal(true);
  };

  const handleCollectionModalClose = () => {
    setShowCollectionModal(false);
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
  const statsData = getStatsData();

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
      
      {/* 🔹 Header is always visible */}
      <View style={HomeCSS.header}>
        <Image 
          source={require('../../../assets/images/HomeScreen.png')} 
          style={HomeCSS.headerBackgroundImage}
          resizeMode="stretch"
        />
        <View style={HomeCSS.headerOverlay}>
          <View style={HomeCSS.topCornerIcons}>
            <TouchableOpacity style={HomeCSS.profileIcon} onPress={() => navigation.navigate('Profile')}>
              <FontAwesomeIcon icon={faUser} size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={HomeCSS.helpIcon} onPress={() => navigation.navigate('HelpDesk')}>
              <FontAwesomeIcon icon={faQuestionCircle} size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={HomeCSS.bankInfoSection}>
            <BankLogo />
            <Text style={HomeCSS.bankName}>
              {dashboardData?.patsansthaInfo?.fullname || user?.patsansthaName || 'Bank Name'}
            </Text>
            <Text style={HomeCSS.bankCode}>
              {dashboardData?.patsansthaInfo?.address}
            </Text>
          </View>
        </View>
      </View>

      {/* 🔹 Only below section reloads */}
      <ScrollView 
        style={HomeCSS.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading || authLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 300 }}>
            <ActivityIndicator size="large" color="#6739B7" />
            <Text style={HomeCSS.loadingText}>Loading Dashboard...</Text>
          </View>

        ) : error && !dashboardData ? (
          <View style={HomeCSS.loadingContainer}>
            <Text style={HomeCSS.errorText}>{error}</Text>
            <TouchableOpacity style={HomeCSS.retryButton} onPress={() => loadDashboardData(true)}>
              <Text style={HomeCSS.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Today's Collection Card */}
            <View style={HomeCSS.collectionCard}>
              <View style={HomeCSS.collectionHeader}>
                <FontAwesomeIcon icon={faCalendarDay} size={20} color="#6739B7" />
                <Text style={HomeCSS.collectionHeaderText}>Today's Collection</Text>
              </View>
              <Text style={HomeCSS.collectionAmount}>{formatCurrency(statsData.totalCollected)}</Text>
              <Text style={HomeCSS.collectionSubtext}>From {statsData.collectedCustomers} customers</Text>
              <View style={HomeCSS.collectionActions}>
                <TouchableOpacity 
                  style={[
                    HomeCSS.actionButton, 
                    (dashboardData?.currentCollection?.submitted || statsData.collectedCustomers === 0 || submitting || pinProcessing) 
                      ? { opacity: 0.5 } 
                      : {}
                  ]}
                  disabled={dashboardData?.currentCollection?.submitted || statsData.collectedCustomers === 0 || submitting || pinProcessing}
                  onPress={handleSubmitCollection}
                >
                  {(submitting || pinProcessing) ? (
                    <ActivityIndicator size={16} color="#FFFFFF" />
                  ) : (
                    <FontAwesomeIcon icon={faUpload} size={16} color="#FFFFFF" />
                  )}
                  <Text style={HomeCSS.actionButtonText}>
                    {(submitting || pinProcessing) ? 'Processing...' : 
                     dashboardData?.currentCollection?.submitted ? 'Submitted' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats */}
            <View style={HomeCSS.statsContainer}>
              <View style={HomeCSS.statsRow}>
                <View style={HomeCSS.statCard}>
                  <View style={[HomeCSS.statIcon, { backgroundColor: '#EBF8FF' }]}>
                    <FontAwesomeIcon icon={faUsers} size={20} color="#3182CE" />
                  </View>
                  <Text style={HomeCSS.statNumber}>{statsData.totalCustomers}</Text>
                  <Text style={HomeCSS.statLabel}>Total Customers</Text>
                </View>
                <View style={HomeCSS.statCard}>
                  <View style={[HomeCSS.statIcon, { backgroundColor: '#FEF5E7' }]}>
                    <FontAwesomeIcon icon={faClockRotateLeft} size={20} color="#F6AD55" />
                  </View>
                  <Text style={HomeCSS.statNumber}>{statsData.remainingCustomers}</Text>
                  <Text style={HomeCSS.statLabel}>Remaining</Text>
                </View>
              </View>
              <View style={HomeCSS.statsRow}>
                <View style={HomeCSS.statCard}>
                  <View style={[HomeCSS.statIcon, { backgroundColor: '#F0FDF4' }]}>
                    <FontAwesomeIcon icon={faCheckCircle} size={20} color="#22C55E" />
                  </View>
                  <Text style={HomeCSS.statNumber}>{statsData.collectedCustomers}</Text>
                  <Text style={HomeCSS.statLabel}>Collected</Text>
                </View>
                <View style={HomeCSS.statCard}>
                  <View style={[HomeCSS.statIcon, { backgroundColor: '#F3E8FF' }]}>
                    <FontAwesomeIcon icon={faChartLine} size={20} color="#8B5CF6" />
                  </View>
                  <Text style={HomeCSS.statNumber}>{statsData.successRate}%</Text>
                  <Text style={HomeCSS.statLabel}>Success Rate</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <ModernCollectionModal
        visible={showCollectionModal}
        onClose={handleCollectionModalClose}
        onConfirm={handleCollectionModalConfirm}
        type={collectionModalType}
        amount={statsData.totalCollected}
        customers={statsData.collectedCustomers}
        message={modalMessage}
      />

      <PinModal
        visible={showPinModal}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirm}
        customer={{ name: 'Collection Submission' }}
        amount={statsData.totalCollected}
        isProcessing={pinProcessing}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;