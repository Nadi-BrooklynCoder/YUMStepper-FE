// App.js

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './Context/AuthContext';
import AppNav from './Navigation/AppNav';
import ErrorBoundary from './ErrorBoundary';


export default function App() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ErrorBoundary>
          <AppNav />
        </ErrorBoundary>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
