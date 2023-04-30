import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getConnectedDeviceArray, getDeviceArray } from '../interfaces/DeviceInterface';
import { AuthContext } from '../contexts/AuthContext';

const Devices: React.FC = () => {
    const { userToken } = useContext(AuthContext);
    const devices = getDeviceArray();
    const connected = getConnectedDeviceArray(userToken);

    if (!userToken) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Please log in to access devices</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Devices Page</Text>
            {devices.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => { item.authRequest(userToken) }}>
                    <Text>Connect {item.name} </Text>
                </TouchableOpacity>
            ))}
        </View >
    );
};

export default Devices;
