import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Device, { getConnectedDeviceArray, getDeviceArray } from '../interfaces/DeviceInterface';
import { AuthContext } from '../contexts/AuthContext';

const Devices: React.FC = () => {
    const { userToken } = useContext(AuthContext);
    const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
    const [disconnectedDevices, setDisonnectedDevices] = useState<Device[]>([]);

    useEffect(() => {
        const getConnected = async () => {
            const devices = getDeviceArray();
            console.log('All devices:', devices);

            if (userToken === null) {
                console.log('No user token');
                setConnectedDevices([]);
                setDisonnectedDevices(devices);
            } else {
                console.log('Attempting to fetch connected devices');
                const connected = await getConnectedDeviceArray(userToken);
                console.log('Setting connected devices:', connected);
                setConnectedDevices(connected);
                const disconnected = devices.filter(
                    (item) => !connected.some((connectedDevice) => connectedDevice.name === item.name)
                );
                if (disconnected !== disconnectedDevices) {
                    console.log('Setting disconnected devices:', disconnected);
                    setDisonnectedDevices(disconnected);
                }
            }
        };

        getConnected();
    }, [userToken]);

    const disconnect = async (device: Device) => {
        try {
            await device.disconnect();
            setConnectedDevices((prev) => prev.filter((d) => d.name !== device.name));
            setDisonnectedDevices((prev) => [...prev, device]);
        } catch (error) {
            console.error(error);
        }
    };

    if (!userToken) {
        return (
            <View style={styles.container}>
                <Text>Please log in to access devices</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Connected Devices:</Text>
                {connectedDevices.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => { disconnect(item) }} style={styles.deviceItem}>
                        <Text>Disconnect {item.name} </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>New Device?</Text>
                {disconnectedDevices.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => { item.authRequest(userToken) }} style={styles.deviceItem}>
                        <Text>Connect {item.name} </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    section: {
        width: '100%',
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    deviceItem: {
        padding: 10,
        marginBottom: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'black',
    },
});

export default Devices;
