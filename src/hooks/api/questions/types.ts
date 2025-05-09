
import { Question, QuestionType, QuestionDifficulty } from '@/types/exam';

export type NewQuestion = {
  subject_id?: string | null;
  text: string;
  type: QuestionType;
  options?: string[] | null;
  correct_answer?: string | string[] | null;
  media_urls?: string[] | null;
  difficulty: QuestionDifficulty;
  tags?: string[] | null;
};

export type UpdateQuestionData = Partial<NewQuestion> & { id: string };
