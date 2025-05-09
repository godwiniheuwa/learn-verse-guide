
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/middleware/role-guard';
import { useToast } from '@/hooks/use-toast';
import { ExamType, ExamTypeWithRelations } from '@/types/exam';

export type NewExamType = {
  name: string;
  description?: string | null;
};

export const useExamTypes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const canView = hasPermission(user, 'exams', 'view');
  const canCreate = hasPermission(user, 'exams', 'create');
  const canUpdate = hasPermission(user, 'exams', 'update');
  const canDelete = hasPermission(user, 'exams', 'delete');

  const fetchExamTypes = async (): Promise<ExamType[]> => {
    if (!canView) {
      return [];
    }

    const { data, error } = await supabase
      .from('exam_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching exam types', error);
      throw error;
    }

    return data || [];
  };

  const fetchExamTypeWithYears = async (id: string): Promise<ExamTypeWithRelations | null> => {
    if (!canView) {
      return null;
    }

    const { data, error } = await supabase
      .from('exam_types')
      .select(`
        *,
        years:exam_years(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching exam type ${id}`, error);
      throw error;
    }

    return data;
  };

  const createExamType = async (examType: NewExamType): Promise<ExamType> => {
    if (!canCreate) {
      throw new Error("You don't have permission to create exam types");
    }

    const { data, error } = await supabase
      .from('exam_types')
      .insert(examType)
      .select()
      .single();

    if (error) {
      console.error('Error creating exam type', error);
      throw error;
    }

    return data;
  };

  const updateExamType = async ({ id, ...updates }: Partial<ExamType> & { id: string }): Promise<ExamType> => {
    if (!canUpdate) {
      throw new Error("You don't have permission to update exam types");
    }

    const { data, error } = await supabase
      .from('exam_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating exam type ${id}`, error);
      throw error;
    }

    return data;
  };

  const deleteExamType = async (id: string): Promise<void> => {
    if (!canDelete) {
      throw new Error("You don't have permission to delete exam types");
    }

    const { error } = await supabase
      .from('exam_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting exam type ${id}`, error);
      throw error;
    }
  };

  // Query hooks
  const useAllExamTypes = () => {
    return useQuery({
      queryKey: ['exam_types'],
      queryFn: fetchExamTypes,
      enabled: !!user && canView
    });
  };

  const useExamTypeWithYears = (id: string) => {
    return useQuery({
      queryKey: ['exam_types', id, 'with_years'],
      queryFn: () => fetchExamTypeWithYears(id),
      enabled: !!id && !!user && canView
    });
  };

  // Mutation hooks
  const useCreateExamType = () => {
    return useMutation({
      mutationFn: createExamType,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['exam_types'] });
        toast({
          title: "Exam Type created",
          description: "The exam type has been created successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to create exam type",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useUpdateExamType = () => {
    return useMutation({
      mutationFn: updateExamType,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['exam_types'] });
        queryClient.invalidateQueries({ queryKey: ['exam_types', data.id] });
        toast({
          title: "Exam Type updated",
          description: "The exam type has been updated successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to update exam type",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useDeleteExamType = () => {
    return useMutation({
      mutationFn: deleteExamType,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['exam_types'] });
        toast({
          title: "Exam Type deleted",
          description: "The exam type has been deleted."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to delete exam type",
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
    useAllExamTypes,
    useExamTypeWithYears,
    
    // Mutations
    useCreateExamType,
    useUpdateExamType,
    useDeleteExamType
  };
};
