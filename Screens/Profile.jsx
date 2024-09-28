import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../Context/AuthContext';


const Profile = () => {
    const { userToken, userId, logout } = useContext(AuthContext); // Get token, userId, and logout from AuthContext
    const [user, setUser] = useState(null);
    const [steps, setSteps] = useState(null);
    const navigation = useNavigation();

    // Fetch user profile data
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
                // if (err.response) {
                //     console.error('Error response:', err.response.data);
                //     console.error('Status:', err.response.status);
                // } else if (err.request) {
                //     console.error('No response received:', err.request);
                // } else {
                //     console.error('Error', err.message);
                // }
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
        <View>
            <Text>Profile of: {user.username}</Text>
            <Text>Email: {user.email}</Text>
            {steps.map((step, index) => (
                <Text key={index}>Steps: {step.step_count}</Text>
            ))}

            <Pressable onPress={() => navigation.navigate('Map', { userId: userId, token: userToken })}>
                <Text style={{ color: 'white', fontWeight: 'bold', padding: '20px', backgroundColor: 'blue'}}>Go to Map</Text>
            </Pressable>

            <Pressable onPress={handleLogout} style={{ marginTop: 20 }}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text>
            </Pressable>
        </View>
    );
};

export default Profile;
