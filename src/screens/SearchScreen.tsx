// src/screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../styles/theme';
import { RealAIService } from '../services/RealAIService';
import { MatchRecommendation } from '../types/Matching';
import { Button } from '../components/Button';

interface SearchScreenProps {
  navigation: any;
}

const POPULAR_SUBJECTS = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Business',
  'Psychology',
  'Engineering',
];

const SearchResultCard: React.FC<{
  result: MatchRecommendation;
  onPress: () => void;
}> = ({ result, onPress }) => (
  <TouchableOpacity style={styles.resultCard} onPress={onPress}>
    <View style={styles.resultHeader}>
      <Text style={styles.resultTitle}>{result.title}</Text>
      {result.matchPercentage && (
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>{result.matchPercentage}%</Text>
        </View>
      )}
    </View>
    
    <View style={styles.resultInfo}>
      {result.memberInfo && (
        <Text style={styles.resultText}>• {result.memberInfo}</Text>
      )}
      {result.schedule && (
        <Text style={styles.resultText}>• {result.schedule}</Text>
      )}
      {result.focus && (
        <Text style={styles.resultText}>• Focus: {result.focus}</Text>
      )}
    </View>

    <Button
      title="View Details"
      size="small"
      variant="primary"
      onPress={onPress}
      style={styles.viewButton}
    />
  </TouchableOpacity>
);

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'people'>('groups');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const searchResults = await RealAIService.searchGroups(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (subject: string) => {
    setQuery(subject);
    setHasSearched(true);
    handleSearchWithQuery(subject);
  };

  const handleSearchWithQuery = async (searchQuery: string) => {
    setLoading(true);

    try {
      const searchResults = await RealAIService.searchGroups(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: MatchRecommendation) => {
    navigation.navigate('GroupDetails', { groupId: result.id.toString() });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, topics, or subjects..."
            placeholderTextColor={theme.colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
            disabled={loading || !query.trim()}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
            onPress={() => setActiveTab('groups')}
          >
            <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
              Groups
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'people' && styles.tabActive]}
            onPress={() => setActiveTab('people')}
          >
            <Text style={[styles.tabText, activeTab === 'people' && styles.tabTextActive]}>
              People
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Searching with AI...</Text>
          </View>
        ) : hasSearched ? (
          results.length > 0 ? (
            <>
              <Text style={styles.resultsCount}>
                Found {results.length} {activeTab === 'groups' ? 'groups' : 'people'}
              </Text>
              {results.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  onPress={() => handleResultPress(result)}
                />
              ))}
            </>
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsTitle}>No results found</Text>
              <Text style={styles.noResultsText}>
                Try searching for different subjects or topics
              </Text>
            </View>
          )
        ) : (
          <View style={styles.discoverContainer}>
            <Text style={styles.discoverTitle}>Popular Subjects</Text>
            <Text style={styles.discoverSubtitle}>
              Tap to find study groups
            </Text>
            <View style={styles.subjectGrid}>
              {POPULAR_SUBJECTS.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={styles.subjectTag}
                  onPress={() => handleQuickSearch(subject)}
                >
                  <Text style={styles.subjectText}>{subject}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Search Tips</Text>
              <Text style={styles.tipsText}>
                • Search by course code (e.g., "CS 101", "Math 220"){'\n'}
                • Search by subject (e.g., "Calculus", "Psychology"){'\n'}
                • Search by topic (e.g., "algorithms", "organic chemistry"){'\n'}
                • Our AI will find the best semantic matches!
              </Text>
            </View>
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
  } as ViewStyle,
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  searchContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.border,
  } as ViewStyle,
  searchButton: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  searchButtonText: {
    fontSize: 18,
  } as TextStyle,
  tabContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  } as ViewStyle,
  tab: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  } as ViewStyle,
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  } as TextStyle,
  tabTextActive: {
    color: theme.colors.white,
  } as TextStyle,
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  } as ViewStyle,
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  } as ViewStyle,
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textSecondary,
  } as TextStyle,
  resultsCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  resultCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.light,
  } as ViewStyle,
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  } as TextStyle,
  matchBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  } as ViewStyle,
  matchBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,
  resultInfo: {
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  resultText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  } as TextStyle,
  viewButton: {
    marginTop: theme.spacing.xs,
  } as ViewStyle,
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  } as ViewStyle,
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  noResultsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  discoverContainer: {
    paddingVertical: theme.spacing.md,
  } as ViewStyle,
  discoverTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  discoverSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  subjectTag: {
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    minWidth: '45%',
  } as ViewStyle,
  subjectText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  } as TextStyle,
  tipsContainer: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  } as ViewStyle,
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  tipsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  } as TextStyle,
});