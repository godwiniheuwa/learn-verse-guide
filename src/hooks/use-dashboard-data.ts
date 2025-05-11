
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDashboardData } from '@/services/dashboard.service';
import { useToast } from '@/hooks/use-toast';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Dashboard data error:', err);
        setError(err.message);
        
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, toast]);

  return {
    dashboardData,
    isLoading,
    error
  };
};
