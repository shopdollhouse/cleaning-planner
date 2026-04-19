import { memo } from 'react';
import { Sparkles, Menu, Wind, Filter, Timer } from 'lucide-react';
import ModeToggle from '@/components/ModeToggle';
import BrainDumpButton from '@/components/BrainDumpButton';
import HowToDrawer from '@/components/HowToDrawer';
import type { UiMode, BrainDumpEntry } from '@/hooks/useAppState';

interface AppHeaderProps {
  userName: string;
  uiMode: UiMode;
  brainDump: BrainDumpEntry[];
  zenMode: boolean;
  visualNoiseFilter: boolean;
  timerActive?: boolean;
  timeRemaining?: number;
  onSetUiMode: (mode: UiMode) => void;
  onPickRandomDay: () => void;
  onAddBrainDump: (text: string) => void;
  onDeleteBrainDump: (id: string) => void;
  onClearBrainDump: () => void;
  onToggleSidebar: () => void;
  onToggleZen: () => void;
  onToggleVisualNoiseFilter: () => void;
  onToggleTimer?: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const AppHeader = memo(function AppHeader({
  userName, uiMode, brainDump, zenMode, visualNoiseFilter,
  timerActive = false, timeRemaining = 0,
  onSetUiMode, onPickRandomDay, onAddBrainDump, onDeleteBrainDump, onClearBrainDump, onToggleSidebar, onToggleZen, onToggleVisualNoiseFilter, onToggleTimer,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 h-[76px] gap-4 glass-nav" style={{
      backdropFilter: 'blur(20px)',
      border: '1px solid hsl(var(--border))',
    }}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-white/30 transition-colors" aria-label="Toggle navigation">
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        {/* Gentle Focus Badge */}
        <button
          onClick={onToggleTimer}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
          style={{
            background: timerActive
              ? 'linear-gradient(135deg, hsl(270 35% 70%), hsl(210 50% 70%))'
              : 'hsl(var(--card))',
            border: timerActive ? 'none' : `1px solid hsl(var(--border))`,
            boxShadow: timerActive ? '0 4px 12px hsl(270 35% 50% / 0.25)' : 'none',
            color: timerActive ? 'white' : 'hsl(var(--foreground))',
          }}
          title="Toggle timer"
        >
          <Timer className="w-3.5 h-3.5" />
          <span className="text-xs font-display font-semibold uppercase tracking-wide">
            {timerActive ? 'Gentle Timer' : 'Timer'}
          </span>
          {timerActive && (
            <span className="text-xs font-mono font-bold ml-1" style={{ color: 'white' }}>
              {formatTime(timeRemaining)}
            </span>
          )}
        </button>

        <div className="min-w-0 pl-2 flex-1">
          <div className="flex items-start gap-3 px-3 py-2 rounded-2xl" style={{
            background: 'rgba(200, 180, 210, 0.12)',
          }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-110" style={{ backgroundColor: 'hsl(270 35% 75%)', color: '#fff' }}>
              <Sparkles className="w-4 h-4" strokeWidth={2} style={{ color: 'white' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-sans font-bold leading-tight text-foreground">
                ADHD Cleaning Planner
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-sans font-semibold">The Dollhouse Brand Studio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleVisualNoiseFilter}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${
            visualNoiseFilter ? 'text-white shadow-lg' : 'text-muted-foreground hover:bg-white/20'
          }`}
          style={visualNoiseFilter ? { background: 'linear-gradient(135deg, hsl(270 35% 75%), hsl(210 50% 75%))', boxShadow: '0 4px 12px hsl(270 35% 50% / 0.3)' } : {}}
          title={visualNoiseFilter ? "Filter active - reduces visual noise" : "Visual Noise Filter - reduces visual noise for better focus"}
          aria-label="Toggle visual noise filter"
          aria-pressed={visualNoiseFilter}
        >
          <Filter className={`w-3.5 h-3.5 transition-transform ${visualNoiseFilter ? 'scale-110' : ''}`} />
          <span className="inline">Filter</span>
        </button>
        <button
          onClick={onToggleZen}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${
            zenMode ? 'text-white shadow-md' : 'text-muted-foreground hover:bg-white/20'
          }`}
          style={zenMode ? { background: 'linear-gradient(135deg, hsl(270 35% 70%), hsl(210 50% 70%))' } : undefined}
          title="Visual Breath — dim everything to focus"
          aria-label="Toggle visual breath mode"
          aria-pressed={zenMode}
        >
          <Wind className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dim</span>
        </button>
        <ModeToggle mode={uiMode} onChange={onSetUiMode} />
        <BrainDumpButton entries={brainDump} onAdd={onAddBrainDump} onDelete={onDeleteBrainDump} onClear={onClearBrainDump} />
        <HowToDrawer />
        <button onClick={onPickRandomDay}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-sans text-white hover:opacity-95 transition-opacity shadow-lg"
          style={{ background: 'linear-gradient(135deg, hsl(270 35% 75%), hsl(210 50% 75%))' }}
          title="Surprise me with a random day" aria-label="Pick random day">
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
});

export default AppHeader;
