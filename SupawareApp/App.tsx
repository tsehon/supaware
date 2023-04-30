import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import handleDeepLink from './logical_components/DeepLink';
import AuthProvider from './contexts/AuthContext';
import AppNav from './pages/AppNav';

const App: React.FC = () => {
  useEffect(() => {
    // Add event listener for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle initial deep link, if the app was not already running
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          handleDeepLink({ url });
        }
      })
      .catch((err) => console.error('Error handling initial deep link:', err));

    // Cleanup event listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <AppNav />
    </AuthProvider>
  );
};

export default App;
