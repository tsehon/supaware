import { Oura } from "../devices/oura/Oura";

export default interface Device {
    name: string;
    image: any;
    authRequest: (userToken: string) => void;
    authCallback: (event: any) => Promise<void>;
    refresh(): void;
}

type DeviceConstructor = new () => Device;

export const deviceMapping: Record<string, DeviceConstructor> = {
    "oura": Oura,
};

export function createDevice(deviceType: string): Device | null {
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