import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const StepsContainer = () => {
    const { userSteps } = useContext(AuthContext);

    useEffect(() => {
        console.log("StepsContainer received userSteps.step_count:", userSteps.step_count);
    }, [userSteps.step_count]);

    const steps = userSteps.step_count ?? 0;
    const stepPercentage = (steps % 10000) / 100; // Example max steps 10,000

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Steps</Text>
            <AnimatedCircularProgress
                size={220} // Increased size for larger container
                width={18}
                fill={stepPercentage}
                tintColor="#A41623"
                backgroundColor="#E0E0E0"
                lineCap="round"
                rotation={0}
                shadowColor="rgba(0, 102, 255, 0.5)" // Blue shadow effect
            >
                {() => (
                    <Text style={styles.stepsText}>{steps} Steps</Text>
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
    stepsText: {
        fontSize: 24, 
        color: '#A41623',
        fontWeight: 'bold',
    },
});

export default StepsContainer;
