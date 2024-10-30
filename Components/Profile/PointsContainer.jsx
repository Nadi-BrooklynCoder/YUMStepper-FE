import { View, Text, StyleSheet } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../Context/AuthContext';

const PointsContainer = () => {
    const { userPoints } = useContext(AuthContext);

    useEffect(() => {
        console.log("PointsContainer received userPoints:", userPoints);
    }, [userPoints]);

    // Provide a fallback value of 0 for userPoints if it's undefined or null
    const points = userPoints ?? 0;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Points</Text>
            <Text style={points > 0 ? styles.pointsText : styles.noPointsText}>
                {points > 0 ? `Points: ${points}` : 'No points data available.'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, // For Android shadow
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
    },
    pointsText: {
        fontSize: 16,
        color: '#28a745', // Success green color for points
    },
    noPointsText: {
        fontSize: 16,
        color: '#dc3545', // Red color for no points message
    },
});

export default PointsContainer;
