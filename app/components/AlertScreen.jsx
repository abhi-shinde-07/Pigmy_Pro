import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const AlertScreen = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', title: 'All', count: 0 },
    { id: 'unread', title: 'Unread', count: 0 },
    { id: 'transaction', title: 'Transactions', count: 0 },
  ];

  return (
    <SafeAreaView style={styles.container}>
     <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>       
        <Text style={styles.headerTitle}>Alerts</Text>   
      </View>
      {/* Under Construction Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.constructionContainer}>
          <View style={styles.constructionIcon}>
            <Text style={styles.constructionEmoji}>🚧</Text>
          </View>
          
          <Text style={styles.constructionTitle}>Under Construction</Text>
          <Text style={styles.constructionSubtitle}>We're working hard to bring you something amazing!</Text>
          
        </View>
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
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'DMSans-Bold',
  },
  markAllButton: {
    padding: 4,
    opacity: 0.6,
  },
  markAllText: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '500',
  },
  tabsContainer: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  constructionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  constructionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  constructionEmoji: {
    fontSize: 48,
  },
  constructionTitle: {
    fontSize: 28,
    color: '#6B46C1',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
  },
  constructionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontFamily: 'DMSans-Medium',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '600',
  },
  notifyButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#6B46C1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  notifyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AlertScreen;