import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import SettingsPage from './SettingsPage';
import AccountPage from './AccountPage';
import DevicesPage from './DevicesPage';

const pages = [
    { name: 'Settings', component: SettingsPage },
    { name: 'Account', component: AccountPage },
    { name: 'Devices', component: DevicesPage },
];

const Stack = createStackNavigator();

const SettingsNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName="Settings"
        >
            {pages.map((item, index) => (
                <Stack.Screen key={index} name={item.name} component={item.component} />
            ))}
        </Stack.Navigator>
    );
};

export default SettingsNavigator;