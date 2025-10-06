# PowerShell script to reset and properly set up the grammar_checker_history table

Write-Host "Applying database migrations..."

# Apply the fix migration
npx supabase migration up

Write-Host "Grammar_checker_history table setup complete!"

Write-Host "If you're running this locally, you might need to reset your database:"
Write-Host "npx supabase db reset"