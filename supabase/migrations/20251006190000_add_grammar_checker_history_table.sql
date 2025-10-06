-- Create grammar_checker_history table to store all grammar checks
CREATE TABLE public.grammar_checker_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_text TEXT NOT NULL,
  checked_text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL,
  suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.grammar_checker_history ENABLE ROW LEVEL SECURITY;

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

-- Create index for faster queries
CREATE INDEX idx_grammar_checker_history_created_at ON public.grammar_checker_history(created_at DESC);
CREATE INDEX idx_grammar_checker_history_language ON public.grammar_checker_history(language);