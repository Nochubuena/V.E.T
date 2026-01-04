# Code Instructions - Line by Line Documentation

This document explains what each line of code does in the V.E.T. App React Native application.

---

## **App.tsx** - Main App Navigation Setup

### Lines 1-10: Imports
```typescript
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import SignInScreen from './src/screens/SignInScreen';
import HomePage from './src/screens/HomePage';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfilePage from './src/screens/ProfilePage';
import ProfilePageVitals from './src/screens/ProfilePageVitals';
```
- **Line 1**: Imports React library - essential for React Native
- **Line 2**: Imports NavigationContainer - wraps entire app to enable navigation
- **Line 3**: Imports createStackNavigator - for forward/back navigation between screens
- **Line 4**: Imports createBottomTabNavigator - for bottom tab bar navigation
- **Line 5**: Imports Text component for displaying text
- **Lines 6-10**: Import all screen components from their respective files

### Lines 12-13: Navigation Instance Creation
```typescript
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
```
- **Line 12**: Creates a Stack Navigator instance for push/pop navigation
- **Line 13**: Creates a Tab Navigator instance for bottom tab navigation

### Lines 15-56: TabNavigator Function
```typescript
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
      }}>
```
- **Line 15**: Defines function that creates bottom tab navigation
- **Line 16**: Returns JSX for Tab Navigator
- **Line 17**: Opens Tab.Navigator component
- **Line 18**: Opens screenOptions configuration object
- **Line 19**: Sets active tab color to black
- **Line 20**: Sets inactive tab color to gray
- **Line 21**: Hides the header bar
- **Lines 22-23**: Closes screenOptions and opens Tab.Navigator children

### Lines 24-33: Home Tab
```typescript
<Tab.Screen
  name="HomeTab"
  component={HomePage}
  options={{
    tabBarLabel: '',
    tabBarIcon: ({color, size}) => (
      <TabBarIcon icon="home" color={color} size={size} />
    ),
  }}
/>
```
- **Line 24**: Opens Tab.Screen configuration
- **Line 25**: Names this tab "HomeTab"
- **Line 26**: Links to HomePage component
- **Line 27**: Opens options object for customization
- **Line 28**: Hides text label under icon
- **Line 29**: Creates custom icon function that receives color and size
- **Line 30**: Renders TabBarIcon with home emoji
- **Lines 31-32**: Close options and Tab.Screen

### Lines 34-43: History Tab
```typescript
<Tab.Screen
  name="HistoryTab"
  component={HistoryScreen}
  options={{
    tabBarLabel: '',
    tabBarIcon: ({color, size}) => (
      <TabBarIcon icon="clock" color={color} size={size} />
    ),
  }}
/>
```
- **Line 34**: Opens History tab configuration
- **Line 35**: Names this tab "HistoryTab"
- **Line 36**: Links to HistoryScreen component
- **Lines 37-43**: Same customization as Home tab but with clock icon

### Lines 44-53: Profile Tab
```typescript
<Tab.Screen
  name="ProfileTab"
  component={ProfilePage}
  options={{
    tabBarLabel: '',
    tabBarIcon: ({color, size}) => (
      <TabBarIcon icon="user" color={color} size={size} />
    ),
  }}
/>
```
- **Line 44**: Opens Profile tab configuration
- **Line 45**: Names this tab "ProfileTab"
- **Line 46**: Links to ProfilePage component
- **Lines 47-53**: Same customization as Home tab but with user icon

### Lines 58-66: TabBarIcon Helper Function
```typescript
function TabBarIcon({icon, color, size}: {icon: string; color: string; size: number}) {
  const icons: any = {
    home: '🏠',
    clock: '🕐',
    user: '👤',
  };
  return <Text style={{fontSize: size, color}}>{icons[icon] || '•'}</Text>;
}
```
- **Line 59**: Defines helper function with TypeScript type parameters
- **Line 60**: Creates object mapping icon names to emoji characters
- **Line 61**: Maps 'home' to house emoji
- **Line 62**: Maps 'clock' to clock emoji
- **Line 63**: Maps 'user' to person emoji
- **Line 64**: Closes icons object
- **Line 65**: Returns Text component styled with dynamic size and color, using icon from map or fallback bullet

### Lines 68-77: Main App Component
```typescript
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn" screenOptions={{headerShown: false}}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="ProfilePageVitals" component={ProfilePageVitals} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```
- **Line 68**: Exports default App function as main entry point
- **Line 69**: Returns JSX
- **Line 70**: Wraps app in NavigationContainer (required for React Navigation)
- **Line 71**: Opens Stack Navigator with SignIn as first screen, no header
- **Line 72**: Registers SignInScreen in stack
- **Line 73**: Registers TabNavigator (contains 3 tabs) in stack
- **Line 74**: Registers ProfilePageVitals screen in stack
- **Lines 75-77**: Closes Stack Navigator, NavigationContainer, and App

---

## **SignInScreen.tsx** - Authentication Screen

### Lines 1-10: Imports
```typescript
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
```
- **Line 1**: Imports React and useState hook for managing state
- **Lines 2-10**: Imports React Native UI components

### Lines 12-18: Component and State
```typescript
const SignInScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const handleContinue = () => {
    // Navigate to main app
    navigation.replace('Main');
  };
```
- **Line 12**: Defines SignInScreen function component, receives navigation prop
- **Line 13**: Creates state variable 'email' initialized to empty string
- **Line 15**: Defines function to handle Continue button press
- **Line 17**: Replaces current screen with Main (TabNavigator)

### Lines 20-24: Container and Title
```typescript
return (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.appTitle}>V.E.T. App</Text>
```
- **Line 20**: Returns JSX
- **Line 21**: Wraps in SafeAreaView to avoid status bar overlap
- **Line 22**: Adds ScrollView for scrollable content
- **Line 24**: Displays main app title with bold styling

### Lines 26-32: Headers
```typescript
<Text style={styles.sectionHeader}>Create an account</Text>
<Text style={styles.instructions}>
  Enter your email to sign up for this app
</Text>
```
- **Line 26**: Displays section header text
- **Lines 28-30**: Displays instruction text

### Lines 34-44: Email Input
```typescript
<TextInput
  style={styles.emailInput}
  placeholder="email@domain.com"
  placeholderTextColor="#999999"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  autoCorrect={false}
/>
```
- **Line 34**: Opens TextInput component
- **Line 35**: Applies email input styling
- **Line 36**: Sets gray placeholder text
- **Line 37**: Sets placeholder color
- **Line 38**: Binds input to email state
- **Line 39**: Updates email state on text change
- **Line 40**: Shows email keyboard on mobile
- **Line 41**: Disables auto-capitalization
- **Line 42**: Disables auto-correction
- **Line 43**: Closes TextInput

### Lines 46-49: Continue Button
```typescript
<TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
  <Text style={styles.continueButtonText}>Continue</Text>
</TouchableOpacity>
```
- **Line 46**: Creates pressable button container
- **Line 47**: Displays Continue text in white
- **Line 48**: Closes TouchableOpacity

### Lines 51-63: Separator and Social Buttons
```typescript
<Text style={styles.separator}>or</Text>
<TouchableOpacity style={styles.socialButton}>
  <Text style={styles.socialIcon}>G</Text>
  <Text style={styles.socialText}>Continue with Google</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.socialButton}>
  <Text style={styles.socialIcon}>🍎</Text>
  <Text style={styles.socialText}>Continue with Apple</Text>
</TouchableOpacity>
```
- **Line 52**: Displays "or" separator text
- **Lines 54-58**: Google login button (icon + text)
- **Lines 60-64**: Apple login button (emoji + text)

### Lines 65-70: Legal Disclaimer
```typescript
<Text style={styles.disclaimer}>
  By clicking continue, you agree to our{' '}
  <Text style={styles.link}>Terms of Service</Text> and{' '}
  <Text style={styles.link}>Privacy Policy</Text>
</Text>
```
- **Lines 66-70**: Legal text with clickable blue links

### Lines 76-165: StyleSheet
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
```
- **Line 76**: Creates StyleSheet for all styles
- **Lines 77-80**: Main container fills screen, white background
- **Lines 81-86**: ScrollView content styling with padding

---

## **HomePage.tsx** - Main Dashboard

### Lines 12-21: Component Setup
```typescript
const HomePage = ({navigation}: any) => {
  const [selectedDog] = useState('Dog name');
  const dogs = [
    {id: 1, name: 'Dog name 1'},
    {id: 2, name: 'Dog name 2'},
    {id: 3, name: 'Dog name 3'},
    {id: 4, name: 'Dog name 4'},
  ];
```
- **Line 12**: Creates HomePage component
- **Line 13**: State for currently selected dog
- **Lines 15-21**: Array of sample dog data

### Lines 23-25: Navigation Function
```typescript
const navigateToVitals = () => {
  navigation.navigate('ProfilePageVitals');
};
```
- **Line 23**: Defines function to navigate to vitals screen
- **Line 24**: Navigates to ProfilePageVitals

### Lines 30-37: Your Dogs Section
```typescript
<View style={styles.topSection}>
  <View style={styles.headerRow}>
    <Text style={styles.sectionTitle}>Your Dogs</Text>
    <View style={styles.headerIcons}>
      <Text style={styles.arrow}>›</Text>
      <Text style={styles.icon}>⟳</Text>
```
- **Line 30**: Opens top section container
- **Line 31**: Creates header row
- **Line 33**: Displays "Your Dogs" title
- **Lines 34-37**: Adds arrow and refresh icons

### Lines 40-50: Dog Profile List
```typescript
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {dogs.map(dog => (
    <TouchableOpacity key={dog.id} style={styles.dogProfile}>
      <View style={styles.profileImage}>
        <Text style={styles.dogEmoji}>🐕</Text>
      </View>
      <Text style={styles.dogName}>{dog.name}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>
```
- **Line 41**: Horizontal scrollable list
- **Line 42**: Maps through dogs array
- **Line 43**: Creates pressable card for each dog
- **Line 44**: Circular image container
- **Line 45**: Dog emoji display
- **Line 47**: Dog name below image
- **Line 48**: Closes dog card
- **Line 49**: Closes map
- **Line 50**: Closes ScrollView

### Lines 57-78: Vital Status Section
```typescript
<TouchableOpacity style={styles.vitalsSection} onPress={navigateToVitals}>
  <Text style={styles.vitalTitle}>{selectedDog}'s Vital Status</Text>
  <View style={styles.vitalsContainer}>
    <View style={styles.vitalBox}>
      <Text style={styles.vitalNumber}>73</Text>
      <Text style={styles.vitalLabel}>Beats per minute</Text>
      <Text style={styles.vitalSubLabel}>Heartbeats</Text>
    </View>
    <View style={styles.vitalDivider} />
    <View style={styles.vitalBox}>
      <Text style={styles.vitalNumber}>38.4</Text>
      <Text style={styles.vitalLabel}>Celsius</Text>
      <Text style={styles.vitalSubLabel}>Body Temperature</Text>
    </View>
  </View>
</TouchableOpacity>
```
- **Line 57**: Makes entire section clickable to navigate to vitals
- **Line 58**: Displays title with dog name
- **Line 59**: Container for vital metrics
- **Lines 61-66**: Heart rate display (large number + labels)
- **Line 67**: Vertical divider line
- **Lines 69-74**: Temperature display (large number + labels)
- **Lines 75-76**: Close containers

### Lines 83-96: Health Cards Section
```typescript
<View style={styles.cardsSection}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <TouchableOpacity style={styles.healthCard}>
      <Text style={styles.cardText}>Temperature History</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.healthCard}>
      <Text style={styles.cardText}>Dogs name's Health</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.healthCard}>
      <Text style={styles.cardText}>Heart Rate History</Text>
    </TouchableOpacity>
  </ScrollView>
</View>
```
- **Line 83**: Cards container section
- **Line 84**: Horizontal scrollable cards
- **Lines 85-88**: Temperature History card
- **Lines 89-92**: Health Overview card
- **Lines 93-96**: Heart Rate History card

---

## **HistoryScreen.tsx** - Historical Records

### Lines 12-32: Sample Data
```typescript
const vitalRecords = [
  {dogName: "Dog name 1", records: [
    {heartRate: 75, temperature: 38.7, status: 'Normal', time: '7:38 am'},
    // ... more records
  ]},
  // ... more dogs
];
```
- **Lines 12-32**: Nested array structure: dogs → their vital records
- Each record has heartRate, temperature, status, and timestamp

### Lines 34-36: Navigation Function
```typescript
const navigateToVitals = (dogName: string) => {
  navigation.navigate('ProfilePageVitals');
};
```
- **Line 34**: Function that takes dog name
- **Line 35**: Navigates to vitals detail screen

### Lines 40-46: Header
```typescript
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text style={styles.backArrow}>‹</Text>
  </TouchableOpacity>
  <Text style={styles.title}>History</Text>
</View>
```
- **Line 40**: Header container
- **Line 41**: Back button
- **Line 42**: Goes back to previous screen
- **Line 43**: Left arrow symbol
- **Line 45**: Screen title

### Lines 49-79: Records Display
```typescript
{vitalRecords.map((dog, index) => (
  <View key={index} style={styles.dogSection}>
    <TouchableOpacity onPress={() => navigateToVitals(dog.dogName)}>
      <Text>{dog.dogName}'s Vital Status</Text>
      <Text>›</Text>
    </TouchableOpacity>
    {dog.records.map((record, recordIndex) => (
      <View key={recordIndex} style={styles.recordRow}>
        <Text style={styles.heartRate}>{record.heartRate} bpm</Text>
        <Text style={styles.temperature}>{record.temperature} C</Text>
        <Text style={styles.status}>{record.status}</Text>
        <Text style={styles.time}>{record.time}</Text>
      </View>
    ))}
  </View>
))}
```
- **Line 50**: Maps through each dog's records
- **Line 52**: Clickable section header
- **Line 57**: Displays dog's name + right arrow
- **Line 60**: Maps through records for this dog
- **Lines 62-67**: Displays heart rate (blue), temperature (green), status, time
- **Lines 68-69**: Closes record row
- **Line 70**: Closes inner map
- **Line 71**: Closes dog section
- **Line 72**: Closes outer map

---

## **ProfilePage.tsx** - User Profile

### Lines 12-18: Log Out Function
```typescript
const handleLogOut = () => {
  navigation.reset({
    index: 0,
    routes: [{name: 'SignIn'}],
  });
};
```
- **Line 12**: Defines log out handler
- **Line 13**: Resets navigation stack
- **Line 14**: Sets to first screen in new stack
- **Line 15**: Only route is SignIn
- **Line 16**: Closes routes array
- **Line 17**: Closes reset config

### Lines 20-26: Switch Account Function
```typescript
const handleSwitchAccount = () => {
  navigation.reset({
    index: 0,
    routes: [{name: 'SignIn'}],
  });
};
```
- Same as handleLogOut - returns to sign in screen

### Lines 40-47: Profile Display
```typescript
<View style={styles.profileSection}>
  <View style={styles.profileImage}>
    <Text style={styles.dogEmoji}>🐕</Text>
  </View>
  <Text style={styles.dogName}>Dog Name 1</Text>
  <Text style={styles.accountInfo}>gmail used</Text>
</View>
```
- **Line 40**: Profile section container
- **Lines 41-43**: Circular profile image with dog emoji
- **Line 44**: Displays dog name
- **Line 45**: Displays account email info
- **Line 46**: Closes profile section

### Lines 54-60: Switch Account Button
```typescript
<TouchableOpacity style={styles.actionItem} onPress={handleSwitchAccount}>
  <View style={styles.actionLeft}>
    <Text style={styles.actionIcon}>⇄</Text>
    <Text style={styles.actionText}>Switch Account</Text>
  </View>
  <Text style={styles.chevron}>›</Text>
</TouchableOpacity>
```
- **Line 54**: Pressable action item
- **Line 55**: Left side container
- **Line 56**: Double-arrow swap icon
- **Line 57**: "Switch Account" text
- **Line 59**: Right chevron arrow
- **Line 60**: Closes TouchableOpacity

### Lines 65-73: Log Out Button
```typescript
<TouchableOpacity style={styles.actionItem} onPress={handleLogOut}>
  <View style={styles.actionLeft}>
    <View style={styles.logoutIcon}>
      <Text style={styles.logoutSymbol}>🚪</Text>
    </View>
    <Text style={[styles.actionText, styles.logoutText]}>Log Out</Text>
  </View>
  <Text style={styles.chevron}>›</Text>
</TouchableOpacity>
```
- **Line 65**: Pressable action item
- **Line 66**: Left side container
- **Lines 67-69**: Door emoji icon
- **Line 70**: Red "Log Out" text (using multiple styles)
- **Line 72**: Right chevron arrow
- **Line 73**: Closes TouchableOpacity

---

## **ProfilePageVitals.tsx** - Detailed Charts

### Lines 13-22: Constants
```typescript
const {width} = Dimensions.get('window');
const ProfilePageVitals = ({navigation}: any) => {
  const dogName = "Dog Name 1";
  const heartRateData = [72, 73, 74, 73, 75, 73, 74, 76, 73];
  const maxHeartRate = Math.max(...heartRateData);
  const chartWidth = width - 80;
  const chartHeight = 150;
```
- **Line 13**: Gets screen width from device
- **Line 15**: Component definition
- **Line 16**: Hardcoded dog name
- **Line 19**: Sample data array for chart
- **Line 20**: Calculates highest value in data
- **Line 21**: Chart width (screen width minus padding)
- **Line 22**: Chart height constant

### Lines 24-33: Chart Path Generator
```typescript
const getChartPath = (data: number[]) => {
  if (data.length === 0) return '';
  const stepX = chartWidth / (data.length - 1);
  const points = data.map((value, index) => {
    const x = index * stepX;
    const y = chartHeight - ((value / maxHeartRate) * chartHeight);
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')}`;
};
```
- **Line 24**: Function to create SVG path string
- **Line 25**: Returns empty string if no data
- **Line 26**: Calculates horizontal spacing between points
- **Line 27**: Maps data to x,y coordinates
- **Line 28**: X position based on index
- **Line 29**: Y position (inverted: 0 at top, value at bottom)
- **Line 30**: Returns formatted coordinate string
- **Line 31**: Closes map
- **Line 32**: Returns SVG path starting with Move (M) then Lines (L)

### Lines 85-147: Heart Rate Chart
```typescript
<View style={styles.chartSection}>
  <Text style={styles.chartTitle}>Heartbeats per minute as of today</Text>
  <View style={styles.chartContainer}>
    <Svg width={chartWidth} height={chartHeight}>
      <Text x="0" y="10" fontSize="12" fill="#666">100</Text>
      <Text x="0" y="75" fontSize="12" fill="#666">80</Text>
      <Text x="0" y="140" fontSize="12" fill="#666">60</Text>
      <Path d={`M 0 0 L 0 ${chartHeight}`} stroke="#E0E0E0" strokeWidth="1" />
      <Path d={`M 0 ${chartHeight * 0.4} L ${chartWidth} ${chartHeight * 0.4}`} />
      <Path d={`M 0 ${chartHeight * 0.5} L ${chartWidth} ${chartHeight * 0.5}`} />
      <Path d={`M 0 ${chartHeight} L ${chartWidth} ${chartHeight}`} />
      <Path d={getChartPath(heartRateData)} stroke="#007AFF" strokeWidth="2" />
      {heartRateData.map((value, index) => {
        const x = (index / (heartRateData.length - 1)) * chartWidth;
        const y = chartHeight - ((value / maxHeartRate) * chartHeight);
        return <Circle key={index} cx={x} cy={y} r="4" fill="#007AFF" />;
      })}
    </Svg>
  </View>
</View>
```
- **Line 85**: Chart section container
- **Line 86**: Chart title
- **Line 87**: Chart container with border
- **Line 88**: Opens SVG with dimensions
- **Lines 90-98**: Y-axis labels (100, 80, 60) positioned vertically
- **Line 103**: Left vertical grid line
- **Line 108**: Top horizontal grid line at 40%
- **Line 113**: Middle horizontal grid line at 50%
- **Line 118**: Bottom horizontal grid line
- **Line 125**: Main blue data line using generated path
- **Line 132**: Maps data to create circles at each point
- **Line 133**: Calculates x position for circle
- **Line 134**: Calculates y position for circle
- **Line 136**: Renders blue circle at calculated position
- **Line 137**: Closes map
- **Line 138**: Closes SVG

### Lines 149-211: Temperature Chart
```typescript
<View style={styles.chartSection}>
  <Text>Temperature per 2 seconds as of today</Text>
  <View style={styles.chartContainer}>
    <Svg>
      <Text>40</Text>
      <Text>38</Text>
      <Text>36</Text>
      <Path stroke="#34C759" />
      {heartRateData.map(...)}
    </Svg>
  </View>
</View>
```
- **Line 149**: Temperature chart section
- **Line 151**: Temperature chart title
- **Line 152**: Chart container
- **Line 153**: Opens SVG
- **Lines 155-163**: Y-axis labels for temperature range (40, 38, 36)
- **Lines 166-185**: Grid lines (same structure as heart rate)
- **Line 188**: Green data line for temperature
- **Line 195**: Green data point circles
- **Line 209**: Closes SVG

---

## Summary of Navigation Flow

1. **App starts** → Shows SignInScreen
2. **User clicks Continue** → Replaces with Main (TabNavigator)
3. **User tabs** → Can switch between Home, History, Profile
4. **User clicks vital status** → Navigates to ProfilePageVitals
5. **User clicks back** → Returns to previous screen
6. **User logs out** → Resets to SignInScreen

Each screen is independently styled and handles its own data, with navigation managed by React Navigation library.














