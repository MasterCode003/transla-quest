# Prompt Engineering Implementation

## Overview
This document explains the prompt engineering functionality implemented in the TranslaQuest application, which provides both translation and grammar checking capabilities for English, Filipino, and Visayan languages.

## Features

### 1. Dual Mode Functionality
- **Translation Mode**: Translates text between English, Filipino, and Visayan
- **Grammar Check Mode**: Analyzes text for grammatical errors and provides corrections

### 2. Role-Based AI Instructions
Each mode uses specific, role-based prompts tailored to the task:

#### Translation Mode Prompt
```
You are a professional translator specializing in English, Filipino, and Visayan languages. 
Translate the following text from [SOURCE_LANGUAGE] to [TARGET_LANGUAGE]. 
Preserve the original meaning, tone, and cultural context. 
Only return the translated text, nothing else.
```

#### Grammar Check Mode Prompt
```
You are a prompt engineer for a grammar checker AI specializing in English, Visayan, and Filipino. 
Analyze the input text and provide grammar corrections and suggestions. 
Identify grammatical errors, suggest improvements, and explain any corrections made. 
Format your response clearly with corrections marked and explanations provided.
```

## Implementation Details

### Frontend (React Component)
- Mode toggle using ToggleGroup UI component
- Dynamic UI that changes based on selected mode
- Route-based navigation (/translate or /grammar)
- Language selector with English, Filipino, and Visayan options

### Backend (Supabase Function)
- Receives mode and custom prompts from frontend
- Applies appropriate system prompts based on mode
- Routes requests to either Lovable AI or ChatGPT services
- Returns processed text to frontend for display

## Usage

### Translation Mode
1. Select "Translate" mode
2. Choose source and target languages
3. Enter text to translate
4. Select AI service (Lovable AI or ChatGPT)
5. Click "Translate" button
6. View translated text in the output panel

### Grammar Check Mode
1. Select "Grammar Check" mode
2. Choose the language of the text
3. Enter text to check
4. Select AI service (Lovable AI or ChatGPT)
5. Click "Check Grammar" button
6. View grammar corrections and suggestions in the output panel

## Prompt Customization
The system allows for custom prompts to be sent from the frontend, enabling flexible and context-aware AI interactions while maintaining consistent role-based instructions.