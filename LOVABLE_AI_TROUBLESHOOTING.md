# Troubleshooting Lovable AI Service Connection Issues

If you're experiencing issues connecting to https://ai.gateway.lovable.dev, here are several troubleshooting steps and alternatives:

## Common Issues and Solutions

### 1. Network Connectivity Problems
- Check your internet connection
- Try accessing https://ai.gateway.lovable.dev directly in your browser
- If you're behind a corporate firewall, ensure the domain is not blocked

### 2. Service Availability
- The Lovable AI service may be temporarily down
- Check https://status.lovable.dev for any reported outages
- The service might be experiencing high demand

### 3. API Key Configuration
- Ensure you have a valid LOVABLE_API_KEY configured in your Supabase project
- Check that the key has not expired or been revoked

## Fallback Solutions

### Use ChatGPT as Alternative
The application automatically falls back to ChatGPT when Lovable AI is unavailable:
1. Select "ChatGPT" from the service dropdown in the translator
2. The translation will use your configured ChatGPT API key

### Configure LOVABLE_API_KEY (If you have access)
If you have a Lovable AI API key:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API > Edge Functions
3. Add a new secret with the name "LOVABLE_API_KEY" and your API key as the value
4. Redeploy the translate function

## Testing Service Availability

You can test if the service is accessible with this command:
```bash
curl -I https://ai.gateway.lovable.dev/v1/chat/completions
```

If this returns a 401 or 403 error, the service is accessible but requires authentication.
If it returns a different error or times out, there may be connectivity issues.

## Contact Support
If issues persist:
1. Contact Lovable AI support at support@lovable.dev
2. Check the Lovable AI documentation for any service changes
3. Consider using ChatGPT as your primary translation service