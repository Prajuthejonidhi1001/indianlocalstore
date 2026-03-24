/**
 * Application configuration
 */

// Use the local IP for development if you're running the backend locally
// Change 10.180.70.169 to your current local IP if it changes
const LOCAL_API_URL = 'http://192.168.1.19:8000/api';
const RENDER_API_URL = 'https://indianlocalstore-api.onrender.com/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || LOCAL_API_URL;

export default {
  API_BASE_URL,
  RAZORPAY_KEY: process.env.REACT_APP_RAZORPAY_KEY || '',
};
