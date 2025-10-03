import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: string;
}

export const TranslationHistory = () => {
  const [history, setHistory] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("translation_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("translation_history_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "translation_history",
        },
        () => {
          loadHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getLanguageName = (code: string) => {
    const languageMap: Record<string, string> = {
      en: "English",
      zh: "Chinese",
      tl: "Filipino",
      de: "German",
      sv: "Swedish",
      es: "Spanish",
      fr: "French",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
      hi: "Hindi",
      bn: "Bengali",
      nl: "Dutch",
      pl: "Polish",
      tr: "Turkish",
      vi: "Vietnamese",
      th: "Thai",
    };
    return languageMap[code] || code;
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-card shadow-[var(--shadow-medium)] border-border">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Translation History</h2>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No translation history yet
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="font-medium text-primary">
                    {getLanguageName(item.source_language)}
                  </span>
                  <span>→</span>
                  <span className="font-medium text-accent">
                    {getLanguageName(item.target_language)}
                  </span>
                  <span className="ml-auto text-xs">
                    {format(new Date(item.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">Source: </span>
                    {item.source_text}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Translation: </span>
                    {item.translated_text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
