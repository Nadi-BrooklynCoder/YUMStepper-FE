// PointsContainer.js

import { View, Text, StyleSheet } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../Context/AuthContext';

const PointsContainer = () => {
    const { userPoints } = useContext(AuthContext);

    useEffect(() => {
        console.log("PointsContainer received userPoints:", userPoints);
    }, [userPoints]);

    return (
        <View style={styles.container}>
            {userPoints !== undefined && userPoints !== null ? (
                <Text style={styles.pointsText}>Points: {userPoints}</Text>
            ) : (
                <Text style={styles.noPointsText}>No points data available.</Text>
            )}
        </View>
    );
    
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    pointsText: {
        fontSize: 16,
        color: '#333',
    },
    noPointsText: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
});

export default PointsContainer;
