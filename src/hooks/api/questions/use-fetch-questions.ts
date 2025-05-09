
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

  // Safely convert tags
  const tags = item.tags || null;

  return {
    id: item.id,
    subject_id: item.subject_id || null,
    exam_id: item.exam_id || null,
    text: item.question_text,
    type: item.type || 'MCQ',
    options: options,
    correct_answer: item.correct_answer,
    // Removed media_urls mapping
    difficulty: item.difficulty || 'medium',
    tags: tags,
    points: item.points || 1,
    created_at: item.created_at,
    updated_at: item.updated_at,
    created_by: item.created_by
  };
};

// Define fetch functions outside of the hook to avoid recursive type issues
const fetchAllQuestions = async (subjectId?: string, canView: boolean = true): Promise<Question[]> => {
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

const fetchQuestion = async (id: string, canView: boolean = true): Promise<Question | null> => {
  if (!canView || !id) {
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

// The main hook that provides question fetching capabilities
export const useFetchQuestions = (subjectId?: string, canView: boolean = true) => {
  // Hook to fetch all questions
  const useAllQuestions = () => {
    return useQuery({
      queryKey: ['questions', subjectId],
      queryFn: () => fetchAllQuestions(subjectId, canView),
      enabled: canView
    });
  };

  // Hook to fetch a single question
  const useQuestion = (id: string) => {
    return useQuery({
      queryKey: ['questions', id],
      queryFn: () => fetchQuestion(id, canView),
      enabled: !!id && canView
    });
  };
  
  // Return hooks
  return {
    useAllQuestions,
    useQuestion
  };
};
