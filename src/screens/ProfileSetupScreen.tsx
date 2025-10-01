import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { RootStackNavigationProp } from '../navigation/AppNavigator';
import { StudentProfile } from '../types/Profile';
import { StorageService } from '../services/StorageService';
import { RealAIService } from '../services/RealAIService';

// Import step components
import { BasicInfoStep } from '../components/ProfileSteps/BasicInfoStep';
import { LearningStyleStep } from '../components/ProfileSteps/LearningStyleStep';
import { ScheduleStep } from '../components/ProfileSteps/ScheduleStep';
import { PreferencesStep } from '../components/ProfileSteps/PreferencesStep';

interface ProfileSetupScreenProps {
  navigation: RootStackNavigationProp<'ProfileSetup'>;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<StudentProfile>>({
    name: '',
    email: '',
    university: '',
    major: '',
    year: '',
    learningStyle: '',
    studyEnvironments: [],
    studyMethods: [],
    subjects: [],
    schedule: {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
      Friday: [], Saturday: [], Sunday: []
    },
    performanceLevel: 3,
    groupPreferences: {
      groupSize: 3,
      sessionDuration: 2,
      studyGoals: []
    }
  });

  const updateProfileData = (field: keyof StudentProfile, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedProfileData = (parentField: keyof StudentProfile, childField: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteSetup();
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteSetup = async () => {
    try {
      setLoading(true);
      
      // Generate unique user ID
      const userId = await StorageService.generateUserId();
      
      // Create complete profile
      const completeProfile: StudentProfile = {
        ...profileData as StudentProfile,
        id: userId,
      };
      
      // Save profile locally
      await StorageService.saveProfile(completeProfile);
      
      // Send to mock backend and get initial recommendations
      const result = await RealAIService.createProfile(completeProfile);
      const recommendations = await RealAIService.getRecommendations(completeProfile);
      
      // Save initial matches
      await StorageService.saveMatches(recommendations);
      
      if (result.success) {
        // Show success message with match count
        alert(`Welcome to StudySync!\n\n${result.message}\n\nFound ${recommendations.length} potential matches based on your profile!`);
        navigation.navigate('Main');
      } else {
        throw new Error('Failed to create profile');
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Tell us about yourself';
      case 2: return 'How do you learn best?';
      case 3: return 'When are you available?';
      case 4: return 'Study preferences';
      default: return 'Set up your profile';
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(profileData.name && profileData.email && profileData.university && profileData.major && profileData.year);
      case 2:
        return !!(profileData.learningStyle && profileData.subjects && profileData.subjects.length > 0);
      case 3:
        const hasSchedule = Object.values(profileData.schedule || {}).some(slots => slots.length > 0);
        return hasSchedule;
      case 4:
        return !!(profileData.groupPreferences?.studyGoals && profileData.groupPreferences.studyGoals.length > 0);
      default:
        return true;
    }
  };

  const getValidationMessage = (): string => {
    switch (currentStep) {
      case 1:
        return 'Please fill in all basic information fields';
      case 2:
        return 'Please describe your learning style and select at least one subject';
      case 3:
        return 'Please select at least one available time slot';
      case 4:
        return 'Please select at least one study goal';
      default:
        return '';
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      if (validateCurrentStep()) {
        nextStep();
      } else {
        alert(getValidationMessage());
      }
    } else {
      if (validateCurrentStep()) {
        handleCompleteSetup();
      } else {
        alert(getValidationMessage());
      }
    }
  };

  const renderCurrentStep = () => {
    const commonProps = {
      data: profileData,
      onUpdate: updateProfileData,
      onUpdateNested: updateNestedProfileData
    };

    switch (currentStep) {
      case 1: return <BasicInfoStep {...commonProps} />;
      case 2: return <LearningStyleStep {...commonProps} />;
      case 3: return <ScheduleStep {...commonProps} />;
      case 4: return <PreferencesStep {...commonProps} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Set Up Your Profile</Text>
        <Text style={styles.headerSubtitle}>
          Help us find the perfect study matches for you
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 4</Text>
        </View>
      </View>
      
      {/* Form */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>{getStepTitle()}</Text>
          
          {renderCurrentStep()}
          
          {/* Step-specific help text */}
          {currentStep === 2 && (
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                💡 Tip: The more detailed your learning style description, the better matches we can find!
              </Text>
            </View>
          )}
          
          {currentStep === 4 && (
            <View style={styles.finalStepContainer}>
              <Text style={styles.finalStepTitle}>🎯 Almost Ready!</Text>
              <Text style={styles.finalStepText}>
                Once you complete setup, our AI will analyze your profile and find compatible study partners based on:
              </Text>
              <Text style={styles.finalStepBullets}>
                • Your subjects and learning style{'\n'}
                • Schedule compatibility{'\n'}
                • Study preferences and goals{'\n'}
                • Academic performance levels
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <Button
            title="Previous"
            variant="secondary"
            onPress={previousStep}
            style={styles.backButton}
            disabled={loading}
          />
        )}
        <Button
          title={
            loading 
              ? "Setting up..." 
              : currentStep === 4 
                ? "Complete Setup" 
                : "Next"
          }
          onPress={handleNext}
          style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
          disabled={loading}
        />
      </View>
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  } as ViewStyle,
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  progressContainer: {
    alignItems: 'center',
  } as ViewStyle,
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: 3,
  } as ViewStyle,
  progressText: {
    color: theme.colors.white,
    fontSize: 12,
    opacity: 0.9,
  } as TextStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  form: {
    padding: theme.spacing.lg,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  } as TextStyle,
  helpContainer: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  } as ViewStyle,
  helpText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  } as TextStyle,
  finalStepContainer: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  } as ViewStyle,
  finalStepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  finalStepText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  } as TextStyle,
  finalStepBullets: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  } as TextStyle,
  buttonContainer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  } as ViewStyle,
  backButton: {
    flex: 1,
  } as ViewStyle,
  nextButton: {
    flex: 1,
  } as ViewStyle,
  fullWidthButton: {
    flex: 2,
  } as ViewStyle,
});