# Fix for Grammar Checker History Issue

## Problem
The grammar checker history feature is not working due to a 404 error when trying to access the `grammar_checker_history` table in Supabase:
```
{code: "PGRST205", details: null, hint: "Perhaps you meant the table 'public.translation_history'", message: "Could not find the table 'public.grammar_checker_history' in the schema cache"}
```

## Root Cause
The `grammar_checker_history` table has not been created in the database, or the database schema cache is outdated.

## Solution
We've created migration files that ensure the table is properly set up with all necessary permissions, but they need to be applied to your database.

## Steps to Fix

### For Local Development (with Docker)

1. Make sure Docker Desktop is installed and running:
   - Download from: https://docs.docker.com/desktop
   - Start Docker Desktop application

2. Start the Supabase local development stack:
   ```bash
   npx supabase start
   ```

3. Apply the migrations:
   ```bash
   npx supabase migration up
   ```

4. Restart your development server:
   ```bash
   npm run dev
   ```

### For Remote Supabase Projects

1. Link your project (replace YOUR_PROJECT_ID with your actual project ID):
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_ID
   ```

2. Apply the migrations:
   ```bash
   npx supabase migration up
   ```

3. Redeploy edge functions:
   ```bash
   npx supabase functions deploy
   ```

## What the Fix Does

1. Creates the `grammar_checker_history` table if it doesn't exist:
   - `id`: UUID primary key with random generation
   - `original_text`: TEXT, the original text before checking
   - `checked_text`: TEXT, the corrected text after checking
   - `language`: VARCHAR(10), the language code (en, fil, hil)
   - `suggestions`: JSONB, optional suggestions data
   - `created_at`: TIMESTAMP WITH TIME ZONE, creation timestamp

2. Ensures Row Level Security (RLS) is properly configured

3. Sets up the necessary policies for insert, select, and delete operations:
   - Anyone can insert grammar checker history
   - Anyone can view all grammar checker history
   - Anyone can delete grammar checker history

4. Grants appropriate permissions to anon and authenticated users

5. Creates indexes for better query performance:
   - Index on `created_at` for sorting
   - Index on `language` for filtering

## Changes Made

- Added migration file: `supabase/migrations/20251006190000_add_grammar_checker_history_table.sql`
- Added fix migration file: `supabase/migrations/20251006200000_fix_grammar_checker_history_table.sql`
- Improved error handling in the frontend components
- Updated the clear history function to use proper Supabase syntax
- Created PowerShell script for Windows users: `supabase/reset_grammar_history.ps1`

## If the Problem Persists

### Check Database Directly
1. Go to your Supabase project dashboard
2. Navigate to Table Editor
3. Verify that the `grammar_checker_history` table exists
4. If it doesn't exist, you can create it manually using this SQL:

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_created_at ON public.grammar_checker_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grammar_checker_history_language ON public.grammar_checker_history(language);
```

### Verify Environment Configuration
1. Check that your Supabase project is properly configured
2. Verify that your environment variables are correctly set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Make sure you've run all migrations
4. Check the Supabase dashboard to verify the table exists

### Reset and Retry
If you're working locally:
```bash
npx supabase db reset
npx supabase migration up
```

### Contact Support
If issues persist:
1. Check Supabase status: https://status.supabase.com
2. Review Supabase documentation: https://supabase.com/docs
3. Join Supabase Discord for community support: https://discord.supabase.com