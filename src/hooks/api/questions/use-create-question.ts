
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Question } from '@/types/exam';
import { NewQuestion, QuestionDBRecord } from './types';

export const useCreateQuestion = (canCreate: boolean = true) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createQuestion = async (question: NewQuestion & { created_by: string }): Promise<Question> => {
    if (!canCreate) {
      throw new Error("You don't have permission to create questions");
    }

    // Map our frontend model to database schema
    const dbQuestion = {
      subject_id: question.subject_id || null,
      exam_id: question.exam_id || null, // Use exam_id if provided, otherwise null
      question_text: question.text,
      type: question.type,
      options: question.options || null,
      correct_answer: Array.isArray(question.correct_answer) 
        ? JSON.stringify(question.correct_answer) 
        : question.correct_answer || null,
      media_urls: question.media_urls || null,
      difficulty: question.difficulty,
      tags: question.tags || null,
      points: question.points || 1, // Default to 1 point if not specified
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
    const record = data as QuestionDBRecord;
    return {
      id: record.id,
      subject_id: record.subject_id || null,
      text: record.question_text,
      type: record.type || 'MCQ', // Provide default if missing
      options: Array.isArray(record.options) ? record.options : null,
      correct_answer: record.correct_answer,
      media_urls: record.media_urls || null,
      difficulty: record.difficulty || 'medium', // Provide default if missing
      tags: record.tags || null,
      created_at: record.created_at,
      updated_at: record.updated_at,
      created_by: record.created_by
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
