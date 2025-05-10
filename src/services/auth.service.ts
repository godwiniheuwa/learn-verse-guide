
import { User } from '@/types/auth';
import { API_URL } from '@/config';

// API base URL (will be defined in config.ts)
const AUTH_API = `${API_URL}/auth`;

/**
 * Fetch user data from the database
 */
export const fetchUserData = async (userId: string): Promise<User | null> => {
  try {
    console.log("Fetching user data for ID:", userId);
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }
    
    const response = await fetch(`${API_URL}/user/get`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error('Error fetching user data:', response.statusText);
      return null;
    }
    
    const userData = await response.json();
    console.log("User data found:", userData);

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      username: userData.username,
      role: userData.role,
      isActive: userData.isActive
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (email: string, password: string) => {
  try {
    console.log("Starting login process for:", email);
    
    const response = await fetch(`${AUTH_API}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Login error:', data.error);
      throw new Error(data.error || "Invalid email or password. Please try again.");
    }
    
    if (!data.token) {
      console.error("Auth succeeded but no token returned");
      throw new Error("Authentication error. Please try again.");
    }
    
    // Store token in localStorage
    localStorage.setItem('auth_token', data.token);
    
    console.log("Login successful");
    return data;
  } catch (error: any) {
    console.error('Error in loginWithEmail:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signupWithEmail = async (name: string, email: string, username: string, password: string) => {
  try {
    const response = await fetch(`${AUTH_API}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, username, password }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Signup failed');
    }
    
    return result;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await fetch(`${AUTH_API}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const result = await response.json();
    
    if (!response.ok && result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error: any) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

/**
 * Reset password with token
 */
export const resetPasswordWithToken = async (token: string, password: string) => {
  try {
    const response = await fetch(`${AUTH_API}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Password reset failed');
    }
    
    return result;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = async () => {
  try {
    // Call logout endpoint
    await fetch(`${AUTH_API}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    
    return true;
  } catch (error: any) {
    console.error('Error logging out:', error);
    throw error;
  }
};
