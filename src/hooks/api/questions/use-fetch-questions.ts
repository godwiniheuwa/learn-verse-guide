
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

    return data as Question[] || [];
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

    return data as Question;
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
