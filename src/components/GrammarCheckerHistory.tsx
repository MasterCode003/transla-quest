import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, SpellCheck, Clock, Languages, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type GrammarCheckHistory = Tables<"grammar_checker_history">;

export const GrammarCheckerHistory = () => {
  const [history, setHistory] = useState<GrammarCheckHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('grammar-history-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grammar_checker_history'
        },
        () => {
          // Refresh history when new entry is added
          fetchHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("grammar_checker_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching grammar check history:", error);
        // Handle different types of errors
        if (error.code === "PGRST205" || (error.message.includes("grammar_checker_history") && error.message.includes("not found"))) {
          toast.error("Grammar checker history table not found", {
            description: "The database table is missing. Please contact the administrator or check the documentation at FIX_GRAMMAR_HISTORY.md",
            duration: 10000
          });
        } else {
          toast.error("Failed to load grammar check history", {
            description: error.message,
            duration: 5000
          });
        }
        // Set history to empty array so the component still renders
        setHistory([]);
        return;
      }
      setHistory(data || []);
    } catch (error: any) {
      console.error("Error fetching grammar check history:", error);
      toast.error("Failed to load grammar check history", {
        description: error.message || "Unknown error occurred",
        duration: 5000
      });
      // Set history to empty array so the component still renders
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("grammar_checker_history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setHistory((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item deleted");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item", {
        description: error.message || "Please try again later",
        duration: 5000
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
    }
  };

  const getLanguageName = (code: string) => {
    const languageMap: Record<string, string> = {
      "en": "English",
      "fil": "Filipino",
      "hil": "Visayan"
    };
    return languageMap[code] || code;
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <SpellCheck className="h-5 w-5 text-primary" />
            Grammar Check History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <SpellCheck className="h-5 w-5 text-primary" />
            Grammar Check History
          </CardTitle>
        </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <SpellCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No grammar check history yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your grammar checks will appear here.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                        {getLanguageName(item.language)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item.id)}
                        className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm font-medium mb-2 line-clamp-2">
                    {item.original_text}
                  </p>
                  <div className="text-xs text-muted-foreground bg-background p-2 rounded border">
                    <p className="line-clamp-3">
                      {item.checked_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>

    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete History Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this grammar check history item? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDeleteDialogOpen(false);
              setItemToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};