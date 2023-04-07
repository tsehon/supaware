import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import { Feather } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={HomePage}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color }) => (
              <Feather
                name="home"
                size={24}
                color={color}
              />
            )
          }}
        />
        <Tab.Screen name="Settings" component={SettingsPage} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
