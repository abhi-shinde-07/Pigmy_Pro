import { useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Animated,
  Dimensions,
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
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState([
    'Transfer to John',
    'Bill Payment',
    'Account Balance',
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);

  const filters = [
    { id: 'all', title: 'All', icon: '🔍', count: 5 },
    { id: 'transactions', title: 'Transactions', icon: '💸', count: 2 },
    { id: 'contacts', title: 'Contacts', icon: '👥', count: 2 },
    { id: 'services', title: 'Services', icon: '⚙️', count: 1 },
  ];

  const searchResults = [
    {
      id: 1,
      type: 'transaction',
      title: 'Transfer to Sarah Wilson',
      subtitle: 'July 28, 2025 • ₹1,500',
      icon: '💸',
      category: 'Transfer',
      amount: '₹1,500',
      status: 'completed',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'contact',
      title: 'John Smith',
      subtitle: 'john.smith@email.com',
      icon: '👤',
      phone: '+91 98765 43210',
      lastTransaction: '₹500 • 3 days ago',
    },
    {
      id: 3,
      type: 'service',
      title: 'Bill Payment',
      subtitle: 'Pay utility bills quickly',
      icon: '📄',
      description: 'Electricity, Water, Gas payments',
    },
    {
      id: 4,
      type: 'transaction',
      title: 'ATM Withdrawal',
      subtitle: 'July 27, 2025 • ₹2,000',
      icon: '🏧',
      category: 'Withdrawal',
      amount: '₹2,000',
      status: 'completed',
      time: '1 day ago',
      location: 'HDFC ATM, MG Road',
    },
    {
      id: 5,
      type: 'contact',
      title: 'Maria Garcia',
      subtitle: 'maria.garcia@email.com',
      icon: '👤',
      phone: '+91 87654 32109',
      lastTransaction: '₹1,200 • 1 week ago',
    },
  ];

  const quickSearches = [
    { text: 'Recent Transactions', icon: '🕒', popular: true },
    { text: 'Account Balance', icon: '💰', popular: true },
    { text: 'Transfer Money', icon: '💸', popular: false },
    { text: 'Bill Payments', icon: '📄', popular: true },
    { text: 'Loan Status', icon: '🏦', popular: false },
    { text: 'Card Details', icon: '💳', popular: false },
  ];

  const trendingSearches = [
    'UPI payments',
    'Credit card statement',
    'Mutual funds',
    'Fixed deposits',
  ];

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

  const filteredResults = useMemo(() => {
    return searchResults.filter(result => {
      const matchesQuery = searchQuery === '' || 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (result.category && result.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'transactions' && result.type === 'transaction') ||
        (selectedFilter === 'contacts' && result.type === 'contact') ||
        (selectedFilter === 'services' && result.type === 'service');
      
      return matchesQuery && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    addToSearchHistory(query);
  };

  const handleSearch = (query) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      addToSearchHistory(query.trim());
    }
  };

  const addToSearchHistory = (query) => {
    setSearchHistory(prev => [query, ...prev.filter(item => item !== query)].slice(0, 5));
  };

  const removeRecentSearch = (index) => {
    setRecentSearches(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  const getFilterCount = (filterId) => {
    if (filterId === 'all') return filteredResults.length;
    return filteredResults.filter(result => 
      (filterId === 'transactions' && result.type === 'transaction') ||
      (filterId === 'contacts' && result.type === 'contact') ||
      (filterId === 'services' && result.type === 'service')
    ).length;
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'transaction': return '#10B981';
      case 'contact': return '#3B82F6';
      case 'service': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B98130';
      case 'pending': return '#F59E0B30';
      case 'failed': return '#EF444430';
      default: return '#6B728030';
    }
  };

  const renderResultItem = (result) => {
    const isTransaction = result.type === 'transaction';
    const isContact = result.type === 'contact';
    
    return (
      <TouchableOpacity key={result.id} style={styles.resultItem}>
        <View style={[styles.resultIcon, { backgroundColor: getIconColor(result.type) }]}>
          <Text style={styles.resultIconText}>{result.icon}</Text>
        </View>
        <View style={styles.resultContent}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{result.title}</Text>
            {isTransaction && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) }]}>
                <Text style={styles.statusText}>{result.status}</Text>
              </View>
            )}
          </View>
          <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
          {isTransaction && result.location && (
            <Text style={styles.resultLocation}>📍 {result.location}</Text>
          )}
          {isContact && result.lastTransaction && (
            <Text style={styles.lastTransaction}>Last: {result.lastTransaction}</Text>
          )}
        </View>
        <Text style={styles.resultChevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search transactions, contacts, services..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            autoCorrect={false}
            returnKeyType="search"
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : searchQuery.length > 0 ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => {
          const count = searchQuery.length > 0 ? getFilterCount(filter.id) : filter.count;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.title}
              </Text>
              {count > 0 && (
                <View style={[
                  styles.countBadge,
                  selectedFilter === filter.id && styles.countBadgeActive
                ]}>
                  <Text style={[
                    styles.countText,
                    selectedFilter === filter.id && styles.countTextActive
                  ]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery === '' ? (
          <>
            {/* Quick Actions Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {quickSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickActionCard}
                    onPress={() => handleQuickSearch(search.text)}
                  >
                    <View style={styles.quickActionIconContainer}>
                      <Text style={styles.quickActionIcon}>{search.icon}</Text>
                    </View>
                    <Text style={styles.quickActionText}>{search.text}</Text>
                    {search.popular && (
                      <View style={styles.popularDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Trending Pills */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.trendingScrollView}
                contentContainerStyle={styles.trendingScrollContent}
              >
                {trendingSearches.map((trend, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.trendingPill}
                    onPress={() => handleQuickSearch(trend)}
                  >
                    <Text style={styles.trendingText}>{trend}</Text>
                    <View style={styles.trendingIndicator}>
                      <Text style={styles.trendingArrow}>↗</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recent Searches List */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent</Text>
                  <TouchableOpacity onPress={clearAllRecentSearches}>
                    <Text style={styles.clearAllText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentList}>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.recentItem}
                      onPress={() => handleQuickSearch(search)}
                    >
                      <View style={styles.recentIconContainer}>
                        <Text style={styles.recentIcon}>🕒</Text>
                      </View>
                      <Text style={styles.recentText}>{search}</Text>
                      <TouchableOpacity 
                        style={styles.removeRecentButton}
                        onPress={() => removeRecentSearch(index)}
                      >
                        <Text style={styles.removeRecentText}>×</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          // Search Results
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>
              Search Results ({filteredResults.length})
            </Text>
            {filteredResults.length > 0 ? (
              <View style={styles.resultsContainer}>
                {filteredResults.map(renderResultItem)}
              </View>
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsTitle}>No Results Found</Text>
                <Text style={styles.noResultsSubtitle}>
                  Try adjusting your search or filters
                </Text>
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={() => setSelectedFilter('all')}
                >
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filtersContent: {
    paddingRight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#8B8B9B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#3f3f5f',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  countBadgeActive: {
    backgroundColor: '#1E40AF',
  },
  countText: {
    fontSize: 12,
    color: '#8B8B9B',
    fontWeight: '600',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  clearAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickActionCard: {
    width: (width - 64) / 2, // 2 cards per row with margins
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    position: 'relative',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  popularDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  
  trendingScrollView: {
    marginHorizontal: -20,
  },
  trendingScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  trendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#3f3f5f',
  },
  trendingText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    marginRight: 6,
  },
  trendingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingArrow: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  recentList: {
    gap: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  recentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentIcon: {
    fontSize: 14,
  },
  recentText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  removeRecentButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3f3f5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeRecentText: {
    color: '#8B8B9B',
    fontSize: 16,
    fontWeight: '300',
  },
  resultsContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f5f',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultIconText: {
    fontSize: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  resultTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#8B8B9B',
    marginBottom: 2,
  },
  resultLocation: {
    fontSize: 11,
    color: '#6B7280',
  },
  lastTransaction: {
    fontSize: 11,
    color: '#6B7280',
  },
  resultChevron: {
    fontSize: 16,
    color: '#6B7280',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#8B8B9B',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFiltersButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
    recentSearchContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f5f',
  },
  recentSearchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
});

export default SearchScreen;