import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
