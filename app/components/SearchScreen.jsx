import {
  faCheck,
  faEye,
  faEyeSlash,
  faMapMarkerAlt,
  faPhone,
  faPlus,
  faRupeeSign,
  faSearch,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [collectionAmount, setCollectionAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

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

  const showCollectionModal = (customer) => {
    setSelectedCustomer(customer);
    setShowPasswordModal(true);
    setPassword('');
    setCollectionAmount('');
    setPasswordError('');
    
    Animated.parallel([
      Animated.timing(overlayAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(modalAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideCollectionModal = () => {
    Animated.parallel([
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(modalAnimation, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPasswordModal(false);
      setSelectedCustomer(null);
      setPassword('');
      setCollectionAmount('');
      setPasswordError('');
    });
  };

  const handleAddCollection = () => {
    if (password !== '1234') {
      setPasswordError('Invalid password');
      return;
    }

    if (!collectionAmount || parseFloat(collectionAmount) <= 0) {
      setPasswordError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedCustomers = customers.map(customer => {
        if (customer.id === selectedCustomer.id) {
          const newCollection = {
            date: new Date().toISOString().split('T')[0],
            amount: parseFloat(collectionAmount)
          };
          
          return {
            ...customer,
            totalCollection: customer.totalCollection + parseFloat(collectionAmount),
            lastCollection: newCollection.date,
            collections: [newCollection, ...customer.collections]
          };
        }
        return customer;
      });
      
      setCustomers(updatedCustomers);
      setIsProcessing(false);
      hideCollectionModal();
    }, 1500);
  };

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

  const renderCustomerItem = (customer) => {
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
            onPress={() => showCollectionModal(customer)}
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
  };

  const CollectionModal = () => (
    <Modal
      visible={showPasswordModal}
      transparent
      animationType="none"
      onRequestClose={hideCollectionModal}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          { opacity: overlayAnimation }
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={hideCollectionModal}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  scale: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
                {
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: modalAnimation,
            },
          ]}
        >
          <View style={styles.modal}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={hideCollectionModal}
              >
                <FontAwesomeIcon icon={faTimes} size={18} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Collection</Text>
              {selectedCustomer && (
                <Text style={styles.modalSubtitle}>{selectedCustomer.name}</Text>
              )}
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Collection Amount</Text>
                <View style={styles.amountInputContainer}>
                  <FontAwesomeIcon icon={faRupeeSign} size={16} color="#6B7280" />
                  <TextInput
                    style={styles.amountInput}
                    placeholder="Enter amount"
                    placeholderTextColor="#9CA3AF"
                    value={collectionAmount}
                    onChangeText={setCollectionAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon 
                      icon={showPassword ? faEyeSlash : faEye} 
                      size={16} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={hideCollectionModal}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddCollection}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} size={14} color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Add Collection</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6739B7" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Customers</Text>
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.cancelButton}>Clear</Text>
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

      <CollectionModal />
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
    fontFamily: 'DMSans-Regular',
  },
  cancelButton: {
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
    fontFamily: 'DMSans-Regular',
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
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'DMSans-Regular',
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
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: 'DMSans-Regular',
  },
  customerAccount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'DMSans-Regular',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'DMSans-Regular',
  },
  collectButton: {
    backgroundColor: '#6739B7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  collectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans-Regular',
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
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Regular',
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'DMSans-Regular',
  },
  statValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
    fontFamily: 'DMSans-Regular',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'DMSans-Regular',
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
  },

  // Modal Styles
  modalOverlay: {
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
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modal: {
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
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'DMSans-Regular',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'DMSans-Regular',
  },
  modalContent: {
    padding: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'DMSans-Regular',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
    paddingLeft: 12,
    fontFamily: 'DMSans-Regular',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
    fontFamily: 'DMSans-Regular',
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontFamily: 'DMSans-Regular',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
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
    backgroundColor: '#6739B7',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'DMSans-Regular',
  },
});

export default SearchScreen;