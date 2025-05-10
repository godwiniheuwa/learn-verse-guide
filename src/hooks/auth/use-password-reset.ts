
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Use these constants instead of accessing protected properties
const SUPABASE_URL = "https://lemshjwutppclhhboeae.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbXNoand1dHBwY2xoaGJvZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjI4ODEsImV4cCI6MjA2MjM5ODg4MX0.xslVb5AhvLEBJ8JrSAbANErkzqiWxfUdXni0iICdorA";

export const usePasswordReset = () => {
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const forgotPassword = async (email: string) => {
    try {
      setAuthError(null);
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
      setAuthError(error.message || 'Unable to process your request. Try again later.');
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
      setAuthError(null);
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
      setAuthError(error.message || 'Unable to reset password. Try again later.');
      toast({
        title: 'Reset failed',
        description: error.message || 'Unable to reset password. Try again later.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    forgotPassword,
    resetPassword,
    authError,
    setAuthError
  };
};
