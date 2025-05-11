import { User } from '@/types/auth';
import { API_URL } from '@/config';

/**
 * Fetch user data from the database
 */
export const fetchUserData = async (userId: string): Promise<User | null> => {
  try {
    console.log("Fetching user data for ID:", userId);
    console.log("Using API URL:", API_URL);
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }
    
    const response = await fetch(`${API_URL}/user/get.php`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching user data:', response.status, errorText);
      return null;
    }
    
    // Debug: Log the raw response to see what's coming back
    const rawText = await response.text();
    console.log("Raw user data response:", rawText);
    
    try {
      // Parse the text back to JSON
      const userData = JSON.parse(rawText);
      console.log("User data found:", userData);

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        role: userData.role,
        isActive: userData.isActive
      };
    } catch (jsonError) {
      console.error("Failed to parse user data JSON:", jsonError);
      return null;
    }
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
    console.log('🔒 Login attempt for:', email);
    console.log('🌐 API URL is:', API_URL);
    console.log('📡 Calling:', `${API_URL}/auth/login.php`);

    const response = await fetch(`${API_URL}/auth/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // Debug raw response
    const text = await response.text();
    console.log("Raw login response:", text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error('Non-JSON response:', text);
      throw new Error('Server returned invalid JSON. This might indicate the PHP backend is not properly set up or not running.');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }
    
    if (!data.token) {
      throw new Error('Authentication error. No token returned from server.');
    }

    localStorage.setItem('auth_token', data.token);
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
    const response = await fetch(`${API_URL}/auth/signup`, {
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
 * Sign out user
 */
export const signOut = async () => {
  try {
    // Call logout endpoint
    await fetch(`${API_URL}/auth/logout`, {
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

/**
 * Create admin user
 */
export const createAdminUser = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/create-admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create admin user');
    }
    
    return result;
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};
