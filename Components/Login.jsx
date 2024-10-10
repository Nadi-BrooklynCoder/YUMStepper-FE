import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Keyboard } from 'react-native';
import React, { useContext, useState } from 'react';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AuthContext } from '../Context/AuthContext';

const LoginComponent = () => {
    const { login } = useContext(AuthContext);
    const navigation = useNavigation();

    const [isLoading, setIsLoading] = useState(false);
    const API = API_BASE_URL;

    const validationSchema = Yup.object({
        username: Yup.string().required('Username is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });

    const handleLogin = async (values) => {

        const loginData = {
            username: values.username.trim(),
            password_hash: values.password,
        };

        setIsLoading(true); // Start loading
        Keyboard.dismiss()

        try {
            console.log(loginData)
            const res = await axios.post(`${API_BASE_URL}/users/login`, loginData);
            const { token, user } = res.data;
            // Call login function to store token in AsyncStorage and update state
            await login(token, user.id);

            // Navigate to the Profile screen
            navigation.navigate('Profile');
        } catch (err) {
            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Status:', err.response.status);
            } else if (err.request) {
                console.error('No response received:', err.request);
            } else {
                console.error('Error', err.message);
            }
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={(values) => handleLogin(values)}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            onChangeText={handleChange('username')}
                            onBlur={handleBlur('username')}
                            value={values.username}
                        />
                        {touched.username && errors.username && <Text style={styles.error}>{errors.username}</Text>}

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            secureTextEntry
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                        />
                        {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}
                        {/* Loading Spinner */}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#007BFF" />
                        ) : (
                            <>
                                <Pressable onPress={handleSubmit} role="button" style={styles.button}>
                                    <Text style={styles.buttonText}>Login</Text>
                                </Pressable>
                                <Pressable onPress={() => navigation.navigate('SignUp')} style={styles.link}>
                                    <Text style={styles.linkText}>No Account? Sign-up Here</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                )}
            </Formik>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'antiquewhite',
        height: 600,
    },
    title: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#faebd7',
    },
    input: {
        borderWidth: 2,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#F2632F',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    link: {
        marginTop: 15,
        alignItems: 'center',
    },
    linkText: {
        color: '#007BFF',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default LoginComponent;