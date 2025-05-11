
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/types/auth';
import { API_URL } from '@/config';
import { toast } from '@/hooks/use-toast';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check for a token and validate on page load
const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Define checkUser function
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
        // Fetch complete user data
        const userResponse = await fetch(`${API_URL}/user/get`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          console.log("User data loaded:", userData);
        } else {
          console.log("Failed to fetch user data");
          setUser(null);
          localStorage.removeItem('auth_token');
        }
      } else {
        console.log("Invalid token, clearing auth state");
        setUser(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

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

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, checkUser } = useAuthState();
  const [authError, setAuthError] = useState<string | null>(null);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setAuthError(null);
      
      const response = await fetch(`${API_URL}/auth/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }
      
      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      
      // Update auth state
      await checkUser();
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.name}!`,
      });
      
      return data;
    } catch (error: any) {
      setAuthError(error.message);
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Signup function
  const signup = async (name: string, email: string, username: string, password: string) => {
    try {
      setAuthError(null);
      
      const response = await fetch(`${API_URL}/auth/signup.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }
      
      toast({
        title: 'Account created',
        description: data.message || 'Your account has been created successfully.',
      });
      
      return data;
    } catch (error: any) {
      setAuthError(error.message);
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthError(null);
      
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Remove token from localStorage
      localStorage.removeItem('auth_token');
      
      // Update auth state
      await checkUser();
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      setAuthError(error.message);
      toast({
        title: 'Logout failed',
        description: 'Failed to log out properly. Try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Password reset functions
  const forgotPassword = async (email: string) => {
    // We'll implement this later, just return a placeholder for now
    toast({
      title: 'Feature not available',
      description: 'Password reset via email is not implemented in this PHP version.',
    });
    return { message: "Feature not implemented" };
  };

  const resetPassword = async (token: string, password: string) => {
    // We'll implement this later, just return a placeholder for now
    toast({
      title: 'Feature not available',
      description: 'Password reset via token is not implemented in this PHP version.',
    });
    return { message: "Feature not implemented" };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authError,
      login, 
      signup, 
      logout,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
