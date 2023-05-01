import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Device, { configureDeviceInstances, fetchHealthInsights, getDeviceInstancesArray, getHealthInsights } from '../interfaces/DeviceInterface';

const HomePage: React.FC = () => {
    const { userToken } = useContext(AuthContext);
    const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
    const [healthInsights, setHealthInsights] = useState<string>("");

    useEffect(() => {
        const updateDevices = async () => {
            if (!userToken) {
                return;
            }
            await configureDeviceInstances(userToken);
            const devices = getDeviceInstancesArray();
            setConnectedDevices(devices.filter((device) => device.is_connected));
            console.log("Updating devices: ", devices);
            await fetchHealthInsights();
        };

        if (userToken) {
            updateDevices();
        }

        const healthInsights = getHealthInsights();
        if (healthInsights) {
            setHealthInsights(healthInsights);
        }
    }, [userToken]);

    if (!connectedDevices) {
        return null;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View>
                <Text>Health Insights</Text>
                <Text>{healthInsights}</Text>
            </View>
            <View>
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
