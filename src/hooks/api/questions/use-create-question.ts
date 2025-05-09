
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewQuestion, QuestionDBInsert } from './types';
import { toast } from '@/hooks/use-toast';

// Helper function to convert frontend model to DB model
const mapQuestionToDbRecord = (question: NewQuestion & { created_by: string }): QuestionDBInsert => {
  return {
    question_text: question.text,
    exam_id: question.exam_id || null,
    subject_id: question.subject_id || null,
    type: question.type,
    options: question.options || null,
    correct_answer: Array.isArray(question.correct_answer) 
      ? JSON.stringify(question.correct_answer) 
      : question.correct_answer || null,
    points: question.points || 1,
    media_urls: question.media_urls || null,
    difficulty: question.difficulty,
    tags: question.tags || null,
    created_by: question.created_by
  };
};

export const useCreateQuestion = (canCreate: boolean = true) => {
  const queryClient = useQueryClient();

  const createQuestion = async (question: NewQuestion & { created_by: string }) => {
    if (!canCreate) {
      throw new Error("You don't have permission to create questions");
    }

    const dbQuestion = mapQuestionToDbRecord(question);

    // Pass dbQuestion directly to the insert function
    const { data, error } = await supabase
      .from('questions')
      .insert(dbQuestion)
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      throw error;
    }

    // Map the database response back to our frontend model
    return {
      id: data.id,
      subject_id: data.subject_id || null,
      exam_id: data.exam_id || null,
      text: data.question_text,
      type: data.type || 'MCQ',
      options: Array.isArray(data.options) ? data.options : null,
      correct_answer: data.correct_answer,
      media_urls: data.media_urls || null,
      difficulty: data.difficulty || 'medium',
      tags: data.tags || null,
      points: data.points || 1,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by
    };
  };

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: 'Question created',
        description: 'The question has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating question',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
