
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
    
    // Map our frontend model to database schema
    const dbUpdates: any = {};
    if (updates.text) dbUpdates.question_text = updates.text;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.options !== undefined) dbUpdates.options = updates.options;
    if (updates.correct_answer !== undefined) dbUpdates.correct_answer = updates.correct_answer;
    if (updates.media_urls !== undefined) dbUpdates.media_urls = updates.media_urls;
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.subject_id !== undefined) dbUpdates.subject_id = updates.subject_id;

    const { data, error } = await supabase
      .from('questions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating question ${id}`, error);
      throw error;
    }

    // Map database response to our frontend model
    return {
      id: data.id,
      subject_id: data.subject_id,
      text: data.question_text,
      type: data.type,
      options: data.options,
      correct_answer: data.correct_answer,
      media_urls: data.media_urls,
      difficulty: data.difficulty,
      tags: data.tags,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by
    } as Question;
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
