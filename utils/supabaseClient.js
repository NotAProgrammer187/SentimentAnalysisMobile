import { createClient } from "@supabase/supabase-js"
import Constants from 'expo-constants';

// Add fallback values for development
const DEV_SUPABASE_URL = "https://lvfdrlyjsrofuzfaixub.supabase.co";
const DEV_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZmRybHlqc3JvZnV6ZmFpeHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MDA2MTgsImV4cCI6MjA2MDk3NjYxOH0.ZZsC0EdmrzO7pqsrgfAqLzEKWSM0dksoCyGazg7eGpU"; // Replace with your actual key

// Try different ways to get the values, with fallbacks
const SUPABASE_URL = 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  Constants.expoConfig?.extra?.supabaseUrl || 
  DEV_SUPABASE_URL;

const SUPABASE_ANON_KEY = 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  DEV_SUPABASE_ANON_KEY;

// Check if keys are available and log the status
console.log('Supabase URL:', SUPABASE_URL); // Log the actual URL for debugging
console.log('Supabase Anon Key available:', !!SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration - please check your environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)