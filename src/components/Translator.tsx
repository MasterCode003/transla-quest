import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Translator = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }

    if (sourceLanguage === targetLanguage) {
      toast.error("Source and target languages must be different");
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: {
          text: sourceText,
          sourceLanguage,
          targetLanguage,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setTranslatedText(data.translatedText);

      // Save to history
      const { error: insertError } = await supabase
        .from("translation_history")
        .insert({
          source_text: sourceText,
          translated_text: data.translatedText,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        });

      if (insertError) {
        console.error("Error saving to history:", insertError);
      }

      toast.success("Translation completed!");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto p-6 bg-card shadow-[var(--shadow-medium)] border-border">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Source Language */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LanguageSelector
              value={sourceLanguage}
              onChange={setSourceLanguage}
            />
          </div>
          <Textarea
            placeholder="Enter text to translate..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="min-h-[200px] resize-none bg-background border-border focus:border-primary transition-colors"
          />
        </div>

        {/* Target Language */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LanguageSelector
              value={targetLanguage}
              onChange={setTargetLanguage}
            />
          </div>
          <Textarea
            placeholder="Translation will appear here..."
            value={translatedText}
            readOnly
            className="min-h-[200px] resize-none bg-muted border-border"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 flex-wrap">
        <Button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="flex-1 min-w-[200px] bg-[image:var(--gradient-primary)] hover:opacity-90 transition-opacity text-primary-foreground"
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : (
            "Translate"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleSwapLanguages}
          className="border-border hover:bg-secondary"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          className="border-border hover:bg-secondary"
        >
          Clear
        </Button>
      </div>
    </Card>
  );
};
