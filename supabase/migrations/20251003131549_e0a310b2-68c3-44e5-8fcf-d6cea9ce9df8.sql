-- Create translation_history table to store all translations
CREATE TABLE public.translation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.translation_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert translation history
CREATE POLICY "Anyone can insert translation history"
ON public.translation_history
FOR INSERT
WITH CHECK (true);

-- Create policy to allow anyone to view all translation history
CREATE POLICY "Anyone can view translation history"
ON public.translation_history
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_translation_history_created_at ON public.translation_history(created_at DESC);