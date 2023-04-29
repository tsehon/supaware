import { Oura } from "../devices/oura/Oura";
import axios from "axios";

export default interface Device {
    name: string;
    image: any;
    authRequest: (userToken: string) => void;
    authCallback: (event: any) => void;
    refresh(): void;
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

export async function getConnectedDeviceArray(userToken: string): Promise<Device[]> {
    const response = await axios.get(`/devices`, {
        headers: {
            Authorization: `Bearer ${userToken}`,
        }
    });

    return response.data.devices;
}