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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app (Home, History, Profile)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
      }}>
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
    </Tab.Navigator>
  );
}

// Simple icon component (you can replace with react-native-vector-icons)
function TabBarIcon({icon, color, size}: {icon: string; color: string; size: number}) {
  const icons: any = {
    home: '🏠',
    clock: '🕐',
    user: '👤',
  };
  return <Text style={{fontSize: size, color}}>{icons[icon] || '•'}</Text>;
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main" screenOptions={{headerShown: false}}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="ProfilePageVitals" component={ProfilePageVitals} />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

