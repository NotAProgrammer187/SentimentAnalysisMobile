# Sentiment Analysis Mobile App

## Quick Setup

### Installation

```bash
npm install --global eas-cli

# Install dependencies
npm install

# Install additional required package
npm install expo-constants

npm install expo-notifications

npx expo install expo-file-system

npx expo install expo-image-picker expo-file-system
```

### Environment Setup

1. Create a `.env` file in the project root
2. Add the following to your `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Starting the App

```bash
npm start
```

Then scan the QR code with your phone using the Expo Go app or press 'a' for Android or 'i' for iOS simulator.
