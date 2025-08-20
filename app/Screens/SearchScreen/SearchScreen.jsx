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
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { AuthContext } from "../../context/AuthContext.js";
import CollectionModal from "./components/CollectionModal.jsx";
import SuccessTransactionPopup from "./components/SuccessTransactionScreen";
import { styles } from "./styles/SearchScreenStyles.js";



const SearchScreen = () => {
  const {
    resetSessionTimer,
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
  const [agentMeta, setAgentMeta] = useState(null);

  // Success popup states
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successTransactionData, setSuccessTransactionData] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch customers from the new API
  const fetchCustomers = useCallback(async () => {
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/agent/customers`,
        {
          method: "GET",
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch customers");
      }

      if (result.success && result.data) {
        // Transform the customer data to match the expected format
        const transformedCustomers = result.data.customers.map(customer => ({
          id: customer.accountNo,
          name: customer.name,
          phone: customer.mobileNumber,
          address: `Account: ${customer.accountNo}`,
          accountNumber: customer.accountNo,
          totalCollection: customer.collAmt || 0,
          lastCollection: null, // You can add date logic if needed
          previousBalance: customer.prevBalance,
          originalPreviousBalance: customer.prevBalance,
          openingDate: customer.openingDate,
          collectionTime: customer.time,
          hasCollection: customer.hasCollection,
          transactionId: customer.accountNo, // Using accountNo as transaction ID
          transactionIds: [customer.accountNo]
        }));

        setCustomers(transformedCustomers);
        setAgentMeta(result.data.agentMeta);
        setIsSubmitted(false); // Set based on your logic
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      Alert.alert(
        "Error", 
        error.message || "Failed to fetch customer data. Please try again."
      );
      setIsLoading(false);
    }
  }, [makeAuthenticatedRequest]);

  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
      await fetchCustomers();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchCustomers]);

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

  const handleCollectionNext = useCallback(
    async (amount, password) => {
      if (!selectedCustomer) return false;

      try {
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
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

        const transactionData = {
          amount: parseFloat(amount),
          customerName: selectedCustomer.name,
          customerPhone: selectedCustomer.phone,
          transactionId:
            selectedCustomer.transactionId ||
            result.data.transactionId ||
            `TXN${Date.now()}`,
          date: result.data.date || new Date().toISOString(),
        };

        setSuccessTransactionData(transactionData);
        setShowSuccessPopup(true);

        setSelectedCustomer(null);

        // Refresh customer data to get updated totals
        await fetchCustomers();

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
    [selectedCustomer, customers, makeAuthenticatedRequest, fetchCustomers]
  );

  const handleCollectionModalClose = useCallback(() => {
    setShowCollectionModal(false);
    setSelectedCustomer(null);
  }, []);

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

  const renderCustomerItem = useCallback(
    (customer) => {
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

      {/* Success Transaction Popup */}
      <SuccessTransactionPopup
        visible={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        transactionData={successTransactionData}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;