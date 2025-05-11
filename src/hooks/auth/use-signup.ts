import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config'; // Import API_URL from your config

export const useSignup = () => {
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const signup = async (name: string, email: string, username: string, password: string) => {
    try {
      setAuthError(null);
      const response = await fetch(`${API_URL}/auth/signup.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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