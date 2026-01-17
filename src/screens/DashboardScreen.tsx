import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { NotificationBell } from '../components/NotificationBell';
import { theme } from '../styles/theme';
import { StorageService } from '../services/StorageService';
import { RealAIService } from '../services/RealAIService';
import { MatchRecommendation } from '../types/Matching'; // FIXED: Import from correct location

interface DashboardScreenProps {
  navigation: any;
}

const MatchCard: React.FC<{
  group: MatchRecommendation;
  onPress: () => void;
  onActionPress: () => void;
}> = ({ group, onPress, onActionPress }) => (
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
      {group.schedule && <Text style={styles.matchInfoText}>• {group.schedule}</Text>}
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
      onPress={onActionPress}
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
        
        // Generate fresh recommendations from backend
        const freshRecommendations = await RealAIService.getRecommendations(profile);
        
        console.log('Recommendations received:', freshRecommendations); // Debug log
        
        if (freshRecommendations && freshRecommendations.length > 0) {
          setMatches(freshRecommendations);
          await StorageService.saveMatches(freshRecommendations);
        } else {
          // No matches from backend - show create group option only
          setMatches(getCreateGroupSuggestion(profile));
        }
      } else {
        // No profile found
        setMatches([]);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      // On error, suggest creating a group
      const profile = await StorageService.getProfile();
      if (profile) {
        setMatches(getCreateGroupSuggestion(profile));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const getCreateGroupSuggestion = (profile: any): MatchRecommendation[] => {
    return [
      {
        id: 1,
        title: 'Create Your Own Study Group',
        matchPercentage: null,
        memberInfo: 'No existing groups match your profile yet.',
        schedule: 'Set your own schedule and location',
        focus: profile.subjects?.join(', ') || 'Your subjects',
        location: 'Choose your preferred study location',
        action: 'Start Group',
        suggested: true,
        explanation: `Be the first to start a ${profile.major || 'study'} group! Other students with similar interests are looking for groups to join.`,
        compatibility: { subject: 1.0, schedule: 1.0, learningStyle: 1.0, performance: 1.0 }
      }
    ];
  };

  const handleMatchAction = async (match: MatchRecommendation) => {
    if (match.suggested) {
      // Navigate to MyGroups and open create modal
      navigation.navigate('MyGroups', { openCreateModal: true });
    } else {
      // Send join request
      try {
        const response = await RealAIService.requestJoinGroup(match.id.toString());
        if (response.success) {
          Alert.alert('Request Sent!', response.message || 'Your join request has been sent to the group leader.');
        } else {
          Alert.alert('Error', response.error || 'Failed to send join request');
        }
      } catch (error) {
        console.error('Join request error:', error);
        Alert.alert('Error', 'Unable to send join request. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Matches</Text>
          <Text style={styles.headerSubtitle}>Hi {userName}!</Text>
        </View>
        <NotificationBell navigation={navigation} />
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
                {matches.filter(m => !m.suggested).length > 0 
                  ? `Found ${matches.filter(m => !m.suggested).length} compatible study groups` 
                  : 'Ready to create your first study group?'}
              </Text>
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  group={match}
                  onPress={() => {
                    const details = match.matchPercentage 
                      ? `${match.title}\n\n${match.matchPercentage}% Match\n\nDetails:\n• ${match.memberInfo}\n• Schedule: ${match.schedule}\n• Focus: ${match.focus}\n• Location: ${match.location}\n\n${match.explanation}`
                      : `${match.title}\n\n${match.explanation}\n\n• ${match.memberInfo}\n• ${match.schedule}\n• Subjects: ${match.focus}`;
                    alert(details);
                  }}
                  onActionPress={() => handleMatchAction(match)}
                />
              ))}
            </>
          ) : (
            <View style={styles.noMatchesContainer}>
              <Text style={styles.noMatchesTitle}>No profile found</Text>
              <Text style={styles.noMatchesText}>
                Complete your profile setup to get personalized study group recommendations
              </Text>
              <Button
                title="Setup Profile"
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