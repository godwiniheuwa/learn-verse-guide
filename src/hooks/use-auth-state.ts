
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { fetchUserData } from '@/services/auth.service';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session?.user?.id) {
          // Only update user if session exists
          try {
            const userData = await fetchUserData(session.user.id);
            setUser(userData);
          } catch (error) {
            console.error("Error fetching user data on auth change:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    checkUser();

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
        console.log("Found existing session, fetching user data...");
        const userData = await fetchUserData(session.user.id);
        setUser(userData);
      } else {
        console.log("No active session found");
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
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
