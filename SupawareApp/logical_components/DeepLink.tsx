import Device, { createDevice } from "../interfaces/DeviceInterface";

type CallbacksType = {
    [key: string]: (event: any) => Promise<void>;
};

const authCallback = (deviceType: string) => {
    return async (event: any) => {
        const device = createDevice(deviceType);
        if (device) {
            device.authCallback(event);
        }
        else {
            console.error('Invalid device type:', deviceType);
        }
    }
};

const callbacks: CallbacksType = {
    'supaware://oura-callback': authCallback("oura"),
}

const handleDeepLink = (event: any) => {
    const url: string = event.url;

    if (url in callbacks) {
        callbacks[url](event);
    } else {
        console.error('No callback found for deep link:', event.url);
    }
};

export default handleDeepLink;