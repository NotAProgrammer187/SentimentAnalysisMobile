import React, { useState, useEffect } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; // Import your custom hook

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Get theme state and toggle function
  const [isEnabled, setIsEnabled] = useState(isDarkMode); // Local state to manage switch

  useEffect(() => {
    setIsEnabled(isDarkMode); // Sync local state with global theme state
  }, [isDarkMode]);

  const handleToggle = () => {
    toggleTheme(); // Toggle the theme in the context
    setIsEnabled(!isEnabled); // Update the local state of the switch
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name={isEnabled ? 'moon' : 'sunny'}
        size={24}
        color={isEnabled ? 'white' : 'black'}
        style={styles.icon}
      />
      <Switch
        value={isEnabled}
        onValueChange={handleToggle} // Toggle theme when the switch is pressed
        trackColor={{ false: '#767577', true: '#81b0ff' }} // Customize track color
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'} // Customize thumb color
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8, // Add margin between icon and switch
  },
});

export default ThemeToggle;
