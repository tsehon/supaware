import { ouraAuthCallback } from '../devices/oura/OuraIntegration';

type CallbacksType = {
    [key: string]: (event: any) => Promise<void>;
};

const callbacks: CallbacksType = {
    'supaware://oura-callback': ouraAuthCallback,
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