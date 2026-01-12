// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { RealAIService } from '../services/RealAIService';
import { StorageService } from '../services/StorageService';
import { Input } from '../components/Input';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call login API with email AND password
      const response = await RealAIService.login(email.trim(), password.trim());

      if (response.success && response.user) {
        // Save profile locally
        await StorageService.saveProfile(response.user);
        
        // Navigate to Main tabs
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        setError(response.error || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Input
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            title={loading ? 'Signing In...' : 'Sign In'}
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          />

          {loading && (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          )}
        </View>

        {/* Create Account */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Button
            title="Create Account"
            onPress={handleBackToWelcome}
            variant="outline"
            style={styles.fullWidthButton}
            disabled={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  } as ViewStyle,
  header: {
    marginBottom: 48,
    alignItems: 'center',
  } as ViewStyle,
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  formContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 24,
    marginBottom: 24,
    shadowColor: theme.shadows.light.shadowColor,
    shadowOffset: theme.shadows.light.shadowOffset,
    shadowOpacity: theme.shadows.light.shadowOpacity,
    shadowRadius: theme.shadows.light.shadowRadius,
    elevation: theme.shadows.light.elevation,
  } as ViewStyle,
  errorContainer: {
    backgroundColor: theme.colors.danger,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
  } as ViewStyle,
  errorText: {
    color: theme.colors.white,
    fontSize: 14,
    textAlign: 'center',
  } as TextStyle,
  loginButton: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
  } as ViewStyle,
  loader: {
    marginTop: 16,
  } as ViewStyle,
  footer: {
    alignItems: 'center',
  } as ViewStyle,
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  } as TextStyle,
  fullWidthButton: {
    width: '100%',
    borderColor: theme.colors.primary,
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
  } as ViewStyle,
});