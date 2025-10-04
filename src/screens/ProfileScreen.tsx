// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  ViewStyle,
  TextStyle,
  Alert,
} from 'react-native';
import { theme } from '../styles/theme';
import { StorageService } from '../services/StorageService';
import { StudentProfile } from '../types/Profile';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

interface ProfileScreenProps {
  navigation: any;
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const getPerformanceLabel = (level: number): string => {
  const labels = ['Struggling', 'Below Average', 'Average', 'Above Average', 'Excellent'];
  return labels[level - 1] || 'Not specified';
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUniversity, setEditUniversity] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editLearningStyle, setEditLearningStyle] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await StorageService.getProfile();
      if (userProfile) {
        setProfile(userProfile);
        setEditName(userProfile.name);
        setEditEmail(userProfile.email);
        setEditUniversity(userProfile.university);
        setEditMajor(userProfile.major);
        setEditYear(userProfile.year);
        setEditLearningStyle(userProfile.learningStyle);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!profile) return;

    try {
      const updatedProfile: StudentProfile = {
        ...profile,
        name: editName,
        email: editEmail,
        university: editUniversity,
        major: editMajor,
        year: editYear,
        learningStyle: editLearningStyle,
      };

      await StorageService.saveProfile(updatedProfile);
      setProfile(updatedProfile);
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete your profile and all app data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAllData();
            navigation.navigate('Welcome');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Profile Found</Text>
          <Text style={styles.emptyText}>Please complete profile setup first.</Text>
          <Button
            title="Setup Profile"
            onPress={() => navigation.navigate('ProfileSetup')}
            style={styles.setupButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.infoCard}>
              <InfoRow label="University" value={profile.university} />
              <InfoRow label="Major" value={profile.major} />
              <InfoRow label="Year" value={profile.year} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Style</Text>
            <View style={styles.infoCard}>
              <Text style={styles.learningStyleText}>
                {profile.learningStyle || 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Study Preferences</Text>
            <View style={styles.infoCard}>
              <Text style={styles.subsectionTitle}>Environments</Text>
              <View style={styles.tagContainer}>
                {profile.studyEnvironments.map((env, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{env}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.subsectionTitle}>Methods</Text>
              <View style={styles.tagContainer}>
                {profile.studyMethods.map((method, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{method}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.subsectionTitle}>Subjects</Text>
              <View style={styles.tagContainer}>
                {profile.subjects.map((subject, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{subject}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Preferences</Text>
            <View style={styles.infoCard}>
              <InfoRow label="Ideal Group Size" value={`${profile.groupPreferences.groupSize} people`} />
              <InfoRow label="Session Duration" value={`${profile.groupPreferences.sessionDuration} hours`} />
              <Text style={styles.subsectionTitle}>Study Goals</Text>
              <View style={styles.tagContainer}>
                {profile.groupPreferences.studyGoals.map((goal, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{goal}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.infoCard}>
              {Object.entries(profile.schedule).map(([day, slots]) => (
                slots.length > 0 && (
                  <View key={day} style={styles.scheduleRow}>
                    <Text style={styles.dayLabel}>{day}</Text>
                    <Text style={styles.slotsText}>{slots.join(', ')}</Text>
                  </View>
                )
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Performance</Text>
            <View style={styles.infoCard}>
              <View style={styles.performanceContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.performanceDot,
                      level <= profile.performanceLevel && styles.performanceDotActive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.performanceLabel}>{getPerformanceLabel(profile.performanceLevel)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingButton} onPress={handleClearData}>
              <Text style={styles.settingButtonTextDanger}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input label="Full Name" value={editName} onChangeText={setEditName} />
            <Input label="Email" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
            <Input label="University" value={editUniversity} onChangeText={setEditUniversity} />
            <Input label="Major" value={editMajor} onChangeText={setEditMajor} />
            <Input label="Year" value={editYear} onChangeText={setEditYear} />
            <Input label="Learning Style" value={editLearningStyle} onChangeText={setEditLearningStyle} multiline />

            <Text style={styles.noteText}>
              Note: To update study preferences, schedules, or subjects, please complete the profile setup again.
            </Text>

            <Button title="Save Changes" onPress={handleSaveChanges} style={styles.saveButton} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background } as ViewStyle,
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.white } as TextStyle,
  editButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  } as ViewStyle,
  editButtonText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 } as TextStyle,
  scrollView: { flex: 1 } as ViewStyle,
  content: { padding: theme.spacing.lg } as ViewStyle,
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  } as ViewStyle,
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  avatarText: { fontSize: 32, fontWeight: 'bold', color: theme.colors.white } as TextStyle,
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  profileEmail: { fontSize: 14, color: theme.colors.textSecondary } as TextStyle,
  section: { marginBottom: theme.spacing.lg } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  } as ViewStyle,
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  infoLabel: { fontSize: 14, color: theme.colors.textSecondary, flex: 1 } as TextStyle,
  infoValue: { fontSize: 14, color: theme.colors.text, fontWeight: '600', flex: 1, textAlign: 'right' } as TextStyle,
  learningStyleText: { fontSize: 14, color: theme.colors.text, lineHeight: 20 } as TextStyle,
  subsectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs } as ViewStyle,
  tag: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  } as ViewStyle,
  tagText: { fontSize: 12, color: theme.colors.primary } as TextStyle,
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  dayLabel: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, width: 100 } as TextStyle,
  slotsText: { fontSize: 13, color: theme.colors.textSecondary, flex: 1, textAlign: 'right' } as TextStyle,
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  performanceDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.border } as ViewStyle,
  performanceDotActive: { backgroundColor: theme.colors.primary } as ViewStyle,
  performanceLabel: { fontSize: 14, color: theme.colors.text, textAlign: 'center', fontWeight: '600' } as TextStyle,
  settingButton: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.danger,
    padding: theme.spacing.md,
    alignItems: 'center',
  } as ViewStyle,
  settingButtonTextDanger: { color: theme.colors.danger, fontSize: 14, fontWeight: 'bold' } as TextStyle,
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  loadingText: { fontSize: 16, color: theme.colors.textSecondary } as TextStyle,
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl } as ViewStyle,
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  setupButton: { paddingHorizontal: theme.spacing.xl } as ViewStyle,
  modalContainer: { flex: 1, backgroundColor: theme.colors.background } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  } as ViewStyle,
  cancelText: { fontSize: 16, color: theme.colors.danger } as TextStyle,
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary } as TextStyle,
  modalContent: { flex: 1, padding: theme.spacing.lg } as ViewStyle,
  noteText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  } as TextStyle,
  saveButton: { marginBottom: theme.spacing.xl } as ViewStyle,
});