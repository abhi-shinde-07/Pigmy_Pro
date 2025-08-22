import { faReceipt, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const CURRENT_COLLECTION_ENDPOINT = "/agent/today-collection";

const HistoryScreen = () => {
  const { makeAuthenticatedRequest } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collectionData, setCollectionData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch current collection data
  const fetchCurrentCollection = async () => {
    try {
      setError(null);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}${CURRENT_COLLECTION_ENDPOINT}`,
        {
          method: "GET",
        }
      );

      if (!response) {
        // User was logged out due to unauthorized request
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setCollectionData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch collection data");
      }
    } catch (error) {
      console.error("Collection fetch error:", error);
      setError(error.message || "Failed to load collection data");
      
      // Don't show alert for 404 errors (no collection data)
      if (!error.message?.includes('404') && !error.message?.includes('No collection data found')) {
        Alert.alert(
          "Error",
          "Failed to load History data. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize data load on mount
  useEffect(() => {
    fetchCurrentCollection();
  }, []);

  // Auto-reload when screen comes into focus (like clicking the History tab)
  useFocusEffect(
    useCallback(() => {
      // Reset loading state and fetch fresh data
      setLoading(true);
      fetchCurrentCollection();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCurrentCollection();
    setRefreshing(false);
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Fixed date formatting function
  const formatDate = (dateString) => {
    const transactionDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Normalize dates to compare only the date part (ignore time)
    const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (transactionDateOnly.getTime() === todayDateOnly.getTime()) {
      return "Today";
    } else if (transactionDateOnly.getTime() === yesterdayDateOnly.getTime()) {
      return "Yesterday";
    } else {
      return transactionDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not collected";
    return timeString;
  };

  // Show only collected transactions
  const getCollectedTransactions = () => {
    if (!collectionData?.transactions) return [];
    return collectionData.transactions.filter((t) => t.collAmt > 0);
  };

  // Fixed time conversion function
  const convertTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    
    try {
      // Handle format like "5:18:23 pm" or "2:30:15 pm"
      const [time, period] = timeString.toLowerCase().trim().split(' ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      
      let totalHours = hours;
      
      // Convert to 24-hour format
      if (period === 'pm' && hours !== 12) {
        totalHours = hours + 12;
      } else if (period === 'am' && hours === 12) {
        totalHours = 0; // 12 AM is 0 hours
      }
      
      // Calculate total minutes
      const totalMinutes = totalHours * 60 + minutes + (seconds || 0) / 60;
      
      return totalMinutes;
    } catch (error) {
      console.error('Error parsing time:', timeString, error);
      return 0;
    }
  };

  // Fixed sorting function
  const getSortedTransactions = (transactions) => {
    return transactions.sort((a, b) => {
      // Parse dates properly
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // First sort by date (latest first)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB - dateA; // Latest date first
      }
      
      // If dates are same, sort by time (latest first)
      if (a.time && b.time) {
        const timeA = convertTimeToMinutes(a.time);
        const timeB = convertTimeToMinutes(b.time);
        return timeB - timeA; // Latest time first
      }
      
      // If one has time and other doesn't, prioritize the one with time
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      
      return 0;
    });
  };

  const filteredTransactions = getSortedTransactions(getCollectedTransactions());

  // Calculate total collected amount from API data
  const getTotalCollectedAmount = () => {
    if (!collectionData?.transactions) return 0;
    return collectionData.transactions.reduce((sum, t) => sum + t.collAmt, 0);
  };

  const TransactionItem = ({ transaction }) => {
    return (
      <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
        <View style={styles.transactionLeft}>
          <View style={styles.iconContainer}>
            <FontAwesomeIcon icon={faUser} size={20} color="#6739B7" />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.customerName} numberOfLines={1}>
              {transaction.name}
            </Text>
            <Text style={styles.accountInfo}>
              A/C: {transaction.accountNo} • {transaction.mobileNumber}
            </Text>
            <Text style={styles.dateTime}>
              {formatDate(transaction.date)} • {formatTime(transaction.time)}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.amount}>
            + {formatAmount(transaction.collAmt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6739B7" />
          <Text style={styles.loadingText}>Loading collection data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        {collectionData && (
          <View style={styles.headerStats}>
            <Text style={styles.headerStatsText}>
              {collectionData.collectedCustomers} of {collectionData.totalCustomers}
            </Text>
          </View>
        )}
      </View>

      {/* Collection Summary */}
      {collectionData && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {formatAmount(getTotalCollectedAmount())}
                </Text>
                <Text style={styles.summaryLabel}>Total Collected</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {collectionData.collectedCustomers}
                </Text>
                <Text style={styles.summaryLabel}>Customers</Text>
              </View>
            </View>
            
            {/* Collection Status */}
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: collectionData.submitted ? '#22C55E' : '#F59E0B' }
              ]} />
              <Text style={[
                styles.statusText,
                { color: collectionData.submitted ? '#22C55E' : '#F59E0B' }
              ]}>
                {collectionData.submitted ? 'Submitted' : 'In Progress'}
              </Text>
              {collectionData.submitted && collectionData.submittedAt && (
                <Text style={styles.submittedTime}>
                  • {collectionData.submittedAt}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6739B7"]}
            tintColor="#6739B7"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.transactionList}>
          {filteredTransactions.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Transactions</Text>
              {filteredTransactions.map((transaction, index) => (
                <TransactionItem
                  key={`${transaction.accountNo}-${index}`}
                  transaction={transaction}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <FontAwesomeIcon icon={faReceipt} size={48} color="#E5E7EB" />
              </View>
              <Text style={styles.emptyStateText}>
                {error?.includes('No collection data found') 
                  ? 'No Collection Data' 
                  : 'No Collections Yet'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {error?.includes('No collection data found')
                  ? 'Please contact your Patsanstha to upload customer data'
                  : 'Collections will appear here once you start collecting'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#6739B7",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: "DMSans-Bold",
  },
  headerStats: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerStatsText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "DMSans-Bold",
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "DMSans-Bold",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "DMSans-Bold",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "DMSans-Medium",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "DMSans-Bold",
  },
  submittedTime: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    fontFamily: "DMSans-Medium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "DMSans-Medium",
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "DMSans-Bold",
    marginBottom: 12,
    marginTop: 16,
  },
  transactionList: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F8FAFC",
    marginTop: 10,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(103, 57, 183, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "DMSans-Bold",
    marginBottom: 4,
  },
  accountInfo: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "DMSans-Medium",
    marginBottom: 2,
  },
  dateTime: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "DMSans-Medium",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    color: "#22C55E",
    fontFamily: "DMSans-Bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "DMSans-Bold",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    fontFamily: "DMSans-Medium",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});

export default HistoryScreen;