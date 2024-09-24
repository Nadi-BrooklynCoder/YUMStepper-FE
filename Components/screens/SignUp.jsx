import React, { useState, useNavigate } from 'react';
import { View, TextInput, Button, StyleSheet} from 'react-native';
import axios from 'axios';

const SignUpForm = () => {
    

    const [newUser, setNewUser] = useState({
        username: "",
        email: "",
        password_hash: ""
    });

    const handleInputChange = (field, value) => {
        setNewUser((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleClick = () => {
        // console.log(newUser)
        axios.post(`http://localhost:5001/users`, newUser)
        .then(res => console.log(res.data))
        .then(newUser => navigate())
        .catch(error => console.error(error));

    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={newUser.username}
                onChangeText={(text) => handleInputChange("username", text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={newUser.email}
                onChangeText={(text) => handleInputChange("email", text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={newUser.password_hash}
                onChangeText={(text) => handleInputChange("password_hash", text)}
                secureTextEntry
            />

            <Button title="Sign Up" onPress={handleClick} />
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
        marginBottom: 20,
        borderRadius: 5,
    }
});

export default SignUpForm;
