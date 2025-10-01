import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { StudentProfile } from '../../types/Profile';

interface PreferencesStepProps {
  data: Partial<StudentProfile>;
  onUpdate: (field: keyof StudentProfile, value: any) => void;
  onUpdateNested: (parentField: keyof StudentProfile, childField: string, value: any) => void;
}

const GROUP_SIZES = [2, 3, 4, 5, 6];
const SESSION_DURATIONS = [1, 2, 3, 4, 5]; // hours

const STUDY_GOALS = [
  'Exam Preparation',
  'Homework Help',
  'Concept Review',
  'Project Collaboration',
  'Test Practice',
  'Note Sharing',
  'Problem Solving',
  'Skill Building'
];

export const PreferencesStep: React.FC<PreferencesStepProps> = ({ data, onUpdate, onUpdateNested }) => {
  
  const updateGroupPreference = (field: string, value: any) => {
    onUpdateNested('groupPreferences', field, value);
  };

  const toggleStudyGoal = (goal: string) => {
    const currentGoals = data.groupPreferences?.studyGoals || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    updateGroupPreference('studyGoals', newGoals);
  };

  const isGoalSelected = (goal: string): boolean => {
    return (data.groupPreferences?.studyGoals || []).includes(goal);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ideal Group Size</Text>
      <Text style={styles.instructionText}>How many people do you prefer to study with?</Text>
      
      <View style={styles.optionContainer}>
        {GROUP_SIZES.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.optionItem,
              data.groupPreferences?.groupSize === size && styles.optionSelected
            ]}
            onPress={() => updateGroupPreference('groupSize', size)}
          >
            <Text style={[
              styles.optionText,
              data.groupPreferences?.groupSize === size && styles.optionTextSelected
            ]}>
              {size} {size === 1 ? 'person' : 'people'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Study Session Duration</Text>
      <Text style={styles.instructionText}>How long do you prefer to study in one session?</Text>
      
      <View style={styles.optionContainer}>
        {SESSION_DURATIONS.map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.optionItem,
              data.groupPreferences?.sessionDuration === duration && styles.optionSelected
            ]}
            onPress={() => updateGroupPreference('sessionDuration', duration)}
          >
            <Text style={[
              styles.optionText,
              data.groupPreferences?.sessionDuration === duration && styles.optionTextSelected
            ]}>
              {duration} {duration === 1 ? 'hour' : 'hours'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Study Goals</Text>
      <Text style={styles.instructionText}>What do you want to accomplish in study groups?</Text>
      
      <View style={styles.goalContainer}>
        {STUDY_GOALS.map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.goalItem,
              isGoalSelected(goal) && styles.goalSelected
            ]}
            onPress={() => toggleStudyGoal(goal)}
          >
            <Text style={[
              styles.goalText,
              isGoalSelected(goal) && styles.goalTextSelected
            ]}>
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Profile Summary</Text>
        <Text style={styles.summaryText}>
          You prefer {data.groupPreferences?.groupSize || 3} person groups for {data.groupPreferences?.sessionDuration || 2} hour sessions.
        </Text>
        <Text style={styles.summaryText}>
          You're studying: {(data.subjects || []).join(', ') || 'No subjects selected'}
        </Text>
        <Text style={styles.summaryText}>
          Main goals: {(data.groupPreferences?.studyGoals || []).join(', ') || 'No goals selected'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  } as TextStyle,
  instructionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  optionItem: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minWidth: '30%',
  } as ViewStyle,
  optionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  optionText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
  } as TextStyle,
  optionTextSelected: {
    color: theme.colors.white,
    fontWeight: 'bold',
  } as TextStyle,
  goalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  goalItem: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minWidth: '45%',
  } as ViewStyle,
  goalSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  goalText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
  } as TextStyle,
  goalTextSelected: {
    color: theme.colors.white,
    fontWeight: 'bold',
  } as TextStyle,
  summaryContainer: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  } as ViewStyle,
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  summaryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
});