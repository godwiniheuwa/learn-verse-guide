
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Question } from '@/types/exam';
import { UpdateQuestionData } from './types';

export const useUpdateQuestion = (canUpdate: boolean = true) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updateQuestion = async (questionData: UpdateQuestionData): Promise<Question> => {
    if (!canUpdate) {
      throw new Error("You don't have permission to update questions");
    }

    const { id, ...updates } = questionData;
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

    return data as Question;
  };

  return useMutation({
    mutationFn: updateQuestion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions', data.subject_id] });
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
