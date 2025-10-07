import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, Loader2, SpellCheck, Languages, Copy, Check, History } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNavigate, useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { HistoryViewer } from "./HistoryViewer";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Translator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine mode from URL path
  const getModeFromPath = () => {
    if (location.pathname.includes('/grammar')) return 'grammar';
    return 'translate';
  };

  const [mode, setMode] = useState<'translate' | 'grammar'>(getModeFromPath());
  const [sourceText, setSourceText] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("fil");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedService, setSelectedService] = useState("lovable");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Update URL when mode changes
  useEffect(() => {
    if (mode === 'grammar') {
      navigate('/grammar');
    } else {
      navigate('/translate');
    }
  }, [mode, navigate]);

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    const tempText = sourceText;
    setSourceText(processedText);
    setProcessedText(tempText);
  };

  const handleClear = () => {
    setSourceText("");
    setProcessedText("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(processedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const saveTranslationToHistory = async (source: string, translated: string, sourceLang: string, targetLang: string) => {
    try {
      const { error: insertError } = await supabase
        .from("translation_history")
        .insert({
          source_text: source,
          translated_text: translated,
          source_language: sourceLang,
          target_language: targetLang,
        });

      if (insertError) {
        console.error("Error saving to translation history:", insertError);
        toast.error("Failed to save translation to history: " + insertError.message);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error saving to translation history:", error);
      toast.error("Failed to save translation to history: " + (error.message || "Unknown error"));
      return false;
    }
  };

  const saveGrammarCheckToHistory = async (original: string, checked: string, language: string) => {
    try {
      const { error: insertError } = await supabase
        .from("grammar_checker_history")
        .insert({
          original_text: original,
          checked_text: checked,
          language: language,
          // We could parse suggestions from the AI response if needed
          suggestions: null,
        });

      if (insertError) {
        console.error("Error saving to grammar check history:", insertError);
        // Provide specific error message for table not found
        if (insertError.message.includes("grammar_checker_history") && insertError.message.includes("not found")) {
          toast.error("Grammar checker history table not found. Please contact the administrator to set up the database.");
        } else {
          toast.error("Failed to save grammar check to history: " + insertError.message);
        }
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error saving to grammar check history:", error);
      toast.error("Failed to save grammar check to history: " + (error.message || "Unknown error"));
      return false;
    }
  };

  const getTranslationPrompt = (text: string, sourceLang: string, targetLang: string) => {
    return `You are a professional translator specializing in English, Filipino, and Visayan languages. Translate the following text from ${getLanguageName(sourceLang)} to ${getLanguageName(targetLang)}. Preserve the original meaning, tone, and cultural context. Only return the translated text, nothing else.

Text to translate: ${text}`;
  };

  const getGrammarCheckPrompt = (text: string, language: string) => {
    return `You are a prompt engineer for a grammar checker AI specializing in English, Visayan, and Filipino. Analyze the input text and provide grammar corrections and suggestions. Identify grammatical errors, suggest improvements, and explain any corrections made. Format your response clearly with corrections marked and explanations provided.

Text to check: ${text}`;
  };

  const getLanguageName = (code: string) => {
    const languageMap: Record<string, string> = {
      "en": "English",
      "fil": "Filipino",
      "hil": "Visayan"
    };
    return languageMap[code] || code;
  };

  const handleProcess = async () => {
    if (!sourceText.trim()) {
      toast.error(`Please enter text to ${mode === 'translate' ? 'translate' : 'check'}`);
      return;
    }

    if (mode === 'translate' && sourceLanguage === targetLanguage) {
      toast.error("Source and target languages must be different");
      return;
    }

    setIsProcessing(true);
    try {
      if (mode === 'translate') {
        // Translation mode
        const prompt = getTranslationPrompt(sourceText, sourceLanguage, targetLanguage);
        
        const { data, error } = await supabase.functions.invoke("translate", {
          body: {
            text: sourceText,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            service: selectedService,
            prompt: prompt,
            mode: "translate"
          },
        });

        if (error) throw error;

        if (data.error) {
          toast.error(data.error);
          return;
        }

        setProcessedText(data.translatedText);

        // Save to translation history with retry mechanism
        const saveSuccess = await saveTranslationToHistory(
          sourceText,
          data.translatedText,
          sourceLanguage,
          targetLanguage
        );

        if (saveSuccess) {
          toast.success("Translation completed and saved to history!");
        } else {
          // Try to save again as a backup
          setTimeout(async () => {
            const retrySuccess = await saveTranslationToHistory(
              sourceText,
              data.translatedText,
              sourceLanguage,
              targetLanguage
            );
            if (!retrySuccess) {
              toast.warning("Translation completed but failed to save to history. Please check your connection.");
            }
          }, 2000);
        }
      } else {
        // Grammar check mode
        const prompt = getGrammarCheckPrompt(sourceText, sourceLanguage);
        
        const { data, error } = await supabase.functions.invoke("translate", {
          body: {
            text: sourceText,
            sourceLanguage: sourceLanguage,
            targetLanguage: sourceLanguage, // Not used in grammar mode
            service: selectedService,
            prompt: prompt,
            mode: "grammar"
          },
        });

        if (error) throw error;

        if (data.error) {
          toast.error(data.error);
          return;
        }

        const resultText = data.translatedText || "No grammar issues found.";
        setProcessedText(resultText);
        
        // Save to grammar check history
        const saveSuccess = await saveGrammarCheckToHistory(
          sourceText,
          resultText,
          sourceLanguage
        );

        if (saveSuccess) {
          toast.success("Grammar check completed and saved to history!");
        } else {
          toast.warning("Grammar check completed but failed to save to history. Please check your connection.");
        }
      }
    } catch (error: any) {
      console.error("Processing error:", error);
      // Handle specific error cases
      if (error.message && error.message.includes("API key")) {
        toast.error("Invalid API key. Please check your API key settings.");
      } else if (error.message && error.message.includes("401")) {
        toast.error("Authentication failed. Please verify your API key.");
      } else if (error.message && error.message.includes("429")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else {
        toast.error(`${mode === 'translate' ? 'Translation' : 'Grammar check'} failed. Please try again.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-5xl mx-auto bg-card shadow-lg border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {mode === 'translate' ? (
              <>
                <Languages className="h-6 w-6 text-primary" />
                Multi-Language Translator
              </>
            ) : (
              <>
                <SpellCheck className="h-6 w-6 text-primary" />
                Grammar Checker
              </>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'translate' 
              ? "Translate between English, Filipino, and Visayan languages" 
              : "Check grammar for English, Filipino, and Visayan texts"}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex justify-center">
            <ToggleGroup 
              type="single" 
              value={mode} 
              onValueChange={(value) => value && setMode(value as 'translate' | 'grammar')}
              className="gap-2 p-1 bg-muted rounded-lg"
            >
              <ToggleGroupItem 
                value="translate" 
                aria-label="Translate mode"
                className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <Languages className="h-4 w-4" />
                Translate
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="grammar" 
                aria-label="Grammar check mode"
                className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <SpellCheck className="h-4 w-4" />
                Grammar Check
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Source Language */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {mode === 'translate' ? 'Source Language' : 'Language'}
                </Label>
                <LanguageSelector
                  value={sourceLanguage}
                  onChange={setSourceLanguage}
                />
              </div>
              <Textarea
                placeholder={mode === 'translate' ? "Enter text to translate..." : "Enter text to check grammar..."}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[200px] resize-none bg-background border-border focus:border-primary transition-colors"
              />
            </div>

            {/* Target Language / Output */}
            <div className="space-y-3">
              {mode === 'translate' ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Target Language</Label>
                    <LanguageSelector
                      value={targetLanguage}
                      onChange={setTargetLanguage}
                    />
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="Translation will appear here..."
                      value={processedText}
                      readOnly
                      className="min-h-[200px] resize-none bg-muted border-border pr-20" // Added padding to the right
                    />
                    {processedText && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 h-8 px-3"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Grammar Check Results</Label>
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="Grammar corrections will appear here..."
                      value={processedText}
                      readOnly
                      className="min-h-[200px] resize-none bg-muted border-border pr-20" // Added padding to the right
                    />
                    {processedText && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 h-8 px-3"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">AI Service</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select AI service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lovable">Lovable AI</SelectItem>
                <SelectItem value="openai">ChatGPT</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="flex-1 min-w-[150px] bg-[image:var(--gradient-primary)] hover:opacity-90 transition-opacity text-primary-foreground"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'translate' ? 'Translating...' : 'Checking...'}
                </>
              ) : (
                mode === 'translate' ? 'Translate' : 'Check Grammar'
              )}
            </Button>
            {mode === 'translate' && (
              <Button
                variant="outline"
                onClick={handleSwapLanguages}
                className="border-border hover:bg-secondary"
                disabled={isProcessing}
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="sr-only">Swap languages</span>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleClear}
              className="border-border hover:bg-secondary"
              disabled={isProcessing}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowHistory(true)}
              className="border-border hover:bg-secondary"
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <HistoryViewer onClose={() => setShowHistory(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};