// src/screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { RealAIService } from '../services/RealAIService';
import { MatchRecommendation } from '../types/Matching';

interface SearchScreenProps {
  navigation: any;
}

type SearchMode = 'groups' | 'people';

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchMode, setSearchMode] = useState<SearchMode>('groups');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      if (searchMode === 'groups') {
        // Search for groups
        const groupResults = await RealAIService.searchGroups(query);
        setResults(groupResults);
      } else {
        // Search for people
        const peopleResults = await RealAIService.searchPeople(query);
        setResults(peopleResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: any) => {
    if (searchMode === 'groups') {
      // Navigate to group info
      navigation.navigate('GroupInfo', {
        group: {
          group: {
            id: result.id,
            title: result.title,
            subject: result.focus,
            description: result.explanation,
            schedule: result.schedule,
            location: result.location,
            maxMembers: result.maxMembers || 6,
            currentMembers: result.currentMembers || 1,
            members: result.members || [],
            leader: result.leaderName || 'Unknown',
            createdAt: new Date().toISOString(),
            meetingTimes: []
          },
          joinedAt: new Date().toISOString(),
          status: 'pending'
        }
      });
    } else {
      // Navigate to user profile
      navigation.navigate('UserProfile', { userId: result.id });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Mode Switcher */}
      <View style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            searchMode === 'groups' && styles.modeButtonActive
          ]}
          onPress={() => {
            setSearchMode('groups');
            setResults([]);
            setHasSearched(false);
          }}
        >
          <Text style={[
            styles.modeButtonText,
            searchMode === 'groups' && styles.modeButtonTextActive
          ]}>
            Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            searchMode === 'people' && styles.modeButtonActive
          ]}
          onPress={() => {
            setSearchMode('people');
            setResults([]);
            setHasSearched(false);
          }}
        >
          <Text style={[
            styles.modeButtonText,
            searchMode === 'people' && styles.modeButtonTextActive
          ]}>
            People
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={
            searchMode === 'groups'
              ? 'Search for study groups...'
              : 'Search for people by name...'
          }
          placeholderTextColor={theme.colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : hasSearched && results.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>
              {searchMode === 'groups'
                ? `No study groups found matching "${query}"`
                : `No people found matching "${query}"`}
            </Text>
          </View>
        ) : results.length > 0 ? (
          <>
            <Text style={styles.resultsHeader}>
              {results.length} {searchMode === 'groups' ? 'Groups' : 'People'} Found
            </Text>
            {results.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.resultCard}
                onPress={() => handleResultPress(result)}
              >
                {searchMode === 'groups' ? (
                  // Group Card
                  <>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultTitle}>{result.title}</Text>
                      {result.matchPercentage && (
                        <View style={styles.matchBadge}>
                          <Text style={styles.matchText}>
                            {result.matchPercentage}% Match
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.resultSubject}>{result.focus}</Text>
                    <Text style={styles.resultInfo}>Members: {result.memberInfo}</Text>
                    <Text style={styles.resultInfo}>Schedule: {result.schedule}</Text>
                    <Text style={styles.resultInfo}>Location: {result.location}</Text>
                    <Text style={styles.resultDescription} numberOfLines={2}>
                      {result.explanation}
                    </Text>
                  </>
                ) : (
                  // Person Card
                  <>
                    <View style={styles.personHeader}>
                      <View style={styles.personAvatar}>
                        <Text style={styles.personAvatarText}>
                          {result.name?.charAt(0).toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{result.name}</Text>
                        <Text style={styles.personMajor}>{result.major}</Text>
                        <Text style={styles.personYear}>{result.year}</Text>
                      </View>
                      {result.matchPercentage && (
                        <View style={styles.matchBadge}>
                          <Text style={styles.matchText}>
                            {result.matchPercentage}%
                          </Text>
                        </View>
                      )}
                    </View>
                    {result.subjects && result.subjects.length > 0 && (
                      <View style={styles.subjectsContainer}>
                        {result.subjects.slice(0, 3).map((subject: string, index: number) => (
                          <View key={index} style={styles.subjectTag}>
                            <Text style={styles.subjectTagText}>{subject}</Text>
                          </View>
                        ))}
                        {result.subjects.length > 3 && (
                          <Text style={styles.moreSubjects}>
                            +{result.subjects.length - 3} more
                          </Text>
                        )}
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.instructionsTitle}>
              {searchMode === 'groups' ? 'Find Study Groups' : 'Find Study Partners'}
            </Text>
            <Text style={styles.instructionsText}>
              {searchMode === 'groups'
                ? 'Search by subject, course name, or topic to find study groups that match your interests.'
                : 'Search by name to find other students and view their profiles.'}
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
  } as ViewStyle,
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  } as ViewStyle,
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: 4,
    margin: 16,
    borderRadius: 8,
    gap: 4,
  } as ViewStyle,
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  } as ViewStyle,
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  } as TextStyle,
  modeButtonTextActive: {
    color: theme.colors.white,
  } as TextStyle,
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.border,
  } as ViewStyle,
  searchButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  } as TextStyle,
  results: {
    flex: 1,
    paddingHorizontal: 16,
  } as ViewStyle,
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  } as ViewStyle,
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  } as TextStyle,
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  } as TextStyle,
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  } as TextStyle,
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  } as TextStyle,
  instructionsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  } as TextStyle,
  resultsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  } as TextStyle,
  resultCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  } as ViewStyle,
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
    marginRight: 8,
  } as TextStyle,
  matchBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  } as ViewStyle,
  matchText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,
  resultSubject: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  } as TextStyle,
  resultInfo: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  } as TextStyle,
  resultDescription: {
    fontSize: 13,
    color: theme.colors.text,
    marginTop: 8,
  } as TextStyle,
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,
  personAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  personAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  personInfo: {
    flex: 1,
  } as ViewStyle,
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  } as TextStyle,
  personMajor: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  } as TextStyle,
  personYear: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  } as TextStyle,
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  } as ViewStyle,
  subjectTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  } as ViewStyle,
  subjectTagText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '500',
  } as TextStyle,
  moreSubjects: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  } as TextStyle,
});
