
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/exam';
import { QuestionDBRecord } from './types';

// Helper function to convert DB record to frontend model
const mapDbRecordToQuestion = (item: QuestionDBRecord): Question => {
  // Safely convert options from Json to string[]
  const options = item.options ? 
    (Array.isArray(item.options) ? 
      item.options.map(opt => String(opt)) : null) : 
    null;

  // Safely convert media_urls
  const mediaUrls = item.media_urls || null;

  // Safely convert tags
  const tags = item.tags || null;

  return {
    id: item.id,
    subject_id: item.subject_id || null,
    text: item.question_text,
    type: item.type || 'MCQ', // Provide default if missing
    options: options,
    correct_answer: item.correct_answer,
    media_urls: mediaUrls,
    difficulty: item.difficulty || 'medium', // Provide default if missing
    tags: tags,
    created_at: item.created_at,
    updated_at: item.updated_at,
    created_by: item.created_by
  };
};

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
    return (data || []).map(item => mapDbRecordToQuestion(item as QuestionDBRecord));
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
    return mapDbRecordToQuestion(data as QuestionDBRecord);
  };
  
  // Return separate hooks to avoid infinite recursion
  return {
    useAllQuestions: () => useQuery({
      queryKey: ['questions', subjectId],
      queryFn: fetchQuestions,
      enabled: canView
    }),
    useQuestion: (id: string) => useQuery({
      queryKey: ['questions', id],
      queryFn: () => fetchQuestion(id),
      enabled: !!id && canView
    })
  };
};
