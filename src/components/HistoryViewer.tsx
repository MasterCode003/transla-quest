import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Loader2, 
  Trash2, 
  Languages, 
  Clock, 
  Search,
  Filter,
  Calendar,
  X,
  SpellCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
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

interface TranslationHistory {
  id: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: string;
  type: "translation";
}

interface GrammarCheckHistory {
  id: string;
  original_text: string;
  checked_text: string;
  language: string;
  created_at: string;
  type: "grammar";
}

type HistoryItem = TranslationHistory | GrammarCheckHistory;

export const HistoryViewer = ({ onClose }: { onClose: () => void }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<HistoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "translation" | "grammar">("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      
      // Load translation history
      const { data: translations, error: translationError } = await supabase
        .from("translation_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (translationError) {
        console.error("Error loading translation history:", translationError);
        toast.error("Failed to load translation history");
      }

      // Load grammar check history
      const { data: grammarChecks, error: grammarError } = await supabase
        .from("grammar_checker_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (grammarError) {
        console.error("Error loading grammar check history:", grammarError);
        toast.error("Failed to load grammar check history");
      }

      // Combine and tag history items
      const combinedHistory: HistoryItem[] = [
        ...(translations || []).map(item => ({ ...item, type: "translation" as const })),
        ...(grammarChecks || []).map(item => ({ ...item, type: "grammar" as const }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setHistory(combinedHistory);
      setFilteredHistory(combinedHistory);
    } catch (error: any) {
      console.error("Error loading history:", error);
      toast.error("Failed to load history: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    // Subscribe to realtime updates for both tables
    const translationChannel = supabase
      .channel("translation_history_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "translation_history",
        },
        (payload) => {
          const newItem = { ...payload.new, type: "translation" as const } as TranslationHistory;
          setHistory(prev => [newItem, ...prev]);
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
          const deletedId = payload.old.id;
          setHistory(prev => prev.filter(item => !(item.type === "translation" && item.id === deletedId)));
        }
      )
      .subscribe();

    const grammarChannel = supabase
      .channel("grammar_history_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "grammar_checker_history",
        },
        (payload) => {
          const newItem = { ...payload.new, type: "grammar" as const } as GrammarCheckHistory;
          setHistory(prev => [newItem, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "grammar_checker_history",
        },
        (payload) => {
          const deletedId = payload.old.id;
          setHistory(prev => prev.filter(item => !(item.type === "grammar" && item.id === deletedId)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(translationChannel);
      supabase.removeChannel(grammarChannel);
    };
  }, []);

  // Apply filters whenever filters or search term change
  useEffect(() => {
    let result = [...history];
    
    // Apply type filter
    if (filterType !== "all") {
      result = result.filter(item => item.type === filterType);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => {
        if (item.type === "translation") {
          return (
            item.source_text.toLowerCase().includes(term) ||
            item.translated_text.toLowerCase().includes(term) ||
            item.source_language.toLowerCase().includes(term) ||
            item.target_language.toLowerCase().includes(term)
          );
        } else {
          return (
            item.original_text.toLowerCase().includes(term) ||
            item.checked_text.toLowerCase().includes(term) ||
            item.language.toLowerCase().includes(term)
          );
        }
      });
    }
    
    // Apply date filter
    if (filterDate) {
      result = result.filter(item => 
        format(parseISO(item.created_at), "yyyy-MM-dd") === filterDate
      );
    }
    
    setFilteredHistory(result);
  }, [history, searchTerm, filterType, filterDate]);

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

  const handleDeleteClick = (item: HistoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      let error;
      
      if (itemToDelete.type === "translation") {
        const { error: deleteError } = await supabase
          .from("translation_history")
          .delete()
          .eq("id", itemToDelete.id);
        error = deleteError;
      } else {
        const { error: deleteError } = await supabase
          .from("grammar_checker_history")
          .delete()
          .eq("id", itemToDelete.id);
        error = deleteError;
      }

      if (error) throw error;

      toast.success("History item deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting history item:", error);
      toast.error("Failed to delete history item");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterDate("");
  };

  return (
    <>
      <Card className="bg-card border-border shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            History Viewer
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Search and Filters */}
          <div className="p-4 border-b space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filters</h4>
                      <p className="text-sm text-muted-foreground">
                        Filter history by type, date, or keyword
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor="type">Type</label>
                        <Select value={filterType} onValueChange={(value: "all" | "translation" | "grammar") => setFilterType(value)}>
                          <SelectTrigger id="type" className="col-span-2">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="translation">Translation</SelectItem>
                            <SelectItem value="grammar">Grammar Check</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor="date">Date</label>
                        <div className="col-span-2 relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="date"
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      disabled={!searchTerm && filterType === "all" && !filterDate}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Active Filters */}
            {(searchTerm || filterType !== "all" || filterDate) && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    <Search className="h-3 w-3" />
                    <span>{searchTerm}</span>
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filterType !== "all" && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    <span className="capitalize">{filterType}</span>
                    <button 
                      onClick={() => setFilterType("all")}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filterDate && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>{format(parseISO(filterDate), "MMM d, yyyy")}</span>
                    <button 
                      onClick={() => setFilterDate("")}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {history.length === 0 
                    ? "No history yet." 
                    : "No history matches your filters."}
                </p>
                {history.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors relative pr-10"
                  >
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="absolute top-3 right-3 p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete history item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {item.type === "translation" ? (
                          <Languages className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <SpellCheck className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {item.type === "translation" 
                            ? `${getLanguageName(item.source_language)} → ${getLanguageName(item.target_language)}` 
                            : getLanguageName(item.language)}
                        </span>
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {item.type === "translation" ? "Translation" : "Grammar Check"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(parseISO(item.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {item.type === "translation" ? (
                        <>
                          <div className="bg-background p-3 rounded border">
                            <p className="line-clamp-2">
                              {item.source_text}
                            </p>
                          </div>
                          <div className="bg-background p-3 rounded border">
                            <p className="line-clamp-2">
                              {item.translated_text}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-background p-3 rounded border">
                            <p className="line-clamp-2">
                              {item.original_text}
                            </p>
                          </div>
                          <div className="bg-background p-3 rounded border">
                            <p className="line-clamp-3">
                              {item.checked_text}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the history record.
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