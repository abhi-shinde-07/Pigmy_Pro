import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

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

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(25430.50);
  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, type: 'credit', amount: 2500, description: 'Salary Credit', date: '2025-07-29', time: '09:30 AM' },
    { id: 2, type: 'debit', amount: 150, description: 'ATM Withdrawal', date: '2025-07-28', time: '02:15 PM' },
    { id: 3, type: 'credit', amount: 500, description: 'Transfer from John', date: '2025-07-27', time: '11:45 AM' },
    { id: 4, type: 'debit', amount: 45, description: 'Online Shopping', date: '2025-07-26', time: '06:20 PM' },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const quickActions = [
    { id: 1, title: 'Transfer', icon: '💸', color: '#3B82F6' },
    { id: 2, title: 'Pay Bills', icon: '📄', color: '#10B981' },
    { id: 3, title: 'Recharge', icon: '📱', color: '#F59E0B' },
    { id: 4, title: 'Loans', icon: '🏦', color: '#8B5CF6' },
  ];

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
          <Text style={styles.accountNumber}>Account: {user?.accountNumber || '****1234'}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Statement</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsContainer}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.type === 'credit' ? '#10B981' : '#EF4444' }
                  ]}>
                    <Text style={styles.transactionIconText}>
                      {transaction.type === 'credit' ? '↓' : '↑'}
                    </Text>
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionDate}>{transaction.date} • {transaction.time}</Text>
                  </View>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'credit' ? '#10B981' : '#EF4444' }
                ]}>
                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesContainer}>
            <TouchableOpacity style={styles.serviceItem}>
              <Text style={styles.serviceIcon}>💳</Text>
              <Text style={styles.serviceTitle}>Cards</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceItem}>
              <Text style={styles.serviceIcon}>📊</Text>
              <Text style={styles.serviceTitle}>Investments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceItem}>
              <Text style={styles.serviceIcon}>🛡️</Text>
              <Text style={styles.serviceTitle}>Insurance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#8B8B9B',
  },
  userName: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#3B82F6',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  accountNumber: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  transactionsContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f5f',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#8B8B9B',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceItem: {
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    padding: 20,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  serviceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default HomeScreen;
