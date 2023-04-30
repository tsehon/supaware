import { Oura } from "../devices/oura/Oura";
import axios from "axios";

export default interface Device {
    name: string; // device name
    image: any; // device logo
    owner: string; // token of the user who owns this device
    is_connected: boolean; // whether the device is connected
    access_token: string; // access token for the device
    refresh_token: string; // refresh token for the device
    expires_at: Date; // when the access token expires
    scope: string; // scope of the device (what data it can access)

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

/*
* Configure the device instances array
* Adds to device instances the devices that the user has connected and their corresponding info
* Adds to device instances the devices that the user has not connected with default info
* @param userToken - the token of the user who is configuring their devices
* @returns void
*/
export async function configureDeviceInstances(userToken: string) {
    console.log('Configuring device instances...');
    const connectedDevices = await getConnectedDeviceArray(userToken);
    console.log('Connected devices:', connectedDevices);
    for (const device of connectedDevices) {
        deviceInstances[device.name.toLowerCase()] = device;
    }
    // Add default device instances
    for (const device of getDeviceArray()) {
        if (!deviceInstances[device.name.toLowerCase()]) {
            deviceInstances[device.name.toLowerCase()] = device;
        }
    }
}

export function getDeviceInstancesArray(): Device[] {
    const devices = Object.values(deviceInstances);
    return devices;
};

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
                console.log('Axios request to /devices completed: ', response.data);
                if (response.data && Array.isArray(response.data)) {
                    response.data.forEach((device: any) => {
                        const deviceInstance = createDevice(device.accountType);

                        if (deviceInstance) {
                            deviceInstance.owner = userToken;
                            deviceInstance.access_token = device.accessToken;
                            deviceInstance.refresh_token = device.refreshToken;
                            deviceInstance.expires_at = new Date(device.expiry);
                            deviceInstance.scope = device.scope;
                            deviceInstance.is_connected = true;
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