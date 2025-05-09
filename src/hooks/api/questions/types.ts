
import { Question, QuestionType, QuestionDifficulty } from '@/types/exam';
import { Json } from '@/integrations/supabase/types';

export type NewQuestion = {
  subject_id?: string | null;
  exam_id?: string | null;
  text: string; // This maps to question_text in DB
  type: QuestionType;
  options?: string[] | null;
  correct_answer?: string | string[] | null;
  // Removed media_urls property
  difficulty: QuestionDifficulty;
  tags?: string[] | null;
  points?: number | null;
};

export type UpdateQuestionData = Partial<NewQuestion> & { id: string };

// This type represents the DB structure for mapping
export type QuestionDBRecord = {
  id: string;
  exam_id: string | null;
  subject_id: string | null;
  question_text: string;
  type: QuestionType;
  options: Json | null;
  correct_answer: string | null;
  points: number | null;
  media_urls: Json | null; // Keep this for DB mapping
  difficulty: QuestionDifficulty;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string;
};

// Helper type for frontend to DB model conversion
export type QuestionDBInsert = {
  question_text: string;
  exam_id?: string | null;
  subject_id?: string | null;
  type: QuestionType;
  options?: Json | null;
  correct_answer?: string | null;
  points?: number | null;
  // media_urls?: Json | null; - Commented out
  difficulty: QuestionDifficulty;
  tags?: string[] | null;
  created_by: string;
};

// Helper type for DB to frontend model conversion
export type QuestionDBUpdate = Partial<QuestionDBInsert> & { id: string };
