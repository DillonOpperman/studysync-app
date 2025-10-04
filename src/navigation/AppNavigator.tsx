import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { GroupDetailsScreen } from '../screens/GroupDetailsScreen';
import { theme } from '../styles/theme';
import { SearchScreen } from '../screens/SearchScreen';
import { MyGroupsScreen } from '../screens/MyGroupsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// We'll add more screens as we build them
// import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
// import { DashboardScreen } from '../screens/DashboardScreen';
// import { SearchScreen } from '../screens/SearchScreen';
// import { GroupDetailsScreen } from '../screens/GroupDetailsScreen';
// import { MyGroupsScreen } from '../screens/MyGroupsScreen';
// import { ProfileScreen } from '../screens/ProfileScreen';

// Stack Navigator Types
export type RootStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  Main: undefined;
  GroupDetails: { groupId?: string };
};

// Tab Navigator Types
export type MainTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  MyGroups: undefined;
  Profile: undefined;
};

// Navigation prop types
export type RootStackNavigationProp<T extends keyof RootStackParamList> = StackNavigationProp<
  RootStackParamList,
  T
>;

export type MainTabNavigationProp<T extends keyof MainTabParamList> = BottomTabNavigationProp<
  MainTabParamList,
  T
>;

// Route prop types
export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;

export type MainTabRouteProp<T extends keyof MainTabParamList> = RouteProp<
  MainTabParamList,
  T
>;

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens for now
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf8f6' }}>
    <Text style={{ fontSize: 18, color: '#8b4513' }}>{title} - Coming Soon</Text>
  </View>
);

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: theme.colors.primary,
        height: 60,
        paddingBottom: 5,
        paddingTop: 5,
      },
      tabBarActiveTintColor: theme.colors.white,
      tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
      headerShown: false,
    }}
  >
      
  <Tab.Screen 
    name="Search" 
    component={SearchScreen}  // Changed from PlaceholderScreen
    options={{
      tabBarLabel: 'Search',
      tabBarIcon: () => <Text style={{ color: 'white', fontSize: 18 }}>🔍</Text>,
    }}
  />
  <Tab.Screen 
    name="MyGroups" 
    component={MyGroupsScreen}  // Changed from PlaceholderScreen
    options={{
      tabBarLabel: 'My Groups',
      tabBarIcon: () => <Text style={{ color: 'white', fontSize: 18 }}>👥</Text>,
    }}
  />
  <Tab.Screen 
    name="Profile" 
    component={ProfileScreen}  // Changed from PlaceholderScreen
    options={{
      tabBarLabel: 'Profile',
      tabBarIcon: () => <Text style={{ color: 'white', fontSize: 18 }}>👤</Text>,
    }}
  />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);