
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
