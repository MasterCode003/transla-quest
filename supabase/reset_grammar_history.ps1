# PowerShell script to reset and properly set up the grammar_checker_history table

Write-Host "Resetting grammar_checker_history table..."

# Apply the fix migration
npx supabase migration up

Write-Host "Grammar_checker_history table reset complete!"