
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UpdateQuestionData, QuestionDBUpdate } from './types';

// Helper function to convert frontend model to DB model for update
const mapUpdateToDbRecord = (question: UpdateQuestionData): QuestionDBUpdate => {
  const dbUpdate: QuestionDBUpdate = { id: question.id };

  if (question.text !== undefined) dbUpdate.question_text = question.text;
  if (question.subject_id !== undefined) dbUpdate.subject_id = question.subject_id;
  if (question.exam_id !== undefined) dbUpdate.exam_id = question.exam_id;
  if (question.type !== undefined) dbUpdate.type = question.type;
  if (question.options !== undefined) dbUpdate.options = question.options;
  if (question.correct_answer !== undefined) {
    dbUpdate.correct_answer = Array.isArray(question.correct_answer) 
      ? JSON.stringify(question.correct_answer) 
      : question.correct_answer;
  }
  if (question.points !== undefined) dbUpdate.points = question.points;
  if (question.media_urls !== undefined) dbUpdate.media_urls = question.media_urls;
  if (question.difficulty !== undefined) dbUpdate.difficulty = question.difficulty;
  if (question.tags !== undefined) dbUpdate.tags = question.tags;

  return dbUpdate;
};

export const useUpdateQuestion = (canUpdate: boolean = true) => {
  const queryClient = useQueryClient();

  const updateQuestion = async (question: UpdateQuestionData) => {
    if (!canUpdate) {
      throw new Error("You don't have permission to update questions");
    }

    const dbUpdate = mapUpdateToDbRecord(question);
    const { id, ...updateData } = dbUpdate;

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      throw error;
    }

    return {
      id: data.id,
      subject_id: data.subject_id || null,
      text: data.question_text,
      type: data.type || 'MCQ',
      options: Array.isArray(data.options) ? data.options : null,
      correct_answer: data.correct_answer,
      media_urls: data.media_urls || null,
      difficulty: data.difficulty || 'medium',
      tags: data.tags || null,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by
    };
  };

  return useMutation({
    mutationFn: updateQuestion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions', data.id] });
    }
  });
};
