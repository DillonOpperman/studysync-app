import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { RootStackNavigationProp } from '../navigation/AppNavigator';

interface WelcomeScreenProps {
  navigation: RootStackNavigationProp<'Welcome'>;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <LinearGradient
        colors={[theme.colors.background, theme.colors.accent]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>SS</Text>
            </View>
          </View>
          
          <Text style={styles.title}>StudySync</Text>
          <Text style={styles.subtitle}>
            Connect with study partners who match your learning style and schedule
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Create Account"
              onPress={() => navigation?.navigate('ProfileSetup')}
              style={styles.button}
            />
            <Button
              title="Sign In"
              variant="secondary"
              onPress={() => navigation?.navigate('Main')}
              style={styles.button}
            />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  gradient: {
    flex: 1,
  } as ViewStyle,
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  } as ViewStyle,
  logoContainer: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  logo: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  } as ViewStyle,
  logoText: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  } as TextStyle,
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl * 1.5,
  } as TextStyle,
  buttonContainer: {
    width: '100%',
  } as ViewStyle,
  button: {
    marginBottom: theme.spacing.md,
  } as ViewStyle,
});