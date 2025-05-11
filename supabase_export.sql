
-- ExamPrep Platform Database Export
-- Generated on: 2025-05-11

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'examiner', 'admin');

-- Create exam status enum
CREATE TYPE public.exam_status AS ENUM ('draft', 'published', 'closed');

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student'::public.user_role,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  phone TEXT,
  date_of_birth DATE,
  location TEXT,
  address TEXT,
  avatar_url TEXT
);

-- Create activation_tokens table
CREATE TABLE IF NOT EXISTS public.activation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_types table
CREATE TABLE IF NOT EXISTS public.exam_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_years table
CREATE TABLE IF NOT EXISTS public.exam_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type_id UUID NOT NULL REFERENCES public.exam_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_year_id UUID NOT NULL REFERENCES public.exam_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status public.exam_status NOT NULL DEFAULT 'draft'::public.exam_status,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  type TEXT,
  options JSONB,
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  media_urls JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT,
  tags TEXT[],
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for faster token lookups
CREATE INDEX IF NOT EXISTS activation_tokens_token_idx ON public.activation_tokens (token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON public.password_reset_tokens (token);

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS exam_years_exam_type_id_idx ON public.exam_years (exam_type_id);
CREATE INDEX IF NOT EXISTS subjects_exam_year_id_idx ON public.subjects (exam_year_id);
CREATE INDEX IF NOT EXISTS questions_subject_id_idx ON public.questions (subject_id);
CREATE INDEX IF NOT EXISTS questions_exam_id_idx ON public.questions (exam_id);
CREATE INDEX IF NOT EXISTS questions_created_by_idx ON public.questions (created_by);
CREATE INDEX IF NOT EXISTS exams_created_by_idx ON public.exams (created_by);

-- Add auto-update function for updated_at
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_modtime
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_exam_types_modtime
BEFORE UPDATE ON public.exam_types
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_exam_years_modtime
BEFORE UPDATE ON public.exam_years
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_subjects_modtime
BEFORE UPDATE ON public.subjects
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_exams_modtime
BEFORE UPDATE ON public.exams
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_questions_modtime
BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user profile creation
CREATE TRIGGER on_user_created
AFTER INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::TEXT FROM public.users WHERE id = user_id;
$$;

-- Sample data insertion (commented out for safety)
/*
-- Insert sample exam types
INSERT INTO public.exam_types (name, description)
VALUES 
  ('WAEC', 'West African Examinations Council'),
  ('JAMB', 'Joint Admissions and Matriculation Board'),
  ('NECO', 'National Examinations Council');

-- Insert sample exam years
INSERT INTO public.exam_years (exam_type_id, year)
VALUES 
  ((SELECT id FROM public.exam_types WHERE name = 'WAEC'), 2023),
  ((SELECT id FROM public.exam_types WHERE name = 'WAEC'), 2022),
  ((SELECT id FROM public.exam_types WHERE name = 'JAMB'), 2023);

-- Insert sample subjects
INSERT INTO public.subjects (exam_year_id, name)
VALUES 
  ((SELECT id FROM public.exam_years WHERE year = 2023 AND exam_type_id = (SELECT id FROM public.exam_types WHERE name = 'WAEC')), 'Mathematics'),
  ((SELECT id FROM public.exam_years WHERE year = 2023 AND exam_type_id = (SELECT id FROM public.exam_types WHERE name = 'WAEC')), 'English'),
  ((SELECT id FROM public.exam_years WHERE year = 2023 AND exam_type_id = (SELECT id FROM public.exam_types WHERE name = 'JAMB')), 'Physics');
*/

-- Note: For actual data export, uncomment the sample data section and replace with your actual data
-- or use the proper export tool from your database management system.

-- End of export
