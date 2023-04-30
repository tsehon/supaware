import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Device, { getConnectedDeviceArray, getDeviceArray } from '../interfaces/DeviceInterface';
import { AuthContext } from '../contexts/AuthContext';

const Devices: React.FC = () => {
    const { userToken } = useContext(AuthContext);
    const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
    const [disconnectedDevices, setDisonnectedDevices] = useState<Device[]>([]);
    const [userDisconnectedDevice, setUserDisconnectedDevice] = useState(false);



    useEffect(() => {
        const getDevices = async () => {
            setDisonnectedDevices(getDeviceArray());

            if (userToken === null) {
                console.log('No user token')
                setConnectedDevices([]);
                return;
            }

            try {
                const connected = await getConnectedDeviceArray(userToken);
                setConnectedDevices(connected);
                console.log('Connected devices:', connected);
                const devices = getDeviceArray();
                setDisonnectedDevices(
                    devices.filter(
                        (item) => !connected.some((connectedDevice) => connectedDevice.name === item.name)
                    )
                );
                console.log('Disconnected devices:', disconnectedDevices);
            }
            catch (error) {
                console.error(error);
            }
        };

        const getConnected = async () => {
            setDisonnectedDevices(getDeviceArray());

            if (userToken === null) {
                console.log('No user token')
                setConnectedDevices([]);
                return;
            }

            const connected = await getConnectedDeviceArray(userToken);
            setConnectedDevices(connected);
            console.log('Connected devices:', connected);
        };

        const getDisconnected = async (connected: Device[]) => {
            const devices = getDeviceArray();
            setDisonnectedDevices(
                devices.filter(
                    (item) => !connected.some((connectedDevice) => connectedDevice.name === item.name)
                )
            );
        };

        getConnected().then(() => {
            getDisconnected(connectedDevices);
        }).then(() => {
            setUserDisconnectedDevice(false);
        });
    }, [userToken, userDisconnectedDevice]);

    if (!userToken) {
        return (
            <View style={styles.container}>
                <Text>Please log in to access devices</Text>
            </View>
        );
    }

    const disconnect = async (device: Device) => {
        try {
            device.disconnect().then(() => {
                setUserDisconnectedDevice(true);
            });
        }
        catch (error) {
            console.error(error);
        }
    };

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
