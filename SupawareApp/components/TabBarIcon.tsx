import React from 'react';
import Feather from 'react-native-vector-icons/Feather';

const TabBarIcon = ({ focused, iconName }) => {
    const iconColor = focused ? 'blue' : 'gray';
    return <Feather name={iconName} size={24} color={iconColor} />;
};

export default TabBarIcon;