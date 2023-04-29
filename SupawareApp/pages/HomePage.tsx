import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { TouchableOpacity } from 'react-native-gesture-handler';

const HomePage: React.FC = () => {
    const { userToken } = useContext(AuthContext);

    const [devices, setDevices] = useState([]);

    useEffect(() => {
        const getDevices = async () => {
            try {
                const response = await axios.get(`/devices`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                });
                setDevices(response.data.devices);
            } catch (error) {
                console.error(error);
            }
        };
        getDevices();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View>
                <Text>Devices</Text>
                {devices.map((item, index) => (
                    <TouchableOpacity key={index}>
                        <Text>{item}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default HomePage;
