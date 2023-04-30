import { Oura } from "../devices/oura/Oura";
import axios from "axios";

export default interface Device {
    name: string;
    image: any;
    owner: string;

    authRequest: (userToken: string) => Promise<void>;
    authCallback: (event: any) => Promise<void>;
    refresh(): Promise<void>;
    disconnect(): Promise<void>;
}

type DeviceConstructor = new () => Device;

export const deviceMapping: Record<string, DeviceConstructor> = {
    "oura": Oura,
};

const deviceInstances: Record<string, Device> = {};

export function createDevice(deviceType: string): Device | null {
    if (deviceType === "" || deviceType === null || deviceType === undefined) {
        console.error('Invalid device type:', deviceType);
        return null;
    } else {
        deviceType = deviceType.toLowerCase();
    }

    if (deviceInstances[deviceType]) {
        console.log('Returning existing device instance:', deviceInstances[deviceType]);
        return deviceInstances[deviceType];
    }

    const DeviceClass = deviceMapping[deviceType];

    if (DeviceClass) {
        const newInstance = new DeviceClass();
        deviceInstances[deviceType] = newInstance;
        return newInstance;
    } else {
        console.error('Invalid device type:', deviceType);
        return null;
    }
}

export function getDeviceArray(): Device[] {
    const device_types: string[] = Object.keys(deviceMapping);

    const devices = device_types.map((device_type) => {
        const object = createDevice(device_type);

        if (!object) {
            console.error('Invalid device type:', device_type);
            return null;
        }

        return object;
    }).filter((device): device is NonNullable<typeof device> => device !== null)

    return devices;
}

export async function getConnectedDeviceArray(userToken: string | null): Promise<Device[]> {
    console.log('Getting connected devices...');
    if (!userToken) {
        return [];
    }

    const connectedDevices: Device[] = [];

    try {
        const response = await axios.get(`/devices`, {
            headers: {
                authorization: `${userToken}`,
            }
        })
            .then((response) => {
                console.log('Axios request to /devices completed.');
                if (response.data && Array.isArray(response.data)) {
                    response.data.forEach((device: any) => {
                        const deviceInstance = createDevice(device);
                        if (deviceInstance) {
                            deviceInstance.owner = device.owner;
                            connectedDevices.push(deviceInstance);
                        }
                    });
                }
            })
            .catch((error) => {
                console.log('Axios request to /devices failed. Error:', error);
            });

        console.log('Fetched connected devices:', connectedDevices);
        return connectedDevices;
    }
    catch (error) {
        console.log('Axios request to /devices failed. Error:', error);
        return [];
    }
}