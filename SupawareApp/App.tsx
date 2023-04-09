import React, { createContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import jwtDecode from 'jwt-decode';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export const AuthContext = createContext<{
  signIn: (token: string) => void;
  signOut: () => void;
}>({
  signIn: () => { },
  signOut: () => { },
});

const App: React.FC = () => {
  // userToken should be a string when the user is logged in, and null when they are not
  const [userToken, setUserToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        signIn: (token: string) => {
          setUserToken(token);
        },
        signOut: () => {
          setUserToken(null);
        },
      }}
    >
      <NavigationContainer>
        {userToken == null ? (
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
          </Stack.Navigator>
        ) : (
          <Tab.Navigator>
            <Tab.Screen name="Home" component={HomePage} />
            <Tab.Screen name="Settings" component={SettingsPage} />
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;
