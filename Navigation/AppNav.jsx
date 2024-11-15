import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../Context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons'; // Import FontAwesome5 icons

// SCREENS
import Login from '../Screens/Login';
import Home from '../Screens/Home';
import Profile from '../Screens/ProfileSlider';
import SignUp from '../Screens/SignUp';
import Rewards from '../Screens/Rewards';
import CustomMap from '../Screens/CustomMap';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator Component
const BottomTabNav = ({ onCheckinComplete }) => {
  return (
    <Tab.Navigator
      initialRouteName="Map" // Set Map as the default screen
      screenOptions={{
        headerStyle: {
          backgroundColor: '#9b1422', // Set your custom burgundy color
        },
        headerTintColor: 'antiquewhite', // Set the color for the text and icons
        headerTitleStyle: {
          fontWeight: 'bold', // Style the header title text
        },
        tabBarStyle: {
          backgroundColor: '#9b1422', // Background color for bottom tab
        },
        tabBarActiveTintColor: '#FFD700', // Active tab color
        tabBarInactiveTintColor: 'antiquewhite', // Inactive tab color
      }}
    >
      <Tab.Screen 
        name="Map" 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="map-marker-alt" size={size} color={color} />
          ),
          title: 'Map',
        }}
      >
        {() => <CustomMap onCheckinComplete={onCheckinComplete} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="utensils" size={size} color={color} />
          ),
          title: 'Profile',
        }}
      />
      
      <Tab.Screen 
        name="Rewards" 
        component={Rewards} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="pizza-slice" size={size} color={color} />
          ),
          title: 'Rewards',
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigation Component
const AppNav = () => {
  const { userToken } = useContext(AuthContext);

  // Define onCheckinComplete function
  const onCheckinComplete = () => {
    // Code to handle check-in completion
    console.log("Check-in completed.");
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#9b1422',
          },
          headerTintColor: 'antiquewhite',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {userToken ? (
          // Main application flow
          <Stack.Screen
            name="MainApp"
            options={{ headerShown: false }}
          >
            {() => <BottomTabNav onCheckinComplete={onCheckinComplete} />}
          </Stack.Screen>
        ) : (
          // Authentication flow
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
