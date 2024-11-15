import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StepsCard = ({ step }) => {
    const {
        step_count = 'N/A',
        points_earned = 'N/A',
        date,
        restaurant_name,
        point_multiplier,
    } = step;

    return (
        <View style={styles.card}>
            <Text style={styles.dateText}>Date: {date || 'N/A'}</Text>
            <Text style={styles.stepText}>Steps: {step_count}</Text>
            <Text style={styles.pointsText}>Points Earned: {points_earned}</Text>
            {restaurant_name && (
                <Text style={styles.restaurantText}>
                    Restaurant: {restaurant_name}
                </Text>
            )}
            {point_multiplier && (
                <Text style={styles.multiplierText}>
                    Multiplier: {point_multiplier}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 20,
        marginVertical: 12,
        backgroundColor: '#FFF5E1',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderColor: '#A41623',
        borderWidth: 1,
    },
    dateText: {
        fontSize: 18,
        fontFamily: 'Itim', // Assuming a custom font like Itim
        color: '#A41623',
        marginBottom: 8,
    },
    stepText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F85E00',
        marginBottom: 5,
    },
    pointsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#198754',
        marginBottom: 5,
    },
    restaurantText: {
        fontSize: 16,
        color: '#444',
    },
    multiplierText: {
        fontSize: 16,
        color: '#444',
        marginTop: 5,
    },
});

export default StepsCard;
