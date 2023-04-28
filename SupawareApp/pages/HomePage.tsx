import React, { useState, useEffect, useContext } from 'react';
import { View, Text } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

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
            </View>
        </View>
    );
};

export default HomePage;
