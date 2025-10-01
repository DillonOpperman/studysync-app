import React from 'react';
import { View } from 'react-native';
import { Input } from '../Input';
import { StudentProfile } from '../../types/Profile';

interface BasicInfoStepProps {
  data: Partial<StudentProfile>;
  onUpdate: (field: keyof StudentProfile, value: any) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onUpdate }) => {
  return (
    <View>
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={data.name || ''}
        onChangeText={(text) => onUpdate('name', text)}
      />
      
      <Input
        label="Email"
        placeholder="Enter your email address"
        value={data.email || ''}
        onChangeText={(text) => onUpdate('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        label="University"
        placeholder="Enter your university name"
        value={data.university || ''}
        onChangeText={(text) => onUpdate('university', text)}
      />
      
      <Input
        label="Major"
        placeholder="Enter your major/field of study"
        value={data.major || ''}
        onChangeText={(text) => onUpdate('major', text)}
      />
      
      <Input
        label="Academic Year"
        placeholder="e.g., Freshman, Sophomore, Junior, Senior"
        value={data.year || ''}
        onChangeText={(text) => onUpdate('year', text)}
      />
    </View>
  );
};