import Device, { createDevice } from "../interfaces/DeviceInterface";

type CallbacksType = {
    [key: string]: (event: any) => Promise<void>;
};

const authCallback = (deviceType: string) => {
    console.log('Auth callback for device type:', deviceType); // Add a log here

    return async (event: any) => {
        const device = createDevice(deviceType);
        if (device) {
            console.log('Device created:', device);
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
    console.log('Deep link event:', event);
    const url: string = event.url;
    const questionMarkIndex = url.indexOf('?');
    const urlWithoutQueryParams = questionMarkIndex !== -1 ? url.slice(0, questionMarkIndex) : url;

    if (urlWithoutQueryParams in callbacks) {
        callbacks[urlWithoutQueryParams](event);
    } else {
        console.error('No callback found for deep link:', urlWithoutQueryParams);
    }
};

export default handleDeepLink;