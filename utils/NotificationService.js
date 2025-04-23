// utils/notificationService.js

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';
import Constants from 'expo-constants';

// AsyncStorage keys
const DEVICE_ID_KEY = '@SentimentApp:deviceId';
const PUSH_TOKEN_KEY = '@SentimentApp:pushToken';

// Configure how the notifications appear when they're received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Initialize push notifications
export const initNotifications = async () => {
  if (!Device.isDevice) {
    console.log('Physical device is required for Push Notifications');
    return false;
  }

  // Request permission (required for iOS, automatically granted on Android)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }
  
  // Generate and store a device ID if one doesn't exist
  await ensureDeviceId();
  
  // Get or generate push token and register with Supabase
  await registerForPushNotifications();
  
  // Set up notification listeners (optional)
  setupNotificationListeners();
  
  return true;
};

// Generate a unique device ID if one doesn't exist
const ensureDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate a simple UUID-like string
    deviceId = 'device_' + 
               Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
};

// Register for push notifications and store the token
export const registerForPushNotifications = async () => {
  try {
    // Check for existing token
    const existingToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    
    // Get push token from Expo
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error('Project ID is missing - check app.json');
    }
    
    const { data: tokenData } = await Notifications.getExpoPushTokenAsync({
      projectId: projectId
    });
    
    console.log('Expo push token:', tokenData);
    
    // If the token is new or has changed, save it
    if (tokenData && tokenData !== existingToken) {
      // Save to local storage
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, tokenData);
      
      // Register with Supabase
      const deviceId = await ensureDeviceId();
      await registerTokenWithSupabase(deviceId, tokenData);
    }
    
    return tokenData;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

// Register the device token with Supabase
const registerTokenWithSupabase = async (deviceId, pushToken) => {
  try {
    // Check if this device is already registered
    const { data, error: fetchError } = await supabase
      .from('expo_push_tokens')
      .select('id')
      .eq('device_id', deviceId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (data) {
      // Update existing token
      const { error } = await supabase
        .from('expo_push_tokens')
        .update({ 
          push_token: pushToken,
          updated_at: new Date()
        })
        .eq('device_id', deviceId);
      
      if (error) throw error;
    } else {
      // Insert new device token
      const { error } = await supabase
        .from('expo_push_tokens')
        .insert({ 
          device_id: deviceId, 
          push_token: pushToken 
        });
      
      if (error) throw error;
    }
    
    console.log('Device registered successfully with Supabase');
    return true;
  } catch (error) {
    console.error('Error registering device with Supabase:', error);
    return false;
  }
};

// Set up notification listeners
const setupNotificationListeners = () => {
  // Handle notifications that are received while the app is open
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
  });
  
  // Handle notifications that are tapped by the user
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response received:', response);
    
    // Navigate to a specific screen or perform an action based on the notification
    const data = response.notification.request.content.data;
    handleNotificationResponse(data);
  });
  
  // Return a cleanup function to unsubscribe from the listeners
  return () => {
    Notifications.removeNotificationSubscription(foregroundSubscription);
    Notifications.removeNotificationSubscription(responseSubscription);
  };
};

// Handle user interaction with a notification
const handleNotificationResponse = (data) => {
  // You can customize this based on notification content
  if (data?.type === 'NEW_DATA') {
    // Navigate to the data screen or refresh data
    console.log('User tapped on a NEW_DATA notification:', data);
    
    // Example navigation (requires navigation ref)
    // navigationRef.navigate('DataScreen');
  }
};

// Subscribe to Supabase Realtime for a specific table
export const subscribeToRealtimeChanges = (tableName, onInsert) => {
  const channel = supabase.channel(`public:${tableName}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: tableName }, 
      payload => {
        console.log('New record detected:', payload);
        if (onInsert) onInsert(payload.new);
      }
    )
    .subscribe();
  
  return channel;
};

// Send a local test notification (useful for debugging)
export const sendTestNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // null means show immediately
  });
};
