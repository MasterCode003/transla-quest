import { Languages } from "lucide-react";
import { Translator } from "@/components/Translator";
import { TranslationHistory } from "@/components/TranslationHistory";

const Index = () => {
  return (
    <div className="min-h-screen bg-[image:var(--gradient-secondary)]">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[image:var(--gradient-primary)]">
              <Languages className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Multi-Language Translator</h1>
              <p className="text-sm text-muted-foreground">
                Translate text across 20+ languages instantly
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
          <div className="flex flex-col gap-6">
            <Translator />
          </div>
          <div className="lg:sticky lg:top-8 self-start">
            <TranslationHistory />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 bg-card/50">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Powered by Lovable AI • Supports 20+ Languages
        </div>
      </footer>
    </div>
  );
};

export default Index;
