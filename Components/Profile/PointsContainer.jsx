import { View, Text, StyleSheet } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AuthContext } from '../../Context/AuthContext';
import StepsCard from './StepsCard'; // Make sure to import your StepsCard component

const PointsContainer = () => {
    const { userId } = useContext(AuthContext); // Keep it as is
    const [steps, setSteps] = useState([]);

    useEffect(() => {
        const fetchSteps = async () => {
            try {
                const response = await axios.get(`https://demo-day-be.onrender.com/users/${userId}/steps`, {
                    headers: { 'Authorization': `${userToken}` } // userToken needs to be defined appropriately
                });
                Array.isArray(response.data) && setSteps(response.data);
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

        fetchSteps();
    }, [userId]); // Only include userId as a dependency

    return (
        <View style={styles.container}> {/* Apply styles here */}
            <Text style={styles.title}>Steps:</Text>
            {steps.map((step, index) => (
                <StepsCard step={step} key={index} user={userId} /> 
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F2632F', // Set the background color
        padding: 20, // Add padding for better layout
        borderRadius: 10, // Optional: rounded corners
    },
   
});

export default PointsContainer;
