
import { User } from '@/types/auth';
import { API_URL } from '@/config';

/**
 * Fetch user data from the database
 */
console.log('🌐 API_URL is:', API_URL);
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
// export const loginWithEmail = async (email: string, password: string) => {
//   try {
//     console.log("Starting login process for:", email);
    
//     const response = await fetch(`${API_URL}/auth/login.php`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password }),
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       console.error('Login error:', data.error);
//       throw new Error(data.error || "Invalid email or password. Please try again.");
//     }
    
    
//     if (!data.token) {
//       console.error("Auth succeeded but no token returned");
//       throw new Error("Authentication error. Please try again.");
//     }
    
//     // Store token in localStorage
//     localStorage.setItem('auth_token', data.token);
    
//     console.log("Login successful");
//     return data;
//   } catch (error: any) {
//     console.error('Error in loginWithEmail:', error);
//     throw error;
//   }
// };

// src/services/auth.service.ts

export const loginWithEmail = async (email: string, password: string) => {
  console.log('🌐 API_URL is:', API_URL);        // sanity‐check
  console.log('👉 calling:', `${API_URL}/auth/login.php`);

  const response = await fetch(`${API_URL}/auth/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  // debug raw text so you see HTML if it sneaks through
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('Non-JSON response:', text);
    throw new Error('Server did not return valid JSON.');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Invalid email or password.');
  }
  if (!data.token) {
    throw new Error('Authentication error. No token returned.');
  }

  localStorage.setItem('auth_token', data.token);
  return data;
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
