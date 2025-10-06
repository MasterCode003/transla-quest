import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Loader2, Trash2, Languages, Clock } from "lucide-react";
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
      fil: "Filipino",
      hil: "Visayan",
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
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Translation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No translation history yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your translations will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors relative pr-10"
                  >
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="absolute top-3 right-3 p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete translation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {getLanguageName(item.source_language)} → {getLanguageName(item.target_language)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(item.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="bg-background p-2 rounded border">
                        <p className="line-clamp-2">
                          {item.source_text}
                        </p>
                      </div>
                      <div className="bg-background p-2 rounded border">
                        <p className="line-clamp-2">
                          {item.translated_text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
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