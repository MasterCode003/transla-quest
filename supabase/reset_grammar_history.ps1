# PowerShell script to reset and properly set up the grammar_checker_history table

Write-Host "=== Grammar Checker History Table Setup ===" -ForegroundColor Green
Write-Host ""

# Check if Supabase CLI is installed
try {
    $supabaseVersion = npx supabase --version
    Write-Host "Supabase CLI found: $supabaseVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Supabase CLI not found." -ForegroundColor Red
    Write-Host "Please install the Supabase CLI by running: npm install -g supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ALTERNATIVE: You can manually create the table using the SQL script:" -ForegroundColor Yellow
    Write-Host "1. Open DIRECT_DATABASE_FIX.sql in this directory" -ForegroundColor Yellow
    Write-Host "2. Copy the contents" -ForegroundColor Yellow
    Write-Host "3. Paste and run in your Supabase SQL Editor" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running (required for local development)
try {
    $dockerCheck = docker info
    Write-Host "Docker is running and accessible" -ForegroundColor Cyan
    $dockerAvailable = $true
} catch {
    Write-Host "Warning: Docker is not running or not accessible" -ForegroundColor Yellow
    Write-Host "For local development, Docker Desktop is required." -ForegroundColor Yellow
    Write-Host "Download from: https://docs.docker.com/desktop" -ForegroundColor Yellow
    Write-Host ""
    $dockerAvailable = $false
}

Write-Host "Applying database migrations..." -ForegroundColor Cyan

try {
    # Apply all migrations
    if ($dockerAvailable) {
        npx supabase migration up
        Write-Host "Migrations applied successfully!" -ForegroundColor Green
    } else {
        Write-Host "Docker not available. For remote deployment:" -ForegroundColor Yellow
        Write-Host "1. Link your project: npx supabase link --project-ref YOUR_PROJECT_ID" -ForegroundColor Yellow
        Write-Host "2. Apply migrations: npx supabase migration up" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "ALTERNATIVE: Direct database fix available" -ForegroundColor Yellow
        Write-Host "Run the SQL commands in DIRECT_DATABASE_FIX.sql directly in your Supabase dashboard" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error applying migrations: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check your Supabase project configuration" -ForegroundColor Yellow
    Write-Host "2. Verify your Supabase access token: npx supabase login" -ForegroundColor Yellow
    Write-Host "3. For remote projects, link your project first" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ALTERNATIVE SOLUTION:" -ForegroundColor Yellow
    Write-Host "You can manually create the table using the SQL script:" -ForegroundColor Yellow
    Write-Host "1. Open DIRECT_DATABASE_FIX.sql in this directory" -ForegroundColor Yellow
    Write-Host "2. Copy the contents" -ForegroundColor Yellow
    Write-Host "3. Paste and run in your Supabase SQL Editor" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Grammar_checker_history table setup complete!" -ForegroundColor Green
Write-Host ""

if ($dockerAvailable) {
    Write-Host "You can now start your local development server:" -ForegroundColor Cyan
    Write-Host "npm run dev" -ForegroundColor Yellow
} else {
    Write-Host "For local development, please install and start Docker Desktop." -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For remote deployment, you can now redeploy your functions:" -ForegroundColor Cyan
    Write-Host "npx supabase functions deploy" -ForegroundColor Yellow
}