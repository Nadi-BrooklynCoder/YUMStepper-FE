import { View, Text, StyleSheet } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import StepsCard from './StepsCard';

const StepsContainer = () => {
    const { userSteps, stepsToPoints } = useContext(AuthContext);

    useEffect(() => {
        console.log("StepsContainer received userSteps:", userSteps);
    }, [userSteps]);

    return (
        <View style={styles.container}>
            {userSteps ? (
                // Check if userSteps is an array
                Array.isArray(userSteps) ? (
                    userSteps.length > 0 ? (
                        userSteps.map((step) => (
                            <StepsCard key={step.id} step={step} />
                        ))
                    ) : (
                        <Text style={styles.noStepsText}>No steps data available.</Text>
                    )
                ) : (
                    // If userSteps is an object
                    <StepsCard step={userSteps} />
                )
            ) : (
                <Text style={styles.noStepsText}>No steps data available.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        padding: 10,
        borderRadius: 150, // Ensure the circular style fits your design
        height: 300,
        width: 300,
        borderWidth: 25,
        borderColor: '#A41623',
        justifyContent: 'center',
        alignItems: 'center', // Fixed alignment typo
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    noStepsText: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
        textAlign: 'center', // Ensure text is centered
    },
});

export default StepsContainer;
