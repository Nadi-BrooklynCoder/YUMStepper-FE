import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../Context/AuthContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const ProfileComponent = () => {
    // This will be the first tab component
    return (
        <View>
            <Text>This is the first component content (e.g., Profile details)</Text>
        </View>
    );
};

const StepsComponent = ({ steps }) => {
    // This will be the second tab component that displays steps
    return (
        <View>
            <Text>Steps: </Text>
            {steps.map((step, index) => (
                <Text key={index}>{step.step_count}</Text>
            ))}
        </View>
    );
};

const Profile = () => {
    const { userToken, userId, logout } = useContext(AuthContext); // Get token, userId, and logout from AuthContext
    const [user, setUser] = useState({});
    const [steps, setSteps] = useState([]);
    const navigation = useNavigation();

    // Fetch user profile data and steps
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
                setUser(response.data);
            } catch (err) {
                if (err.response) {
                    console.error('Error response:', err.response.data);
                    console.error('Status:', err.response.status);
                } else if (err.request) {
                    console.error('No response received:', err.request);
                } else {
                    console.error('Error', err.message);
                }
            }
        };

        const fetchSteps = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/${userId}/steps`, {
                    headers: { 'Authorization': `${userToken}` } 
                });
                setSteps(response.data);
            } catch (err) {
                if (err.response) {
                    console.error('Error response:', err.response.data);
                    console.error('Status:', err.response.status);
                } else if (err.request) {
                    console.error('No response received:', err.request);
                } else {
                    console.error('Error', err.message);
                }
            }
        };

        fetchUser();
        fetchSteps();
    }, [userId, userToken]);

    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
        navigation.navigate('Home'); // Navigate back to the Home screen after logout
    };

    if (!user || steps === null) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={{ flex: 1 }}>
            <Text>Profile of: {user.username}</Text>
            <Text>Email: {user.email}</Text>

            {/* Tab Navigator for swipeable components */}
            <Tab.Navigator
                screenOptions={{
                    tabBarIndicatorStyle: { backgroundColor: 'blue' }, // Custom styling
                    tabBarLabelStyle: { color: 'black' },
                    tabBarStyle: { backgroundColor: 'white' },
                }}
            >
                <Tab.Screen name="ProfileComponent" component={ProfileComponent} />
                <Tab.Screen name="StepsComponent">
                    {() => <StepsComponent steps={steps} />}
                </Tab.Screen>
            </Tab.Navigator>

            <Pressable onPress={() => navigation.navigate('Map', { userId: userId, token: userToken })}>
                <Text style={{ color: 'white', fontWeight: 'bold', padding: 20, backgroundColor: 'blue'}}>Go to Map</Text>
            </Pressable>

            <Pressable onPress={handleLogout} style={{ marginTop: 20 }}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text>
            </Pressable>
        </View>
    );
};

export default Profile;
