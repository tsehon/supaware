import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';
import { API_URL } from 'react-native-dotenv';
import { AuthContext } from '../App';

const LoginPage = ({ navigation }) => {
    const { signIn } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const loginUser = async () => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                username,
                password,
            });
            signIn(response.data.token);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View>
            <Text>Login</Text>
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
            <Button title="Login" onPress={loginUser} />
            <Button
                title="Don't have an account? Register"
                onPress={() => navigation.navigate('Register')}
            />
        </View>
    );
};

export default LoginPage;
