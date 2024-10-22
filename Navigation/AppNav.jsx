import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../Context/AuthContext';

// SCREENS
import Login from '../Screens/Login';
import Home from '../Screens/Home';
import Profile from '../Screens/Profile';
import SignUp from '../Screens/SignUp';
import Rewards from '../Screens/Rewards';
import Map from '../Screens/Map';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator Component
const BottomTabNav = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#9b1422', // Set your custom burgundy color
        },
        headerTintColor: 'antiquewhite', // Set the color for the text and icons
        headerTitleStyle: {
          fontWeight: 'bold', // Style the header title text
        },
      }}
    >
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Rewards" component={Rewards} />
      <Tab.Screen name="Map" component={Map} />
    </Tab.Navigator>
  );
};

// App Navigation Component
const AppNav = () => {
  const { userToken } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#9b1422', // Set your custom color here
          },
          headerTintColor: 'antiquewhite', // Set the color for the text and icons
          headerTitleStyle: {
            fontWeight: 'bold', // Style the header title text
          },
        }}
      >
        {userToken ? (
          // User is authenticated, show bottom tab navigator
          <Stack.Screen
            name="MainApp"
            component={BottomTabNav}
            options={{ headerShown: false }} // Hide the header for bottom tabs
          />
        ) : (
          // User is not authenticated, show login/signup screens
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNav;
