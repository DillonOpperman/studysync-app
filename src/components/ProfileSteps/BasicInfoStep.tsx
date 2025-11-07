import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { Input } from '../Input';
import { StudentProfile } from '../../types/Profile';
import { theme } from '../../styles/theme';

interface BasicInfoStepProps {
  data: Partial<StudentProfile>;
  onUpdate: (field: keyof StudentProfile, value: any) => void;
}

const ACADEMIC_YEARS = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate Student',
  'PhD Student'
];

const COMMON_MAJORS = [
  'Computer Science',
  'Mathematics',
  'Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Biology',
  'Chemistry',
  'Physics',
  'Psychology',
  'Economics',
  'English',
  'History',
  'Political Science',
  'Sociology',
  'Nursing',
  'Pre-Med',
  'Pre-Law',
  'Communications',
  'Art',
  'Music',
  'Education',
  'Other'
];

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onUpdate }) => {
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEduEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('.edu');
  };

  const handleEmailChange = (email: string) => {
    onUpdate('email', email);
    if (emailError && email.length > 0) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    const email = data.email || '';
    
    if (!email) {
      setEmailError('Email is required');
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else if (!isEduEmail(email)) {
      setEmailError('Please use your .edu email address');
    } else {
      setEmailError('');
    }
  };

  const handleNameChange = (name: string) => {
    if (name.length <= 50) {
      onUpdate('name', name);
      if (nameError) setNameError('');
    }
  };

  const handleNameBlur = () => {
    const name = data.name || '';
    if (!name.trim()) {
      setNameError('Name is required');
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
    } else {
      setNameError('');
    }
  };

  const selectMajor = (major: string) => {
    onUpdate('major', major);
    setShowMajorModal(false);
  };

  const selectYear = (year: string) => {
    onUpdate('year', year);
    setShowYearModal(false);
  };

  return (
    <View style={styles.container}>
      <Input
        label="Full Name *"
        placeholder="Enter your full name"
        value={data.name || ''}
        onChangeText={handleNameChange}
        onBlur={handleNameBlur}
        error={nameError}
      />
      
      <Input
        label="Email *"
        placeholder="Enter your .edu email address"
        value={data.email || ''}
        onChangeText={handleEmailChange}
        onBlur={handleEmailBlur}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />
      
      <Input
        label="University *"
        placeholder="Enter your university name"
        value={data.university || ''}
        onChangeText={(text) => {
          if (text.length <= 100) {
            onUpdate('university', text);
          }
        }}
      />
      
      {/* Major Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Major *</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowMajorModal(true)}
        >
          <Text style={[styles.selectorText, !data.major && styles.placeholder]}>
            {data.major || 'Select your major...'}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Year Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Academic Year *</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowYearModal(true)}
        >
          <Text style={[styles.selectorText, !data.year && styles.placeholder]}>
            {data.year || 'Select your year...'}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ Your .edu email helps verify you're a student. All fields marked with * are required.
        </Text>
      </View>

      {/* Major Modal */}
      <Modal
        visible={showMajorModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMajorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Major</Text>
              <TouchableOpacity onPress={() => setShowMajorModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {COMMON_MAJORS.map((major) => (
                <TouchableOpacity
                  key={major}
                  style={[
                    styles.modalItem,
                    data.major === major && styles.modalItemSelected
                  ]}
                  onPress={() => selectMajor(major)}
                >
                  <Text style={[
                    styles.modalItemText,
                    data.major === major && styles.modalItemTextSelected
                  ]}>
                    {major}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Year Modal */}
      <Modal
        visible={showYearModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Year</Text>
              <TouchableOpacity onPress={() => setShowYearModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {ACADEMIC_YEARS.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.modalItem,
                    data.year === year && styles.modalItemSelected
                  ]}
                  onPress={() => selectYear(year)}
                >
                  <Text style={[
                    styles.modalItemText,
                    data.year === year && styles.modalItemTextSelected
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  selectorContainer: {
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  selector: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  selectorText: {
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,
  placeholder: {
    color: theme.colors.textSecondary,
  } as TextStyle,
  arrow: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  } as TextStyle,
  infoBox: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  } as ViewStyle,
  infoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  } as TextStyle,
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '70%',
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  } as TextStyle,
  modalClose: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  } as TextStyle,
  modalScroll: {
    padding: theme.spacing.md,
  } as ViewStyle,
  modalItem: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  } as ViewStyle,
  modalItemSelected: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  modalItemText: {
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,
  modalItemTextSelected: {
    color: theme.colors.white,
    fontWeight: 'bold',
  } as TextStyle,
});