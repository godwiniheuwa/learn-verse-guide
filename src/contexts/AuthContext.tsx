
import React, { createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/use-auth-state';
import { 
  loginWithEmail, 
  signupWithEmail, 
  requestPasswordReset, 
  resetPasswordWithToken, 
  signOut 
} from '@/services/auth.service';

// Import constants directly from the client file
import { supabase } from '@/integrations/supabase/client';

// Define these constants to match what's in the supabase client file
const SUPABASE_URL = "https://lemshjwutppclhhboeae.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbXNoand1dHBwY2xoaGJvZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjI4ODEsImV4cCI6MjA2MjM5ODg4MX0.xslVb5AhvLEBJ8JrSAbANErkzqiWxfUdXni0iICdorA";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, checkUser } = useAuthState();
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      await loginWithEmail(email, password);
      await checkUser();
      
      toast({
        title: 'Login successful',
        description: `Welcome back${user ? ', ' + user.name : ''}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Check your credentials and try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signup = async (name: string, email: string, username: string, password: string) => {
    try {
      // Use the constants instead of accessing protected properties
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
      
      toast({
        title: 'Account created',
        description: result.message || 'Please check your email to activate your account.',
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'Unable to create account. Try again later.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      // Use the constants instead of accessing protected properties
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
      
      toast({
        title: 'Password reset email sent',
        description: result.message || 'If your email is registered, you will receive a password reset link.',
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Request failed',
        description: error.message || 'Unable to process your request. Try again later.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      // Use the constants instead of accessing protected properties
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
      
      toast({
        title: 'Password reset successful',
        description: result.message || 'You can now login with your new password.',
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error.message || 'Unable to reset password. Try again later.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
