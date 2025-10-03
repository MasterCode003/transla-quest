-- Fix security issues with translation_history table
-- Add user_id column to track ownership
ALTER TABLE public.translation_history 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Remove old insecure policies
DROP POLICY IF EXISTS "Anyone can insert translation history" ON public.translation_history;
DROP POLICY IF EXISTS "Anyone can view translation history" ON public.translation_history;

-- Create secure policies for authenticated users only
CREATE POLICY "Users can insert their own translation history"
ON public.translation_history
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can view their own translation history"
ON public.translation_history
FOR SELECT
USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own translation history"
ON public.translation_history
FOR DELETE
USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_translation_history_user_id ON public.translation_history(user_id);