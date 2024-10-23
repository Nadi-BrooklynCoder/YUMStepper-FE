// StepsCard.js

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
// import LottieView from 'lottie-react-native';


const StepsCard = ({ step }) => {
    console.log("StepsCard step prop:", step);

    return (
        <View style={styles.card}>
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
    //     padding: 15,
    //     marginVertical: 8,
    //     backgroundColor: '#f0f0f0',
    //     borderRadius: 1000,
    //     width: 300,
    //     height: 300,
    //     borderWidth: 5,
    //     borderColor: '#A41623'
    // },

    card: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    valueText: {
        // flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        // alignItems: 'center',
        // justifyContent: 'center',
        textAlign: 'center',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        // alignItems: 'center',
        // justifyContent: 'center',
        textAlign: 'center',
    },
});

export default StepsCard;
