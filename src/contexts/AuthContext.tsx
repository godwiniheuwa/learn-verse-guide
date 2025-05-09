
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
      const result = await signupWithEmail(name, email, username, password);
      
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
      const result = await requestPasswordReset(email);
      
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
      const result = await resetPasswordWithToken(token, password);
      
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
