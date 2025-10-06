# Gemini API Integration

## Overview
This document explains how to integrate the Gemini API into the TranslaQuest application for both translation and grammar checking functionalities.

## Features
- Added Gemini as a third AI service option alongside Lovable AI and ChatGPT
- Secure storage of Gemini API keys in the database
- Support for both translation and grammar checking modes
- Proper error handling for API key validation and rate limiting

## Implementation Details

### Backend (Supabase Function)
The translate function has been updated to support the Gemini API:

1. **New Service Option**: Added "gemini" as a service option
2. **API Endpoint**: Uses the Gemini API endpoint `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
3. **Authentication**: Passes the API key as a query parameter
4. **Request Format**: Uses the correct Gemini API request structure
5. **Response Handling**: Parses the Gemini API response format
6. **Error Handling**: Added specific error handling for common Gemini API errors

### Frontend (React Component)
The Translator component has been updated with:

1. **Service Selection**: Added "Gemini" to the AI service dropdown
2. **API Key Input**: Added a secure input field for the Gemini API key when Gemini is selected
3. **Key Storage**: Implements saving and loading of the API key from the database
4. **Validation**: Validates that an API key is entered before processing requests
5. **User Feedback**: Provides appropriate error messages for API key issues

## Usage

### Setting up Gemini API
1. Obtain a Gemini API key from Google AI Studio
2. In the application, select "Gemini" from the AI Service dropdown
3. Enter your API key in the provided field
4. Click "Save" to store the key securely in the database
5. The key will be automatically loaded on future visits

### Using Gemini for Translation
1. Select "Translate" mode
2. Choose source and target languages
3. Enter text to translate
4. Select "Gemini" as the AI service
5. Click "Translate"
6. View results in the output panel

### Using Gemini for Grammar Checking
1. Select "Grammar Check" mode
2. Choose the language of the text
3. Enter text to check
4. Select "Gemini" as the AI service
5. Click "Check Grammar"
6. View corrections and suggestions in the output panel

## Security
- API keys are stored encrypted in the database
- Keys are only accessible to the user who saved them
- Keys are transmitted securely over HTTPS
- Keys are never logged or exposed in error messages

## Error Handling
The implementation handles several common error scenarios:
- Invalid API key (401)
- Rate limiting (429)
- Network connectivity issues
- API service unavailable (503)

## Future Enhancements
- Add support for different Gemini models
- Implement API key rotation
- Add usage tracking and limits
- Provide a key management interface