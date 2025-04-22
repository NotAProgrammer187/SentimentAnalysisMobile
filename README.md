# Sentiment Analysis Mobile App

## Setup Instructions

### Environment Variables

This project uses environment variables to secure API credentials. Follow these steps to set up your local environment:

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values with your actual Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   ```

3. These environment variables will be automatically loaded by the Expo app.

### Important Security Notes

- The `.env` file contains sensitive API keys and should never be committed to version control
- After setting up your `.env` file, update `utils/supabaseClient.js` to remove the hardcoded fallback credentials

### Development

Open the `App.js` file to start writing some code. You can preview the changes directly on your phone or tablet by scanning the **QR code** or use the iOS or Android emulators.

### Troubleshooting

If you're having problems, you can tweet to us [@expo](https://twitter.com/expo) or ask in our [forums](https://forums.expo.dev/c/expo-dev-tools/61) or [Discord](https://chat.expo.dev/).
