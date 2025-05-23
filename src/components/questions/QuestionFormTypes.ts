
import { z } from "zod";
import { QuestionDifficulty, QuestionType } from "@/types/exam";

// Form schema
export const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["MCQ", "theory"]),
  subject_id: z.string().nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  options: z.array(z.object({ value: z.string() })),
  correct_answer: z.union([z.string(), z.array(z.string())]).optional(),
  tags: z.array(z.object({ value: z.string() })),
  points: z.number().optional(),
});

export type FormValues = {
  text: string;
  type: QuestionType;
  subject_id: string | null;
  difficulty: QuestionDifficulty;
  options: { value: string }[];
  correct_answer?: string | string[];
  tags: { value: string }[];
  points?: number;
};

export interface QuestionFormData {
  id?: string;
  text: string;
  type: QuestionType;
  subject_id: string | null;
  difficulty: QuestionDifficulty;
  options?: string[]; // Changed to string[] to match the API expectations
  correct_answer?: string | string[];
  tags?: string[]; // Changed to string[] to match the API expectations
  points?: number;
}
