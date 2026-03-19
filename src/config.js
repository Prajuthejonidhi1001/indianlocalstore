/**
 * Application configuration
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://indianlocalstore-api.onrender.com/api';

export default {
  API_BASE_URL,
  RAZORPAY_KEY: process.env.REACT_APP_RAZORPAY_KEY || '',
};
