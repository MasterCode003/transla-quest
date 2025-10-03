import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [translationToDelete, setTranslationToDelete] = useState<Translation | null>(null);

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
      toast.error("Failed to load translation history");
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
        (payload) => {
          // Optimistically add the new item to the top of the list
          const newTranslation = payload.new as Translation;
          setHistory(prev => [newTranslation, ...prev.filter(item => item.id !== newTranslation.id)]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "translation_history",
        },
        (payload) => {
          // Immediately remove the deleted item from the list
          const deletedId = payload.old.id;
          setHistory(prev => prev.filter(item => item.id !== deletedId));
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

  const handleDeleteClick = (translation: Translation) => {
    setTranslationToDelete(translation);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!translationToDelete) return;

    try {
      // Optimistically update the UI
      setHistory(prev => prev.filter(item => item.id !== translationToDelete.id));
      setDeleteDialogOpen(false);
      setTranslationToDelete(null);

      const { error } = await supabase
        .from("translation_history")
        .delete()
        .eq("id", translationToDelete.id);

      if (error) throw error;

      toast.success("Translation deleted successfully");
    } catch (error) {
      // Revert the optimistic update if there was an error
      loadHistory();
      console.error("Error deleting translation:", error);
      toast.error("Failed to delete translation");
    }
  };

  return (
    <>
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
                  className="p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors relative pr-10"
                >
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete translation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the translation record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};