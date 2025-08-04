import {
  faCheckCircle,
  faClock,
  faGift,
  faHourglassHalf,
  faReceipt,
  faTimesCircle,
  faUniversity
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Sample transaction data matching HomeScreen structure
const transactionHistory = {
  "statusCode": 200,
  "data": {
    "transactions": [
      {
        "id": "TXN001",
        "type": "credit",
        "amount": 15000,
        "description": "Commission Payment - July",
        "date": "2025-07-31",
        "time": "09:30 AM",
        "status": "completed",
        "category": "commission",
        "reference": "COM202507001",
        "customerName": "Rajesh Sharma",
        "accountNumber": "****5678"
      },
      {
        "id": "TXN002",
        "type": "credit",
        "amount": 8500,
        "description": "New Account Opening Bonus",
        "date": "2025-07-30",
        "time": "02:15 PM",
        "status": "completed",
        "category": "bonus",
        "reference": "BON202507002",
        "customerName": "Priya Patel",
        "accountNumber": "****3421"
      },
      {
        "id": "TXN003",
        "type": "credit",
        "amount": 12000,
        "description": "Loan Collection Commission",
        "date": "2025-07-29",
        "time": "11:45 AM",
        "status": "completed",
        "category": "commission",
        "reference": "LCC202507003",
        "customerName": "Amit Kumar",
        "accountNumber": "****7890"
      },
      {
        "id": "TXN004",
        "type": "credit",
        "amount": 5500,
        "description": "Insurance Sale Commission",
        "date": "2025-07-28",
        "time": "04:20 PM",
        "status": "completed",
        "category": "commission",
        "reference": "INS202507004",
        "customerName": "Sunita Singh",
        "accountNumber": "****2345"
      },
      {
        "id": "TXN005",
        "type": "credit",
        "amount": 7200,
        "description": "Fixed Deposit Commission",
        "date": "2025-07-27",
        "time": "10:30 AM",
        "status": "completed",
        "category": "commission",
        "reference": "FDC202507005",
        "customerName": "Rohit Gupta",
        "accountNumber": "****6789"
      },
      {
        "id": "TXN006",
        "type": "credit",
        "amount": 3500,
        "description": "Referral Bonus",
        "date": "2025-07-26",
        "time": "03:45 PM",
        "status": "completed",
        "category": "bonus",
        "reference": "REF202507006",
        "customerName": "Neha Joshi",
        "accountNumber": "****4567"
      },
      {
        "id": "TXN007",
        "type": "credit",
        "amount": 9800,
        "description": "Monthly Target Achievement",
        "date": "2025-07-25",
        "time": "12:15 PM",
        "status": "completed",
        "category": "bonus",
        "reference": "TGT202507007",
        "customerName": "System Generated",
        "accountNumber": "****0000"
      },
      {
        "id": "TXN008",
        "type": "credit",
        "amount": 6300,
        "description": "Credit Card Application Fee",
        "date": "2025-07-24",
        "time": "05:30 PM",
        "status": "pending",
        "category": "commission",
        "reference": "CCA202507008",
        "customerName": "Vikash Mehta",
        "accountNumber": "****8901"
      },
      {
        "id": "TXN009",
        "type": "credit",
        "amount": 4200,
        "description": "Account Maintenance Fee",
        "date": "2025-07-23",
        "time": "09:00 AM",
        "status": "completed",
        "category": "fee",
        "reference": "AMF202507009",
        "customerName": "Kavita Sharma",
        "accountNumber": "****1234"
      },
      {
        "id": "TXN010",
        "type": "credit",
        "amount": 11500,
        "description": "Loan Processing Commission",
        "date": "2025-07-22",
        "time": "01:45 PM",
        "status": "processing",
        "category": "commission",
        "reference": "LPC202507010",
        "customerName": "Manoj Singh",
        "accountNumber": "****5678"
      }
    ],
    "summary": {
      "totalEarnings": 83500,
      "thisMonth": 51500,
      "pendingAmount": 6300,
      "completedTransactions": 8,
      "pendingTransactions": 1,
      "processingTransactions": 1
    }
  },
  "message": "Transaction history retrieved successfully",
  "success": true
};

const HistoryScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Removed filters

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const filteredTransactions = transactionHistory.data.transactions;

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short'
      });
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      commission: faUniversity,
      bonus: faGift,
      fee: faReceipt,
    };
    return iconMap[category] || faReceipt;
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      completed: faCheckCircle,
      pending: faHourglassHalf,
      processing: faClock,
      failed: faTimesCircle,
    };
    return statusMap[status] || faCheckCircle;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      completed: '#22C55E',
      pending: '#F59E0B',
      processing: '#3B82F6',
      failed: '#EF4444',
    };
    return colorMap[status] || '#22C55E';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      commission: '#6739B7',
      bonus: '#10B981',
      fee: '#8B5CF6',
    };
    return colorMap[category] || '#6739B7';
  };

  const TransactionItem = ({ transaction }) => (
    <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
      <View style={styles.transactionLeft}>
        <View style={styles.iconContainer}>
          <FontAwesomeIcon 
            icon={faUniversity} 
            size={20} 
            color="#6739B7" 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.customerName} numberOfLines={1}>
            {transaction.customerName}
          </Text>
          <Text style={styles.dateTime}>
            {formatDate(transaction.date)} • {transaction.time}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.amount}>
          + {formatAmount(transaction.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>



      {/* Transaction List */}
      <ScrollView
        style={styles.transactionList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6739B7']}
            tintColor="#6739B7"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length > 0 ? (
          <>
            {filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FontAwesomeIcon icon={faReceipt} size={48} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>
              Pull to refresh for latest transactions
            </Text>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  transactionList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    marginTop:14,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'DMSans-Bold',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    color: '#22C55E',
    fontFamily: 'DMSans-Bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'DMSans-Bold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
  },
  bottomPadding: {
    height: 20,
  },
});

export default HistoryScreen;