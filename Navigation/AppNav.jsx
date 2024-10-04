import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../Context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// SCREENS
import Login from '../Screens/Login';
import Home from '../Screens/Home';
import Profile from '../Screens/Profile';
import SignUp from '../Screens/SignUp';
import Rewards from '../Screens/Rewards';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNav = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Profile" component={Profile} />
            <Tab.Screen name="Rewards" component={Rewards} />
        </Tab.Navigator>
    );
};

const AppNav = () => {
    const { isLoading, isAuthenticated } = useContext(AuthContext);

    // Show loading spinner while authentication is being verified
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {isAuthenticated ? (
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
                        <Stack.Screen name="Profile" component={Profile} />

                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNav;
