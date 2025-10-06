# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0d8e277f-a813-405d-a387-072b11e78640

## New Features

### Enhanced Translation and Grammar Checking
This project now includes dual-mode functionality:
- **Translation Mode**: Translate between English, Filipino, and Visayan languages
- **Grammar Check Mode**: Analyze text for grammatical errors and receive corrections

### Separate History Tracking
- **Translation History**: Tracks all translation requests
- **Grammar Check History**: Tracks all grammar checking requests (NEW)
- Each mode has its own dedicated history panel

### Multiple AI Service Support
- **Lovable AI**: Default service through the Lovable gateway
- **ChatGPT**: OpenAI's GPT-3.5 Turbo model
- **Gemini**: Google's Gemini Pro model (API key required, contact administrator)

### Prompt Engineering
The application implements advanced prompt engineering with role-based AI instructions tailored to each user action. See [PROMPT_ENGINEERING.md](PROMPT_ENGINEERING.md) for details.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0d8e277f-a813-405d-a387-072b11e78640) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Troubleshooting Common Issues

### Grammar Checker History Table Missing
If you encounter the error "Could not find the table 'public.grammar_checker_history' in the schema cache", follow these steps:

1. Check the detailed guide in [FIX_GRAMMAR_HISTORY.md](FIX_GRAMMAR_HISTORY.md)
2. Run the PowerShell script: `supabase/reset_grammar_history.ps1`
3. Ensure Docker is running for local development
4. Apply migrations with: `npx supabase migration up`

### Lovable AI Service Connection Issues
If you're having trouble connecting to the Lovable AI service:
1. Check the troubleshooting guide in [LOVABLE_AI_TROUBLESHOOTING.md](LOVABLE_AI_TROUBLESHOOTING.md)
2. Try using ChatGPT as an alternative service

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0d8e277f-a813-405d-a387-072b11e78640) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

# How to Visit Your Supabase Project Database

Follow these step-by-step instructions to access and manage your connected Supabase project database:

1. Open your web browser and go to the Supabase website at https://supabase.com.

2. Click on the "Login" button at the top-right corner of the homepage.

3. Enter your registered email and password credentials associated with your Supabase account and sign in.

4. After signing in, you will see the Supabase Dashboard displaying your projects.

5. Select the project that is connected to your app by clicking on its project name.

6. Within the project dashboard, navigate to the "Database" section from the sidebar menu.

7. Here you can explore your database schema, tables, and data for your project.

8. To view or edit translation history records, find the relevant table (e.g., "translation_history") and click on it.

9. To view or edit grammar check history records, find the "grammar_checker_history" table and click on it.

10. To manage your API keys, find the "api_keys" table where administrators can configure service keys.

11. You may run SQL queries or browse table data directly via the Supabase web interface.

12. To manage database settings, click on "Settings" in the sidebar and explore connections, API keys, and other configurations.

13. When finished, you may log out securely from your dashboard.