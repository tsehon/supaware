import React, { createContext, useState, useReducer, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabBarIcon from './components/TabBarIcon';

import HomePage from './pages/HomePage';
import SettingsNavigator from './pages/SettingsNavigator';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

import AuthProvider, { AuthContext } from './contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

import axios from 'axios';
import { API_URL } from '@env';
axios.defaults.baseURL = API_URL;

const App: React.FC = () => {
  const { userToken } = useContext(AuthContext);

  return (
    <AuthProvider>
      <NavigationContainer>
        { userToken ? (
          <Stack.Navigator>
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
        ) : (
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
            }}
            initialRouteName="Home"
          >
            <Tab.Screen name="Home"
              component={HomePage}
              options={{
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} iconName="home" />
                ),
              }}
            />
            <Tab.Screen name="SettingsNavigator"
              component={SettingsNavigator}
              options={{
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} iconName="settings" />
                ),
              }}
            />
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
