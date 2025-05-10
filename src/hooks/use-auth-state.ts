import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { fetchUserData } from '@/services/auth.service';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Define checkUser function outside useEffect to avoid recreating it
  const checkUser = async () => {
    try {
      setLoading(true);
      
      // Get session from Supabase auth
      console.log("Checking for existing session");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        console.log("Found existing session, fetching user data...");
        const userData = await fetchUserData(session.user.id);
        
        if (userData) {
          setUser(userData);
          console.log("User data loaded:", userData);
        } else {
          console.log("Session exists but no user record found. May need to create one.");
          // Keep the auth session but note missing user record
          setUser(null);
        }
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

  useEffect(() => {
    console.log("Setting up auth state handler");

    // Set up auth state listener FIRST before anything else
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session?.user?.id) {
          // Only update user if session exists
          try {
            console.log("Auth state changed with user, fetching user data");
            // Use setTimeout to prevent recursive update issues
            setTimeout(async () => {
              try {
                const userData = await fetchUserData(session.user.id);
                setUser(userData);
                console.log("User data fetched on auth change:", userData);
              } catch (error) {
                console.error("Error fetching user data on auth change:", error);
                setUser(null);
              }
            }, 0);
          } catch (error) {
            console.error("Error in auth change handler:", error);
          }
        } else {
          console.log("No session found in auth change, clearing user");
          setUser(null);
        }
        
        if (!authInitialized) {
          setAuthInitialized(true);
        }
      }
    );

    // THEN check for existing session
    checkUser();

    return () => {
      console.log("Cleaning up auth state subscription");
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    checkUser,
  };
};
