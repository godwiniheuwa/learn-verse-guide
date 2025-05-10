
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { signOut } from '@/services/auth.service';

export const useLogout = (checkUser: () => Promise<void>) => {
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const logout = async () => {
    try {
      setAuthError(null);
      await signOut();
      
      // Force refresh the auth state
      await checkUser();
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      setAuthError(error.message || 'Failed to log out. Try again.');
      toast({
        title: 'Error',
        description: 'Failed to log out. Try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    logout,
    authError,
    setAuthError
  };
};
