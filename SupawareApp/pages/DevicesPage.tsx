import React from 'react';
import { View, Text, Button } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const devices = [
    { title: 'Oura', auth: 'OuraIntegration.tsx' },
];

const Devices: React.FC = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Devices Page</Text>
            <TouchableOpacity>
                <Text>Connect Oura</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Devices;
