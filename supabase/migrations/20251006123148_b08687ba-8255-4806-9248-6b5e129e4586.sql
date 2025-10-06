-- Create grammar_checker_history table
CREATE TABLE IF NOT EXISTS public.grammar_checker_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_text TEXT NOT NULL,
  checked_text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL,
  suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.grammar_checker_history ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Grant permissions
GRANT ALL ON TABLE public.grammar_checker_history TO anon;
GRANT ALL ON TABLE public.grammar_checker_history TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_created_at ON public.grammar_checker_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_language ON public.grammar_checker_history(language);