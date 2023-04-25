import { handleOuraAuthentication } from '../pages/OuraIntegration';

type CallbacksType = {
    [key: string]: (event: any) => Promise<void>;
};

const callbacks: CallbacksType = {
    'supaware://oura-callback': handleOuraAuthentication,
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