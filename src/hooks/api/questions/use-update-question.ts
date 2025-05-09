
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Question } from '@/types/exam';
import { UpdateQuestionData, QuestionDBRecord } from './types';

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
    if (updates.text !== undefined) dbUpdates.question_text = updates.text;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.options !== undefined) dbUpdates.options = updates.options;
    if (updates.correct_answer !== undefined) {
      dbUpdates.correct_answer = Array.isArray(updates.correct_answer) 
        ? JSON.stringify(updates.correct_answer) 
        : updates.correct_answer;
    }
    if (updates.media_urls !== undefined) dbUpdates.media_urls = updates.media_urls;
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.subject_id !== undefined) dbUpdates.subject_id = updates.subject_id;
    if (updates.points !== undefined) dbUpdates.points = updates.points;

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
    const item = data as QuestionDBRecord;
    return {
      id: item.id,
      subject_id: item.subject_id || null,
      text: item.question_text,
      type: item.type || 'MCQ', // Provide default if missing
      options: Array.isArray(item.options) ? item.options : null,
      correct_answer: item.correct_answer,
      media_urls: item.media_urls || null,
      difficulty: item.difficulty || 'medium', // Provide default if missing
      tags: item.tags || null,
      created_at: item.created_at,
      updated_at: item.updated_at,
      created_by: item.created_by
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
