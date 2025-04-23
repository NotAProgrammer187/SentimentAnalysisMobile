# Setting Up Environment Variables

## For Local Development:

1. Create a `.env` file in your project root (not tracked by git):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

2. Replace the placeholders with your actual Supabase URL and anon key from your Supabase project settings.

3. Start your app with:
```bash
npm start
```

## For EAS Builds:

Set up secrets in your EAS account:

```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Login to your EAS account
eas login

# Set the secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-actual-project-id.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-actual-anon-key-here"
```

## Verify Setup:

After setting up, run your app in development mode and check the console logs to verify that the Supabase configuration is being loaded correctly. You should see:

```
Supabase URL available: true
Supabase Anon Key available: true
```

If you see `false` for either, check your configuration.

## Security Considerations:

- The anon key is designed to be public and used in client applications
- It has limited permissions based on your Row Level Security (RLS) policies
- Never include your service role key in the client app, as it bypasses all security
