Here is the complete, cleaned-up Markdown code for your **front-end `README.md`** file, incorporating all your notes and following professional formatting. You can copy this entire block and paste it directly into your file.

````markdown
# StudySync Frontend 

This is the **React Native** project that serves as the frontend for the StudySync application. It was bootstrapped using the official `@react-native-community/cli`.

---

##  Prerequisites

Before you begin, ensure you have the following installed and configured:

1.  **React Native Environment:** You must complete the official [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide. This is necessary for installing SDKs, build tools, and simulators (Android Studio, Xcode, etc.).
2.  **Node.js:** Ensure **Node.js** is installed on your machine. This is critical for all `npm` and `npx` commands to function.
3.  **Correct Framework:** This project uses **React Native** (for mobile apps), not basic React (which is web-based).

> **A Note on Package Managers:** This guide primarily uses **npm**. While **Yarn** commands are included for completeness, **npm** is the confirmed package manager used in this project.

---

##  Installation and Setup

### Step 1: Clone the Repository

Clone the frontend repository and navigate into the project directory.

```bash
git clone [https://github.com/YOUR_USERNAME/studysync-frontend.git](https://github.com/YOUR_USERNAME/studysync-frontend.git)
cd studysync-frontend
````

### Step 2: Install JavaScript Dependencies

Install the required Node.js packages using `npm`.

```bash
npm install
# OR (if using Yarn)
# yarn install
```

### Step 3: Install Native Dependencies (iOS Only)

If developing for iOS, you must install the native CocoaPods dependencies. This step is only necessary on the first clone or after updating any native libraries.

#### A. Install Ruby Bundler (First time only):

```bash
bundle install
```

#### B. Install CocoaPods:

Run this command every time you update native dependencies:

```bash
bundle exec pod install --repo-update
```

For more information, visit the [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

-----

##  Running the Application

### Step 1: Start Metro

First, you must run **Metro**, the JavaScript build tool. Start the dev server in one terminal window/pane:

```bash
npm start
# OR (if using Yarn)
# yarn start
```

### Step 2: Build and Run the App

With Metro running, open a **new terminal window/pane** and use one of the following commands to build and run your app on a device or simulator.

#### Android

```bash
npm run android
# OR (if using Yarn)
# yarn android
```

#### iOS

```bash
npm run ios
# OR (if using Yarn)
# yarn ios
```

If everything is set up correctly, you should see the **StudySync** app running in the Android Emulator, iOS Simulator, or your connected device.

```
```
