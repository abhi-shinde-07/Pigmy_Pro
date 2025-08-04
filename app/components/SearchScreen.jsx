import {
  faMapMarkerAlt,
  faPhone,
  faPlus,
  faSearch,
  faTimes,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext.js';
import CollectionModal from './CollectionModal.jsx';
import PinModal from './PinModal.jsx';
import SuccessTransactionScreen from './SuccessTransactionScreen.jsx';

const { width, height } = Dimensions.get('window');

const SearchScreen = () => {
  const { resetInactivityTimer, verifyPin } = useContext(AuthContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [collectionAmount, setCollectionAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      address: 'Shivaji Nagar, Pune',
      accountNumber: 'PUCB001234567',
      totalCollection: 15000,
      lastCollection: '2025-07-25',
      status: 'active',
      collections: [
        { date: '2025-07-25', amount: 2500 },
        { date: '2025-07-20', amount: 3000 },
        { date: '2025-07-15', amount: 2000 },
      ]
    },
    {
      id: 2,
      name: 'Priya Sharma',
      phone: '+91 87654 32109',
      address: 'FC Road, Pune',
      accountNumber: 'PUCB001234568',
      totalCollection: 25000,
      lastCollection: '2025-07-28',
      status: 'active',
      collections: [
        { date: '2025-07-28', amount: 5000 },
        { date: '2025-07-22', amount: 4000 },
        { date: '2025-07-18', amount: 3500 },
      ]
    },
    {
      id: 3,
      name: 'Amit Patil',
      phone: '+91 76543 21098',
      address: 'Kothrud, Pune',
      accountNumber: 'PUCB001234569',
      totalCollection: 8000,
      lastCollection: '2025-07-20',
      status: 'active',
      collections: [
        { date: '2025-07-20', amount: 2000 },
        { date: '2025-07-12', amount: 3000 },
      ]
    },
    {
      id: 4,
      name: 'Sunita Desai',
      phone: '+91 65432 10987',
      address: 'Baner, Pune',
      accountNumber: 'PUCB001234570',
      totalCollection: 32000,
      lastCollection: '2025-07-30',
      status: 'active',
      collections: [
        { date: '2025-07-30', amount: 6000 },
        { date: '2025-07-25', amount: 5500 },
        { date: '2025-07-20', amount: 4000 },
      ]
    },
    {
      id: 5,
      name: 'Vikram Singh',
      phone: '+91 54321 09876',
      address: 'Aundh, Pune',
      accountNumber: 'PUCB001234571',
      totalCollection: 12000,
      lastCollection: '2025-07-18',
      status: 'inactive',
      collections: [
        { date: '2025-07-18', amount: 2500 },
        { date: '2025-07-10', amount: 3000 },
      ]
    }
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Simulate search delay
  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Fade animation for results
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: searchQuery.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [searchQuery, fadeAnim]);

  // Reset inactivity timer on user interaction
  useEffect(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesQuery = searchQuery === '' || 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.accountNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesQuery;
    });
  }, [searchQuery, customers]);

  const handleCollectPress = useCallback((customer) => {
    setSelectedCustomer(customer);
    setShowCollectionModal(true);
  }, []);

  const handleCollectionNext = useCallback((amount) => {
    setCollectionAmount(amount);
    setShowCollectionModal(false);
    setShowPinModal(true);
  }, []);

  const handlePinConfirm = useCallback(async (pin) => {
    setIsProcessing(true);
    
    try {
      const isValidPin = await verifyPin(pin);
      
      if (!isValidPin) {
        setIsProcessing(false);
        return false;
      }

      // Simulate API call
      setTimeout(() => {
        const transactionDate = new Date().toISOString();
        const transactionId = `TXN${Date.now()}`;
        
        // Update customer data
        const updatedCustomers = customers.map(customer => {
          if (customer.id === selectedCustomer.id) {
            const newCollection = {
              date: transactionDate.split('T')[0],
              amount: collectionAmount
            };
            
            return {
              ...customer,
              totalCollection: customer.totalCollection + collectionAmount,
              lastCollection: newCollection.date,
              collections: [newCollection, ...customer.collections]
            };
          }
          return customer;
        });
        
        setCustomers(updatedCustomers);
        
        // Prepare success data
        const successTransactionData = {
          customerName: selectedCustomer.name,
          amount: collectionAmount,
          date: transactionDate,
          transactionId: transactionId,
        };
        
        setSuccessData(successTransactionData);
        setIsProcessing(false);
        setShowPinModal(false);
        setShowSuccessScreen(true);
      }, 1500);
      
      return true;
    } catch (error) {
      setIsProcessing(false);
      return false;
    }
  }, [verifyPin, selectedCustomer, collectionAmount, customers]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccessScreen(false);
    setSuccessData(null);
    setSelectedCustomer(null);
    setCollectionAmount(0);
  }, []);

  const handleCollectionModalClose = useCallback(() => {
    setShowCollectionModal(false);
    setSelectedCustomer(null);
    setCollectionAmount(0);
  }, []);

  const handlePinModalClose = useCallback(() => {
    setShowPinModal(false);
    // Don't reset selectedCustomer and amount here in case user wants to retry
  }, []);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderCustomerItem = useCallback((customer) => {
    return (
      <View key={customer.id} style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <FontAwesomeIcon icon={faUser} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerAccount}>{customer.accountNumber}</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: customer.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: customer.status === 'active' ? '#22C55E' : '#EF4444' }
              ]} />
              <Text style={[
                styles.statusText,
                { color: customer.status === 'active' ? '#22C55E' : '#EF4444' }
              ]}>
                {customer.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.collectButton}
            onPress={() => handleCollectPress(customer)}
            activeOpacity={0.7}
          >
            <FontAwesomeIcon icon={faPlus} size={14} color="#FFFFFF" />
            <Text style={styles.collectButtonText}>Collect</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.customerDetails}>
          <View style={styles.detailRow}>
            <FontAwesomeIcon icon={faPhone} size={12} color="#6B7280" />
            <Text style={styles.detailText}>{customer.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesomeIcon icon={faMapMarkerAlt} size={12} color="#6B7280" />
            <Text style={styles.detailText}>{customer.address}</Text>
          </View>
        </View>

        <View style={styles.customerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Collection</Text>
            <Text style={styles.statValue}>{formatCurrency(customer.totalCollection)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Last Collection</Text>
            <Text style={styles.statValue}>{formatDate(customer.lastCollection)}</Text>
          </View>
        </View>
      </View>
    );
  }, [handleCollectPress]);

  // If success screen is visible, show it instead of the main screen
  if (showSuccessScreen) {
    return (
      <SuccessTransactionScreen
        visible={showSuccessScreen}
        onClose={handleSuccessClose}
        transactionData={successData}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6739B7" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Customers</Text>
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            activeOpacity={0.7}
          >
            <Text style={styles.headerCancelButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesomeIcon icon={faSearch} size={16} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, account..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#6739B7" />
          ) : searchQuery.length > 0 ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <FontAwesomeIcon icon={faTimes} size={14} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery === '' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Customers ({customers.length})</Text>
            <View style={styles.resultsContainer}>
              {customers.map(renderCustomerItem)}
            </View>
          </View>
        ) : (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>
              Search Results ({filteredCustomers.length})
            </Text>
            {filteredCustomers.length > 0 ? (
              <View style={styles.resultsContainer}>
                {filteredCustomers.map(renderCustomerItem)}
              </View>
            ) : (
              <View style={styles.noResultsContainer}>
                <FontAwesomeIcon icon={faSearch} size={48} color="#E5E7EB" />
                <Text style={styles.noResultsTitle}>No Customers Found</Text>
                <Text style={styles.noResultsSubtitle}>
                  Try adjusting your search
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Collection Modal */}
      <CollectionModal
        visible={showCollectionModal}
        onClose={handleCollectionModalClose}
        onNext={handleCollectionNext}
        customer={selectedCustomer}
      />

      {/* PIN Modal */}
      <PinModal
        visible={showPinModal}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirm}
        customer={selectedCustomer}
        amount={collectionAmount}
        isProcessing={isProcessing}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    fontFamily: 'DMSans-Bold',
  },
  headerCancelButton: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
    paddingLeft: 12,
    fontFamily: 'DMSans-Medium',
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    marginTop: 15,
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'DMSans-Bold',
  },
  resultsContainer: {
    gap: 12,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6739B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
    fontFamily: 'DMSans-Bold',
  },
  customerAccount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'DMSans-Medium',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  collectButton: {
    backgroundColor: '#6739B7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  customerDetails: {
    marginBottom: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'DMSans-Medium',
  },
  statValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsTitle: {
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'DMSans-Bold',
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
  },
});

export default SearchScreen;