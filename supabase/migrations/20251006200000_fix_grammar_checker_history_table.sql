-- Fix grammar_checker_history table setup
-- This migration ensures the table is properly created with all necessary permissions

-- Create grammar_checker_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.grammar_checker_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_text TEXT NOT NULL,
  checked_text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL,
  suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security if not already enabled
ALTER TABLE public.grammar_checker_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert grammar checker history" ON public.grammar_checker_history;
DROP POLICY IF EXISTS "Anyone can view grammar checker history" ON public.grammar_checker_history;
DROP POLICY IF EXISTS "Anyone can delete grammar checker history" ON public.grammar_checker_history;

-- Create policy to allow anyone to insert grammar checker history
CREATE POLICY "Anyone can insert grammar checker history"
ON public.grammar_checker_history
FOR INSERT
WITH CHECK (true);

-- Create policy to allow anyone to view all grammar checker history
CREATE POLICY "Anyone can view grammar checker history"
ON public.grammar_checker_history
FOR SELECT
USING (true);

-- Create policy to allow anyone to delete grammar checker history
CREATE POLICY "Anyone can delete grammar checker history"
ON public.grammar_checker_history
FOR DELETE
USING (true);

-- Grant all permissions to anon and authenticated users
GRANT ALL ON TABLE public.grammar_checker_history TO anon;
GRANT ALL ON TABLE public.grammar_checker_history TO authenticated;

-- Create indexes for faster queries if they don't exist
CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_created_at ON public.grammar_checker_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_language ON public.grammar_checker_history(language);