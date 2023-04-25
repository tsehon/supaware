import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../contexts/AuthContext';
import { Linking } from 'react-native';
import axios from 'axios';

import HomePage from './HomePage';
import SettingsNavigator from './SettingsNavigator';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';

import TabBarIcon from '../ui_components/TabBarIcon';
import handleDeepLink from '../logical_components/DeepLink';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// @ts-ignore
import { API_URL } from '@env';
axios.defaults.baseURL = API_URL;

const AppNav: React.FC = () => {
    const { userToken } = useContext(AuthContext);

    useEffect(() => {
        // When the component mounts, check if the app was launched via a deep link
        Linking.getInitialURL()
            .then((url) => {
                if (url) {
                    handleDeepLink({ url });
                }
            })
            .catch((err) => console.error('Error getting initial URL', err));

        // Clean up the event listener on unmount
        return () => {
            Linking.addEventListener('url', handleDeepLink);
        };
    }, []);

    return (
        <NavigationContainer>
            {userToken ? (
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                    }}
                    initialRouteName="Home"
                >
                    <Tab.Screen
                        name="Home"
                        component={HomePage}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon focused={focused} iconName="home" />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="SettingsNavigator"
                        component={SettingsNavigator}
                        options={{
                            title: 'Settings',
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon focused={focused} iconName="settings" />
                            ),
                        }}
                    />
                </Tab.Navigator>
            ) : (
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                    }}
                    initialRouteName="Login"
                >
                    <Stack.Screen name="Login" component={LoginPage} />
                    <Stack.Screen
                        name="Register"
                        options={({ navigation }) => ({
                            headerTitle: 'Register',
                        })}
                        children={(props) => (
                            <RegisterPage
                                {...props}
                                onRegisterSuccess={() => props.navigation.navigate('Login')}
                            />
                        )}
                    />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppNav;
