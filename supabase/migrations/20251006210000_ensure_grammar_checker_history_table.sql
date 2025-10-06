-- Ensure grammar_checker_history table exists with all necessary configurations
-- This migration is a comprehensive fix to ensure the table is properly created

-- First, check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS public.grammar_checker_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_text TEXT NOT NULL,
  checked_text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL,
  suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ensure the table has the correct columns with proper types
ALTER TABLE public.grammar_checker_history 
  ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS original_text TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS checked_text TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL,
  ADD COLUMN IF NOT EXISTS suggestions JSONB,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Enable Row Level Security (ensure it's enabled)
ALTER TABLE public.grammar_checker_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert grammar checker history" ON public.grammar_checker_history;
DROP POLICY IF EXISTS "Anyone can view grammar checker history" ON public.grammar_checker_history;
DROP POLICY IF EXISTS "Anyone can delete grammar checker history" ON public.grammar_checker_history;

-- Create fresh policies for all operations
CREATE POLICY "Anyone can insert grammar checker history"
ON public.grammar_checker_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view grammar checker history"
ON public.grammar_checker_history
FOR SELECT
USING (true);

CREATE POLICY "Anyone can delete grammar checker history"
ON public.grammar_checker_history
FOR DELETE
USING (true);

-- Grant all necessary permissions
GRANT ALL ON TABLE public.grammar_checker_history TO anon;
GRANT ALL ON TABLE public.grammar_checker_history TO authenticated;

-- Create indexes for better performance (IF NOT EXISTS to avoid errors)
CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_created_at ON public.grammar_checker_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_language ON public.grammar_checker_history(language);

-- Refresh the schema cache to ensure the table is recognized
-- Note: This is automatically handled by Supabase when the migration completes