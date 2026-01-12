import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { RealAIService } from '../services/RealAIService';

interface UserProfileScreenProps {
  navigation: any;
  route: {
    params: {
      userId: string;
    };
  };
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await RealAIService.getUserProfile(userId);
      
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setError('Failed to load user profile');
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = () => {
    Alert.alert(
      'Send Friend Request',
      `Send a friend request to ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Coming Soon', 'Friend request feature will be available soon!');
          }
        }
      ]
    );
  };

  const handleMessageUser = () => {
    Alert.alert('Coming Soon', 'Direct messaging feature will be available soon!');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'User not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Parse data safely
  const subjects = Array.isArray(user.subjects) 
    ? user.subjects 
    : (user.subjects ? JSON.parse(user.subjects) : []);
  
  const schedule = typeof user.schedule === 'object' 
    ? user.schedule 
    : (user.schedule ? JSON.parse(user.schedule) : {});

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{user.name || 'Unknown'}</Text>
          <Text style={styles.email}>{user.email || ''}</Text>
          
          {user.major && (
            <View style={styles.majorBadge}>
              <Text style={styles.majorText}>{user.major}</Text>
            </View>
          )}

          {user.year && (
            <Text style={styles.yearText}>{user.year}</Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSendFriendRequest}
            >
              <Text style={styles.actionButtonText}>👋 Add Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary]} 
              onPress={handleMessageUser}
            >
              <Text style={styles.actionButtonTextSecondary}>💬 Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subjects */}
        {subjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <View style={styles.tagContainer}>
              {subjects.map((subject: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{subject}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Learning Style */}
        {user.learning_style && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Style</Text>
            <Text style={styles.infoText}>{user.learning_style}</Text>
          </View>
        )}

        {/* Availability */}
        {Object.keys(schedule).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            {Object.entries(schedule).map(([day, times]: [string, any]) => {
              if (!times || (Array.isArray(times) && times.length === 0)) return null;
              return (
                <View key={day} style={styles.scheduleRow}>
                  <Text style={styles.scheduleDay}>{day}</Text>
                  <Text style={styles.scheduleTime}>
                    {Array.isArray(times) ? times.join(', ') : times}
                  </Text>
                </View>
              );
            })}
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
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  
  backButton: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: '600',
  } as TextStyle,
  
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  } as TextStyle,
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as ViewStyle,
  
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  } as TextStyle,
  
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  } as ViewStyle,
  
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  
  content: {
    flex: 1,
  } as ViewStyle,
  
  profileCard: {
    backgroundColor: theme.colors.white,
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    ...theme.shadows.medium,
  } as ViewStyle,
  
  avatarContainer: {
    marginBottom: 16,
  } as ViewStyle,
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  } as TextStyle,
  
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  } as TextStyle,
  
  majorBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  } as ViewStyle,
  
  majorText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  } as TextStyle,
  
  yearText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  } as TextStyle,
  
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  } as ViewStyle,
  
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  } as ViewStyle,
  
  actionButtonSecondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  
  actionButtonTextSecondary: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  
  section: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    ...theme.shadows.small,
  } as ViewStyle,
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  } as TextStyle,
  
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,
  
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,
  
  tag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  } as ViewStyle,
  
  tagText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  } as TextStyle,
  
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  
  scheduleDay: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  } as TextStyle,
  
  scheduleTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  } as TextStyle,
  
  bottomPadding: {
    height: 32,
  } as ViewStyle,
});
