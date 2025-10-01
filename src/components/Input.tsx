import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { theme } from '../styles/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: ViewStyle;
  multiline?: boolean;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  style,
  multiline = false,
  error,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
          error && styles.errorBorder
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={theme.colors.textSecondary}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  input: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 14,
    backgroundColor: theme.colors.white,
  } as ViewStyle,
  focused: {
    borderColor: theme.colors.primary,
  } as ViewStyle,
  errorBorder: {
    borderColor: theme.colors.danger,
  } as ViewStyle,
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  } as ViewStyle,
  errorText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.danger,
    fontSize: 12,
  } as TextStyle,
});