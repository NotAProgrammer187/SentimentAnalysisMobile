import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications'; //
import UserListScreen from './screens/UserListScreen';
import UserDetailScreen from './screens/UserDetailScreen';
import { ThemeProvider } from './context/ThemeContext'; //
import { initNotifications, subscribeToRealtimeChanges } from './utils/NotificationService'; //

const Stack = createNativeStackNavigator();

// Create a navigation reference for handling notifications (optional, but good practice if you want to navigate on tap)
const navigationRef = React.createRef();

export default function App() {
  // Create notification listener refs to prevent memory leaks
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Initialize notifications and set up listeners
    const setupNotifications = async () => {
      try {
        // Request notification permissions and register token
        const permissionGranted = await initNotifications(); //

        if (permissionGranted) {
          console.log('Notification permissions granted');

          // Set up notification listeners for when the app is in foreground or notification is tapped
          // These listeners are also set up in NotificationService.js, but you can keep
          // these top-level ones in App.js for handling navigation or global app state
          notificationListener.current = Notifications.addNotificationReceivedListener(notification => { //
            console.log('Notification received in app:', notification);
            // You can update UI or state here if needed
          });

          responseListener.current = Notifications.addNotificationResponseReceivedListener(response => { //
            console.log('Notification tapped:', response);
            // This is where you would typically add logic to navigate
            // using navigationRef.current.navigate(...) based on response.notification.request.content.data
            // Example: navigationRef.current?.navigate('UserDetail', { userName: response.notification.request.content.data?.username });
          });

        } else {
          console.log('Notification permissions denied');
          Alert.alert(
            'Notifications Disabled',
            'To receive updates about new data, please enable notifications in your device settings.',
            [{ text: 'OK', style: 'default' }]
          );
        }

        // Subscribe to Realtime updates for new data (INSERT events)
        // Replace 'sentiment_data' with your actual table name you want to monitor
        const subscription = subscribeToRealtimeChanges(
          'SentimentResult', // <--- Make sure this is the correct table name you are inserting into
          (newData) => {
            console.log('New data detected:', newData);
            // --- START: Logic to trigger a local notification on new data ---
            Notifications.scheduleNotificationAsync({ //
              content: {
                title: 'New Data Added!', // Customize title
                body: `New record detected! User: ${newData?.username || 'N/A'}`, // Customize body, safely access properties
                data: { type: 'NEW_DATA', id: newData?.id, username: newData?.username }, // Optional data to pass with the notification
              },
              trigger: null, // Use null to trigger the notification immediately
            });
            // --- END: Logic to trigger a local notification ---
          }
        );

        // Clean up subscriptions and listeners on component unmount
        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }

          if (notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current); //
          }
          if (responseListener.current) {
            Notifications.removeNotificationSubscription(responseListener.current); //
          }
        };
      } catch (error) {
        console.error('Error setting up notifications or subscription:', error);
      }
    };

    setupNotifications();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        {/* Pass navigationRef to the NavigationContainer */}
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator>
            {/* Screen Definitions */}
            <Stack.Screen
              name="UserList" // or your main screen name
              component={UserListScreen}
              options={{
                title: 'Sentiment Monitoring',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerShadowVisible: false,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen
              name="UserDetail" // or your detail screen name
              component={UserDetailScreen}
              options={({ route }) => ({
                title: route.params.userName,
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerShadowVisible: false,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              })}
            />
            {/* Add other screens here if you have them */}
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}