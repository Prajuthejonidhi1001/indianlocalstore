/**
 * Application configuration
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.12:8000/api';

export default {
  API_BASE_URL,
  RAZORPAY_KEY: process.env.REACT_APP_RAZORPAY_KEY || '',
};
