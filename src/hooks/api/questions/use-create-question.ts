
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

    // Map our frontend model to database schema
    const dbQuestion = {
      subject_id: question.subject_id,
      question_text: question.text,
      type: question.type,
      options: question.options || null,
      correct_answer: question.correct_answer || null,
      media_urls: question.media_urls || null,
      difficulty: question.difficulty,
      tags: question.tags || null,
      created_by: question.created_by
    };

    const { data, error } = await supabase
      .from('questions')
      .insert(dbQuestion)
      .select()
      .single();

    if (error) {
      console.error('Error creating question', error);
      throw error;
    }

    // Map database response back to our frontend model
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
