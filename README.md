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

npx expo install react-native-view-shot expo-media-library

npx expo install expo-sharing
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

## Push Notification Setup

### Database Setup

Create a table to store device tokens:

```sql
CREATE TABLE expo_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL UNIQUE,
  push_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX idx_expo_push_tokens_device_id ON expo_push_tokens(device_id);
```

### SQL Trigger Setup

Add a trigger to notify when new data is available:

```sql
-- Define a trigger function to send a notification when new data is added
CREATE OR REPLACE FUNCTION notify_new_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Perform HTTP POST to external Supabase Edge Function
  PERFORM net.http_post(
    '<YOUR_SUPABASE_URL>/functions/v1/send-notifications',  -- 🔗 Target URL
    '{}',  -- 📦 Payload (empty JSON object)
    '{
      "Content-Type": "application/json",  -- 🧾 Header: Content type
      "Authorization": "Bearer <YOUR_SUPABASE_ANON_KEY>"  -- 🔐 Header: Replace with your actual Supabase anon key
    }'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Add trigger to your data table (replace 'sentiment_data' with your actual table name)
CREATE TRIGGER trigger_notify_new_data
AFTER INSERT ON "SentimentResult"
FOR EACH ROW
EXECUTE FUNCTION notify_new_data();
```

### Edge Function Setup

Create a Supabase Edge Function to handle sending notifications:

```javascript
// supabase/functions/send-notifications/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
serve(async (req)=>{
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    // Get all device tokens
    const { data: tokens, error } = await supabase.from('expo_push_tokens').select('push_token');
    if (error) throw error;
    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({
        message: 'No devices to notify'
      }), {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Extract the Expo push tokens
    const pushTokens = tokens.map((token)=>token.push_token);
    // Prepare the notification message
    const messages = pushTokens.map((token)=>({
        to: token,
        sound: 'default',
        title: 'New Data Available',
        body: 'Check out the latest sentiment analysis data!',
        data: {
          type: 'NEW_DATA',
          timestamp: new Date().toISOString()
        }
      }));
    // Send the notifications via Expo's push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messages)
    });
    const result = await response.json();
    return new Response(JSON.stringify({
      success: true,
      message: 'Notifications sent',
      result
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
```

## For EAS Builds (APK BUILDING):

Set up secrets in your EAS account:

```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Login to your EAS account
eas login

#build the app
eas build -p android --profile preview

# Set the secrets
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value  "https://your-actual-project-id.supabase.co"
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value  "your-actual-anon-key-here"
```