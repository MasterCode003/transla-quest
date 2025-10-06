import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, SpellCheck, Clock, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type GrammarCheckHistory = Tables<"grammar_checker_history">;

export const GrammarCheckerHistory = () => {
  const [history, setHistory] = useState<GrammarCheckHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
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
        toast.error("Failed to load grammar check history: " + error.message);
        // If it's a 404 error, the table might not exist
        if (error.message.includes("404") || error.message.includes("not found")) {
          toast.error("Grammar checker history table not found. Please run database migrations.");
        }
        throw error;
      }
      setHistory(data || []);
    } catch (error: any) {
      console.error("Error fetching grammar check history:", error);
      toast.error("Failed to load grammar check history: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      // Delete all records from the grammar_checker_history table
      const { error } = await supabase
        .from("grammar_checker_history")
        .delete()
        .gte("created_at", new Date(0).toISOString());

      if (error) throw error;
      
      setHistory([]);
      toast.success("Grammar check history cleared");
    } catch (error) {
      console.error("Error clearing grammar check history:", error);
      toast.error("Failed to clear grammar check history");
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
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <SpellCheck className="h-5 w-5 text-primary" />
          Grammar Check History
        </CardTitle>
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="h-8 px-2 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Clear history</span>
          </Button>
        )}
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
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
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
  );
};