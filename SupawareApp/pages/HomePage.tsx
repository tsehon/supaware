import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Device, { getConnectedDeviceArray } from '../interfaces/DeviceInterface';

const HomePage: React.FC = () => {
    const { userToken } = useContext(AuthContext);
    const [devices, setDevices] = useState<Device[]>([]);

    useEffect(() => {
        const getDevices = async () => {
            try {
                const devices = await getConnectedDeviceArray(userToken);
                setDevices(devices);
            }
            catch (error) {
                console.error(error);
            }
        };
        getDevices();
    }, []);

    if (!devices) {
        return null;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View>
                <Text>Your Devices</Text>
                {devices.map((item, index) => (
                    <TouchableOpacity key={index}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default HomePage;
