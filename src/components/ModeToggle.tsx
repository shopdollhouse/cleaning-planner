import { Eye, Sparkles, Circle, Leaf } from 'lucide-react';
import type { UiMode } from '@/hooks/useAppState';
import { toast } from 'sonner';

interface ModeToggleProps {
  mode: UiMode;
  onChange: (mode: UiMode) => void;
}

const MODES: { id: UiMode; label: string; icon: typeof Eye; color: string; description: string }[] = [
  { id: 'standard', label: 'Standard', icon: Circle, color: 'hsl(210 50% 75%)', description: 'Balanced view' },
  { id: 'focus', label: 'Focus', icon: Eye, color: 'hsl(165 40% 75%)', description: 'Dim distractions, one task at a time' },
  { id: 'dopamine', label: 'Dopamine', icon: Sparkles, color: 'hsl(350 45% 75%)', description: 'Maximum sparkle and reward feedback' },
  { id: 'rest', label: 'Rest', icon: Leaf, color: 'hsl(160 60% 75%)', description: 'Gentle mode for low-energy days' },
];

const ModeToggle = ({ mode, onChange }: ModeToggleProps) => {
  const handleSelect = (next: UiMode) => {
    if (next === mode) return;
    onChange(next);
    const meta = MODES.find((m) => m.id === next);
    if (meta) toast(`${meta.label} mode`, { description: meta.description });
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/70" role="radiogroup" aria-label="UI Mode">
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            role="radio"
            aria-checked={active}
            onClick={() => handleSelect(m.id)}
            title={`${m.label} — ${m.description}`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-sans transition-all ${
              active ? 'bg-background shadow-sm' : 'hover:bg-background/50 text-muted-foreground'
            }`}
            style={active ? { color: m.color } : undefined}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeToggle;
