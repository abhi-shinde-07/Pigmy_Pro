import {
  faBell,
  faBuilding,
  faCalendarDay,
  faChartLine,
  faCheckCircle,
  faClockRotateLeft,
  faDownload,
  faUpload,
  faUser,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Sample JSON data (in real app, this would come from API)
const dashboardData = {
  "statusCode": 200,
  "data": {
    "agentInfo": {
      "agentname": "ram",
      "agentno": "9822475463",
      "mobileNumber": "9822475463"
    },
    "patsansthaInfo": {
      "patname": "PuneUrban",
      "fullname": "Pune Urban Cooperative Bank",
      "message": null,
      "messageUpdatedAt": null
    },
    "currentCollection": {
      "agentMeta": {
        "lastAccountNo": "000004",
        "limitAmount": 500000,
        "hr": 72,
        "password": "12341234"
      },
      "agentNo": "9822475463",
      "submitted": false,
      "submittedAt": null,
      "downloaded": false,
      "transactions": [
        {
          "accountNo": "000005",
          "name": "Dalvi A P",
          "prevBalance": 1200,
          "openingDate": "12.05.04",
          "mobileNumber": "9811122233",
          "collAmt": 100,
          "time": "09:00",
          "date": "2025-07-31"
        },
        {
          "accountNo": "000006",
          "name": "Mali V S",
          "prevBalance": 900,
          "openingDate": "22.06.04",
          "mobileNumber": "9823344556",
          "collAmt": 200,
          "time": "09:05",
          "date": "2025-07-31"
        },
        {
          "accountNo": "000007",
          "name": "Deshmukh T R",
          "prevBalance": 3300,
          "openingDate": "30.04.04",
          "mobileNumber": "9876611223",
          "collAmt": 300,
          "time": "09:10",
          "date": "2025-07-31"
        },
        {
          "accountNo": "000008",
          "name": "Jadhav R B",
          "prevBalance": 2100,
          "openingDate": "18.07.04",
          "mobileNumber": "9832211234",
          "collAmt": 100,
          "time": "09:15",
          "date": "2025-07-31"
        },
        {
          "accountNo": "000009",
          "name": "Gaikwad N M",
          "prevBalance": 750,
          "openingDate": "08.08.04",
          "mobileNumber": "9765543321",
          "collAmt": 200,
          "time": "09:20",
          "date": "2025-07-31"
        }
      ]
    },
    "totalTransactions": 20,
    "collectionStatus": {
      "totalTransactions": 20,
      "totalCollected": 4000,
      "submitted": false,
      "submittedAt": null,
      "agentMeta": {
        "lastAccountNo": "000004",
        "limitAmount": 500000,
        "hr": 72,
        "password": "12341234"
      }
    },
    "hasDataToWork": true
  },
  "message": "Dashboard data retrieved successfully",
  "success": true
};

// Bank Logo Component (similar to PhonePe style)
const BankLogo = () => (
  <View style={styles.bankLogoContainer}>
    <View style={styles.bankLogo}>
      <FontAwesomeIcon icon={faBuilding} size={24} color="#FFFFFF" />
    </View>
  </View>
);

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(dashboardData.data);
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getCollectedCustomers = () => {
    if (!data?.currentCollection?.transactions) return 0;
    return data.currentCollection.transactions.filter(t => t.collAmt > 0).length;
  };

  const getRemainingCustomers = () => {
    if (!data) return 0;
    return data.totalTransactions - getCollectedCustomers();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6739B7" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6739B7" />
      
      {/* Header */}
      <View style={styles.header}>
        {/* Bank Info Section */}
        <View style={styles.bankInfoSection}>
          <View style={styles.bankInfo}>
            <BankLogo />
            <View style={styles.bankDetails}>
              <Text style={styles.bankName}>{data?.patsansthaInfo?.fullname}</Text>
              <Text style={styles.bankCode}>{data?.patsansthaInfo?.patname}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <FontAwesomeIcon icon={faBell} size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Agent Info */}
        <View style={styles.agentInfo}>
          <View style={styles.agentAvatar}>
            <FontAwesomeIcon icon={faUser} size={16} color="#6739B7" />
          </View>
          <View>
            <Text style={styles.agentName}>Agent: {data?.agentInfo?.agentname?.toUpperCase()}</Text>
            <Text style={styles.agentNumber}>ID: {data?.agentInfo?.agentno}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today's Collection Card */}
        <View style={styles.collectionCard}>
          <View style={styles.collectionHeader}>
            <FontAwesomeIcon icon={faCalendarDay} size={20} color="#6739B7" />
            <Text style={styles.collectionHeaderText}>Today's Collection</Text>
          </View>
          <Text style={styles.collectionAmount}>
            {formatCurrency(data?.collectionStatus?.totalCollected || 0)}
          </Text>
          <Text style={styles.collectionSubtext}>
            From {getCollectedCustomers()} customers
          </Text>
          
          <View style={styles.collectionActions}>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesomeIcon icon={faUpload} size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
              <FontAwesomeIcon icon={faDownload} size={16} color="#6739B7" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {/* Total Customers */}
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#EBF8FF' }]}>
                <FontAwesomeIcon icon={faUsers} size={20} color="#3182CE" />
              </View>
              <Text style={styles.statNumber}>{data?.totalTransactions || 0}</Text>
              <Text style={styles.statLabel}>Total Customers</Text>
            </View>

            {/* Remaining Customers */}
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF5E7' }]}>
                <FontAwesomeIcon icon={faClockRotateLeft} size={20} color="#F6AD55" />
              </View>
              <Text style={styles.statNumber}>{getRemainingCustomers()}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Collected Customers */}
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
                <FontAwesomeIcon icon={faCheckCircle} size={20} color="#22C55E" />
              </View>
              <Text style={styles.statNumber}>{getCollectedCustomers()}</Text>
              <Text style={styles.statLabel}>Collected</Text>
            </View>

            {/* Collection Rate */}
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
                <FontAwesomeIcon icon={faChartLine} size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statNumber}>
                {data?.totalTransactions ? Math.round((getCollectedCustomers() / data.totalTransactions) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6739B7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6739B7',
    fontWeight: '600',
    fontFamily: 'DMSans-Regular',
  },
  header: {
    backgroundColor: '#6739B7',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    fontFamily: 'DMSans-Regular',
  },
  bankInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    fontFamily: 'DMSans-Regular',
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    fontFamily: 'DMSans-Regular',
  },
  bankLogoContainer: {
    marginRight: 12,
  },
  bankLogo: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  bankDetails: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'DMSans-Regular',
  },
  bankCode: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'DMSans-Regular',
  },
  notificationButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontFamily: 'DMSans-Regular',
  },
  agentAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'DMSans-Regular',
  },
  agentNumber: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'DMSans-Regular',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  collectionCard: {
    margin: 20,
    marginTop: 30,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#6739B7',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    fontFamily: 'DMSans-Regular',
  },
  collectionAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#6739B7',
    marginBottom: 8,
    fontFamily: 'DMSans-Regular',
  },
  collectionSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    fontFamily: 'DMSans-Regular',
  },
  collectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6739B7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    borderWidth: 1,
    borderColor: '#6739B7',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'DMSans-Regular',
  },
  secondaryButtonText: {
    color: '#6739B7',
    fontFamily: 'DMSans-Regular',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
  },
});

export default HomeScreen;