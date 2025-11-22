# StudySync Frontend

This is the **React Native** mobile application for StudySync, an AI-powered study group matching platform. The frontend provides a seamless user experience for creating profiles, discovering compatible study partners, managing groups, and chatting with group members.

---

##  Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Backend Integration](#backend-integration)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Author](#author)
- [Acknowledgements](#acknowledgements)

---

##  Overview

StudySync Frontend is a cross-platform mobile application built with React Native that connects students with compatible study partners through:

- **Intelligent Profile Creation:** Multi-step profile setup capturing learning preferences, schedules, and academic information
- **AI-Powered Matching:** Real-time recommendations based on backend AI analysis
- **Group Management:** Create and join study groups with role-based access
- **Real-time Chat:** Group messaging with reactions, image sharing, and announcements
- **Semantic Search:** Find study partners using natural language queries

The app communicates with the StudySync Flask backend to leverage AI-powered matching algorithms and persistent data storage.

---

##  Key Features

### User Authentication & Profiles
-  Secure registration with .edu email validation
-  Password strength indicators
-  JWT token-based authentication
-  5-step profile setup (Basic Info, Learning Style, Schedule, Preferences, Password)
-  Profile editing and viewing

### AI-Powered Matching
-  Real-time study group recommendations
-  Match percentage scoring
-  Compatibility breakdowns (subjects, schedule, learning style, performance)
-  Explanation of why matches are compatible
-  Fallback suggestions when no matches found

### Study Groups
-  Create custom study groups
-  Join existing groups
-  View group details (schedule, location, members)
-  Role indicators (leader/member)
-  Group status tracking (active/pending)
-  Pull-to-refresh for latest updates

### Group Chat
-  Real-time messaging
-  Message reactions 
-  Image sharing
-  Announcement messages
-  Message timestamps
-  User identification (self vs others)
-  Long-press to react

### Search & Discovery
-  Semantic search using AI
-  Quick search buttons for popular subjects
-  Relevance-ranked results
-  Match percentage for search results

### User Experience
-  Pull-to-refresh on all list screens
-  Loading indicators
-  Error handling with user-friendly messages
-  Smooth animations and transitions
-  Responsive design for different screen sizes

---

##  Technologies

### Core Framework
- **React Native:** 0.81 (Cross-platform mobile development)
- **TypeScript:** Type-safe JavaScript for better development experience
- **React Navigation:** Screen navigation and routing

### State Management & Storage
- **AsyncStorage:** Local data persistence
- **React Hooks:** useState, useEffect for component state

### UI Components & Styling
- **Custom Components:** Button, Input, Card components
- **Theme System:** Centralized color and spacing constants
- **StyleSheet API:** Optimized styling

### Backend Integration
- **Fetch API:** HTTP requests to Flask backend
- **JWT Authentication:** Token-based auth with AsyncStorage
- **REST API:** Communication with backend endpoints

### Development Tools
- **Metro Bundler:** JavaScript bundler
- **React Native CLI:** Build and run tools
- **Android Studio:** Android development environment
- **Xcode:** iOS development environment (macOS only)

---

##  Prerequisites

Before you begin, ensure you have the following installed and configured:

### 1. Node.js & npm
- **Node.js:** Version 16 or higher
- **npm:** Comes with Node.js

Download from: [nodejs.org](https://nodejs.org/)

### 2. React Native Environment

You **must** complete the official [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) guide for your operating system and target platform (Android/iOS).

#### For Android Development:
- **Android Studio** (with Android SDK)
- **Java Development Kit (JDK)** 11 or higher
- **Android Virtual Device (AVD)** or physical Android device

#### For iOS Development (macOS only):
- **Xcode** 12 or higher
- **CocoaPods** (installed via Ruby)
- **iOS Simulator** or physical iOS device

### 3. Backend Running

The backend must be running at `http://localhost:5000` (or configure the baseURL in services).

See the [Backend README](https://github.com/DillonOpperman/study-group-matcher-backend/blob/main/README.md) for setup instructions.

> ** Important:** This project uses **React Native** (for mobile apps), not basic React (which is web-based). Make sure you have the correct environment set up!

---

##  Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/StudySyncAppFresh.git
cd StudySyncAppFresh
```

### Step 2: Install JavaScript Dependencies

Install the required Node.js packages using npm:

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:
- React Native core libraries
- React Navigation
- AsyncStorage
- TypeScript definitions
- Development tools

### Step 3: Install Native Dependencies (iOS Only)

If developing for **iOS**, you must install the native CocoaPods dependencies.

#### A. Install Ruby Bundler (First time only):

```bash
bundle install
```

#### B. Install CocoaPods:

Run this command every time you update native dependencies:

```bash
cd ios
bundle exec pod install --repo-update
cd ..
```

For more information, visit the [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

> **Note:** This step is only necessary on macOS and only if you're targeting iOS.

---

##  Running the Application

### Step 1: Start Metro Bundler

First, start the **Metro** JavaScript bundler. This must run in its own terminal window:

```bash
npm start
```

Or with cache reset (if you encounter issues):

```bash
npm start -- --reset-cache
```

Metro will start and display:
```
Welcome to Metro v0.83.1
Fast - Scalable - Integrated

Dev server ready. Press Ctrl+C to exit.
```

### Step 2: Build and Run the App

With Metro running, open a **new terminal window** in the same project directory and run one of the following commands:

#### For Android:

```bash
npm run android
```

Or manually:
```bash
npx react-native run-android
```

**What happens:**
1. Gradle builds the Android app
2. Installs on connected device/emulator
3. Launches the StudySync app

#### For iOS (macOS only):

```bash
npm run ios
```

Or manually:
```bash
npx react-native run-ios
```

**What happens:**
1. Xcode builds the iOS app
2. Installs on simulator/connected device
3. Launches the StudySync app

### Expected Result

If everything is set up correctly, you should see the **StudySync** app running with:
- Welcome screen with "Create Account" and "Sign In" buttons
- Ability to create a new account through the 5-step process
- Dashboard showing AI-powered recommendations after setup

---

##  Project Structure

```
StudySyncAppFresh/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx       # Custom button component
│   │   ├── Input.tsx        # Custom input component
│   │   └── ProfileSteps/    # Profile setup step components
│   │       ├── BasicInfoStep.tsx
│   │       ├── LearningStyleStep.tsx
│   │       ├── ScheduleStep.tsx
│   │       ├── PreferencesStep.tsx
│   │       └── PasswordStep.tsx
│   │
│   ├── screens/             # App screens
│   │   ├── WelcomeScreen.tsx        # Initial landing screen
│   │   ├── LoginScreen.tsx          # User login
│   │   ├── ProfileSetupScreen.tsx   # 5-step profile creation
│   │   ├── DashboardScreen.tsx      # AI recommendations
│   │   ├── MyGroupsScreen.tsx       # User's groups
│   │   ├── GroupChatScreen.tsx      # Group messaging
│   │   ├── GroupInfoScreen.tsx      # Group details
│   │   ├── SearchScreen.tsx         # Semantic search
│   │   └── ProfileScreen.tsx        # User profile
│   │
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx # Stack and tab navigators
│   │
│   ├── services/            # Backend communication
│   │   ├── RealAIService.ts     # API calls to backend
│   │   ├── StorageService.ts    # AsyncStorage management
│   │   └── GroupService.ts      # Group & chat API calls
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── Profile.ts       # StudentProfile interface
│   │   ├── Matching.ts      # MatchRecommendation interface
│   │   └── Chat.ts          # Message & Group interfaces
│   │
│   └── styles/              # Styling
│       └── theme.ts         # Color palette and spacing
│
├── android/                 # Android native code
├── ios/                     # iOS native code (macOS only)
├── index.js                 # App entry point
├── App.tsx                  # Root component
├── package.json             # npm dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

---

##  Key Components

### ProfileSetupScreen
- **Purpose:** 5-step guided profile creation
- **Steps:**
  1. Basic Info (name, email, university, major, year)
  2. Learning Style (preferences, study methods, subjects)
  3. Schedule (weekly availability grid)
  4. Preferences (group size, session duration, goals)
  5. Password (secure account creation)
- **Validation:** Each step validated before proceeding
- **Backend Integration:** Sends complete profile to `/api/auth/register`

### DashboardScreen
- **Purpose:** Display AI-powered study group recommendations
- **Features:**
  - Match cards with percentage scores
  - Compatibility explanations
  - "Request to Join" or "Start Group" actions
  - Pull-to-refresh for latest matches
  - Empty state when no profile exists

### MyGroupsScreen
- **Purpose:** Manage user's study groups
- **Features:**
  - List of joined/created groups
  - Group status indicators (active/pending)
  - Role badges (leader/member)
  - Floating action button to create new group
  - Pull-to-refresh
  - Tap to open group chat

### GroupChatScreen
- **Purpose:** Real-time group messaging
- **Features:**
  - Message bubbles (self vs others)
  - Emoji reactions (long-press to react)
  - Image sharing
  - Timestamp display
  - Pull-to-refresh for new messages
  - Input with send button

### SearchScreen
- **Purpose:** Semantic search for study partners
- **Features:**
  - Search input with AI-powered results
  - Quick search buttons (Math, CS, Bio, etc.)
  - Match percentage for results
  - Relevance ranking
  - Empty state with helpful tips

---

##  Backend Integration

### API Service Files

**RealAIService.ts**
- Handles authentication (register, login)
- Fetches AI recommendations
- Manages JWT token storage
- Base URL: `http://10.0.2.2:5000` (Android Emulator)

**GroupService.ts**
- Group creation and management
- Message sending and retrieval
- Reaction handling
- All endpoints use JWT authentication

**StorageService.ts**
- Local data persistence with AsyncStorage
- User-specific key prefixes
- Profile, matches, and groups storage

### Backend URL Configuration

The frontend is configured to communicate with:

```typescript
// For Android Emulator
private static baseURL = 'http://10.0.2.2:5000';

// For iOS Simulator
// private static baseURL = 'http://localhost:5000';

// For Physical Device (same network)
// private static baseURL = 'http://YOUR_COMPUTER_IP:5000';
```

**To change the backend URL:**
1. Open `src/services/RealAIService.ts`
2. Update the `baseURL` constant
3. Do the same in `src/services/GroupService.ts`
4. Restart the app

---

##  Troubleshooting

### Common Issues and Solutions

#### 1. Metro Bundler Won't Start

**Error:** Port 8081 already in use

**Solution:**
```bash
# Kill existing Metro process
npx react-native start --reset-cache
```

Or manually kill the process:
```bash
# Windows
taskkill /F /IM node.exe

# macOS/Linux
lsof -ti:8081 | xargs kill -9
```

#### 2. Android Build Fails

**Error:** Gradle build errors

**Solution:**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### 3. Cannot Connect to Backend

**Error:** Network request failed, Unable to connect to AI service

**Solution:**
1. Verify backend is running at `http://localhost:5000`
2. Check the `baseURL` in `RealAIService.ts` matches your setup
3. For Android Emulator, use `http://10.0.2.2:5000`
4. For physical device, use your computer's local IP address

Test backend connection:
```bash
# From your computer
curl http://localhost:5000/api/health

# From Android Emulator (won't work from terminal, but app should connect)
# Make sure baseURL is set to http://10.0.2.2:5000
```

#### 4. AsyncStorage Errors

**Error:** Invariant Violation: AsyncStorage key cannot be undefined

**Solution:**
- Clear app data and restart
- Check that user ID is set correctly after login/registration

```bash
# Android - Clear app data
adb shell pm clear com.studysyncappfresh

# iOS - Delete app and reinstall
```

#### 5. iOS CocoaPods Issues

**Error:** Pod install fails

**Solution:**
```bash
cd ios
pod repo update
bundle exec pod install --repo-update
cd ..
```

#### 6. Module Not Found Errors

**Error:** Unable to resolve module `@react-navigation/native`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Reset Metro cache
npm start -- --reset-cache
```

#### 7. TypeScript Errors

**Error:** Type errors in `.tsx` files

**Solution:**
- Most TypeScript errors are warnings and won't prevent the app from running
- To fix, ensure all interfaces match the expected types
- Check `src/types/` folder for type definitions


---

##  License

This project is licensed under the **Apache License 2.0**.

---

##  Author

**Dillon Opperman**
- GitHub: [@DillonOpperman](https://github.com/DillonOpperman)
- Email: dlopper@ilstu.edu
- University: Illinois State University

**Project Information:**
- Originally a project for IT-244 taught by (https://github.com/elaheJ)
- Entered into 2026 Illinois State University Mobile Application Contest
- Institution: Illinois State University
- Platform: React Native (iOS & Android)

---

##  Acknowledgements

This project was made possible thanks to the following open-source projects and resources:

### Mobile Development
- **[React Native](https://reactnative.dev/)** - For the cross-platform mobile framework
- **[React Navigation](https://reactnavigation.org/)** - For seamless screen navigation
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - For local data persistence

### Development Tools
- **[TypeScript](https://www.typescriptlang.org/)** - For type-safe JavaScript development
- **[Metro Bundler](https://facebook.github.io/metro/)** - For JavaScript bundling
- **[React Native CLI](https://github.com/react-native-community/cli)** - For build tools

### Backend Integration
- StudySync Flask Backend - For AI-powered matching and data persistence


### Special Thanks
- Illinois State University 
- MAD Contest Organizers
- Dr. Elahe Javadi - School of Information Technology 

---

##  Support

For questions, issues, or contributions:

1. **Issues:** Open an issue on [GitHub Issues](https://github.com/DillonOpperman/studysync-app/issues)
2. **Email:** Contact dlopper@ilstu.edu
3. **Documentation:** Refer to the sections above

---

##  Related Repositories

- **Backend Repository:** [study-group-matcher-backend](https://github.com/DillonOpperman/study-group-matcher-backend)
- **Project Documentation:** [See Backend README](https://github.com/DillonOpperman/studysync-backend/blob/main/README.md)

---

**Last Updated:** November 2025  
**Version:** 1.0.0  
**Status:** Active Development for MAD Contest  
**Supported Platforms:** Android & iOS (requires macOS for iOS development)
