
import { API_URL } from '@/config';

/**
 * Fetch dashboard data for the current user
 */
export const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_URL}/dashboard/get_data.php`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch dashboard data');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
