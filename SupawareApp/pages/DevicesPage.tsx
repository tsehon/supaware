import React, { useContext, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Device, { getConnectedDeviceArray, getDeviceArray } from '../interfaces/DeviceInterface';
import { AuthContext } from '../contexts/AuthContext';

const Devices: React.FC = () => {
    const { userToken } = useContext(AuthContext);
    const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
    const [disconnectedDevices, setDisonnectedDevices] = useState<Device[]>([]);

    useEffect(() => {
        const getDevices = async () => {
            const devices = getDeviceArray();
            try {
                const connected = await getConnectedDeviceArray(userToken);
                setConnectedDevices(connected);
                setDisonnectedDevices(
                    devices.filter(
                        (item) => !connected.some((connectedDevice) => connectedDevice.name === item.name)
                    )
                );
            }
            catch (error) {
                console.error(error);
            }
        };
        getDevices();
    }, []);

    if (!userToken) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Please log in to access devices</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View>
                <Text>Connected Devices:</Text>
                {connectedDevices.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => { item.authRequest(userToken) }}>
                        <Text>Disconnect {item.name} </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View>
                <Text>New Device?</Text>
                {disconnectedDevices.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => { item.authRequest(userToken) }}>
                        <Text>Connect {item.name} </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View >
    );
};

export default Devices;
