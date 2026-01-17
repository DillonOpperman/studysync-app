// src/screens/ProfileScreen.tsx
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { RealAIService } from '../services/RealAIService';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await RealAIService.getProfile();
      
      if (result.success && result.user) {
        console.log('Profile loaded:', result.user);
        setProfile(result.user);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await RealAIService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (profile) {
      // Convert backend profile format to StudentProfile format
      const studentProfile: any = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        university: profile.university || 'Unknown',
        major: profile.major,
        year: profile.year,
        subjects: Array.isArray(profile.subjects) ? profile.subjects : [],
        learningStyle: profile.learning_style || '',
        studyEnvironments: [],
        studyMethods: [],
        schedule: profile.schedule || {},
        performanceLevel: profile.performance_level || 3,
        groupPreferences: profile.group_preferences || { groupSize: 5, sessionDuration: 2, studyGoals: [] }
      };
      
      navigation.navigate('ProfileEdit', { profile: studentProfile });
    }
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

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Profile not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Parse data safely
  const subjects = Array.isArray(profile.subjects) 
    ? profile.subjects 
    : (profile.subjects ? JSON.parse(profile.subjects) : []);
  
  const schedule = typeof profile.schedule === 'object' 
    ? profile.schedule 
    : (profile.schedule ? JSON.parse(profile.schedule) : {});
  
  const preferences = typeof profile.group_preferences === 'object'
    ? profile.group_preferences
    : (profile.group_preferences ? JSON.parse(profile.group_preferences) : {});

  const studyPreferences = typeof profile.studyPreferences === 'object'
    ? profile.studyPreferences
    : (profile.studyPreferences ? JSON.parse(profile.studyPreferences) : {});

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{profile.name || 'Unknown'}</Text>
          <Text style={styles.email}>{profile.email || ''}</Text>
          
          {profile.major && (
            <View style={styles.majorBadge}>
              <Text style={styles.majorText}>{profile.major}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Academic Info */}
        {profile.major && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Major:</Text>
              <Text style={styles.infoValue}>{profile.major}</Text>
            </View>
            {profile.year && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Year:</Text>
                <Text style={styles.infoValue}>{profile.year}</Text>
              </View>
            )}
          </View>
        )}

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

        {/* Schedule */}
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

        {/* Study Preferences */}
        {(Object.keys(preferences).length > 0 || Object.keys(studyPreferences).length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Study Preferences</Text>
            
            {preferences.groupSize && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Preferred Group Size:</Text>
                <Text style={styles.infoValue}>{preferences.groupSize}</Text>
              </View>
            )}
            
            {studyPreferences.learningStyle && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Learning Style:</Text>
                <Text style={styles.infoValue}>{studyPreferences.learningStyle}</Text>
              </View>
            )}
            
            {studyPreferences.sessionDuration && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Session Duration:</Text>
                <Text style={styles.infoValue}>{studyPreferences.sessionDuration}</Text>
              </View>
            )}
          </View>
        )}

        {/* Friends Button */}
        <TouchableOpacity 
          style={styles.friendsButton}
          onPress={() => navigation.navigate('FriendsList')}
        >
          <Text style={styles.friendsButtonText}>Friends</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

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
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  } as TextStyle,
  
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
  } as ViewStyle,
  
  logoutButtonText: {
    color: theme.colors.white,
    fontSize: 14,
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
    marginBottom: 16,
  } as ViewStyle,
  
  majorText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  } as TextStyle,
  
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  } as ViewStyle,
  
  editButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
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
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  } as TextStyle,
  
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
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
    color: theme.colors.text,
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
  
  friendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  } as ViewStyle,
  
  friendsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  } as TextStyle,
  
  arrow: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: 'bold',
  } as TextStyle,
  
  bottomPadding: {
    height: 32,
  } as ViewStyle,
});