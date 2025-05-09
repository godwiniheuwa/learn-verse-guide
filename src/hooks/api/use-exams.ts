
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/middleware/role-guard';
import { useToast } from '@/hooks/use-toast';

export type Exam = {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'closed';
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type NewExam = {
  title: string;
  description?: string | null;
  status?: 'draft' | 'published' | 'closed';
};

export const useExams = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const canView = hasPermission(user, 'exams', 'view');
  const canCreate = hasPermission(user, 'exams', 'create');
  const canUpdate = hasPermission(user, 'exams', 'update');
  const canDelete = hasPermission(user, 'exams', 'delete');

  const fetchExams = async (): Promise<Exam[]> => {
    if (!canView) {
      return [];
    }

    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching exams', error);
      throw error;
    }

    return data || [];
  };

  const fetchExam = async (id: string): Promise<Exam | null> => {
    if (!canView) {
      return null;
    }

    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching exam ${id}`, error);
      throw error;
    }

    return data;
  };

  const createExam = async (exam: NewExam): Promise<Exam> => {
    if (!canCreate || !user) {
      throw new Error("You don't have permission to create exams");
    }

    const { data, error } = await supabase
      .from('exams')
      .insert({
        ...exam,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating exam', error);
      throw error;
    }

    return data;
  };

  const updateExam = async ({ id, ...updates }: Partial<Exam> & { id: string }): Promise<Exam> => {
    if (!canUpdate) {
      throw new Error("You don't have permission to update exams");
    }

    const { data, error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating exam ${id}`, error);
      throw error;
    }

    return data;
  };

  const deleteExam = async (id: string): Promise<void> => {
    if (!canDelete) {
      throw new Error("You don't have permission to delete exams");
    }

    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting exam ${id}`, error);
      throw error;
    }
  };

  // Query hooks
  const useAllExams = () => {
    return useQuery({
      queryKey: ['exams'],
      queryFn: fetchExams,
      enabled: !!user && canView
    });
  };

  const useExam = (id: string) => {
    return useQuery({
      queryKey: ['exams', id],
      queryFn: () => fetchExam(id),
      enabled: !!id && !!user && canView
    });
  };

  // Mutation hooks
  const useCreateExam = () => {
    return useMutation({
      mutationFn: createExam,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['exams'] });
        toast({
          title: "Exam created",
          description: "Your exam has been created successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to create exam",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useUpdateExam = () => {
    return useMutation({
      mutationFn: updateExam,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['exams'] });
        queryClient.invalidateQueries({ queryKey: ['exams', data.id] });
        toast({
          title: "Exam updated",
          description: "Your exam has been updated successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to update exam",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useDeleteExam = () => {
    return useMutation({
      mutationFn: deleteExam,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['exams'] });
        toast({
          title: "Exam deleted",
          description: "Your exam has been deleted."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to delete exam",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  return {
    // Permissions
    canView,
    canCreate, 
    canUpdate,
    canDelete,
    
    // Queries
    useAllExams,
    useExam,
    
    // Mutations
    useCreateExam,
    useUpdateExam,
    useDeleteExam
  };
};
