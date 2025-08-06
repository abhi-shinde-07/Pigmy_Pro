import {
  faCheckCircle,
  faPhone,
  faPlus,
  faSearch,
  faTimes,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext.js";
import CollectionModal from "./components/CollectionModal.jsx";
import SuccessTransactionPopup from "./components/SuccessTransactionScreen";
import { styles } from "./styles/SearchScreenStyles.js";

const { width, height } = Dimensions.get("window");

const SearchScreen = () => {
  const {
    resetSessionTimer,
    dashboardData,
    fetchDashboardData,
    makeAuthenticatedRequest,
  } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ADDED: Success popup states
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successTransactionData, setSuccessTransactionData] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load customers from dashboard data
  // Replace the existing useEffect that loads customers from dashboard data
useEffect(() => {
  if (dashboardData?.currentCollection?.transactions) {
    // Group transactions by customer (using accountNo or mobileNumber as identifier)
    const customerMap = new Map();
    
    dashboardData.currentCollection.transactions.forEach(transaction => {
      // Use accountNo as the unique identifier for customers
      const customerId = transaction.accountNo;
      
      if (customerMap.has(customerId)) {
        // Customer already exists, merge transaction data
        const existingCustomer = customerMap.get(customerId);
        
        // Add current transaction amount to previous balance
        existingCustomer.previousBalance += transaction.collAmt || 0;
        
        // Keep the most recent collection date and amount
        if (transaction.date && transaction.collAmt > 0) {
          if (!existingCustomer.lastCollection || new Date(transaction.date) > new Date(existingCustomer.lastCollection)) {
            existingCustomer.lastCollection = transaction.date;
            existingCustomer.collectionTime = transaction.time;
            existingCustomer.totalCollection = transaction.collAmt; // Only keep the last collection amount
          }
        } else if (!existingCustomer.hasCollection && transaction.collAmt > 0) {
          // If no previous collection, use this one
          existingCustomer.totalCollection = transaction.collAmt;
        }
        
        // Update hasCollection status
        existingCustomer.hasCollection = existingCustomer.totalCollection > 0;
        
        // Store all transaction IDs for this customer
        existingCustomer.transactionIds.push(transaction._id);
        
      } else {
        // New customer, create entry
        const newCustomer = {
          id: customerId, // Use accountNo as unique ID
          name: transaction.name,
          phone: transaction.mobileNumber,
          address: `Account: ${transaction.accountNo}`,
          accountNumber: transaction.accountNo,
          totalCollection: transaction.collAmt || 0, // Last collection amount
          lastCollection: transaction.date,
          previousBalance: transaction.prevBalance + (transaction.collAmt || 0), // Original + current collection
          originalPreviousBalance: transaction.prevBalance, // Store original for reference
          openingDate: transaction.openingDate,
          collectionTime: transaction.time,
          hasCollection: (transaction.collAmt || 0) > 0 && transaction.time !== null,
          transactionId: transaction._id, // Primary transaction ID
          transactionIds: [transaction._id] // Array of all transaction IDs for this customer
        };
        
        customerMap.set(customerId, newCustomer);
      }
    });
    
    // Convert Map to array
    const transformedCustomers = Array.from(customerMap.values());
    
    setCustomers(transformedCustomers);
    setIsSubmitted(dashboardData.currentCollection.submitted || false);
    setIsLoading(false);
  } else if (dashboardData && !dashboardData.currentCollection?.transactions) {
    setCustomers([]);
    setIsSubmitted(false);
    setIsLoading(false);
  }
}, [dashboardData]);
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

  // Reset session timer on user interaction
  useEffect(() => {
    if (typeof resetSessionTimer === "function") {
      resetSessionTimer();
    }
  }, [resetSessionTimer]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesQuery =
        searchQuery === "" ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.accountNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesQuery;
    });
  }, [searchQuery, customers]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardData();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchDashboardData]);

  const handleCollectPress = useCallback(
    (customer) => {
      if (isSubmitted) {
        Alert.alert(
          "Collection Submitted",
          "This collection batch has already been submitted. No more collections can be added."
        );
        return;
      }
      setSelectedCustomer(customer);
      setShowCollectionModal(true);
    },
    [isSubmitted]
  );

  // MODIFIED: Updated to show success popup instead of alert
  const handleCollectionNext = useCallback(
    async (amount, password) => {
      if (!selectedCustomer) return false;

      try {
        const API_BASE_URL = "http://10.79.49.1:7001/api/v1";
        const response = await makeAuthenticatedRequest(
          `${API_BASE_URL}/agent/collection/${selectedCustomer.accountNumber}`,
          {
            method: "POST",
            body: JSON.stringify({
              collectionAmount: parseFloat(amount),
              password: password,
            }),
          }
        );

        if (!response) {
          return false;
        }

        const result = await response.json();

        if (!response.ok) {
          let errorMessage = "Failed to record collection. Please try again.";

          switch (response.status) {
            case 400:
              errorMessage =
                result.message || "Invalid collection amount or missing data.";
              break;
            case 401:
              if (
                result.message &&
                result.message.toLowerCase().includes("password")
              ) {
                return false;
              }
              errorMessage =
                "Incorrect password. Please check your password and try again.";
              break;
            case 404:
              errorMessage =
                "Customer not found or no collection data available.";
              break;
            default:
              errorMessage = result.message || "An unexpected error occurred.";
          }

          if (response.status !== 401) {
            Alert.alert("Collection Error", errorMessage);
          }
          return false;
        }

        // Success - close the main modal first
        setShowCollectionModal(false);

        // Update local customer data
        const updatedCustomers = customers.map((customer) => {
          if (customer.id === selectedCustomer.id) {
            return {
              ...customer,
              totalCollection: parseFloat(amount),
              lastCollection: result.data.date,
              collectionTime: result.data.time,
              hasCollection: true,
            };
          }
          return customer;
        });

        setCustomers(updatedCustomers);

        // UPDATED: Include customer phone in transaction data for SMS
        const transactionData = {
          amount: parseFloat(amount),
          customerName: selectedCustomer.name,
          customerPhone: selectedCustomer.phone, // Add customer phone for SMS
          transactionId:
            selectedCustomer.transactionId ||
            result.data.transactionId ||
            `TXN${Date.now()}`,
          date: result.data.date || new Date().toISOString(),
        };

        setSuccessTransactionData(transactionData);
        setShowSuccessPopup(true);

        setSelectedCustomer(null);

        // Refresh dashboard data to get updated totals
        await fetchDashboardData();

        return true;
      } catch (error) {
        console.error("Collection submission error:", error);
        Alert.alert(
          "Network Error",
          "Failed to record collection. Please check your internet connection and try again."
        );
        return false;
      }
    },
    [selectedCustomer, customers, makeAuthenticatedRequest, fetchDashboardData]
  );

  const handleCollectionModalClose = useCallback(() => {
    setShowCollectionModal(false);
    setSelectedCustomer(null);
  }, []);

  // ADDED: Success popup close handler
  const handleSuccessPopupClose = useCallback(() => {
    setShowSuccessPopup(false);
    setSuccessTransactionData(null);
  }, []);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCollectionStatus = (customer) => {
    if (isSubmitted) {
      return {
        text: "SUBMITTED",
        color: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
      };
    }

    if (customer.hasCollection) {
      return {
        text: "COLLECTED",
        color: "#22C55E",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
      };
    }

    return {
      text: "PENDING",
      color: "#EF4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
    };
  };

  const renderCustomerItem = useCallback(
    (customer) => {
      const statusInfo = getCollectionStatus(customer);

      return (
        <View key={customer.id} style={styles.customerCard}>
          <View style={styles.customerHeader}>
            <View style={styles.customerAvatar}>
              <FontAwesomeIcon icon={faUser} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerAccount}>
                {customer.accountNumber}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.collectButton,
                isSubmitted && styles.collectButtonDisabled,
              ]}
              onPress={() => handleCollectPress(customer)}
              activeOpacity={0.7}
              disabled={isSubmitted}
            >
              <FontAwesomeIcon
                icon={isSubmitted ? faCheckCircle : faPlus}
                size={14}
                color={isSubmitted ? "#9CA3AF" : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.collectButtonText,
                  isSubmitted && styles.collectButtonTextDisabled,
                ]}
              >
                {isSubmitted ? "Submitted" : "Collect"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.customerDetails}>
            <View style={styles.detailRow}>
              <FontAwesomeIcon icon={faPhone} size={12} color="#6B7280" />
              <Text style={styles.detailText}>{customer.phone}</Text>
            </View>
          </View>

          <View style={styles.customerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Previous Balance</Text>
              <Text style={styles.statValue}>
                {formatCurrency(customer.previousBalance)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>
                {customer.hasCollection ? "Last Collection" : "Collection Date"}
              </Text>
              <Text style={styles.statValue}>
                {customer.hasCollection
                  ? formatCurrency(customer.totalCollection)
                  : formatDate(customer.lastCollection)}
              </Text>
            </View>
          </View>

          {customer.hasCollection && customer.collectionTime && (
            <View style={styles.collectionTimeContainer}>
              <Text style={styles.collectionTimeText}>
                Last collected at: {customer.collectionTime}
              </Text>
            </View>
          )}
        </View>
      );
    },
    [handleCollectPress, isSubmitted]
  );

  // Get collection summary
  const collectionSummary = useMemo(() => {
    const totalCustomers = customers.length;
    const customersWithCollection = customers.filter(
      (c) => c.hasCollection
    ).length;
    const totalCollectionAmount = customers.reduce(
      (sum, c) => sum + (c.totalCollection || 0),
      0
    );

    return {
      totalCustomers,
      customersWithCollection,
      totalCollectionAmount,
      pendingCustomers: totalCustomers - customersWithCollection,
    };
  }, [customers]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6739B7" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6739B7" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      </SafeAreaView>
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
            onPress={() => setSearchQuery("")}
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
              onPress={() => setSearchQuery("")}
              activeOpacity={0.7}
            >
              <FontAwesomeIcon icon={faTimes} size={14} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#6739B7"]}
            tintColor="#6739B7"
          />
        }
      >
        {searchQuery === "" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              All Customers ({customers.length})
            </Text>
            {customers.length > 0 ? (
              <View style={styles.resultsContainer}>
                {customers.map(renderCustomerItem)}
              </View>
            ) : (
              <View style={styles.noResultsContainer}>
                <FontAwesomeIcon icon={faSearch} size={48} color="#E5E7EB" />
                <Text style={styles.noResultsTitle}>No Customer Data</Text>
                <Text style={styles.noResultsSubtitle}>
                  Please contact your Patsanstha to upload customer data
                </Text>
              </View>
            )}
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

      {/* ADDED: Success Transaction Popup */}
      <SuccessTransactionPopup
        visible={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        transactionData={successTransactionData}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
