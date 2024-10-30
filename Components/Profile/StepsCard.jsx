import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
// import LottieView from 'lottie-react-native';

const StepsCard = ({ step }) => {
    console.log("StepsCard step prop:", step);

    return (
        <View style={styles.card}>
            {/* Uncomment if using Lottie animation */}
            {/* <LottieView 
                source={require('../../assets/yummm.png')}
                autoplay
                loop
                style={styles.yumStepperAnimation}
            /> */}
            <Text style={styles.valueText}>
                Steps: {step.step_count}
            </Text>
            <Text style={styles.dateText}>Date: {step.date}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    // card: {
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     padding: 15,
    //     marginVertical: 8,
    //     backgroundColor: '#f9f9f9', // Lighter background for contrast
    //     borderRadius: 10, // Rounded corners
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 5,
    //     elevation: 3, // Shadow for Android
    // },
    valueText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    // Uncomment if using Lottie animation
    // yumStepperAnimation: {
    //     width: 100,
    //     height: 100,
    // },
});

export default StepsCard;
