import { useState } from 'react';

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

// Theme Configuration
const theme = {
  colors: {
    background: '#1a1a2e',
    surface: '#2a2a3e',
    surfaceElevated: '#3f3f5f',
    textPrimary: '#FFFFFF',
    textSecondary: '#8B8B9B',
    textTertiary: '#6B7280',
    primary: '#3B82F6',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    border: '#2a2a3e',
    card: '#2a2a3e',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  typography: {
    h1: { fontSize: 24, fontWeight: '700' },
    h2: { fontSize: 20, fontWeight: '600' },
    h3: { fontSize: 18, fontWeight: '600' },
    h4: { fontSize: 16, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' },
    label: { fontSize: 10, fontWeight: '600' },
  },
};

const HistoryScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: 'all', title: 'All' },
    { id: 'credit', title: 'Credit' },
    { id: 'debit', title: 'Debit' },
    { id: 'pending', title: 'Pending' },
  ];

  const transactions = [
    {
      id: 1,
      type: 'credit',
      amount: 5000,
      description: 'Salary Credit',
      date: '2025-07-30',
      time: '09:30 AM',
      status: 'completed',
      category: 'Income',
      reference: 'TXN123456789',
    },
    {
      id: 2,
      type: 'debit',
      amount: 1200,
      description: 'Online Shopping - Amazon',
      date: '2025-07-29',
      time: '02:15 PM',
      status: 'completed',
      category: 'Shopping',
      reference: 'TXN123456788',
    },
    {
      id: 3,
      type: 'credit',
      amount: 800,
      description: 'Transfer from John Smith',
      date: '2025-07-29',
      time: '11:45 AM',
      status: 'completed',
      category: 'Transfer',
      reference: 'TXN123456787',
    },
    {
      id: 4,
      type: 'debit',
      amount: 150,
      description: 'ATM Withdrawal',
      date: '2025-07-28',
      time: '06:20 PM',
      status: 'completed',
      category: 'Cash',
      reference: 'TXN123456786',
    },
    {
      id: 5,
      type: 'debit',
      amount: 2500,
      description: 'Electricity Bill Payment',
      date: '2025-07-28',
      time: '10:30 AM',
      status: 'completed',
      category: 'Bills',
      reference: 'TXN123456785',
    },
    {
      id: 6,
      type: 'credit',
      amount: 300,
      description: 'Cashback Reward',
      date: '2025-07-27',
      time: '03:45 PM',
      status: 'completed',
      category: 'Reward',
      reference: 'TXN123456784',
    },
    {
      id: 7,
      type: 'debit',
      amount: 45,
      description: 'Coffee Shop',
      date: '2025-07-27',
      time: '08:15 AM',
      status: 'completed',
      category: 'Food',
      reference: 'TXN123456783',
    },
    {
      id: 8,
      type: 'debit',
      amount: 350,
      description: 'Gas Station',
      date: '2025-07-26',
      time: '05:30 PM',
      status: 'completed',
      category: 'Transport',
      reference: 'TXN123456782',
    },
    {
      id: 9,
      type: 'credit',
      amount: 1500,
      description: 'Freelance Payment',
      date: '2025-07-26',
      time: '12:00 PM',
      status: 'completed',
      category: 'Income',
      reference: 'TXN123456781',
    },
    {
      id: 10,
      type: 'debit',
      amount: 89,
      description: 'Grocery Store',
      date: '2025-07-25',
      time: '07:45 PM',
      status: 'pending',
      category: 'Food',
      reference: 'TXN123456780',
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') return transaction.status === 'pending';
    return transaction.type === selectedFilter;
  });

  const formatAmount = (amount, type) => {
    const formattedAmount = `₹${amount.toLocaleString()}`;
    return type === 'credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
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
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  const getTransactionIcon = (category) => {
    const iconMap = {
      Income: '💰',
      Shopping: '🛒',
      Transfer: '💸',
      Cash: '🏧',
      Bills: '📄',
      Reward: '🎁',
      Food: '🍔',
      Transport: '⛽',
    };
    return iconMap[category] || '💳';
  };

  const getStatusColor = (status) => {
    return status === 'pending' ? theme.colors.warning : theme.colors.success;
  };

  const TransactionItem = ({ transaction }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getTransactionIcon(transaction.category)}</Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.description}>{transaction.description}</Text>
          <Text style={styles.category}>{transaction.category}</Text>
          <Text style={styles.dateTime}>
            {formatDate(transaction.date)} • {transaction.time}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.amount,
          { color: transaction.type === 'credit' ? theme.colors.success : theme.colors.error }
        ]}>
          {formatAmount(transaction.amount, transaction.type)}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(transaction.status) }
        ]}>
          <Text style={styles.statusText}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.activeFilterTab
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.activeFilterText
              ]}>
                {filter.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transaction List */}
      <ScrollView
        style={styles.transactionList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try changing your filter or pull to refresh
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 50,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  filterContainer: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeFilterText: {
    color: theme.colors.textPrimary,
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  transactionItem: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  dateTime: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  amount: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default HistoryScreen;