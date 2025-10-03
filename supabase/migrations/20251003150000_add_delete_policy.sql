-- Add policy to allow anyone to delete their own translation history
-- Since we don't have user authentication in this app, we'll allow deletion of any record
-- In a production app with user authentication, this would be more restrictive

CREATE POLICY "Anyone can delete translation history"
ON public.translation_history
FOR DELETE
USING (true);