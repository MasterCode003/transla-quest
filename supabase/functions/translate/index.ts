import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hardcoded ChatGPT API key provided by the user
const CHATGPT_API_KEY = "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";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage, service = 'lovable' } = await req.json();
    
    console.log('Translation request:', { text, sourceLanguage, targetLanguage, service });

    let translatedText = '';

    if (service === 'lovable') {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only return the translated text, nothing else.

Text to translate: ${text}`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a professional translator. Translate text accurately while preserving the original meaning and tone." },
              { role: "user", content: prompt }
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI gateway error:", response.status, errorText);
          
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Handle network connectivity issues
          if (response.status === 502 || response.status === 503 || response.status === 504) {
            return new Response(
              JSON.stringify({ error: "Service temporarily unavailable. Please try again later or use ChatGPT service." }),
              { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          throw new Error(`AI gateway error: ${response.status}`);
        }

        const data = await response.json();
        translatedText = data.choices[0].message.content.trim();
      } catch (fetchError) {
        // Handle network errors specifically
        console.error("Network error when connecting to Lovable AI:", fetchError);
        return new Response(
          JSON.stringify({ error: "Unable to connect to Lovable AI service. Please check your internet connection or use ChatGPT service." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (service === 'openai') {
      // Use the hardcoded ChatGPT API key
      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only return the translated text, nothing else.

Text to translate: ${text}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CHATGPT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a professional translator. Translate text accurately while preserving the original meaning and tone." },
            { role: "user", content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ChatGPT API error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        throw new Error(`ChatGPT API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      translatedText = data.choices[0].message.content.trim();
    } else {
      // For other services, we'll return a placeholder since we're focusing on ChatGPT and Lovable AI
      translatedText = `Translated with ${getServiceName(service)}: ${text} (${sourceLanguage} → ${targetLanguage})`;
    }

    console.log('Translation successful:', translatedText);

    return new Response(
      JSON.stringify({ translatedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Translation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getServiceName(serviceId: string) {
  const serviceMap: Record<string, string> = {
    "lovable": "Lovable AI",
    "openai": "ChatGPT"
  };
  return serviceMap[serviceId] || serviceId;
}
