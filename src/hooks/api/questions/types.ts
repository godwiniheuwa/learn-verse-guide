
import { Question, QuestionType, QuestionDifficulty } from '@/types/exam';
import { Json } from '@/integrations/supabase/types';

export type NewQuestion = {
  subject_id?: string | null;
  exam_id?: string | null; // Added to match DB schema
  text: string; // This maps to question_text in DB
  type: QuestionType;
  options?: string[] | null;
  correct_answer?: string | string[] | null;
  media_urls?: string[] | null;
  difficulty: QuestionDifficulty;
  tags?: string[] | null;
  points?: number | null; // Added to match DB schema
};

export type UpdateQuestionData = Partial<NewQuestion> & { id: string };

// This type represents the DB structure for mapping
export type QuestionDBRecord = {
  id: string;
  exam_id: string | null;
  subject_id?: string | null; // Added to map our model to DB
  question_text: string;
  type?: QuestionType; // Added to map our model to DB
  options: Json | null;
  correct_answer: string | null;
  points: number | null;
  media_urls?: string[] | null; // Added to map our model to DB
  difficulty?: QuestionDifficulty; // Added to map our model to DB
  tags?: string[] | null; // Added to map our model to DB
  created_at: string;
  updated_at: string;
  created_by: string;
};

// Helper type for frontend to DB model conversion
export type QuestionDBInsert = {
  question_text: string;
  exam_id?: string | null;
  subject_id?: string | null;
  type?: QuestionType;
  options?: Json | null;
  correct_answer?: string | null;
  points?: number | null;
  media_urls?: string[] | null;
  difficulty?: QuestionDifficulty;
  tags?: string[] | null;
  created_by: string;
};

// Helper type for DB to frontend model conversion
export type QuestionDBUpdate = Partial<QuestionDBInsert> & { id: string };
