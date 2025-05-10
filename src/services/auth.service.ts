
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
    console.log("Fetching user data for ID:", userId);
    
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
      console.log("User data found:", data);
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
    
    console.log("No user data found for ID:", userId);
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
    console.log("Starting direct login process for:", email);
    
    // First directly attempt Supabase auth login since we've confirmed
    // users exist in Supabase auth system based on the error
    console.log("Attempting Supabase direct auth for email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Supabase login error:', error);
      
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password. Please try again.");
      } else {
        throw error;
      }
    }
    
    if (!data || !data.user) {
      console.error("Auth succeeded but no user data returned");
      throw new Error("Authentication error. Please try again.");
    }
    
    // After successful auth, check if user exists in our users table
    console.log("Auth successful, checking if user exists in users table");
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_active, email')
      .eq('id', data.user.id)
      .maybeSingle();
    
    if (userError) {
      console.error('Error checking user:', userError);
      // Don't fail login if the user record check fails, just log it
      console.warn("User authenticated but couldn't confirm user record");
    } else if (!userData) {
      // If user doesn't exist in our table but auth succeeded,
      // Create a basic record
      console.log("User not found in users table, creating new record");
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          name: email.split('@')[0],
          username: email.split('@')[0],
          password_hash: 'managed_by_supabase',
          role: 'student',
          is_active: true
        });
      
      if (insertError) {
        console.error("Failed to create user record:", insertError);
      }
    } else if (!userData.is_active) {
      console.error("Account not active for email:", email);
      throw new Error("Account not active. Please contact an administrator.");
    }
    
    console.log("Login successful:", !!data);
    return data;
  } catch (error: any) {
    console.error('Error in loginWithEmail:', error);
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
