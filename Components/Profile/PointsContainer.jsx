import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const PointsContainer = () => {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        console.log("PointsContainer received user.points_earned:", user.points_earned);
    }, [user.points_earned]);

    const points = user.points_earned ?? 0;
    const progressPercentage = (points % 600) / 6; // Example max points 600 for a full circle

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Points</Text>
            <AnimatedCircularProgress
                size={220} // Increased size
                width={18}
                fill={progressPercentage}
                tintColor="#A41623"
                backgroundColor="#E0E0E0"
                lineCap="round"
                rotation={0}
                shadowColor="rgba(0, 102, 255, 0.5)" // Blue shadow effect
            >
                {() => (
                    <Text style={styles.pointsText}>{points} Points</Text>
                )}
            </AnimatedCircularProgress>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center', 
        flex: 1,
        backgroundColor: '#FFEEDD',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15,
    },
    pointsText: {
        fontSize: 24,
        color: '#A41623',
        fontWeight: 'bold',
    },
});

export default PointsContainer;
