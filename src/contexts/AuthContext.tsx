
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'student' | 'teacher' | 'examiner' | 'admin';
  isActive: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for current user on load
    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, _) => {
        if (event === 'SIGNED_IN') {
          checkUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      setLoading(true);
      
      // Get session from Supabase auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // If authenticated, fetch user data from our users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        if (data) {
          // Transform the data to match our User type
          const userData: User = {
            id: data.id,
            email: data.email,
            name: data.name,
            username: data.username,
            role: data.role,
            isActive: data.is_active
          };
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      toast({
        title: 'Error',
        description: 'Failed to retrieve user information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Use our custom auth endpoint to verify active status before login
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
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
        
        // Check user to update state
        await checkUser();
        
        toast({
          title: 'Login successful',
          description: `Welcome back${user ? ', ' + user.name : ''}!`,
        });
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Check your credentials and try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, username: string, password: string) => {
    try {
      setLoading(true);
      
      // Use our custom auth endpoint for signup
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
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
      console.error('Error signing up:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'Unable to create account. Try again later.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      
      // Use our custom auth endpoint for forgot password
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
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
      console.error('Error requesting password reset:', error);
      toast({
        title: 'Request failed',
        description: error.message || 'Unable to process your request. Try again later.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      
      // Use our custom auth endpoint for password reset
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
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
      console.error('Error resetting password:', error);
      toast({
        title: 'Reset failed',
        description: error.message || 'Unable to reset password. Try again later.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      console.error('Error logging out:', error);
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
