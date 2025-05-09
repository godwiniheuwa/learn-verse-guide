
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/middleware/role-guard';
import { useToast } from '@/hooks/use-toast';

export type Question = {
  id: string;
  exam_id: string;
  question_text: string;
  options: any | null;
  correct_answer: string | null;
  points: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type NewQuestion = {
  exam_id: string;
  question_text: string;
  options?: any;
  correct_answer?: string;
  points?: number;
};

export const useQuestions = (examId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const canView = hasPermission(user, 'questions', 'view');
  const canCreate = hasPermission(user, 'questions', 'create');
  const canUpdate = hasPermission(user, 'questions', 'update');
  const canDelete = hasPermission(user, 'questions', 'delete');

  const fetchQuestions = async (): Promise<Question[]> => {
    if (!canView || !examId) {
      return [];
    }

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', examId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching questions', error);
      throw error;
    }

    return data || [];
  };

  const fetchQuestion = async (id: string): Promise<Question | null> => {
    if (!canView) {
      return null;
    }

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching question ${id}`, error);
      throw error;
    }

    return data;
  };

  const createQuestion = async (question: NewQuestion): Promise<Question> => {
    if (!canCreate || !user) {
      throw new Error("You don't have permission to create questions");
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        ...question,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question', error);
      throw error;
    }

    return data;
  };

  const updateQuestion = async ({ id, ...updates }: Partial<Question> & { id: string }): Promise<Question> => {
    if (!canUpdate) {
      throw new Error("You don't have permission to update questions");
    }

    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating question ${id}`, error);
      throw error;
    }

    return data;
  };

  const deleteQuestion = async (id: string): Promise<void> => {
    if (!canDelete) {
      throw new Error("You don't have permission to delete questions");
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting question ${id}`, error);
      throw error;
    }
  };

  // Query hooks
  const useAllQuestions = () => {
    return useQuery({
      queryKey: ['questions', examId],
      queryFn: fetchQuestions,
      enabled: !!examId && !!user && canView
    });
  };

  const useQuestion = (id: string) => {
    return useQuery({
      queryKey: ['questions', id],
      queryFn: () => fetchQuestion(id),
      enabled: !!id && !!user && canView
    });
  };

  // Mutation hooks
  const useCreateQuestion = () => {
    return useMutation({
      mutationFn: createQuestion,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['questions', data.exam_id] });
        toast({
          title: "Question created",
          description: "Your question has been created successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to create question",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useUpdateQuestion = () => {
    return useMutation({
      mutationFn: updateQuestion,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['questions', data.exam_id] });
        queryClient.invalidateQueries({ queryKey: ['questions', data.id] });
        toast({
          title: "Question updated",
          description: "Your question has been updated successfully."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to update question",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const useDeleteQuestion = () => {
    return useMutation({
      mutationFn: deleteQuestion,
      onSuccess: () => {
        if (examId) {
          queryClient.invalidateQueries({ queryKey: ['questions', examId] });
        }
        toast({
          title: "Question deleted",
          description: "Your question has been deleted."
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Failed to delete question",
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
    useAllQuestions,
    useQuestion,
    
    // Mutations
    useCreateQuestion,
    useUpdateQuestion,
    useDeleteQuestion
  };
};
