
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
        if (data) setUser(data as User);
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
      
      // Sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Fetch user data from our custom users table
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userError) throw userError;
        setUser(userData as User);
        
        toast({
          title: 'Login successful',
          description: `Welcome back, ${userData.name}!`,
        });
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, username: string, password: string) => {
    try {
      setLoading(true);
      
      // Create user in Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Insert user data into our custom users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: data.user.id,
              name,
              username,
              email,
              password_hash: 'hashed_in_supabase', // Supabase handles the actual password hashing
              role: 'student'
            }
          ]);
          
        if (insertError) throw insertError;
        
        toast({
          title: 'Account created',
          description: 'Your account has been created successfully. Please verify your email.',
        });
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'Unable to create account. Try again later.',
        variant: 'destructive',
      });
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
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
