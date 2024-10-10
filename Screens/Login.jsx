import { View, StyleSheet, Text } from 'react-native';
import React from 'react';
import LoginComponent from '../Components/Login';

const Login = () => {  

    return (
        <View style={styles.header}>
            <Text>LOGIN </Text>
            <LoginComponent/>
        </View>
    );
};
const styles = StyleSheet.create({
    header:{
        backgroundColor:'#faebd7',
        height:'100%',
    },
})


export default Login;
