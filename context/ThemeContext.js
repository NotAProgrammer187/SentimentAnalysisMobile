import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// SenseCap color palette from Dribbble design
const lightTheme = {
  background: '#F0F4F8',
  card: '#FFFFFF',
  text: '#0B1437',
  subtext: '#6B7280',
  border: '#E5E7EB',
  primary: '#0B1437',
  
  // SenseCap specific colors
  positive: '#21C55D',
  negative: '#EF4444',
  neutral: '#6B7280',
  warning: '#F59E0B',
  
  // Accent colors
  accentBlue: '#3B82F6',
  accentPink: '#EC4899',
  accentPurple: '#8B5CF6',
  accentYellow: '#FCD34D',
  accentGreen: '#34D399',
};

const darkTheme = {
  background: '#0B1437',
  card: '#162155',
  text: '#FFFFFF',
  subtext: '#94A3B8',
  border: '#1E293B',
  primary: '#3B82F6',
  
  // SenseCap specific colors
  positive: '#21C55D',
  negative: '#EF4444',
  neutral: '#6B7280',
  warning: '#F59E0B',
  
  // Accent colors
  accentBlue: '#3B82F6',
  accentPink: '#EC4899',
  accentPurple: '#8B5CF6',
  accentYellow: '#FCD34D',
  accentGreen: '#34D399',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode to match SenseCap

  useEffect(() => {
    // Load saved theme preference
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkTheme : lightTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};