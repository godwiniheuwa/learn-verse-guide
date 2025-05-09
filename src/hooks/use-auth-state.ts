
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { fetchUserData } from '@/services/auth.service';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        const userData = await fetchUserData(session.user.id);
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    loading,
    checkUser,
  };
};
