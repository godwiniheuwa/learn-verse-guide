
import { z } from "zod";
import { QuestionDifficulty, QuestionType } from "@/types/exam";

// Form schema
export const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["MCQ", "theory"]),
  subject_id: z.string().nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  options: z.array(z.string()).optional(),
  correct_answer: z.union([z.string(), z.array(z.string())]).optional(),
  tags: z.array(z.string()).optional(),
  points: z.number().optional(),
});

export type FormValues = z.infer<typeof questionSchema>;

export interface QuestionFormData {
  id?: string;
  text: string;
  type: QuestionType;
  subject_id: string | null;
  difficulty: QuestionDifficulty;
  options?: string[];
  correct_answer?: string | string[];
  tags?: string[];
  points?: number;
}
