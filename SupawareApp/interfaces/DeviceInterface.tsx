import { Oura } from "../devices/oura/Oura";
import axios from "axios";

export default interface Device {
    name: string; // device name
    image: any; // device logo
    owner: string; // token of the user who owns this device
    is_connected: boolean; // whether the device is connected
    access_token: string; // access token for the device
    refresh_token: string; // refresh token for the device
    expires_at: number; // when the access token expires
    scope: string; // scope of the device (what data it can access)
    data: any; // data fetched from the device

    authRequest: (userToken: string) => Promise<void>;
    authCallback: (event: any) => Promise<void>;
    refresh(): Promise<void>;
    disconnect(): Promise<void>;
    fetchData(): Promise<void>;
    createPromptWithData(): string;
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
    for (const device of connectedDevices) {
        deviceInstances[device.name.toLowerCase()] = device;
        device.owner = userToken;
        device.is_connected = true;
        device.refresh();
        device.fetchData();
    }
    console.log('Connected devices:', connectedDevices);
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
        const response = await axios.get(`/devices/connected`, {
            headers: {
                authorization: `${userToken}`,
            }
        })
            .then((response) => {
                if (response.data && Array.isArray(response.data)) {
                    response.data.forEach((device: any) => {
                        const deviceInstance = createDevice(device.accountType);

                        if (deviceInstance) {
                            deviceInstance.owner = userToken;
                            deviceInstance.access_token = device.accessToken;
                            deviceInstance.refresh_token = device.refreshToken;
                            deviceInstance.expires_at = device.expires_at;
                            deviceInstance.scope = device.scope;
                            deviceInstance.is_connected = true;
                            connectedDevices.push(deviceInstance);
                        }
                    });
                }
            })
            .catch((error) => {
                console.log('Axios request to /devices/connected failed. Error:', error);
            });

        return connectedDevices;
    }
    catch (error) {
        console.log('Axios request to /devices/connected failed. Error:', error);
        return [];
    }
}

export function getToday(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getYesterday(): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
