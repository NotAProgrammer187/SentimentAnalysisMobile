# Sentiment Analysis Mobile App

## Setup Instructions for Developers

### First-Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SentimentAnalysisMobile.git
   cd SentimentAnalysisMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Environment Variables Setup

This project uses environment variables to secure API credentials. Follow these steps to set up your local environment:

1. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```

2. **Contact the project owner for the actual Supabase credentials or set up your own Supabase project**

3. **Edit the `.env` file with the actual credentials**
   ```
   EXPO_PUBLIC_SUPABASE_URL=actual_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=actual_anon_key_here
   ```

4. **Verify installation**
   ```bash
   npm start
   ```

### Important Security Notes

- The `.env` file contains sensitive API keys and should never be committed to version control
- For developers joining the project: you must obtain the actual API credentials from the project owner or create your own Supabase project
- For project owner: you may need to share your Supabase credentials with team members through a secure channel

### Development

Open the `App.js` file to start writing some code. You can preview the changes directly on your phone or tablet by scanning the **QR code** or use the iOS or Android emulators.

### Troubleshooting

If you're having problems, you can tweet to us [@expo](https://twitter.com/expo) or ask in our [forums](https://forums.expo.dev/c/expo-dev-tools/61) or [Discord](https://chat.expo.dev/).
