import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Device, { getDeviceInstancesArray } from '../interfaces/DeviceInterface';

const HomePage: React.FC = () => {
    const { userToken } = useContext(AuthContext);
    const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);

    useEffect(() => {
        const updateDevices = async () => {
            const devices = getDeviceInstancesArray();
            setConnectedDevices(devices.filter((device) => device.is_connected));
            console.log("Updating devices: ", devices);
        };

        updateDevices();
    }, [userToken]);

    if (!connectedDevices) {
        return null;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View>
                <Text>Your Devices</Text>
                {connectedDevices.map((item, index) => (
                    <TouchableOpacity key={index}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default HomePage;
