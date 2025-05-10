
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loginWithEmail } from '@/services/auth.service';
import { User } from '@/types/auth';

export const useLogin = (checkUser: () => Promise<void>) => {
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const result = await loginWithEmail(email, password);
      await checkUser();
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Check your credentials and try again.';
      setAuthError(errorMessage);
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    login,
    authError,
    setAuthError
  };
};
