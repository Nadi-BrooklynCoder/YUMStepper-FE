import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Easing } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const MAX_POINTS = 10000;

const PointsContainer = () => {
    const { user, refreshTrigger } = useContext(AuthContext);

    // Log points whenever they change, useful for debugging
    useEffect(() => {
        console.log("PointsContainer received user.points_earned:", user?.points_earned);
    }, [user?.points_earned, refreshTrigger]);

    if (!user) return null; // If user data is not available, don't render the component

    const points = isNaN(Number(user.points_earned)) ? 0 : Number(user.points_earned); // Ensure points are valid
    const cycles = Math.floor(points / MAX_POINTS); // Number of completed cycles
    const remainingPoints = points % MAX_POINTS; // Points towards the next cycle
    const progressPercentage = (remainingPoints / MAX_POINTS) * 100; // Calculate percentage

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Points</Text>
            
            <AnimatedCircularProgress
                size={160} // Reduced size
                width={12} // Reduced width
                fill={isNaN(progressPercentage) ? 0 : progressPercentage}
                tintColor="#A41623"
                backgroundColor="#E0E0E0"
                lineCap="round"
                rotation={0}
                duration={1000}
                easing={Easing.inOut(Easing.ease)}
            >
                {() => (
                    <View style={styles.innerContent}>
                        <Text style={styles.pointsText}>
                            {isNaN(remainingPoints) ? 0 : remainingPoints} Points
                        </Text>
                    </View>
                )}
            </AnimatedCircularProgress>

            <Text style={styles.progressText}>
                {isNaN(remainingPoints) ? 0 : remainingPoints} / {MAX_POINTS} Points
            </Text>

            <Text style={styles.totalPointsText}>
                Total Points: {isNaN(points) ? 0 : points}
            </Text>

            {cycles > 0 && (
                <View style={styles.cycleBadgeContainer}>
                    <Text style={styles.cycleBadgeText}>
                        Completed Cycles: {cycles}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10, // Reduced margin
        backgroundColor: '#FFEEDD',
        padding: 15, // Reduced padding
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 20, // Reduced font size
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10, // Reduced margin bottom
    },
    pointsText: {
        fontSize: 20, // Reduced font size
        color: '#A41623',
        fontWeight: 'bold',
    },
    progressText: {
        fontSize: 14, // Reduced font size
        color: '#555555',
        marginTop: 5, // Reduced margin top
    },
    totalPointsText: {
        fontSize: 14, // Reduced font size
        color: '#555555',
        marginTop: 3, // Reduced margin top
    },
    innerContent: {
        alignItems: 'center',
    },
    cycleBadgeContainer: {
        marginTop: 10,
        backgroundColor: '#FFD700',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    cycleBadgeText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: 'bold',
    },
});

export default PointsContainer;
