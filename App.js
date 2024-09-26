import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Screens/Login';
import Home from './Screens/Home';
import Profile from './Screens/Profile';

export default function App() {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
          backgroundColor: '#3498DB',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={Home}
          options={{
            title: 'YUM Stepper',

          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={Profile}
          options={{
            title: 'My Profile',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}