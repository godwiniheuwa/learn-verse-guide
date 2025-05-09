
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

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
    
    if (error) throw error;
    
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
    // Use our custom auth endpoint to verify active status before login
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }
    
    // If successful, set session in Supabase
    if (result.session) {
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
      
      return result;
    }
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
