
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/middleware/role-guard';
import { useToast } from '@/hooks/use-toast';
import { ExamYear, ExamYearWithRelations } from '@/types/exam';

export type NewExamYear = {
  exam_type_id: string;
  year: number;
};

export const useExamYears = (examTypeId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const canView = hasPermission(user, 'exams', 'view');
  const canCreate = hasPermission(user, 'exams', 'create');
  const canUpdate = hasPermission(user, 'exams', 'update');
  const canDelete = hasPermission(user, 'exams', 'delete');

  const fetchExamYears = async (): Promise<ExamYear[]> => {
    if (!canView) {
      return [];
    }

    let query = supabase
      .from('exam_years')
      .select('*')
      .order('year', { ascending: false });

    if (examTypeId) {
      query = query.eq('exam_type_id', examTypeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exam years', error);
      throw error;
    }

    return data || [];
  };

  const fetchExamYearWithSubjects = async (id: string): Promise<ExamYearWithRelations | null> => {
    if (!canView) {
      return null;
    }

    const { data, error } = await supabase
      .from('exam_years')
      .select(`
        *,
        exam_type:exam_types(*),
        subjects(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching exam year ${id}`, error);
      throw error;
    }

    return data;
  };

  const createExamYear = async (examYear: NewExamYear): Promise<ExamYear> => {
    if (!canCreate) {
      throw new Error("You don't have permission to create exam years");
    }

    const { data, error } = await supabase
      .from('exam_years')
      .insert(examYear)
      .select()
      .single();

    if (error) {
      console.error('Error creating exam year', error);
      throw error;
    }

    return data;
  };

  const updateExamYear = async ({ id, ...updates }: Partial<ExamYear> & { id: string }): Promise<ExamYear> => {
    if (!canUpdate) {
      throw new Error("You don't have permission to update exam years");
    }

    const { data, error } = await supabase
      .from('exam_years')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating exam year ${id}`, error);
      throw error;
    }

    return data;
  };

  const deleteExamYear = async (id: string): Promise<void> => {
    if (!canDelete) {
      throw new Error("You don't have permission to delete exam years");
    }

    const { error } = await supabase
      .from('exam_years')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting exam year ${id}`, error);
      throw error;
    }
  };

  // Query hooks
  const useAllExamYears = () => {
    return useQuery({
      queryKey: ['exam_years', examTypeId],
      queryFn: fetchExamYears,
      enabled: !!user && canView
    });
  };

  const useExamYearWithSubjects = (id: string) => {
    return useQuery({
      queryKey: ['exam_years', id, 'with_subjects'],
      queryFn: () => fetchExamYearWithSubjects(id),
      enabled: !!id && !!user && canView
    });
  };

  // Mutation hooks
  const useCreateExamYear = () => {
    return useMutation({
      mutationFn: createExamYear,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['exam_years'] });
        queryClient.invalidateQueries({ queryKey: ['exam_types', data.exam_type_id] });
        toast({
          title: "Exam Year created",
          description: "The exam year has been created successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to create exam year",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useUpdateExamYear = () => {
    return useMutation({
      mutationFn: updateExamYear,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['exam_years'] });
        queryClient.invalidateQueries({ queryKey: ['exam_years', data.id] });
        queryClient.invalidateQueries({ queryKey: ['exam_types', data.exam_type_id] });
        toast({
          title: "Exam Year updated",
          description: "The exam year has been updated successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to update exam year",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useDeleteExamYear = () => {
    return useMutation({
      mutationFn: deleteExamYear,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['exam_years'] });
        if (examTypeId) {
          queryClient.invalidateQueries({ queryKey: ['exam_types', examTypeId] });
        }
        toast({
          title: "Exam Year deleted",
          description: "The exam year has been deleted."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to delete exam year",
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
    useAllExamYears,
    useExamYearWithSubjects,
    
    // Mutations
    useCreateExamYear,
    useUpdateExamYear,
    useDeleteExamYear
  };
};
