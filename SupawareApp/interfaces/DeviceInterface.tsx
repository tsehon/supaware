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
    getDataSummary(): string;
}

type DeviceConstructor = new () => Device;

export const deviceMapping: Record<string, DeviceConstructor> = {
    "oura": Oura,
};

const deviceInstances: Record<string, Device> = {};
let healthInsights: string = "";

/*
* Configure the device instances array to mirror the current user
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


import { useChatContext } from '../contexts/ChatContext';

const sendMessage = (text: string) => {
    const { addMessage } = useChatContext();
    addMessage(text, false);
};

export async function fetchHealthInsights() {
    console.log('Fetching health insights...');
    healthInsights = "Fetching health insights...";

    let prompt = "You are a doctor. I have collected health data from multiple wearable " +
        "devices and would like some advice and insights. Here are the key data points: \n";

    let hasData = false;
    for (const device of getDeviceInstancesArray()) {
        if (device.is_connected) {
            await device.fetchData();
            const dataSummary = device.getDataSummary();

            if (dataSummary.length === 0) {
                console.error('Failed to create prompt for device:', device);
                return;
            }

            prompt += "Device: " + device.name + "\n";
            prompt += dataSummary + "\n";
            hasData = true;
        }
    }

    if (!hasData) {
        console.log('No data to create prompt with.');
        healthInsights = "Connect a device to get health insights.";
        return;
    }

    prompt += "Based on this data, can you provide health advice and insights" +
        " to improve my overall well-being? Send your response in a single, concise message."
        + " Be friendly and professional. Thank you!";

    console.log('Prompt:', prompt);

    try {
        const response = await axios.post('/openai/chat-completion', {
            prompt: prompt,
        });

        if (response.data) {
            console.log('Response from OpenAI API:\n', response.data);
            healthInsights = response.data;
            return response.data;
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return 'Failed to get health insights.';
    }
}

export function getHealthInsights(): string {
    return healthInsights;
}

export async function fetchWelcomeMessage() {
    console.log('Fetching welcome message...');

    const prompt = "You are a friendly doctor, and you patient has just entered the chat. " +
        "Send a nice welcome message, conveying your care for their health and wellness. " +
        "\n";

    try {
        const response = await axios.post('/openai/chat-completion', {
            prompt: prompt,
        });

        if (response.data) {

        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return 'Failed to get health insights.';
    }
}