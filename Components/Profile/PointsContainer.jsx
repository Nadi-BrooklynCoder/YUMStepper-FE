import { View, Text, StyleSheet } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AuthContext } from '../../Context/AuthContext';
import StepsCard from './StepsCard'; 

const PointsContainer = () => {
    const { userId } = useContext(AuthContext); // Keep it as is
    const [steps, setSteps] = useState([]);

    useEffect(() => {
        const fetchSteps = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/${userId}/steps`, {
                    headers: { 'Authorization': `${userToken}` }
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
    }, [userId]); 

    return (
        <View style={styles.container}> 
            <Text style={styles.title}>Steps:</Text>
            {steps.map((step, index) => (
                <StepsCard step={step} key={index} user={userId} /> 
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F2632F', 
        padding: 20, 
        borderRadius: 10,
    },
   
});

export default PointsContainer;