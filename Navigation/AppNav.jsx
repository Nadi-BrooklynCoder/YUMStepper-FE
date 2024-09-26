import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../Context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SCREENS
import Login from '../Screens/Login';
import Home from '../Screens/Home';
import Profile from '../Screens/Profile';
import SignUp from '../Screens/SignUp';
import Map from '../Screens/Map';

const AppNav = () => {
    const Stack = createStackNavigator();
    const { isLoading, userToken } = useContext(AuthContext);

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
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="Map" component={Map} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="SignUp" component={SignUp} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNav;
