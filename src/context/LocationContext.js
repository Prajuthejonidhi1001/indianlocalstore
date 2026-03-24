import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);

  // Load saved location on mount
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const saved = await AsyncStorage.getItem('user_location');
        if (saved) {
          setLocation(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load location', e);
      }
    };
    loadLocation();
  }, []);

  // Save location when it changes
  const updateLocation = async (newLocation) => {
    try {
      if (newLocation) {
        await AsyncStorage.setItem('user_location', JSON.stringify(newLocation));
      } else {
        await AsyncStorage.removeItem('user_location');
      }
      setLocation(newLocation);
    } catch (e) {
      console.error('Failed to save location', e);
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation: updateLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
