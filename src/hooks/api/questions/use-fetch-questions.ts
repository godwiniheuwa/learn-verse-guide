
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/exam';

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
    return (data || []).map(item => ({
      id: item.id,
      subject_id: item.subject_id,
      text: item.question_text,
      type: item.type,
      options: item.options,
      correct_answer: item.correct_answer,
      media_urls: item.media_urls,
      difficulty: item.difficulty,
      tags: item.tags,
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
