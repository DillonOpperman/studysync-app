import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  RefreshControl,
} from 'react-native';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { StorageService } from '../services/StorageService';
import { RealAIService } from '../services/RealAIService';
import { MatchRecommendation } from '../services/MockMatchingService'; // Keep the type



interface DashboardScreenProps {
  navigation: any;
}

const MatchCard: React.FC<{
  group: MatchRecommendation;
  onPress: () => void;
}> = ({ group, onPress }) => (
  <TouchableOpacity style={[styles.matchCard, group.suggested && styles.suggestedCard]} onPress={onPress}>
    <View style={styles.matchHeader}>
      <Text style={styles.matchTitle}>{group.title}</Text>
      {group.matchPercentage ? (
        <View style={styles.matchScore}>
          <Text style={styles.matchScoreText}>{group.matchPercentage}% Match</Text>
        </View>
      ) : (
        <View style={styles.suggestedBadge}>
          <Text style={styles.suggestedText}>Suggested</Text>
        </View>
      )}
    </View>
    
    <View style={styles.matchInfo}>
      <Text style={styles.matchInfoText}>• {group.memberInfo}</Text>
      {group.schedule && <Text style={styles.matchInfoText}>• Meets: {group.schedule}</Text>}
      {group.focus && <Text style={styles.matchInfoText}>• Focus: {group.focus}</Text>}
      {group.location && <Text style={styles.matchInfoText}>• Location: {group.location}</Text>}
    </View>
    
    <View style={styles.compatibilityContainer}>
      <Text style={styles.compatibilityTitle}>Why this match?</Text>
      <Text style={styles.explanationText}>{group.explanation}</Text>
    </View>
    
    <Button
      title={group.action}
      variant={group.suggested ? 'secondary' : 'success'}
      size="small"
      style={styles.matchButton}
      onPress={() => alert(`${group.action}\n\n${group.title}\n\n${group.explanation}\n\n${group.suggested ? 'Ready to start your own study group?' : 'Request sent! You will be notified when the group leader responds.'}`)}
    />
  </TouchableOpacity>
);

const LoadingCard: React.FC = () => (
  <View style={[styles.matchCard, styles.loadingCard]}>
    <View style={styles.loadingHeader}>
      <View style={styles.loadingTitle} />
      <View style={styles.loadingScore} />
    </View>
    <View style={styles.loadingContent}>
      <View style={styles.loadingLine} />
      <View style={styles.loadingLine} />
      <View style={styles.loadingLineShort} />
    </View>
  </View>
);

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>('Student');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      const profile = await StorageService.getProfile();
      if (profile) {
        setUserName(profile.name || 'Student');
        
        // Try to get cached matches first
        const cachedMatches = await StorageService.getMatches();
        if (cachedMatches.length > 0) {
          setMatches(cachedMatches);
          setLoading(false);
        }
        
        // Generate fresh recommendations
        const freshRecommendations = await RealAIService.getRecommendations(profile);
        setMatches(freshRecommendations);
        
        // Cache the fresh matches
        await StorageService.saveMatches(freshRecommendations);
      } else {
        // No profile found, fallback to static data
        const staticMatches = getStaticMatches();
        setMatches(staticMatches);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      setMatches(getStaticMatches());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const getStaticMatches = (): MatchRecommendation[] => {
    return [
      {
        id: 1,
        title: 'Math 220 Study Group',
        matchPercentage: 95,
        memberInfo: '4 members, needs 2 more',
        schedule: 'Mon/Wed 6-8 PM',
        focus: 'Calculus exam prep',
        location: 'Library Study Room B',
        action: 'Request to Join',
        suggested: false,
        explanation: 'High compatibility based on course enrollment and schedule',
        compatibility: { subject: 0.9, schedule: 0.8, learningStyle: 0.7, performance: 0.8 }
      },
      {
        id: 2,
        title: 'CS 101 Project Team',
        matchPercentage: 88,
        memberInfo: '3 members, needs 1 more',
        schedule: 'Tues/Thu 4-6 PM',
        focus: 'Final project',
        location: 'Computer Lab',
        action: 'Request to Join',
        suggested: false,
        explanation: 'Good match for collaborative coding projects',
        compatibility: { subject: 0.8, schedule: 0.7, learningStyle: 0.8, performance: 0.7 }
      },
      {
        id: 3,
        title: 'Create Your Own Group',
        matchPercentage: null,
        memberInfo: 'Based on your activity, you could lead a study group.',
        schedule: 'Several students are looking for group leaders!',
        focus: '',
        location: '',
        action: 'Start Group',
        suggested: true,
        explanation: 'Perfect opportunity to start your own study group',
        compatibility: { subject: 1.0, schedule: 1.0, learningStyle: 1.0, performance: 1.0 }
      }
    ];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Matches</Text>
          <Text style={styles.headerSubtitle}>Hi {userName}!</Text>
        </View>
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationText}>{matches.length}</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {loading ? (
            <>
              <Text style={styles.loadingText}>AI is finding your perfect study matches...</Text>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : matches.length > 0 ? (
            <>
              <Text style={styles.matchesFoundText}>
                Found {matches.length} matches based on your profile
              </Text>
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  group={match}
                  onPress={() => alert(`${match.title}\n\n${match.matchPercentage ? match.matchPercentage + '% Match' : 'Suggested Group'}\n\nDetails:\n• ${match.memberInfo}\n• Schedule: ${match.schedule}\n• Focus: ${match.focus}\n• Location: ${match.location}\n\nTap '${match.action}' to proceed!`)}
                />
              ))}
            </>
          ) : (
            <View style={styles.noMatchesContainer}>
              <Text style={styles.noMatchesTitle}>No matches found yet</Text>
              <Text style={styles.noMatchesText}>
                Complete your profile setup to get personalized study group recommendations
              </Text>
              <Button
                title="Update Profile"
                onPress={() => navigation.navigate('ProfileSetup')}
                style={styles.updateProfileButton}
              />
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.8,
  } as TextStyle,
  notificationBadge: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  notificationText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  content: {
    padding: theme.spacing.lg,
  } as ViewStyle,
  loadingText: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  matchesFoundText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  matchCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  } as ViewStyle,
  suggestedCard: {
    borderColor: theme.colors.secondary,
    backgroundColor: '#fff8e1',
  } as ViewStyle,
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  } as TextStyle,
  matchScore: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  } as ViewStyle,
  matchScoreText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,
  suggestedBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  } as ViewStyle,
  suggestedText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,
  matchInfo: {
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  matchInfoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  } as TextStyle,
  compatibilityContainer: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  compatibilityTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs / 2,
  } as TextStyle,
  explanationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  } as TextStyle,
  matchButton: {
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  loadingCard: {
    opacity: 0.7,
  } as ViewStyle,
  loadingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  loadingTitle: {
    backgroundColor: theme.colors.border,
    height: 16,
    width: '60%',
    borderRadius: 4,
  } as ViewStyle,
  loadingScore: {
    backgroundColor: theme.colors.border,
    height: 16,
    width: '25%',
    borderRadius: 4,
  } as ViewStyle,
  loadingContent: {
    gap: theme.spacing.xs,
  } as ViewStyle,
  loadingLine: {
    backgroundColor: theme.colors.border,
    height: 12,
    width: '100%',
    borderRadius: 4,
  } as ViewStyle,
  loadingLineShort: {
    backgroundColor: theme.colors.border,
    height: 12,
    width: '70%',
    borderRadius: 4,
  } as ViewStyle,
  noMatchesContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  } as ViewStyle,
  noMatchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  noMatchesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  } as TextStyle,
  updateProfileButton: {
    paddingHorizontal: theme.spacing.xl,
  } as ViewStyle,
});