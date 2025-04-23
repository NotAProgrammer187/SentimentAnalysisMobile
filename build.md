{
  "expo": {
    "sdkVersion": "52.0.0",
    "name": "mobile-app-for-thesis",
    // "slug": "snack-302dcc0b-4b6d-4591-93e9-99fdf63ef878", // You might want to keep this if it's tied to an Expo project name, but often can be regenerated
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "NOTIFICATIONS"
      ],
      "package": "com.yourcompany.yourappname" // Change this package name to something unique for your friend's build
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "extra": {
      "eas": {
        // Remove or comment out your specific projectId
        // "projectId": "51770eb7-de79-41e1-b4d0-bec8e91c2c6d" 
        "projectId": "" // Or set to an empty string/placeholder
      },
      // Remove or comment out your specific Supabase keys
      // "supabaseUrl": "${process.env.EXPO_PUBLIC_SUPABASE_URL}",
      // "supabaseAnonKey": "${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}"
      
      // Leave these as placeholders for environment variables
      "supabaseUrl": "${process.env.EXPO_PUBLIC_SUPABASE_URL}",
      "supabaseAnonKey": "${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}"
      
      // If you had hardcoded fallbacks in supabaseClient.js,
      // ensure your friend updates those or uses their own .env file.
    }
  }
}

then 

eas build -p android --profile preview