import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../styles/theme';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'info' | 'danger';
type ButtonSize = 'medium' | 'small';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  style 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.medium,
  } as ViewStyle,
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  success: {
    backgroundColor: theme.colors.success,
    ...theme.shadows.light,
  } as ViewStyle,
  info: {
    backgroundColor: theme.colors.info,
    ...theme.shadows.light,
  } as ViewStyle,
  danger: {
    backgroundColor: theme.colors.danger,
    ...theme.shadows.light,
  } as ViewStyle,
  medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  } as ViewStyle,
  small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  } as ViewStyle,
  disabled: {
    opacity: 0.6,
  } as ViewStyle,
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
  primaryText: {
    color: theme.colors.white,
  } as TextStyle,
  secondaryText: {
    color: theme.colors.primary,
  } as TextStyle,
  successText: {
    color: theme.colors.white,
  } as TextStyle,
  infoText: {
    color: theme.colors.white,
  } as TextStyle,
  dangerText: {
    color: theme.colors.white,
  } as TextStyle,
});