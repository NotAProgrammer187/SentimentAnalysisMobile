import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import UserListScreen from './screens/UserListScreen';
import UserDetailScreen from './screens/UserDetailScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { initNotifications, subscribeToRealtimeChanges } from './utils/NotificationService';

const Stack = createNativeStackNavigator();

// Create a navigation reference for handling notifications
const navigationRef = React.createRef();

// Theme toggle button component for the header
function ThemeToggleButton() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 10 }}>
      <Ionicons 
        name={isDarkMode ? 'sunny' : 'moon'} 
        size={24} 
        color={isDarkMode ? 'white' : 'black'} 
      />
    </TouchableOpacity>
  );
}

// Main app component without theme context (will be wrapped later)
function MainApp() {
  const { isDarkMode, colors } = useTheme();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Initialize notifications and set up listeners
    const setupNotifications = async () => {
      try {
        // Request notification permissions and register token
        const permissionGranted = await initNotifications();

        if (permissionGranted) {
          console.log('Notification permissions granted');

          notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received in app:', notification);
          });

          responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification tapped:', response);
          });

        } else {
          console.log('Notification permissions denied');
          Alert.alert(
            'Notifications Disabled',
            'To receive updates about new data, please enable notifications in your device settings.',
            [{ text: 'OK', style: 'default' }]
          );
        }

        // Subscribe to Realtime updates for new data
        const subscription = subscribeToRealtimeChanges(
          'SentimentResult',
          (newData) => {
            console.log('New data detected:', newData);
            Notifications.scheduleNotificationAsync({
              content: {
                title: 'New Data Added!',
                body: `New record detected! User: ${newData?.username || 'N/A'}`,
                data: { type: 'NEW_DATA', id: newData?.id, username: newData?.username },
              },
              trigger: null,
            });
          }
        );

        // Clean up subscriptions and listeners on component unmount
        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }

          if (notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current);
          }
          if (responseListener.current) {
            Notifications.removeNotificationSubscription(responseListener.current);
          }
        };
      } catch (error) {
        console.error('Error setting up notifications or subscription:', error);
      }
    };

    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen
            name="UserList"
            component={UserListScreen}
            options={{
              title: 'Sentiment Monitoring',
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerShadowVisible: false,
              headerTitleStyle: {
                fontWeight: 'bold',
                color: colors.text,
              },
              headerTitleAlign: 'center',
              // Add the theme toggle button to the header
              headerRight: () => <ThemeToggleButton />,
            }}
          />
          <Stack.Screen
            name="UserDetail"
            component={UserDetailScreen}
            options={({ route }) => ({
              title: route.params.userName,
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerShadowVisible: false,
              headerTitleStyle: {
                fontWeight: 'bold',
                color: colors.text,
              },
              // Add the theme toggle button to the detail screen header too
              headerRight: () => <ThemeToggleButton />,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </SafeAreaProvider>
  );
}

// Wrapper component that provides the theme context
export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}