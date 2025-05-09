
export interface ExamType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamYear {
  id: string;
  exam_type_id: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  exam_year_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ExamTypeWithRelations extends ExamType {
  years?: ExamYear[];
}

export interface ExamYearWithRelations extends ExamYear {
  exam_type?: ExamType;
  subjects?: Subject[];
}

export interface SubjectWithRelations extends Subject {
  exam_year?: ExamYear;
}

export type QuestionType = 'MCQ' | 'theory';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  subject_id: string | null;
  text: string;
  type: QuestionType;
  options: string[] | null;
  correct_answer: string | string[] | null;
  media_urls: string[] | null;
  difficulty: QuestionDifficulty;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface QuestionWithRelations extends Question {
  subject?: Subject;
}
