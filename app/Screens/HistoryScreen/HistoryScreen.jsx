import { faReceipt, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

// API Configuration
const API_BASE_URL = "http://10.79.49.1:7001/api/v1";
const TODAY_COLLECTION_ENDPOINT = "/agent/today-collection";

const HistoryScreen = () => {
  const { makeAuthenticatedRequest } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collectionData, setCollectionData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch today's collection data
  const fetchTodayCollection = async () => {
    try {
      setError(null);
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}${TODAY_COLLECTION_ENDPOINT}`,
        {
          method: "GET",
        }
      );

      if (!response) {
        // User was logged out due to unauthorized request
        return;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
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
      Alert.alert(
        "Error",
        "Failed to load today's collection data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize data load
  useEffect(() => {
    fetchTodayCollection();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodayCollection();
    setRefreshing(false);
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not collected";
    return timeString;
  };

  const getCollectionStatus = (collAmt, time) => {
    if (collAmt > 0 && time) {
      return "collected";
    } else {
      return "pending";
    }
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      collected: faCheckCircle,
      pending: faClock,
      failed: faTimesCircle,
    };
    return statusMap[status] || faClock;
  };

  

  const getStatusColor = (status) => {
    const colorMap = {
      collected: "#22C55E",
      pending: "#F59E0B",
      failed: "#EF4444",
    };
    return colorMap[status] || "#F59E0B";
  };

  // Show only collected transactions
  const getCollectedTransactions = () => {
    if (!collectionData?.transactions) return [];
    return collectionData.transactions.filter((t) => t.collAmt > 0);
  };

  // Sort transactions to show latest first
const getSortedTransactions = (transactions) => {
  return transactions.sort((a, b) => {
    // First sort by date
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB - dateA; // Latest date first
    }
    
    // If dates are same, sort by time
    if (a.time && b.time) {
      // Convert time to comparable format
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

// Helper function to convert time string to minutes for comparison
const convertTimeToMinutes = (timeString) => {
  if (!timeString) return 0;
  
  // Handle format like "11:09:43 am" or "2:30:15 pm"
  const [time, period] = timeString.toLowerCase().split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let totalMinutes = minutes;
  if (period === 'pm' && hours !== 12) {
    totalMinutes += (hours + 12) * 60;
  } else if (period === 'am' && hours === 12) {
    totalMinutes += 0; // 12 AM is 0 hours
  } else {
    totalMinutes += hours * 60;
  }
  
  return totalMinutes;
};

  const filteredTransactions = getSortedTransactions(getCollectedTransactions());
  // Calculate summary stats
  const getSummaryStats = () => {
    if (!collectionData?.transactions) {
      return {
        totalCollected: 0,
        totalPending: 0,
        collectedCount: 0,
        pendingCount: 0,
        totalAmount: 0,
      };
    }

    const collected = collectionData.transactions.filter((t) => t.collAmt > 0);
    const pending = collectionData.transactions.filter((t) => t.collAmt === 0);

    const totalCollected = collected.reduce((sum, t) => sum + t.collAmt, 0);
    const totalPending = pending.reduce((sum, t) => sum + t.prevBalance, 0);
    const totalAmount = collectionData.transactions.reduce(
      (sum, t) => sum + t.collAmt,
      0
    );

    return {
      totalCollected,
      totalPending,
      collectedCount: collected.length,
      pendingCount: pending.length,
      totalAmount,
    };
  };

  const stats = getSummaryStats();

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
          <Text style={styles.headerTitle}>Today's Collection</Text>
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
        <Text style={styles.headerTitle}>Today's Collections</Text>
      </View>

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
              {filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction._id}
                  transaction={transaction}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <FontAwesomeIcon icon={faReceipt} size={48} color="#E5E7EB" />
              </View>
              <Text style={styles.emptyStateText}>No collections found</Text>
              <Text style={styles.emptyStateSubtext}>
                Pull to refresh for latest data
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
    marginTop:10,
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: "DMSans-Bold",
  },
  amount: {
    fontSize: 16,
    color: "#22C55E",
    fontFamily: "DMSans-Bold",
  },
  pendingAmount: {
    fontSize: 16,
    color: "#F59E0B",
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
  },
  bottomPadding: {
    height: 20,
  },
});

export default HistoryScreen;