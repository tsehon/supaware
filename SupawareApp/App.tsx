import React from 'react';
import AuthProvider from './contexts/AuthContext';
import AppNav from './pages/AppNav';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppNav/>
    </AuthProvider>
  );
};

export default App;
