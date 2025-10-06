# Fix for Database Table Issues

## Problem
The application is showing a 404 error when trying to access the `grammar_checker_history` table:
```
Could not find the table 'public.grammar_checker_history' in the schema cache
```

## Root Cause
The `grammar_checker_history` table hasn't been created in the database, or the database schema cache hasn't been updated to include the new table.

## Solution
Apply the database migrations to create the missing table and set up the necessary permissions.

## Steps to Fix

### For Local Development

1. Apply the migrations:
   ```bash
   npx supabase migration up
   ```

2. If that doesn't work, reset your local database:
   ```bash
   npx supabase db reset
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### For Production (Vercel)

1. Make sure all migration files are committed to your repository
2. Redeploy your application to Vercel
3. If the issue persists, you may need to manually run the migrations on your Supabase project

## What the Fix Does

The migration files create and configure the `grammar_checker_history` table with:
- Proper table structure with all required columns
- Row Level Security (RLS) policies for insert, select, and delete operations
- Necessary permissions for both anonymous and authenticated users
- Indexes for better query performance

## Migration Files

1. `supabase/migrations/20251006190000_add_grammar_checker_history_table.sql` - Initial table creation
2. `supabase/migrations/20251006200000_fix_grammar_checker_history_table.sql` - Enhanced table setup with proper permissions

## Verification

After applying the fix:
1. The 404 error should no longer appear
2. Grammar checks should be saved to history
3. Grammar history should display properly

## If the Problem Persists

1. Check that your Supabase project is properly configured
2. Verify that your environment variables are correctly set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Check the Supabase dashboard to verify the table exists in your database
4. Make sure you've run all migrations
5. Try clearing your browser cache and refreshing the page

## PowerShell Script

You can also run the provided PowerShell script to apply the migrations:
```powershell
.\supabase\reset_grammar_history.ps1
```