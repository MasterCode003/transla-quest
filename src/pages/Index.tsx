import { Languages, SpellCheck } from "lucide-react";
import { Translator } from "@/components/Translator";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const location = useLocation();
  const isGrammarMode = location.pathname.includes('/grammar');

  return (
    <div className="min-h-screen bg-[image:var(--gradient-secondary)] dark:bg-[image:var(--gradient-secondary)]">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[image:var(--gradient-primary)]">
                {isGrammarMode ? (
                  <SpellCheck className="h-6 w-6 text-primary-foreground" />
                ) : (
                  <Languages className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isGrammarMode ? "Grammar Checker" : "Multi-Language Translator"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isGrammarMode 
                    ? "Check grammar for English, Filipino, and Visayan texts" 
                    : "Translate text across languages instantly"}
                </p>
              </div>
            </div>
            {/* Removed Translate and Grammar Check buttons as requested */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <Translator />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 bg-card/50">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by Qoder • Supports English, Filipino, and Visayan languages</p>
          <p className="mt-1">AI-powered translation and grammar checking</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;