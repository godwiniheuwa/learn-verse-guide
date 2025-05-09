
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Question } from '@/types/exam';
import { NewQuestion } from './types';

export const useCreateQuestion = (canCreate: boolean = true) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createQuestion = async (question: NewQuestion & { created_by: string }): Promise<Question> => {
    if (!canCreate) {
      throw new Error("You don't have permission to create questions");
    }

    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single();

    if (error) {
      console.error('Error creating question', error);
      throw error;
    }

    return data as Question;
  };

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions', data.subject_id] });
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
