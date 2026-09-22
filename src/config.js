import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ---------------------------------------------------------------------------
// API base URL
//
// Production default is the Render deployment. To point the app at a local
// backend, set EXPO_PUBLIC_API_URL in your .env (Expo only injects variables
// prefixed with EXPO_PUBLIC_):
//
//   EXPO_PUBLIC_API_URL=http://192.168.1.5:8000/api
//
// Use your machine's LAN IP, not localhost -- a phone or emulator cannot
// reach the dev machine's localhost.
// ---------------------------------------------------------------------------
const RENDER_API_URL = 'https://indianlocalstore-api-cjiq.onrender.com/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || RENDER_API_URL;

// Host that serves uploaded media, derived from API_BASE_URL by dropping the
// trailing "/api". Keeping it derived means there is only ever one URL to change.
const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Turn whatever the API returns for an image field into a URL React Native can
 * load. Absolute URLs (Cloudinary, Unsplash) pass through untouched; relative
 * Django media paths get the API host prefixed.
 *
 * @param {string|null|undefined} path  value from an API image field
 * @param {string} [fallback]           used when path is empty
 * @returns {string} an absolute URL
 */
export function resolveMediaUrl(path, fallback = '') {
  if (!path) return fallback;
  if (/^https?:\/\//i.test(path)) return path;
  return `${MEDIA_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}

// Firebase web config is public by design -- it ships inside the app bundle.
// It is not a secret. Access is controlled by Firebase Security Rules and by
// the API key restrictions / authorised domains set in the Firebase console.
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
export const auth = getAuth(app);

export { API_BASE_URL };

export default {
  API_BASE_URL,
  MEDIA_BASE_URL,
  // Razorpay publishable key id (safe on the client; the secret stays server-side).
  RAZORPAY_KEY: process.env.EXPO_PUBLIC_RAZORPAY_KEY || '',
  firebaseConfig
};
