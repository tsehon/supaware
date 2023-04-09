import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const registerUser = async () => {
        try {
            await axios.post(`${API_URL}/register`, {
                username,
                password,
            });
            // Navigate to the Login page after successful registration
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View>
            <Text>Register</Text>
            <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
            />
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
            />
            <Button title="Register" onPress={registerUser} />
        </View>
    );
};

export default RegisterPage;
