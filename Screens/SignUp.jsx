import React, { useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../Context/AuthContext';

const SignUpForm = () => {
    const { login } = useContext(AuthContext); 
    const navigation = useNavigation(); 

    // Form validation schema using Yup
    const validationSchema = Yup.object({
        username: Yup.string().required('Username is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password_hash: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });

    const handleSignUp = async (values) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users`, values);
            const { token, newUser } = response.data;
    
            if (newUser && newUser.id && token) {
                // Update the context with token and userId
                await login(token, newUser.id, navigation);
                
                // Notify user of successful registration
                Alert.alert('Success', 'User registered successfully!');
            } else {
                throw new Error("User registration failed");
            }
        } catch (error) {
            console.error('Error signing up:', error);
            
            let errorMessage = 'There was an error during sign up. Please try again.';
            
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }
            
            Alert.alert('Error', errorMessage);
        }
    };
    
    

    return (
        <View style={styles.container}>
            <Formik
                initialValues={{ username: '', email: '', password_hash: '' }}
                validationSchema={validationSchema}
                onSubmit={(values) => handleSignUp(values)}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={values.username}
                            onChangeText={handleChange('username')}
                            onBlur={handleBlur('username')}
                        />
                        {touched.username && errors.username && (
                            <Text style={styles.error}>{errors.username}</Text>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            keyboardType="email-address"
                        />
                        {touched.email && errors.email && (
                            <Text style={styles.error}>{errors.email}</Text>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={values.password_hash}
                            onChangeText={handleChange('password_hash')}
                            onBlur={handleBlur('password_hash')}
                            secureTextEntry
                        />
                        {touched.password_hash && errors.password_hash && (
                            <Text style={styles.error}>{errors.password_hash}</Text>
                        )}

                        <Button title="Sign Up" onPress={handleSubmit} />
                    </View>
                )}
            </Formik>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
});

export default SignUpForm;
