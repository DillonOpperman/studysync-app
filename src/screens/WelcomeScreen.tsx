// src/screens/WelcomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('ProfileSetup');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.header}>Welcome Screen</Text>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SS</Text>
          </View>
        </View>
        <Text style={styles.title}>StudySync</Text>
        <Text style={styles.subtitle}>
          Connect with study partners{"\n"}
          who match your learning style{"\n"}
          and schedule
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Create Account"
            onPress={handleGetStarted}
            style={styles.createButton}
          />
          <Button
            title="Sign In"
            onPress={handleSignIn}
            variant="outline"
            style={styles.signInButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

interface FeatureItemProps {
  icon: string;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  } as ViewStyle,
  header: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  } as TextStyle,
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  } as ViewStyle,
  logoBox: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  logoText: {
    color: theme.colors.white,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  } as TextStyle,
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
    marginBottom: 32,
    lineHeight: 22,
  } as TextStyle,
  buttonContainer: {
    width: '100%',
    gap: 16,
  } as ViewStyle,
  createButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    marginBottom: 8,
  } as ViewStyle,
  signInButton: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
  } as ViewStyle,
});