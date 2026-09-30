import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { CartProvider } from './src/context/CartContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  "No native ExponentConstants module found",
  "No native ExpoFirebaseCore module found",
  "SafeAreaView has been deprecated",
  "InteractionManager has been deprecated"
]);

export default function App() {
  return (
    <LocationProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </LocationProvider>
  );
}
