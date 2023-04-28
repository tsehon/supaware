import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
    userToken: string | null;
};

type AuthAction = { type: 'SIGN_IN'; payload: string } | { type: 'SIGN_OUT' };

const initialState: AuthState = {
    userToken: null,
};

const reducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SIGN_IN':
            return { ...state, userToken: action.payload };
        case 'SIGN_OUT':
            return { ...state, userToken: null };
        default:
            return state;
    }
};

type AuthContextType = {
    userToken: string | null;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
    userToken: null,
    signIn: async () => { },
    signOut: async () => { },
});

type AuthProviderProps = {
    children: ReactNode;
};

const clearDeviceInfo = async () => {
    const deviceAccessInfo = await AsyncStorage.getAllKeys().then((keys) => {
        return keys.filter((key) => (key.includes('-accessToken') || key.includes('-refreshToken') || key.includes('-expiry') || key.includes('-connected')));
    });
    AsyncStorage.multiRemove(deviceAccessInfo);
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const authContextValue = {
        userToken: state.userToken,
        signIn: async (token: string) => {
            try {
                await AsyncStorage.setItem('userToken', token);
                dispatch({ type: 'SIGN_IN', payload: token });
            } catch (error) {
                console.error('Error storing user token in AsyncStorage:', error);
            }
        },
        signOut: async () => {
            try {
                await clearDeviceInfo();
                await AsyncStorage.removeItem('userToken');
                dispatch({ type: 'SIGN_OUT' });
            } catch (error) {
                console.error('Error removing user token from AsyncStorage:', error);
            }
        },
    };

    useEffect(() => {
        const loadUserToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                if (storedToken) {
                    dispatch({ type: 'SIGN_IN', payload: storedToken });
                }
            } catch (error) {
                console.log('Error loading user token from AsyncStorage:', error);
            }
        };

        loadUserToken();
    }, []);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
