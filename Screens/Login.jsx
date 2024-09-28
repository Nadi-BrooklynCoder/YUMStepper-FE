import { View, StyleSheet } from 'react-native';
import React from 'react';
import LoginComponent from '../Components/Login';

const Login = () => {  

    return (
        <View style={styles.header}>
            <LoginComponent/>
        </View>
    );
};
const styles = StyleSheet.create({
    header:{
        backgroundColor:'#007BFF',
    },
})


export default Login;
