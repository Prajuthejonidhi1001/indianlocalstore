import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_API_URL = 'http://10.245.191.172:8000/api';
const RENDER_API_URL = 'https://indianlocalstore-api-cjiq.onrender.com/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || RENDER_API_URL;

const firebaseConfig = {
  apiKey: "AIzaSyC4Yhpk0zw-Om-mNWSFn4mwQOy97tufzHE",
  authDomain: "indianlocalstore-36105.firebaseapp.com",
  projectId: "indianlocalstore-36105",
  storageBucket: "indianlocalstore-36105.firebasestorage.app",
  messagingSenderId: "328525492335",
  appId: "1:328525492335:web:520ee04af9d134aa0bdd9a",
  measurementId: "G-EMT8QW8DZH"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default {
  API_BASE_URL,
  RAZORPAY_KEY: process.env.REACT_APP_RAZORPAY_KEY || '',
  firebaseConfig
};
