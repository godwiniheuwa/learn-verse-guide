
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/exam';
import { QuestionDBRecord } from './types';

export const useFetchQuestions = (subjectId?: string, canView: boolean = true) => {
  const fetchQuestions = async (): Promise<Question[]> => {
    if (!canView) {
      return [];
    }

    let query = supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching questions', error);
      throw error;
    }

    // Map database response to our frontend model
    return (data || []).map((item: QuestionDBRecord) => ({
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
    } as Question));
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

    const item = data as QuestionDBRecord;
    
    // Map database response to our frontend model
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
  
  const useAllQuestions = () => {
    return useQuery({
      queryKey: ['questions', subjectId],
      queryFn: fetchQuestions,
      enabled: canView
    });
  };

  const useQuestion = (id: string) => {
    return useQuery({
      queryKey: ['questions', id],
      queryFn: () => fetchQuestion(id),
      enabled: !!id && canView
    });
  };

  return {
    useAllQuestions,
    useQuestion
  };
};
