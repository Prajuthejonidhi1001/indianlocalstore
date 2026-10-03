import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { CartProvider } from './src/context/CartContext';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// Ignore specific warnings
LogBox.ignoreLogs([
  "No native ExponentConstants module found",
  "No native ExpoFirebaseCore module found",
  "SafeAreaView has been deprecated",
  "InteractionManager has been deprecated"
]);

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#34C759', backgroundColor: '#1A1C1E', borderRadius: 12, height: 60, width: '90%' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}
      text2Style={{ fontSize: 14, color: '#A0AAB2' }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#FF3B30', backgroundColor: '#1A1C1E', borderRadius: 12, height: 60, width: '90%' }}
      text1Style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}
      text2Style={{ fontSize: 14, color: '#A0AAB2' }}
    />
  )
};

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


