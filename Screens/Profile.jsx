import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';

const Profile = ({ route }) => {
    const { userId, token } = route.params;
    const [user, setUser] = useState(null);
    const [ steps, setSteps ] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
                setUser(response.data);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
            }
        };

        const fetchSteps = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/${userId}/steps`)
                
            } catch (err) {
                console.error('Failed to fetch user steps:', err);   
            }
        }

        fetchUser();
    }, [userId]);

    if (!user) {
        return <Text>Loading...</Text>;
    }

    return (
        <View>
            <Text>Profile of: {user.username}</Text>
            <Text>Email: {user.email}</Text>
            <Pressable
                onPress={() => navigation.navigate('Map')} 
            >
                <Text >Go to Map</Text>
            </Pressable>
        </View>
    );
};

export default Profile;
