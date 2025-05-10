
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loginWithEmail } from '@/services/auth.service';
import { User } from '@/types/auth';

export const useLogin = (checkUser: () => Promise<void>) => {
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginAttemptCount, setLoginAttemptCount] = useState<number>(0);

  const login = async (email: string, password: string) => {
    try {
      setAuthError(null);
      setLoginAttemptCount(prev => prev + 1);
      
      console.log(`Login attempt #${loginAttemptCount + 1} started for email:`, email);
      
      // Add more detailed logging for debugging
      if (loginAttemptCount >= 1) {
        console.log("Multiple login attempts detected. Debug mode enabled.");
      }
      
      const result = await loginWithEmail(email, password);
      console.log("Login successful, checking user...");
      
      // Wait a short delay before checking user to avoid race conditions
      setTimeout(async () => {
        try {
          await checkUser();
          console.log("User check completed successfully");
        } catch (checkError) {
          console.error("Error during user check after login:", checkError);
        }
      }, 100);
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
      return result;
    } catch (error: any) {
      console.error("Login error details:", error);
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
    setAuthError,
    loginAttemptCount
  };
};
