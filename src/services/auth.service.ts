
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

// Use these constants instead of accessing supabase.supabaseUrl and supabase.supabaseKey
const SUPABASE_URL = "https://lemshjwutppclhhboeae.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbXNoand1dHBwY2xoaGJvZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjI4ODEsImV4cCI6MjA2MjM5ODg4MX0.xslVb5AhvLEBJ8JrSAbANErkzqiWxfUdXni0iICdorA";

/**
 * Fetch user data from the database
 */
export const fetchUserData = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
    
    if (data) {
      // Transform the data to match our User type
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        username: data.username,
        role: data.role,
        isActive: data.is_active
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (email: string, password: string) => {
  try {
    // First, check if the user exists and is active
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_active')
      .eq('email', email)
      .maybeSingle();
    
    if (userError) {
      console.error('Error checking user:', userError);
    }
    
    if (!userData) {
      throw new Error("Account not found. Please sign up first.");
    }
    
    if (!userData.is_active) {
      throw new Error("Account not active. Please check your email for the activation link.");
    }
    
    // Now try to sign in with Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signupWithEmail = async (name: string, email: string, username: string, password: string) => {
  try {
    // Use our custom auth endpoint for signup
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ name, email, username, password }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Signup failed');
    }
    
    return result;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string) => {
  try {
    // Use our custom auth endpoint for forgot password
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email }),
    });
    
    const result = await response.json();
    
    if (!response.ok && result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error: any) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

/**
 * Reset password with token
 */
export const resetPasswordWithToken = async (token: string, password: string) => {
  try {
    // Use our custom auth endpoint for password reset
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token, password }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Password reset failed');
    }
    
    return result;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = async () => {
  try {
    await supabase.auth.signOut();
    return true;
  } catch (error: any) {
    console.error('Error logging out:', error);
    throw error;
  }
};
