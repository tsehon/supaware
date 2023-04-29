import { Oura } from "../devices/oura/Oura";

export default interface Device {
    authRequest: (userToken: string) => void;
    authCallback: (event: any) => Promise<void>;
    refresh(): void;
    image: any;
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
