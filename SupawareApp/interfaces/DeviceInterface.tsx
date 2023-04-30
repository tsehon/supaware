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

export function createDevice(deviceType: string): Device | null {
    deviceType = deviceType.toLowerCase();

    const DeviceClass = deviceMapping[deviceType];

    if (DeviceClass) {
        return new DeviceClass();
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
    if (!userToken) {
        return [];
    }

    const response = await axios.get(`/devices`, {
        headers: {
            Authorization: `${userToken}`,
        }
    });

    let devices: Device[] = [];
    for (const device_type of response.data) {
        const device = createDevice(device_type);
        if (device) {
            device.owner = userToken;
            devices.push(device);
        }
    }

    return devices;
}