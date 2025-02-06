import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://zswxufskkzwjyxnpjyzu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzd3h1ZnNra3p3anl4bnBqeXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NTU0MDksImV4cCI6MjA1NDQzMTQwOX0.Mn2bi2RiQxqvopwDEHqOS9bXax4NJmtFOEhLVmhYV_o';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 