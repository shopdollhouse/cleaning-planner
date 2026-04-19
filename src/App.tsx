import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import CleaningApp from "@/components/CleaningApp";
import ErrorBoundary from "@/components/ErrorBoundary";
import { type View } from "@/config/navigation";
import { useAppState } from "@/hooks/useAppState";

const queryClient = new QueryClient();

const VIEW_CSS: Record<View, Record<string, string>> = {
  'daily':      { '--background': '350 45% 97%',  '--card': '350 45% 99%',  '--primary': '350 45% 75%',  '--border': '350 45% 85%', '--ring': '350 45% 75%',  '--muted': '350 40% 94%', '--secondary': '350 40% 91%', '--secondary-foreground': '350 45% 32%', '--soft-pink': '350 45% 93%' },
  'deep-clean': { '--background': '165 40% 96%', '--card': '165 40% 99%', '--primary': '165 40% 75%', '--border': '165 40% 84%','--ring': '165 40% 75%', '--muted': '165 35% 93%','--secondary': '165 38% 89%','--secondary-foreground': '165 40% 28%','--soft-pink': '165 40% 93%' },
  'challenges': { '--background': '210 50% 97%', '--card': '210 50% 99%', '--primary': '210 50% 75%', '--border': '210 50% 87%','--ring': '210 50% 75%', '--muted': '210 45% 94%','--secondary': '210 45% 90%','--secondary-foreground': '210 50% 38%','--soft-pink': '210 45% 93%' },
  'specialty':  { '--background': '45 60% 97%', '--card': '45 60% 99%', '--primary': '45 60% 75%', '--border': '45 60% 85%','--ring': '45 60% 75%', '--muted': '45 55% 93%','--secondary': '45 55% 89%','--secondary-foreground': '45 60% 32%','--soft-pink': '45 55% 93%' },
  'family-hub': { '--background': '270 35% 97%', '--card': '270 35% 99%', '--primary': '270 35% 75%', '--border': '270 35% 84%','--ring': '270 35% 75%', '--muted': '270 30% 93%','--secondary': '270 30% 89%','--secondary-foreground': '270 35% 28%','--soft-pink': '270 30% 93%' },
  'notes':      { '--background': '340 35% 97%', '--card': '340 35% 99%', '--primary': '340 35% 75%', '--border': '340 35% 87%','--ring': '340 35% 75%', '--muted': '340 30% 94%','--secondary': '340 30% 90%','--secondary-foreground': '340 35% 38%','--soft-pink': '340 30% 93%' },
  'settings':   { '--background': '160 60% 97%', '--card': '160 60% 99%', '--primary': '160 60% 75%', '--border': '160 60% 86%','--ring': '160 60% 75%', '--muted': '160 55% 94%','--secondary': '160 55% 90%','--secondary-foreground': '160 60% 36%','--soft-pink': '160 55% 93%' },
};

const VIEW_BG: Record<View, string> = {
  'daily':      'linear-gradient(145deg, hsl(350 45% 98%) 0%, hsl(350 45% 95%) 100%)',
  'deep-clean': 'linear-gradient(145deg, hsl(165 40% 97%) 0%, hsl(165 40% 94%) 100%)',
  'challenges': 'linear-gradient(145deg, hsl(210 50% 97%) 0%, hsl(210 50% 94%) 100%)',
  'specialty':  'linear-gradient(145deg, hsl(45 60% 97%) 0%, hsl(45 60% 94%) 100%)',
  'family-hub': 'linear-gradient(145deg, hsl(270 35% 97%) 0%, hsl(270 35% 94%) 100%)',
  'notes':      'linear-gradient(145deg, hsl(340 35% 97%) 0%, hsl(340 35% 94%) 100%)',
  'settings':   'linear-gradient(145deg, hsl(160 60% 97%) 0%, hsl(160 60% 94%) 100%)',
};

function App() {
  const [activeView, setActiveView] = useState<View>('daily');
  useAppState();
  const cssVars = VIEW_CSS[activeView];

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div style={cssVars as React.CSSProperties}>
            <div
              style={{
                position: 'fixed', inset: 0, zIndex: 0,
                background: VIEW_BG[activeView],
                transition: 'background 0.5s ease',
              }}
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <CleaningApp activeView={activeView} onChangeView={setActiveView} />
            </div>
            <Toaster position="bottom-right" richColors theme="light" />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
