
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/middleware/role-guard';
import { useToast } from '@/hooks/use-toast';
import { Subject, SubjectWithRelations } from '@/types/exam';

export type NewSubject = {
  exam_year_id: string;
  name: string;
};

export const useSubjects = (examYearId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const canView = hasPermission(user, 'exams', 'view');
  const canCreate = hasPermission(user, 'exams', 'create');
  const canUpdate = hasPermission(user, 'exams', 'update');
  const canDelete = hasPermission(user, 'exams', 'delete');

  const fetchSubjects = async (): Promise<Subject[]> => {
    if (!canView) {
      return [];
    }

    let query = supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (examYearId) {
      query = query.eq('exam_year_id', examYearId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subjects', error);
      throw error;
    }

    return data || [];
  };

  const fetchSubjectWithDetails = async (id: string): Promise<SubjectWithRelations | null> => {
    if (!canView) {
      return null;
    }

    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        exam_year:exam_years(*, exam_type:exam_types(*))
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching subject ${id}`, error);
      throw error;
    }

    return data;
  };

  const createSubject = async (subject: NewSubject): Promise<Subject> => {
    if (!canCreate) {
      throw new Error("You don't have permission to create subjects");
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();

    if (error) {
      console.error('Error creating subject', error);
      throw error;
    }

    return data;
  };

  const updateSubject = async ({ id, ...updates }: Partial<Subject> & { id: string }): Promise<Subject> => {
    if (!canUpdate) {
      throw new Error("You don't have permission to update subjects");
    }

    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating subject ${id}`, error);
      throw error;
    }

    return data;
  };

  const deleteSubject = async (id: string): Promise<void> => {
    if (!canDelete) {
      throw new Error("You don't have permission to delete subjects");
    }

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting subject ${id}`, error);
      throw error;
    }
  };

  // Query hooks
  const useAllSubjects = () => {
    return useQuery({
      queryKey: ['subjects', examYearId],
      queryFn: fetchSubjects,
      enabled: !!user && canView
    });
  };

  const useSubjectWithDetails = (id: string) => {
    return useQuery({
      queryKey: ['subjects', id, 'with_details'],
      queryFn: () => fetchSubjectWithDetails(id),
      enabled: !!id && !!user && canView
    });
  };

  // Mutation hooks
  const useCreateSubject = () => {
    return useMutation({
      mutationFn: createSubject,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
        queryClient.invalidateQueries({ queryKey: ['exam_years', data.exam_year_id] });
        toast({
          title: "Subject created",
          description: "The subject has been created successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to create subject",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useUpdateSubject = () => {
    return useMutation({
      mutationFn: updateSubject,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
        queryClient.invalidateQueries({ queryKey: ['subjects', data.id] });
        queryClient.invalidateQueries({ queryKey: ['exam_years', data.exam_year_id] });
        toast({
          title: "Subject updated",
          description: "The subject has been updated successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to update subject",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useDeleteSubject = () => {
    return useMutation({
      mutationFn: deleteSubject,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
        if (examYearId) {
          queryClient.invalidateQueries({ queryKey: ['exam_years', examYearId] });
        }
        toast({
          title: "Subject deleted",
          description: "The subject has been deleted."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to delete subject",
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
    useAllSubjects,
    useSubjectWithDetails,
    
    // Mutations
    useCreateSubject,
    useUpdateSubject,
    useDeleteSubject
  };
};
