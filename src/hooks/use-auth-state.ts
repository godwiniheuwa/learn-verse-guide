
import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { fetchUserData } from '@/services/auth.service';
import { API_URL } from '@/config';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Define checkUser function outside useEffect to avoid recreating it
  const checkUser = async () => {
    try {
      setLoading(true);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log("No auth token found");
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Validate token with the backend
      console.log("Checking token validity");
      const response = await fetch(`${API_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid && data.user) {
        console.log("Token valid, fetching user data");
        const userData = await fetchUserData(data.user.id);
        
        if (userData) {
          setUser(userData);
          console.log("User data loaded:", userData);
        } else {
          console.log("No user data found");
          setUser(null);
          // Clear invalid token
          localStorage.removeItem('auth_token');
        }
      } else {
        console.log("Invalid token, clearing auth state");
        setUser(null);
        // Clear invalid token
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      // Clear token on error
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("Setting up auth state handler");
    checkUser();
    
    // Listen for storage events (for multi-tab support)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token') {
        console.log("Auth token changed in storage, refreshing auth state");
        checkUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    user,
    loading,
    checkUser,
  };
};
