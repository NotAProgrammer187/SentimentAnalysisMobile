import { createClient } from "@supabase/supabase-js"
import Constants from 'expo-constants';

// Expo loads environment variables through Constants.expoConfig.extra
// or through process.env with the EXPO_PUBLIC_ prefix
const SUPABASE_URL = 
  (Constants.expoConfig?.extra?.SUPABASE_URL) || 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  DEV_SUPABASE_URL

const SUPABASE_ANON_KEY = 
  (Constants.expoConfig?.extra?.SUPABASE_ANON_KEY) || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  DEV_SUPABASE_ANON_KEY

// SECURITY ALERT: After setting up your .env file, delete the DEV_ constants
// and the fallback values in the lines above

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

