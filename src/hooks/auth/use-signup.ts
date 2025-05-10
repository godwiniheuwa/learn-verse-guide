
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Use these constants instead of accessing protected properties
const SUPABASE_URL = "https://lemshjwutppclhhboeae.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbXNoand1dHBwY2xoaGJvZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjI4ODEsImV4cCI6MjA2MjM5ODg4MX0.xslVb5AhvLEBJ8JrSAbANErkzqiWxfUdXni0iICdorA";

export const useSignup = () => {
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const signup = async (name: string, email: string, username: string, password: string) => {
    try {
      setAuthError(null);
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
      console.error('Signup error details:', error);
      setAuthError(error.message || 'Unable to create account. Try again later.');
      
      toast({
        title: 'Signup failed',
        description: error.message || 'Unable to create account. Try again later.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    signup,
    authError,
    setAuthError
  };
};
