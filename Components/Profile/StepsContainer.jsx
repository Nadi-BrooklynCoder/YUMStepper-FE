import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Easing } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const MAX_STEPS = 10000;

const StepsContainer = () => {
    const { userSteps, stepsHistory, userToken } = useContext(AuthContext);

    // Mock value for testing purposes
    const mockSteps = 973;

    useEffect(() => {
        if (userSteps) {
            console.log("StepsContainer received userSteps:", userSteps);
        } else {
            console.log("StepsContainer: userSteps is null or undefined");
        }
    }, [userSteps]);

    if (!userToken) {
        return null; // Or display a message prompting the user to log in
    }

    // Use mockSteps if you want to mock the progress
    const todaySteps = Number(userSteps?.step_count) || mockSteps;
    const stepPercentage = (todaySteps / MAX_STEPS) * 100; // Calculate percentage for today's steps
    const totalSteps = stepsHistory?.reduce((acc, step) => acc + (Number(step.total_steps) || 0), 0) || 0;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Today's Steps</Text>
            
            <AnimatedCircularProgress
                size={160} // Reduced size
                width={12} // Reduced width
                fill={isNaN(stepPercentage) ? 0 : stepPercentage}
                tintColor="#A41623"
                backgroundColor="#E0E0E0"
                lineCap="round"
                rotation={0}
                duration={1000}
                easing={Easing.inOut(Easing.ease)}
            >
                {() => (
                    <View style={styles.innerContent}>
                        <Text style={styles.stepsText}>{todaySteps} Steps</Text>
                        <Text style={styles.footnoteText}>1000 steps = 10 points</Text>
                    </View>
                )}
            </AnimatedCircularProgress>

            <Text style={styles.progressText}>
                {todaySteps} / {MAX_STEPS} Steps Today
            </Text>

            <Text style={styles.totalStepsText}>
                Total Steps Since Sign-Up: {totalSteps}
            </Text>
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
    stepsText: {
        fontSize: 20, // Reduced font size
        color: '#A41623',
        fontWeight: 'bold',
    },
    footnoteText: {
        fontSize: 10, // Reduced font size
        color: '#555555',
        marginTop: 3, // Reduced margin top
    },
    progressText: {
        fontSize: 14, // Reduced font size
        color: '#555555',
        marginTop: 5, // Reduced margin top
    },
    totalStepsText: {
        fontSize: 14, // Reduced font size
        color: '#555555',
        marginTop: 3, // Reduced margin top
    },
    innerContent: {
        alignItems: 'center',
    },
});

export default StepsContainer;
