// src/screens/ProfileEditScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { Input } from '../components/Input';
import { StudentProfile } from '../types/Profile';
import { StorageService } from '../services/StorageService';

interface ProfileEditScreenProps {
  navigation: any;
  route: {
    params: {
      profile: StudentProfile;
    };
  };
}

const SUBJECT_OPTIONS = [
  'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 
  'Biology', 'English', 'History', 'Psychology', 'Business',
  'Engineering', 'Art', 'Music', 'Economics'
];

const LEARNING_STYLES = [
  'Visual (diagrams, charts)',
  'Auditory (lectures, discussions)',
  'Reading/Writing (notes, textbooks)',
  'Kinesthetic (hands-on, practice)',
  'Group study',
  'Solo study'
];

const YEAR_OPTIONS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const GROUP_SIZE_OPTIONS = ['2-3', '4-5', '6+'];

export const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ navigation, route }) => {
  const originalProfile = route.params.profile;
  
  const [name, setName] = useState(originalProfile.name);
  const [major, setMajor] = useState(originalProfile.major);
  const [year, setYear] = useState(originalProfile.year);
  const [subjects, setSubjects] = useState<string[]>(originalProfile.subjects || []);
  const [learningStyle, setLearningStyle] = useState(originalProfile.learningStyle || '');
  const [preferredGroupSize, setPreferredGroupSize] = useState<string>(
    originalProfile.groupPreferences?.groupSize
      ? originalProfile.groupPreferences.groupSize >= 6
        ? '6+'
        : originalProfile.groupPreferences.groupSize >= 4
        ? '4-5'
        : '2-3'
      : '2-3'
  );
  const [loading, setLoading] = useState(false);

  const toggleSubject = (subject: string) => {
    if (subjects.includes(subject)) {
      setSubjects(subjects.filter(s => s !== subject));
    } else {
      setSubjects([...subjects, subject]);
    }
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return 'Please enter your name';
    if (!major.trim()) return 'Please enter your major';
    if (!year) return 'Please select your year';
    if (subjects.length === 0) return 'Please select at least one subject';
    if (!learningStyle.trim()) return 'Please select a learning style';
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Missing Information', validationError);
      return;
    }

    setLoading(true);

    try {
      const groupSizeNumber = preferredGroupSize === '6+' ? 6 : preferredGroupSize === '4-5' ? 5 : 3;

      const updatedProfile: StudentProfile = {
        ...originalProfile,
        name,
        major,
        year,
        subjects,
        learningStyle,
        groupPreferences: {
          ...(originalProfile.groupPreferences || { groupSize: 3, sessionDuration: 2, studyGoals: [] }),
          groupSize: groupSizeNumber,
        },
      };

      // Save locally
      await StorageService.saveProfile(updatedProfile);

      // TODO: Update on backend if you have an update endpoint
      // await RealAIService.updateProfile(updatedProfile);

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.headerButton}
          disabled={loading}
        >
          <Text style={[styles.headerButtonText, styles.saveText]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Name</Text>
          <Input
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <Text style={styles.label}>Major</Text>
          <Input
            placeholder="Major"
            value={major}
            onChangeText={setMajor}
            editable={!loading}
          />

          <Text style={styles.label}>Academic Year</Text>
          <View style={styles.optionsGrid}>
            {YEAR_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  year === option && styles.optionButtonActive,
                ]}
                onPress={() => setYear(option)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionText,
                    year === option && styles.optionTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects (Select all that apply)</Text>
          <View style={styles.optionsGrid}>
            {SUBJECT_OPTIONS.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.optionButton,
                  subjects.includes(subject) && styles.optionButtonActive,
                ]}
                onPress={() => toggleSubject(subject)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionText,
                    subjects.includes(subject) && styles.optionTextActive,
                  ]}
                >
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Learning Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Style</Text>
          <View style={styles.optionsColumn}>
            {LEARNING_STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.optionButtonFull,
                  learningStyle === style && styles.optionButtonActive,
                ]}
                onPress={() => setLearningStyle(style)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionText,
                    learningStyle === style && styles.optionTextActive,
                  ]}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Group Size Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Group Size</Text>
          <View style={styles.optionsGrid}>
            {GROUP_SIZE_OPTIONS.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  preferredGroupSize === size && styles.optionButtonActive,
                ]}
                onPress={() => setPreferredGroupSize(size)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionText,
                    preferredGroupSize === size && styles.optionTextActive,
                  ]}
                >
                  {size} people
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  } as ViewStyle,
  headerButton: {
    padding: 8,
    minWidth: 70,
  } as ViewStyle,
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  } as TextStyle,
  saveText: {
    fontWeight: 'bold',
    textAlign: 'right',
  } as TextStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  } as TextStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  } as TextStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 8,
  } as TextStyle,
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,
  optionsColumn: {
    gap: 8,
  } as ViewStyle,
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    minWidth: '30%',
  } as ViewStyle,
  optionButtonFull: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  } as ViewStyle,
  optionButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  optionText: {
    fontSize: 13,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '500',
  } as TextStyle,
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  } as TextStyle,
  bottomPadding: {
    height: 40,
  } as ViewStyle,
});