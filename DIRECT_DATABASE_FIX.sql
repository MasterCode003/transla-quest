-- DIRECT DATABASE FIX FOR GRAMMAR CHECKER HISTORY TABLE
-- Run these commands directly in your Supabase SQL Editor

-- 1. Create the grammar_checker_history table
CREATE TABLE IF NOT EXISTS public.grammar_checker_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_text TEXT NOT NULL,
  checked_text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL,
  suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.grammar_checker_history ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can insert grammar checker history" ON public.grammar_checker_history;
DROP POLICY IF EXISTS "Anyone can view grammar checker history" ON public.grammar_checker_history;
DROP POLICY IF EXISTS "Anyone can delete grammar checker history" ON public.grammar_checker_history;

-- 4. Create policies for all operations
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

-- 5. Grant permissions
GRANT ALL ON TABLE public.grammar_checker_history TO anon;
GRANT ALL ON TABLE public.grammar_checker_history TO authenticated;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_created_at 
ON public.grammar_checker_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_language 
ON public.grammar_checker_history(language);

-- 7. Refresh the schema cache (this happens automatically in Supabase)
-- You may need to refresh the schema cache manually in the Supabase dashboard
-- Go to Table Editor -> Click the refresh button

-- Verification query - run this to verify the table was created correctly
-- SELECT * FROM public.grammar_checker_history LIMIT 5;