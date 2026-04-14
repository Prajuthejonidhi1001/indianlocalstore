/**
 * Application configuration
 */

// Use the local IP for development if you're running the backend locally
// Change 10.180.70.169 to your current local IP if it changes
const LOCAL_API_URL = 'http://10.245.191.172:8000/api';
const RENDER_API_URL = 'https://indianlocalstore-api-cjiq.onrender.com/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || RENDER_API_URL;

export default {
  API_BASE_URL,
  RAZORPAY_KEY: process.env.REACT_APP_RAZORPAY_KEY || '',
};
