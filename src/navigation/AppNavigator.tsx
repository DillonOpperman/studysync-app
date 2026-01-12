// src/navigation/AppNavigator.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { GroupChatScreen } from '../screens/GroupChatScreen';
import { GroupInfoScreen } from '../screens/GroupInfoScreen';
import { theme } from '../styles/theme';
import { SearchScreen } from '../screens/SearchScreen';
import { MyGroupsScreen } from '../screens/MyGroupsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProfileEditScreen } from '../screens/ProfileEditScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { JoinedGroup } from '../types/Matching';

// Stack Navigator Types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  ProfileSetup: undefined;
  Main: undefined;
  GroupChat: { group: JoinedGroup };
  GroupInfo: { group: JoinedGroup };
  UserProfile: { userId: string };
};

// Tab Navigator Types
export type MainTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  MyGroups: { openCreateModal?: boolean };
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
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: () => <Text style={{ color: 'white', fontSize: 18 }}>🏠</Text>,
      }}
    />
    <Tab.Screen
      name="Search"
      component={SearchScreen}
      options={{
        tabBarLabel: 'Search',
        tabBarIcon: () => <Text style={{ color: 'white', fontSize: 18 }}>🔍</Text>,
      }}
    />
    <Tab.Screen
      name="MyGroups"
      component={MyGroupsScreen}
      options={{
        tabBarLabel: 'My Groups',
        tabBarIcon: () => <Text style={{ color: 'white', fontSize: 18 }}>👥</Text>,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
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
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);